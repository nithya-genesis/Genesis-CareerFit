import os, glob
import pandas as pd
from typing import Dict, Any, List, Optional

class QuestionBankEngine:
    """
    Extracts assessment section taxonomy, difficulty levels, and marking definitions
    from question bank files (e.g. NEW COMBINATION.xlsx) without confusing item definitions with candidate scores.
    """

    @classmethod
    def _parse_numeric(cls, val, default: float = 0.0) -> float:
        try:
            return float(val) if pd.notna(val) else default
        except (ValueError, TypeError):
            return default

    @classmethod
    def load_question_bank_definitions(cls, file_path: str = "NEW COMBINATION.xlsx") -> Dict[str, Any]:
        # Search in current directory, parent directory, or subdirectories
        target_path = file_path
        if not os.path.exists(target_path):
            matches = glob.glob(f"**/*{os.path.basename(file_path)}*", recursive=True) + glob.glob(f"*{os.path.basename(file_path)}*")
            if matches:
                target_path = matches[0]

        if not os.path.exists(target_path):
            return {
                "status": "unavailable",
                "source_file": file_path,
                "total_sections": 0,
                "sections": {}
            }

        try:
            xls = pd.ExcelFile(target_path)
            df = pd.read_excel(xls, sheet_name=0)
            df_clean = df.dropna(subset=['SectionName', 'Question'])

            sections = {}
            for section_name, group in df_clean.groupby('SectionName'):
                s_name = str(section_name).strip()
                if s_name in ["SectionName", "Category", "PositiveMark", "1"]:
                    continue
                
                levels = {}
                if 'Level' in group.columns:
                    levels = group['Level'].value_counts().to_dict()

                pos_mark = 1.0
                if 'PositiveMark' in group.columns:
                    pos_mark = cls._parse_numeric(group['PositiveMark'].iloc[0], 1.0)

                neg_mark = 0.0
                if 'NegativeMark' in group.columns:
                    neg_mark = cls._parse_numeric(group['NegativeMark'].iloc[0], 0.0)

                sections[s_name] = {
                    "total_items": len(group),
                    "levels": levels,
                    "default_positive_mark": pos_mark,
                    "default_negative_mark": neg_mark
                }

            return {
                "status": "loaded",
                "source_file": os.path.basename(target_path),
                "total_sections": len(sections),
                "sections": sections
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "source_file": file_path,
                "total_sections": 0,
                "sections": {}
            }
