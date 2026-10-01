# GENESIS CAREERFIT — PHASE 6 PRODUCTION SERVER PREPARATION & PACKAGE REPORT

---

## 1. Executive Summary

Genesis CareerFit is fully packaged, security-hardened, and prepared for deployment to a Linux cloud production server. The entire container stack—comprising the FastAPI backend with headless Chromium PDF generation and the Nginx reverse proxy serving the React 18 frontend—has been validated under Docker Engine and verified for zero data loss, zero business logic regressions, and strict physical page count compliance.

- **Phase Status**: **READY FOR CLOUD PROVISIONING & DEPLOYMENT**
- **Business Logic Status**: **FROZEN** (Zero scoring or calculation changes)
- **Database Engine**: Persistent SQLite (WAL Mode) with automated hot backup runbooks
- **Final Result**: **PHASE 6 — PASS**

---

## 2. Current Docker Stack State

- **Backend API**: `genesis_carrier_fit-develop-api:latest` (Python 3.12 Slim + Linux Chromium + Fonts, Size: ~1.58 GB)
- **Web Proxy**: `nginx:alpine` (Size: ~23.5 MB)
- **Container Memory Footprint**: ~126.8 MiB RAM combined at idle (< 3.5% allocation)
- **Persistent Volume**: `genesis_careerfit_data` mounted to `/data`

---

## 3. Deployment Package Inventory

The complete deployment package consists of:
1. Container Definitions: `Dockerfile`, `docker-compose.production.yml`, `.dockerignore`, `nginx/default.conf`
2. Configuration Templates: `.env.production.example`
3. Application Runtime: `server.py`, `app.py`, `engines/`, `services/`, `providers/`, `models/`, `utils/`, `config/`, `templates/`
4. Pre-Compiled Frontend: `client/dist/`, `client/public/logo.jpg`
5. Verified Database: `genesis_careerfit.db` (93.53 MB)
6. Operational Runbooks:
   - `PRODUCTION_DEPLOYMENT.md`
   - `DATABASE_PRODUCTION_RUNBOOK.md`
   - `PRODUCTION_ENVIRONMENT_REFERENCE.md`
   - `PRODUCTION_NETWORK_ARCHITECTURE.md`
   - `PRODUCTION_SERVER_SECURITY.md`
   - `PRODUCTION_SERVER_REQUIREMENTS.md`
   - `HOSTING_OPTIONS.md`
   - `GO_LIVE_CHECKLIST.md`
   - `PHASE_6_GO_LIVE_ACCEPTANCE_TEST.md`
   - `GENESIS_CAREERFIT_PRODUCTION_READINESS_REPORT.md`

---

## 4. Server Hardware Requirements

- **Minimum Configuration**: 2 vCPU, 4 GB RAM, 25 GB SSD (Up to 50 concurrent users)
- **Recommended Production**: 4 vCPU, 8 GB RAM, 50 GB NVMe SSD (Ubuntu 22.04 LTS)
- **Future Scale**: 8 vCPU, 16 GB RAM, 100 GB NVMe SSD (Statewide institutional network)

---

## 5. Cloud Hosting Options Comparison

*(Representative estimates. Verify current price before purchase).*
- **Hetzner Cloud (`CPX31`)**: 4 vCPU / 8 GB RAM / 160 GB NVMe (~$18–$25/mo) — *Top Pick for Value & Disk I/O*
- **DigitalOcean (Droplet)**: 4 vCPU / 8 GB RAM / 160 GB SSD (~$48–$56/mo) — *Top Pick for Operational Simplicity*
- **AWS EC2 (`t4g.xlarge` / `t3.xlarge`)**: 4 vCPU / 8–16 GB RAM (~$55–$85/mo) — *Enterprise Grade*

---

## 6. Recommended Cloud Configuration

- **OS**: Ubuntu 22.04 LTS (x86_64)
- **Instance**: 4 vCPU, 8 GB RAM, 50+ GB NVMe SSD
- **Runtime**: Docker Engine 29.x + Docker Compose Plugin v5.x
- **Firewall**: UFW (Default Deny; Ports 22, 80, 443 open)

---

## 7. Server Security Plan

- SSH Key-only authentication (Root password login disabled).
- Fail2ban intrusion prevention active.
- Unattended automated Ubuntu security patches.
- Port 8000 isolated to internal Docker bridge network.
- Reverse proxy edge with Let's Encrypt TLS 1.3 encryption.

---

## 8. Database Transfer Plan

1. Create verified hot snapshot on development machine:
   ```bash
   sqlite3 genesis_careerfit.db ".backup 'genesis_careerfit_prod_seed.db'"
   ```
2. Transfer `genesis_careerfit_prod_seed.db` to `/opt/genesis_careerfit/genesis_careerfit.db` on the cloud server over encrypted SSH / SCP.
3. Seed into Docker named volume `genesis_careerfit_data`:
   ```bash
   docker run --rm -v genesis_careerfit_data:/data -v $(pwd):/backup alpine cp /backup/genesis_careerfit.db /data/genesis_careerfit.db
   ```
4. Zero schema migration; 100% data preservation.

---

## 9. Report & Output Transfer Plan

- Copy existing `outputs/` archive folder to `/data/outputs` within the persistent volume to maintain historical reports and batch datasets.

---

## 10. Deployment Procedure

Detailed in [`PRODUCTION_DEPLOYMENT.md`](file:///c:/Users/Admin/OneDrive/Desktop/Genesis_carrier_fit-develop/PRODUCTION_DEPLOYMENT.md) (22-step deployment runbook).

---

## 11. Backup Strategy

- SQLite Online Backup API snapshot triggered via daily automated cron at 02:00 UTC.
- Hot snapshots copied to `/opt/careerfit_backups/` and synced to off-site S3 / GCS bucket.

---

## 12. Restoration Strategy

- Stop stack $\rightarrow$ restore `genesis_careerfit.db` and `/data/outputs` from backup directory into `genesis_careerfit_data` volume $\rightarrow$ restart stack $\rightarrow$ verify health in < 3 minutes.

---

## 13. HTTPS Plan

- Automated TLS certificate issuance via Certbot Nginx plugin:
  ```bash
  sudo certbot --nginx -d <production-domain>
  ```

---

## 14. Domain Plan

- Set DNS `A` Record: `<production-domain> -> <Server Public IP>`.
- Set `APP_BASE_URL=https://<production-domain>` in `.env.production`.
- Set `CORS_ORIGINS=https://<production-domain>` in `.env.production`.

---

## 15. Go-Live Test Plan

- Complete 26-category verification protocol documented in [`PHASE_6_GO_LIVE_ACCEPTANCE_TEST.md`](file:///c:/Users/Admin/OneDrive/Desktop/Genesis_carrier_fit-develop/PHASE_6_GO_LIVE_ACCEPTANCE_TEST.md).

---

## 16. Rollback Strategy

- **Level 1 (App Rollback)**: `git checkout production-prep && git reset --hard genesis-careerfit-pre-production && docker compose up -d --build`.
- **Level 2 (DB Rollback)**: Restore pre-deployment database snapshot into persistent volume.

---

## 17. Remaining Blockers

- **Zero Technical Blockers**. The platform is ready for cloud provisioning.

---

## 18. Estimated Monthly Operating Costs

- Cloud VPS (4 vCPU / 8 GB RAM): **\$20 – \$60 / month**
- Domain Registration: **\$10 – \$15 / year**
- SSL / TLS Certificates: **\$0 (Let's Encrypt / Certbot)**
- Automated Off-Site Backups (S3/GCS): **\$1 – \$3 / month**

---

## 19. Final Recommendation

# **PHASE 6 — PASS**
The Genesis CareerFit deployment package, Docker configurations, server sizing, security specifications, database transfer protocols, and operational runbooks are complete and verified. The platform is ready for cloud server provisioning.
