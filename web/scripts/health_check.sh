#!/bin/bash
# Health check script for Masterlist application

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:5000}"
TIMEOUT="${TIMEOUT:-5}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Track overall health
HEALTH_STATUS=0

echo "🏥 Masterlist Health Check"
echo "========================="
echo ""

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $response)"
        HEALTH_STATUS=1
        return 1
    fi
}

# Function to check response time
check_performance() {
    local endpoint=$1
    local description=$2
    local max_time=${3:-1000}  # milliseconds
    
    echo -n "Performance check for $description... "
    
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$BASE_URL$endpoint" || echo "999")
    response_time_ms=$(echo "$response_time * 1000" | bc | cut -d'.' -f1)
    
    if [ "$response_time_ms" -lt "$max_time" ]; then
        echo -e "${GREEN}✅ OK${NC} (${response_time_ms}ms)"
        return 0
    else
        echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time_ms}ms)"
        return 1
    fi
}

# Function to check data integrity
check_data() {
    echo -n "Checking data integrity... "
    
    # Check if projects exist
    project_count=$(curl -s "$BASE_URL/api/stats" | python -c "import sys, json; print(json.load(sys.stdin).get('total_projects', 0))" 2>/dev/null || echo "0")
    
    if [ "$project_count" -gt "0" ]; then
        echo -e "${GREEN}✅ OK${NC} ($project_count projects)"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (No projects found)"
        HEALTH_STATUS=1
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    echo -n "Checking disk space... "
    
    usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 90 ]; then
        echo -e "${GREEN}✅ OK${NC} (${usage}% used)"
        return 0
    else
        echo -e "${RED}❌ WARNING${NC} (${usage}% used)"
        HEALTH_STATUS=1
        return 1
    fi
}

# Function to check process
check_process() {
    local process=$1
    echo -n "Checking $process process... "
    
    if pgrep -f "$process" > /dev/null; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${RED}❌ Not running${NC}"
        HEALTH_STATUS=1
        return 1
    fi
}

# Run health checks
echo "1. API Endpoints"
echo "----------------"
check_endpoint "/" "Home page"
check_endpoint "/api/stats" "Stats API"
check_endpoint "/api/projects" "Projects API"
check_endpoint "/api/tags" "Tags API"
check_endpoint "/api/analytics/overview" "Analytics API"

echo ""
echo "2. Performance"
echo "--------------"
check_performance "/api/stats" "Stats API" 500
check_performance "/api/projects?per_page=10" "Projects API" 1000
check_performance "/api/analytics/overview" "Analytics API" 2000

echo ""
echo "3. Data & System"
echo "----------------"
check_data
check_disk_space

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo ""
    echo "4. Docker Health"
    echo "----------------"
    
    # Check container status
    echo -n "Checking container status... "
    if docker ps | grep -q "masterlist-web"; then
        echo -e "${GREEN}✅ Container running${NC}"
    else
        echo -e "${RED}❌ Container not found${NC}"
        HEALTH_STATUS=1
    fi
fi

# Advanced checks (optional)
if [ "$1" = "--full" ]; then
    echo ""
    echo "5. Advanced Checks"
    echo "------------------"
    
    # Check database connections
    echo -n "Checking data file access... "
    if [ -r "projects.json" ] && [ -r "project_tags.json" ]; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
        HEALTH_STATUS=1
    fi
    
    # Check write permissions
    echo -n "Checking write permissions... "
    if touch data/test_write_$$ 2>/dev/null; then
        rm -f data/test_write_$$
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
        HEALTH_STATUS=1
    fi
    
    # Check error logs
    echo -n "Checking for recent errors... "
    if [ -f "app.log" ]; then
        error_count=$(tail -n 1000 app.log | grep -c "ERROR" || true)
        if [ "$error_count" -eq 0 ]; then
            echo -e "${GREEN}✅ No errors${NC}"
        else
            echo -e "${YELLOW}⚠️  $error_count errors found${NC}"
        fi
    else
        echo -e "${GREEN}✅ No log file${NC}"
    fi
fi

# Summary
echo ""
echo "Health Check Summary"
echo "==================="
if [ $HEALTH_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed - System is healthy${NC}"
else
    echo -e "${RED}❌ Some checks failed - System needs attention${NC}"
fi

exit $HEALTH_STATUS