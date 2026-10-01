# GENESIS CAREERFIT — EXECUTIVE PRODUCTION READINESS REPORT
**A Strategic Overview for Leadership & Management Stakeholders**

---

## 1. What is Genesis CareerFit?
Genesis CareerFit is a high-throughput, multi-tenant Institutional Placement & Psychometric Intelligence Platform. It allows universities and engineering institutions to evaluate thousands of candidate profiles, map their psychometric, cognitive, and situational judgment scores against real-world engineering careers, determine corporate placement readiness, and generate audit-certified 6-page Executive Placement Summaries and 12-page Master Dossiers in PDF and Excel formats.

---

## 2. Production Architecture Overview
The platform operates as a containerized stack designed for cloud hosting:
- **Frontend Layer**: Modern, responsive React 18 single-page application delivered via Nginx.
- **Backend Services**: High-performance Python FastAPI engine executing canonical scoring calculations.
- **Reporting Engine**: Embedded Linux Chromium service compiling pixel-perfect PDFs with official Genesis logo watermarks.
- **Persistence Layer**: Structured, high-integrity relational database mounted to persistent cloud storage.

---

## 3. How Institutions & Colleges are Managed
Institutions are isolated multi-tenant entities. Each college maintains its own distinct student roster, assessment campaigns, uploaded datasets, and placement dashboards. Cross-institutional data access is strictly blocked at the database and API authorization layers.

---

## 4. How Administrators Work
Platform Administrators have global oversight across all registered institutions, dataset ingestion queues, system audit logs, and publication lifecycle controls.

---

## 5. How Placement Officers Work
Training and Placement Officers (TPOs) manage candidate rosters, track real-time placement readiness distributions, analyze department-level skill gaps, explore career alignments in the Career Universe, and download batch report archives for recruitment drives.

---

## 6. How Students Work
Students log in securely via email and cryptographic one-time passwords (OTP) to view their verified assessment results, explore recommended career pathways, and download certified placement dossiers.

---

## 7. How Datasets Move Through the System
1. **Ingestion**: Admin uploads campus evaluation CSV or Excel datasets.
2. **Universal Discovery**: The engine automatically discovers column headers, normalizes data formats, and validates candidate identity records.
3. **Scoring & Alignment**: The mathematical scoring engine calculates multidimensional scores and CareerFit Index ($200\text{--}800$).
4. **Publication**: Admins publish verified cohorts, making them immediately active for placement officers.

---

## 8. How Reports are Generated
The platform generates two certified report formats:
- **6-Page Executive Placement Summary**: High-impact, concise placement brief highlighting candidate strengths, gap closure, interview focus areas, and a 90-day roadmap.
- **12-Page Master Dossier**: Comprehensive psychometric and situational decomposition across all 19 competencies and Big Five personality traits.

---

## 9. Data Storage & Retention
All student evaluations, scores, audit trails, and uploaded datasets are stored on persistent enterprise storage volumes that survive software updates and container restarts.

---

## 10. Authentication & Security
- **Passwords**: Salted cryptographic hashing (`passlib[bcrypt]`).
- **Sessions**: Cryptographically signed JSON Web Tokens (JWT).
- **Access Control**: Role-Based Access Control (RBAC) enforced server-side.
- **Edge Protection**: Nginx reverse proxy shields the backend from direct public exposure.

---

## 11. Backup & Disaster Recovery
Hot snapshots are taken directly from the live database using the SQLite Online Backup API, ensuring zero data loss and automated restoration within minutes.

---

## 12. Production Deployment & Cloud Readiness
The platform is packaged into standardized Docker containers, ensuring identical behavior across local testing and cloud production environments (AWS, Azure, GCP, or bare-metal Linux servers).

---

## 13. Infrastructure Sizing & Cost Estimation
- **Recommended Server**: 4 vCPU, 8 GB RAM, 50 GB SSD.
- **Estimated Cloud Hosting Cost**: Approximately \$40 – \$80 per month on modern cloud providers (AWS EC2 `t4g.xlarge`, Hetzner `CPX31`, or DigitalOcean Droplet).

---

## 14. Operational Responsibilities
- **DevOps / SysAdmin**: Server uptime, SSL certificate renewal, automated daily backups.
- **Platform Admin**: Onboarding colleges, verifying assessment batch uploads, user account management.
- **Placement Officers**: Managing candidate cohorts, sharing reports with corporate recruiters.

---

## 15. Risk Assessment & Mitigations

| Risk Factor | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Server Restart / Crash** | Low | Automated Docker restart policy (`restart: unless-stopped`) + persistent SSD volume |
| **Data Corruption** | Low | SQLite WAL mode + daily hot backup snapshots |
| **Unauthorized Access** | Medium | Server-side RBAC guards on all endpoints + JWT authentication |
| **PDF Generation Spikes** | Low | Lightweight Chromium memory footprint (~120 MB baseline) + isolated worker queue |

---

## 16. Rollback Strategy
If any operational issue arises during a future update, the system can instantly roll back to the protected pre-production checkpoint (`genesis-careerfit-pre-production`) without data loss.

---

## 17. Recommended Go-Live Sequence
1. Provision cloud server and install Docker.
2. Configure domain DNS records and TLS/HTTPS certificates.
3. Deploy containerized Genesis CareerFit stack.
4. Execute smoke verification tests.
5. Grant access to institutional placement teams.
