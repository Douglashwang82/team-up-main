# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PostgreSQL and PostGIS
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create a non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port (Railway uses PORT env var, default to 8080)
EXPOSE 8080

# Run gunicorn with proper logging
# Railway will set PORT environment variable
CMD gunicorn wsgi:app \
    --bind 0.0.0.0:${PORT:-8080} \
    --workers 2 \
    --timeout 120 \
    --log-level info \
    --access-logfile - \
    --error-logfile -
