# Contributing to Masterlist

Thank you for your interest in contributing to Masterlist! This guide will help you get started with contributing to our project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Setup](#development-setup)
5. [Coding Guidelines](#coding-guidelines)
6. [Testing](#testing)
7. [Submitting Changes](#submitting-changes)
8. [Review Process](#review-process)

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and follow our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/masterlist.git
   cd masterlist
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original/masterlist.git
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Python version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear and descriptive title
- Detailed description of the proposed feature
- Use cases and examples
- Any relevant mockups or diagrams

### Contributing Code

1. **Find an issue** to work on or create a new one
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding guidelines
5. **Write/update tests** as needed
6. **Submit a pull request**

## Development Setup

### Prerequisites
- Python 3.8 or higher
- Git
- Virtual environment tool (venv, virtualenv, etc.)

### Setup Steps

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests to verify setup
pytest

# Start development server
FLASK_ENV=development python web/app.py
```

### Development Tools

```bash
# Code formatting
black .

# Linting
flake8 .

# Type checking
mypy .

# Run all checks
make lint
```

## Coding Guidelines

### Python Style Guide

We follow PEP 8 with some modifications:
- Line length: 120 characters
- Use type hints for function signatures
- Write comprehensive docstrings

#### Example Code Style

```python
from typing import Dict, List, Optional

def process_project_data(
    project_key: str,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Process project data with optional filters.
    
    Args:
        project_key: Unique project identifier
        filters: Optional filtering criteria
        
    Returns:
        Processed project data dictionary
        
    Raises:
        ValueError: If project_key is invalid
    """
    if not project_key:
        raise ValueError("Project key cannot be empty")
    
    # Implementation here
    return processed_data
```

### Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(search): add advanced filtering options

- Add support for multiple tag filtering
- Implement date range filters
- Add quality score range selector

Closes #123
```

### Documentation

- Update documentation for any user-facing changes
- Add docstrings to all new functions and classes
- Update README.md if adding new features
- Include examples in documentation

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_search.py

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest tests/test_search.py::test_advanced_search
```

### Writing Tests

```python
import pytest
from unittest.mock import Mock, patch

class TestProjectSearch:
    @pytest.fixture
    def search_engine(self):
        return SearchEngine()
    
    def test_search_by_quality(self, search_engine):
        """Test searching projects by quality score."""
        results = search_engine.search(min_quality=8.0)
        
        assert len(results) > 0
        assert all(p['quality_score'] >= 8.0 for p in results)
    
    @patch('search.load_projects')
    def test_search_with_mock(self, mock_load):
        """Test search with mocked data."""
        mock_load.return_value = [
            {'name': 'Test Project', 'quality_score': 9.0}
        ]
        
        results = search_by_quality(8.0)
        assert len(results) == 1
```

### Test Coverage

We aim for >80% test coverage. Check coverage with:
```bash
pytest --cov=. --cov-report=term-missing
```

## Submitting Changes

### Pull Request Process

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated existing tests

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Review Process

### What to Expect

1. **Automated checks** will run on your PR
2. **Code review** by maintainers
3. **Feedback and discussion**
4. **Approval and merge**

### Review Criteria

- Code quality and style
- Test coverage
- Documentation completeness
- Performance impact
- Security considerations

### Responding to Feedback

- Be open to suggestions
- Ask questions if unclear
- Make requested changes promptly
- Update PR description if needed

## Getting Help

### Resources

- [Documentation](docs/)
- [GitHub Issues](https://github.com/yourusername/masterlist/issues)
- [Discussions](https://github.com/yourusername/masterlist/discussions)

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code contributions

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Special contributor badge (for significant contributions)

Thank you for contributing to Masterlist! 🎉