import os, sys
sys.path.insert(0, os.path.abspath('.'))

from fastapi.testclient import TestClient
from server import app
from services.auth_service import create_access_token
from services.db_service import init_database, InstitutionRepository, UserRepository, get_connection

client = TestClient(app)

def setup_module():
    init_database()

def test_simultaneous_tab_sessions_and_token_isolation():
    """
    Verifies that Admin and Placement Officer tokens can exist and operate
    concurrently without session collision or role leakage.
    """
    inst = InstitutionRepository.get_or_create_default()
    inst_id = inst["id"]
    
    # 1. Admin Session (Tab A)
    admin_token = create_access_token({"sub": "admin", "role": "PLATFORM_ADMIN", "institution_id": "platform"})

    # 2. Officer Session (Tab B)
    officer_token = create_access_token({
        "sub": "officer_tab_b",
        "role": "PLACEMENT_OFFICER",
        "name": "Tab B Officer",
        "institution_id": inst_id
    })

    # 3. Tab A (Admin) executes Admin Request -> 200 OK
    res_admin = client.get("/api/admin/colleges", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200
    assert "colleges" in res_admin.json()

    # 4. Tab B (Officer) executes Officer Request -> 200 OK
    res_officer = client.get("/api/placement/candidates", headers={"Authorization": f"Bearer {officer_token}"})
    assert res_officer.status_code == 200
    assert "candidates" in res_officer.json()

    # 5. Tab B (Officer) is strictly forbidden from Admin endpoints -> 403 Forbidden
    res_off_as_admin = client.get("/api/admin/colleges", headers={"Authorization": f"Bearer {officer_token}"})
    assert res_off_as_admin.status_code == 403

    # 6. Tab A (Admin) continues to operate as Admin -> 200 OK
    res_admin_after = client.get("/api/admin/colleges", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin_after.status_code == 200
    assert "colleges" in res_admin_after.json()
