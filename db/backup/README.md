# Database Backups

This directory contains PostgreSQL database backups for the Masterlist project.

## Backup Information

- **Database**: masterlist
- **Format**: Compressed SQL dumps (.sql.gz)
- **Created**: Before major operations like batch repository creation

## Current Backup

- **File**: `masterlist_backup_20250710_161223.sql.gz`
- **Date**: July 10, 2025, 4:12:23 PM
- **Size**: ~256KB (compressed from 2.1MB)
- **Contents**: 
  - 650 active projects
  - Admin user configuration
  - All project metadata
  - Batch job history (including dry run)

## Restore Instructions

To restore from a backup:

```bash
# Decompress the backup
gunzip masterlist_backup_TIMESTAMP.sql.gz

# Restore to database
PGPASSWORD=masterlist_password123 psql -h localhost -U masterlist_user -d masterlist < masterlist_backup_TIMESTAMP.sql
```

## Backup Command

To create a new backup:

```bash
# Run from project root
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PGPASSWORD=masterlist_password123 pg_dump -h localhost -U masterlist_user -d masterlist | gzip > "db/backup/masterlist_backup_${TIMESTAMP}.sql.gz"
```