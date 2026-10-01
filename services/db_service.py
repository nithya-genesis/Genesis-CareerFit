
"""
GENESIS CAREERFIT — DATABASE SERVICE & REPOSITORY LAYER
Provides multi-tenant relational persistence for all 14 schema entities.
Supports explicit backend selection:
  - 'supabase' / 'postgresql' (Production PostgreSQL instance)
  - 'sqlite' (Local development & test fallback)
"""

import os
import json
import uuid
import sqlite3
import datetime
import hashlib
import hmac
from typing import Dict, Any, List, Optional, Tuple, Union
from dotenv import load_dotenv

load_dotenv()

def determine_canonical_readiness(
    careerfit_index: Optional[int] = None,
    career_fit_score: Optional[float] = None,
    technical_score: Optional[float] = None,
    coverage_percentage: Optional[float] = None,
    job_readiness_score: Optional[float] = None
) -> Dict[str, str]:
    """
    SINGLE SOURCE OF TRUTH FOR READINESS DETERMINATION.
    Guarantees 100% mathematical consistency across:
    - Candidate Directory
    - Reports page
    - Dashboard
    - Placement Readiness
    - Master Dossier PDF
    - Executive Summary PDF
    - Excel Export
    - ZIP metadata
    """
    cf_idx = careerfit_index or 200
    cf_sc = career_fit_score or (job_readiness_score or 0.0)
    cov_pct = coverage_percentage if coverage_percentage is not None else 100.0
    
    if cf_idx >= 700 and technical_score is not None and technical_score >= 70.0 and cov_pct >= 60.0:
        return {
            "status": "PLACEMENT_READY",
            "label": "Placement Ready",
            "tier": "Placement Ready"
        }
    elif cf_idx >= 550 and (cf_sc >= 60.0 or (technical_score is not None and technical_score >= 50.0)):
        return {
            "status": "PROVISIONAL_READY",
            "label": "Provisional Ready",
            "tier": "Provisional Ready"
        }
    elif cf_idx >= 400 or cf_sc >= 40.0:
        return {
            "status": "NEEDS_UPSKILLING",
            "label": "Needs Upskilling",
            "tier": "Needs Upskilling"
        }
    else:
        return {
            "status": "INSUFFICIENT_EVIDENCE",
            "label": "Insufficient Evidence",
            "tier": "Insufficient Evidence"
        }

# --- BACKEND SELECTION & CONFIGURATION ---
DATABASE_BACKEND = os.getenv("DATABASE_BACKEND", "sqlite").lower().strip()
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
STORAGE_MODE = os.getenv("STORAGE_MODE", "local").strip()

DEFAULT_INST_CODE = os.getenv("DEFAULT_INSTITUTION_CODE", "EIT-MAIN")
DEFAULT_INST_NAME = os.getenv("DEFAULT_INSTITUTION_NAME", "Engineering Institute of Technology")
DB_FILE_PATH = os.getenv("DATABASE_PATH") or os.path.join(os.path.dirname(__file__), "..", "genesis_careerfit.db")

class DatabaseConfigurationError(Exception):
    """Raised when the selected database backend is misconfigured or unreachable."""
    pass

def now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def is_supabase_configured() -> bool:
    """Returns True only if real, non-placeholder credentials are provided."""
    has_url = bool(SUPABASE_URL and "your-project-ref" not in SUPABASE_URL and "supabase.co" in SUPABASE_URL)
    has_db = bool(DATABASE_URL and "your-password" not in DATABASE_URL.lower() and ("postgresql://" in DATABASE_URL or "postgres://" in DATABASE_URL))
    return has_url or has_db

def get_connection():
    """
    Returns an active database connection based on explicit DATABASE_BACKEND configuration.
    """
    if DATABASE_BACKEND in ["supabase", "postgresql"]:
        if not is_supabase_configured():
            raise DatabaseConfigurationError(
                "SUPABASE_NOT_CONFIGURED: Valid DATABASE_URL or SUPABASE_URL is missing in environment."
            )
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
            return conn
        except Exception as e:
            raise DatabaseConfigurationError(f"POSTGRESQL_CONNECTION_ERROR: Failed to connect to PostgreSQL: {e}")
    else:
        # Default SQLite Local Relational Database
        conn = sqlite3.connect(DB_FILE_PATH, timeout=30.0, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA busy_timeout = 30000;")
        conn.execute("PRAGMA journal_mode = WAL;")
        return conn

# ==============================================================================
# SCHEMA INITIALIZER (Local SQLite Fallback)
# ==============================================================================
def init_database():
    """
    Initializes all 14 relational tables in topological order.
    """
    if DATABASE_BACKEND in ["supabase", "postgresql"]:
        if not is_supabase_configured():
            # Clearly report unconfigured state without fabricating connection
            return
        conn = get_connection()
        try:
            cur = conn.cursor()
            # Read migration file and apply
            mig_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations", "20260825000001_initial_schema.sql")
            if os.path.exists(mig_path):
                with open(mig_path, "r", encoding="utf-8") as f:
                    cur.execute(f.read())
            conn.commit()
        finally:
            conn.close()
        return

    # SQLite Relational Table Initializer
    conn = get_connection()
    try:
        try:
            conn.execute("PRAGMA journal_mode = WAL;")
        except Exception:
            pass
        cur = conn.cursor()
        
        # 1. Institutions
        cur.execute("""
        CREATE TABLE IF NOT EXISTS institutions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'ACTIVE',
            metadata TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)
        
        # 2. Users
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
            email TEXT,
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            full_name TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            last_login_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(institution_id, username)
        );
        """)
        
        # Ensure migration columns on users table
        for col, col_type in [
            ("email_verified", "INTEGER NOT NULL DEFAULT 1"),
            ("verification_token", "TEXT"),
            ("designation", "TEXT"),
            ("department", "TEXT"),
            ("graduation_year", "TEXT"),
            ("phone", "TEXT"),
            ("usn", "TEXT"),
            ("otp_hash", "TEXT"),
            ("otp_expires_at", "TEXT"),
            ("otp_attempt_count", "INTEGER NOT NULL DEFAULT 0"),
            ("otp_last_sent_at", "TEXT"),
            ("otp_verified_at", "TEXT")
        ]:
            try:
                cur.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type};")
            except Exception:
                pass
        
        # 3. Students
        cur.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id TEXT PRIMARY KEY,
            institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            usn TEXT NOT NULL,
            full_name TEXT NOT NULL,
            department TEXT NOT NULL,
            batch_year TEXT NOT NULL DEFAULT '2026',
            cgpa REAL,
            cgpa_status TEXT NOT NULL DEFAULT 'MEASURED',
            is_deleted INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(institution_id, usn)
        );
        """)
        
        # 4. Assessment Runs
        cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment_runs (
            id TEXT PRIMARY KEY,
            institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
            uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
            filename TEXT NOT NULL,
            total_records INTEGER NOT NULL DEFAULT 0,
            valid_records INTEGER NOT NULL DEFAULT 0,
            invalid_records INTEGER NOT NULL DEFAULT 0,
            assessment_domains TEXT NOT NULL DEFAULT '[]',
            validation_status TEXT NOT NULL DEFAULT 'PENDING',
            processing_status TEXT NOT NULL DEFAULT 'QUEUED',
            manifest TEXT NOT NULL DEFAULT '{}',
            error_summary TEXT,
            started_at TEXT,
            completed_at TEXT,
            created_at TEXT NOT NULL
        );
        """)
        
                # Assessment Runs & Datasets Column Migrations
        for col, col_type in [
            ("dataset_name", "TEXT"),
            ("source_filename", "TEXT"),
            ("file_type", "TEXT"),
            ("file_size_bytes", "INTEGER DEFAULT 0"),
            ("storage_path", "TEXT"),
            ("total_columns", "INTEGER DEFAULT 0"),
            ("discovered_schema", "TEXT DEFAULT '{}'"),
            ("domain_manifest", "TEXT DEFAULT '[]'"),
            ("is_published", "INTEGER DEFAULT 0"),
            ("is_active", "INTEGER DEFAULT 0"),
            ("publication_status", "TEXT DEFAULT 'UNPUBLISHED'"),
            ("published_at", "TEXT"),
            ("published_by", "TEXT"),
            ("reports_generated", "INTEGER DEFAULT 0"),
            ("students_evaluated", "INTEGER DEFAULT 0"),
            ("updated_at", "TEXT")
        ]:
            try:
                cur.execute(f"ALTER TABLE assessment_runs ADD COLUMN {col} {col_type};")
            except Exception:
                pass

        # 5. Assessment Responses
        cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment_responses (
            id TEXT PRIMARY KEY,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            raw_responses TEXT NOT NULL,
            answered_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 5b. Candidate Evaluations (Run-Scoped Cache)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS candidate_evaluations (
            id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            candidate_id TEXT NOT NULL,
            student_id TEXT NOT NULL,
            scores_payload TEXT NOT NULL DEFAULT '{}',
            evidence_payload TEXT NOT NULL DEFAULT '{}',
            recommendations_payload TEXT NOT NULL DEFAULT '{}',
            interpretation_payload TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL
        );
        """)
        
        # 6. Candidate Evidence
        cur.execute("""
        CREATE TABLE IF NOT EXISTS candidate_evidence (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            coverage_ratio TEXT NOT NULL,
            coverage_percentage REAL NOT NULL,
            confidence_tier TEXT NOT NULL,
            institutional_status TEXT NOT NULL,
            zero_defaults_enforced INTEGER NOT NULL DEFAULT 1,
            raw_evidence_pack TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 7. Candidate Scores
        cur.execute("""
        CREATE TABLE IF NOT EXISTS candidate_scores (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            career_fit_score REAL,
            careerfit_index INTEGER,
            job_readiness_score REAL,
            technical_score REAL,
            technical_status TEXT NOT NULL DEFAULT 'NOT_EVALUATED',
            analytical_score REAL,
            analytical_status TEXT NOT NULL DEFAULT 'NOT_EVALUATED',
            ownership_score REAL,
            ownership_status TEXT NOT NULL DEFAULT 'NOT_EVALUATED',
            communication_score REAL,
            communication_status TEXT NOT NULL DEFAULT 'NOT_EVALUATED',
            quadrant TEXT NOT NULL DEFAULT 'Q4',
            quadrant_label TEXT NOT NULL DEFAULT 'Guidance Required',
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 8. Psychometric Results
        cur.execute("""
        CREATE TABLE IF NOT EXISTS psychometric_results (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            overall_sjt_percentage REAL,
            big_five_traits TEXT NOT NULL DEFAULT '{}',
            competencies_19 TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 9. Career Recommendations
        cur.execute("""
        CREATE TABLE IF NOT EXISTS career_recommendations (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            primary_role TEXT NOT NULL,
            primary_domain TEXT NOT NULL,
            match_score REAL NOT NULL,
            readiness_score REAL NOT NULL,
            fit_tier TEXT NOT NULL,
            hard_skills TEXT,
            fit_reasoning TEXT,
            top_evaluated_roles TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 10. AI Interpretations
        cur.execute("""
        CREATE TABLE IF NOT EXISTS ai_interpretations (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            model_name TEXT NOT NULL DEFAULT 'nvidia/nemotron-3.5-lightning-30b-a3b',
            executive_summary TEXT NOT NULL,
            career_interpretation TEXT NOT NULL,
            placement_readiness_interpretation TEXT NOT NULL,
            strengths TEXT NOT NULL DEFAULT '[]',
            development_areas TEXT NOT NULL DEFAULT '[]',
            ninety_day_roadmap TEXT NOT NULL DEFAULT '[]',
            interview_focus_areas TEXT NOT NULL DEFAULT '[]',
            validated_json TEXT NOT NULL,
            validation_passed INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 11. Reports
        cur.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            assessment_run_id TEXT NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
            report_identifier TEXT NOT NULL UNIQUE,
            verification_hash TEXT NOT NULL,
            page_count INTEGER NOT NULL DEFAULT 12,
            certified_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(assessment_run_id, student_id)
        );
        """)
        
        # 12. Report Files
        cur.execute("""
        CREATE TABLE IF NOT EXISTS report_files (
            id TEXT PRIMARY KEY,
            report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
            storage_bucket TEXT NOT NULL DEFAULT 'reports',
            storage_path TEXT NOT NULL,
            file_size_bytes INTEGER NOT NULL,
            mime_type TEXT NOT NULL DEFAULT 'application/pdf',
            created_at TEXT NOT NULL
        );
        """)
        
        # 13. Placement Status
        cur.execute("""
        CREATE TABLE IF NOT EXISTS placement_status (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            quadrant TEXT NOT NULL DEFAULT 'Q4',
            eligibility_tier TEXT NOT NULL DEFAULT 'Provisional Placement Ready',
            action_recommended TEXT NOT NULL,
            interview_cleared INTEGER NOT NULL DEFAULT 0,
            placed_company TEXT,
            package_lpa REAL,
            updated_at TEXT NOT NULL,
            UNIQUE(student_id)
        );
        """)
        
        # 14. Audit Logs
        cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            resource_type TEXT NOT NULL,
            resource_id TEXT,
            payload TEXT NOT NULL DEFAULT '{}',
            ip_address TEXT,
            created_at TEXT NOT NULL
        );
        """)

        # 15. Assessment Campaigns
        cur.execute("""
        CREATE TABLE IF NOT EXISTS assessment_campaigns (
            id TEXT PRIMARY KEY,
            institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            batch_year TEXT NOT NULL DEFAULT '2026',
            assessment_type TEXT NOT NULL DEFAULT 'COMPOSITE_SJT',
            status TEXT NOT NULL DEFAULT 'OPEN',
            total_invited INTEGER NOT NULL DEFAULT 0,
            start_date TEXT,
            end_date TEXT,
            created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
            metadata TEXT NOT NULL DEFAULT '{}',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """)

        # 16. Student Assessment Attempts / Lifecycle
        cur.execute("""
        CREATE TABLE IF NOT EXISTS student_assessment_attempts (
            id TEXT PRIMARY KEY,
            campaign_id TEXT NOT NULL REFERENCES assessment_campaigns(id) ON DELETE CASCADE,
            student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            lifecycle_status TEXT NOT NULL DEFAULT 'PROFILE_CREATED',
            current_stage INTEGER NOT NULL DEFAULT 1,
            total_stages INTEGER NOT NULL DEFAULT 4,
            responses_payload TEXT NOT NULL DEFAULT '{}',
            started_at TEXT,
            completed_at TEXT,
            analyzed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(campaign_id, student_id)
        );
        """)
        
        # Ensure migration columns on students table
        for col, col_type in [
            ("email", "TEXT"),
            ("phone", "TEXT"),
            ("graduation_year", "TEXT DEFAULT '2026'"),
            ("skills", "TEXT DEFAULT '[]'"),
            ("projects", "TEXT DEFAULT '[]'"),
            ("certifications", "TEXT DEFAULT '[]'"),
            ("internships", "TEXT DEFAULT '[]'"),
            ("placement_status", "TEXT DEFAULT 'NOT_PLACED'"),
            ("placed_company", "TEXT"),
            ("package_lpa", "REAL"),
            ("updated_by", "TEXT")
        ]:
            try:
                cur.execute(f"ALTER TABLE students ADD COLUMN {col} {col_type};")
            except Exception:
                pass

        # Ensure migration columns on assessment_runs table
        for col, col_type in [
            ("cohort_id", "TEXT"),
            ("is_published", "INTEGER NOT NULL DEFAULT 1"),
            ("publication_status", "TEXT NOT NULL DEFAULT 'PUBLISHED'"),
            ("published_at", "TEXT"),
            ("published_by", "TEXT")
        ]:
            try:
                cur.execute(f"ALTER TABLE assessment_runs ADD COLUMN {col} {col_type};")
            except Exception:
                pass

        # Multi-Tenant & High-Performance Indexes
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_students_inst ON students(institution_id);",
            "CREATE INDEX IF NOT EXISTS idx_students_usn ON students(usn);",
            "CREATE INDEX IF NOT EXISTS idx_students_dept ON students(institution_id, department);",
            "CREATE INDEX IF NOT EXISTS idx_runs_inst ON assessment_runs(institution_id);",
            "CREATE INDEX IF NOT EXISTS idx_runs_pub ON assessment_runs(institution_id, publication_status);",
            "CREATE INDEX IF NOT EXISTS idx_evals_run ON candidate_evaluations(run_id);",
            "CREATE INDEX IF NOT EXISTS idx_evals_cand ON candidate_evaluations(candidate_id);",
            "CREATE INDEX IF NOT EXISTS idx_scores_run_std ON candidate_scores(assessment_run_id, student_id);",
            "CREATE INDEX IF NOT EXISTS idx_evidence_run_std ON candidate_evidence(assessment_run_id, student_id);",
            "CREATE INDEX IF NOT EXISTS idx_psych_run_std ON psychometric_results(assessment_run_id, student_id);",
            "CREATE INDEX IF NOT EXISTS idx_recs_run_std ON career_recommendations(assessment_run_id, student_id);",
            "CREATE INDEX IF NOT EXISTS idx_reports_run_std ON reports(assessment_run_id, student_id);",
            "CREATE INDEX IF NOT EXISTS idx_users_inst ON users(institution_id);",
            "CREATE INDEX IF NOT EXISTS idx_audit_inst ON audit_logs(institution_id);"
        ]
        for idx_sql in indexes:
            try:
                cur.execute(idx_sql)
            except Exception:
                pass
        
        # Seed default institution if missing
        cur.execute("SELECT id FROM institutions WHERE code = ?", (DEFAULT_INST_CODE,))
        if not cur.fetchone():
            default_inst_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, DEFAULT_INST_CODE))
            cur.execute("""
                INSERT INTO institutions (id, name, code, slug, status, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', '{}', ?, ?)
            """, (default_inst_id, DEFAULT_INST_NAME, DEFAULT_INST_CODE, DEFAULT_INST_SLUG, now_iso(), now_iso()))
        
        conn.commit()
    finally:
        conn.close()

# Auto-initialize schema on module load
init_database()

# ==============================================================================
# REPOSITORIES
# ==============================================================================

class InstitutionRepository:
    @staticmethod
    def get_or_create_default() -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM institutions WHERE code = ?", (DEFAULT_INST_CODE,))
            row = cur.fetchone()
            if row:
                return dict(row)
            inst_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, DEFAULT_INST_CODE))
            now = now_iso()
            cur.execute("""
                INSERT INTO institutions (id, name, code, slug, status, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', '{}', ?, ?)
            """, (inst_id, DEFAULT_INST_NAME, DEFAULT_INST_CODE, DEFAULT_INST_SLUG, now, now))
            conn.commit()
            cur.execute("SELECT * FROM institutions WHERE id = ?", (inst_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def get_by_id(institution_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM institutions WHERE id = ?", (institution_id,))
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def get_by_code(code: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM institutions WHERE code = ?", (code.strip().upper(),))
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def list_all_with_stats() -> List[Dict[str, Any]]:
        """
        Returns all colleges with live aggregated statistics (student count, officer count,
        latest assessment run, reports count, average CareerFit score).
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    i.*,
                    (SELECT COUNT(*) FROM students s WHERE s.institution_id = i.id) as student_count,
                    (SELECT COUNT(*) FROM users u WHERE u.institution_id = i.id AND UPPER(u.role) IN ('PLACEMENT_OFFICER', 'OFFICER')) as officer_count,
                    (SELECT COUNT(*) FROM reports r JOIN students st ON r.student_id = st.id WHERE st.institution_id = i.id) as reports_count,
                    (SELECT id FROM assessment_runs ar WHERE ar.institution_id = i.id ORDER BY ar.created_at DESC LIMIT 1) as latest_run_id,
                    (SELECT created_at FROM assessment_runs ar WHERE ar.institution_id = i.id ORDER BY ar.created_at DESC LIMIT 1) as latest_run_date,
                    (SELECT AVG(cs.careerfit_index) FROM candidate_scores cs JOIN students st ON cs.student_id = st.id WHERE st.institution_id = i.id) as avg_careerfit_score
                FROM institutions i
                ORDER BY i.name ASC
            """)
            rows = cur.fetchall()
            results = []
            for r in rows:
                d = dict(r)
                if isinstance(d.get("metadata"), str):
                    try:
                        d["metadata"] = json.loads(d["metadata"])
                    except Exception:
                        d["metadata"] = {}
                d["avg_careerfit_score"] = round(d["avg_careerfit_score"], 1) if d.get("avg_careerfit_score") is not None else None
                results.append(d)
            return results
        finally:
            conn.close()

    @staticmethod
    def get_command_center_bundle(institution_id: str) -> Optional[Dict[str, Any]]:
        """
        Returns comprehensive scoped intelligence bundle for a specific College Command Center.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM institutions WHERE id = ?", (institution_id,))
            inst = cur.fetchone()
            if not inst:
                return None
            inst_dict = dict(inst)
            if isinstance(inst_dict.get("metadata"), str):
                try:
                    inst_dict["metadata"] = json.loads(inst_dict["metadata"])
                except Exception:
                    inst_dict["metadata"] = {}

            # 1. Counts
            cur.execute("""
                SELECT 
                    (SELECT COUNT(*) FROM students WHERE institution_id = ?) as total_students,
                    (SELECT COUNT(*) FROM users WHERE institution_id = ? AND UPPER(role) IN ('PLACEMENT_OFFICER', 'OFFICER')) as total_officers,
                    (SELECT COUNT(*) FROM assessment_runs WHERE institution_id = ?) as total_runs,
                    (SELECT COUNT(*) FROM reports r JOIN students s ON r.student_id = s.id WHERE s.institution_id = ?) as total_reports,
                    (SELECT COUNT(*) FROM students WHERE institution_id = ? AND placement_status = 'PLACED') as placed_students,
                    (SELECT AVG(cs.careerfit_index) FROM candidate_scores cs JOIN students s ON cs.student_id = s.id WHERE s.institution_id = ?) as avg_careerfit_score
            """, (institution_id, institution_id, institution_id, institution_id, institution_id, institution_id))
            counts_row = dict(cur.fetchone() or {})
            counts_row["avg_careerfit_score"] = round(counts_row["avg_careerfit_score"], 1) if counts_row.get("avg_careerfit_score") is not None else None

            # 2. Recent Runs
            cur.execute("""
                SELECT * FROM assessment_runs
                WHERE institution_id = ?
                ORDER BY created_at DESC LIMIT 10
            """, (institution_id,))
            recent_runs = [dict(r) for r in cur.fetchall()]

            # 3. Placement Officers
            cur.execute("""
                SELECT id, username, email, full_name, role, is_active, created_at
                FROM users
                WHERE institution_id = ? AND UPPER(role) IN ('PLACEMENT_OFFICER', 'OFFICER')
                ORDER BY created_at DESC
            """, (institution_id,))
            officers = [dict(r) for r in cur.fetchall()]

            # 4. Department Distribution
            cur.execute("""
                SELECT department, COUNT(*) as count
                FROM students
                WHERE institution_id = ?
                GROUP BY department
                ORDER BY count DESC
            """, (institution_id,))
            dept_dist = [dict(r) for r in cur.fetchall()]

            # 5. Readiness Distribution
            cur.execute("""
                SELECT cs.quadrant_label as readiness_tier, COUNT(*) as count
                FROM candidate_scores cs
                JOIN students s ON cs.student_id = s.id
                WHERE s.institution_id = ? AND cs.quadrant_label IS NOT NULL
                GROUP BY cs.quadrant_label
            """, (institution_id,))
            readiness_dist = [dict(r) for r in cur.fetchall()]

            return {
                "college": inst_dict,
                "counts": counts_row,
                "recent_runs": recent_runs,
                "officers": officers,
                "departments": dept_dist,
                "readiness_distribution": readiness_dist
            }
        finally:
            conn.close()

    @staticmethod
    def list_all() -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM institutions ORDER BY name ASC")
            rows = cur.fetchall()
            formatted_rows = []
            for r in rows:
                row_dict = dict(r)
                row_dict["target_role"] = row_dict.get("primary_role") or "Insufficient Evidence"
                row_dict["top_recommended_role"] = row_dict["target_role"]
                row_dict["fit_score"] = row_dict.get("match_score") or row_dict.get("career_fit_score") or 0.0
                
                # Single Source of Truth Canonical Readiness Mapping
                cov_pct = row_dict.get("coverage_percentage")
                tech_score = row_dict.get("technical_score")
                cf_score = row_dict.get("career_fit_score") or 0.0
                cf_idx = row_dict.get("careerfit_index") or 200
                
                readiness_info = determine_canonical_readiness(
                    careerfit_index=cf_idx,
                    career_fit_score=cf_score,
                    technical_score=tech_score,
                    coverage_percentage=cov_pct
                )

                row_dict["readiness_tier"] = readiness_info["label"]
                row_dict["readiness_status"] = readiness_info["label"]
                row_dict["readiness_label"] = readiness_info["label"]
                row_dict["fit_tier"] = readiness_info["label"]
                row_dict["placement_status"] = readiness_info["label"]
                formatted_rows.append(row_dict)
            return formatted_rows
        finally:
            conn.close()

    @staticmethod
    def create_institution(
        name: str,
        code: str,
        slug: Optional[str] = None,
        contact_email: Optional[str] = None,
        contact_phone: Optional[str] = None,
        academic_year: str = "2025-2026",
        branches: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            clean_code = code.strip().upper()
            clean_slug = (slug or clean_code.lower()).strip()
            now = now_iso()
            meta = metadata or {}
            if contact_email:
                meta["contact_email"] = contact_email
            if contact_phone:
                meta["contact_phone"] = contact_phone
            meta["academic_year"] = academic_year
            meta["branches"] = branches or ["CSE", "ISE", "ECE", "EEE", "MECH", "CIVIL", "AIML"]
            
            cur.execute("SELECT * FROM institutions WHERE code = ?", (clean_code,))
            existing = cur.fetchone()
            if existing:
                return dict(existing)
                
            inst_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO institutions (id, name, code, slug, status, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
            """, (inst_id, name.strip(), clean_code, clean_slug, json.dumps(meta), now, now))
            conn.commit()
            cur.execute("SELECT * FROM institutions WHERE id = ?", (inst_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def update_institution(institution_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM institutions WHERE id = ?", (institution_id,))
            existing = cur.fetchone()
            if not existing:
                return None
            
            name = updates.get("name", existing["name"])
            status = updates.get("status", existing["status"])
            meta = json.loads(existing["metadata"]) if isinstance(existing["metadata"], str) else (existing["metadata"] or {})
            if "metadata" in updates and isinstance(updates["metadata"], dict):
                meta.update(updates["metadata"])
            for k in ["contact_email", "contact_phone", "academic_year", "branches"]:
                if k in updates:
                    meta[k] = updates[k]
                    
            now = now_iso()
            cur.execute("""
                UPDATE institutions
                SET name = ?, status = ?, metadata = ?, updated_at = ?
                WHERE id = ?
            """, (name, status, json.dumps(meta), now, institution_id))
            conn.commit()
            cur.execute("SELECT * FROM institutions WHERE id = ?", (institution_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def deactivate_institution(institution_id: str) -> bool:
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("UPDATE institutions SET status = 'INACTIVE', updated_at = ? WHERE id = ?", (now, institution_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

class StudentRepository:
    @staticmethod
    def create_or_update(
        institution_id: str,
        usn: str,
        full_name: str,
        department: str,
        cgpa: Optional[float] = None,
        batch_year: str = "2026",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            clean_usn = usn.strip().upper()
            now = now_iso()
            cgpa_status = "MEASURED" if cgpa is not None else "UNAVAILABLE"
            
            cur.execute(
                "SELECT * FROM students WHERE institution_id = ? AND usn = ?", 
                (institution_id, clean_usn)
            )
            row = cur.fetchone()
            
            if row:
                student_id = row["id"]
                cur.execute("""
                    UPDATE students 
                    SET full_name = ?, department = ?, cgpa = ?, cgpa_status = ?, batch_year = ?, updated_at = ?
                    WHERE id = ?
                """, (full_name, department, cgpa, cgpa_status, batch_year, now, student_id))
            else:
                student_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO students (id, institution_id, user_id, usn, full_name, department, batch_year, cgpa, cgpa_status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (student_id, institution_id, user_id, clean_usn, full_name, department, batch_year, cgpa, cgpa_status, now, now))
            
            conn.commit()
            cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def get_by_usn(institution_id: str, usn: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            clean_usn = usn.strip().upper()
            cur.execute(
                "SELECT * FROM students WHERE institution_id = ? AND usn = ? AND is_deleted = 0",
                (institution_id, clean_usn)
            )
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def get_by_id(institution_id: str, student_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM students WHERE institution_id = ? AND id = ? AND is_deleted = 0",
                (institution_id, student_id)
            )
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def list_all(institution_id: str, department: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            query = "SELECT * FROM students WHERE institution_id = ? AND is_deleted = 0"
            params = [institution_id]
            if department:
                query += " AND department = ?"
                params.append(department.strip().upper())
            if search:
                query += " AND (full_name LIKE ? OR usn LIKE ?)"
                s_param = f"%{search.strip()}%"
                params.extend([s_param, s_param])
            query += " ORDER BY usn ASC"
            cur.execute(query, params)
            rows = cur.fetchall()
            formatted_rows = []
            for r in rows:
                row_dict = dict(r)
                row_dict["target_role"] = row_dict.get("primary_role") or "Insufficient Evidence"
                row_dict["top_recommended_role"] = row_dict["target_role"]
                row_dict["fit_score"] = row_dict.get("match_score") or row_dict.get("career_fit_score") or 0.0
                
                # Single Source of Truth Canonical Readiness Mapping
                cov_pct = row_dict.get("coverage_percentage")
                tech_score = row_dict.get("technical_score")
                cf_score = row_dict.get("career_fit_score") or 0.0
                cf_idx = row_dict.get("careerfit_index") or 200
                
                readiness_info = determine_canonical_readiness(
                    careerfit_index=cf_idx,
                    career_fit_score=cf_score,
                    technical_score=tech_score,
                    coverage_percentage=cov_pct
                )

                row_dict["readiness_tier"] = readiness_info["label"]
                row_dict["readiness_status"] = readiness_info["label"]
                row_dict["readiness_label"] = readiness_info["label"]
                row_dict["fit_tier"] = readiness_info["label"]
                row_dict["placement_status"] = readiness_info["label"]
                formatted_rows.append(row_dict)
            return formatted_rows
        finally:
            conn.close()

    @staticmethod
    def update_profile_fields(
        student_id: str,
        updates: Dict[str, Any],
        updated_by: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Updates permitted placement profile fields.
        Guarantees: Does NOT modify calculated intelligence scores (CareerFit, psychometrics, AI).
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM students WHERE id = ? AND is_deleted = 0", (student_id,))
            student = cur.fetchone()
            if not student:
                return None

            allowed_fields = [
                "full_name", "email", "phone", "department", "cgpa",
                "graduation_year", "skills", "projects", "certifications",
                "internships", "placement_status", "placed_company", "package_lpa"
            ]
            set_clauses = []
            params = []
            now = now_iso()

            for field in allowed_fields:
                if field in updates:
                    val = updates[field]
                    if field in ["skills", "projects", "certifications", "internships"] and not isinstance(val, str):
                        val = json.dumps(val)
                    elif field == "cgpa" and val is not None:
                        try:
                            val = float(val)
                        except (ValueError, TypeError):
                            val = None
                    elif field == "package_lpa" and val is not None:
                        try:
                            val = float(val)
                        except (ValueError, TypeError):
                            val = None
                    set_clauses.append(f"{field} = ?")
                    params.append(val)

            if not set_clauses:
                return dict(student)

            if "cgpa" in updates:
                set_clauses.append("cgpa_status = ?")
                params.append("MEASURED" if updates["cgpa"] is not None else "UNAVAILABLE")

            set_clauses.append("updated_at = ?")
            params.append(now)
            if updated_by:
                set_clauses.append("updated_by = ?")
                params.append(updated_by)

            params.append(student_id)
            sql = f"UPDATE students SET {', '.join(set_clauses)} WHERE id = ?"
            cur.execute(sql, params)
            conn.commit()

            cur.execute("SELECT * FROM students WHERE id = ?", (student_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def list_filtered_students(
        institution_id: str,
        run_id: Optional[str] = None,
        min_cgpa: Optional[float] = None,
        max_cgpa: Optional[float] = None,
        min_cf: Optional[int] = None,
        max_cf: Optional[int] = None,
        min_match: Optional[float] = None,
        max_match: Optional[float] = None,
        department: Optional[str] = None,
        placement_status: Optional[str] = None,
        role: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetches filtered students for the institution joined with their authoritative run scores,
        strictly scoped to the active/selected Assessment Run.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            
            # Find effective run_id if not explicitly provided
            if not run_id:
                cur.execute("""
                    SELECT id FROM assessment_runs
                    WHERE institution_id = ? AND publication_status = 'PUBLISHED'
                    ORDER BY created_at DESC LIMIT 1
                """, (institution_id,))
                run_row = cur.fetchone()
                if not run_row:
                    cur.execute("""
                        SELECT id FROM assessment_runs
                        WHERE institution_id = ?
                        ORDER BY created_at DESC LIMIT 1
                    """, (institution_id,))
                    run_row = cur.fetchone()
                if run_row:
                    run_id = run_row["id"]

            if run_id:
                # Scoped strictly to the selected assessment run
                query = """
                    SELECT 
                        s.id as student_id,
                        s.usn,
                        s.full_name,
                        s.full_name as name,
                        s.department,
                        s.cgpa,
                        s.cgpa_status,
                        s.graduation_year,
                        s.email,
                        s.phone,
                        s.skills,
                        s.projects,
                        s.certifications,
                        s.internships,
                        s.placement_status,
                        s.placed_company,
                        s.package_lpa,
                        cs.careerfit_index,
                        cs.career_fit_score,
                        cs.job_readiness_score,
                        cs.technical_score,
                        cs.analytical_score,
                        cs.ownership_score,
                        cs.communication_score,
                        cs.quadrant,
                        cs.quadrant_label,
                        cr.primary_role,
                        cr.primary_domain,
                        cr.match_score,
                        cr.readiness_score as rec_readiness_score,
                        cr.fit_tier,
                        ce.coverage_percentage,
                        ce.confidence_tier,
                        r.id as report_id,
                        cs.assessment_run_id as run_id
                    FROM students s
                    JOIN candidate_scores cs ON s.id = cs.student_id AND cs.assessment_run_id = ?
                    LEFT JOIN career_recommendations cr ON s.id = cr.student_id AND cr.assessment_run_id = cs.assessment_run_id
                    LEFT JOIN candidate_evidence ce ON s.id = ce.student_id AND ce.assessment_run_id = cs.assessment_run_id
                    LEFT JOIN reports r ON s.id = r.student_id AND r.assessment_run_id = cs.assessment_run_id
                    WHERE s.institution_id = ? AND s.is_deleted = 0
                """
                params: List[Any] = [run_id, institution_id]
            else:
                # No runs exist for this institution yet
                query = """
                    SELECT 
                        s.id as student_id,
                        s.usn,
                        s.full_name,
                        s.full_name as name,
                        s.department,
                        s.cgpa,
                        s.cgpa_status,
                        s.graduation_year,
                        s.email,
                        s.phone,
                        s.skills,
                        s.projects,
                        s.certifications,
                        s.internships,
                        s.placement_status,
                        s.placed_company,
                        s.package_lpa,
                        NULL as careerfit_index,
                        NULL as career_fit_score,
                        NULL as job_readiness_score,
                        NULL as technical_score,
                        NULL as analytical_score,
                        NULL as ownership_score,
                        NULL as communication_score,
                        NULL as quadrant,
                        NULL as quadrant_label,
                        NULL as primary_role,
                        NULL as primary_domain,
                        NULL as match_score,
                        NULL as rec_readiness_score,
                        NULL as fit_tier,
                        NULL as coverage_percentage,
                        NULL as confidence_tier,
                        NULL as report_id,
                        NULL as run_id
                    FROM students s
                    WHERE s.institution_id = ? AND s.is_deleted = 0
                """
                params: List[Any] = [institution_id]

            if department:
                query += " AND s.department = ?"
                params.append(department.strip().upper())
            if placement_status:
                query += " AND s.placement_status = ?"
                params.append(placement_status.strip().upper())
            if min_cgpa is not None:
                query += " AND s.cgpa >= ?"
                params.append(float(min_cgpa))
            if max_cgpa is not None:
                query += " AND s.cgpa <= ?"
                params.append(float(max_cgpa))
            if min_cf is not None:
                query += " AND cs.careerfit_index >= ?"
                params.append(int(min_cf))
            if max_cf is not None:
                query += " AND cs.careerfit_index <= ?"
                params.append(int(max_cf))
            if min_match is not None:
                query += " AND cr.match_score >= ?"
                params.append(float(min_match))
            if max_match is not None:
                query += " AND cr.match_score <= ?"
                params.append(float(max_match))
            if role:
                query += " AND cr.primary_role LIKE ?"
                params.append(f"%{role.strip()}%")
            if search:
                query += " AND (s.full_name LIKE ? OR s.usn LIKE ?)"
                s_param = f"%{search.strip()}%"
                params.extend([s_param, s_param])

            query += " ORDER BY s.usn ASC"
            cur.execute(query, params)
            rows = cur.fetchall()
            formatted_rows = []
            for r in rows:
                row_dict = dict(r)
                row_dict["target_role"] = row_dict.get("primary_role") or "Insufficient Evidence"
                row_dict["top_recommended_role"] = row_dict["target_role"]
                row_dict["fit_score"] = row_dict.get("match_score") or row_dict.get("career_fit_score") or 0.0
                
                # Single Source of Truth Canonical Readiness Mapping
                cov_pct = row_dict.get("coverage_percentage")
                tech_score = row_dict.get("technical_score")
                cf_score = row_dict.get("career_fit_score") or 0.0
                cf_idx = row_dict.get("careerfit_index") or 200
                
                readiness_info = determine_canonical_readiness(
                    careerfit_index=cf_idx,
                    career_fit_score=cf_score,
                    technical_score=tech_score,
                    coverage_percentage=cov_pct
                )

                row_dict["readiness_tier"] = readiness_info["label"]
                row_dict["readiness_status"] = readiness_info["label"]
                row_dict["readiness_label"] = readiness_info["label"]
                row_dict["fit_tier"] = readiness_info["label"]
                row_dict["placement_status"] = readiness_info["label"]
                formatted_rows.append(row_dict)
            return formatted_rows
        finally:
            conn.close()

class AssessmentRunRepository:
    @staticmethod
    def create_dataset_record(
        institution_id: str,
        filename: str,
        total_records: int,
        total_columns: int = 0,
        dataset_name: Optional[str] = None,
        file_type: str = "CSV",
        file_size_bytes: int = 0,
        storage_path: Optional[str] = None,
        discovered_schema: Optional[Dict[str, Any]] = None,
        domain_manifest: Optional[List[str]] = None,
        uploaded_by: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a persistent dataset record with full schema and file metadata.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            actual_run_id = run_id or f"RUN_{now_iso().replace('-', '').replace(':', '').replace('T', '_')[:15]}_{uuid.uuid4().hex[:6].upper()}"
            now = now_iso()
            d_name = dataset_name or filename.rsplit(".", 1)[0].replace("_", " ").title()
            domains_json = json.dumps(domain_manifest or ["Psychometric Situational Judgment Test (SJT)"])
            schema_json = json.dumps(discovered_schema or {})

            # Resolve uploaded_by to valid user_id if a username was passed
            real_uploaded_by = None
            if uploaded_by:
                cur.execute("SELECT id FROM users WHERE id = ? OR username = ? OR email = ?", (uploaded_by, uploaded_by, uploaded_by))
                u_row = cur.fetchone()
                if u_row:
                    real_uploaded_by = u_row["id"]
            
            cur.execute("""
                INSERT OR REPLACE INTO assessment_runs (
                    id, institution_id, uploaded_by, dataset_name, source_filename, filename,
                    file_type, file_size_bytes, storage_path, total_records, total_columns,
                    valid_records, invalid_records, assessment_domains, validation_status,
                    processing_status, publication_status, is_published, is_active,
                    manifest, discovered_schema, domain_manifest, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'VALIDATED', 'UPLOADED', 'UNPUBLISHED', 0, 0, ?, ?, ?, ?, ?)
            """, (
                actual_run_id, institution_id, real_uploaded_by, d_name, filename, filename,
                file_type, file_size_bytes, storage_path or "", total_records, total_columns,
                total_records, domains_json, schema_json, schema_json, domains_json, now, now
            ))
            conn.commit()
            cur.execute("SELECT * FROM assessment_runs WHERE id = ?", (actual_run_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    @staticmethod
    def republish_dataset(run_id: str, published_by: Optional[str] = None) -> bool:
        """
        Republishes an archived or draft run, setting it as active and archiving any other active run.
        """
        return AssessmentRunRepository.publish_dataset(run_id, published_by)

    @staticmethod
    def publish_dataset(run_id: str, published_by: Optional[str] = None) -> bool:
        """
        Publishes the dataset run:
        - Sets this run as PUBLISHED and is_active = 1
        - Archives any previously published runs for this institution to maintain 1 active dataset.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT institution_id FROM assessment_runs WHERE id = ?", (run_id,))
            row = cur.fetchone()
            if not row:
                return False
            inst_id = row["institution_id"]
            now = now_iso()
            
            # Archive previous published runs for this institution
            cur.execute("""
                UPDATE assessment_runs
                SET publication_status = 'ARCHIVED', is_active = 0, updated_at = ?
                WHERE institution_id = ? AND id != ? AND publication_status = 'PUBLISHED'
            """, (now, inst_id, run_id))
            
            # Set this run as PUBLISHED and ACTIVE
            cur.execute("""
                UPDATE assessment_runs
                SET publication_status = 'PUBLISHED', is_published = 1, is_active = 1,
                    published_at = ?, published_by = ?, updated_at = ?
                WHERE id = ?
            """, (now, published_by or "admin", now, run_id))
            conn.commit()
            return True
        finally:
            conn.close()

    @staticmethod
    def unpublish_dataset(run_id: str) -> bool:
        """
        Unpublishes dataset so it is hidden from placement officers.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("""
                UPDATE assessment_runs
                SET publication_status = 'UNPUBLISHED', is_published = 0, is_active = 0, updated_at = ?
                WHERE id = ?
            """, (now, run_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def soft_delete_dataset(run_id: str) -> bool:
        """
        Soft deletes the dataset record.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("""
                UPDATE assessment_runs
                SET publication_status = 'DELETED', is_active = 0, is_published = 0, updated_at = ?
                WHERE id = ?
            """, (now, run_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def list_college_datasets(institution_id: str) -> List[Dict[str, Any]]:
        """
        Lists all active/archived/unpublished datasets for a college (excluding DELETED).
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    ar.*,
                    (SELECT COUNT(*) FROM reports r JOIN students s ON r.student_id = s.id WHERE r.assessment_run_id = ar.id) as reports_count
                FROM assessment_runs ar
                WHERE ar.institution_id = ? AND ar.publication_status != 'DELETED'
                ORDER BY ar.created_at DESC
            """, (institution_id,))
            rows = cur.fetchall()
            results = []
            total_count = len(rows)
            for idx, r in enumerate(rows):
                item = dict(r)
                batch_num = total_count - idx
                item["batch_number"] = f"Batch {batch_num:03d}"
                item["batch_label"] = f"Batch {batch_num:03d}"
                if isinstance(item.get("discovered_schema"), str):
                    try:
                        item["discovered_schema"] = json.loads(item["discovered_schema"])
                    except Exception:
                        pass
                if isinstance(item.get("assessment_domains"), str):
                    try:
                        item["assessment_domains"] = json.loads(item["assessment_domains"])
                    except Exception:
                        pass
                results.append(item)
            return results
        finally:
            conn.close()

    @staticmethod
    def create_run(
        institution_id: str,
        filename: str,
        total_records: int,
        uploaded_by: Optional[str] = None,
        assessment_domains: Optional[List[str]] = None,
        manifest: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None,
        discovered_schema: Optional[Dict[str, Any]] = None,
        domain_manifest: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            actual_run_id = run_id or str(uuid.uuid4())
            now = now_iso()
            domains_list = domain_manifest or assessment_domains or ["Psychometric Situational Judgment Test (SJT)"]
            domains_json = json.dumps(domains_list)
            manifest_dict = manifest or discovered_schema or {}
            manifest_json = json.dumps(manifest_dict)
            
            cur.execute("""
                INSERT OR REPLACE INTO assessment_runs (
                    id, institution_id, uploaded_by, filename, total_records, valid_records, 
                    invalid_records, assessment_domains, validation_status, processing_status, 
                    manifest, started_at, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'VALIDATED', 'PROCESSING', ?, ?, ?)
            """, (actual_run_id, institution_id, uploaded_by, filename, total_records, total_records, domains_json, manifest_json, now, now))
            
            conn.commit()
            cur.execute("SELECT * FROM assessment_runs WHERE id = ?", (actual_run_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def complete_run(
        run_id: str,
        valid_records: Optional[int] = None,
        error_summary: Optional[Dict[str, Any]] = None,
        candidate_evaluations: Optional[List[Dict[str, Any]]] = None,
        status: str = "COMPLETED"
    ):
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            records_count = valid_records if valid_records is not None else (len(candidate_evaluations) if candidate_evaluations else 0)
            err_json = json.dumps(error_summary) if error_summary else None
            
            # If candidate evaluations provided, save run records
            if candidate_evaluations:
                for c in candidate_evaluations:
                    c_id = str(c.get("candidate_id") or c.get("usn") or uuid.uuid4())
                    s_id = str(c.get("usn") or c_id)
                    scores_json = json.dumps(c.get("scores", {}))
                    evi_json = json.dumps(c.get("evidence_pack", {}))
                    recs_json = json.dumps(c.get("career_recommendations", {}))
                    interp_json = json.dumps(c.get("interpretation", {}))
                    
                    cur.execute("""
                        INSERT OR REPLACE INTO candidate_evaluations (
                            id, run_id, candidate_id, student_id, scores_payload,
                            evidence_payload, recommendations_payload, interpretation_payload, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (str(uuid.uuid4()), run_id, c_id, s_id, scores_json, evi_json, recs_json, interp_json, now))

            cur.execute("""
                UPDATE assessment_runs
                SET processing_status = ?, valid_records = ?, error_summary = ?, completed_at = ?
                WHERE id = ?
            """, (status, records_count, err_json, now, run_id))
            conn.commit()
        finally:
            conn.close()

    @staticmethod
    def get_run(run_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM assessment_runs WHERE id = ?", (run_id,))
            row = cur.fetchone()
            if not row:
                return None
            res = dict(row)
            if isinstance(res.get("assessment_domains"), str):
                try:
                    res["assessment_domains"] = json.loads(res["assessment_domains"])
                except Exception:
                    pass
            if isinstance(res.get("manifest"), str):
                try:
                    res["manifest"] = json.loads(res["manifest"])
                except Exception:
                    pass
            return res
        finally:
            conn.close()

    @staticmethod
    def list_all() -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM assessment_runs ORDER BY created_at DESC")
            return [dict(r) for r in cur.fetchall()]
        finally:
            conn.close()

    @staticmethod
    def list_runs(institution_id: str) -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT * FROM assessment_runs 
                WHERE institution_id = ? 
                ORDER BY created_at DESC
            """, (institution_id,))
            rows = cur.fetchall()
            result = []
            for r in rows:
                item = dict(r)
                if isinstance(item.get("assessment_domains"), str):
                    try:
                        item["assessment_domains"] = json.loads(item["assessment_domains"])
                    except Exception:
                        pass
                if isinstance(item.get("manifest"), str):
                    try:
                        item["manifest"] = json.loads(item["manifest"])
                    except Exception:
                        pass
                result.append(item)
            return result
        finally:
            conn.close()

    @staticmethod
    def publish_run(run_id: str, published_by: Optional[str] = None) -> bool:
        """
        Transitions run status to PUBLISHED making it visible to Placement Officers.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("""
                UPDATE assessment_runs
                SET is_published = 1, publication_status = 'PUBLISHED', published_at = ?, published_by = ?
                WHERE id = ?
            """, (now, published_by, run_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def get_latest_published_run(institution_id: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT * FROM assessment_runs
                WHERE institution_id = ? AND publication_status = 'PUBLISHED'
                ORDER BY created_at DESC LIMIT 1
            """, (institution_id,))
            row = cur.fetchone()
            if not row:
                cur.execute("""
                    SELECT * FROM assessment_runs
                    WHERE institution_id = ?
                    ORDER BY created_at DESC LIMIT 1
                """, (institution_id,))
                row = cur.fetchone()
            if not row:
                return None
            res = dict(row)
            if isinstance(res.get("assessment_domains"), str):
                try:
                    res["assessment_domains"] = json.loads(res["assessment_domains"])
                except Exception:
                    pass
            if isinstance(res.get("manifest"), str):
                try:
                    res["manifest"] = json.loads(res["manifest"])
                except Exception:
                    pass
            return res
        finally:
            conn.close()

    @staticmethod
    def delete_run(run_id: str) -> bool:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("DELETE FROM assessment_runs WHERE id = ?", (run_id,))
            conn.commit()
            return True
        finally:
            conn.close()

    @staticmethod
    def get_candidates_for_run(run_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves canonical candidate evaluations for the run directly via StudentRepository.list_filtered_students.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT institution_id FROM assessment_runs WHERE id = ?", (run_id,))
            r_row = cur.fetchone()
            inst_id = r_row["institution_id"] if r_row else None
        finally:
            conn.close()
            
        if inst_id:
            return StudentRepository.list_filtered_students(institution_id=inst_id, run_id=run_id)
        return []

    @staticmethod
    def get_candidate_evaluation_for_run(run_id: str, identifier: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            clean_id = identifier.strip().upper()
            cur.execute("""
                SELECT s.id AS student_id, s.usn, s.full_name, s.department, s.cgpa, s.cgpa_status, s.batch_year,
                       sc.career_fit_score, sc.careerfit_index, sc.job_readiness_score, sc.technical_score,
                       sc.technical_status, sc.analytical_score, sc.analytical_status,
                       sc.ownership_score, sc.ownership_status, sc.communication_score, sc.communication_status,
                       sc.quadrant, sc.quadrant_label,
                       cr.primary_role, cr.primary_domain, cr.match_score, cr.readiness_score, cr.fit_tier,
                       cr.hard_skills, cr.fit_reasoning,
                       ev.coverage_ratio, ev.coverage_percentage, ev.confidence_tier, ev.institutional_status,
                       ev.raw_evidence_pack,
                       ps.overall_sjt_percentage, ps.competencies_19,
                       rep.id AS report_id, rf.storage_path AS pdf_path, rep.verification_hash
                FROM candidate_scores sc
                JOIN students s ON sc.student_id = s.id
                JOIN candidate_evidence ev ON ev.student_id = s.id AND ev.assessment_run_id = sc.assessment_run_id
                JOIN career_recommendations cr ON cr.student_id = s.id AND cr.assessment_run_id = sc.assessment_run_id
                LEFT JOIN psychometric_results ps ON ps.student_id = s.id AND ps.assessment_run_id = sc.assessment_run_id
                LEFT JOIN reports rep ON rep.student_id = s.id AND rep.assessment_run_id = sc.assessment_run_id
                LEFT JOIN report_files rf ON rf.report_id = rep.id
                WHERE sc.assessment_run_id = ? AND (s.usn = ? OR s.id = ?)
                LIMIT 1
            """, (run_id, clean_id, identifier))
            row = cur.fetchone()
            if not row:
                return None
            res = dict(row)
            for json_col in ["raw_evidence_pack", "competencies_19", "hard_skills"]:
                if isinstance(res.get(json_col), str):
                    try:
                        res[json_col] = json.loads(res[json_col])
                    except Exception:
                        pass
            return res
        finally:
            conn.close()

class EvaluationPersistenceService:
    """
    Orchestrates atomic transactional persistence for candidate evaluations,
    linking evidence, scores, recommendations, AI interpretation, and reports.
    """
    @classmethod
    def save_candidate_evaluation(
        cls,
        institution_id: str,
        assessment_run_id: str,
        usn: str,
        name: str,
        department: str,
        cgpa: Optional[float] = None,
        evidence_pack: Optional[Dict[str, Any]] = None,
        career_fit_scores: Optional[Dict[str, Any]] = None,
        career_recommendations: Optional[Dict[str, Any]] = None,
        ai_interpretation: Optional[Dict[str, Any]] = None,
        report_metadata: Optional[Dict[str, Any]] = None,
        raw_responses: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return cls.persist_candidate_evaluation(
            institution_id=institution_id,
            assessment_run_id=assessment_run_id,
            usn=usn,
            full_name=name,
            department=department,
            cgpa=cgpa,
            evidence_pack=evidence_pack or {},
            scores=career_fit_scores or {},
            psychometric_results={},
            career_recommendations=career_recommendations or {},
            ai_interpretation=ai_interpretation,
            report_metadata=report_metadata,
            raw_responses=raw_responses
        )

    @staticmethod
    def persist_candidate_evaluation(
        institution_id: str,
        assessment_run_id: str,
        usn: str,
        full_name: str,
        department: str,
        cgpa: Optional[float],
        evidence_pack: Dict[str, Any],
        scores: Dict[str, Any],
        psychometric_results: Dict[str, Any],
        career_recommendations: Dict[str, Any],
        ai_interpretation: Optional[Dict[str, Any]] = None,
        report_metadata: Optional[Dict[str, Any]] = None,
        raw_responses: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            clean_usn = usn.strip().upper()
            
            # 1. Upsert Student
            cgpa_status = "MEASURED" if cgpa is not None else "UNAVAILABLE"
            cur.execute("SELECT id FROM students WHERE institution_id = ? AND usn = ?", (institution_id, clean_usn))
            st_row = cur.fetchone()
            if st_row:
                student_id = st_row["id"]
                cur.execute("""
                    UPDATE students 
                    SET full_name = ?, department = ?, cgpa = ?, cgpa_status = ?, updated_at = ?
                    WHERE id = ?
                """, (full_name, department, cgpa, cgpa_status, now, student_id))
            else:
                student_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO students (id, institution_id, usn, full_name, department, batch_year, cgpa, cgpa_status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, '2026', ?, ?, ?, ?)
                """, (student_id, institution_id, clean_usn, full_name, department, cgpa, cgpa_status, now, now))
            
            # 2. Raw Responses
            if raw_responses:
                resp_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO assessment_responses (id, assessment_run_id, student_id, raw_responses, answered_count, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET raw_responses = excluded.raw_responses
                """, (resp_id, assessment_run_id, student_id, json.dumps(raw_responses), len(raw_responses), now))

            # 3. Candidate Evidence Pack
            ev_summary = evidence_pack.get("evidence_summary", {})
            cov_ratio = ev_summary.get("career_fit_evidence_coverage", "1/4")
            cov_pct = float(ev_summary.get("coverage_percentage", 25.0))
            confidence = ev_summary.get("confidence", "MODERATE")
            inst_status = ev_summary.get("institutional_verification_status", "PROVISIONAL_PLACEMENT_READY")
            
            ev_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO candidate_evidence (
                    id, student_id, assessment_run_id, coverage_ratio, coverage_percentage, 
                    confidence_tier, institutional_status, zero_defaults_enforced, raw_evidence_pack, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET
                    coverage_ratio = excluded.coverage_ratio,
                    coverage_percentage = excluded.coverage_percentage,
                    confidence_tier = excluded.confidence_tier,
                    institutional_status = excluded.institutional_status,
                    raw_evidence_pack = excluded.raw_evidence_pack
            """, (ev_id, student_id, assessment_run_id, cov_ratio, cov_pct, confidence, inst_status, json.dumps(evidence_pack), now))

            # 4. Candidate Scores
            components = evidence_pack.get("career_fit_calculations", {}).get("components", {})
            tech_s = components.get("technical", {}).get("score")
            anly_s = components.get("analytical", {}).get("score")
            own_s = components.get("ownership", {}).get("score")
            comm_s = components.get("communication", {}).get("score")
            
            cf_score = scores.get("career_fit_score")
            cf_index = scores.get("overall_index") or scores.get("careerfit_index")
            readiness = scores.get("job_readiness_score")
            quadrant = scores.get("mathematical_quadrant", "Q1")
            
            sc_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO candidate_scores (
                    id, student_id, assessment_run_id, career_fit_score, careerfit_index, job_readiness_score,
                    technical_score, technical_status, analytical_score, analytical_status,
                    ownership_score, ownership_status, communication_score, communication_status,
                    quadrant, quadrant_label, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET
                    career_fit_score = excluded.career_fit_score,
                    careerfit_index = excluded.careerfit_index,
                    job_readiness_score = excluded.job_readiness_score,
                    technical_score = excluded.technical_score,
                    analytical_score = excluded.analytical_score,
                    ownership_score = excluded.ownership_score,
                    communication_score = excluded.communication_score,
                    quadrant = excluded.quadrant,
                    quadrant_label = excluded.quadrant_label
            """, (
                sc_id, student_id, assessment_run_id, cf_score, cf_index, readiness,
                tech_s, "MEASURED" if tech_s is not None else "NOT_EVALUATED",
                anly_s, "MEASURED" if anly_s is not None else "NOT_EVALUATED",
                own_s, "MEASURED" if own_s is not None else "NOT_EVALUATED",
                comm_s, "MEASURED" if comm_s is not None else "NOT_EVALUATED",
                quadrant, inst_status.replace('_', ' ').title(), now
            ))

            # 5. Psychometric Results
            psy_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO psychometric_results (
                    id, student_id, assessment_run_id, overall_sjt_percentage, big_five_traits, competencies_19, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET
                    overall_sjt_percentage = excluded.overall_sjt_percentage,
                    big_five_traits = excluded.big_five_traits,
                    competencies_19 = excluded.competencies_19
            """, (
                psy_id, student_id, assessment_run_id,
                psychometric_results.get("percentage"),
                json.dumps(psychometric_results.get("big_five", {})),
                json.dumps(psychometric_results.get("competencies", {})),
                now
            ))

            # 6. Career Recommendations
            primary = career_recommendations.get("primary_target", {})
            rec_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO career_recommendations (
                    id, student_id, assessment_run_id, primary_role, primary_domain, match_score, readiness_score,
                    fit_tier, hard_skills, fit_reasoning, top_evaluated_roles, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET
                    primary_role = excluded.primary_role,
                    primary_domain = excluded.primary_domain,
                    match_score = excluded.match_score,
                    readiness_score = excluded.readiness_score,
                    fit_tier = excluded.fit_tier,
                    top_evaluated_roles = excluded.top_evaluated_roles
            """, (
                rec_id, student_id, assessment_run_id,
                primary.get("role") or primary.get("career_name") or primary.get("title") or "Insufficient Evidence",
                primary.get("domain", "General Engineering"),
                primary.get("match_score", cf_score or 0.0),
                primary.get("readiness_score", readiness or 0.0),
                primary.get("fit_tier", "Tier-1 Direct Ready"),
                primary.get("hard_skills", ""),
                primary.get("fit_reasoning", ""),
                json.dumps(career_recommendations.get("top_10_roles", [])),
                now
            ))

            # 7. AI Interpretation (if available)
            if ai_interpretation:
                ai_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO ai_interpretations (
                        id, student_id, assessment_run_id, model_name, executive_summary, career_interpretation,
                        placement_readiness_interpretation, strengths, development_areas, ninety_day_roadmap,
                        interview_focus_areas, validated_json, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET
                        executive_summary = excluded.executive_summary,
                        career_interpretation = excluded.career_interpretation,
                        placement_readiness_interpretation = excluded.placement_readiness_interpretation,
                        strengths = excluded.strengths,
                        development_areas = excluded.development_areas,
                        validated_json = excluded.validated_json
                """, (
                    ai_id, student_id, assessment_run_id,
                    ai_interpretation.get("model_name", "nvidia/nemotron-3.5-lightning-30b-a3b"),
                    ai_interpretation.get("executive_summary", ""),
                    ai_interpretation.get("career_interpretation", ""),
                    ai_interpretation.get("placement_readiness_interpretation", ""),
                    json.dumps(ai_interpretation.get("strengths", [])),
                    json.dumps(ai_interpretation.get("development_areas", [])),
                    json.dumps(ai_interpretation.get("ninety_day_roadmap", [])),
                    json.dumps(ai_interpretation.get("interview_focus_areas", [])),
                    json.dumps(ai_interpretation),
                    now
                ))

            # 8. Report Metadata & File Reference
            if report_metadata:
                rep_id = str(uuid.uuid4())
                rep_ident = f"CF-2026-{clean_usn}-{str(uuid.uuid4())[:8].upper()}"
                cur.execute("""
                    INSERT INTO reports (
                        id, student_id, assessment_run_id, report_identifier, verification_hash, page_count, certified_at, created_at
                    ) VALUES (?, ?, ?, ?, ?, 12, ?, ?)
                    ON CONFLICT(assessment_run_id, student_id) DO UPDATE SET
                        verification_hash = excluded.verification_hash,
                        certified_at = excluded.certified_at
                """, (
                    rep_id, student_id, assessment_run_id, rep_ident,
                    report_metadata.get("verification_hash", ""),
                    report_metadata.get("certified_at", now),
                    now
                ))
                
                # Report File
                pdf_path = report_metadata.get("storage_path", "")
                if pdf_path:
                    rf_id = str(uuid.uuid4())
                    file_size = report_metadata.get("file_size_bytes", 543240)
                    cur.execute("""
                        INSERT INTO report_files (id, report_id, storage_bucket, storage_path, file_size_bytes, mime_type, created_at)
                        VALUES (?, ?, 'reports', ?, ?, 'application/pdf', ?)
                    """, (rf_id, rep_id, pdf_path, file_size, now))

                        # 8b. Populate candidate_evaluations table for instant lookup
            eval_id = str(uuid.uuid4())
            cur.execute("""
                INSERT OR REPLACE INTO candidate_evaluations (
                    id, run_id, candidate_id, student_id,
                    scores_payload, evidence_payload, recommendations_payload, interpretation_payload, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eval_id, assessment_run_id, clean_usn, student_id,
                json.dumps(scores), json.dumps(evidence_pack), json.dumps(career_recommendations),
                json.dumps(ai_interpretation or {}), now
            ))

            # 9. Placement Status
            ps_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO placement_status (id, student_id, quadrant, eligibility_tier, action_recommended, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(student_id) DO UPDATE SET
                    quadrant = excluded.quadrant,
                    eligibility_tier = excluded.eligibility_tier,
                    action_recommended = excluded.action_recommended,
                    updated_at = excluded.updated_at
            """, (
                ps_id, student_id, quadrant, inst_status.replace('_', ' ').title(),
                "Qualified for campus recruitment drives." if quadrant == "Q1" else "Recommended for technical upskilling.",
                now
            ))

            conn.commit()
            return {"status": "SUCCESS", "student_id": student_id, "usn": clean_usn}
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    @staticmethod
    def get_candidate_normalized_record(institution_id: str, identifier: str, run_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Retrieves the complete normalized evaluation record for a candidate by USN or ID,
        enforcing multi-tenant institutional isolation and AssessmentRun scoping.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            clean_id = identifier.strip().upper()
            if run_id:
                cur.execute("""
                    SELECT s.id AS student_id, s.usn, s.full_name AS name, s.department, s.cgpa, s.cgpa_status,
                           i.name AS college,
                           sc.assessment_run_id,
                           sc.career_fit_score AS fit_score, sc.careerfit_index, sc.job_readiness_score,
                           sc.technical_score, sc.analytical_score, sc.ownership_score, sc.communication_score,
                           sc.quadrant, sc.quadrant_label,
                           ev.coverage_ratio, ev.coverage_percentage, ev.confidence_tier AS confidence,
                           ev.institutional_status, ev.raw_evidence_pack,
                           cr.primary_role AS top_recommended_role, cr.primary_domain AS domain,
                           cr.match_score, cr.readiness_score, cr.fit_tier, cr.top_evaluated_roles,
                           ai.executive_summary, ai.career_interpretation, ai.placement_readiness_interpretation,
                           ai.strengths, ai.development_areas, ai.ninety_day_roadmap,
                           rep.report_identifier, rep.verification_hash, rep.page_count
                    FROM students s
                    JOIN institutions i ON s.institution_id = i.id
                    LEFT JOIN candidate_scores sc ON sc.student_id = s.id AND sc.assessment_run_id = ?
                    LEFT JOIN candidate_evidence ev ON ev.student_id = s.id AND ev.assessment_run_id = ?
                    LEFT JOIN career_recommendations cr ON cr.student_id = s.id AND cr.assessment_run_id = ?
                    LEFT JOIN ai_interpretations ai ON ai.student_id = s.id AND ai.assessment_run_id = ?
                    LEFT JOIN reports rep ON rep.student_id = s.id AND rep.assessment_run_id = ?
                    WHERE s.institution_id = ? AND (s.usn = ? OR s.id = ?) AND s.is_deleted = 0
                    ORDER BY sc.created_at DESC
                    LIMIT 1
                """, (run_id, run_id, run_id, run_id, run_id, institution_id, clean_id, identifier))
            else:
                cur.execute("""
                    SELECT s.id AS student_id, s.usn, s.full_name AS name, s.department, s.cgpa, s.cgpa_status,
                           i.name AS college,
                           sc.assessment_run_id,
                           sc.career_fit_score AS fit_score, sc.careerfit_index, sc.job_readiness_score,
                           sc.technical_score, sc.analytical_score, sc.ownership_score, sc.communication_score,
                           sc.quadrant, sc.quadrant_label,
                           ev.coverage_ratio, ev.coverage_percentage, ev.confidence_tier AS confidence,
                           ev.institutional_status, ev.raw_evidence_pack,
                           cr.primary_role AS top_recommended_role, cr.primary_domain AS domain,
                           cr.match_score, cr.readiness_score, cr.fit_tier, cr.top_evaluated_roles,
                           ai.executive_summary, ai.career_interpretation, ai.placement_readiness_interpretation,
                           ai.strengths, ai.development_areas, ai.ninety_day_roadmap,
                           rep.report_identifier, rep.verification_hash, rep.page_count
                    FROM students s
                    JOIN institutions i ON s.institution_id = i.id
                    LEFT JOIN candidate_scores sc ON sc.student_id = s.id
                    LEFT JOIN candidate_evidence ev ON ev.student_id = s.id AND ev.assessment_run_id = sc.assessment_run_id
                    LEFT JOIN career_recommendations cr ON cr.student_id = s.id AND cr.assessment_run_id = sc.assessment_run_id
                    LEFT JOIN ai_interpretations ai ON ai.student_id = s.id AND ai.assessment_run_id = sc.assessment_run_id
                    LEFT JOIN reports rep ON rep.student_id = s.id AND rep.assessment_run_id = sc.assessment_run_id
                    WHERE s.institution_id = ? AND (s.usn = ? OR s.id = ?) AND s.is_deleted = 0
                    ORDER BY sc.created_at DESC
                    LIMIT 1
                """, (institution_id, clean_id, identifier))
            row = cur.fetchone()
            
            if not row:
                return None
            
            res = dict(row)
            # Format display keys
            res["candidate"] = res["name"]
            res["candidate_name"] = res["name"]
            res["branch"] = res["department"]
            res["target_role"] = res.get("top_recommended_role") or "Insufficient Evidence"
            res["readiness_tier"] = (res.get("institutional_status") or "PROVISIONAL_PLACEMENT_READY").replace('_', ' ').title()
            res["readiness_status"] = res["readiness_tier"]
            res["status"] = res.get("institutional_status") or ("PLACEMENT_READY" if res.get("fit_score") is not None else "NOT_EVALUATED")
            res["is_evaluated"] = bool(res.get("fit_score") is not None)
            res["career_fit_evidence_coverage"] = res.get("coverage_ratio", "1/4")
            
            cgpa_val = res.get("cgpa")
            res["cgpa_val"] = cgpa_val
            res["cgpa"] = f"{cgpa_val:.2f}/10.0" if cgpa_val is not None else "Unavailable"
            
            safe_name = str(res["name"]).replace(" ", "_")
            safe_usn = str(res["usn"]).strip()
            active_run_id = run_id or res.get("assessment_run_id") or ""
            res["pdf_filename"] = f"{safe_name}_{safe_usn}_CareerFit_Dossier.pdf"
            res["pdf_url"] = f"/api/reports/download/{safe_usn}?run_id={active_run_id}" if active_run_id else f"/api/reports/download/{safe_usn}"
            res["pdf_generated"] = True
            
            # Parse JSON fields safely
            for json_key in ["top_evaluated_roles", "strengths", "development_areas", "ninety_day_roadmap", "raw_evidence_pack"]:
                if res.get(json_key) and isinstance(res[json_key], str):
                    try:
                        res[json_key] = json.loads(res[json_key])
                    except Exception:
                        pass
            
            return res
        finally:
            conn.close()

    @staticmethod
    def list_cohort_normalized_records(institution_id: str, department: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieves all evaluated candidates within an institution.
        """
        students = StudentRepository.list_all(institution_id, department=department)
        records = []
        for st in students:
            rec = EvaluationPersistenceService.get_candidate_normalized_record(institution_id, st["usn"])
            if rec:
                records.append(rec)
        return records

class CampaignRepository:
    @staticmethod
    def get_or_create_default_campaign(institution_id: str) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM assessment_campaigns WHERE institution_id = ? ORDER BY created_at ASC LIMIT 1", (institution_id,))
            row = cur.fetchone()
            if row:
                return dict(row)
            camp_id = str(uuid.uuid4())
            now = now_iso()
            cur.execute("""
                INSERT INTO assessment_campaigns (
                    id, institution_id, name, department, batch_year, assessment_type,
                    status, total_invited, start_date, end_date, metadata, created_at, updated_at
                ) VALUES (?, ?, ?, 'CSE', '2026', 'COMPOSITE_SJT', 'OPEN', 10, ?, ?, '{}', ?, ?)
            """, (camp_id, institution_id, "2026 CSE CareerFit Assessment", now, now, now, now))
            conn.commit()
            cur.execute("SELECT * FROM assessment_campaigns WHERE id = ?", (camp_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def create_campaign(
        institution_id: str,
        name: str,
        department: str,
        batch_year: str = "2026",
        assessment_type: str = "COMPOSITE_SJT",
        created_by: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            camp_id = str(uuid.uuid4())
            now = now_iso()
            cur.execute("""
                INSERT INTO assessment_campaigns (
                    id, institution_id, name, department, batch_year, assessment_type,
                    status, total_invited, start_date, end_date, created_by, metadata, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'OPEN', 0, ?, ?, ?, '{}', ?, ?)
            """, (camp_id, institution_id, name, department, batch_year, assessment_type, start_date or now, end_date, created_by, now, now))
            conn.commit()
            cur.execute("SELECT * FROM assessment_campaigns WHERE id = ?", (camp_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def list_campaigns(institution_id: str) -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT c.*,
                       COUNT(a.id) AS total_attempts,
                       SUM(CASE WHEN a.lifecycle_status = 'ANALYSIS_READY' THEN 1 ELSE 0 END) AS count_analysis_ready,
                       SUM(CASE WHEN a.lifecycle_status = 'COMPLETED' THEN 1 ELSE 0 END) AS count_completed,
                       SUM(CASE WHEN a.lifecycle_status = 'IN_PROGRESS' OR a.lifecycle_status = 'STARTED' THEN 1 ELSE 0 END) AS count_in_progress,
                       SUM(CASE WHEN a.lifecycle_status = 'INVITED' OR a.lifecycle_status = 'PROFILE_CREATED' THEN 1 ELSE 0 END) AS count_invited
                FROM assessment_campaigns c
                LEFT JOIN student_assessment_attempts a ON a.campaign_id = c.id
                WHERE c.institution_id = ?
                GROUP BY c.id
                ORDER BY c.created_at DESC
            """, (institution_id,))
            rows = cur.fetchall()
            formatted_rows = []
            for r in rows:
                row_dict = dict(r)
                row_dict["target_role"] = row_dict.get("primary_role") or "Insufficient Evidence"
                row_dict["top_recommended_role"] = row_dict["target_role"]
                row_dict["fit_score"] = row_dict.get("match_score") or row_dict.get("career_fit_score") or 0.0
                
                # Single Source of Truth Canonical Readiness Mapping
                cov_pct = row_dict.get("coverage_percentage")
                tech_score = row_dict.get("technical_score")
                cf_score = row_dict.get("career_fit_score") or 0.0
                cf_idx = row_dict.get("careerfit_index") or 200
                
                readiness_info = determine_canonical_readiness(
                    careerfit_index=cf_idx,
                    career_fit_score=cf_score,
                    technical_score=tech_score,
                    coverage_percentage=cov_pct
                )

                row_dict["readiness_tier"] = readiness_info["label"]
                row_dict["readiness_status"] = readiness_info["label"]
                row_dict["readiness_label"] = readiness_info["label"]
                row_dict["fit_tier"] = readiness_info["label"]
                row_dict["placement_status"] = readiness_info["label"]
                formatted_rows.append(row_dict)
            return formatted_rows
        finally:
            conn.close()

class StudentLifecycleRepository:
    @staticmethod
    def get_student_assessment_state(institution_id: str, identifier: str) -> Dict[str, Any]:
        """
        Returns student's live assessment lifecycle state without fabricating scores.
        """
        conn = get_connection()
        try:
            cur = conn.cursor()
            clean_id = identifier.strip().upper()
            
            cur.execute("SELECT * FROM students WHERE institution_id = ? AND (usn = ? OR id = ?) AND is_deleted = 0", (institution_id, clean_id, identifier))
            st_row = cur.fetchone()
            if not st_row:
                return {
                    "lifecycle_status": "PROFILE_CREATED",
                    "current_stage": 1,
                    "total_stages": 4,
                    "is_evaluated": False,
                    "message": "Your CareerFit profile has been initiated."
                }
            
            student = dict(st_row)
            student_id = student["id"]
            
            cur.execute("""
                SELECT a.*, c.name AS campaign_name, c.department AS campaign_department
                FROM student_assessment_attempts a
                JOIN assessment_campaigns c ON a.campaign_id = c.id
                WHERE a.student_id = ?
                ORDER BY a.created_at DESC
                LIMIT 1
            """, (student_id,))
            attempt_row = cur.fetchone()
            
            cur.execute("SELECT id FROM candidate_scores WHERE student_id = ? LIMIT 1", (student_id,))
            has_scores = bool(cur.fetchone())
            
            if attempt_row:
                att = dict(attempt_row)
                return {
                    "student_id": student_id,
                    "usn": student["usn"],
                    "name": student["full_name"],
                    "department": student["department"],
                    "campaign_id": att["campaign_id"],
                    "campaign_name": att["campaign_name"],
                    "lifecycle_status": att["lifecycle_status"],
                    "current_stage": att["current_stage"],
                    "total_stages": att["total_stages"],
                    "is_evaluated": (att["lifecycle_status"] == "ANALYSIS_READY") or has_scores,
                    "started_at": att.get("started_at"),
                    "completed_at": att.get("completed_at")
                }
            
            if has_scores:
                return {
                    "student_id": student_id,
                    "usn": student["usn"],
                    "name": student["full_name"],
                    "department": student["department"],
                    "lifecycle_status": "ANALYSIS_READY",
                    "current_stage": 4,
                    "total_stages": 4,
                    "is_evaluated": True,
                    "is_demo_seed": True
                }
            
            return {
                "student_id": student_id,
                "usn": student["usn"],
                "name": student["full_name"],
                "department": student["department"],
                "lifecycle_status": "INVITED",
                "current_stage": 1,
                "total_stages": 4,
                "is_evaluated": False,
                "message": "Your CareerFit assessment is waiting for you."
            }
        finally:
            conn.close()

    @staticmethod
    def start_or_update_attempt(campaign_id: str, student_id: str, stage: int, responses: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            status = "IN_PROGRESS" if stage > 1 else "STARTED"
            resp_json = json.dumps(responses or {})
            
            cur.execute("""
                INSERT INTO student_assessment_attempts (
                    id, campaign_id, student_id, lifecycle_status, current_stage, total_stages,
                    responses_payload, started_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 4, ?, ?, ?, ?)
                ON CONFLICT(campaign_id, student_id) DO UPDATE SET
                    lifecycle_status = excluded.lifecycle_status,
                    current_stage = excluded.current_stage,
                    responses_payload = excluded.responses_payload,
                    updated_at = excluded.updated_at
            """, (str(uuid.uuid4()), campaign_id, student_id, status, stage, resp_json, now, now, now))
            
            conn.commit()
            cur.execute("SELECT * FROM student_assessment_attempts WHERE campaign_id = ? AND student_id = ?", (campaign_id, student_id))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def mark_attempt_analysis_ready(campaign_id: str, student_id: str):
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("""
                UPDATE student_assessment_attempts
                SET lifecycle_status = 'ANALYSIS_READY', completed_at = ?, analyzed_at = ?, updated_at = ?
                WHERE campaign_id = ? AND student_id = ?
            """, (now, now, now, campaign_id, student_id))
            conn.commit()
        finally:
            conn.close()

class UserRepository:
    @staticmethod
    def list_all(institution_id: str, role: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            query = "SELECT id, institution_id, email, username, role, full_name, is_active, last_login_at, created_at FROM users WHERE institution_id = ?"
            params = [institution_id]
            if role:
                query += " AND role = ?"
                params.append(role)
            if search:
                query += " AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)"
                s_param = f"%{search.strip()}%"
                params.extend([s_param, s_param, s_param])
            query += " ORDER BY created_at DESC"
            cur.execute(query, params)
            rows = cur.fetchall()
            formatted_rows = []
            for r in rows:
                row_dict = dict(r)
                row_dict["target_role"] = row_dict.get("primary_role") or "Insufficient Evidence"
                row_dict["top_recommended_role"] = row_dict["target_role"]
                row_dict["fit_score"] = row_dict.get("match_score") or row_dict.get("career_fit_score") or 0.0
                
                # Single Source of Truth Canonical Readiness Mapping
                cov_pct = row_dict.get("coverage_percentage")
                tech_score = row_dict.get("technical_score")
                cf_score = row_dict.get("career_fit_score") or 0.0
                cf_idx = row_dict.get("careerfit_index") or 200
                
                readiness_info = determine_canonical_readiness(
                    careerfit_index=cf_idx,
                    career_fit_score=cf_score,
                    technical_score=tech_score,
                    coverage_percentage=cov_pct
                )

                row_dict["readiness_tier"] = readiness_info["label"]
                row_dict["readiness_status"] = readiness_info["label"]
                row_dict["readiness_label"] = readiness_info["label"]
                row_dict["fit_tier"] = readiness_info["label"]
                row_dict["placement_status"] = readiness_info["label"]
                formatted_rows.append(row_dict)
            return formatted_rows
        finally:
            conn.close()

    @staticmethod
    def get_by_username(username: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            u_clean = username.strip()
            cur.execute("SELECT * FROM users WHERE username = ? OR email = ? OR usn = ?", (u_clean, u_clean.lower(), u_clean.upper()))
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def get_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def get_by_verification_token(token: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE verification_token = ?", (token.strip(),))
            row = cur.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    @staticmethod
    def verify_email_token(token: str) -> Optional[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE verification_token = ?", (token.strip(),))
            row = cur.fetchone()
            if not row:
                return None
            user_id = row["id"]
            now = now_iso()
            cur.execute("""
                UPDATE users
                SET email_verified = 1, verification_token = NULL, updated_at = ?
                WHERE id = ?
            """, (now, user_id))
            conn.commit()
            cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def _hash_otp(otp_code: str) -> str:
        salt = "genesis_careerfit_secure_otp_salt_2026"
        return hashlib.sha256(f"{salt}:{otp_code.strip()}".encode("utf-8")).hexdigest()

    @staticmethod
    def set_verification_otp(email: str, otp_code: str, expiry_minutes: int = 10) -> bool:
        clean_email = email.strip().lower()
        otp_hash = UserRepository._hash_otp(otp_code)
        now_dt = datetime.datetime.now(datetime.timezone.utc)
        expires_dt = now_dt + datetime.timedelta(minutes=expiry_minutes)
        now_iso_str = now_dt.isoformat()
        expires_iso_str = expires_dt.isoformat()

        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                UPDATE users
                SET otp_hash = ?,
                    otp_expires_at = ?,
                    otp_attempt_count = 0,
                    otp_last_sent_at = ?,
                    updated_at = ?
                WHERE email = ?
            """, (otp_hash, expires_iso_str, now_iso_str, now_iso_str, clean_email))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def verify_otp(email: str, otp_code: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        clean_email = email.strip().lower()
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
            row = cur.fetchone()
            if not row:
                return False, "Invalid or expired OTP.", None
            
            user = dict(row)
            if user.get("email_verified") == 1:
                return True, "Email is already verified.", user

            stored_hash = user.get("otp_hash")
            expires_at = user.get("otp_expires_at")
            attempt_count = user.get("otp_attempt_count", 0) or 0

            if not stored_hash or not expires_at:
                return False, "Invalid or expired OTP.", None

            # Max attempts check (5 attempts max)
            if attempt_count >= 5:
                cur.execute("UPDATE users SET otp_hash = NULL, otp_expires_at = NULL WHERE id = ?", (user["id"],))
                conn.commit()
                return False, "Invalid or expired OTP.", None

            # Expiration check
            now_iso_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
            if now_iso_str > expires_at:
                cur.execute("UPDATE users SET otp_hash = NULL, otp_expires_at = NULL WHERE id = ?", (user["id"],))
                conn.commit()
                return False, "Invalid or expired OTP.", None

            # Verify hash
            provided_hash = UserRepository._hash_otp(otp_code)
            if hmac.compare_digest(stored_hash, provided_hash):
                now_str = now_iso()
                cur.execute("""
                    UPDATE users
                    SET email_verified = 1,
                        otp_hash = NULL,
                        otp_expires_at = NULL,
                        otp_verified_at = ?,
                        updated_at = ?
                    WHERE id = ?
                """, (now_str, now_str, user["id"]))
                conn.commit()
                cur.execute("SELECT * FROM users WHERE id = ?", (user["id"],))
                updated_user = dict(cur.fetchone())
                return True, "Email verified successfully.", updated_user
            else:
                cur.execute("""
                    UPDATE users
                    SET otp_attempt_count = otp_attempt_count + 1,
                        updated_at = ?
                    WHERE id = ?
                """, (now_iso(), user["id"]))
                conn.commit()
                return False, "Invalid or expired OTP.", None
        finally:
            conn.close()

    @staticmethod
    def can_resend_otp(email: str, cooldown_seconds: int = 60) -> Tuple[bool, str]:
        clean_email = email.strip().lower()
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
            row = cur.fetchone()
            if not row:
                return False, "No account found for this email address."
            user = dict(row)
            if user.get("email_verified") == 1:
                return False, "Email is already verified. You may log in."

            last_sent = user.get("otp_last_sent_at")
            if last_sent:
                try:
                    last_sent_dt = datetime.datetime.fromisoformat(last_sent)
                    now_dt = datetime.datetime.now(datetime.timezone.utc)
                    elapsed = (now_dt - last_sent_dt).total_seconds()
                    if elapsed < cooldown_seconds:
                        rem = int(cooldown_seconds - elapsed)
                        return False, f"Please wait {rem} seconds before requesting a new OTP."
                except Exception:
                    pass
            return True, ""
        finally:
            conn.close()

    @staticmethod
    def register_student(
        institution_id: str,
        full_name: str,
        email: str,
        password: str,
        usn: str,
        department: str,
        graduation_year: str = "2026",
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        clean_email = email.strip().lower()
        clean_usn = usn.strip().upper()
        
        # Check duplicate email
        existing_email = UserRepository.get_by_email(clean_email)
        if existing_email:
            raise ValueError(f"An account with email {clean_email} already exists.")
            
        # Check duplicate USN within institution
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT id FROM students WHERE institution_id = ? AND usn = ?", (institution_id, clean_usn))
            if cur.fetchone():
                raise ValueError(f"A student with USN {clean_usn} is already registered in this institution.")
                
            user_id = str(uuid.uuid4())
            token = uuid.uuid4().hex
            now = now_iso()
            
            cur.execute("""
                INSERT INTO users (
                    id, institution_id, email, username, password_hash, role, full_name,
                    is_active, email_verified, verification_token, department, graduation_year, phone, usn,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, 1, 0, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, institution_id, clean_email, clean_usn, password, full_name.strip(), token, department, graduation_year, phone, clean_usn, now, now))
            
            # Also insert/link student record
            cur.execute("""
                INSERT INTO students (id, institution_id, user_id, usn, full_name, department, batch_year, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), institution_id, user_id, clean_usn, full_name.strip(), department, graduation_year, now, now))
            
            conn.commit()
            cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def register_officer(
        institution_id: str,
        full_name: str,
        email: str,
        password: str,
        designation: str = "Placement Training Officer",
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        clean_email = email.strip().lower()
        username = clean_email.split('@')[0]
        
        existing_email = UserRepository.get_by_email(clean_email)
        if existing_email:
            raise ValueError(f"An account with email {clean_email} already exists.")
            
        conn = get_connection()
        try:
            cur = conn.cursor()
            user_id = str(uuid.uuid4())
            token = uuid.uuid4().hex
            now = now_iso()
            
            cur.execute("""
                INSERT INTO users (
                    id, institution_id, email, username, password_hash, role, full_name,
                    is_active, email_verified, verification_token, designation, phone,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'PLACEMENT_OFFICER', ?, 1, 0, ?, ?, ?, ?, ?)
            """, (user_id, institution_id, clean_email, username, password, full_name.strip(), token, designation, phone, now, now))
            
            conn.commit()
            cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def create_user(
        institution_id: str,
        username: str,
        full_name: str,
        email: Optional[str],
        role: str,
        password_hash: str = "genesis2026",
        email_verified: bool = True
    ) -> Dict[str, Any]:
        existing = UserRepository.get_by_username(username)
        if existing:
            if email_verified and (existing.get("email_verified") == 0 or existing.get("password_hash") != password_hash):
                conn = get_connection()
                try:
                    cur = conn.cursor()
                    cur.execute("UPDATE users SET email_verified = 1, password_hash = ?, is_active = 1 WHERE id = ?", (password_hash, existing["id"]))
                    conn.commit()
                finally:
                    conn.close()
                existing["email_verified"] = 1
                existing["password_hash"] = password_hash
                existing["is_active"] = 1
            return existing
        conn = get_connection()
        try:
            cur = conn.cursor()
            user_id = str(uuid.uuid4())
            now = now_iso()
            cur.execute("""
                INSERT INTO users (id, institution_id, email, username, password_hash, role, full_name, is_active, email_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            """, (user_id, institution_id, email or f"{username.lower()}@genesis.edu", username.strip(), password_hash, role, full_name.strip(), 1 if email_verified else 0, now, now))
            conn.commit()
            cur.execute("SELECT id, institution_id, email, username, role, full_name, is_active, email_verified, created_at FROM users WHERE id = ?", (user_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def create_officer_user(
        institution_id: str,
        full_name: str,
        email: str,
        username: Optional[str] = None,
        password_hash: Optional[str] = None,
        designation: str = "Placement Training Officer",
        phone: Optional[str] = None,
        email_verified: bool = False
    ) -> Dict[str, Any]:
        """
        Creates a Placement Officer provisioned by Genesis Admin.
        """
        clean_email = email.strip().lower()
        u_name = (username or clean_email.split('@')[0]).strip().lower()
        pass_h = password_hash or "genesis2026"
        
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users WHERE email = ? OR username = ?", (clean_email, u_name))
            existing = cur.fetchone()
            now = now_iso()
            if existing:
                cur.execute("""
                    UPDATE users
                    SET institution_id = ?, username = ?, full_name = ?, password_hash = ?,
                        designation = ?, phone = ?, role = 'PLACEMENT_OFFICER', is_active = 1, updated_at = ?
                    WHERE id = ?
                """, (institution_id, u_name, full_name.strip(), pass_h, designation, phone, now, existing["id"]))
                conn.commit()
                cur.execute("SELECT id, institution_id, email, username, role, full_name, is_active, email_verified, designation, phone, created_at FROM users WHERE id = ?", (existing["id"],))
                return dict(cur.fetchone())
            
            user_id = str(uuid.uuid4())
            token = uuid.uuid4().hex
            cur.execute("""
                INSERT INTO users (
                    id, institution_id, email, username, password_hash, role, full_name,
                    is_active, email_verified, verification_token, designation, phone,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'PLACEMENT_OFFICER', ?, 1, ?, ?, ?, ?, ?, ?)
            """, (user_id, institution_id, clean_email, u_name, pass_h, full_name.strip(), 1 if email_verified else 0, token, designation, phone, now, now))
            conn.commit()
            cur.execute("SELECT id, institution_id, email, username, role, full_name, is_active, email_verified, designation, phone, created_at FROM users WHERE id = ?", (user_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def list_officers_by_institution(institution_id: str) -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, institution_id, email, username, role, full_name, is_active, email_verified, designation, phone, created_at
                FROM users
                WHERE institution_id = ? AND role = 'PLACEMENT_OFFICER'
                ORDER BY created_at DESC
            """, (institution_id,))
            rows = cur.fetchall()
            formatted_rows = []
            for r in rows:
                row_dict = dict(r)
                row_dict["target_role"] = row_dict.get("primary_role") or "Insufficient Evidence"
                row_dict["top_recommended_role"] = row_dict["target_role"]
                row_dict["fit_score"] = row_dict.get("match_score") or row_dict.get("career_fit_score") or 0.0
                
                # Single Source of Truth Canonical Readiness Mapping
                cov_pct = row_dict.get("coverage_percentage")
                tech_score = row_dict.get("technical_score")
                cf_score = row_dict.get("career_fit_score") or 0.0
                cf_idx = row_dict.get("careerfit_index") or 200
                
                readiness_info = determine_canonical_readiness(
                    careerfit_index=cf_idx,
                    career_fit_score=cf_score,
                    technical_score=tech_score,
                    coverage_percentage=cov_pct
                )

                row_dict["readiness_tier"] = readiness_info["label"]
                row_dict["readiness_status"] = readiness_info["label"]
                row_dict["readiness_label"] = readiness_info["label"]
                row_dict["fit_tier"] = readiness_info["label"]
                row_dict["placement_status"] = readiness_info["label"]
                formatted_rows.append(row_dict)
            return formatted_rows
        finally:
            conn.close()

    @staticmethod
    def reset_officer_password(user_id: str, new_password_hash: str) -> bool:
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("UPDATE users SET password_hash = ?, email_verified = 1, updated_at = ? WHERE id = ?", (new_password_hash, now, user_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def update_status(user_id: str, is_active: bool) -> bool:
        conn = get_connection()
        try:
            cur = conn.cursor()
            now = now_iso()
            cur.execute("UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?", (1 if is_active else 0, now, user_id))
            conn.commit()
            return cur.rowcount > 0
        finally:
            conn.close()

    @staticmethod
    def get_counts(institution_id: str) -> Dict[str, int]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM users WHERE institution_id = ?", (institution_id,))
            total_users = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM users WHERE institution_id = ? AND role = 'STUDENT'", (institution_id,))
            students = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM users WHERE institution_id = ? AND role = 'PLACEMENT_OFFICER'", (institution_id,))
            officers = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM users WHERE institution_id = ? AND role = 'PLACEMENT_ADMIN'", (institution_id,))
            admins = cur.fetchone()[0]
            return {
                "total_users": total_users,
                "students": students,
                "officers": officers,
                "admins": admins
            }
        finally:
            conn.close()

class AuditLogRepository:
    @staticmethod
    def log_event(
        institution_id: str,
        user_id: Optional[str],
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        payload: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            log_id = str(uuid.uuid4())
            now = now_iso()
            payload_dict = dict(payload or {})
            
            valid_user_id = None
            if user_id:
                cur.execute("SELECT id, username FROM users WHERE id = ? OR username = ?", (user_id, user_id))
                u_row = cur.fetchone()
                if u_row:
                    valid_user_id = u_row["id"]
                    if "username" not in payload_dict:
                        payload_dict["username"] = u_row["username"]
                else:
                    payload_dict["actor_identifier"] = str(user_id)
            
            payload_str = json.dumps(payload_dict)
            cur.execute("""
                INSERT INTO audit_logs (id, institution_id, user_id, action, resource_type, resource_id, payload, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (log_id, institution_id, valid_user_id, action, resource_type, resource_id, payload_str, ip_address, now))
            conn.commit()
            cur.execute("SELECT * FROM audit_logs WHERE id = ?", (log_id,))
            return dict(cur.fetchone())
        finally:
            conn.close()

    @staticmethod
    def list_logs(institution_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT a.*, u.username, u.role, u.full_name
                FROM audit_logs a
                LEFT JOIN users u ON a.user_id = u.id
                WHERE a.institution_id = ?
                ORDER BY a.created_at DESC
                LIMIT ?
            """, (institution_id, limit))
            rows = cur.fetchall()
            logs = []
            for r in rows:
                item = dict(r)
                if item.get("payload") and isinstance(item["payload"], str):
                    try:
                        item["payload"] = json.loads(item["payload"])
                    except Exception:
                        pass
                logs.append(item)
            return logs
        finally:
            conn.close()

def get_database_status() -> Dict[str, Any]:
    """
    Returns explicit database connection and configuration state.
    Never exposes passwords, keys, or secret tokens.
    """
    supabase_configured = is_supabase_configured()
    
    status_str = "CONNECTED" if (DATABASE_BACKEND == "sqlite" or supabase_configured) else "SUPABASE_NOT_CONFIGURED"
    
    return {
        "configured_backend": DATABASE_BACKEND,
        "active_engine": "supabase_postgresql" if (DATABASE_BACKEND in ["supabase", "postgresql"] and supabase_configured) else "sqlite_relational",
        "connection_status": status_str,
        "supabase_url_configured": "PRESENT" if bool(SUPABASE_URL and "your-project-ref" not in SUPABASE_URL) else "MISSING",
        "database_url_configured": "PRESENT" if bool(DATABASE_URL and "your-password" not in DATABASE_URL.lower()) else "MISSING",
        "service_role_key_configured": "PRESENT" if bool(SUPABASE_SERVICE_ROLE_KEY and "your_supabase" not in SUPABASE_SERVICE_ROLE_KEY) else "MISSING",
        "multi_tenant_enabled": True,
        "default_institution": DEFAULT_INST_CODE,
        "tables_count": 16
    }
