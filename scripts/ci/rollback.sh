#!/bin/bash
# Rollback script for Masterlist deployments

set -e

# Configuration
APP_NAME="masterlist"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_HOST="${DEPLOY_HOST:-masterlist.app}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/masterlist}"
BACKUP_PATH="${BACKUP_PATH:-/var/backups/masterlist}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print colored output
log() {
    local level=$1
    local message=$2
    case $level in
        "INFO") echo -e "$message" ;;
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
    esac
}

# Parse arguments
ENVIRONMENT="${1:-staging}"
ROLLBACK_TO="${2:-previous}"

if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log "ERROR" "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production] [version|previous|backup]"
    exit 1
fi

log "WARNING" "Starting rollback for $ENVIRONMENT environment..."

# List available options
log "INFO" "Fetching rollback options..."

ssh "$DEPLOY_USER@$DEPLOY_HOST" << EOF
    echo "Available Docker images:"
    docker images | grep "$APP_NAME" | head -10
    
    echo -e "\nAvailable backups:"
    ls -lt "$BACKUP_PATH" | grep "$ENVIRONMENT" | head -10
EOF

# Confirm rollback
read -p "Continue with rollback to $ROLLBACK_TO? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "INFO" "Rollback cancelled"
    exit 0
fi

# Perform rollback
log "INFO" "Performing rollback..."

if [[ "$ROLLBACK_TO" == "backup" ]]; then
    # Restore from backup
    read -p "Enter backup filename: " BACKUP_FILE
    
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << EOF
        set -e
        
        # Verify backup exists
        if [[ ! -f "$BACKUP_PATH/$BACKUP_FILE" ]]; then
            echo "Backup file not found: $BACKUP_FILE"
            exit 1
        fi
        
        # Create restoration point
        cd "$DEPLOY_PATH"
        tar -czf "$BACKUP_PATH/pre_rollback_$(date +%Y%m%d_%H%M%S).tar.gz" \
            projects.json project_tags.json data/
        
        # Stop application
        docker stop "$APP_NAME-$ENVIRONMENT" || true
        
        # Restore backup
        tar -xzf "$BACKUP_PATH/$BACKUP_FILE" -C "$DEPLOY_PATH"
        
        # Restart application
        docker start "$APP_NAME-$ENVIRONMENT"
        
        echo "✅ Restored from backup: $BACKUP_FILE"
EOF
else
    # Rollback to previous Docker image
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << EOF
        set -e
        
        # Get current image
        CURRENT_IMAGE=\$(docker inspect "$APP_NAME-$ENVIRONMENT" --format='{{.Config.Image}}')
        echo "Current image: \$CURRENT_IMAGE"
        
        # Determine target image
        if [[ "$ROLLBACK_TO" == "previous" ]]; then
            TARGET_IMAGE="registry.masterlist.app/$APP_NAME:previous"
        else
            TARGET_IMAGE="registry.masterlist.app/$APP_NAME:$ROLLBACK_TO"
        fi
        
        echo "Rolling back to: \$TARGET_IMAGE"
        
        # Stop current container
        docker stop "$APP_NAME-$ENVIRONMENT"
        docker rm "$APP_NAME-$ENVIRONMENT"
        
        # Start previous version
        docker run -d \
            --name "$APP_NAME-$ENVIRONMENT" \
            --restart unless-stopped \
            -p 5000:5000 \
            -v "$DEPLOY_PATH/data:/app/data" \
            -v "$DEPLOY_PATH/logs:/app/logs" \
            -e FLASK_ENV="$ENVIRONMENT" \
            -e SECRET_KEY="\${SECRET_KEY}" \
            "\$TARGET_IMAGE"
        
        # Tag current as previous for future rollbacks
        docker tag "\$CURRENT_IMAGE" "registry.masterlist.app/$APP_NAME:rollback-$(date +%Y%m%d_%H%M%S)"
        
        echo "✅ Rolled back to: \$TARGET_IMAGE"
EOF
fi

# Verify rollback
log "INFO" "Verifying rollback..."

sleep 10

HEALTH_CHECK=$(ssh "$DEPLOY_USER@$DEPLOY_HOST" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/health")

if [[ "$HEALTH_CHECK" == "200" ]]; then
    log "SUCCESS" "Rollback completed successfully!"
    
    # Clear cache
    ssh "$DEPLOY_USER@$DEPLOY_HOST" "redis-cli FLUSHDB"
    
    # Send notification
    if [[ "$ENVIRONMENT" == "production" ]]; then
        echo "Masterlist rolled back in production to $ROLLBACK_TO" | \
            mail -s "Rollback Completed" ops@masterlist.app
    fi
else
    log "ERROR" "Health check failed after rollback (HTTP $HEALTH_CHECK)"
    exit 1
fi

# Log rollback
echo "$(date '+%Y-%m-%d %H:%M:%S') - Rolled back $ENVIRONMENT to $ROLLBACK_TO" >> rollbacks.log