-- ==============================================================================
-- GENESIS CAREERFIT — MIGRATION 20260825000002
-- Assessment Campaigns and Student Assessment Lifecycle
-- ==============================================================================

-- 1. Assessment Campaigns Table
CREATE TABLE IF NOT EXISTS assessment_campaigns (
    id TEXT PRIMARY KEY,
    institution_id TEXT NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    batch_year TEXT NOT NULL DEFAULT '2026',
    assessment_type TEXT NOT NULL DEFAULT 'COMPOSITE_SJT',
    status TEXT NOT NULL DEFAULT 'OPEN', -- DRAFT, OPEN, IN_PROGRESS, COMPLETED, ARCHIVED
    total_invited INTEGER NOT NULL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Student Assessment Attempts / Lifecycle Table
CREATE TABLE IF NOT EXISTS student_assessment_attempts (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES assessment_campaigns(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lifecycle_status TEXT NOT NULL DEFAULT 'PROFILE_CREATED', -- PROFILE_CREATED, INVITED, STARTED, IN_PROGRESS, COMPLETED, ANALYSIS_READY
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

-- Indexes for high-performance campaign lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_institution ON assessment_campaigns(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON student_assessment_attempts(student_id, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_attempts_campaign ON student_assessment_attempts(campaign_id, lifecycle_status);
