import pandas as pd
from typing import Dict, Any

class ValidationEngine:
    """
    Validates dataset row integrity, required fields, and non-blocking warnings.
    """

    @staticmethod
    def validate_dataset(df: pd.DataFrame, mapping_result: Dict[str, Any]) -> Dict[str, Any]:
        report = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "valid_row_count": len(df)
        }

        if len(df) == 0:
            report["is_valid"] = False
            report["errors"].append("Uploaded dataset file contains 0 rows.")
            return report

        identity = mapping_result.get("identity_mappings", {})
        if "candidate_name" not in identity and "usn" not in identity:
            report["warnings"].append("Neither Candidate Name nor USN/ID was mapped. Row indices will be used for identification.")

        for blank_field in mapping_result.get("unmapped_or_blank", []):
            report["warnings"].append(f"Field '{blank_field}' was marked as BLANK / NOT AVAILABLE. Reports will reflect 'Data Not Available'.")

        return report