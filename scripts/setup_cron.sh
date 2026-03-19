#!/bin/bash
# setup_cron.sh - adds cleanup_worker cron job
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

CRON_JOB="0 * * * * $PROJECT_DIR/scripts/run_cleanup.sh > /dev/null 2>&1"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -F "$PROJECT_DIR/scripts/run_cleanup.sh") && echo "Cron job already exists." && exit 0
# Add the cron job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "Cleanup worker cron job installed."