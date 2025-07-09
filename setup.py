"""
Masterlist - Comprehensive Project Management and Analytics Platform
"""

from setuptools import setup, find_packages
import os

# Read README for long description
with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

# Read requirements
with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

# Package metadata
setup(
    name="masterlist",
    version="1.0.0",
    author="Masterlist Team",
    author_email="info@masterlist.app",
    description="A comprehensive project management and analytics platform",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/masterlist",
    project_urls={
        "Bug Tracker": "https://github.com/yourusername/masterlist/issues",
        "Documentation": "https://docs.masterlist.app",
        "Source Code": "https://github.com/yourusername/masterlist",
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    packages=find_packages(exclude=["tests", "tests.*", "docs", "scripts"]),
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=6.0",
            "pytest-cov>=2.0",
            "pytest-timeout>=1.4",
            "pytest-xdist>=2.0",
            "black>=21.0",
            "flake8>=3.9",
            "mypy>=0.9",
            "isort>=5.0",
            "pre-commit>=2.0",
        ],
        "docs": [
            "sphinx>=4.0",
            "sphinx-rtd-theme>=0.5",
            "sphinx-autodoc-typehints>=1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "masterlist=cli:main",
            "masterlist-search=tag_search:main",
            "masterlist-tag=simple_tagger:main",
            "masterlist-quality=qa.quality_scorer:main",
            "masterlist-report=analytics.report_generator:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.json", "*.md", "*.html", "*.css", "*.js"],
        "web": ["templates/*", "static/*"],
    },
    zip_safe=False,
)