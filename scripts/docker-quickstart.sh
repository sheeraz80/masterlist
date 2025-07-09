#!/bin/bash
# Quick start script for Masterlist with Docker

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Print colored output
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# ASCII Art
echo -e "${BLUE}"
cat << "EOF"
╔╦╗╔═╗╔═╗╔╦╗╔═╗╦═╗╦  ╦╔═╗╔╦╗
║║║╠═╣╚═╗ ║ ║╣ ╠╦╝║  ║╚═╗ ║ 
╩ ╩╩ ╩╚═╝ ╩ ╚═╝╩╚═╩═╝╩╚═╝ ╩ 
EOF
echo -e "${NC}"
echo "Welcome to Masterlist Docker Quick Start!"
echo ""

# Check Docker installation
print_status "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

print_success "Docker and Docker Compose are installed"

# Check if running
if docker-compose ps | grep -q "Up"; then
    print_warning "Masterlist is already running!"
    echo ""
    read -p "Do you want to restart? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping existing containers..."
        docker-compose down
    else
        exit 0
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created (please edit it with your settings)"
fi

# Ask for environment
echo ""
echo "Select environment:"
echo "1) Development (with hot reload, debugging tools)"
echo "2) Production (optimized, secure)"
echo ""
read -p "Enter choice [1-2]: " ENV_CHOICE

case $ENV_CHOICE in
    1)
        ENV="development"
        COMPOSE_CMD="docker-compose -f docker-compose.yml -f docker-compose.dev.yml"
        ;;
    2)
        ENV="production"
        COMPOSE_CMD="docker-compose"
        ;;
    *)
        print_error "Invalid choice. Using development environment."
        ENV="development"
        COMPOSE_CMD="docker-compose -f docker-compose.yml -f docker-compose.dev.yml"
        ;;
esac

print_status "Starting Masterlist in $ENV mode..."

# Build images
print_status "Building Docker images..."
$COMPOSE_CMD build

# Start services
print_status "Starting services..."
$COMPOSE_CMD up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 5

# Check health
if curl -s http://localhost:5000/health > /dev/null; then
    print_success "Services are healthy!"
else
    print_warning "Services may still be starting up..."
fi

# Display access information
echo ""
echo -e "${GREEN}🚀 Masterlist is running!${NC}"
echo ""
echo "Access the services:"
echo "  • Web Interface: http://localhost:5000"

if [ "$ENV" = "development" ]; then
    echo "  • Redis Commander: http://localhost:8081"
    echo "  • Jupyter Lab: http://localhost:8888"
    
    # Check if optional services are requested
    read -p "Start optional services? (database, email testing) (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Starting optional services..."
        $COMPOSE_CMD --profile with-db --profile with-mail up -d
        echo "  • Database GUI: http://localhost:8082"
        echo "  • Email Testing: http://localhost:8025"
    fi
fi

echo ""
echo "Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Open shell: docker-compose exec web bash"
echo "  • Run tests: docker-compose exec web pytest"
echo ""

# Generate initial reports
read -p "Generate initial reports and insights? (Y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_status "Generating reports..."
    docker-compose exec web python analytics/report_generator.py all
    print_success "Reports generated in data/reports/"
    
    print_status "Generating AI insights..."
    docker-compose exec web python insights/ai_insights.py --generate-all || {
        print_warning "AI insights generation failed (check your OpenAI API key)"
    }
fi

print_success "Setup complete! Enjoy using Masterlist!"

# Open browser
if command -v open &> /dev/null; then
    open http://localhost:5000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5000
fi