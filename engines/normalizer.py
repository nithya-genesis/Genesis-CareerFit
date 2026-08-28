import math
from typing import Any, Union, Dict, Optional

def to_clean_float(val: Any, default: float = 0.0) -> float:
    """
    Safely converts arbitrary values, string percentages, or missing markers to a clean float.
    Prevents NaN, None, and Infinity.
    """
    if val is None:
        return default
    if isinstance(val, (int, float)):
        if math.isnan(val) or math.isinf(val):
            return default
        return float(val)
    
    clean_str = str(val).replace('%', '').replace('/10.0', '').replace('/10', '').strip()
    try:
        parsed = float(clean_str)
        if math.isnan(parsed) or math.isinf(parsed):
            return default
        return parsed
    except (ValueError, TypeError):
        return default

def format_percentage(val: Any, decimals: int = 1, missing_label: str = "Not Evaluated") -> str:
    """
    Standard percentage display formatter.
    """
    if val is None or str(val).strip() in ["", "None", "null", "undefined", "Data Not Available"]:
        return missing_label
    
    num = to_clean_float(val, default=-1.0)
    if num < 0:
        return missing_label
    
    return f"{num:.{decimals}f}%"

def format_cgpa(val: Any, default_display: str = "Data Not Available") -> str:
    """
    Standard CGPA display formatter.
    """
    if val is None or str(val).strip() in ["", "None", "null", "undefined", "Data Not Available"]:
        return default_display
    
    num = to_clean_float(val, default=-1.0)
    if num <= 0:
        return default_display
    return f"{num:.2f}/10.0"

def build_normalized_candidate_payload(profile: Dict[str, Any], idx: int = 0) -> Dict[str, Any]:
    """
    Builds a normalized candidate JSON object that satisfies all UI and dashboard
    components while preserving strict provenance, confidence, and coverage metadata.
    """
    student = profile.get("student", {})
    scores = profile.get("scores", {})
    recs = profile.get("career_recommendations", {})
    primary = recs.get("primary_target", {})
    evidence_pack = profile.get("evidence_pack", {})
    evidence_summary = profile.get("evidence_summary", {})
    inst_class = profile.get("institutional_classification", {})
    
    name = str(student.get("name") or f"Candidate {idx+1}").strip()
    usn = str(student.get("usn") or f"1CS23{idx+101}").strip().upper()
    dept = str(student.get("department") or "CSE").strip().upper()
    college = str(student.get("college") or "Engineering Institute of Technology").strip()
    
    raw_cgpa = student.get("cgpa")
    cgpa_val: Optional[float] = float(raw_cgpa) if raw_cgpa is not None else None
    cgpa_display = student.get("cgpa_display") or ("Data Not Available" if cgpa_val is None else f"{cgpa_val:.2f}/10.0")
    
    fit_score = scores.get("career_fit_score")
    if fit_score is None and primary.get("match_score") is not None:
        fit_score = primary.get("match_score")
        
    readiness_score = scores.get("job_readiness_score")
    if readiness_score is None and primary.get("readiness_score") is not None:
        readiness_score = primary.get("readiness_score")

    overall_index = scores.get("overall_index") or 200
    target_role = str(primary.get("role") or "Software Development Engineer").strip()
    
    inst_status = scores.get("institutional_status") or evidence_summary.get("institutional_verification_status") or "PROVISIONAL_PLACEMENT_READY"
    confidence = scores.get("confidence") or evidence_summary.get("confidence") or "INSUFFICIENT"
    quadrant = scores.get("mathematical_quadrant") or inst_class.get("quadrant") or "Q4"
    quadrant_label = inst_class.get("quadrant_label") or "Guidance Required"

    # Extract component scores from evidence pack or competency map safely
    components = evidence_pack.get("career_fit_calculations", {}).get("components", {})
    tech_score = components.get("technical", {}).get("score")
    anly_score = components.get("analytical", {}).get("score")
    own_score = components.get("ownership", {}).get("score")
    comm_score = components.get("communication", {}).get("score")

    return {
        "id": idx + 1,
        # Identity Keys
        "candidate": name,
        "candidate_name": name,
        "name": name,
        "student_name": name,
        "usn": usn,
        "roll_no": usn,
        "department": dept,
        "branch": dept,
        "college": college,
        "cgpa": cgpa_display,
        "cgpa_val": cgpa_val,
        "academic_cgpa": cgpa_display,
        
        # Primary Role Keys
        "top_recommended_role": target_role,
        "recommended_role": target_role,
        "target_role": target_role,
        "role": target_role,
        "primary_placement_role": target_role,
        "top_matched_track": target_role,
        "domain": primary.get("domain", "Engineering & Technology"),
        
        # Career Fit & Readiness Metrics
        "fit_score": fit_score,
        "suitability_fit": fit_score,
        "suitability_match": fit_score,
        "match_score": fit_score,
        "career_fit_score": fit_score,
        "careerfit_suitability_index": fit_score,
        "careerfit_index": overall_index,
        "career_fit_index": overall_index,
        "fit_percentage": f"{fit_score:.1f}%" if fit_score is not None else "Not Evaluated",
        
        "job_readiness_score": readiness_score,
        "readiness_score": readiness_score,
        "readiness_percentage": f"{readiness_score:.1f}%" if readiness_score is not None else "Not Evaluated",
        "readiness_tier": inst_status.replace('_', ' ').title(),
        "readiness_status": inst_status.replace('_', ' ').title(),
        "institutional_status": inst_status,
        "institutional_verification_status": inst_status,
        "confidence": confidence,
        "quadrant": quadrant,
        "quadrant_label": quadrant_label,
        "status": inst_status.replace('_', ' ').title(),
        "verdict": inst_status.replace('_', ' ').title(),
        
        # Multidimensional Component Metrics
        "analytical_score": anly_score,
        "technical_score": tech_score,
        "ownership_score": own_score,
        "communication_score": comm_score,
        
        # Evidence Coverage Summary
        "evidence_summary": evidence_summary,
        "career_fit_evidence_coverage": evidence_summary.get("career_fit_evidence_coverage", "0/4"),
        "evidence_status": {
            "academic": "MEASURED" if cgpa_val is not None else "UNAVAILABLE",
            "psychometric": evidence_summary.get("psychometric_evidence_status", "NOT_EVALUATED"),
            "technical": evidence_summary.get("technical_evidence_status", "NOT_EVALUATED")
        },
        
        # Report File Metadata
        "pdf_filename": f"{name.replace(' ', '_')}_{usn}_CareerFit_Dossier.pdf",
        "pdf_url": f"/api/reports/download/pdf/{name.replace(' ', '_')}_{usn}_CareerFit_Dossier.pdf",
        "pdf_generated": True
    }
