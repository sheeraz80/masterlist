# Automation and CI/CD Pipeline

This directory contains automation scripts and CI/CD configuration for the Masterlist project.

## Overview

The automation system provides:
- Continuous Integration with GitHub Actions
- Automated testing and quality checks
- Scheduled tasks for maintenance
- Deployment pipelines
- Backup automation
- Health monitoring

## CI/CD Pipeline

### GitHub Actions Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push and pull request
   - Executes linting, testing, and quality checks
   - Supports multiple Python versions
   - Generates coverage reports
   - Performs security scanning

2. **Scheduled Tasks** (`.github/workflows/scheduled-tasks.yml`)
   - Runs every 6 hours
   - Generates AI insights
   - Updates quality scores
   - Creates backups
   - Cleans up old data

3. **Deploy Pipeline** (`.github/workflows/deploy.yml`)
   - Triggered on tags and manual dispatch
   - Builds and pushes Docker images
   - Deploys to staging/production
   - Includes rollback mechanism

## Scripts

### deploy.sh
Deployment script with pre-flight checks and health verification.

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production with specific version
./scripts/deploy.sh production v1.2.3
```

### backup.sh
Automated backup with retention and optional S3 upload.

```bash
# Create local backup
./scripts/backup.sh

# Backup with S3 upload
S3_BUCKET=my-bucket ./scripts/backup.sh

# Custom retention period
RETENTION_DAYS=60 ./scripts/backup.sh
```

### health_check.sh
Comprehensive health monitoring script.

```bash
# Basic health check
./scripts/health_check.sh

# Full health check with advanced tests
./scripts/health_check.sh --full
```

## Docker Setup

### Building Images
```bash
# Build main application
docker build -t masterlist:latest .

# Build with specific tag
docker build -t masterlist:v1.2.3 .
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up web

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Makefile Commands

The project includes a comprehensive Makefile for common tasks:

```bash
# Install dependencies
make install

# Run tests
make test

# Run linting
make lint

# Format code
make format

# Build Docker images
make build

# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-production

# Create backup
make backup

# Run health check
make health-check

# Generate reports
make reports

# Full maintenance routine
make daily-maintenance
```

## Environment Variables

### Application
- `FLASK_ENV`: Flask environment (development/production)
- `BASE_URL`: Base URL for the application
- `SECRET_KEY`: Application secret key

### Backup
- `BACKUP_DIR`: Directory for backups (default: backups)
- `RETENTION_DAYS`: Backup retention period (default: 30)
- `S3_BUCKET`: S3 bucket for backup storage

### Deployment
- `DOCKER_REGISTRY`: Docker registry URL
- `ENVIRONMENT`: Deployment environment (staging/production)

## Scheduled Tasks

### Daily Tasks (2 AM UTC)
1. Generate AI insights
2. Update quality scores
3. Create backup
4. Clean old data
5. Generate reports

### Continuous Monitoring
- API endpoint health checks
- Performance metrics tracking
- Error rate monitoring
- Disk space checks

## Security

### Automated Security Scanning
- Trivy for vulnerability scanning
- CodeQL for code analysis
- Dependency updates via Dependabot

### Best Practices
1. Never commit secrets to repository
2. Use environment variables for configuration
3. Implement least privilege access
4. Regular security audits

## Monitoring and Alerts

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Resource usage alerts
- Custom metric dashboards

### Alert Conditions
- Error rate > 5%
- Response time > 500ms (95th percentile)
- Disk usage > 90%
- Failed deployments

## Troubleshooting

### Common Issues

1. **Deployment Failures**
   ```bash
   # Check deployment logs
   docker-compose logs web
   
   # Run health check
   ./scripts/health_check.sh --full
   
   # Rollback if needed
   docker-compose down
   git checkout previous-version
   docker-compose up -d
   ```

2. **Test Failures**
   ```bash
   # Run specific test
   pytest tests/test_specific.py -v
   
   # Check coverage
   make test-coverage
   ```

3. **Performance Issues**
   ```bash
   # Check performance metrics
   make performance
   
   # View resource usage
   docker stats
   ```

## Maintenance

### Regular Tasks
1. Weekly: Review and merge dependabot PRs
2. Monthly: Update Docker base images
3. Quarterly: Security audit
4. Yearly: Major dependency updates

### Emergency Procedures
1. **Data Corruption**
   - Stop application
   - Restore from latest backup
   - Run validation checks
   - Restart application

2. **Security Breach**
   - Rotate all secrets
   - Review access logs
   - Apply security patches
   - Notify stakeholders

## Contributing

When adding new automation:
1. Update relevant workflow files
2. Add tests for new functionality
3. Document in this README
4. Test in staging before production

## Future Enhancements

- Kubernetes deployment manifests
- Terraform infrastructure as code
- Prometheus/Grafana monitoring
- Automated A/B testing
- Blue-green deployments
- Canary releases