# GENESIS CAREERFIT — PRODUCTION NETWORK & SECURITY ARCHITECTURE

This document describes the production network topology, security isolation boundaries, and reverse proxy routing for the Genesis CareerFit platform.

---

## 1. Network Topology & Isolation Diagram

```
                        [ Internet Clients / Web Browsers ]
                                         │
                                         ▼ (HTTPS Port 443 / TLS 1.3)
                  ┌─────────────────────────────────────────────┐
                  │          PUBLIC HOST FIREWALL (UFW)         │
                  │             Exposed Ports: 80, 443          │
                  └──────────────────────┬──────────────────────┘
                                         │
                                         ▼
                  ┌─────────────────────────────────────────────┐
                  │       NGINX REVERSE PROXY (Container)       │
                  │             Image: nginx:alpine             │
                  │  • TLS Termination & HTTP->HTTPS Redirect   │
                  │  • Static React Bundle (/usr/share/nginx)   │
                  │  • Gzip Compression & 100MB Body Limit      │
                  └──────────────────────┬──────────────────────┘
                                         │
                  ═══════════════════════╪═════════════════════════════════
                  DOCKER INTERNAL BRIDGE NETWORK (genesis_careerfit_internal)
                  (Port 8000 is UNEXPOSED to external network)
                  ═══════════════════════╪═════════════════════════════════
                                         │
                                         ▼ (HTTP :8000)
                  ┌─────────────────────────────────────────────┐
                  │         FASTAPI ASGI BACKEND (Container)    │
                  │        Image: Python 3.12 Slim + Chromium   │
                  │  • RBAC & JWT Session Authorization         │
                  │  • Ingestion & Canonical Scoring Engines    │
                  │  • Headless Chromium PDF Generation Engine  │
                  └──────────────────────┬──────────────────────┘
                                         │
                                         ▼ (Filesystem Mount)
                  ┌─────────────────────────────────────────────┐
                  │     PERSISTENT VOLUME (genesis_careerfit)   │
                  │  • /data/genesis_careerfit.db (SQLite WAL)  │
                  │  • /data/outputs (Uploaded CSVs, PDFs, ZIPs)│
                  └─────────────────────────────────────────────┘
```

---

## 2. Security Boundaries

1. **Zero Direct Access to Backend**: The FastAPI backend listens on `0.0.0.0:8000` *inside* the Docker container network only. No host port is mapped to port 8000 in `docker-compose.production.yml`.
2. **Reverse Proxy Enforcement**: All client requests must enter through Nginx on ports 80 (redirected) or 443 (TLS).
3. **Database Isolation**: The SQLite database file (`/data/genesis_careerfit.db`) is stored in a dedicated Docker persistent volume and is not mapped to any static web root or HTTP endpoint.
4. **Header Sanitization**: Nginx sanitizes and forwards standard proxy headers (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `Host`) to prevent host-header injection.
5. **Payload Limits**: `client_max_body_size 100M` permits large candidate CSV uploads while rejecting denial-of-service payload floods.
