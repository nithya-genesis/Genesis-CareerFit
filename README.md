# Genesis CareerFit — Multi-Tenant Placement Intelligence Platform

Genesis CareerFit is an enterprise-grade, multi-tenant placement intelligence and assessment-agnostic career matching platform designed for higher education institutions, corporate relations departments, and student talent development.

---

## 1. System Architecture & Role Matrix

| Role | Scope & Permissions | Portal URL | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Genesis Platform Admin** | Global Platform Owner | `/admin/login` | Institution onboarding, officer provisioning, global datasets, run publishing |
| **Genesis Operations** | Internal Operations | `/operations/login` | Dataset validation, batch processing, scoring verification, student imports |
| **Placement Officer** | Institution-Scoped (`institution_id`) | `/placement/login` | Talent directory, multi-attribute filtering, Excel export, skill gaps, reports |
| **Student** | Self-Scoped (Candidate USN) | `/student/login` | Talent dossier, 20-question situational assessment, career matching, roadmap |

---

## 2. Core Functional Pillars

1. **Single Source of Truth Scoring**:
   - `careerfit_raw_score` (200 – 800)
   - `careerfit_max_score` (800)
   - `careerfit_percentage` (e.g. 71.0%)
   - `readiness_score` & `match_scores`
   - Zero score fabrication: unassessed areas explicitly reported as `NOT_EVALUATED` / `INSUFFICIENT_EVIDENCE`.
2. **Multi-Tenant Relational Isolation**:
   - Explicit foreign keys (`institutions`, `departments`, `cohorts`, `students`, `candidate_scores`, `reports`, `audit_logs`).
   - 14 compound database indexes ensuring high query throughput.
3. **Institutional Placement Intelligence**:
   - Multi-attribute filtering (CGPA, CareerFit Index, Match %, Department, Placement Status).
   - Filter-scoped streaming Excel export (`/api/placement/export-excel`).
   - Protected candidate profile updates with full audit logging.
4. **Certified PDF Report Generation**:
   - **12-Page Master Dossier**: Comprehensive diagnostic dossier with Genesis logo watermark across every page.
   - **6-Page Placement Summary**: Condensed executive summary containing strictly Pages 1, 2, 6, 8, 9, and 11.
5. **20-Question Situational & Employability Assessment Engine**:
   - 10 core dimensions evaluated across 20 workplace situational judgment scenarios with deterministic scoring.

---

## 3. Quick Start (Local Development)

### Backend
```bash
# 1. Activate Python virtual environment
.\.venv\Scripts\activate

# 2. Initialize database
python scripts/init_production_db.py

# 3. Start API Server
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd client
npm install
npm run dev
```

---

## 4. Test Suite Execution

Run the complete clean test suite:
```bash
python -c "
import sys, os, importlib
sys.path.insert(0, os.path.abspath('.'))
modules = ['tests.auth.test_auth_routes', 'tests.tenancy.test_tenancy_isolation', 'tests.scoring.test_canonical_scoring', 'tests.reports.test_pdf_watermark_and_summary', 'tests.exports.test_excel_export', 'tests.assessment.test_assessment_engine', 'tests.security.test_security_rbac', 'tests.test_master_production_acceptance']
for m in modules:
    mod = importlib.import_module(m)
    for a in dir(mod):
        if a.startswith('test_'):
            getattr(mod, a)()
            print(f'[PASS] {m}::{a}')
"
```
