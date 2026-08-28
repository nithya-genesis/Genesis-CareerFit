-- ==============================================================================
-- GENESIS CAREERFIT — ENTERPRISE PLACEMENT INTELLIGENCE PLATFORM
-- Migration: 20260825000001_initial_schema.sql
-- Description: Core 14-table multi-tenant relational schema for Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. INSTITUTIONS (Tenants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL', 'INACTIVE')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_slug ON institutions(slug);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);

COMMENT ON TABLE institutions IS 'Client institutions, universities, and autonomous engineering colleges.';

-- ==============================================================================
-- 2. USERS (Authentication & Role-Based Access)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    email VARCHAR(255),
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PLACEMENT_ADMIN', 'PLACEMENT_OFFICER', 'STUDENT')),
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_inst_username UNIQUE (institution_id, username)
);

CREATE INDEX IF NOT EXISTS idx_users_inst_role ON users(institution_id, role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

COMMENT ON TABLE users IS 'User accounts with bcrypt/argon2id password hashes and role claims.';

-- ==============================================================================
-- 3. STUDENTS (Candidate Profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    usn VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    batch_year VARCHAR(20) NOT NULL DEFAULT '2026',
    cgpa NUMERIC(4,2) CHECK (cgpa IS NULL OR (cgpa >= 0.0 AND cgpa <= 10.0)),
    cgpa_status VARCHAR(30) NOT NULL DEFAULT 'MEASURED' CHECK (cgpa_status IN ('MEASURED', 'UNAVAILABLE', 'SELF_REPORTED')),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_students_inst_usn UNIQUE (institution_id, usn)
);

CREATE INDEX IF NOT EXISTS idx_students_inst_dept ON students(institution_id, department);
CREATE INDEX IF NOT EXISTS idx_students_usn ON students(usn);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

COMMENT ON TABLE students IS 'Student master registry. USN is uniquely constrained per institution.';

-- ==============================================================================
-- 4. ASSESSMENT_RUNS (Batch Ingestion & Assessment Lifecycles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS assessment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    total_records INT NOT NULL DEFAULT 0,
    valid_records INT NOT NULL DEFAULT 0,
    invalid_records INT NOT NULL DEFAULT 0,
    assessment_domains JSONB NOT NULL DEFAULT '[]'::jsonb,
    validation_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'DISCOVERED', 'VALIDATED', 'REJECTED')),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' CHECK (processing_status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    manifest JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_summary JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_runs_inst ON assessment_runs(institution_id, created_at DESC);

COMMENT ON TABLE assessment_runs IS 'Tracks spreadsheet upload runs, auto-discovery manifests, and processing states.';

-- ==============================================================================
-- 5. ASSESSMENT_RESPONSES (Raw Question-Level Ingestion)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    raw_responses JSONB NOT NULL,
    answered_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_responses_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_responses_student ON assessment_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_responses_run ON assessment_responses(assessment_run_id);

COMMENT ON TABLE assessment_responses IS 'Raw question-level candidate answer payloads from assessments.';

-- ==============================================================================
-- 6. CANDIDATE_EVIDENCE (CandidateEvidencePack Provenance)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS candidate_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    coverage_ratio VARCHAR(20) NOT NULL,
    coverage_percentage NUMERIC(5,2) NOT NULL CHECK (coverage_percentage >= 0.0 AND coverage_percentage <= 100.0),
    confidence_tier VARCHAR(50) NOT NULL CHECK (confidence_tier IN ('HIGH CONFIDENCE', 'MODERATE', 'INSUFFICIENT')),
    institutional_status VARCHAR(50) NOT NULL,
    zero_defaults_enforced BOOLEAN NOT NULL DEFAULT TRUE,
    raw_evidence_pack JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_evidence_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_evidence_student ON candidate_evidence(student_id);
CREATE INDEX IF NOT EXISTS idx_evidence_confidence ON candidate_evidence(confidence_tier);

COMMENT ON TABLE candidate_evidence IS 'Immutable evidence contract and coverage audit provenance.';

-- ==============================================================================
-- 7. CANDIDATE_SCORES (Deterministic Multi-Vector Scoring)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS candidate_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    career_fit_score NUMERIC(5,2) CHECK (career_fit_score IS NULL OR (career_fit_score >= 0.0 AND career_fit_score <= 100.0)),
    careerfit_index INT CHECK (careerfit_index IS NULL OR (careerfit_index >= 200 AND careerfit_index <= 800)),
    job_readiness_score NUMERIC(5,2) CHECK (job_readiness_score IS NULL OR (job_readiness_score >= 0.0 AND job_readiness_score <= 100.0)),
    technical_score NUMERIC(5,2) CHECK (technical_score IS NULL OR (technical_score >= 0.0 AND technical_score <= 100.0)),
    technical_status VARCHAR(30) NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (technical_status IN ('MEASURED', 'DERIVED', 'NOT_EVALUATED', 'UNAVAILABLE')),
    analytical_score NUMERIC(5,2) CHECK (analytical_score IS NULL OR (analytical_score >= 0.0 AND analytical_score <= 100.0)),
    analytical_status VARCHAR(30) NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (analytical_status IN ('MEASURED', 'DERIVED', 'NOT_EVALUATED', 'UNAVAILABLE')),
    ownership_score NUMERIC(5,2) CHECK (ownership_score IS NULL OR (ownership_score >= 0.0 AND ownership_score <= 100.0)),
    ownership_status VARCHAR(30) NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (ownership_status IN ('MEASURED', 'DERIVED', 'NOT_EVALUATED', 'UNAVAILABLE')),
    communication_score NUMERIC(5,2) CHECK (communication_score IS NULL OR (communication_score >= 0.0 AND communication_score <= 100.0)),
    communication_status VARCHAR(30) NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (communication_status IN ('MEASURED', 'DERIVED', 'NOT_EVALUATED', 'UNAVAILABLE')),
    quadrant VARCHAR(10) NOT NULL DEFAULT 'Q4',
    quadrant_label VARCHAR(100) NOT NULL DEFAULT 'Guidance Required',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_scores_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_student ON candidate_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_cf_index ON candidate_scores(careerfit_index DESC);

COMMENT ON TABLE candidate_scores IS 'Deterministic multidimensional scoring output. Null indicates NOT_EVALUATED.';

-- ==============================================================================
-- 8. PSYCHOMETRIC_RESULTS (19 Competency Scorecards & Big Five)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS psychometric_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    overall_sjt_percentage NUMERIC(5,2) CHECK (overall_sjt_percentage IS NULL OR (overall_sjt_percentage >= 0.0 AND overall_sjt_percentage <= 100.0)),
    big_five_traits JSONB NOT NULL DEFAULT '{}'::jsonb,
    competencies_19 JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_psychometric_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_psychometric_student ON psychometric_results(student_id);

COMMENT ON TABLE psychometric_results IS 'Detailed 19-competency scorecards and Big Five personality traits.';

-- ==============================================================================
-- 9. CAREER_RECOMMENDATIONS (Branch-Aware Career Matchings)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS career_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    primary_role VARCHAR(255) NOT NULL,
    primary_domain VARCHAR(255) NOT NULL,
    match_score NUMERIC(5,2) NOT NULL CHECK (match_score >= 0.0 AND match_score <= 100.0),
    readiness_score NUMERIC(5,2) NOT NULL CHECK (readiness_score >= 0.0 AND readiness_score <= 100.0),
    fit_tier VARCHAR(50) NOT NULL,
    hard_skills TEXT,
    fit_reasoning TEXT,
    top_evaluated_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_career_recs_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_career_recs_student ON career_recommendations(student_id);

COMMENT ON TABLE career_recommendations IS 'Evaluated career tracks, primary target roles, and fit match percentages.';

-- ==============================================================================
-- 10. AI_INTERPRETATIONS (Validated NVIDIA Nemotron Output)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ai_interpretations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL DEFAULT 'nvidia/nemotron-3.5-lightning-30b-a3b',
    executive_summary TEXT NOT NULL,
    career_interpretation TEXT NOT NULL,
    placement_readiness_interpretation TEXT NOT NULL,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    development_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    ninety_day_roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
    interview_focus_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
    validated_json JSONB NOT NULL,
    validation_passed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ai_interp_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_ai_interp_student ON ai_interpretations(student_id);

COMMENT ON TABLE ai_interpretations IS 'Validated, grounded NVIDIA Nemotron narrative interpretation objects.';

-- ==============================================================================
-- 11. REPORTS (Certified 12-Page Dossier Metadata)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_run_id UUID NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    report_identifier VARCHAR(100) NOT NULL UNIQUE,
    verification_hash VARCHAR(128) NOT NULL,
    page_count INT NOT NULL DEFAULT 12,
    certified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_reports_run_student UNIQUE (assessment_run_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_student ON reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_hash ON reports(verification_hash);

COMMENT ON TABLE reports IS 'Certified report registry storing cryptographic SHA-256 process digests.';

-- ==============================================================================
-- 12. REPORT_FILES (Storage Bucket References)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS report_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    storage_bucket VARCHAR(100) NOT NULL DEFAULT 'reports',
    storage_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type VARCHAR(50) NOT NULL DEFAULT 'application/pdf',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_files_report ON report_files(report_id);

COMMENT ON TABLE report_files IS 'Persistent binary storage location mappings (Supabase Storage / local bucket).';

-- ==============================================================================
-- 13. PLACEMENT_STATUS (Placement Cell Institutional Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS placement_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quadrant VARCHAR(10) NOT NULL DEFAULT 'Q4',
    eligibility_tier VARCHAR(50) NOT NULL DEFAULT 'Provisional Placement Ready',
    action_recommended TEXT NOT NULL,
    interview_cleared BOOLEAN NOT NULL DEFAULT FALSE,
    placed_company VARCHAR(255),
    package_lpa NUMERIC(5,2),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_placement_status_student UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_placement_status_student ON placement_status(student_id);
CREATE INDEX IF NOT EXISTS idx_placement_status_tier ON placement_status(eligibility_tier);

COMMENT ON TABLE placement_status IS 'Placement cell operations tracking, shortlisting, and hiring outcomes.';

-- ==============================================================================
-- 14. AUDIT_LOGS (Tamper-Evident Security & Action Log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_inst_created ON audit_logs(institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

COMMENT ON TABLE audit_logs IS 'Tamper-evident operational audit logs. Excludes passwords and API secrets.';

-- ==============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_placement_status_updated_at BEFORE UPDATE ON placement_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
