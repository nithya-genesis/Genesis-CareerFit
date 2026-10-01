# GENESIS CAREERFIT — PRODUCTION SERVER SECURITY & HARDENING PLAN

---

## 1. Operating System & Access Hardening

### SSH Key-Only Authentication
1. Generate an Ed25519 key pair on your local workstation: `ssh-keygen -t ed25519 -C "admin@genesiscareerfit.local"`.
2. Disable password authentication and root direct login in `/etc/ssh/sshd_config`:
   ```text
   PermitRootLogin prohibit-password
   PasswordAuthentication no
   PubkeyAuthentication yes
   X11Forwarding no
   MaxAuthTries 3
   ```
3. Restart SSH daemon: `sudo systemctl restart sshd`.

### Automated Security Patching
Enable Ubuntu unattended security updates:
```bash
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Intrusion Prevention (Fail2ban)
```bash
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban && sudo systemctl start fail2ban
```

---

## 2. Host Firewall Configuration (UFW)

Enforce strict default-deny ingress policy:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH Management
sudo ufw allow 80/tcp    # HTTP (Let's Encrypt validation & redirect)
sudo ufw allow 443/tcp   # HTTPS Public Traffic
sudo ufw enable
```
*(Notice: Port 8000 is intentionally kept blocked from the public Internet).*

---

## 3. Container & Docker Security Architecture

1. **Zero External Backend Port Exposure**:
   - In `docker-compose.production.yml`, the `api` service uses `expose: ["8000"]` (internal bridge network only), **never** `ports: ["8000:8000"]`.
2. **Reverse Proxy Edge Shield**:
   - All inbound web and API traffic terminates at Nginx (`web`), enforcing TLS 1.2 / 1.3 encryption, gzip compression, and body size limits (100MB max).
3. **Isolated Persistent Volume**:
   - The SQLite database (`genesis_careerfit.db`) is mounted from named volume `genesis_careerfit_data` to `/data`, preventing direct static web traversal or public file download.
4. **Environment Secret Protection**:
   - Production secrets (`SECRET_KEY`, `SMTP_PASSWORD`) are loaded strictly from `.env.production` at runtime and are excluded from Git repository tracking.
