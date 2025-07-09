# Deployment Guide

This guide covers various deployment options for Masterlist, from simple single-server setups to scalable cloud deployments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Single Server Deployment](#single-server-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Cloud Deployments](#cloud-deployments)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / macOS / Windows Server
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB minimum
- **Network**: Static IP, domain name (for production)

### Software Requirements
- Python 3.8+
- Docker & Docker Compose (for containerized deployment)
- Nginx or Apache (for reverse proxy)
- SSL certificates (Let's Encrypt recommended)
- Redis (optional, for caching)

## Deployment Options

### Comparison Table

| Method | Complexity | Scalability | Best For |
|--------|------------|-------------|----------|
| Single Server | Low | Limited | Small teams, testing |
| Docker | Medium | Good | Most deployments |
| Kubernetes | High | Excellent | Enterprise, high traffic |
| Cloud PaaS | Low | Excellent | Quick deployment |

## Single Server Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.8 python3-pip python3-venv nginx supervisor git

# Install Redis (optional)
sudo apt install -y redis-server

# Create application user
sudo useradd -m -s /bin/bash masterlist
sudo usermod -aG sudo masterlist
```

### 2. Application Setup

```bash
# Switch to app user
sudo su - masterlist

# Clone repository
git clone https://github.com/yourusername/masterlist.git
cd masterlist

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create necessary directories
mkdir -p logs data/reports backups
```

### 3. Configuration

```bash
# Create production config
cat > .env << EOF
FLASK_ENV=production
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
HOST=0.0.0.0
PORT=5000
REDIS_URL=redis://localhost:6379/0
EOF

# Set permissions
chmod 600 .env
```

### 4. Supervisor Configuration

```bash
# Create supervisor config
sudo tee /etc/supervisor/conf.d/masterlist.conf << EOF
[program:masterlist]
command=/home/masterlist/masterlist/venv/bin/python /home/masterlist/masterlist/web/app.py
directory=/home/masterlist/masterlist
user=masterlist
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/home/masterlist/masterlist/logs/app.log
environment=PATH="/home/masterlist/masterlist/venv/bin",FLASK_ENV="production"
EOF

# Start application
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start masterlist
```

### 5. Nginx Configuration

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/masterlist << 'EOF'
server {
    listen 80;
    server_name masterlist.yourdomain.com;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name masterlist.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/masterlist.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/masterlist.yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /static {
        alias /home/masterlist/masterlist/web/static;
        expires 1y;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/masterlist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d masterlist.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Docker Deployment

### 1. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    image: masterlist:latest
    container_name: masterlist-web
    restart: always
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./backups:/app/backups
    depends_on:
      - redis
    networks:
      - masterlist-net

  nginx:
    image: nginx:alpine
    container_name: masterlist-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./web/static:/app/static:ro
    depends_on:
      - web
    networks:
      - masterlist-net

  redis:
    image: redis:alpine
    container_name: masterlist-redis
    restart: always
    volumes:
      - redis-data:/data
    networks:
      - masterlist-net

volumes:
  redis-data:

networks:
  masterlist-net:
    driver: bridge
```

### 3. Deploy with Docker

```bash
# Build image
docker build -t masterlist:latest .

# Create environment file
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Create secrets
echo "your-secret-key" | docker secret create masterlist_secret_key -

# Deploy stack
docker stack deploy -c docker-stack.yml masterlist

# Scale service
docker service scale masterlist_web=3
```

## Kubernetes Deployment

### 1. Kubernetes Manifests

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: masterlist
  labels:
    app: masterlist
spec:
  replicas: 3
  selector:
    matchLabels:
      app: masterlist
  template:
    metadata:
      labels:
        app: masterlist
    spec:
      containers:
      - name: masterlist
        image: masterlist:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: masterlist-secret
              key: secret-key
        - name: REDIS_URL
          value: "redis://masterlist-redis:6379/0"
        volumeMounts:
        - name: data
          mountPath: /app/data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: masterlist-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: masterlist
spec:
  selector:
    app: masterlist
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace masterlist

# Create secrets
kubectl create secret generic masterlist-secret \
  --from-literal=secret-key=$(openssl rand -hex 32) \
  -n masterlist

# Apply manifests
kubectl apply -f deployment.yaml -n masterlist
kubectl apply -f service.yaml -n masterlist
kubectl apply -f ingress.yaml -n masterlist

# Check deployment
kubectl get all -n masterlist
kubectl logs -f deployment/masterlist -n masterlist
```

### 3. Helm Chart

```bash
# Install with Helm
helm repo add masterlist https://charts.masterlist.app
helm install masterlist masterlist/masterlist \
  --namespace masterlist \
  --create-namespace \
  --set image.tag=latest \
  --set ingress.enabled=true \
  --set ingress.host=masterlist.yourdomain.com
```

## Cloud Deployments

### AWS Deployment

#### 1. Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p python-3.8 masterlist

# Create environment
eb create masterlist-prod

# Deploy
eb deploy

# Open application
eb open
```

#### 2. EC2 with Auto Scaling

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name masterlist-template \
  --version-description "Masterlist v1" \
  --launch-template-data file://launch-template.json

# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name masterlist-asg \
  --launch-template LaunchTemplateName=masterlist-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 3
```

### Google Cloud Platform

```bash
# Deploy to App Engine
gcloud app deploy

# Deploy to Cloud Run
gcloud run deploy masterlist \
  --image gcr.io/project-id/masterlist \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

```bash
# Create resource group
az group create --name masterlist-rg --location eastus

# Create app service plan
az appservice plan create \
  --name masterlist-plan \
  --resource-group masterlist-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group masterlist-rg \
  --plan masterlist-plan \
  --name masterlist-app \
  --runtime "PYTHON|3.8"

# Deploy code
az webapp deployment source config-local-git \
  --name masterlist-app \
  --resource-group masterlist-rg
```

## Security Hardening

### 1. System Security

```bash
# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 2. Application Security

```python
# security.py
from flask_talisman import Talisman
from flask_limiter import Limiter

# Content Security Policy
csp = {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    'style-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    'img-src': "'self' data: https:",
}

# Initialize security extensions
Talisman(app, content_security_policy=csp)
limiter = Limiter(
    app,
    key_func=lambda: get_remote_address(),
    default_limits=["200 per day", "50 per hour"]
)
```

### 3. Database Security

```bash
# Secure Redis
echo "requirepass $(openssl rand -hex 32)" >> /etc/redis/redis.conf
echo "bind 127.0.0.1 ::1" >> /etc/redis/redis.conf
sudo systemctl restart redis
```

## Monitoring & Maintenance

### 1. Health Checks

```bash
# Create health check endpoint
@app.route('/health')
def health_check():
    checks = {
        'app': 'healthy',
        'database': check_database(),
        'redis': check_redis(),
        'disk_space': check_disk_space()
    }
    status = all(v == 'healthy' for v in checks.values())
    return jsonify(checks), 200 if status else 503
```

### 2. Monitoring Setup

```bash
# Install Prometheus node exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.0/node_exporter-1.6.0.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.0.linux-amd64.tar.gz
sudo cp node_exporter-1.6.0.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=prometheus
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=default.target
EOF

sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

### 3. Backup Strategy

```bash
# Automated backup script
#!/bin/bash
# /home/masterlist/backup.sh

BACKUP_DIR="/home/masterlist/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="masterlist_backup_${TIMESTAMP}"

# Create backup
cd /home/masterlist/masterlist
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
  projects.json \
  project_tags.json \
  data/

# Upload to S3 (optional)
aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
  s3://your-backup-bucket/masterlist/

# Clean old backups (keep 30 days)
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +30 -delete

# Add to crontab
# 0 2 * * * /home/masterlist/backup.sh
```

### 4. Maintenance Tasks

```bash
# Log rotation
sudo tee /etc/logrotate.d/masterlist << EOF
/home/masterlist/masterlist/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 masterlist masterlist
    sharedscripts
    postrotate
        supervisorctl restart masterlist
    endscript
}
EOF

# Database optimization (weekly)
0 3 * * 0 cd /home/masterlist/masterlist && python scripts/optimize_db.py

# Security updates (daily)
0 4 * * * apt update && apt upgrade -y

# SSL renewal (monthly)
0 0 1 * * certbot renew --quiet
```

## Troubleshooting Deployment

### Common Issues

1. **Port conflicts**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission errors**
   ```bash
   sudo chown -R masterlist:masterlist /home/masterlist/masterlist
   chmod -R 755 /home/masterlist/masterlist
   ```

3. **Memory issues**
   ```bash
   # Check memory
   free -h
   
   # Add swap if needed
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **SSL issues**
   ```bash
   # Test SSL
   openssl s_client -connect masterlist.yourdomain.com:443
   
   # Regenerate certificates
   sudo certbot certonly --nginx -d masterlist.yourdomain.com
   ```

### Performance Optimization

1. **Enable caching**
   ```python
   from flask_caching import Cache
   cache = Cache(app, config={'CACHE_TYPE': 'redis'})
   
   @cache.cached(timeout=300)
   def expensive_operation():
       # Cached for 5 minutes
       pass
   ```

2. **Database connection pooling**
   ```python
   # For future PostgreSQL
   engine = create_engine(
       DATABASE_URL,
       pool_size=20,
       max_overflow=40,
       pool_pre_ping=True
   )
   ```

3. **CDN for static assets**
   ```nginx
   location /static {
       alias /app/static;
       expires 1y;
       add_header Cache-Control "public, immutable";
       add_header CDN-Cache-Control "max-age=31536000";
   }
   ```

Remember to test your deployment thoroughly in a staging environment before going to production!