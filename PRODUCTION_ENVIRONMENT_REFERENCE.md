# GENESIS CAREERFIT — PRODUCTION ENVIRONMENT VARIABLE CONTRACT

This document provides the canonical reference for all environment variables supported by the Genesis CareerFit containerized production platform.

---

## Environment Variable Matrix

| Variable | Purpose | Classification | Example Format | Configuration Location |
| :--- | :--- | :--- | :--- | :--- |
| `SECRET_KEY` | Signs session cookies and cryptographic payloads | **MANDATORY** | `64-char hex string` (e.g. `openssl rand -hex 32`) | `.env.production` |
| `JWT_SECRET_KEY` | Signs JWT Bearer tokens for API authorization | **OPTIONAL** *(Defaults to `SECRET_KEY`)* | `64-char hex string` | `.env.production` |
| `DATABASE_PATH` | File path to persistent SQLite database inside container | **MANDATORY** | `/data/genesis_careerfit.db` | `docker-compose.production.yml` / `.env.production` |
| `OUTPUTS_DIR` | Directory for uploaded datasets, batch ZIPs, and PDF cache | **MANDATORY** | `/data/outputs` | `docker-compose.production.yml` / `.env.production` |
| `CHROME_PATH` | Path to headless Chromium binary for PDF generation | **MANDATORY** | `/usr/bin/chromium` | `docker-compose.production.yml` / `.env.production` |
| `HOST` | IP interface binding for internal Uvicorn ASGI server | **MANDATORY** | `0.0.0.0` | `docker-compose.production.yml` |
| `PORT` | Listening TCP port for internal Uvicorn ASGI server | **MANDATORY** | `8000` | `docker-compose.production.yml` |
| `APP_BASE_URL` | Public canonical HTTPS domain used in emails and links | **MANDATORY** | `https://careerfit.yourdomain.com` | `.env.production` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins for CORS headers | **MANDATORY** | `https://careerfit.yourdomain.com,https://admin.yourdomain.com` | `.env.production` |
| `ENVIRONMENT` | Environment toggle (`production` disables dev defaults) | **RECOMMENDED** | `production` | `.env.production` |
| `PLACEMENT_ADMIN_PASSWORD` | Strong password override for default platform administrator | **RECOMMENDED** | Secure passphrase | `.env.production` |
| `PLACEMENT_OFFICER_PASSWORD` | Strong password override for default placement officer | **RECOMMENDED** | Secure passphrase | `.env.production` |
| `SMTP_HOST` | SMTP server host for outgoing email dispatch | **OPTIONAL** | `smtp.mailgun.org` / `smtp.sendgrid.net` | `.env.production` |
| `SMTP_PORT` | SMTP server port | **OPTIONAL** | `587` | `.env.production` |
| `SMTP_USER` | SMTP authentication username | **OPTIONAL** | `postmaster@yourdomain.com` | `.env.production` |
| `SMTP_PASSWORD` | SMTP authentication password | **OPTIONAL** | Secure password | `.env.production` |
| `SMTP_FROM_EMAIL` | Sender email address displayed in outgoing notifications | **OPTIONAL** | `noreply@yourdomain.com` | `.env.production` |
| `SMTP_FROM_NAME` | Sender display name | **OPTIONAL** | `Genesis CareerFit` | `.env.production` |
| `SMTP_USE_TLS` | Enables STARTTLS for encrypted email transport | **OPTIONAL** | `true` | `.env.production` |
| `GROQ_API_KEY` | API Key for optional Groq GenAI narrative enrichment | **OPTIONAL** | `gsk_...` | `.env.production` |
| `NVIDIA_API_KEY` | API Key for optional NVIDIA NIM narrative enrichment | **OPTIONAL** | `nvapi-...` | `.env.production` |

---

## Security Best Practices
1. **Never commit `.env.production`**: It is explicitly ignored in `.gitignore` and `.dockerignore`.
2. **Key Generation**: Generate cryptographic keys using `openssl rand -hex 32`.
3. **Internal Port Isolation**: Port `8000` is strictly internal to the Docker network; only Nginx (ports 80 & 443) communicates with public clients.
