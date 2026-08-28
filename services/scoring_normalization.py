"""
services/scoring_normalization.py
Authoritative, Centralized Scoring Normalization & Canonical Evidence Engine for Genesis CareerFit 2.0.

Guarantees:
1. All competency percentages strictly bounded: 0.0 <= pct <= 100.0 (or None if unassessed).
2. Authoritative rating tier generation:
   - 90 - 100: Outstanding
   - 80 - 89.99: Excellent
   - 70 - 79.99: Strong
   - 60 - 69.99: Competent
   - 50 - 59.99: Developing
   - Below 50: Needs Significant Development
3. Zero score fabrication: unassessed dimensions return None / Not Evaluated.
4. Canonical metric provenance tracking (source, domain, calculation method, confidence).
"""

import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple, Union

# --- AUTHORITATIVE PSYCHOMETRIC RATING SCALE ---
RATING_SCALE = [
    (90.0, 100.0, "Outstanding", "Exceptional mastery and natural situational judgment.", "MEASURED"),
    (80.0, 89.999, "Excellent", "Strong behavioral consistency and high workplace effectiveness.", "MEASURED"),
    (70.0, 79.999, "Strong", "Consistent application with minor refinement opportunities.", "MEASURED"),
    (60.0, 69.999, "Competent", "Meets core institutional expectations; targeted coaching beneficial.", "MEASURED"),
    (50.0, 59.999, "Developing", "Emerging capability; structured mentorship recommended.", "MEASURED"),
    (0.0, 49.999, "Needs Significant Development", "Priority development area requiring dedicated intervention.", "MEASURED")
]

def safe_float(val: Any, default: Optional[float] = None) -> Optional[float]:
    """
    Converts raw strings, integers, or floats to clean float or None.
    Handles NaN, inf, percentage symbols, and missing markers.
    """
    if val is None:
        return default
    if isinstance(val, (int, float)):
        if math.isnan(val) or math.isinf(val):
            return default
        return float(val)
    
    clean_str = str(val).replace('%', '').replace('/10.0', '').replace('/10', '').replace('/800', '').strip()
    if clean_str in ['', 'nan', 'NaN', 'None', 'null', 'undefined', 'N/A', '-', 'Not Evaluated', 'Data Not Available']:
        return default
    try:
        f = float(clean_str)
        if math.isnan(f) or math.isinf(f):
            return default
        return f
    except (ValueError, TypeError):
        return default

def normalize_competency_percentage(
    score: Optional[Union[float, int]],
    max_score: Optional[Union[float, int]] = None
) -> Optional[float]:
    """
    Centralized percentage normalization function.
    Guarantees: 0.0 <= return_value <= 100.0 (or None if unassessed).
    Never allows >100% or negative percentages.
    """
    if score is None:
        return None
    
    clean_score = safe_float(score)
    if clean_score is None:
        return None
    
    if max_score is not None:
        clean_max = safe_float(max_score)
        if clean_max is None or clean_max <= 0:
            return None
        raw_pct = (clean_score / clean_max) * 100.0
    else:
        # Score is already on a percentage scale
        raw_pct = clean_score

    # Strict clamping: Never exceed 100.0 and never fall below 0.0
    bounded_pct = max(0.0, min(100.0, float(raw_pct)))
    return round(bounded_pct, 2)

def get_competency_rating(pct: Optional[float]) -> Tuple[str, str, str]:
    """
    Authoritative rating tier resolver.
    Returns: (tier_label, interpretation_description, status)
    """
    if pct is None:
        return "Not Evaluated", "No response evidence recorded for this dimension.", "NOT_EVALUATED"
    
    clamped_pct = max(0.0, min(100.0, float(pct)))
    for low, high, tier, desc, status in RATING_SCALE:
        if low <= clamped_pct <= high:
            return tier, desc, status
    
    return "Needs Significant Development", "Priority development area requiring dedicated intervention.", "MEASURED"

def format_percentage_display(pct: Optional[float], decimals: int = 1) -> str:
    """
    Formats a percentage value for display.
    Returns 'Not Evaluated' if None.
    """
    if pct is None:
        return "Not Evaluated"
    clamped = max(0.0, min(100.0, float(pct)))
    return f"{clamped:.{decimals}f}%"

def build_canonical_report_metric(
    metric_name: str,
    score: Optional[float],
    max_score: Optional[float] = None,
    unit: str = "%",
    source: str = "Psychometric SJT",
    domain: str = "Behavioral",
    assessment_id: Optional[str] = None,
    attempt_id: Optional[str] = None,
    calculation_method: str = "Deterministic Normalized Aggregation",
    confidence: str = "HIGH"
) -> Dict[str, Any]:
    """
    Constructs a canonical evidence metric representation with full provenance.
    """
    pct = normalize_competency_percentage(score, max_score)
    rating, desc, status = get_competency_rating(pct)
    
    return {
        "metric_name": metric_name,
        "score": round(score, 2) if score is not None else None,
        "max_score": round(max_score, 2) if max_score is not None else None,
        "percentage": pct,
        "display": format_percentage_display(pct),
        "unit": unit,
        "rating": rating,
        "interpretation": desc,
        "evidence_status": "Measured" if pct is not None else "Not Evaluated",
        "status": status,
        "source": source,
        "domain": domain,
        "assessment_id": assessment_id,
        "attempt_id": attempt_id,
        "confidence": confidence if pct is not None else "INSUFFICIENT",
        "calculation_method": calculation_method,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def format_percentage(val: Any, decimals: int = 1) -> str:
    if val is None:
        return "Not Evaluated"
    f = safe_float(val)
    if f is None:
        return "Not Evaluated"
    if 0.0 < f <= 1.0 and not isinstance(val, str) and not (isinstance(val, str) and '%' in val):
        f = f * 100.0
    return f"{max(0.0, min(100.0, f)):.{decimals}f}%"
