# GENESIS CAREERFIT — PRODUCTION DEPLOYMENT RUNBOOK

This document provides the complete, 22-step operational sequence for deploying, validating, managing, and rolling back the containerized Genesis CareerFit platform on a production Linux cloud server.

---

## Complete 22-Step Production Deployment Sequence

### Step 1: Provision Server
- Provision an Ubuntu 22.04 LTS or 24.04 LTS cloud instance (AWS EC2, Hetzner, DigitalOcean, Azure, or GCP Compute Engine).
- Recommended: 4 vCPU, 8 GB RAM, 50 GB NVMe SSD.

### Step 2: Install Docker & Docker Compose
```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable docker && sudo systemctl start docker
```

### Step 3: Configure Host Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt challenge & redirect)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```
*(Notice: Port 8000 is intentionally kept closed from external traffic)*.

### Step 4: Upload Git Repository
```bash
git clone <YOUR_GIT_REPO_URL> /opt/genesis_careerfit
cd /opt/genesis_careerfit
git checkout production-deployment
```

### Step 5: Configure `.env.production`
```bash
cp .env.production.example .env.production
# Generate a 64+ character random secret key:
openssl rand -hex 32
# Edit .env.production and paste the SECRET_KEY, APP_BASE_URL, and CORS_ORIGINS
nano .env.production
```

### Step 6: Configure Persistent Volume & Seed Database
```bash
docker volume create genesis_careerfit_data
# Seed the initial 93.5 MB pre-production verified database
docker run --rm -v genesis_careerfit_data:/data -v $(pwd):/backup alpine cp /backup/genesis_careerfit.db /data/genesis_careerfit.db
```

### Step 7: Build Production Docker Images
```bash
# Build React frontend static bundle
cd client && npm install --frozen-lockfile && npm run build && cd ..

# Build container images
docker compose -f docker-compose.production.yml build
```

### Step 8: Start Services
```bash
docker compose -f docker-compose.production.yml up -d
```

### Step 9: Verify System Health
```bash
# Check container status
docker compose -f docker-compose.production.yml ps
# Query internal health probe
curl -f http://localhost/health
curl -f http://localhost/api/health
```

### Step 10: Configure Public Domain & DNS
- Add an `A` record pointing `careerfit.yourdomain.com` to the server's public IP address.
- Wait for DNS propagation (`dig +short careerfit.yourdomain.com`).

### Step 11: Configure HTTPS & TLS (Certbot)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d careerfit.yourdomain.com
```

### Step 12: Test Authentication
- Verify login endpoint `/api/auth/login` for both Administrator and Placement Officer roles.

### Step 13: Test Platform Admin Workflows
- Log in to the Admin Command Center.
- Verify global institution overview (`/api/admin/overview`).
- Confirm dataset publication lifecycle controls.

### Step 14: Test Placement Officer Workflows
- Log in as Placement Officer.
- Confirm Candidate Directory loads with exact cohort size.
- Verify Placement Readiness Matrix, Skill Gap Intelligence, and Career Explorer.

### Step 15: Test Student Workflows
- Verify Student portal access and report view restrictions (IDOR prevention).

### Step 16: Test Reports Page
- Navigate to Institutional Reports hub.
- Confirm candidate roster and generated report statuses appear.

### Step 17: Test PDF Generation
- Trigger candidate 6-page Placement Summary PDF download.
- Trigger candidate 12-page Master Dossier PDF download.
- Verify exact physical page counts (6 pages and 12 pages) and logo watermark.

### Step 18: Test Email OTP Dispatch
- Test student / officer registration OTP verification dispatch.

### Step 19: Test Database Persistence
- Restart containers: `docker compose -f docker-compose.production.yml restart`.
- Verify student counts and reports remain unchanged.

### Step 20: Test Automated Backup
```bash
docker exec genesis_careerfit_api sqlite3 /data/genesis_careerfit.db ".backup '/data/genesis_careerfit_backup.db'"
docker cp genesis_careerfit_api:/data/genesis_careerfit_backup.db /opt/backup_test.db
docker exec genesis_careerfit_api rm /data/genesis_careerfit_backup.db
sqlite3 /opt/backup_test.db "PRAGMA integrity_check;"
rm /opt/backup_test.db
```

### Step 21: Review Go-Live Checklist
- Confirm all items in `GO_LIVE_CHECKLIST.md` are marked `PASS`.

### Step 22: Rollback Procedure
If any issue is detected, immediately revert:
```bash
git checkout production-prep
git reset --hard genesis-careerfit-pre-production
docker compose -f docker-compose.production.yml down
```
