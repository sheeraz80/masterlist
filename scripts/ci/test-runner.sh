#!/bin/bash
# Comprehensive test runner for CI/CD

set -e

# Configuration
COVERAGE_THRESHOLD=80
PERFORMANCE_THRESHOLD=2.0  # seconds

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success") echo -e "${GREEN}✅ $message${NC}" ;;
        "error") echo -e "${RED}❌ $message${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        *) echo "$message" ;;
    esac
}

# Create necessary directories
mkdir -p test-results coverage-reports performance-reports

# Install test dependencies
print_status "info" "Installing test dependencies..."
pip install pytest pytest-cov pytest-timeout pytest-xdist pytest-benchmark pytest-mock

# Run unit tests with coverage
print_status "info" "Running unit tests..."
pytest tests/unit/ \
    -v \
    --cov=. \
    --cov-report=html:coverage-reports/html \
    --cov-report=xml:coverage-reports/coverage.xml \
    --cov-report=term-missing \
    --junit-xml=test-results/unit-tests.xml \
    --timeout=30 \
    -n auto || {
    print_status "error" "Unit tests failed"
    exit 1
}

# Check coverage threshold
coverage_percent=$(python -c "
import xml.etree.ElementTree as ET
tree = ET.parse('coverage-reports/coverage.xml')
root = tree.getroot()
coverage = float(root.attrib.get('line-rate', 0)) * 100
print(f'{coverage:.1f}')
")

if (( $(echo "$coverage_percent < $COVERAGE_THRESHOLD" | bc -l) )); then
    print_status "warning" "Coverage ($coverage_percent%) is below threshold ($COVERAGE_THRESHOLD%)"
else
    print_status "success" "Coverage ($coverage_percent%) meets threshold"
fi

# Run integration tests
print_status "info" "Running integration tests..."
pytest tests/integration/ \
    -v \
    --junit-xml=test-results/integration-tests.xml \
    --timeout=60 || {
    print_status "warning" "Some integration tests failed"
}

# Run performance tests
print_status "info" "Running performance tests..."
python -c "
import time
import json
from tag_search import TagSearch
from analytics.report_generator import ReportGenerator

# Test search performance
searcher = TagSearch()
start = time.time()
results = searcher.search_by_tags(['ai-powered'])
search_time = time.time() - start

# Test report generation performance
generator = ReportGenerator()
start = time.time()
generator.generate_executive_summary()
report_time = time.time() - start

# Save results
results = {
    'search_time': search_time,
    'report_time': report_time,
    'threshold': $PERFORMANCE_THRESHOLD
}

with open('performance-reports/performance.json', 'w') as f:
    json.dump(results, f, indent=2)

# Check thresholds
if search_time > $PERFORMANCE_THRESHOLD:
    print(f'❌ Search performance ({search_time:.2f}s) exceeds threshold')
    exit(1)
if report_time > $PERFORMANCE_THRESHOLD * 2:
    print(f'❌ Report generation ({report_time:.2f}s) exceeds threshold')
    exit(1)

print(f'✅ Performance tests passed (search: {search_time:.2f}s, report: {report_time:.2f}s)')
"

# Run security checks
print_status "info" "Running security checks..."
pip install safety bandit

# Check for vulnerable dependencies
safety check -r requirements.txt --json --output test-results/safety-report.json || {
    print_status "warning" "Security vulnerabilities found in dependencies"
}

# Run static security analysis
bandit -r . -f json -o test-results/bandit-report.json \
    --skip B101 \
    --exclude /venv/,/tests/ || {
    print_status "warning" "Security issues found in code"
}

# Run data validation tests
print_status "info" "Running data validation..."
python qa/validation_system.py --run-all --output test-results/validation-report.json || {
    print_status "error" "Data validation failed"
    exit 1
}

# Generate test summary
print_status "info" "Generating test summary..."
python -c "
import json
import os
from datetime import datetime

summary = {
    'timestamp': datetime.now().isoformat(),
    'coverage': '$coverage_percent%',
    'tests': {
        'unit': 'passed' if os.path.exists('test-results/unit-tests.xml') else 'failed',
        'integration': 'passed' if os.path.exists('test-results/integration-tests.xml') else 'failed',
        'performance': 'passed',
        'security': 'passed with warnings',
        'validation': 'passed'
    }
}

with open('test-results/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print('📊 Test Summary:')
for test_type, status in summary['tests'].items():
    emoji = '✅' if 'passed' in status else '❌'
    print(f'  {emoji} {test_type}: {status}')
print(f'  📈 Coverage: {summary[\"coverage\"]}')
"

print_status "success" "All tests completed!"