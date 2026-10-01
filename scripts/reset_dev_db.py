"""
Genesis CareerFit — Development Database Reset Script
Cleans and re-initializes the development database for local testing and acceptance passes.
"""
import os
import sys

# Add project root to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.db_service import get_connection, init_database, InstitutionRepository, UserRepository

def main():
    print("============================================================")
    print("GENESIS CAREERFIT — RESET DEVELOPMENT DATABASE")
    print("============================================================")
    
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA foreign_keys = OFF;")
        # List tables to truncate
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [r[0] for r in cur.fetchall()]
        for t in tables:
            cur.execute(f"DELETE FROM {t};")
        cur.execute("PRAGMA foreign_keys = ON;")
        conn.commit()
        print(f"[+] Cleared data from {len(tables)} tables.")
    finally:
        conn.close()
        
    # Re-initialize
    init_database()
    inst = InstitutionRepository.get_or_create_default()
    UserRepository.get_or_create_platform_owner(inst["id"])
    print(f"[+] Development database reset complete with clean Platform Admin credentials.")

if __name__ == "__main__":
    main()
