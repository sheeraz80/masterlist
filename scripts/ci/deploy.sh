#!/bin/bash
# Deployment script for Masterlist

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
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO") echo -e "${BLUE}[$timestamp]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[$timestamp] ✅ $message${NC}" ;;
        "ERROR") echo -e "${RED}[$timestamp] ❌ $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}[$timestamp] ⚠️  $message${NC}" ;;
    esac
}

# Parse command line arguments
ENVIRONMENT="${1:-staging}"
VERSION="${2:-latest}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log "ERROR" "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production] [version]"
    exit 1
fi

log "INFO" "Starting deployment to $ENVIRONMENT (version: $VERSION)"

# Pre-deployment checks
log "INFO" "Running pre-deployment checks..."

# Check if deployment host is reachable
if ! ping -c 1 "$DEPLOY_HOST" &> /dev/null; then
    log "ERROR" "Cannot reach deployment host: $DEPLOY_HOST"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log "WARNING" "Low disk space: ${DISK_USAGE}% used"
fi

# Create backup
log "INFO" "Creating backup..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_PATH/backup_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"

ssh "$DEPLOY_USER@$DEPLOY_HOST" << EOF
    mkdir -p "$BACKUP_PATH"
    cd "$DEPLOY_PATH"
    tar -czf "$BACKUP_FILE" \
        projects.json \
        project_tags.json \
        data/ \
        --exclude='*.log' \
        --exclude='__pycache__'
    echo "Backup created: $BACKUP_FILE"
EOF

# Deploy application
log "INFO" "Deploying application..."

# Build Docker image
if [[ "$VERSION" == "latest" ]]; then
    docker build -t "$APP_NAME:$VERSION" .
else
    docker pull "$APP_NAME:$VERSION"
fi

# Tag image for registry
docker tag "$APP_NAME:$VERSION" "registry.masterlist.app/$APP_NAME:$VERSION"
docker push "registry.masterlist.app/$APP_NAME:$VERSION"

# Deploy to server
ssh "$DEPLOY_USER@$DEPLOY_HOST" << EOF
    set -e
    
    # Pull new image
    docker pull "registry.masterlist.app/$APP_NAME:$VERSION"
    
    # Stop current container
    docker stop "$APP_NAME-$ENVIRONMENT" || true
    docker rm "$APP_NAME-$ENVIRONMENT" || true
    
    # Start new container
    docker run -d \
        --name "$APP_NAME-$ENVIRONMENT" \
        --restart unless-stopped \
        -p 5000:5000 \
        -v "$DEPLOY_PATH/data:/app/data" \
        -v "$DEPLOY_PATH/logs:/app/logs" \
        -e FLASK_ENV="$ENVIRONMENT" \
        -e SECRET_KEY="\${SECRET_KEY}" \
        "registry.masterlist.app/$APP_NAME:$VERSION"
    
    # Wait for application to start
    sleep 10
    
    # Health check
    if curl -f "http://localhost:5000/health" > /dev/null 2>&1; then
        echo "✅ Application is healthy"
    else
        echo "❌ Health check failed"
        exit 1
    fi
EOF

# Run post-deployment tasks
log "INFO" "Running post-deployment tasks..."

# Update nginx configuration
ssh "$DEPLOY_USER@$DEPLOY_HOST" << 'EOF'
    # Reload nginx
    sudo nginx -t && sudo systemctl reload nginx
    
    # Clear cache
    redis-cli FLUSHDB
    
    # Run migrations (if any)
    docker exec "$APP_NAME-$ENVIRONMENT" python scripts/migrate.py
    
    # Generate fresh reports
    docker exec "$APP_NAME-$ENVIRONMENT" python analytics/report_generator.py all
EOF

# Verify deployment
log "INFO" "Verifying deployment..."

# Run smoke tests
SMOKE_TEST_RESULT=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_HOST/api/health")
if [[ "$SMOKE_TEST_RESULT" == "200" ]]; then
    log "SUCCESS" "Deployment successful!"
else
    log "ERROR" "Smoke test failed (HTTP $SMOKE_TEST_RESULT)"
    
    # Rollback
    log "WARNING" "Initiating rollback..."
    ssh "$DEPLOY_USER@$DEPLOY_HOST" << EOF
        # Stop failed container
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
            "registry.masterlist.app/$APP_NAME:previous"
EOF
    exit 1
fi

# Send notification
log "INFO" "Sending deployment notification..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    # Send email notification
    echo "Masterlist deployed to production (version: $VERSION)" | \
        mail -s "Deployment Success" ops@masterlist.app
    
    # Send Slack notification
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Masterlist deployed to production (version: $VERSION)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

# Clean up old images
log "INFO" "Cleaning up old images..."
docker image prune -f --filter "until=168h"

# Update deployment log
echo "$(date '+%Y-%m-%d %H:%M:%S') - Deployed $VERSION to $ENVIRONMENT" >> deployments.log

log "SUCCESS" "Deployment completed successfully!"