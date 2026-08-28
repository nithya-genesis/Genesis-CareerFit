"""
services/report_templates.py
Multi-Template Report Engine & Registry for Genesis CareerFit 2.0.

Provides 7 distinct, evidence-backed report templates consuming the canonical evidence model:
1. TEMPLATE_STUDENT_MASTER (12 pages)
2. TEMPLATE_EXECUTIVE_SUMMARY (3-4 pages)
3. TEMPLATE_CANDIDATE_SCORECARD (1 page)
4. TEMPLATE_DEPARTMENT_ANALYTICS (8-12 pages)
5. TEMPLATE_INSTITUTION_PLACEMENT (10-15 pages)
6. TEMPLATE_EMPLOYER_SHORTLIST (1-5 pages)
7. TEMPLATE_DEVELOPMENT_PLAN (4-6 pages)
"""

from typing import Any, Dict, List, Optional
from enum import Enum

class ReportTemplateType(str, Enum):
    STUDENT_MASTER = "TEMPLATE_STUDENT_MASTER"
    EXECUTIVE_SUMMARY = "TEMPLATE_EXECUTIVE_SUMMARY"
    CANDIDATE_SCORECARD = "TEMPLATE_CANDIDATE_SCORECARD"
    DEPARTMENT_ANALYTICS = "TEMPLATE_DEPARTMENT_ANALYTICS"
    INSTITUTION_PLACEMENT = "TEMPLATE_INSTITUTION_PLACEMENT"
    EMPLOYER_SHORTLIST = "TEMPLATE_EMPLOYER_SHORTLIST"
    DEVELOPMENT_PLAN = "TEMPLATE_DEVELOPMENT_PLAN"

REPORT_TEMPLATE_REGISTRY = {
    ReportTemplateType.STUDENT_MASTER: {
        "id": "TEMPLATE_STUDENT_MASTER",
        "name": "Comprehensive 12-Page Student Master Dossier",
        "target_audience": "Students, Career Counsellors, Academic Advisors",
        "approx_pages": 12,
        "template_file": "report_template.html",
        "description": "Full 12-page diagnostic covering verified candidate profile, executive snapshot, 19 behavioral competencies, cognitive aptitude, technical capability, career fit engine, role-competency matrix, development diagnosis, interview readiness, 30/60/90-day roadmap, and final certification diagnosis."
    },
    ReportTemplateType.EXECUTIVE_SUMMARY: {
        "id": "TEMPLATE_EXECUTIVE_SUMMARY",
        "name": "Executive Recruitment Summary",
        "target_audience": "Placement Training Officers, Department Heads, Recruiters",
        "approx_pages": 3,
        "template_file": "executive_summary.html",
        "description": "Condensed 3-page recruitment summary focused on placement readiness, CareerFit Index, top 3 role alignments, key behavioral strengths, critical skill gaps, and interview recommendations."
    },
    ReportTemplateType.CANDIDATE_SCORECARD: {
        "id": "TEMPLATE_CANDIDATE_SCORECARD",
        "name": "Candidate One-Page Scorecard",
        "target_audience": "Campus Interview Panels, Technical Evaluators, Hiring Managers",
        "approx_pages": 1,
        "template_file": "candidate_scorecard.html",
        "description": "High-impact single-page profile with candidate vitals, CareerFit score, top 5 verified competencies, technical scores, and quick interview questions."
    },
    ReportTemplateType.DEPARTMENT_ANALYTICS: {
        "id": "TEMPLATE_DEPARTMENT_ANALYTICS",
        "name": "Department Placement Intelligence Report",
        "target_audience": "Department Heads, Senior Faculty, Placement Coordinators",
        "approx_pages": 8,
        "template_file": "department_analytics.html",
        "description": "Cohort-level department analytics covering readiness distribution, 4-quadrant placement matrix, skill gap heatmap, top career pathways, and recommended curriculum interventions."
    },
    ReportTemplateType.INSTITUTION_PLACEMENT: {
        "id": "TEMPLATE_INSTITUTION_PLACEMENT",
        "name": "Institutional Placement Intelligence & Strategy Report",
        "target_audience": "Directors, Principals, Deans, Corporate Relations",
        "approx_pages": 10,
        "template_file": "institution_placement.html",
        "description": "Campus-wide intelligence benchmarking all engineering departments, talent pipeline supply, industry alignment, placement readiness velocity, and strategic institutional remediation."
    },
    ReportTemplateType.EMPLOYER_SHORTLIST: {
        "id": "TEMPLATE_EMPLOYER_SHORTLIST",
        "name": "Employer Criteria Shortlist Dossier",
        "target_audience": "Corporate Recruiters, Talent Acquisition Partners",
        "approx_pages": 3,
        "template_file": "employer_shortlist.html",
        "description": "Evidence-backed candidate shortlist matching specified corporate job criteria (CGPA, technical threshold, behavioral scores) with detailed inclusion justifications."
    },
    ReportTemplateType.DEVELOPMENT_PLAN: {
        "id": "TEMPLATE_DEVELOPMENT_PLAN",
        "name": "30-60-90 Day Skill Remediation & Development Plan",
        "target_audience": "Students, Mentors, Faculty Coaches",
        "approx_pages": 4,
        "template_file": "development_plan.html",
        "description": "Dedicated action plan detailing individualized learning milestones, recommended technical projects, timed practice problems, and STAR behavioral interview prep."
    }
}

def get_template_metadata(template_type: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves template configuration from the registry.
    """
    for k, v in REPORT_TEMPLATE_REGISTRY.items():
        if k.value == template_type or k == template_type or v["id"] == template_type:
            return v
    return REPORT_TEMPLATE_REGISTRY[ReportTemplateType.STUDENT_MASTER]

def list_available_templates() -> List[Dict[str, Any]]:
    """
    Lists all available report templates in the registry.
    """
    return list(REPORT_TEMPLATE_REGISTRY.values())
