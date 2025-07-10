#!/bin/bash

echo "=== MONITORING REPOSITORY CREATION ==="
echo ""
echo "This script will continuously monitor the batch creation process"
echo "Press Ctrl+C to stop monitoring (creation will continue)"
echo ""

# Run the monitoring script
npx tsx scripts/monitor-batch-job.ts