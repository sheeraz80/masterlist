# Troubleshooting Guide

This guide helps you resolve common issues with Masterlist. If you can't find a solution here, please check our [FAQ](FAQ.md) or [create an issue](https://github.com/yourusername/masterlist/issues).

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [Runtime Errors](#runtime-errors)
3. [Performance Problems](#performance-problems)
4. [Data Issues](#data-issues)
5. [Web Interface Issues](#web-interface-issues)
6. [API Problems](#api-problems)
7. [Docker Issues](#docker-issues)
8. [Development Issues](#development-issues)

## Installation Issues

### Python Version Error
**Problem**: `Python 3.8 or higher is required`

**Solution**:
```bash
# Check Python version
python --version

# Install Python 3.8+ if needed
# Ubuntu/Debian
sudo apt update
sudo apt install python3.8

# macOS
brew install python@3.8

# Windows
# Download from python.org
```

### Dependency Installation Fails
**Problem**: `pip install -r requirements.txt` fails

**Solution**:
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -r requirements.txt -v

# Try installing problematic packages individually
pip install flask==2.0.1
pip install matplotlib==3.4.2

# Use system packages (Linux)
sudo apt-get install python3-dev
```

### Virtual Environment Issues
**Problem**: Can't create or activate virtual environment

**Solution**:
```bash
# Install venv if missing
sudo apt-get install python3-venv  # Ubuntu/Debian

# Create venv with specific Python
python3.8 -m venv venv

# Activation issues on Windows
# Use: venv\Scripts\activate.bat
# Or PowerShell: venv\Scripts\Activate.ps1
```

## Runtime Errors

### Port Already in Use
**Problem**: `Address already in use` error

**Solution**:
```bash
# Find process using port 5000
lsof -i :5000  # Linux/macOS
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=5001 python web/app.py
```

### Module Import Errors
**Problem**: `ModuleNotFoundError`

**Solution**:
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Add project to Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### JSON Decode Error
**Problem**: `JSONDecodeError` when loading data

**Solution**:
```bash
# Validate JSON files
python -m json.tool projects.json

# Fix common issues
# - Remove trailing commas
# - Ensure proper quotes
# - Check for BOM characters

# Restore from backup
cp backups/projects.json.backup projects.json
```

## Performance Problems

### Slow Search
**Problem**: Search takes too long

**Solution**:
```bash
# Optimize JSON files
make db-optimize

# Clear cache
rm -rf __pycache__
make clean

# Increase memory for Python
export PYTHONUNBUFFERED=1
```

**Code optimization**:
```python
# Use indexed search
searcher = TagSearch(use_index=True)
searcher.build_index()
```

### High Memory Usage
**Problem**: Application uses too much RAM

**Solution**:
```python
# Enable streaming for large datasets
@app.route('/api/projects/stream')
def stream_projects():
    def generate():
        for project in load_projects_iter():
            yield json.dumps(project) + '\n'
    return Response(generate(), mimetype='application/json')
```

### Slow Report Generation
**Problem**: Reports take too long to generate

**Solution**:
```bash
# Generate reports in background
python analytics/report_generator.py executive &

# Use caching
export CACHE_ENABLED=true
export CACHE_TTL=3600
```

## Data Issues

### Missing Projects
**Problem**: Projects not showing up

**Solution**:
```bash
# Check data files exist
ls -la *.json

# Validate data format
python -c "
import json
with open('projects.json') as f:
    data = json.load(f)
print(f'Found {len(data.get('projects', {}))} projects')
"

# Regenerate tags
python simple_tagger.py tag-all
```

### Corrupt Data
**Problem**: Data files are corrupted

**Solution**:
```bash
# Restore from backup
./scripts/restore_backup.sh

# Or restore specific file
cp backups/projects.json.backup projects.json

# Validate and fix
python scripts/validate_data.py --fix
```

### Quality Scores Missing
**Problem**: Projects have no quality scores

**Solution**:
```bash
# Recalculate all scores
python qa/quality_scorer.py --recalculate-all

# Update specific project
python -c "
from qa.quality_scorer import QualityScorer
scorer = QualityScorer()
scorer.score_project('project-key')
"
```

## Web Interface Issues

### Page Not Loading
**Problem**: Web pages show 404 or don't load

**Solution**:
```bash
# Check Flask is running
ps aux | grep flask

# Check templates exist
ls web/templates/

# Run in debug mode
FLASK_ENV=development python web/app.py

# Check browser console for errors
# Press F12 in browser
```

### Static Files Not Loading
**Problem**: CSS/JS files return 404

**Solution**:
```bash
# Check static directory
ls web/static/

# Clear browser cache
# Ctrl+Shift+R (Chrome/Firefox)
# Cmd+Shift+R (Safari)

# Serve static files directly
python -m http.server 8000 --directory web/static
```

### Session Issues
**Problem**: Login/session not persisting

**Solution**:
```python
# Check secret key is set
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key')

# Clear session data
@app.route('/clear-session')
def clear_session():
    session.clear()
    return redirect('/')
```

## API Problems

### Authentication Errors
**Problem**: API returns 401 Unauthorized

**Solution**:
```bash
# Check API token (if implemented)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/projects

# Disable auth for testing
export DISABLE_AUTH=true
```

### CORS Issues
**Problem**: Cross-origin requests blocked

**Solution**:
```python
# Add CORS support
from flask_cors import CORS

CORS(app, origins=['http://localhost:3000'])

# Or allow all origins (development only)
CORS(app, origins='*')
```

### Rate Limiting
**Problem**: Getting 429 Too Many Requests

**Solution**:
```bash
# Check rate limit headers
curl -I http://localhost:5000/api/projects

# Increase limits for development
export RATE_LIMIT_ENABLED=false
# Or
export RATE_LIMIT_PER_MINUTE=1000
```

## Docker Issues

### Build Failures
**Problem**: Docker build fails

**Solution**:
```bash
# Clean Docker system
docker system prune -a

# Build with no cache
docker build --no-cache -t masterlist .

# Check Docker daemon
systemctl status docker  # Linux
docker version
```

### Container Won't Start
**Problem**: Container exits immediately

**Solution**:
```bash
# Check logs
docker logs masterlist-web

# Run interactive shell
docker run -it masterlist /bin/bash

# Check file permissions
docker run masterlist ls -la /app
```

### Volume Mount Issues
**Problem**: Data not persisting

**Solution**:
```bash
# Check volume mounts
docker inspect masterlist-web

# Use absolute paths
docker run -v $(pwd)/data:/app/data masterlist

# Check permissions
sudo chown -R $USER:$USER data/
```

## Development Issues

### Test Failures
**Problem**: Tests fail locally

**Solution**:
```bash
# Run specific test
pytest tests/test_specific.py -v

# Skip slow tests
pytest -m "not slow"

# Clear test cache
rm -rf .pytest_cache
```

### Linting Errors
**Problem**: Code style issues

**Solution**:
```bash
# Auto-fix with black
black . --line-length 120

# Check specific file
flake8 web/app.py --max-line-length 120

# Ignore specific errors
# Add to .flake8 file
[flake8]
ignore = E203, W503
```

### Git Issues
**Problem**: Can't push changes

**Solution**:
```bash
# Update fork
git remote add upstream https://github.com/original/masterlist
git fetch upstream
git merge upstream/main

# Fix large files
git filter-branch --tree-filter 'rm -f large_file' HEAD
```

## Quick Fixes

### Reset Everything
```bash
# Complete reset
make clean
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
make test
```

### Emergency Recovery
```bash
# Restore from backup
./scripts/restore_backup.sh --latest

# Reset to git state
git reset --hard HEAD
git clean -fd
```

### Debug Mode
```bash
# Maximum debugging
export FLASK_ENV=development
export FLASK_DEBUG=1
export LOG_LEVEL=DEBUG
python web/app.py
```

## Getting More Help

If these solutions don't work:

1. **Check logs**:
   ```bash
   tail -f logs/app.log
   docker logs masterlist-web
   ```

2. **Search existing issues**:
   https://github.com/yourusername/masterlist/issues

3. **Create detailed bug report** with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Relevant logs

4. **Join community**:
   - GitHub Discussions
   - Stack Overflow tag: `masterlist`

Remember to sanitize any sensitive information before sharing logs or configuration!