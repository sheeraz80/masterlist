# Configuration Guide

This guide covers all configuration options for Masterlist, including environment variables, configuration files, and runtime settings.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Configuration Files](#configuration-files)
3. [Application Settings](#application-settings)
4. [Database Configuration](#database-configuration)
5. [Security Settings](#security-settings)
6. [Performance Tuning](#performance-tuning)
7. [Integration Configuration](#integration-configuration)
8. [Docker Configuration](#docker-configuration)

## Environment Variables

### Core Settings

```bash
# Application Mode
FLASK_ENV=production|development|testing
FLASK_DEBUG=0|1

# Server Configuration
HOST=0.0.0.0
PORT=5000
WORKERS=4

# Security
SECRET_KEY=your-secret-key-here
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Lax
```

### Data Storage

```bash
# Data Directories
DATA_DIR=/app/data
REPORTS_DIR=/app/data/reports
BACKUP_DIR=/app/backups

# File Paths
PROJECTS_FILE=projects.json
TAGS_FILE=project_tags.json
```

### Caching

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CACHE_ENABLED=true
CACHE_TTL=300  # seconds
CACHE_KEY_PREFIX=masterlist:

# In-Memory Cache
MEMORY_CACHE_SIZE=1000
MEMORY_CACHE_TTL=60
```

### Analytics

```bash
# Reporting
REPORT_GENERATION_TIMEOUT=300
MAX_REPORT_SIZE_MB=50
ENABLE_ASYNC_REPORTS=true

# Insights
AI_INSIGHTS_ENABLED=true
INSIGHTS_REFRESH_HOURS=24
INSIGHTS_MODEL=gpt-3.5-turbo
```

### Performance

```bash
# Request Limits
MAX_CONTENT_LENGTH=16777216  # 16MB
REQUEST_TIMEOUT=30
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100

# Database
DB_POOL_SIZE=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

## Configuration Files

### Main Configuration (`config.py`)

```python
import os
from datetime import timedelta

class Config:
    """Base configuration."""
    # Application
    APP_NAME = "Masterlist"
    VERSION = "1.0.0"
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # Data
    DATA_DIR = os.environ.get('DATA_DIR', 'data')
    PROJECTS_FILE = os.environ.get('PROJECTS_FILE', 'projects.json')
    
    # Features
    ENABLE_REGISTRATION = True
    ENABLE_API = True
    ENABLE_WEBHOOKS = False
    
    # Limits
    MAX_PROJECTS_PER_PAGE = 50
    MAX_SEARCH_RESULTS = 100
    MAX_EXPORT_SIZE = 10000

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False
    
    # Development database
    DATABASE_URI = 'sqlite:///dev.db'
    
    # Disable caching
    CACHE_ENABLED = False
    
    # Enable all features
    ENABLE_EXPERIMENTAL = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    
    # Production database
    DATABASE_URI = os.environ.get('DATABASE_URI')
    
    # Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Performance
    SEND_FILE_MAX_AGE_DEFAULT = 31536000  # 1 year

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    WTF_CSRF_ENABLED = False
    
    # Test database
    DATABASE_URI = 'sqlite:///:memory:'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
```

### Logging Configuration (`logging.yaml`)

```yaml
version: 1
disable_existing_loggers: false

formatters:
  default:
    format: '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    datefmt: '%Y-%m-%d %H:%M:%S'
  
  detailed:
    format: '[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s'
    datefmt: '%Y-%m-%d %H:%M:%S'

handlers:
  console:
    class: logging.StreamHandler
    level: INFO
    formatter: default
    stream: ext://sys.stdout
  
  file:
    class: logging.handlers.RotatingFileHandler
    level: INFO
    formatter: detailed
    filename: logs/app.log
    maxBytes: 10485760  # 10MB
    backupCount: 5
  
  error_file:
    class: logging.handlers.RotatingFileHandler
    level: ERROR
    formatter: detailed
    filename: logs/error.log
    maxBytes: 10485760  # 10MB
    backupCount: 5

loggers:
  masterlist:
    level: DEBUG
    handlers: [console, file]
    propagate: false
  
  werkzeug:
    level: WARNING
    handlers: [console]
    propagate: false

root:
  level: INFO
  handlers: [console, file, error_file]
```

### NGINX Configuration (`nginx.conf`)

```nginx
upstream masterlist_app {
    server web:5000;
}

server {
    listen 80;
    server_name masterlist.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name masterlist.app;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/masterlist.crt;
    ssl_certificate_key /etc/ssl/private/masterlist.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Static files
    location /static {
        alias /app/web/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes
    location /api {
        proxy_pass http://masterlist_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Main application
    location / {
        proxy_pass http://masterlist_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Application Settings

### Feature Flags

```python
# features.py
FEATURES = {
    'ai_insights': True,
    'collaboration': True,
    'advanced_search': True,
    'export_pdf': True,
    'webhooks': False,  # Coming soon
    'graphql': False,   # Coming soon
    'real_time': False, # Coming soon
}

def is_feature_enabled(feature_name):
    """Check if a feature is enabled."""
    return FEATURES.get(feature_name, False)
```

### Quality Scoring Configuration

```python
# scoring_config.py
SCORING_WEIGHTS = {
    'completeness': 0.25,
    'revenue_potential': 0.25,
    'technical_feasibility': 0.20,
    'market_opportunity': 0.20,
    'platform_coverage': 0.10
}

SCORING_THRESHOLDS = {
    'excellent': 9.0,
    'very_good': 8.0,
    'good': 7.0,
    'fair': 6.0,
    'needs_improvement': 5.0
}
```

## Database Configuration

### JSON Storage Settings

```python
# storage_config.py
JSON_STORAGE = {
    'indent': 2,
    'sort_keys': True,
    'ensure_ascii': False,
    'compression': False,  # Enable for large datasets
    'backup_count': 5,
    'backup_interval': 3600  # seconds
}
```

### Future PostgreSQL Configuration

```python
# database.py (for future use)
SQLALCHEMY_DATABASE_URI = os.environ.get(
    'DATABASE_URL',
    'postgresql://user:pass@localhost/masterlist'
)
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
    'max_overflow': 20
}
```

## Security Settings

### Session Configuration

```python
# Security settings
SESSION_TYPE = 'redis'
SESSION_REDIS = redis.from_url(os.environ.get('REDIS_URL'))
SESSION_PERMANENT = False
SESSION_USE_SIGNER = True
SESSION_KEY_PREFIX = 'masterlist:'
PERMANENT_SESSION_LIFETIME = timedelta(hours=24)

# CSRF Protection
WTF_CSRF_ENABLED = True
WTF_CSRF_TIME_LIMIT = None
WTF_CSRF_CHECK_DEFAULT = True
```

### API Security

```python
# API rate limiting
RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL')
RATELIMIT_STRATEGY = 'fixed-window'
RATELIMIT_DEFAULT = "100 per minute"
RATELIMIT_HEADERS_ENABLED = True

# API key configuration (future)
API_KEY_HEADER = 'X-API-Key'
API_KEY_LENGTH = 32
API_KEY_EXPIRY_DAYS = 365
```

## Performance Tuning

### Caching Strategy

```python
# Cache configuration
CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': os.environ.get('REDIS_URL'),
    'CACHE_DEFAULT_TIMEOUT': 300,
    'CACHE_KEY_PREFIX': 'masterlist:',
    'CACHE_OPTIONS': {
        'connection_pool_kwargs': {
            'max_connections': 50,
            'decode_responses': True
        }
    }
}

# Cache keys
CACHE_KEYS = {
    'projects': 'projects:all',
    'project_detail': 'project:{project_id}',
    'analytics': 'analytics:{metric_type}',
    'insights': 'insights:latest',
    'search': 'search:{query_hash}'
}
```

### Performance Optimizations

```python
# Optimization settings
OPTIMIZATION = {
    'enable_compression': True,
    'enable_etag': True,
    'enable_query_cache': True,
    'lazy_loading': True,
    'pagination_limit': 100,
    'bulk_operation_size': 500
}
```

## Integration Configuration

### External Services

```python
# Third-party integrations
INTEGRATIONS = {
    'github': {
        'enabled': True,
        'api_token': os.environ.get('GITHUB_TOKEN'),
        'webhook_secret': os.environ.get('GITHUB_WEBHOOK_SECRET')
    },
    'slack': {
        'enabled': False,
        'webhook_url': os.environ.get('SLACK_WEBHOOK_URL')
    },
    'openai': {
        'enabled': True,
        'api_key': os.environ.get('OPENAI_API_KEY'),
        'model': 'gpt-3.5-turbo',
        'max_tokens': 1000
    }
}
```

### Email Configuration

```python
# Email settings
MAIL_SERVER = os.environ.get('MAIL_SERVER', 'localhost')
MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
MAIL_DEFAULT_SENDER = ('Masterlist', 'noreply@masterlist.app')
```

## Docker Configuration

### Docker Environment File (`.env`)

```bash
# Application
COMPOSE_PROJECT_NAME=masterlist
ENVIRONMENT=production

# Volumes
DATA_VOLUME=./data
BACKUP_VOLUME=./backups
LOG_VOLUME=./logs

# Ports
WEB_PORT=5000
REDIS_PORT=6379

# Resources
WEB_MEMORY_LIMIT=1g
WEB_CPU_LIMIT=1.0
REDIS_MEMORY_LIMIT=512m

# Networking
NETWORK_NAME=masterlist-network
```

### Docker Compose Override

```yaml
# docker-compose.override.yml (for local development)
version: '3.8'

services:
  web:
    build:
      context: .
      target: development
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=1
    volumes:
      - .:/app
    ports:
      - "5000:5000"
      - "5678:5678"  # Python debugger
```

## Configuration Best Practices

1. **Environment-Specific Settings**
   - Use separate configs for dev/test/prod
   - Never commit sensitive data
   - Use environment variables for secrets

2. **Performance Tuning**
   - Enable caching in production
   - Configure appropriate timeouts
   - Set reasonable rate limits

3. **Security**
   - Always use HTTPS in production
   - Enable all security headers
   - Rotate secrets regularly

4. **Monitoring**
   - Configure comprehensive logging
   - Set up error tracking
   - Monitor performance metrics

5. **Backup**
   - Configure automated backups
   - Test restore procedures
   - Keep multiple backup copies