import os
from typing import Dict, Any

from engines.ingestion_engine import IngestionEngine
from engines.discovery_engine import DiscoveryEngine
from engines.mapping_engine import MappingEngine
from engines.validation_engine import ValidationEngine
from engines.scoring_engine import ScoringEngine
from engines.evidence_engine import EvidenceEngine
from engines.report_engine import ReportEngine
from engines.zip_engine import ZipEngine
from config.assessments.registry import AssessmentRegistry
from config.settings import Config

class ProcessingService:
    """Orchestrates dynamic multi-domain ingestion, scoring, reporting, and isolated packaging."""

    def __init__(self):
        self.registry = AssessmentRegistry()

    def process_dataset(self, file_path: str, user_mapping: Dict[str, Any], report_mode: str) -> Dict[str, Any]:
        ingest_result = IngestionEngine.load_dataset(file_path)
        df = ingest_result.get("dataframe") if isinstance(ingest_result, dict) else ingest_result

        schema = DiscoveryEngine.discover_schema(df)
        mapped = MappingEngine.apply_user_mapping(df, user_mapping)
        validation = ValidationEngine.validate_dataset(df, mapped)
        if not validation["is_valid"]:
            return {"success": False, "errors": validation["errors"]}

        job_dir = ZipEngine.create_job_directory(Config.OUTPUT_FOLDER)
        pdf_paths = []
        psych_schema = self.registry.get_assessment("PSYCHOMETRIC_SJT_V1")

        for idx, row in df.iterrows():
            name_col = mapped["identity_mappings"].get("candidate_name")
            usn_col = mapped["identity_mappings"].get("usn")
            college_col = mapped["identity_mappings"].get("college")
            dept_col = mapped["identity_mappings"].get("department")
            cgpa_col = mapped["identity_mappings"].get("cgpa")

            candidate_name = str(row.get(name_col, f"Candidate_{idx+1}")).strip() if name_col else f"Candidate_{idx+1}"
            usn = str(row.get(usn_col, "Data Not Available")).strip() if usn_col else "Data Not Available"
            college = str(row.get(college_col, "Data Not Available")).strip() if college_col else "Data Not Available"
            dept = str(row.get(dept_col, "Data Not Available")).strip() if dept_col else "Data Not Available"
            cgpa = str(row.get(cgpa_col, "Data Not Available")).strip() if cgpa_col else "Data Not Available"

            candidate_info = {
                "candidate_name": candidate_name,
                "usn": usn,
                "college": college,
                "department": dept,
                "cgpa": cgpa
            }

            assessment_results = ScoringEngine.evaluate_row_assessments(
                row, schema.get("potential_assessment_columns", []), psych_schema
            )

            evidence_pack = EvidenceEngine.build_evidence_pack(candidate_info, assessment_results, mapped)

            sanitized_name = "".join(c for c in candidate_name if c.isalnum() or c in (" ", "_")).rstrip().replace(" ", "_")
            pdf_filename = f"{sanitized_name}_CareerFit_Report.pdf"
            pdf_path = os.path.join(job_dir, pdf_filename)

            ReportEngine.generate_report(evidence_pack, pdf_path, report_mode)
            pdf_paths.append(pdf_path)

        zip_filename = "Genesis_CareerFit_Reports.zip"
        zip_path = os.path.join(job_dir, zip_filename)
        ZipEngine.bundle_reports_to_zip(pdf_paths, zip_path)

        return {
            "success": True,
            "job_id": os.path.basename(job_dir),
            "total_processed": len(pdf_paths),
            "zip_path": zip_path,
            "warnings": validation["warnings"]
        }
