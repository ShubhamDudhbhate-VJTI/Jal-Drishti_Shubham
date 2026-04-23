# ── Jal-Drishti Backend — Production Dockerfile ──────────────
FROM python:3.11-slim

# Prevent Python from writing .pyc and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps for psycopg2, geopandas, etc.
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev libgdal-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Railway / Render inject PORT at runtime (default 8000)
ENV PORT=8000
EXPOSE ${PORT}

# Start with uvicorn — bind to 0.0.0.0:$PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
