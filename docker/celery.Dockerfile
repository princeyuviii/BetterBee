# ============================================================
# BetterBee — Celery Worker Dockerfile
# Shares the same base as the backend but runs celery instead
# ============================================================

FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# --- Dependencies Stage ---
FROM base AS deps

COPY pyproject.toml ./
RUN pip install --no-cache-dir -e "."

# --- Production Stage ---
FROM base AS production

COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .

# Run Celery worker with concurrency=2 (appropriate for M2)
CMD ["celery", "-A", "app.workers.celery_app", "worker", \
     "-l", "info", \
     "-Q", "default,document_processing", \
     "-c", "2", \
     "--prefetch-multiplier", "1"]
