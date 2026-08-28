import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from services.report_service import ReportService, ReportTemplateType

def test_watermark_and_pdf_generation():
    profile = {
        "student": {"name": "Test Candidate", "usn": "1CS23198", "department": "CSE", "college": "Test Institute", "cgpa": 9.0},
        "scores": {"overall_index": 720, "overall_index_pct": 90.0, "verdict": "PLACEMENT_READY", "confidence_tier": "HIGH_CONFIDENCE"},
        "career_recommendations": {"primary_target": {"role": "Backend Engineer", "match_score": 90.0, "readiness_score": 88.0, "confidence": "HIGH", "fit_tier": "OUTSTANDING", "hard_skills": "Python, SQL"}},
        "psychometric_profile": {"swot_analysis": {"strengths": ["Leadership", "Logic"], "weaknesses": ["Time Management"]}},
        "narrative": {"in_simple_words": "Candidate demonstrates high placement readiness."},
        "evidence_pack": {"audit_trail": {"evidence_pack_hash": "TEST12345"}}
    }
    
    summary_pdf = ReportService.generate_placement_summary_pdf(profile, output_dir="outputs/test_runs")
    assert os.path.exists(summary_pdf)
    assert os.path.getsize(summary_pdf) > 10000
    
    dossier_pdf = ReportService.generate_candidate_pdf(profile, output_dir="outputs/test_runs")
    assert os.path.exists(dossier_pdf)
    assert os.path.getsize(dossier_pdf) > 10000
