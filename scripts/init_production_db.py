"""
Genesis CareerFit — Production Database Initializer
Initializes the production SQLite database with all tables, compound indexes,
default institution, and the Platform Owner administrator account.
Safe to execute idempotently on production boot / deploy.
"""
import os
import sys

# Add project root to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.db_service import get_connection, init_database, InstitutionRepository, UserRepository, get_database_status

def main():
    print("============================================================")
    print("GENESIS CAREERFIT — PRODUCTION DATABASE INITIALIZATION")
    print("============================================================")
    
    # 1. Initialize schema & compound multi-tenant indexes
    init_database()
    print("[+] Relational database schema & compound indexes verified.")
    
    # 2. Verify / Seed Default Institution
    inst = InstitutionRepository.get_or_create_default()
    print(f"[+] Default Institution confirmed: {inst['name']} (Code: {inst['code']}, ID: {inst['id']})")
    
    # 3. Verify / Seed Platform Owner Admin
    owner = UserRepository.get_by_username("admin")
    if not owner:
        owner = UserRepository.create_user(
            institution_id=inst["id"],
            username="admin",
            full_name="Platform Owner Admin",
            email="admin@genesiscareerfit.ai",
            role="PLACEMENT_ADMIN",
            password_hash="genesis2026"
        )
        print("[+] Platform Owner Admin created: username='admin'")
    else:
        if owner.get("role") != "PLACEMENT_ADMIN":
            conn = get_connection()
            try:
                cur = conn.cursor()
                cur.execute("UPDATE users SET role = 'PLACEMENT_ADMIN' WHERE username = 'admin'")
                conn.commit()
            finally:
                conn.close()
            owner["role"] = "PLACEMENT_ADMIN"
        print(f"[+] Platform Owner Admin active: username='{owner.get('username')}' (Role: {owner.get('role')})")
        
    status = get_database_status()
    print(f"[+] Database status: {status.get('status')} ({status.get('tables_count')} tables verified)")
    print("============================================================")
    print("PRODUCTION DATABASE INITIALIZATION COMPLETE — SYSTEM READY")
    print("============================================================")

if __name__ == "__main__":
    main()
