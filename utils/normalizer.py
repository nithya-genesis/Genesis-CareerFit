import math
from typing import Any, Dict, Optional
from services.scoring_normalization import (
    safe_float,
    normalize_competency_percentage,
    get_competency_rating,
    format_percentage_display,
    build_canonical_report_metric
)

def format_percentage(val: Any) -> str:
    if val is None or str(val).strip() in ["", "N/A", "None", "null"]:
        return "Not Evaluated"
    pct = normalize_competency_percentage(val)
    if pct is None:
        return "Not Evaluated"
    return f"{pct:.1f}%"

def format_careerfit_index(raw_score: Any) -> Dict[str, Any]:
    clean = safe_float(raw_score, default=700.0)
    if clean is None:
        clean = 700.0
    if clean <= 100.0:
        # Convert 0-100 percentage to 200-800 scale
        pct_val = max(0.0, min(100.0, clean))
        index_val = round(200.0 + (pct_val / 100.0) * 600.0, 1)
    else:
        index_val = round(min(800.0, max(200.0, clean)), 1)
        pct_val = round(((index_val - 200.0) / 600.0) * 100.0, 1)

    return {
        "index_display": f"{index_val:.1f} / 800",
        "index_value": index_val,
        "percentage_display": f"{pct_val:.1f}%",
        "percentage_value": pct_val
    }

def format_metric_entry(val: Any, status_override: str = "MEASURED") -> dict:
    if val is None or str(val).strip() in ["", "N/A", "None", "null"]:
        return {
            "value": None,
            "display": "Not Evaluated",
            "status": "NOT_EVALUATED"
        }
    pct = normalize_competency_percentage(val)
    if pct is None:
        return {
            "value": None,
            "display": "Not Evaluated",
            "status": "NOT_EVALUATED"
        }
    return {
        "value": pct,
        "display": f"{pct:.1f}%",
        "status": status_override
    }
