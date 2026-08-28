-- ==============================================================================
-- GENESIS CAREERFIT — ENTERPRISE PLACEMENT INTELLIGENCE PLATFORM
-- Migration: 20260825000003_complete_rls_and_runs.sql
-- Description: Dynamic AssessmentRun persistence, email verification, and RLS policies
-- ==============================================================================

-- 1. Extend Users table with email verification & registration metadata
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS usn VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_usn ON users(usn);

-- 2. Candidate Evaluations Run-Scoped Cache Table
CREATE TABLE IF NOT EXISTS candidate_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id VARCHAR(150) NOT NULL REFERENCES assessment_runs(id) ON DELETE CASCADE,
    candidate_id VARCHAR(150) NOT NULL,
    student_id VARCHAR(150) NOT NULL,
    scores_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommendations_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    interpretation_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cand_eval_run ON candidate_evaluations(run_id);
CREATE INDEX IF NOT EXISTS idx_cand_eval_student ON candidate_evaluations(student_id);

-- 3. Row Level Security (RLS) Enablement
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Institutions
CREATE POLICY "Institutions viewable by authenticated users"
ON institutions FOR SELECT
TO authenticated
USING (true);

-- 5. RLS Policies: Users
CREATE POLICY "Users can view members of own institution"
ON users FOR SELECT
TO authenticated
USING (
    institution_id = (auth.jwt() ->> 'institution_id')::uuid
    OR (auth.jwt() ->> 'role') = 'PLACEMENT_ADMIN'
);

-- 6. RLS Policies: Students
CREATE POLICY "Students viewable by institution officers or own user"
ON students FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR (institution_id = (auth.jwt() ->> 'institution_id')::uuid AND (auth.jwt() ->> 'role') IN ('PLACEMENT_OFFICER', 'PLACEMENT_ADMIN'))
);

-- 7. RLS Policies: Assessment Runs
CREATE POLICY "Assessment runs scoped to institution"
ON assessment_runs FOR ALL
TO authenticated
USING (
    institution_id = (auth.jwt() ->> 'institution_id')::uuid
    OR (auth.jwt() ->> 'role') = 'PLACEMENT_ADMIN'
);

-- 8. RLS Policies: Candidate Evaluations
CREATE POLICY "Candidate evaluations scoped to run and student"
ON candidate_evaluations FOR SELECT
TO authenticated
USING (
    student_id = (auth.jwt() ->> 'usn')
    OR (auth.jwt() ->> 'role') IN ('PLACEMENT_OFFICER', 'PLACEMENT_ADMIN')
);

-- 9. RLS Policies: Reports
CREATE POLICY "Reports accessible to student owner or officer"
ON reports FOR SELECT
TO authenticated
USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid() OR usn = (auth.jwt() ->> 'usn'))
    OR (auth.jwt() ->> 'role') IN ('PLACEMENT_OFFICER', 'PLACEMENT_ADMIN')
);
