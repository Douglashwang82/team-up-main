#!/usr/bin/env bash
set -euo pipefail
alembic upgrade head
exec flask --app app:create_app run --host=0.0.0.0 --port="${FLASK_RUN_PORT:-8080}"