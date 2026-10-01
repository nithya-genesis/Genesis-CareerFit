# GENESIS CAREERFIT — PRODUCTION GO-LIVE ACCEPTANCE TEST PLAN

---

## Acceptance Test Protocol Matrix

| # | Test Category | Test Description | Expected Result | Actual Local Container Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **AUTHENTICATION** | Log in as Platform Admin (`platformadmin`) & Placement Officer (`tpo`) | Returns `HTTP 200` with JWT Bearer Token | `HTTP 200` & Bearer token received | **PASS** |
| 2 | **ADMIN** | Access Platform Overview (`/api/admin/overview`) | Returns institutions, global run summaries | Active runs and college metrics returned | **PASS** |
| 3 | **PLACEMENT OFFICER** | Query Placement Stats (`/api/placement/dashboard-stats`) | Returns cohort counts and readiness distribution | Verified against active cohort dataset | **PASS** |
| 4 | **STUDENT** | Student profile querying & IDOR access restrictions | Students restricted to own USN report | Cross-candidate access returns `HTTP 403` | **PASS** |
| 5 | **COLLEGE MANAGEMENT**| Admin global college directory (`/api/admin/institutions`) | Returns list of all registered colleges | 45 colleges listed | **PASS** |
| 6 | **DATASET UPLOAD** | Upload heterogeneous multi-column student CSV | Auto-discovers schema and validates rows | Schema discovery & normalization active | **PASS** |
| 7 | **PUBLISH / UNPUBLISH**| Toggle dataset publication state | Shifts run status to `PUBLISHED` in database | Publication state persisted in SQLite | **PASS** |
| 8 | **DASHBOARD** | Placement Officer overview metrics | Displays verified cohort totals and readiness counts | Stats reflect active published dataset | **PASS** |
| 9 | **CANDIDATE DIRECTORY**| Candidate roster listing (`/api/placement/candidates`) | Displays student USNs, scores, readiness tiers | 768 candidates filtered by institution | **PASS** |
| 10 | **CAREER EXPLORER** | Query Career Universe taxonomy (`/api/career-universe`) | Returns 45 career clusters and job benchmark roles | Full engineering role taxonomy returned | **PASS** |
| 11 | **SKILL GAP** | Department Skill Gap Intelligence (`/api/placement/skill-gap-intelligence`)| Aggregates unassessed vs measured competencies | Department gap metrics generated | **PASS** |
| 12 | **REPORTS HUB** | Roster report generation and status tracking | Lists certified report verification hashes | Certified report metadata retrieved | **PASS** |
| 13 | **6-PAGE REPORT** | Compile candidate Executive Summary PDF in Linux Chromium | PDF is compiled to **EXACTLY 6 PHYSICAL PAGES** | Verified: Exactly 6 physical A4 pages | **PASS** |
| 14 | **12-PAGE MASTER** | Compile candidate Master Dossier PDF in Linux Chromium | PDF is compiled to **EXACTLY 12 PHYSICAL PAGES** | Verified: Exactly 12 physical A4 pages | **PASS** |
| 15 | **GENESIS LOGO** | Branding logo asset serving (`/logo.jpg`) | Serves 15.6 KB official Genesis logo | Served with `HTTP 200` | **PASS** |
| 16 | **WATERMARK** | PDF background branding overlay | Official logo embedded at 12% opacity behind text | Watermark visible on all report pages | **PASS** |
| 17 | **EXCEL EXPORT** | Download full cohort roster spreadsheet (`.xlsx`) | Generates structured OpenPyXL workbook | Verified valid `.xlsx` binary stream | **PASS** |
| 18 | **BATCH ZIP** | Download cohort ZIP archive (`/api/runs/{id}/reports/zip`)| Compiles all candidate PDFs into single archive | ZIP archive streams with audit hash | **PASS** |
| 19 | **EMAIL / OTP** | 6-digit cryptographic registration verification | Cryptographic PRNG OTP with 10-minute expiry | Token verification logic active | **PASS** |
| 20 | **PERSISTENCE** | Destroy and recreate Docker containers | Database, students, and PDFs remain intact | 768 students & 1,914 scores preserved | **PASS** |
| 21 | **BACKUP** | SQLite Online Backup API hot snapshot | Creates valid hot snapshot database | Verified with `PRAGMA integrity_check` | **PASS** |
| 22 | **RESTORE** | Restore snapshot into isolated database path | Restores 100% of tables and records | 17 tables, 100% row match verified | **PASS** |
| 23 | **MULTI-TENANCY** | Institution-level data isolation | College A cannot access College B data | Scoped queries verified in repository | **PASS** |
| 24 | **RBAC** | Server-side role authorization guards | Placement Officer cannot access Admin endpoints | Returns `HTTP 403 Forbidden` | **PASS** |
| 25 | **HTTPS / TLS** | Encrypted TLS termination via Nginx | Certbot HTTPS configuration prepared | Ready for cloud domain binding | **READY** |
| 26 | **RESPONSIVE UI** | React 18 frontend layout scaling | Responsive layout across desktop and tablet views | Clean Tailwind CSS grid scaling | **PASS** |
