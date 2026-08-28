import os
import re
import math
import time
import uuid
import hashlib
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd

class UniversalSchemaDiscovery:
    """
    Universal Schema Discovery for Genesis CareerFit 3.0.
    Dynamically inspects arbitrary CSV / XLSX / XLS workbooks, identifies candidate identities,
    discovers questions and direct domain scores, and produces clean normalized dataset runs.
    """

    STANDARD_DOMAINS = [
        "Psychometric / Behavioral SJT",
        "Analytical Thinking & Aptitude",
        "Technical / Programming (Python, SQL, DSA)",
        "Communication & Business Reasoning",
        "AIML / Data Intelligence",
        "Systems & Cloud Architecture",
        "Leadership & Management"
    ]

    @classmethod
    def discover_and_normalize(
        cls,
        file_path_or_buffer: Any,
        filename: str = "uploaded_dataset.xlsx",
        run_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses workbook, detects schema columns, normalizes candidate rows, and builds dataset summary.
        """
        # 1. Load data
        if isinstance(file_path_or_buffer, pd.DataFrame):
            df = file_path_or_buffer.copy()
            sheet_names = ["Sheet1"]
            sheet_count = 1
        elif str(filename).lower().endswith(('.xlsx', '.xls')):
            excel_file = pd.ExcelFile(file_path_or_buffer)
            sheet_names = excel_file.sheet_names
            # Use the first data sheet
            df = pd.read_excel(file_path_or_buffer, sheet_name=sheet_names[0])
            sheet_count = len(sheet_names)
        else:
            df = pd.read_csv(file_path_or_buffer)
            sheet_names = ["Sheet1"]
            sheet_count = 1

        # Strip whitespace from column headers
        df.columns = [str(c).strip() for c in df.columns]
        raw_columns = list(df.columns)
        candidate_count = len(df)

        # Compute file hash
        if isinstance(file_path_or_buffer, str) and os.path.exists(file_path_or_buffer):
            with open(file_path_or_buffer, "rb") as f:
                file_hash = hashlib.sha256(f.read()).hexdigest()
        else:
            file_hash = hashlib.sha256(str(raw_columns).encode('utf-8')).hexdigest()

        # 2. Classify Columns
        identity_mapping = cls._detect_identity_columns(raw_columns)
        academic_mapping = cls._detect_academic_columns(raw_columns)
        question_columns = cls._detect_question_columns(raw_columns)
        direct_domain_columns = cls._detect_domain_score_columns(raw_columns)
        timing_columns = cls._detect_timing_columns(raw_columns)

        # 3. Determine Measured & Unassessed Domains
        measured_domains = set()
        if question_columns:
            # Check if questions have prefix
            if any("psy" in c.lower() for c in question_columns):
                measured_domains.add("Psychometric / Behavioral SJT")
            if any("apt" in c.lower() for c in question_columns):
                measured_domains.add("Analytical Thinking & Aptitude")
            if any(k in "".join(question_columns).lower() for k in ["tech", "py", "sql", "dsa", "code"]):
                measured_domains.add("Technical / Programming (Python, SQL, DSA)")
            if not measured_domains:
                measured_domains.add("Core Evaluated Competencies")

        for dcol in direct_domain_columns:
            d_lower = dcol.lower()
            if "aiml" in d_lower or "ai" in d_lower or "ml" in d_lower:
                measured_domains.add("AIML / Data Intelligence")
            elif "python" in d_lower or "sql" in d_lower or "dsa" in d_lower or "tech" in d_lower or "coding" in d_lower:
                measured_domains.add("Technical / Programming (Python, SQL, DSA)")
            elif "aptitude" in d_lower or "quant" in d_lower or "logical" in d_lower:
                measured_domains.add("Analytical Thinking & Aptitude")
            elif "verbal" in d_lower or "comm" in d_lower:
                measured_domains.add("Communication & Business Reasoning")
            else:
                measured_domains.add(f"Domain: {dcol}")

        measured_domains_list = sorted(list(measured_domains))
        unassessed_domains_list = [d for d in cls.STANDARD_DOMAINS if d not in measured_domains_list]

        # 4. Build Candidate Rows
        normalized_candidates = []
        for idx, row in df.iterrows():
            cand_dict = cls._normalize_single_candidate(
                row=row,
                idx=idx,
                identity_mapping=identity_mapping,
                academic_mapping=academic_mapping,
                question_columns=question_columns,
                direct_domain_columns=direct_domain_columns,
                timing_columns=timing_columns
            )
            normalized_candidates.append(cand_dict)

        schema_summary = {
            "filename": filename,
            "source_filename": filename,
            "file_hash": file_hash[:16],
            "candidate_count": candidate_count,
            "sheet_count": sheet_count,
            "sheet_names": sheet_names,
            "raw_column_count": len(raw_columns),
            "raw_columns": raw_columns,
            "identity_fields": identity_mapping,
            "academic_fields": academic_mapping,
            "question_columns": question_columns,
            "direct_domain_columns": direct_domain_columns,
            "timing_columns": timing_columns,
            "measured_domains": measured_domains_list,
            "unassessed_domains": unassessed_domains_list,
            "question_count": len(question_columns) if question_columns else len(direct_domain_columns)
        }

        generated_run_id = run_id or f"RUN_{time.strftime('%Y%m%d_%H%M%S')}_{hashlib.md5(f'{filename}_{file_hash}_{time.time()}'.encode()).hexdigest()[:6].upper()}"

        try:
            from services.question_registry import RunQuestionRegistry
            registered_questions = RunQuestionRegistry.discover_and_register_from_df(
                df=df,
                run_id=generated_run_id,
                question_columns=question_columns,
                source_filename=filename
            )
            schema_summary["question_registry"] = [q.to_dict() for q in registered_questions]
        except Exception as e:
            schema_summary["question_registry"] = []

        return {
            "summary": schema_summary,
            "candidates": normalized_candidates,
            "raw_df": df,
            "candidate_count": schema_summary["candidate_count"],
            "source_filename": filename,
            "discovered_schema": schema_summary,
            "domain_manifest": schema_summary["measured_domains"],
            "run_id": generated_run_id
        }

    @classmethod
    def _detect_identity_columns(cls, cols: List[str]) -> Dict[str, str]:
        mapping = {}
        # Priority 1: USN / Roll Number
        for c in cols:
            cl = c.lower()
            if "usn" in cl or "roll" in cl:
                mapping["usn"] = c
                break
        if "usn" not in mapping:
            for c in cols:
                cl = c.lower()
                if any(k in cl for k in ["student id", "student_id", "serialno", "serial"]):
                    mapping["usn"] = c
                    break

        for c in cols:
            cl = c.lower()
            if "name" in cl and "college" not in cl and "assessment" not in cl:
                if "full" in cl and "name" not in mapping:
                    mapping["name"] = c
                elif "name" not in mapping:
                    mapping["name"] = c
            elif any(k in cl for k in ["department", "branch"]):
                if "department" not in mapping:
                    mapping["department"] = c
            elif any(k in cl for k in ["college", "institution", "university"]):
                if "college" not in mapping:
                    mapping["college"] = c
            elif "email" in cl and "email" not in mapping:
                mapping["email"] = c
            elif any(k in cl for k in ["mobile", "phone", "contact"]) and "mobile" not in mapping:
                mapping["mobile"] = c
            elif "gender" in cl and "gender" not in mapping:
                mapping["gender"] = c
        return mapping

    @classmethod
    def _detect_academic_columns(cls, cols: List[str]) -> Dict[str, str]:
        mapping = {}
        for c in cols:
            cl = c.lower()
            if any(k in cl for k in ["cgpa", "gpa", "percentage", "marks"]):
                if "score" not in cl and "quiz" not in cl and "cgpa" not in mapping:
                    mapping["cgpa"] = c
            elif any(k in cl for k in ["semester", "sem"]) and "semester" not in mapping:
                mapping["semester"] = c
            elif any(k in cl for k in ["graduation", "batch", "passout", "year"]) and "graduation_year" not in mapping:
                mapping["graduation_year"] = c
        return mapping

    @classmethod
    def _detect_question_columns(cls, cols: List[str]) -> List[str]:
        q_cols = []
        for c in cols:
            cs = c.strip()
            if (re.match(r"^[Qq]\d+", cs) or 
                re.match(r"^(PSY|APT|TECH|COMM|LEAD|SJT|Q|QUESTION|LOGIC|ITEM|PROMPT)[\d_]", cs, re.I)):
                q_cols.append(c)
        return q_cols

    @classmethod
    def _detect_domain_score_columns(cls, cols: List[str]) -> List[str]:
        d_cols = []
        for c in cols:
            cl = c.lower()
            if any(k in cl for k in ["score", "marks", "aiml", "python", "sql", "dsa", "aptitude", "verbal", "coding"]):
                if not re.match(r"^[Qq]\d+$", c.strip()) and not re.match(r"^(PSY|APT|TECH)_\d+$", c.strip(), re.I):
                    if "cgpa" not in cl and "semester" not in cl:
                        d_cols.append(c)
        return d_cols

    @classmethod
    def _detect_timing_columns(cls, cols: List[str]) -> Dict[str, str]:
        mapping = {}
        for c in cols:
            cl = c.lower()
            if "time" in cl or "second" in cl or "duration" in cl:
                mapping["time_taken"] = c
            elif "answered" in cl:
                mapping["answered_count"] = c
            elif "correct" in cl:
                mapping["correct_count"] = c
            elif "wrong" in cl or "incorrect" in cl:
                mapping["wrong_count"] = c
            elif "skipped" in cl:
                mapping["skipped_count"] = c
        return mapping

    @classmethod
    def _normalize_single_candidate(
        cls,
        row: pd.Series,
        idx: int,
        identity_mapping: Dict[str, str],
        academic_mapping: Dict[str, str],
        question_columns: List[str],
        direct_domain_columns: List[str],
        timing_columns: Dict[str, str]
    ) -> Dict[str, Any]:
        # Extract Name
        name_col = identity_mapping.get("name")
        name = str(row.get(name_col) if name_col else f"Candidate {idx+1}").strip()
        if not name or name.lower() in ["-", "nan", "none", "null", "undefined", ""]:
            name = f"Candidate {idx+1}"

        # Extract USN
        usn_col = identity_mapping.get("usn")
        usn_raw = row.get(usn_col) if usn_col else None
        if usn_raw is not None and str(usn_raw).strip() not in ["-", "NAN", "NONE", "NULL", "undefined", ""]:
            usn = str(usn_raw).strip().upper()
        else:
            usn = f"CAND_{idx+1:03d}"

        # Extract Department
        dept_col = identity_mapping.get("department")
        dept_raw = str(row.get(dept_col) if dept_col else "General Engineering").strip()
        # Clean department
        dept = dept_raw.replace("BE - ", "").replace("BE  - ", "").replace("B.Tech - ", "").strip()
        if not dept or dept.lower() in ["-", "nan", "none", "null", ""]:
            dept = "General Engineering"

        # Extract College
        coll_col = identity_mapping.get("college")
        coll_raw = str(row.get(coll_col) if coll_col else "Engineering Institute of Technology").strip()
        college = coll_raw if coll_raw not in ["-", "nan", "None", "Not in the list"] else "Engineering Institute of Technology"

        # Extract CGPA
        cgpa_col = academic_mapping.get("cgpa")
        cgpa_val = None
        if cgpa_col:
            val = row.get(cgpa_col)
            try:
                clean_v = float(str(val).replace('/10.0', '').replace('/10', '').replace('%', '').strip())
                if 0.0 <= clean_v <= 10.0:
                    cgpa_val = round(clean_v, 2)
                elif clean_v > 10.0 and clean_v <= 100.0:
                    cgpa_val = round(clean_v / 10.0, 2)
            except (ValueError, TypeError):
                cgpa_val = None

        # Assemble normalized row
        norm_row = {
            "Candidate_Name": name,
            "USN": usn,
            "Department": dept,
            "College": college,
            "CGPA": cgpa_val,
            "Email": str(row.get(identity_mapping.get("email"), "-")),
            "Mobile": str(row.get(identity_mapping.get("mobile"), "-")),
            "Semester": str(row.get(academic_mapping.get("semester"), "N/A")),
            "Graduation_Year": str(row.get(academic_mapping.get("graduation_year"), "2026")),
        }

        # Transfer question responses
        for qc in question_columns:
            val = row.get(qc)
            norm_row[qc] = str(val).strip() if pd.notna(val) else "UNANSWERED"

        # Transfer direct domain scores & metrics
        for dc in direct_domain_columns:
            val = row.get(dc)
            if pd.notna(val):
                try:
                    norm_row[dc] = float(str(val).replace('%', '').strip())
                except (ValueError, TypeError):
                    norm_row[dc] = str(val).strip()

        # Transfer timing metrics
        for tk, tc in timing_columns.items():
            val = row.get(tc)
            if pd.notna(val):
                try:
                    norm_row[tk] = float(val)
                except (ValueError, TypeError):
                    norm_row[tk] = str(val)

        return norm_row
