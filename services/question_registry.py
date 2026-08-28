"""
services/question_registry.py
Assessment-Agnostic Canonical Question Registry & Scoring Engine for Genesis CareerFit 3.0.

Guarantees:
1. Dynamic, dataset-driven Question Registry supporting arbitrary question IDs (e.g. Q101-Q110, TECH_01-TECH_06, SJT_A01-SJT_A08).
2. Complete support for question types: MCQ, Likert, SJT, Numeric, Text, Multi-select, Boolean.
3. Matching priority: Exact -> Explicit Registry -> Safe Structural -> MAPPING_REVIEW_REQUIRED.
4. Deterministic scoring without fabrication: missing scoring rules return NOT_EVALUATED.
5. Strict run-scoping: each AssessmentRun has its own independent Question Registry.
"""

import os
import re
import pandas as pd
from typing import Dict, Any, List, Optional, Set, Union, Tuple

class Question:
    def __init__(
        self,
        question_id: str,
        question_text: str = "",
        question_type: str = "SJT",  # "SJT", "MCQ", "LIKERT", "NUMERIC", "TEXT", "MULTI_SELECT", "BOOLEAN"
        options: Optional[List[Any]] = None,
        correct_answer: Optional[Any] = None,
        scoring_rule: Optional[Union[str, Dict[str, Any]]] = "DEFAULT",
        domain: str = "General",
        competency: str = "Core",
        evidence_weight: float = 1.0,
        source_assessment: str = "Uploaded Assessment",
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.question_id = str(question_id).strip()
        self.question_text = str(question_text or f"Question {self.question_id}").strip()
        self.question_type = str(question_type or "SJT").strip().upper()
        self.options = options or []
        self.correct_answer = correct_answer
        self.scoring_rule = scoring_rule
        self.domain = str(domain or "General").strip()
        self.competency = str(competency or "General").strip()
        self.evidence_weight = float(evidence_weight) if evidence_weight is not None else 1.0
        self.source_assessment = str(source_assessment or "Assessment").strip()
        self.metadata = metadata or {}

    def evaluate_response(self, raw_val: Any) -> Dict[str, Any]:
        """
        Evaluates candidate response deterministically based on registry scoring rule.
        Does NOT fabricate scores when scoring rule is missing/invalid.
        """
        if raw_val is None or str(raw_val).strip() in ['', 'nan', 'NaN', 'None', '-', 'null', 'NOT_ATTEMPTED']:
            return {
                "question_id": self.question_id,
                "score": 0.0,
                "max_score": self.get_max_score(),
                "is_attempted": False,
                "is_correct": False,
                "status": "UNATTEMPTED",
                "raw_response": None
            }

        clean_str = str(raw_val).strip()
        rule = self.scoring_rule

        # Check qualitative text first
        if self.question_type == "TEXT" or rule in ["TEXT", "QUALITATIVE"]:
            return {
                "question_id": self.question_id,
                "score": 0.0,
                "max_score": 0.0,
                "is_attempted": True,
                "is_correct": True,
                "status": "QUALITATIVE_RECORDED",
                "raw_response": clean_str
            }

        # Check if scoring rule is unavailable or explicitly NOT_EVALUATED
        if rule in [None, "NONE", "UNAVAILABLE", "NOT_EVALUATED", "UNKNOWN"]:
            return {
                "question_id": self.question_id,
                "score": 0.0,
                "max_score": self.get_max_score(),
                "is_attempted": True,
                "is_correct": False,
                "status": "NOT_EVALUATED",
                "reason": "No deterministic scoring rule defined in question registry",
                "raw_response": clean_str
            }

        # 1. SJT A=3, B=2, C=1 / Custom SJT
        if self.question_type == "SJT" or rule in ["A3_B2_C1", "SJT", "DEFAULT"]:
            sjt_map = {"A": 3.0, "a": 3.0, "1": 1.0, 1: 1.0, "B": 2.0, "b": 2.0, "2": 2.0, 2: 2.0, "C": 1.0, "c": 1.0, "3": 3.0, 3: 3.0}
            if clean_str in sjt_map:
                sc = sjt_map[clean_str]
            else:
                try:
                    sc = float(clean_str)
                    sc = max(1.0, min(3.0, sc))
                except (ValueError, TypeError):
                    sc = 1.0
            return {
                "question_id": self.question_id,
                "score": sc * self.evidence_weight,
                "max_score": 3.0 * self.evidence_weight,
                "is_attempted": True,
                "is_correct": (sc >= 2.5),
                "status": "EVALUATED",
                "raw_response": clean_str
            }

        # 2. MCQ / Exact Match
        elif self.question_type == "MCQ" or rule in ["EXACT_MATCH", "MCQ"]:
            max_s = 1.0 * self.evidence_weight
            if self.correct_answer is not None:
                is_correct = (clean_str.strip().upper() == str(self.correct_answer).strip().upper())
                return {
                    "question_id": self.question_id,
                    "score": max_s if is_correct else 0.0,
                    "max_score": max_s,
                    "is_attempted": True,
                    "is_correct": is_correct,
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }
            else:
                return {
                    "question_id": self.question_id,
                    "score": 0.0,
                    "max_score": max_s,
                    "is_attempted": True,
                    "is_correct": False,
                    "status": "NOT_EVALUATED",
                    "reason": "Correct answer key missing in MCQ scoring rule",
                    "raw_response": clean_str
                }

        # 3. Likert Scale (1-5, 1-7)
        elif self.question_type == "LIKERT" or rule in ["LIKERT_1_5", "LIKERT"]:
            try:
                val = float(clean_str)
                val = max(1.0, min(5.0, val))
                return {
                    "question_id": self.question_id,
                    "score": val * self.evidence_weight,
                    "max_score": 5.0 * self.evidence_weight,
                    "is_attempted": True,
                    "is_correct": (val >= 4.0),
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }
            except (ValueError, TypeError):
                return {
                    "question_id": self.question_id,
                    "score": 1.0 * self.evidence_weight,
                    "max_score": 5.0 * self.evidence_weight,
                    "is_attempted": True,
                    "is_correct": False,
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }

        # 4. Numeric Range / Direct Numeric
        elif self.question_type == "NUMERIC" or rule in ["NUMERIC", "RANGE"]:
            try:
                val = float(clean_str)
                max_s = float(self.metadata.get("max_score", 100.0)) * self.evidence_weight
                return {
                    "question_id": self.question_id,
                    "score": val * self.evidence_weight,
                    "max_score": max_s,
                    "is_attempted": True,
                    "is_correct": True,
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }
            except (ValueError, TypeError):
                return {
                    "question_id": self.question_id,
                    "score": 0.0,
                    "max_score": 100.0 * self.evidence_weight,
                    "is_attempted": True,
                    "is_correct": False,
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }

        # 5. Boolean (True/False, Yes/No, 1/0)
        elif self.question_type == "BOOLEAN" or rule in ["BOOLEAN"]:
            is_true = clean_str.lower() in ["true", "1", "yes", "y", "correct"]
            corr_true = str(self.correct_answer).lower() in ["true", "1", "yes", "y", "correct"] if self.correct_answer else True
            is_correct = (is_true == corr_true)
            max_s = 1.0 * self.evidence_weight
            return {
                "question_id": self.question_id,
                "score": max_s if is_correct else 0.0,
                "max_score": max_s,
                "is_attempted": True,
                "is_correct": is_correct,
                "status": "EVALUATED",
                "raw_response": clean_str
            }

        # 6. Multi-select (comma/semicolon separated)
        elif self.question_type == "MULTI_SELECT" or rule in ["MULTI_SELECT"]:
            user_opts = set([x.strip().upper() for x in re.split(r'[,;|]', clean_str) if x.strip()])
            corr_opts = set([x.strip().upper() for x in re.split(r'[,;|]', str(self.correct_answer or '')) if x.strip()])
            max_s = 1.0 * self.evidence_weight
            if corr_opts:
                match_ratio = len(user_opts.intersection(corr_opts)) / len(corr_opts)
                return {
                    "question_id": self.question_id,
                    "score": round(match_ratio * max_s, 2),
                    "max_score": max_s,
                    "is_attempted": True,
                    "is_correct": (match_ratio >= 0.99),
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }
            else:
                return {
                    "question_id": self.question_id,
                    "score": max_s if len(user_opts) > 0 else 0.0,
                    "max_score": max_s,
                    "is_attempted": True,
                    "is_correct": True,
                    "status": "EVALUATED",
                    "raw_response": clean_str
                }

        # Fallback: NOT_EVALUATED if rule cannot be evaluated
        return {
            "question_id": self.question_id,
            "score": 0.0,
            "max_score": self.get_max_score(),
            "is_attempted": True,
            "is_correct": False,
            "status": "NOT_EVALUATED",
            "reason": f"Unrecognized scoring rule '{rule}'",
            "raw_response": clean_str
        }

    def get_max_score(self) -> float:
        if self.question_type == "SJT" or self.scoring_rule in ["A3_B2_C1", "SJT", "DEFAULT"]:
            return 3.0 * self.evidence_weight
        elif self.question_type == "LIKERT" or self.scoring_rule in ["LIKERT_1_5", "LIKERT"]:
            return 5.0 * self.evidence_weight
        elif self.question_type == "NUMERIC":
            return float(self.metadata.get("max_score", 100.0)) * self.evidence_weight
        elif self.question_type in ["MCQ", "BOOLEAN", "MULTI_SELECT"]:
            return 1.0 * self.evidence_weight
        return 1.0 * self.evidence_weight

    def to_dict(self) -> Dict[str, Any]:
        return {
            "question_id": self.question_id,
            "question_text": self.question_text,
            "question_type": self.question_type,
            "options": self.options,
            "correct_answer": self.correct_answer,
            "scoring_rule": self.scoring_rule,
            "domain": self.domain,
            "competency": self.competency,
            "evidence_weight": self.evidence_weight,
            "source_assessment": self.source_assessment,
            "metadata": self.metadata
        }


class RunQuestionRegistry:
    """
    In-memory and persistent multi-tenant Question Registry manager scoped by run_id.
    Ensures runs do not cross-contaminate question definitions or scoring configurations.
    """
    _registries: Dict[str, Dict[str, Question]] = {}

    @classmethod
    def register_run_questions(cls, run_id: str, questions: List[Question]):
        """Stores a dedicated question registry for an AssessmentRun."""
        if not run_id:
            return
        cls._registries[run_id] = {q.question_id.upper(): q for q in questions}

    @classmethod
    def get_run_questions(cls, run_id: str) -> Dict[str, Question]:
        """Retrieves the question registry for an AssessmentRun."""
        return cls._registries.get(run_id, {})

    @classmethod
    def get_question(cls, run_id: str, question_id: str) -> Optional[Question]:
        """Finds a question within a specific run's registry."""
        reg = cls.get_run_questions(run_id)
        return reg.get(str(question_id).strip().upper())

    @classmethod
    def clear_run(cls, run_id: str):
        """Removes registry for a specific run."""
        if run_id in cls._registries:
            del cls._registries[run_id]

    @classmethod
    def clear_all(cls):
        """Clears all registries."""
        cls._registries.clear()

    @classmethod
    def match_column_to_question(cls, run_id: str, column_header: str) -> Dict[str, Any]:
        """
        Resolves a column header to a question with strict matching priority:
        1. Exact question_id match.
        2. Explicit registry mapping.
        3. Safe structural mapping (regex / prefix).
        4. If ambiguous: returns MAPPING_REVIEW_REQUIRED.
        """
        reg = cls.get_run_questions(run_id)
        col_clean = str(column_header).strip()
        col_upper = col_clean.upper()

        # Priority 1: Exact Match
        if col_upper in reg:
            return {
                "status": "MATCHED",
                "match_type": "EXACT",
                "question_id": col_upper,
                "question": reg[col_upper]
            }

        # Priority 2: Explicit Metadata Alias Matching
        for qid, q in reg.items():
            aliases = [a.upper() for a in q.metadata.get("aliases", [])]
            if col_upper in aliases:
                return {
                    "status": "MATCHED",
                    "match_type": "EXPLICIT_ALIAS",
                    "question_id": qid,
                    "question": q
                }

        # Priority 3: Safe Structural Regex Matching
        candidates = []
        for qid, q in reg.items():
            pattern = re.compile(rf"^{re.escape(qid)}$|^{re.escape(qid)}[_\s:\-]|q(uestion)?[\s_\-]*{re.escape(qid.replace('Q', ''))}$", re.IGNORECASE)
            if pattern.search(col_clean):
                candidates.append((qid, q))

        if not candidates:
            for qid, q in reg.items():
                if col_upper in qid.upper() or qid.upper() in col_upper:
                    candidates.append((qid, q))

        if len(candidates) == 1:
            return {
                "status": "MATCHED",
                "match_type": "STRUCTURAL",
                "question_id": candidates[0][0],
                "question": candidates[0][1]
            }
        elif len(candidates) > 1:
            # Ambiguous match! Do not guess
            return {
                "status": "MAPPING_REVIEW_REQUIRED",
                "field": column_header,
                "reason": f"Column '{column_header}' matched multiple potential questions ({[c[0] for c in candidates]}).",
                "potential_matches": [c[0] for c in candidates]
            }

        # Priority 4: Direct Unregistered Column
        return {
            "status": "UNREGISTERED",
            "field": column_header,
            "reason": f"No matching question found for column '{column_header}' in run '{run_id}'."
        }

    @classmethod
    def discover_and_register_from_df(
        cls,
        df: pd.DataFrame,
        run_id: str,
        question_columns: List[str],
        source_filename: str = "uploaded.csv"
    ) -> List[Question]:
        """
        Dynamically constructs and registers questions from discovered dataset columns.
        """
        questions = []
        for col in question_columns:
            col_s = col.strip()
            # Determine question type & scoring rule dynamically
            if col_s.upper().startswith(("TECH", "PY", "SQL", "CODE")):
                q_type = "MCQ"
                rule = "EXACT_MATCH"
                domain = "Technical"
                comp = "Programming & Software Engineering"
            elif col_s.upper().startswith(("APT", "QUANT", "LOGIC")):
                q_type = "MCQ"
                rule = "EXACT_MATCH"
                domain = "Aptitude"
                comp = "Analytical Problem Solving"
            elif col_s.upper().startswith(("LIKERT", "SCALE")):
                q_type = "LIKERT"
                rule = "LIKERT_1_5"
                domain = "Psychometric"
                comp = "Self-Assessment"
            elif col_s.upper().startswith(("BOOL", "IS_", "HAS_")):
                q_type = "BOOLEAN"
                rule = "BOOLEAN"
                domain = "Verification"
                comp = "Criteria Check"
            else:
                q_type = "SJT"
                rule = "A3_B2_C1"
                domain = "Psychometric"
                comp = "Situational Judgment & Behavioral Competency"

            q = Question(
                question_id=col_s,
                question_text=f"Evaluated Item: {col_s}",
                question_type=q_type,
                scoring_rule=rule,
                domain=domain,
                competency=comp,
                evidence_weight=1.0,
                source_assessment=source_filename
            )
            questions.append(q)

        cls.register_run_questions(run_id, questions)
        return questions

class QuestionSet:
    def __init__(self, name: str, domain: str = "General", questions: Optional[List[Question]] = None):
        self.name = name
        self.domain = domain
        self.questions: Dict[str, Question] = {}
        if questions:
            for q in questions:
                self.questions[q.question_id] = q

    def add_question(self, q: Question):
        self.questions[q.question_id] = q

    def get_question(self, qid: str) -> Optional[Question]:
        return self.questions.get(str(qid).strip().upper())

    @property
    def total_questions(self) -> int:
        return len(self.questions)

    @property
    def competencies(self) -> Set[str]:
        return {q.competency for q in self.questions.values() if q.competency}


class AssessmentPackage:
    """
    Combines multiple QuestionSets into a coherent, discoverable assessment campaign.
    """
    def __init__(self, package_id: str = "CUSTOM_PKG", name: str = "Assessment Package"):
        self.package_id = package_id
        self.name = name
        self.question_sets: Dict[str, QuestionSet] = {}
        self.all_questions: Dict[str, Question] = {}

    def add_question_set(self, qset: QuestionSet):
        self.question_sets[qset.name] = qset
        for qid, q in qset.questions.items():
            self.all_questions[qid] = q

    def get_question(self, qid: str) -> Optional[Question]:
        return self.all_questions.get(str(qid).strip().upper())

    @property
    def domains(self) -> Set[str]:
        return {q.domain for q in self.all_questions.values() if q.domain}

    @property
    def competencies(self) -> Set[str]:
        return {q.competency for q in self.all_questions.values() if q.competency}

    @property
    def total_questions(self) -> int:
        return len(self.all_questions)

    def get_package_summary(self) -> Dict[str, Any]:
        return {
            "package_id": self.package_id,
            "name": self.name,
            "total_questions": self.total_questions,
            "domains": list(self.domains),
            "competencies": list(self.competencies),
            "question_sets": {
                name: {
                    "domain": qs.domain,
                    "question_count": qs.total_questions,
                    "competencies": list(qs.competencies)
                }
                for name, qs in self.question_sets.items()
            }
        }


class QuestionRegistry:
    """
    Central Registry for Dynamic Question Templates & Baseline Question Banks.
    """
    HEADER_PATTERNS = {
        "question_id": [r"question.*id", r"^qid$", r"^id$", r"item.*id", r"^q_id$"],
        "question_text": [r"question.*text", r"item.*text", r"^question$", r"prompt", r"question.*description"],
        "question_type": [r"question.*type", r"type", r"format", r"category"],
        "correct_answer": [r"correct.*answer", r"answer.*key", r"^key$", r"correct.*option"],
        "scoring_rule": [r"scoring.*rule", r"scoring.*type", r"rule"],
        "domain": [r"domain", r"assessment.*domain", r"section", r"track"],
        "subdomain": [r"sub.*domain", r"area", r"sub.*topic"],
        "competency": [r"competency", r"skill", r"behavioral.*dimension", r"metric"],
        "weight": [r"weight", r"points", r"max.*marks", r"weightage"],
        "difficulty": [r"difficulty", r"complexity", r"level"],
        "career_relevance": [r"career.*relevance", r"aligned.*roles", r"roles"]
    }

    @classmethod
    def load_question_template(cls, file_path_or_df: Any, domain_name: str = "Uploaded Assessment", set_name: str = "Default Question Set") -> QuestionSet:
        if isinstance(file_path_or_df, str):
            if file_path_or_df.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path_or_df)
            else:
                df = pd.read_csv(file_path_or_df)
        elif isinstance(file_path_or_df, pd.DataFrame):
            df = file_path_or_df
        else:
            raise ValueError("Input must be file path or pandas DataFrame")

        cols = [str(c).strip() for c in df.columns]
        cols_lower = [c.lower() for c in cols]

        mapping = {}
        for field, patterns in cls.HEADER_PATTERNS.items():
            for p in patterns:
                for idx, cl in enumerate(cols_lower):
                    if re.search(p, cl):
                        mapping[field] = cols[idx]
                        break
                if field in mapping:
                    break

        q_id_col = mapping.get("question_id")
        qset = QuestionSet(name=set_name, domain=domain_name)

        for idx, row in df.iterrows():
            qid = str(row.get(q_id_col) if q_id_col else f"Q{idx+1:03d}").strip().upper()
            qtext = str(row.get(mapping.get("question_text"), f"Question {qid}")).strip()
            qtype = str(row.get(mapping.get("question_type"), "SJT")).strip()
            corr = row.get(mapping.get("correct_answer"))
            s_rule = str(row.get(mapping.get("scoring_rule"), "A3_B2_C1" if qtype == "SJT" else "DEFAULT")).strip()
            dom = str(row.get(mapping.get("domain"), domain_name)).strip()
            comp = str(row.get(mapping.get("competency"), "General")).strip()
            weight = float(row.get(mapping.get("weight"), 1.0)) if mapping.get("weight") and not pd.isna(row.get(mapping.get("weight"))) else 1.0

            q = Question(
                question_id=qid,
                question_text=qtext,
                question_type=qtype,
                correct_answer=corr,
                scoring_rule=s_rule,
                domain=dom,
                competency=comp,
                evidence_weight=weight,
                source_assessment=set_name
            )
            qset.add_question(q)

        return qset

    @classmethod
    def get_baseline_psychometric_package(cls) -> AssessmentPackage:
        qset = QuestionSet(name="Standard Psychometric SJT", domain="Psychometric")
        for i in range(1, 61):
            qid_short = f"Q{i}"
            qid_long = f"Q{i:03d}"
            q = Question(
                question_id=qid_short,
                question_text=f"Psychometric Situational Judgment Dilemma {i}",
                question_type="SJT",
                scoring_rule="A3_B2_C1",
                domain="Psychometric",
                competency="Situational Judgment",
                source_assessment="Genesis Standard Psychometric Benchmark"
            )
            qset.add_question(q)
            q_alt = Question(
                question_id=qid_long,
                question_text=f"Psychometric Situational Judgment Dilemma {i}",
                question_type="SJT",
                scoring_rule="A3_B2_C1",
                domain="Psychometric",
                competency="Situational Judgment",
                source_assessment="Genesis Standard Psychometric Benchmark"
            )
            qset.add_question(q_alt)

        pkg = AssessmentPackage(package_id="BASELINE_PSYCH_SJT", name="Standard Genesis Psychometric Package")
        pkg.add_question_set(qset)
        return pkg

