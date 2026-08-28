import os, sys, io
from fastapi.testclient import TestClient
import pandas as pd
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from server import app
from services.auth_service import create_access_token
from services.db_service import init_database, InstitutionRepository

client = TestClient(app)

def setup_module():
    init_database()

def test_excel_export_streaming():
    inst = InstitutionRepository.get_or_create_default()
    officer_token = create_access_token({"sub": "officer_1", "role": "PLACEMENT_OFFICER", "institution_id": inst["id"]})
    
    res = client.get("/api/placement/export-excel", headers={"Authorization": f"Bearer {officer_token}"})
    assert res.status_code == 200
    assert "spreadsheetml" in res.headers.get("content-type", "")
    
    df = pd.read_excel(io.BytesIO(res.content))
    assert "Student Name" in df.columns
    assert "CareerFit Index" in df.columns
