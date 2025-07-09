#!/bin/bash
# Automated backup script for Masterlist data

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="masterlist_backup_${TIMESTAMP}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔄 Starting Masterlist backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create temporary backup directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy essential files
echo "Copying essential files..."
cp projects.json "$TEMP_DIR/"
cp project_tags.json "$TEMP_DIR/"

# Copy data directories
for dir in data qa_reports collaboration/data analytics/data; do
    if [ -d "$dir" ]; then
        echo "Copying $dir..."
        cp -r "$dir" "$TEMP_DIR/"
    fi
done

# Create metadata file
cat > "$TEMP_DIR/backup_metadata.json" << EOF
{
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "$(git describe --tags --always 2>/dev/null || echo 'unknown')",
    "files": $(find "$TEMP_DIR" -type f | wc -l),
    "size": "$(du -sh "$TEMP_DIR" | cut -f1)"
}
EOF

# Create archive
echo -e "${YELLOW}Creating archive...${NC}"
tar -czf "$BACKUP_DIR/${BACKUP_NAME}.tar.gz" -C "$TEMP_DIR" .

# Create checksum
cd "$BACKUP_DIR"
sha256sum "${BACKUP_NAME}.tar.gz" > "${BACKUP_NAME}.tar.gz.sha256"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp "${BACKUP_NAME}.tar.gz" "s3://${S3_BUCKET}/backups/" || {
        echo "Warning: S3 upload failed"
    }
fi

# Clean up old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "masterlist_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Generate backup report
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
BACKUP_COUNT=$(ls -1 masterlist_backup_*.tar.gz 2>/dev/null | wc -l)

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo ""
echo "Backup Summary:"
echo "==============="
echo "Name: ${BACKUP_NAME}.tar.gz"
echo "Size: $BACKUP_SIZE"
echo "Location: $BACKUP_DIR"
echo "Total backups: $BACKUP_COUNT"
echo "Retention: $RETENTION_DAYS days"
if [ -n "$S3_BUCKET" ]; then
    echo "S3 Bucket: $S3_BUCKET"
fi