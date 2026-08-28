import os
import time
from typing import Optional, Dict, Any, List
from enum import Enum
import jwt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "genesis_careerfit_jwt_secret_2026_secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 Days

security_bearer = HTTPBearer(auto_error=False)

class UserRole(str, Enum):
    PLATFORM_ADMIN = "PLATFORM_ADMIN"
    OPERATIONS = "OPERATIONS"
    PLACEMENT_OFFICER = "PLACEMENT_OFFICER"
    STUDENT = "STUDENT"
    # Backward compatibility aliases
    PLACEMENT_ADMIN = "PLACEMENT_ADMIN"
    ADMIN = "ADMIN"

def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    to_encode = data.copy()
    expire = time.time() + (expires_delta if expires_delta else ACCESS_TOKEN_EXPIRE_SECONDS)
    to_encode.update({"exp": expire, "iat": time.time()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please log in again."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token."
        )

# Functional alias for token decoding
decode_access_token = decode_token

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a Bearer token."
        )
    token = credentials.credentials
    return decode_token(token)

def require_platform_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforces that the current authenticated user is a Genesis Platform Administrator.
    """
    role = str(user.get("role", "")).upper()
    if role not in [UserRole.PLATFORM_ADMIN.value, UserRole.PLACEMENT_ADMIN.value, "ADMIN", "PLATFORM_OWNER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Genesis Platform Administrator privileges required."
        )
    return user

# Alias for require_platform_admin
require_admin = require_platform_admin

def require_operations_or_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforces that the user is either a Platform Admin or Operations team member.
    """
    role = str(user.get("role", "")).upper()
    if role not in [UserRole.PLATFORM_ADMIN.value, UserRole.PLACEMENT_ADMIN.value, "ADMIN", UserRole.OPERATIONS.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Operations or Administrator privileges required for dataset management."
        )
    return user

def require_officer(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforces that the current authenticated user is a Placement Officer or Admin.
    """
    role = str(user.get("role", "")).upper()
    if role not in [UserRole.PLACEMENT_OFFICER.value, UserRole.PLACEMENT_ADMIN.value, UserRole.PLATFORM_ADMIN.value, "ADMIN", UserRole.OPERATIONS.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Placement Officer or Administrative privileges required."
        )
    return user

def require_student(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Enforces that the current authenticated user is a student.
    """
    role = str(user.get("role", "")).upper()
    if role != UserRole.STUDENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Student account required."
        )
    return user

def verify_institution_scope(user: Dict[str, Any], target_institution_id: str) -> bool:
    """
    Validates tenant isolation. Platform Admin and Operations have global access.
    Placement Officers and Students are strictly confined to their own institution.
    """
    role = str(user.get("role", "")).upper()
    if role in [UserRole.PLATFORM_ADMIN.value, UserRole.PLACEMENT_ADMIN.value, "ADMIN", UserRole.OPERATIONS.value]:
        return True
    user_inst_id = user.get("institution_id")
    if not user_inst_id or not target_institution_id:
        return False
    return str(user_inst_id).strip() == str(target_institution_id).strip()

def require_institution_access(user: Dict[str, Any], target_institution_id: str) -> None:
    """
    Raises HTTP 403 if user cannot access the target institution.
    """
    if not verify_institution_scope(user, target_institution_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You do not have permission to access records for this institution."
        )

def require_student_access(user: Dict[str, Any], target_student_usn_or_id: str, student_record: Optional[Dict[str, Any]] = None) -> None:
    """
    Guarantees self-scoped student access and institution-scoped officer access.
    """
    role = str(user.get("role", "")).upper()
    if role in [UserRole.PLATFORM_ADMIN.value, UserRole.PLACEMENT_ADMIN.value, "ADMIN", UserRole.OPERATIONS.value]:
        return

    clean_target = str(target_student_usn_or_id).strip().upper()
    if role == UserRole.STUDENT.value:
        user_usn = str(user.get("usn") or user.get("username") or user.get("sub") or "").strip().upper()
        user_id = str(user.get("student_id") or user.get("id") or "").strip()
        if clean_target != user_usn and clean_target != user_id.upper():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You can only access your own profile and reports."
            )
        return

    if role == UserRole.PLACEMENT_OFFICER.value:
        if student_record:
            user_inst = str(user.get("institution_id", "")).strip()
            student_inst = str(student_record.get("institution_id", "")).strip()
            if user_inst and student_inst and user_inst != student_inst:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access Denied: Candidate belongs to another institution."
                )

GENESIS_OWNER_ADMIN_USER_ID = os.getenv("GENESIS_OWNER_ADMIN_USER_ID", "owner_admin_genesis_2026")

def verify_admin_credentials(username: str, password: str, db_user: Optional[Dict[str, Any]] = None) -> bool:
    """
    Verifies credentials for Platform Owner Admin via server-side trusted configuration.
    In production mode (ENVIRONMENT=production), development default credentials are strictly rejected.
    """
    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
    owner_email = os.getenv("GENESIS_OWNER_EMAIL", "").strip().lower()
    owner_pass = os.getenv("PLACEMENT_ADMIN_PASSWORD", "")
    u_clean = username.strip().lower()

    if is_prod:
        # In production: must use explicitly configured GENESIS_OWNER_EMAIL & PLACEMENT_ADMIN_PASSWORD
        if owner_email and owner_pass and u_clean == owner_email and password == owner_pass:
            if password not in ["admin2026", "genesis2026"]:
                return True
        if db_user and db_user.get("role") in ["PLACEMENT_ADMIN", "ADMIN", "PLATFORM_ADMIN"]:
            return db_user.get("password_hash") == password and password not in ["admin2026", "genesis2026"]
        return False

    # Development / Test Mode
    dev_owner = os.getenv("GENESIS_OWNER_EMAIL", "owner@genesiscareerfit.com").strip().lower()
    dev_user = os.getenv("PLACEMENT_ADMIN_USERNAME", "platformadmin").strip().lower()
    dev_pass = owner_pass or "admin2026"
    
    if (u_clean == dev_owner or u_clean == dev_user) and password in [dev_pass, "admin2026", "genesis2026"]:
        return True

    if db_user:
        return db_user.get("password_hash") in [password, "admin2026", "genesis2026"] and db_user.get("role") in ["PLACEMENT_ADMIN", "ADMIN", "PLATFORM_ADMIN"]
    
    return False

def verify_officer_credentials(username: str, password: str, db_user: Optional[Dict[str, Any]] = None) -> bool:
    """
    Verifies credentials for Placement Officer role.
    In production mode (ENVIRONMENT=production), development default credentials are strictly rejected.
    """
    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
    if is_prod:
        if db_user and db_user.get("role") == "PLACEMENT_OFFICER":
            if password not in ["genesis2026", "tpo123"]:
                return db_user.get("password_hash") == password
        officer_user = os.getenv("PLACEMENT_OFFICER_USERNAME", "").strip().lower()
        officer_pass = os.getenv("PLACEMENT_OFFICER_PASSWORD", "")
        if officer_user and officer_pass and officer_pass not in ["genesis2026", "tpo123"]:
            if username.strip().lower() == officer_user and password == officer_pass:
                return True
        return False

    # Development / Test Mode
    officer_user = os.getenv("PLACEMENT_OFFICER_USERNAME", "tpo").strip().lower()
    officer_pass = os.getenv("PLACEMENT_OFFICER_PASSWORD", "genesis2026")
    if username.strip().lower() == officer_user and password == officer_pass:
        return True

    if db_user:
        return db_user.get("password_hash") == password and db_user.get("role") == "PLACEMENT_OFFICER"
    
    return False

def verify_student_credentials(usn: str, password: str, known_students: Optional[List[Dict[str, Any]]] = None, db_user: Optional[Dict[str, Any]] = None) -> bool:
    """
    Verifies student credentials against persisted records or known candidates.
    In production mode (ENVIRONMENT=production), default passwords like 'student123' are rejected.
    """
    clean_usn = usn.strip().upper()
    if not clean_usn:
        return False
    
    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
    if is_prod:
        if db_user and db_user.get("role") == "STUDENT":
            if password not in ["student123", clean_usn, clean_usn.lower()]:
                return db_user.get("password_hash") == password
        return False

    # Development / Test Mode
    if db_user:
        return db_user.get("password_hash") == password or password in ["student123", clean_usn, clean_usn.lower()]
    
    if known_students is not None:
        exists = any(str(c.get("usn", "")).strip().upper() == clean_usn for c in known_students)
        if not exists:
            return False
            
    default_pass = os.getenv("DEFAULT_STUDENT_PASSWORD", "student123")
    return password in [default_pass, "student123", clean_usn, clean_usn.lower()]
