# GENESIS CAREERFIT — PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

## 1. System Overview & Architecture
Genesis CareerFit is an enterprise-grade, assessment-agnostic placement intelligence and career matching platform.
- **Frontend**: Vite + React SPA with role-based routing and responsive dashboard.
- **Backend**: Python 3.11+ FastAPI asynchronous API server.
- **Database**: SQLite with WAL mode, foreign key enforcement, and compound multi-tenant indexes.
- **Report Engine**: Headless Chromium / Edge HTML5 Jinja2 precision rendering with Genesis logo watermarks on every page.
- **AI Engine**: Deterministic candidate evidence packs combined with NVIDIA NIM LLM synthesis.

---

## 2. Environment Variables Configuration
Create a secure `.env` file in the root project directory:

```env
# Application Server
PORT=8000
HOST=0.0.0.0
NODE_ENV=production

# Security & JWT Secrets (CRITICAL: Replace with cryptographic 64-char keys)
JWT_SECRET=your-64-character-cryptographic-jwt-secret-key
ADMIN_SECRET_KEY=your-secure-admin-secret-key

# Database
DATABASE_URL=sqlite:///genesis_careerfit.db

# Email / SMTP Service (For Officer Onboarding & Verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@genesiscareerfit.ai
SMTP_PASSWORD=your-secure-smtp-app-password
FROM_EMAIL=no-reply@genesiscareerfit.ai

# AI Provider (NVIDIA NIM)
NVIDIA_API_KEY=your-nvidia-nim-api-key
NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b
```

---

## 3. Production Initialization & Boot

### Step 1: Initialize Database
```bash
python scripts/init_production_db.py
```

### Step 2: Build Frontend Assets
```bash
cd client
npm install --production
npm run build
cd ..
```

### Step 3: Run Backend Service (Gunicorn / Uvicorn)
```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 4. Multi-Tenant Role Matrix

| Role | Scope | Key Capabilities | Prohibited Operations |
| :--- | :--- | :--- | :--- |
| **Platform Owner / Admin** | Global Platform | Manage colleges, upload datasets, provision officers, publish runs | Cannot have duplicate Platform Owner |
| **Placement Officer** | Institution-Scoped | Candidate directory, filtered Excel export, profile editing, PDF downloads | Cannot upload datasets, cannot view other institutions |
| **Student** | Self-Scoped | Take assessment, view personal CareerFit report & roadmap | Cannot access other candidate records |

---

## 5. Maintenance & Backups
- **Database Backup**: Periodic file copy of `genesis_careerfit.db` while SQLite WAL is synced.
- **Output Storage**: PDFs and batch ZIP archives are isolated under `outputs/runs/{run_id}/`.
