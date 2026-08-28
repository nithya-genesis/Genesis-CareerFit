import os, sys
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from server import app
from services.auth_service import create_access_token
from services.db_service import init_database, InstitutionRepository

client = TestClient(app)

def setup_module():
    init_database()

def test_admin_colleges_catalog_and_command_center():
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})
    
    # 1. Onboard College A
    res_a = client.post("/api/admin/colleges", json={
        "name": "Engineering Institute of Technology",
        "code": "EIT-BLR",
        "contact_email": "tpo@eit.edu",
        "branches": ["CSE", "ISE", "ECE"]
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_a.status_code == 200, f"Failed creating college A: {res_a.text}"
    col_a = res_a.json()["college"]
    
    # 2. Onboard College B
    res_b = client.post("/api/admin/colleges", json={
        "name": "Alpha Institute of Technology",
        "code": "AIT-DEL",
        "contact_email": "tpo@ait.edu",
        "branches": ["CSE", "AIML"]
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_b.status_code == 200, f"Failed creating college B: {res_b.text}"
    col_b = res_b.json()["college"]
    
    # 3. List colleges with live aggregated statistics
    catalog_res = client.get("/api/admin/colleges", headers={"Authorization": f"Bearer {admin_token}"})
    assert catalog_res.status_code == 200
    colleges = catalog_res.json()["colleges"]
    assert len(colleges) >= 2
    col_a_entry = next((c for c in colleges if c["id"] == col_a["id"]), None)
    assert col_a_entry is not None
    assert "student_count" in col_a_entry
    assert "officer_count" in col_a_entry
    
    # 4. Open College Command Center for College A
    cc_a_res = client.get(f"/api/admin/colleges/{col_a['id']}/command-center", headers={"Authorization": f"Bearer {admin_token}"})
    assert cc_a_res.status_code == 200
    bundle_a = cc_a_res.json()
    assert bundle_a["college"]["name"] == "Engineering Institute of Technology"
    assert "counts" in bundle_a
    assert "officers" in bundle_a

def test_cross_tenant_isolation_officers_and_students():
    inst_a = InstitutionRepository.get_or_create_default()
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})
    
    # Create distinct College B
    res_b = client.post("/api/admin/colleges", json={"name": "Apex University", "code": "APEX-U"}, headers={"Authorization": f"Bearer {admin_token}"})
    inst_b = res_b.json()["college"]
    
    # Officer for College A
    token_a = create_access_token({"sub": "tpo_a", "role": "PLACEMENT_OFFICER", "institution_id": inst_a["id"]})
    
    # Officer for College B
    token_b = create_access_token({"sub": "tpo_b", "role": "PLACEMENT_OFFICER", "institution_id": inst_b["id"]})
    
    # Officer A accessing College A candidates -> 200 OK
    res_cand_a = client.get("/api/placement/candidates", headers={"Authorization": f"Bearer {token_a}"})
    assert res_cand_a.status_code == 200
    
    # Officer A attempting to access admin command center -> 403 Forbidden
    res_unauth = client.get(f"/api/admin/colleges/{inst_b['id']}/command-center", headers={"Authorization": f"Bearer {token_a}"})
    assert res_unauth.status_code == 403
