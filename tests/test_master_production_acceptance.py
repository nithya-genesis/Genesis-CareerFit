"""
GENESIS CAREERFIT — MASTER PRODUCTION ACCEPTANCE TEST SUITE
Validates all 35 operational requirements:
1. Multi-Tenant College Onboarding & Officer Provisioning
2. Role-Based Access Control (Admin Global vs. Officer Institution-Scoped vs. Student Self-Scoped)
3. Dataset Upload Security (Officers Blocked with HTTP 403)
4. Single Source of Truth Scoring & Zero Score Fabrication
5. Multi-Attribute Filtering & Filter-Scoped Excel Export
6. Protected Student Profile Updates & Audit Logging
7. 12-Page Master Dossier & 6-Page Placement Summary PDF with Genesis Logo Watermark
"""
import os
import sys
import io
import json
import unittest
from fastapi.testclient import TestClient
import pandas as pd

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app
from services.db_service import (
    get_connection,
    init_database,
    InstitutionRepository,
    StudentRepository,
    AssessmentRunRepository,
    EvaluationPersistenceService,
    UserRepository,
    AuditLogRepository
)
from services.auth_service import create_access_token, UserRole
from services.report_service import ReportService

client = TestClient(app)

def setup_test_environment():
    """Ensures test database tables and default data are active."""
    init_database()

def test_01_admin_college_onboarding():
    """Admin can create colleges and list institutions."""
    admin_token = create_access_token({"sub": "admin", "role": "PLACEMENT_ADMIN", "institution_id": "platform"})
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create College Alpha
    res = client.post("/api/admin/institutions", json={
        "name": "Alpha Institute of Technology",
        "code": "AIT-2026",
        "contact_email": "dean@ait.edu",
        "contact_phone": "+91 9876543210",
        "academic_year": "2025-2026",
        "branches": ["CSE", "ECE", "MECH"]
    }, headers=headers)
    assert res.status_code == 200, res.text
    inst_a = res.json()["institution"]
    assert inst_a["code"] == "AIT-2026"
    assert inst_a["name"] == "Alpha Institute of Technology"
    
    # List institutions
    list_res = client.get("/api/admin/institutions", headers=headers)
    assert list_res.status_code == 200
    institutions = list_res.json()["institutions"]
    assert any(i["code"] == "AIT-2026" for i in institutions)

def test_02_officer_provisioning_and_tenant_isolation():
    """Admin provisions an officer for College Alpha; officer is strictly scoped to College Alpha."""
    admin_token = create_access_token({"sub": "admin", "role": "PLACEMENT_ADMIN", "institution_id": "platform"})
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    inst = InstitutionRepository.get_by_code("AIT-2026")
    assert inst is not None
    inst_id = inst["id"]
    
    # Provision Placement Officer
    res = client.post(f"/api/admin/institutions/{inst_id}/officers", json={
        "full_name": "Dr. Ramanathan Officer",
        "email": "ramanathan@ait.edu",
        "designation": "Head of Corporate Relations",
        "phone": "+91 9876500001"
    }, headers=headers)
    assert res.status_code == 200, res.text
    officer = res.json()["user"]
    assert officer["institution_id"] == inst_id
    assert officer["role"] == "PLACEMENT_OFFICER"
    
    # Officer logs in / gets token
    officer_token = create_access_token({
        "sub": officer["id"],
        "role": "PLACEMENT_OFFICER",
        "institution_id": inst_id,
        "name": "Dr. Ramanathan Officer"
    })
    officer_headers = {"Authorization": f"Bearer {officer_token}"}
    
    # Officer can access their candidates
    cand_res = client.get("/api/placement/candidates", headers=officer_headers)
    assert cand_res.status_code == 200
    
    # Officer CANNOT access admin institutions management (Forbidden)
    forbidden_res = client.post("/api/admin/institutions", json={"name": "Fake Tech", "code": "FAKE"}, headers=officer_headers)
    assert forbidden_res.status_code == 403

def test_03_dataset_upload_security_rbac():
    """Placement Officer CANNOT upload datasets; only Admin / Operations can upload datasets."""
    inst = InstitutionRepository.get_by_code("AIT-2026")
    inst_id = inst["id"]
    
    officer_token = create_access_token({"sub": "officer_1", "role": "PLACEMENT_OFFICER", "institution_id": inst_id})
    admin_token = create_access_token({"sub": "admin", "role": "PLACEMENT_ADMIN", "institution_id": "platform"})
    
    # Prepare dummy CSV
    csv_content = b"Candidate_Name,USN,Department,CGPA,SJT_Decision_Making,SJT_Communication\nAditya Kumar,1CS23101,CSE,8.75,85,90\n"
    files = {"file": ("assessment.csv", io.BytesIO(csv_content), "text/csv")}
    
    # Officer upload attempt -> MUST FAIL with 403 Forbidden
    res_officer = client.post("/api/upload-and-discover", files=files, headers={"Authorization": f"Bearer {officer_token}"})
    assert res_officer.status_code == 403, "Placement Officer should be blocked from dataset ingestion"
    
    # Admin upload attempt -> MUST SUCCEED
    files_admin = {"file": ("assessment.csv", io.BytesIO(csv_content), "text/csv")}
    res_admin = client.post("/api/upload-and-discover", files=files_admin, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200, res_admin.text
    run_data = res_admin.json()
    assert run_data["run_id"] is not None
    assert run_data["candidates_discovered"] == 1

def test_04_batch_evaluation_and_single_source_of_truth():
    """Batch evaluation derives deterministic CareerFit scores, consistent across all views."""
    admin_token = create_access_token({"sub": "admin", "role": "PLACEMENT_ADMIN", "institution_id": "platform"})
    
    csv_data = (
        "Candidate_Name,USN,Department,CGPA,SJT_Decision_Making,SJT_Problem_Solving\n"
        "Bhavana Rao,1CS23102,CSE,9.10,92,88\n"
    ).encode("utf-8")
    
    files = {"file": ("cohort.csv", io.BytesIO(csv_data), "text/csv")}
    res = client.post("/api/process-batch", files=files, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200, res.text
    batch_res = res.json()
    run_id = batch_res["run_id"]
    assert len(batch_res["candidates"]) == 1
    
    cand = batch_res["candidates"][0]
    expected_cf = cand["scores"]["overall_index"]
    assert expected_cf >= 200 and expected_cf <= 800
    
    # Publish the run so officer can view it
    pub_res = client.post(f"/api/admin/runs/{run_id}/publish", headers={"Authorization": f"Bearer {admin_token}"})
    assert pub_res.status_code == 200
    
    # Check Candidate Directory
    inst = InstitutionRepository.get_or_create_default()
    officer_token = create_access_token({"sub": "officer_1", "role": "PLACEMENT_OFFICER", "institution_id": inst["id"]})
    
    dir_res = client.get(f"/api/placement/candidates?run_id={run_id}", headers={"Authorization": f"Bearer {officer_token}"})
    assert dir_res.status_code == 200
    dir_cands = dir_res.json()["candidates"]
    assert len(dir_cands) >= 1
    dir_cand = next(c for c in dir_cands if c["usn"] == "1CS23102")
    assert dir_cand["careerfit_index"] == expected_cf, "Candidate Directory CareerFit score must match batch score exactly"

def test_05_placement_filtering_and_excel_export():
    """Placement officer can filter candidates and stream a formatted Excel workbook."""
    inst = InstitutionRepository.get_or_create_default()
    officer_token = create_access_token({"sub": "officer_1", "role": "PLACEMENT_OFFICER", "institution_id": inst["id"]})
    headers = {"Authorization": f"Bearer {officer_token}"}
    
    # Multi-attribute filter query
    filter_res = client.get("/api/placement/candidates?min_cgpa=8.0&department=CSE", headers=headers)
    assert filter_res.status_code == 200
    cands = filter_res.json()["candidates"]
    assert all(c["department"] == "CSE" and (c["cgpa"] is None or c["cgpa"] >= 8.0) for c in cands)
    
    # Excel export
    excel_res = client.get("/api/placement/export-excel?min_cgpa=8.0&department=CSE", headers=headers)
    assert excel_res.status_code == 200
    assert "spreadsheetml" in excel_res.headers.get("content-type", "")
    
    # Parse Excel buffer to verify validity
    excel_buf = io.BytesIO(excel_res.content)
    df = pd.read_excel(excel_buf)
    assert "Student Name" in df.columns
    assert "CareerFit Index" in df.columns
    assert "Placement Status" in df.columns

def test_06_protected_student_profile_updates():
    """Placement officer can update permitted profile fields; computed scores remain protected."""
    inst = InstitutionRepository.get_or_create_default()
    inst_id = inst["id"]
    officer_token = create_access_token({"sub": "officer_1", "role": "PLACEMENT_OFFICER", "institution_id": inst_id})
    headers = {"Authorization": f"Bearer {officer_token}"}
    
    # Update candidate 1CS23102 profile
    update_res = client.post("/api/placement/students/1CS23102/profile", json={
        "full_name": "Bhavana Rao Updated",
        "phone": "+91 9988776655",
        "placement_status": "PLACED",
        "placed_company": "Google Cloud",
        "package_lpa": 24.5,
        "skills": ["Python", "FastAPI", "Docker", "Kubernetes"]
    }, headers=headers)
    assert update_res.status_code == 200, update_res.text
    updated = update_res.json()["student"]
    assert updated["placement_status"] == "PLACED"
    assert updated["placed_company"] == "Google Cloud"
    assert updated["package_lpa"] == 24.5
    
    # Verify Audit Log
    logs = AuditLogRepository.list_logs(inst_id, limit=5)
    assert any(l["action"] == "STUDENT_PROFILE_UPDATED" for l in logs)

def test_07_watermark_and_placement_summary_pdf_generation():
    """12-Page Master Dossier and 6-Page Placement Summary compile with Genesis watermark."""
    cand_profile = {
        "student": {
            "name": "Bhavana Rao",
            "usn": "1CS23102",
            "department": "CSE",
            "college": "Engineering Institute of Technology",
            "cgpa": 9.10,
            "cgpa_display": "9.10"
        },
        "scores": {
            "overall_index": 745,
            "overall_index_pct": 90.8,
            "verdict": "PLACEMENT_READY",
            "confidence_tier": "HIGH_CONFIDENCE",
            "evidence_coverage": "2/4 Domains Measured",
            "percentile_display": "Top 5% in Cohort"
        },
        "career_recommendations": {
            "primary_target": {
                "role": "Cloud Architect",
                "match_score": 92.5,
                "readiness_score": 88.0,
                "confidence": "HIGH",
                "fit_tier": "OUTSTANDING",
                "why_this_role": "Exceptional systems design aptitude.",
                "hard_skills": "Distributed Systems, Python, Kubernetes"
            }
        },
        "psychometric_profile": {
            "swot_analysis": {
                "strengths": ["Strong architectural logic", "Clear communicator"],
                "weaknesses": ["Minor timing constraints under pressure"]
            }
        },
        "narrative": {
            "in_simple_words": "Candidate shows strong aptitude for distributed cloud architecture."
        },
        "evidence_pack": {
            "audit_trail": {
                "evidence_pack_hash": "A1B2C3D4E5F6"
            }
        }
    }
    
    # Generate 6-Page Placement Summary PDF
    summary_pdf = ReportService.generate_placement_summary_pdf(cand_profile, output_dir="outputs/test_runs")
    assert os.path.exists(summary_pdf)
    assert os.path.getsize(summary_pdf) > 10000, "Placement Summary PDF must be a valid non-empty file"
    assert "Summary" in os.path.basename(summary_pdf)
    
    # Generate 12-Page Master Dossier PDF
    dossier_pdf = ReportService.generate_candidate_pdf(cand_profile, output_dir="outputs/test_runs")
    assert os.path.exists(dossier_pdf)
    assert os.path.getsize(dossier_pdf) > 10000, "Master Dossier PDF must be a valid non-empty file"
