# BLOCK 1 AUDIT: AssessmentRun Isolation and Dynamic Dataset Selection

## 1. Current AssessmentRun Model
In services/db_service.py, the assessment_runs table and repository define:
- Table: assessment_runs
  - id (TEXT PRIMARY KEY, e.g. RUN_YYYYMMDD_HHMMSS_<HEX>)
  - institution_id (TEXT NOT NULL)
  - filename (TEXT NOT NULL)
  - source_hash (TEXT)
  - total_records (INTEGER)
  - valid_records (INTEGER)
  - discovered_schema (TEXT JSON)
  - domain_manifest (TEXT JSON)
  - status (TEXT: PENDING, PROCESSING, COMPLETED, FAILED)
  - started_at, completed_at, created_at
- Run Candidates Table: candidate_evaluations
  - id, run_id, student_id, candidate_id, evidence_payload, scores_payload, recommendations_payload, interpretation_payload, created_at

## 2. Current Upload Flow
1. Frontend: User selects file in AssessmentUpload.jsx -> calls POST /api/upload-and-discover.
2. Backend Discovery: UniversalSchemaDiscovery.discover_and_normalize(df, filename) discovers schema, candidate identities, questions, and assigns a unique run_id.
3. Frontend Review: Displays discovered candidate count, run_id, domains, and questions.
4. Batch Evaluation Trigger: User clicks 'Execute Placement Evaluation Run' -> calls POST /api/process-batch with file and run_id.
5. Backend Processing: Creates assessment_runs in DB, builds candidate profiles, executes evaluation engines, persists candidate evaluations into candidate_evaluations and relational tables with assessment_run_id = run_id, builds run ZIP reports_{run_id}.zip, and returns status: SUCCESS, run_id, candidates.

## 3. Current Candidate Persistence Flow
- Evaluated candidates are stored in:
  1. candidate_evaluations scoped strictly by run_id column.
  2. Relational tables (candidate_scores, candidate_evidence, career_recommendations, reports, ai_interpretations) scoped by assessment_run_id.

## 4. Current Candidate Retrieval APIs
- GET /api/runs: Returns all available assessment runs for institution.
- GET /api/runs/{run_id}/candidates: Queries candidate_evaluations WHERE run_id = ?.
- GET /api/runs/latest/candidates: Queries candidates from the first run in the database (runs[0]).
- GET /api/dashboard/stats?run_id=...: Computes KPIs for given run_id.
- GET /api/placement/departments?run_id=...: Computes department analytics for given run_id.
- GET /api/placement/matrix?run_id=...: Computes placement matrix for given run_id.
- GET /api/reports/download/{candidate_id}?run_id=...: Downloads PDF for given candidate and run_id.

## 5. Current Frontend Run-Selection Logic
- client/src/services/api.js maintains active_run_id in localStorage (getActiveRunId(), setActiveRunId(id)).
- client/src/components/RunSelector.jsx displays a dropdown of runs and allows switching.
- Dashboard.jsx, CandidateDirectory.jsx, ReportsHub.jsx, etc. call getLatestCandidates(runId) and stats with runId.

## 6. Discovered Fallbacks to Old / Demo / Implicit Latest Data
1. Server Implicit runs[0] Fallbacks:
   - In server.py (list_run_candidates, get_dashboard_stats, get_departments, get_placement_matrix, _handle_candidate_report_download, _handle_zip_download):
     if not active_run: runs = AssessmentRunRepository.list_runs(inst['id']); if runs: active_run = runs[0]['id']
     Problem: When no run_id was provided, or if an invalid/non-existent run_id was passed, the server silently defaulted to the oldest or first run in the DB (runs[0]).
2. Server Implicit /api/runs/latest/candidates endpoint:
   - get_latest_run_candidates queries runs[0]['id'].
   - In api.js: getLatestCandidates used /api/runs/latest/candidates if activeRun was null.
3. Frontend AssessmentUpload.jsx:
   - const activeRunId = resData.run_id || discoveredData?.run_id || 'RUN_LATEST';
   - Navigates to /dashboard without query parameters (navigate('/dashboard')).
4. Frontend RunSelector runs[0] Fallback:
   - In RunSelector.jsx: if (!exists) { setActiveRun(runList[0].id); } and const currentRunObj = runs.find(r => r.id === activeRun) || runs[0];
   - If activeRun was not found, it silently switched to runs[0] instead of prompting selection or showing run not found.
5. URL Query Param Persistence:
   - Pages were not synchronizing their active run with the URL search param ?run_id=..., causing browser refreshes to depend solely on localStorage rather than explicit URL routing.

## 7. Exact Files and Functions Requiring Modification
1. server.py:
   - Add explicit endpoint: POST /api/assessment-runs/{run_id}/evaluate and POST /api/runs/{run_id}/evaluate.
   - Remove all implicit runs[0]['id'] fallbacks from list_run_candidates, get_dashboard_stats, get_departments, get_placement_matrix, _handle_candidate_report_download, _handle_zip_download.
   - Ensure that requesting a non-existent run_id returns 404 (RUN_NOT_FOUND) or an empty result set, never falling back to another run.
2. client/src/services/api.js:
   - Add getRunCandidates(runId), getAssessmentRunById(runId), evaluateAssessmentRun(runId, formData).
   - Ensure candidate and stats functions require or accept explicit runId and pass it in URL query parameters without default fallback to /api/runs/latest/candidates.
3. client/src/components/RunSelector.jsx:
   - Read run_id from URL query param first, then validated localStorage.
   - If selected run does not exist, display 'Run not found' / allow user selection; never auto-switch to runs[0] silently.
   - Synchronize URL with ?run_id=... when switching runs.
4. client/src/pages/AssessmentUpload.jsx:
   - Remove 'RUN_LATEST' fallback.
   - After upload and evaluation, navigate to /dashboard?run_id=.
5. client/src/pages/Dashboard.jsx, CandidateDirectory.jsx, ReportsHub.jsx, CandidateComparison.jsx, DepartmentAnalysis.jsx, PlacementReadiness.jsx:
   - Use useSearchParams / URL search parameter ?run_id=... as primary source of truth for the active run.
   - On refresh, fetch data strictly for run_id. If no run is selected or run no longer exists, display 'No assessment run selected.'
6. tests/test_assessment_run_isolation.py:
   - Implement the complete automated isolation test suite with unique test datasets A (3 cands) and B (2 cands).
