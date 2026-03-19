#!/bin/bash
# remove_cron.sh - removes cleanup_worker cron job
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CRON_CMD="$PROJECT_DIR/scripts/run_cleanup.sh > /dev/null 2>&1"

(crontab -l 2>/dev/null | grep -vF "$CRON_CMD") | crontab -

echo "Cleanup worker cron job removed."