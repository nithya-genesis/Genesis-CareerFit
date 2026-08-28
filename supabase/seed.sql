-- ==============================================================================
-- GENESIS CAREERFIT — DEVELOPMENT SEED DATA (TAGGED DEMO ONLY)
-- File: supabase/seed.sql
-- Description: Isolated baseline demo fixture for development testing.
-- Note: DO NOT USE IN PRODUCTION. All passwords use standardized test hashes.
-- ==============================================================================

-- 1. Default Demo Institution
INSERT INTO institutions (id, name, code, slug, status, metadata)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Engineering Institute of Technology (Demo Campus)',
    'EIT-DEMO',
    'eit-demo',
    'ACTIVE',
    '{"tier": "Tier-1", "departments": ["CSE", "ISE", "ECE", "AIML", "MECH"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Demo Users (Admin Officer + Sample Student)
-- Password for all demo accounts: 'student123' / 'genesis2026' (bcrypt hash for demo)
INSERT INTO users (id, institution_id, email, username, password_hash, role, full_name, is_active)
VALUES 
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'tpo@eit-demo.edu',
    'admin',
    '$2b$12$e8Y7z7r0R9a8nF4V2H2sKuNfV3WwA5xY/8Z1eG5l3O7M9P0Q1R2S3',
    'PLACEMENT_OFFICER',
    'Dr. S. K. Narayanan (TPO Officer)',
    TRUE
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'aarav.sharma@eit-demo.edu',
    '1CS23101',
    '$2b$12$e8Y7z7r0R9a8nF4V2H2sKuNfV3WwA5xY/8Z1eG5l3O7M9P0Q1R2S3',
    'STUDENT',
    'Aarav Sharma',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Demo Student Master Profile
INSERT INTO students (id, institution_id, user_id, usn, full_name, department, batch_year, cgpa, cgpa_status)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    '1CS23101',
    'Aarav Sharma',
    'CSE',
    '2026',
    8.80,
    'MEASURED'
) ON CONFLICT (id) DO NOTHING;

-- 4. Demo Assessment Run
INSERT INTO assessment_runs (id, institution_id, uploaded_by, filename, total_records, valid_records, invalid_records, assessment_domains, validation_status, processing_status, manifest)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'CareerFit_10_Students_Psychometric_Responses.csv',
    10,
    10,
    0,
    '["Psychometric Situational Judgment Test (SJT)"]'::jsonb,
    'VALIDATED',
    'COMPLETED',
    '{"discovered_schema": "psychometric_sjt_v1", "questions_count": 60}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 5. Demo Assessment Responses
INSERT INTO assessment_responses (id, assessment_run_id, student_id, raw_responses, answered_count)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    '{"Q1": 3, "Q2": 4, "Q6": 4, "Q7": 5, "Q8": 4, "Q57": 5, "Q60": 4}'::jsonb,
    60
) ON CONFLICT (id) DO NOTHING;

-- 6. Demo Candidate Evidence
INSERT INTO candidate_evidence (id, student_id, assessment_run_id, coverage_ratio, coverage_percentage, confidence_tier, institutional_status, zero_defaults_enforced, raw_evidence_pack)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    '1/4',
    25.00,
    'MODERATE',
    'PROVISIONAL_PLACEMENT_READY',
    TRUE,
    '{"schema_version": "1.0.0", "coverage": "1/4", "measured_domains": ["psychometric_sjt"]}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 7. Demo Candidate Scores
INSERT INTO candidate_scores (id, student_id, assessment_run_id, career_fit_score, careerfit_index, job_readiness_score, technical_score, technical_status, analytical_score, analytical_status, ownership_score, ownership_status, communication_score, communication_status, quadrant, quadrant_label)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    88.89,
    733,
    88.58,
    NULL,
    'NOT_EVALUATED',
    NULL,
    'NOT_EVALUATED',
    88.89,
    'MEASURED',
    NULL,
    'NOT_EVALUATED',
    'Q1',
    'Placement Ready'
) ON CONFLICT (id) DO NOTHING;

-- 8. Demo Career Recommendation
INSERT INTO career_recommendations (id, student_id, assessment_run_id, primary_role, primary_domain, match_score, readiness_score, fit_tier, hard_skills, fit_reasoning)
VALUES (
    '11000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Software Development Engineer',
    'Engineering & Distributed Systems',
    88.89,
    88.58,
    'Tier-1 Direct Ready',
    'Python, Microservices, System Architecture, CI/CD Pipelines',
    'High ownership score and dependable situational judgment align with software engineering workflows.'
) ON CONFLICT (id) DO NOTHING;

-- 9. Demo AI Interpretation (NVIDIA Nemotron Grounded Record)
INSERT INTO ai_interpretations (id, student_id, assessment_run_id, model_name, executive_summary, career_interpretation, placement_readiness_interpretation, strengths, development_areas, validated_json)
VALUES (
    '22000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'Candidate demonstrates high reliability, strong personal accountability, and solid academic standing.',
    'Optimal alignment with Software Development Engineer roles requiring team delivery ownership.',
    'Qualified under Provisional Placement Ready status pending full technical assessment completion.',
    '["Exceptional ownership and accountability in project deliverables", "Strong academic foundation in Computer Science fundamentals"]'::jsonb,
    '["Complete standardized technical coding and algorithmic problem-solving assessments to achieve full Tier-1 verified status"]'::jsonb,
    '{"status": "VALIDATED", "provenance": "CandidateEvidencePack"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 10. Demo Certified Report Record
INSERT INTO reports (id, student_id, assessment_run_id, report_identifier, verification_hash, page_count)
VALUES (
    '33000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'CF-2026-1CS23101',
    'a9f4c3b2e1d0f8a7b6c5d4e3f2a109876543210fedcba9876543210abcdef123',
    12
) ON CONFLICT (id) DO NOTHING;

-- 11. Demo Report File Reference
INSERT INTO report_files (id, report_id, storage_bucket, storage_path, file_size_bytes, mime_type)
VALUES (
    '44000000-0000-0000-0000-000000000001',
    '33000000-0000-0000-0000-000000000001',
    'reports',
    'eit-demo/2026/Aarav_Sharma_1CS23101_CareerFit_Dossier.pdf',
    543240,
    'application/pdf'
) ON CONFLICT (id) DO NOTHING;

-- 12. Demo Placement Status
INSERT INTO placement_status (id, student_id, quadrant, eligibility_tier, action_recommended, interview_cleared)
VALUES (
    '55000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Q1',
    'Tier-1 Direct Ready',
    'Fast-track for campus placement recruitment drives in Software Engineering.',
    FALSE
) ON CONFLICT (id) DO NOTHING;
