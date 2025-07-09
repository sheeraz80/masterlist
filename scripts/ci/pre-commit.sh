#!/bin/bash
# Pre-commit hook script for code quality

set -e

echo "🔍 Running pre-commit checks..."

# Check if virtual environment is activated
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "⚠️  Virtual environment not activated. Activating..."
    source venv/bin/activate 2>/dev/null || {
        echo "❌ Failed to activate virtual environment"
        exit 1
    }
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install pre-commit if not installed
if ! command_exists pre-commit; then
    echo "📦 Installing pre-commit..."
    pip install pre-commit
fi

# Run Black formatter
echo "🎨 Running Black formatter..."
if command_exists black; then
    black . --check --diff || {
        echo "❌ Black formatting check failed. Run 'black .' to fix."
        exit 1
    }
else
    echo "⚠️  Black not installed. Skipping..."
fi

# Run isort
echo "📚 Running isort..."
if command_exists isort; then
    isort --check-only . --profile black || {
        echo "❌ Import sorting check failed. Run 'isort . --profile black' to fix."
        exit 1
    }
else
    echo "⚠️  isort not installed. Skipping..."
fi

# Run Flake8
echo "🔎 Running Flake8..."
if command_exists flake8; then
    flake8 . --max-line-length 120 --extend-ignore=E203,W503 || {
        echo "❌ Flake8 check failed."
        exit 1
    }
else
    echo "⚠️  Flake8 not installed. Skipping..."
fi

# Run MyPy
echo "🔍 Running MyPy..."
if command_exists mypy; then
    mypy . --ignore-missing-imports || {
        echo "⚠️  MyPy found type issues (non-blocking)"
    }
else
    echo "⚠️  MyPy not installed. Skipping..."
fi

# Validate JSON files
echo "📋 Validating JSON files..."
for file in projects.json project_tags.json; do
    if [[ -f "$file" ]]; then
        python -m json.tool "$file" > /dev/null || {
            echo "❌ Invalid JSON in $file"
            exit 1
        }
    fi
done

# Run quick tests
echo "🧪 Running quick tests..."
if [[ -d "tests" ]]; then
    pytest tests/unit/ -v --tb=short -m "not slow" || {
        echo "❌ Unit tests failed"
        exit 1
    }
else
    echo "⚠️  No tests directory found. Skipping..."
fi

# Check for sensitive data
echo "🔒 Checking for sensitive data..."
# Check for common patterns
if grep -r -E "(api_key|secret_key|password|token)" . \
    --exclude-dir=venv \
    --exclude-dir=.git \
    --exclude-dir=__pycache__ \
    --exclude="*.pyc" \
    --exclude="pre-commit.sh" | grep -v -E "(example|sample|test|mock)"; then
    echo "⚠️  Possible sensitive data detected. Please review before committing."
fi

# Check file sizes
echo "📏 Checking file sizes..."
find . -type f -size +10M -not -path "./venv/*" -not -path "./.git/*" | while read -r file; do
    echo "⚠️  Large file detected: $file ($(du -h "$file" | cut -f1))"
    echo "   Consider using Git LFS for large files"
done

echo "✅ All pre-commit checks passed!"