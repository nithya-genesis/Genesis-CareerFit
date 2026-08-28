import os, sys, io
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from server import app
from services.auth_service import create_access_token, UserRole
from services.db_service import init_database, InstitutionRepository, UserRepository

client = TestClient(app)

def setup_module():
    init_database()

def test_admin_api_login_flow():
    inst = InstitutionRepository.get_or_create_default()
    admin_user = UserRepository.get_by_username("admin")
    if not admin_user:
        admin_user = UserRepository.create_user(
            institution_id=inst["id"],
            username="admin",
            full_name="Platform Owner Admin",
            email="admin@genesiscareerfit.ai",
            role="PLACEMENT_ADMIN",
            password_hash="genesis2026"
        )
    
    # Try Admin login via API with role PLATFORM_ADMIN
    res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": admin_user.get("password_hash") or "genesis2026",
        "role": "PLATFORM_ADMIN"
    })
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    data = res.json()
    assert data["role"] in ["PLATFORM_ADMIN", "PLACEMENT_ADMIN"]
    assert "access_token" in data
    
    # Verify Admin token access to /api/admin/overview
    token = data["access_token"]
    overview_res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert overview_res.status_code == 200

def test_officer_cannot_access_admin_endpoints():
    inst = InstitutionRepository.get_or_create_default()
    token = create_access_token({"sub": "officer_test", "role": "PLACEMENT_OFFICER", "institution_id": inst["id"]})
    res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403, "Officer should be blocked from admin overview"

def test_student_cannot_access_admin_or_officer_endpoints():
    student_token = create_access_token({"sub": "1CS23101", "role": "STUDENT", "usn": "1CS23101", "institution_id": "default"})
    
    # Blocked from admin
    admin_res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {student_token}"})
    assert admin_res.status_code == 403
    
    # Blocked from placement candidate list
    officer_res = client.get("/api/placement/candidates", headers={"Authorization": f"Bearer {student_token}"})
    assert officer_res.status_code == 403

def test_role_spoofing_prevented_server_side():
    inst = InstitutionRepository.get_or_create_default()
    # Create or get student
    student_u = UserRepository.get_by_username("1CS23199")
    if not student_u:
        student_u = UserRepository.register_student(
            institution_id=inst["id"],
            full_name="Spoof Test Student",
            email="spoof@test.edu",
            password="password123",
            usn="1CS23199",
            department="CSE",
            graduation_year="2026"
        )
        UserRepository.verify_otp("spoof@test.edu", student_u.get("verification_otp") or "123456")
        
    # Attempt to login as PLATFORM_ADMIN using student credentials
    res = client.post("/api/auth/login", json={
        "username": "1CS23199",
        "password": "password123",
        "role": "PLATFORM_ADMIN"
    })
    # Must be 403 Forbidden or 401 Unauthorized, never 200
    assert res.status_code in [401, 403], f"Role spoofing must be rejected: {res.text}"
