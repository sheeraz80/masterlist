# Masterlist Project Makefile

.PHONY: help install test lint format clean build deploy backup health-check

# Default target
help:
	@echo "Masterlist Project - Available Commands"
	@echo "======================================"
	@echo "install      - Install dependencies"
	@echo "test         - Run tests"
	@echo "lint         - Run linting checks"
	@echo "format       - Format code with black"
	@echo "clean        - Clean temporary files"
	@echo "build        - Build Docker images"
	@echo "deploy       - Deploy application"
	@echo "backup       - Create data backup"
	@echo "health-check - Run health checks"
	@echo "quality      - Run quality validation"
	@echo "insights     - Generate AI insights"
	@echo "reports      - Generate all reports"
	@echo "web          - Start web interface"
	@echo "dev          - Start development server"

# Installation
install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt || true

# Testing
test:
	pytest -v tests/

test-coverage:
	pytest -v --cov=. --cov-report=html tests/

# Code quality
lint:
	flake8 . --max-line-length=120 --exclude=venv,__pycache__
	mypy . --ignore-missing-imports || true

format:
	black --line-length 120 .

# Cleaning
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.log" -delete
	rm -rf .pytest_cache .coverage htmlcov
	rm -rf data/reports/*.json data/reports/*.md data/reports/*.html

# Docker operations
build:
	docker build -t masterlist:latest .

build-no-cache:
	docker build --no-cache -t masterlist:latest .

# Deployment
deploy-staging:
	./scripts/deploy.sh staging

deploy-production:
	./scripts/deploy.sh production

# Data operations
backup:
	./scripts/backup.sh

restore:
	@echo "Restore from backup:"
	@echo "tar -xzf backups/masterlist_backup_TIMESTAMP.tar.gz -C ."

# Health and monitoring
health-check:
	./scripts/health_check.sh

health-check-full:
	./scripts/health_check.sh --full

# Quality assurance
quality:
	python qa/validation_system.py --run-all
	python qa/quality_scorer.py --generate-report

quality-fix:
	python qa/quality_scorer.py --fix-issues

# Analytics and insights
insights:
	python insights/ai_insights.py --generate-all

reports:
	python analytics/report_generator.py all --format json
	python analytics/report_generator.py all --format markdown

report-executive:
	python analytics/report_generator.py executive --format markdown

report-quality:
	python analytics/report_generator.py quality --format html

report-trends:
	python analytics/report_generator.py trends --period 30

# Web interface
web:
	python web/app.py

web-docker:
	docker-compose up web

# Development
dev:
	FLASK_ENV=development python web/app.py

dev-docker:
	docker-compose up

# Database operations
db-validate:
	python -m json.tool projects.json > /dev/null
	python -m json.tool project_tags.json > /dev/null
	@echo "✅ JSON files are valid"

db-optimize:
	python -c "import json; \
		with open('projects.json') as f: data = json.load(f); \
		with open('projects.json', 'w') as f: json.dump(data, f, separators=(',', ':'))"
	python -c "import json; \
		with open('project_tags.json') as f: data = json.load(f); \
		with open('project_tags.json', 'w') as f: json.dump(data, f, separators=(',', ':'))"
	@echo "✅ JSON files optimized"

# Git operations
git-status:
	@git status -s

git-commit:
	@git add -A
	@git commit -m "Update: $(shell date +%Y-%m-%d)"

# Combined operations
full-test: lint test quality db-validate
	@echo "✅ All tests passed"

full-deploy: test quality build deploy-production
	@echo "✅ Deployment complete"

daily-maintenance: backup quality insights reports clean
	@echo "✅ Daily maintenance complete"

# Docker compose shortcuts
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

# Performance monitoring
performance:
	python -c "from analytics.performance_tracker import PerformanceTracker; \
		tracker = PerformanceTracker(); \
		print(tracker.generate_performance_report())"

# Tag management
tag-all:
	python simple_tagger.py tag-all

search-tags:
	@read -p "Enter tags to search (space-separated): " tags; \
	python tag_search.py search $$tags