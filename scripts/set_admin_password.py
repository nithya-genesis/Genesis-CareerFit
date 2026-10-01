"""
Genesis CareerFit — Secure Platform Admin Password Setter
Enables setting or resetting the Platform Administrator password securely via masked prompt or environment variable.
Zero credentials or secrets are logged or printed to output.
"""
import os
import sys
import getpass

# Add project root to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.db_service import get_connection, init_database, UserRepository, InstitutionRepository


def main():
    print("============================================================")
    print("GENESIS CAREERFIT — SECURE PLATFORM ADMIN PASSWORD CONFIG")
    print("============================================================")
    
    init_database()
    inst = InstitutionRepository.get_or_create_default()
    
    # Check if admin user exists
    owner = UserRepository.get_by_username("admin")
    if not owner:
        UserRepository.create_user(
            institution_id=inst["id"],
            username="admin",
            full_name="Platform Owner Admin",
            email="admin@genesiscareerfit.ai",
            role="PLATFORM_ADMIN",
            password_hash="[TEMPORARY_INITIAL]"
        )
        print("[+] Admin account initialized with identifier: 'admin'")

    # Check environment variable first or prompt interactively
    new_password = os.getenv("NEW_ADMIN_PASSWORD") or os.getenv("ADMIN_PASSWORD")
    
    if not new_password:
        try:
            new_password = getpass.getpass("Enter new Platform Admin password (masked): ")
            confirm_password = getpass.getpass("Confirm new Platform Admin password (masked): ")
            if new_password != confirm_password:
                print("[!] Error: Passwords do not match. Aborting.")
                sys.exit(1)
        except (EOFError, KeyboardInterrupt):
            print("\n[!] Operation cancelled.")
            sys.exit(1)
            
    if not new_password or len(new_password.strip()) < 6:
        print("[!] Error: Password must be at least 6 characters.")
        sys.exit(1)

    # Secure update in database: updates ONLY the intended Platform Admin account
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE users SET password_hash = ?, role = 'PLATFORM_ADMIN' WHERE username = 'admin'",
            (new_password.strip(),)
        )
        conn.commit()
        print("[+] SUCCESS: Platform Admin password has been updated securely.")
        print("[+] Login Identifier: 'admin' or 'admin@genesiscareerfit.ai'")
        print("[+] Portal URL: /admin/login")
    finally:
        conn.close()

    print("============================================================")


if __name__ == "__main__":
    main()
