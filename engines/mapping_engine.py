from typing import Dict, Any, List
import pandas as pd

class MappingEngine:
    """
    Applies user-confirmed column mappings to ingested datasets.
    Handles explicit 'BLANK / NOT AVAILABLE' designations.
    """

    @staticmethod
    def apply_user_mapping(df: pd.DataFrame, mapped_schema: Dict[str, Any]) -> Dict[str, Any]:
        processed_data = {
            "identity_mappings": {},
            "unmapped_or_blank": [],
            "valid_columns": []
        }

        for std_key, actual_col in mapped_schema.items():
            if actual_col == "BLANK / NOT AVAILABLE" or not actual_col:
                processed_data["unmapped_or_blank"].append(std_key)
            elif isinstance(actual_col, str) and actual_col in df.columns:
                processed_data["identity_mappings"][std_key] = actual_col
                processed_data["valid_columns"].append(actual_col)
            elif isinstance(actual_col, list):
                valid_list = [c for c in actual_col if c in df.columns]
                processed_data["identity_mappings"][std_key] = valid_list

        return processed_data