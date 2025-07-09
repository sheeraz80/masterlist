#!/bin/bash
# Deployment script for Masterlist application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
DOCKER_REGISTRY="ghcr.io/yourusername/masterlist"
VERSION=${2:-latest}

echo -e "${GREEN}🚀 Deploying Masterlist to ${ENVIRONMENT}${NC}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [staging|production] [version]"
    exit 1
fi

# Pre-deployment checks
echo -e "${YELLOW}Running pre-deployment checks...${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check required files exist
REQUIRED_FILES=(
    "docker-compose.yml"
    "Dockerfile"
    "projects.json"
    "project_tags.json"
    "requirements.txt"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done

# Validate JSON files
echo "Validating data files..."
python -m json.tool projects.json > /dev/null || {
    echo -e "${RED}❌ Invalid projects.json${NC}"
    exit 1
}
python -m json.tool project_tags.json > /dev/null || {
    echo -e "${RED}❌ Invalid project_tags.json${NC}"
    exit 1
}

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp projects.json project_tags.json "$BACKUP_DIR/"
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup created: $BACKUP_DIR.tar.gz${NC}"

# Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t masterlist:$VERSION .
docker tag masterlist:$VERSION $DOCKER_REGISTRY:$VERSION

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
docker run --rm masterlist:$VERSION python -m pytest tests/ || {
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
}

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}Deploying to production...${NC}"
    
    # Stop current containers
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    
    # Pull latest images
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
    
    # Start with zero downtime
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --scale web=2 web
    
    # Wait for health check
    sleep 10
    
    # Remove old container
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --remove-orphans web
    
else
    echo -e "${YELLOW}Deploying to staging...${NC}"
    
    # Simple deployment for staging
    docker-compose down
    docker-compose up -d
fi

# Post-deployment tasks
echo -e "${YELLOW}Running post-deployment tasks...${NC}"

# Run migrations (if any)
docker-compose exec -T web python scripts/migrate.py || true

# Generate initial reports
docker-compose run --rm analytics

# Generate AI insights
docker-compose run --rm insights

# Health check
echo -e "${YELLOW}Running health checks...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:5000/api/stats > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
        break
    fi
    
    echo "Waiting for application to start... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Application failed to start${NC}"
    docker-compose logs web
    exit 1
fi

# Show deployment summary
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Deployment Summary:"
echo "==================="
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "URL: http://localhost:5000"
echo ""
echo "Next steps:"
echo "- Check application logs: docker-compose logs -f"
echo "- View analytics dashboard: http://localhost:5000/analytics"
echo "- Run quality check: docker-compose run --rm quality"