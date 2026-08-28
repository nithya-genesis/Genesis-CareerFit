import os, sys, io
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from server import app
from services.auth_service import create_access_token
from services.db_service import init_database, InstitutionRepository

client = TestClient(app)

def setup_module():
    init_database()

def test_officer_blocked_from_dataset_upload():
    inst = InstitutionRepository.get_or_create_default()
    officer_token = create_access_token({"sub": "officer_1", "role": "PLACEMENT_OFFICER", "institution_id": inst["id"]})
    
    files = {"file": ("test.csv", io.BytesIO(b"Candidate_Name,USN\nTest,1CS23101\n"), "text/csv")}
    res = client.post("/api/upload-and-discover", files=files, headers={"Authorization": f"Bearer {officer_token}"})
    assert res.status_code == 403

def test_student_cannot_access_officer_candidates():
    student_token = create_access_token({"sub": "1CS23101", "role": "STUDENT", "usn": "1CS23101", "institution_id": "default"})
    res = client.get("/api/placement/candidates", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403
