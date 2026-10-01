import re
import pandas as pd
from typing import Dict, Any, List, Optional

class DatasetDiscoveryEngine:
    IDENTITY_PATTERNS = {
        "candidate_name": [r"candidate.*name", r"student.*name", r"full.*name", r"learner.*name", r"^name$", r"student$", r"candidate$"],
        "usn": [r"usn", r"roll.*no", r"registration.*no", r"student.*id", r"^id$", r"roll.*number", r"reg.*no", r"usn.*no"],
        "email": [r"email", r"mail.*id", r"e-mail", r"email.*address"],
        "department": [r"department", r"branch", r"stream", r"specialization", r"course", r"dept"],
        "college": [r"college", r"institution", r"campus", r"university", r"inst.*name"],
        "cgpa": [r"cgpa", r"gpa", r"academic.*marks", r"marks.*%", r"aggregate"]
    }
    SCORE_METRIC_PATTERNS = {
        "total_score": [r"total.*score", r"max.*marks", r"out.*of", r"total.*marks"],
        "obtained_score": [r"^score$", r"marks.*obtained", r"final.*score", r"quiz.*score", r"obtained.*score", r"test.*score", r"^marks$"],
        "percentage": [r"percentage", r"accuracy", r"score.*%", r"percent"]
    }

    @classmethod
    def discover_dataset(cls, df: pd.DataFrame, file_name: str = "") -> Dict[str, Any]:
        cols = [str(c).strip() for c in df.columns]
        cols_lower = [c.lower() for c in cols]

        discovered_identity = {
            field: cls._find_matching_col(cols, cols_lower, patterns)
            for field, patterns in cls.IDENTITY_PATTERNS.items()
        }
        discovered_metrics = {
            metric: cls._find_matching_col(cols, cols_lower, patterns)
            for metric, patterns in cls.SCORE_METRIC_PATTERNS.items()
        }

        question_cols = [c for c in cols if re.match(r"^[qprwcm]\d+$", c.strip(), re.IGNORECASE) or re.match(r"^item_?\d+$", c.strip(), re.IGNORECASE)]
        explicit_score_cols = [c for c, cl in zip(cols, cols_lower) if c not in question_cols and ("score" in cl or "marks" in cl or "percent" in cl)]

        return {
            "platform_branding": "Genesis CareerFit Enterprise Engine",
            "file_name": file_name,
            "total_records": len(df),
            "is_item_level_response": len(question_cols) >= 3,
            "discovered_identity": discovered_identity,
            "discovered_metrics": discovered_metrics,
            "question_columns": question_cols,
            "explicit_score_columns": explicit_score_cols
        }

    @staticmethod
    def _find_matching_col(cols: List[str], cols_lower: List[str], patterns: List[str]) -> Optional[str]:
        for pattern in patterns:
            for idx, c_lower in enumerate(cols_lower):
                if re.search(pattern, c_lower):
                    return cols[idx]
        return None

AssessmentDiscoveryEngine = DatasetDiscoveryEngine


DiscoveryEngine = DatasetDiscoveryEngine
