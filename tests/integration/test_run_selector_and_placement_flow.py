import os, sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from server import app
from services.db_service import (
    init_database,
    InstitutionRepository,
    UserRepository,
    AssessmentRunRepository,
    EvaluationPersistenceService,
    get_connection
)
from services.auth_service import create_access_token

client = TestClient(app)

def setup_module():
    init_database()

def test_run_selector_api_returns_canonical_contract():
    """Verify that /api/assessment-runs and /api/runs return canonical runs list and never undefined or non-array."""
    # 1. Platform Admin token
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Query /api/assessment-runs
    res = client.get("/api/assessment-runs", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "runs" in data, "Response must contain 'runs' key"
    assert isinstance(data["runs"], list), "'runs' must be a List"
    
    # 3. Simulate frontend normalization logic in getAssessmentRuns()
    normalized = data if isinstance(data, list) else (data.get("runs") if isinstance(data.get("runs"), list) else [])
    assert isinstance(normalized, list), "Normalized result must strictly be a list"
    
    # Query /api/runs alias
    res_alias = client.get("/api/runs", headers=admin_headers)
    assert res_alias.status_code == 200
    data_alias = res_alias.json()
    assert isinstance(data_alias["runs"], list)

def test_zero_runs_empty_state_contract():
    """Verify that for a college with 0 runs, API returns an empty list without crashing."""
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Create a fresh empty college
    import uuid
    uid = uuid.uuid4().hex[:6]
    create_col = client.post("/api/admin/colleges", headers=admin_headers, json={
        "name": f"Empty Tech College {uid}",
        "code": f"ETC_{uid}".upper(),
        "contact_email": f"tpo_{uid}@etc.edu"
    })
    assert create_col.status_code == 200
    college_id = (create_col.json().get("college") or create_col.json().get("institution") or {})["id"]

    # Provision an officer for this empty college
    prov_off = client.post(f"/api/admin/colleges/{college_id}/officers", headers=admin_headers, json={
        "full_name": f"TPO Officer {uid}",
        "email": f"tpo_{uid}@etc.edu",
        "username": f"tpo_{uid}",
        "password": "SecurePassword123!"
    })
    assert prov_off.status_code == 200

    # Officer logs in
    off_login = client.post("/api/auth/login", json={
        "username": f"tpo_{uid}",
        "password": "SecurePassword123!",
        "role": "PLACEMENT_OFFICER"
    })
    assert off_login.status_code == 200
    off_token = off_login.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    # Officer fetches assessment runs for empty college
    runs_res = client.get("/api/assessment-runs", headers=off_headers)
    assert runs_res.status_code == 200
    runs_data = runs_res.json()
    assert runs_data["runs"] == [], "Runs must be an empty list [] for college with 0 runs"
    assert runs_data["total"] == 0

def test_placement_officer_published_run_lifecycle_flow():
    """Integration test: Admin creates college -> uploads dataset -> processes -> publishes -> Officer sees run and can select it."""
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    import uuid
    uid = uuid.uuid4().hex[:6]
    college_res = client.post("/api/admin/colleges", headers=admin_headers, json={
        "name": f"Metropolitan Institute of Tech {uid}",
        "code": f"MIT_{uid}".upper(),
        "contact_email": f"placement_{uid}@mit.edu"
    })
    assert college_res.status_code == 200
    college_id = (college_res.json().get("college") or college_res.json().get("institution") or {})["id"]

    # Provision Officer
    client.post(f"/api/admin/colleges/{college_id}/officers", headers=admin_headers, json={
        "full_name": f"Prof. Placement {uid}",
        "email": f"placement_{uid}@mit.edu",
        "username": f"tpo_mit_{uid}",
        "password": "ValidPassword123!"
    })

    # Upload Dataset
    csv_content = b"Student_Name,USN,Department,CGPA,SJT_1,SJT_2,SJT_3,SJT_4,Tech_1,Tech_2\nAlice Smith,1MIT001,CSE,8.9,4,5,4,5,1,1\nBob Jones,1MIT002,ECE,7.8,3,4,3,4,0,1\n"
    files = {"file": ("students.csv", csv_content, "text/csv")}
    upload_res = client.post(f"/api/admin/colleges/{college_id}/datasets/upload", headers=admin_headers, files=files, data={"dataset_name": "Batch 2026 Assessment"})
    assert upload_res.status_code == 200
    dataset_id = upload_res.json()["dataset"]["id"]

    # Process Dataset
    proc_res = client.post(f"/api/admin/colleges/{college_id}/datasets/{dataset_id}/process", headers=admin_headers)
    assert proc_res.status_code == 200

    # Before publishing, Officer must see 0 runs
    off_login = client.post("/api/auth/login", json={
        "username": f"tpo_mit_{uid}",
        "password": "ValidPassword123!",
        "role": "PLACEMENT_OFFICER"
    })
    assert off_login.status_code == 200, f"Officer login failed: {off_login.text}"
    off_token = off_login.json()["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}

    pre_pub_runs = client.get("/api/assessment-runs", headers=off_headers).json()
    assert len(pre_pub_runs["runs"]) == 0, "Unpublished dataset must not be visible to placement officer"

    # Admin Publishes Dataset
    pub_res = client.post(f"/api/admin/colleges/{college_id}/datasets/{dataset_id}/publish", headers=admin_headers)
    assert pub_res.status_code == 200

    # Now Officer must see the published run
    post_pub_runs = client.get("/api/assessment-runs", headers=off_headers).json()
    assert len(post_pub_runs["runs"]) == 1
    assert post_pub_runs["runs"][0]["id"] == dataset_id
    assert post_pub_runs["runs"][0]["total_records"] == 2

    # Officer fetches candidates for this active run
    cands_res = client.get(f"/api/placement/candidates?run_id={dataset_id}", headers=off_headers)
    assert cands_res.status_code == 200
    cands = cands_res.json().get("candidates", [])
    assert len(cands) == 2

    # Admin checks College Reports Inventory
    admin_reports_res = client.get(f"/api/admin/colleges/{college_id}/reports?run_id={dataset_id}", headers=admin_headers)
    assert admin_reports_res.status_code == 200
    rep_data = admin_reports_res.json()
    assert len(rep_data["datasets"]) == 1
    assert rep_data["datasets"][0]["publication_status"] == "PUBLISHED"
    assert len(rep_data["candidates"]) == 2
