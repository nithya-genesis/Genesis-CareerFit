import os, sys, io, time
import pandas as pd
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath('.'))

from server import app
from services.auth_service import create_access_token
from services.db_service import init_database, InstitutionRepository, AssessmentRunRepository, UserRepository, StudentRepository, AuditLogRepository, get_connection

client = TestClient(app)

def setup_module():
    init_database()

def test_complete_college_data_lifecycle_and_persistence():
    unique_suffix = str(int(time.time()))
    # --------------------------------------------------------------------------
    # TEST A: Onboard New College (Database-backed)
    # --------------------------------------------------------------------------
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})
    
    college_payload = {
        "name": f"Genesis Test College {unique_suffix}",
        "code": f"GTC_{unique_suffix}",
        "slug": f"gtc-{unique_suffix}",
        "contact_email": f"tpo_{unique_suffix}@genesis2026.edu",
        "contact_phone": "+91 9988776655",
        "academic_year": "2025-2026",
        "branches": ["CSE", "ISE", "AIML", "ECE"]
    }
    res_col = client.post("/api/admin/colleges", json=college_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_col.status_code == 200, f"Failed creating college: {res_col.text}"
    college = res_col.json()["college"]
    inst_id = college["id"]
    assert college["code"] == f"GTC_{unique_suffix}"

    # Verify directly in SQLite database
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM institutions WHERE id = ?", (inst_id,))
    db_inst = cur.fetchone()
    assert db_inst is not None
    assert db_inst["code"] == f"GTC_{unique_suffix}"
    conn.close()

    # --------------------------------------------------------------------------
    # TEST B: Provision Placement Officer
    # --------------------------------------------------------------------------
    officer_payload = {
        "full_name": f"Dr. Officer {unique_suffix}",
        "email": f"officer_{unique_suffix}@genesis2026.edu",
        "username": f"tpo_{unique_suffix}",
        "password": "TemporaryPassword123!"
    }
    res_off = client.post(f"/api/admin/colleges/{inst_id}/officers", json=officer_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res_off.status_code == 200, f"Failed provisioning officer: {res_off.text}"
    officer = res_off.json()["officer"]
    assert officer["institution_id"] == inst_id
    assert officer["username"] == f"tpo_{unique_suffix}"

    # Verify officer login against database
    login_res = client.post("/api/auth/login", json={
        "username": f"tpo_{unique_suffix}",
        "password": "TemporaryPassword123!",
        "role": "PLACEMENT_OFFICER"
    })
    assert login_res.status_code == 200, f"Officer login failed: {login_res.text}"
    officer_token = login_res.json()["access_token"]
    assert login_res.json()["user"]["institution_id"] == inst_id

    # --------------------------------------------------------------------------
    # TEST C: Upload Real Dataset & Verify File Download
    # --------------------------------------------------------------------------
    df = pd.DataFrame([
        {"USN": f"1GEN{unique_suffix}01", "Name": "Alice Johnson", "Department": "CSE", "CGPA": 8.9, "Q1": 5, "Q2": 4, "Q3": 5, "Q4": 4, "Q5": 5, "Q6": 4, "Q7": 5, "Q8": 4, "Q9": 5, "Q10": 4, "Q11": 5, "Q12": 4, "Q13": 5, "Q14": 4, "Q15": 5, "Q16": 4, "Q17": 5, "Q18": 4, "Q19": 5, "Q20": 4},
        {"USN": f"1GEN{unique_suffix}02", "Name": "Bob Smith", "Department": "ISE", "CGPA": 8.2, "Q1": 4, "Q2": 4, "Q3": 4, "Q4": 4, "Q5": 4, "Q6": 4, "Q7": 4, "Q8": 4, "Q9": 4, "Q10": 4, "Q11": 4, "Q12": 4, "Q13": 4, "Q14": 4, "Q15": 4, "Q16": 4, "Q17": 4, "Q18": 4, "Q19": 4, "Q20": 4}
    ])
    csv_bytes = df.to_csv(index=False).encode("utf-8")
    
    files = {"file": (f"Genesis_Cohort_{unique_suffix}.csv", io.BytesIO(csv_bytes), "text/csv")}
    upload_res = client.post(
        f"/api/admin/colleges/{inst_id}/datasets/upload",
        files=files,
        data={"dataset_name": f"CareerFit Batch {unique_suffix}"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    upload_data = upload_res.json()
    run_id = upload_data["run_id"]

    # Verify original file download endpoint
    dl_res = client.get(f"/api/admin/colleges/{inst_id}/datasets/{run_id}/download", headers={"Authorization": f"Bearer {admin_token}"})
    assert dl_res.status_code == 200
    assert len(dl_res.content) > 100

    # --------------------------------------------------------------------------
    # TEST D: Process Dataset (Database Batch Evaluation)
    # --------------------------------------------------------------------------
    proc_res = client.post(f"/api/admin/colleges/{inst_id}/datasets/{run_id}/process", headers={"Authorization": f"Bearer {admin_token}"})
    assert proc_res.status_code == 200, f"Processing failed: {proc_res.text}"
    assert proc_res.json()["status"] == "SUCCESS"
    assert proc_res.json()["evaluated_count"] == 2

    # --------------------------------------------------------------------------
    # TEST E: Publish Dataset
    # --------------------------------------------------------------------------
    publish_res = client.post(
        f"/api/admin/colleges/{inst_id}/datasets/{run_id}/publish",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert publish_res.status_code == 200, f"Publishing failed: {publish_res.text}"
    assert publish_res.json()["publication_status"] == "PUBLISHED"
    assert publish_res.json()["is_active"] is True

    # --------------------------------------------------------------------------
    # TEST F: Placement Officer Visibility (Scoped strictly to this college)
    # --------------------------------------------------------------------------
    cand_res = client.get("/api/placement/candidates", headers={"Authorization": f"Bearer {officer_token}"})
    assert cand_res.status_code == 200
    candidates = cand_res.json()["candidates"]
    assert len(candidates) == 2
    assert any(c["usn"] == f"1GEN{unique_suffix}01" for c in candidates)

    # --------------------------------------------------------------------------
    # TEST G: Unpublish & Soft Delete Dataset
    # --------------------------------------------------------------------------
    unpub_res = client.post(f"/api/admin/colleges/{inst_id}/datasets/{run_id}/unpublish", headers={"Authorization": f"Bearer {admin_token}"})
    assert unpub_res.status_code == 200
    assert unpub_res.json()["publication_status"] == "UNPUBLISHED"

    # Delete dataset
    del_res = client.delete(f"/api/admin/colleges/{inst_id}/datasets/{run_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_res.status_code == 200
    
    # Verify dataset is marked DELETED in database
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT publication_status FROM assessment_runs WHERE id = ?", (run_id,))
    row = cur.fetchone()
    assert row["publication_status"] == "DELETED"
    conn.close()
