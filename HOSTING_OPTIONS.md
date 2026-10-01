# GENESIS CAREERFIT — PRODUCTION CLOUD HOSTING EVALUATION

*(Notice: Pricing figures are representative estimates. **VERIFY CURRENT PRICE BEFORE PURCHASE**).*

---

## 1. Cloud Provider Comparison Matrix

| Provider | Recommended Instance / Plan | vCPU | RAM | SSD Storage | Monthly Est. Cost | Linux / Docker Support | Ease of Deployment | Recommendation Score |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Hetzner Cloud** | `CPX31` (AMD EPYC) | 4 vCPU | 8 GB | 160 GB NVMe | **~\$18 – \$25 / mo** | Native Ubuntu / Docker | **High** (Standard SSH + Docker Compose) | **TOP PICK (Best Value & NVMe Speed)** |
| **DigitalOcean** | Regular CPU Droplet | 4 vCPU | 8 GB | 160 GB SSD | **~\$48 – \$56 / mo** | Native 1-Click Docker | **Very High** (Clean UI, automated snapshots) | **HIGHLY RECOMMENDED (Easiest Ops)** |
| **AWS EC2** | `t3.xlarge` / `t4g.xlarge` | 4 vCPU | 8 GB / 16 GB | 50 GB gp3 | **~\$55 – \$85 / mo** | Amazon Linux / Ubuntu | **Medium** (VPC, Security Groups, IAM) | **ENTERPRISE GRADE** |
| **Google Cloud (GCE)**| `e2-standard-2` / `e2-standard-4` | 4 vCPU | 8 GB | 50 GB SSD | **~\$60 – \$95 / mo** | Debian / Ubuntu | **Medium** (GCP Console, Cloud Firewall) | **ENTERPRISE GRADE** |
| **Microsoft Azure** | `Standard_B4ms` | 4 vCPU | 8 GB | 50 GB Premium | **~\$65 – \$90 / mo** | Ubuntu Server | **Medium** (Azure Portal, NSGs) | **ENTERPRISE GRADE** |

---

## 2. Recommendation Rationales

1. **For Fastest Time-to-Deploy & Simplified Operations**:
   - **DigitalOcean 4 vCPU / 8 GB Droplet**: Native automated daily backups, simple firewall UI, predictable fixed monthly pricing, 1-click Docker support.
2. **For Maximum Compute Performance per Dollar**:
   - **Hetzner Cloud CPX31**: Industry-leading NVMe disk I/O throughput (critical for high-speed SQLite WAL operations and rapid PDF rendering) at extremely economical monthly rates.
3. **For Corporate / Institutional Cloud Compliance**:
   - **AWS EC2 (Ubuntu 22.04 on `t4g.xlarge` or `t3.xlarge`)**: Conforms to existing enterprise AWS infrastructure, IAM policies, and VPC peering standards.
