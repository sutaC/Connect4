#!/bin/bash
# run_cleanup.sh - wrapper to run cleanup_worker in Docker
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

docker compose \
  -f "$PROJECT_DIR/docker-compose.yml" \
  --profile manual \
  run --rm cleanup_worker 2>/dev/null