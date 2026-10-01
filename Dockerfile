# ==============================================================================
# Genesis CareerFit - Production Dockerfile
# Python 3.12 Slim + Linux Headless Chromium PDF Compilation Engine
# ==============================================================================

FROM python:3.12-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive \
    CHROME_PATH=/usr/bin/chromium \
    DATABASE_PATH=/data/genesis_careerfit.db \
    OUTPUTS_DIR=/data/outputs \
    PORT=8000 \
    HOST=0.0.0.0

# Install required Linux system packages for Headless Chromium and PDF typography
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libasound2 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python production dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application runtime source code
COPY config/ ./config/
COPY engines/ ./engines/
COPY services/ ./services/
COPY providers/ ./providers/
COPY models/ ./models/
COPY utils/ ./utils/
COPY templates/ ./templates/
COPY client/public/ ./client/public/
COPY client/dist/ ./client/dist/
COPY server.py ./server.py
COPY app.py ./app.py

# Create persistent storage mount directories
RUN mkdir -p /data/outputs && chmod -R 777 /data

# Expose internal API port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start ASGI application server with 1 worker for SQLite consistency
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
