# GENESIS CAREERFIT — PRODUCTION DOCKER IMAGE & CONTAINER INVENTORY

---

## 1. Container Images Specification

### Backend API Image (`api`)
- **Image Repository / Tag**: `genesis_carrier_fit-develop-api:latest`
- **Base Image**: `python:3.12-slim-bookworm`
- **Architecture**: `linux/amd64` (x86_64)
- **Image Size**: `1.58 GB` (Includes Python 3.12, Chromium binary, Liberation/DejaVu font packs, C shared libraries)
- **Container Name**: `genesis_careerfit_api`
- **Internal Port**: `8000/tcp` (Not exposed to host network)
- **Entrypoint / CMD**: `["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]`
- **Healthcheck**: `curl -f http://localhost:8000/health || exit 1` (Interval: 30s, Timeout: 5s, Retries: 3, Start Period: 10s)
- **Restart Policy**: `unless-stopped`

### Web & Reverse Proxy Image (`web`)
- **Image Repository / Tag**: `nginx:alpine`
- **Base Image**: `alpine:3.21`
- **Architecture**: `linux/amd64` (x86_64)
- **Image Size**: `23.5 MB`
- **Container Name**: `genesis_careerfit_web`
- **Published Host Ports**: `80:80` (HTTP), `443:443` (HTTPS)
- **Static Assets Root**: `/usr/share/nginx/html` (Bound to `client/dist/`)
- **Restart Policy**: `unless-stopped`

---

## 2. Storage Volumes & Networks

| Resource Type | Name | Mount Point | Purpose |
| :--- | :--- | :--- | :--- |
| **Named Volume** | `genesis_careerfit_data` | `/data` | Houses persistent SQLite database (`/data/genesis_careerfit.db`) and uploaded datasets/reports (`/data/outputs`) |
| **Host Bind Mount** | `./client/dist` | `/usr/share/nginx/html:ro` | Serves compiled React 18 production frontend |
| **Host Bind Mount** | `./nginx/default.conf`| `/etc/nginx/conf.d/default.conf:ro` | Nginx reverse proxy routing and SPA fallback |
| **Bridge Network** | `genesis_careerfit_internal` | N/A | Secure internal network connecting `api` and `web` containers |

---

## 3. Environment Variable Binding Contract

```yaml
services:
  api:
    environment:
      - DATABASE_PATH=/data/genesis_careerfit.db
      - OUTPUTS_DIR=/data/outputs
      - CHROME_PATH=/usr/bin/chromium
      - HOST=0.0.0.0
      - PORT=8000
    env_file:
      - .env.production
```
