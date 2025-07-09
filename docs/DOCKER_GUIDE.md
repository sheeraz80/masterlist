# Docker Guide for Masterlist

This guide covers running Masterlist using Docker and Docker Compose for both development and production environments.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Setup](#development-setup)
3. [Production Setup](#production-setup)
4. [Available Services](#available-services)
5. [Common Commands](#common-commands)
6. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Basic Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/masterlist.git
cd masterlist

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
open http://localhost:5000
```

## Development Setup

### Using Development Compose File

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the override file (automatically loaded)
docker-compose up

# Start with specific profiles
docker-compose --profile with-db up      # Include PostgreSQL
docker-compose --profile with-mail up    # Include Mailhog
docker-compose --profile with-docs up    # Include documentation server
```

### Development Features

1. **Hot Reload**: Code changes are automatically reflected
2. **Debug Port**: Python debugger available on port 5678
3. **Redis Commander**: Redis GUI at http://localhost:8081
4. **Jupyter Lab**: Data analysis at http://localhost:8888
5. **Mailhog**: Email testing at http://localhost:8025

### Accessing Services

```bash
# Web application
http://localhost:5000

# Redis Commander
http://localhost:8081

# Jupyter Lab
http://localhost:8888

# Adminer (database GUI)
http://localhost:8082

# Mailhog (email testing)
http://localhost:8025

# Documentation
http://localhost:8000
```

## Production Setup

### Building for Production

```bash
# Build production image
docker build -t masterlist:latest --target production .

# Run with production compose
docker-compose -f docker-compose.yml up -d

# With environment variables
docker-compose --env-file .env.production up -d
```

### Production Configuration

Create `.env.production`:

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Database Configuration (future)
DATABASE_URL=postgresql://user:pass@postgres:5432/masterlist

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-password
```

## Available Services

### Core Services

| Service | Description | Port | Profile |
|---------|-------------|------|---------|
| web | Main Flask application | 5000 | default |
| redis | Cache and session storage | 6379 | default |
| nginx | Reverse proxy | 80, 443 | default |

### Development Services

| Service | Description | Port | Profile |
|---------|-------------|------|---------|
| redis-commander | Redis GUI | 8081 | default |
| jupyter | Jupyter Lab | 8888 | default |
| postgres | PostgreSQL database | 5432 | with-db |
| adminer | Database GUI | 8082 | with-db |
| mailhog | Email testing | 8025 | with-mail |
| docs | Documentation server | 8000 | with-docs |

### Background Workers

| Service | Description | Schedule |
|---------|-------------|----------|
| worker-analytics | Generate reports | Every hour |
| worker-insights | AI insights | Every 6 hours |

## Common Commands

### Container Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a service
docker-compose restart web

# View logs
docker-compose logs -f web

# Execute commands in container
docker-compose exec web python tag_search.py "ai-powered"
docker-compose exec web python qa/quality_scorer.py --validate-all

# Open shell in container
docker-compose exec web bash
```

### Data Management

```bash
# Backup data
docker-compose exec web tar -czf /backups/backup.tar.gz \
    projects.json project_tags.json data/

# Copy backup to host
docker cp masterlist-web:/backups/backup.tar.gz ./backup.tar.gz

# Restore data
docker cp ./backup.tar.gz masterlist-web:/tmp/
docker-compose exec web tar -xzf /tmp/backup.tar.gz
```

### Development Commands

```bash
# Run tests
docker-compose exec web pytest tests/

# Format code
docker-compose exec web black .

# Run linting
docker-compose exec web flake8 .

# Generate reports
docker-compose exec web python analytics/report_generator.py all

# Access Python shell
docker-compose exec web python
```

### Database Operations

```bash
# Access PostgreSQL (if using)
docker-compose exec postgres psql -U masterlist

# Run migrations
docker-compose exec web python scripts/migrate.py

# Backup database
docker-compose exec postgres pg_dump -U masterlist > backup.sql
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: bind: address already in use

# Solution 1: Change port in docker-compose.override.yml
ports:
  - "5001:5000"  # Use different port

# Solution 2: Stop conflicting service
sudo lsof -i :5000
kill -9 <PID>
```

#### 2. Permission Errors
```bash
# Error: Permission denied

# Solution: Fix ownership
docker-compose exec web chown -R appuser:appuser /app/data
```

#### 3. Out of Memory
```bash
# Error: Container killed due to memory limit

# Solution: Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

#### 4. Slow Performance
```bash
# On macOS/Windows, exclude large directories from bind mounts

volumes:
  - ./:/app
  - /app/venv         # Exclude venv
  - /app/node_modules # Exclude node_modules
  - /app/__pycache__  # Exclude cache
```

### Debug Mode

```bash
# Enable debug logging
docker-compose exec web bash
export FLASK_DEBUG=1
export LOG_LEVEL=DEBUG
python web/app.py

# View container resource usage
docker stats

# Inspect container
docker inspect masterlist-web

# View network
docker network inspect masterlist-network
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:5000/health

# View health status
docker inspect masterlist-web --format='{{.State.Health.Status}}'
```

## Best Practices

1. **Use Named Volumes**: For persistent data
2. **Set Resource Limits**: Prevent runaway containers
3. **Use Health Checks**: Ensure service availability
4. **Separate Environments**: Use different compose files
5. **Security**: Don't commit secrets, use env files
6. **Logging**: Configure log rotation
7. **Backups**: Regular automated backups

## Advanced Configuration

### Custom Network
```yaml
networks:
  masterlist-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Volume Configuration
```yaml
volumes:
  data:
    driver: local
    driver_opts:
      type: none
      device: /path/to/data
      o: bind
```

### Multi-Environment Setup
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Monitoring

### Using Prometheus and Grafana
```bash
# Start monitoring stack
docker-compose --profile monitoring up

# Access services
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

### Logs Aggregation
```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f web

# Export logs
docker-compose logs > masterlist.log
```

Remember to regularly update your Docker images and review security best practices!