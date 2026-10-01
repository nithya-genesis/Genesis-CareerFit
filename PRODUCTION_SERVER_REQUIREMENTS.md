# GENESIS CAREERFIT — PRODUCTION SERVER HARDWARE & SIZING REQUIREMENTS

---

## 1. Measured System Resource Metrics (Empirical Baseline)

| Component / Workload | Metric Type | Measured Value |
| :--- | :--- | :--- |
| **API Container Idle RAM** | **Measured** | **119.4 MiB** |
| **Nginx Container Idle RAM** | **Measured** | **7.35 MiB** |
| **Combined Stack Base Memory** | **Measured** | **~126.8 MiB** (< 3.5% of 4 GB RAM) |
| **Chromium PDF Compilation Peak** | **Measured** | **~250 – 400 MiB** (per active Chromium worker) |
| **Current SQLite Database File** | **Measured** | **98,074,624 bytes (93.53 MB)** (17 tables, 1,914 evaluation rows) |
| **Current Outputs Storage** | **Measured** | **820,507,154 bytes (782.50 MB)** (996 files, 746 PDFs, 164 ZIPs) |
| **6-Page Executive Summary PDF Size** | **Measured** | **~350 – 450 KB** |
| **12-Page Master Dossier PDF Size** | **Measured** | **~750 – 950 KB** |

---

## 2. Capacity Growth Estimates

| Dimension | Scaling Factor | Estimated Growth |
| :--- | :--- | :--- |
| **Database Storage Growth** | **Estimated** | ~5 MB per 1,000 evaluated candidates |
| **PDF Artifact Storage Growth** | **Estimated** | ~1.2 GB per 1,000 candidates (Summary + Master Dossiers) |
| **Report Generation Throughput** | **Estimated** | ~1.5 – 2.5 seconds per 6-page summary on 4 vCPU cloud server |

---

## 3. Server Sizing Configurations

### A. Configuration A — MINIMUM (Small College / Pilot)
- **vCPU**: 2 vCPUs (x86_64 or ARM64)
- **RAM**: 4 GB RAM
- **Disk**: 25 GB SSD
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS
- **Concurrent Users**: Up to 50 concurrent students / placement officers
- **Batch Processing**: Single-run sequential compilation
- **Monthly Cost Est.**: ~\$15 – \$25 / month *(Verify current provider pricing)*

### B. Configuration B — RECOMMENDED PRODUCTION (Multi-Department Campus)
- **vCPU**: 4 vCPUs (x86_64)
- **RAM**: 8 GB RAM
- **Disk**: 50 GB NVMe SSD
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS
- **Concurrent Users**: Up to 250 concurrent users
- **Batch Processing**: Concurrent candidate evaluation & multi-file ZIP generation
- **Monthly Cost Est.**: ~\$40 – \$60 / month *(Verify current provider pricing)*

### C. Configuration C — FUTURE SCALE (Statewide University Network)
- **vCPU**: 8 vCPUs (x86_64)
- **RAM**: 16 GB RAM
- **Disk**: 100 GB NVMe SSD + Attached Block Storage
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS
- **Concurrent Users**: Up to 1,000 concurrent users
- **Batch Processing**: High-throughput multi-institutional batch processing
- **Monthly Cost Est.**: ~\$80 – \$140 / month *(Verify current provider pricing)*
