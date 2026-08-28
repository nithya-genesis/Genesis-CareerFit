# GENESIS CAREERFIT — RELATIONAL DATABASE & SCHEMA SPECIFICATION

## 1. Entity Relationship Diagram

```
institutions (1) <--- (N) departments
institutions (1) <--- (N) assessment_runs
institutions (1) <--- (N) users (Placement Officers)
institutions (1) <--- (N) students
students (1)     <--- (N) candidate_scores
students (1)     <--- (N) candidate_evidence
students (1)     <--- (N) career_recommendations
students (1)     <--- (N) ai_interpretations
students (1)     <--- (N) reports
institutions (1) <--- (N) audit_logs
```

---

## 2. Tables & Schema Definitions

### `institutions`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `code` (TEXT UNIQUE NOT NULL)
- `slug` (TEXT)
- `status` (TEXT DEFAULT 'ACTIVE')
- `metadata` (TEXT JSON)
- `created_at` (TEXT)

### `students`
- `id` (TEXT PRIMARY KEY)
- `institution_id` (TEXT REFERENCES institutions(id))
- `usn` (TEXT NOT NULL)
- `full_name` (TEXT NOT NULL)
- `department` (TEXT NOT NULL)
- `batch_year` (TEXT DEFAULT '2026')
- `cgpa` (REAL)
- `email` (TEXT), `phone` (TEXT)
- `skills` (TEXT JSON), `certifications` (TEXT JSON), `internships` (TEXT JSON)
- `placement_status` (TEXT DEFAULT 'NOT_PLACED')
- `placed_company` (TEXT), `package_lpa` (REAL)

### `candidate_scores`
- `id` (TEXT PRIMARY KEY)
- `student_id` (TEXT REFERENCES students(id))
- `assessment_run_id` (TEXT REFERENCES assessment_runs(id))
- `career_fit_score` (REAL)
- `careerfit_index` (INTEGER)
- `job_readiness_score` (REAL)
- `quadrant` (TEXT), `quadrant_label` (TEXT)

### `reports`
- `id` (TEXT PRIMARY KEY)
- `student_id` (TEXT REFERENCES students(id))
- `assessment_run_id` (TEXT REFERENCES assessment_runs(id))
- `report_identifier` (TEXT NOT NULL)
- `verification_hash` (TEXT)
- `page_count` (INTEGER DEFAULT 12)

---

## 3. Compound Indexes for High-Performance Multi-Tenancy

1. `idx_students_inst`: `students(institution_id, department)`
2. `idx_students_usn`: `students(institution_id, usn)`
3. `idx_runs_inst`: `assessment_runs(institution_id, created_at)`
4. `idx_scores_run_std`: `candidate_scores(assessment_run_id, student_id)`
5. `idx_reports_run_std`: `reports(assessment_run_id, student_id)`
6. `idx_audit_inst_time`: `audit_logs(institution_id, created_at)`
