# GENESIS CAREERFIT — DATABASE PRODUCTION RUNBOOK

This runbook defines the operational procedures for managing, backing up, restoring, and verifying the production SQLite database for Genesis CareerFit.

---

## 1. Database Architecture & Persistent Storage

- **Database Engine**: SQLite 3 (WAL mode enabled, `PRAGMA synchronous = NORMAL`)
- **Container Path**: `/data/genesis_careerfit.db`
- **Host Persistent Storage**: Docker Named Volume `genesis_careerfit_data` mounted to `/data`
- **WAL Files**: `/data/genesis_careerfit.db-wal` and `/data/genesis_careerfit.db-shm`
- **Zero In-Memory Volatility**: The database is never stored inside ephemeral image layers.

---

## 2. Automated Safe Backup Procedure

Because SQLite is running in WAL (Write-Ahead Logging) mode, a live hot backup must be taken using the SQLite Online Backup API (`.backup` command) to prevent partial write corruption:

```bash
#!/bin/bash
# Recommended Execution: Run via daily cron job at 02:00 UTC
BACKUP_ROOT="/opt/careerfit_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_DIR="${BACKUP_ROOT}/backup_${TIMESTAMP}"
mkdir -p "${TARGET_DIR}"

# 1. Hot snapshot using sqlite3 backup API inside container
docker exec genesis_careerfit_api sqlite3 /data/genesis_careerfit.db ".backup '/data/backup_temp.db'"

# 2. Copy snapshot and outputs to host backup directory
docker cp genesis_careerfit_api:/data/backup_temp.db "${TARGET_DIR}/genesis_careerfit.db"
docker exec genesis_careerfit_api rm /data/backup_temp.db

# 3. Copy uploaded datasets and report artifacts
docker cp genesis_careerfit_api:/data/outputs "${TARGET_DIR}/outputs"

# 4. Verify integrity of newly created backup
sqlite3 "${TARGET_DIR}/genesis_careerfit.db" "PRAGMA integrity_check;" > "${TARGET_DIR}/integrity.log"

echo "Backup completed and verified at ${TARGET_DIR}"
```

---

## 3. Database Restoration Procedure

To restore from a verified snapshot:

```bash
# 1. Stop production container stack
docker compose -f docker-compose.production.yml down

# 2. Restore database and outputs into persistent volume using a helper container
RESTORE_SOURCE="/opt/careerfit_backups/backup_TARGET_TIMESTAMP"

docker run --rm \
  -v genesis_careerfit_data:/data \
  -v "${RESTORE_SOURCE}":/backup \
  alpine sh -c "cp /backup/genesis_careerfit.db /data/genesis_careerfit.db && cp -r /backup/outputs/* /data/outputs/"

# 3. Start production container stack
docker compose -f docker-compose.production.yml up -d

# 4. Verify health
curl -f http://localhost/health
```

---

## 4. Integrity Verification Commands

Run an on-demand integrity audit against the live database:

```bash
# SQLite quick check
docker exec genesis_careerfit_api sqlite3 /data/genesis_careerfit.db "PRAGMA quick_check;"

# SQLite full integrity check
docker exec genesis_careerfit_api sqlite3 /data/genesis_careerfit.db "PRAGMA integrity_check;"

# Table inventory count
docker exec genesis_careerfit_api python -c "
import sqlite3
conn = sqlite3.connect('/data/genesis_careerfit.db')
cur = conn.cursor()
cur.execute(\"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;\")
tables = [r[0] for r in cur.fetchall()]
print(f'Total Tables: {len(tables)}')
for t in tables:
    cur.execute(f'SELECT COUNT(*) FROM \"{t}\"')
    print(f'  {t:<30}: {cur.fetchone()[0]} rows')
conn.close()
"
```

---

## 5. Recommended Backup Frequency & Retention

| Backup Type | Frequency | Retention Period | Storage Location |
| :--- | :--- | :--- | :--- |
| **Hourly Snapshot** | Every 1 hour during business hours | 48 hours | Local server SSD (`/opt/careerfit_backups/hourly`) |
| **Daily Full Backup** | Daily at 02:00 UTC | 30 days | Off-site S3 / GCS bucket (encrypted) |
| **Pre-Upload Snapshot** | Triggered before large CSV batch upload | 14 days | Local server SSD (`/opt/careerfit_backups/pre_upload`) |
