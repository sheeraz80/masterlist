# Masterlist Advanced Search and Filtering System

This directory contains a comprehensive search and filtering system for the masterlist projects repository. The system provides powerful tools for discovering, filtering, and analyzing projects based on various criteria.

## 🚀 Quick Start

```bash
# Basic search
./search.py "automation productivity"

# Filter by category and quality
./search.py --category design-tools --quality-min 7

# Advanced filtering
./filter.py --platform figma-plugin --development-time-max 7 --quality-min 8

# Find similar projects
./find-similar.py --project-id designaudit-buddy

# Get autocomplete suggestions
./search.py --autocomplete "auto"
```

## 📁 File Structure

```
scripts/
├── search_infrastructure.py    # Core search engine and indexing
├── search.py                   # Main search tool with filters
├── filter.py                   # Advanced filtering capabilities
├── find-similar.py             # Similarity search tool
├── saved_searches.json         # Saved searches (auto-generated)
├── .search_cache/              # Search result cache (auto-generated)
└── README.md                   # This documentation
```

## 🔍 Core Components

### 1. Search Infrastructure (`search_infrastructure.py`)

The foundation of the search system, providing:

- **SearchIndex**: Creates inverted indices for fast lookups
- **FuzzySearch**: Enables approximate string matching
- **RankingEngine**: Scores and ranks results by relevance
- **SearchCache**: Caches results for improved performance
- **MasterlistSearchEngine**: Main search coordinator

**Key Features:**
- Indexes 605 projects across 8 categories and 11 platforms
- 4,929 indexed terms for full-text search
- Revenue potential parsing and categorization
- Development time and complexity extraction
- Quality score-based ranking

### 2. Main Search Tool (`search.py`)

Command-line interface for searching projects with multiple filters.

**Basic Usage:**
```bash
./search.py [query] [options]
```

**Filter Options:**
- `--category`: Filter by project category
- `--platform`: Filter by platform(s) (comma-separated)
- `--quality-min/max`: Quality score range (0-10)
- `--revenue-min/max`: Revenue potential range (supports k/m suffixes)
- `--development-time-max`: Maximum development time in days
- `--complexity-max`: Maximum technical complexity (1-10)
- `--keywords`: Search keywords in problem/solution

**Output Options:**
- `--output`: Format (table, detailed, json)
- `--show-path`: Include file system paths
- `--max-results`: Limit number of results

**Search Management:**
- `--save-search`: Save query for later use
- `--load-search`: Load saved search
- `--list-saved`: List all saved searches

**Examples:**
```bash
# High-quality design tools
./search.py --category design-tools --quality-min 8

# Quick development projects with good revenue
./search.py --development-time-max 7 --revenue-min 5k

# Figma plugins with automation keywords
./search.py --platform figma-plugin --keywords "automation productivity"

# Chrome extensions for developers
./search.py --platform chrome-extension --keywords "developers"
```

### 3. Advanced Filter Tool (`filter.py`)

Provides sophisticated filtering capabilities beyond basic search.

**Basic Usage:**
```bash
./filter.py [options]
```

**Advanced Filters:**
- `--revenue-ranges`: Multiple revenue ranges (e.g., "0-1000,5000-10000")
- `--platform-groups`: Platform combinations with OR logic
- `--top-by-category`: Show top N projects per category
- `--required-features`: Projects with specific features
- `--audience`: Filter by target audience keywords
- `--competition`: Filter by competition level

**Predefined Filters:**
- `--market-opportunity`: Good market opportunities (high quality, revenue, low complexity)
- `--quick-wins`: Quick development with decent revenue

**Export Options:**
- `--export`: Export to CSV or JSON file

**Examples:**
```bash
# Multiple revenue ranges
./filter.py --revenue-ranges "0-1000,5000-10000"

# Platform combinations (Figma OR VSCode)
./filter.py --platform-groups "figma-plugin|vscode-extension"

# Top 3 projects in each category
./filter.py --top-by-category 3

# Projects with specific features
./filter.py --required-features "automation,AI,productivity"

# Market opportunities
./filter.py --market-opportunity --min-quality 7 --min-revenue 5000

# Quick wins
./filter.py --quick-wins --max-days 7 --min-revenue 1000
```

### 4. Similarity Search Tool (`find-similar.py`)

Finds projects similar to a given project or criteria using multiple similarity algorithms.

**Basic Usage:**
```bash
./find-similar.py [options]
```

**Search Methods:**
- `--project-id`: Find similar to specific project
- `--project-name`: Find similar to named project
- `--problem-keywords`: Find projects solving similar problems
- `--market-keywords`: Find projects targeting similar markets
- `--criteria-file`: Use JSON file with complex criteria

**Manual Criteria:**
- `--category`: Similar category
- `--platforms`: Similar platforms
- `--keywords`: Similar keywords
- `--features`: Similar features

**Similarity Algorithm:**
- Category matching (30% weight)
- Platform overlap (20% weight)
- Text similarity (15% weight)
- Quality score proximity (10% weight)
- Revenue similarity (10% weight)
- Development time similarity (10% weight)
- Technical complexity similarity (10% weight)

**Examples:**
```bash
# Find projects similar to DesignAudit Buddy
./find-similar.py --project-id designaudit-buddy

# Find projects solving automation problems
./find-similar.py --problem-keywords "automation,design,consistency"

# Find projects targeting developers
./find-similar.py --market-keywords "developers,teams,enterprise"

# Find similar Figma plugins
./find-similar.py --category design-tools --platforms figma-plugin
```

## 🛠️ Advanced Features

### Saved Searches and Filters

Save frequently used searches and filters for quick access:

```bash
# Save a search
./search.py --category design-tools --quality-min 8 --save-search "high-quality-design"

# Load a saved search
./search.py --load-search "high-quality-design"

# List all saved searches
./search.py --list-saved
```

### Search Result Caching

The system automatically caches search results for improved performance:
- Cache duration: 1 hour
- Cache location: `.search_cache/`
- Disable caching: `--no-cache`

### Autocomplete Suggestions

Get suggestions for partial queries:

```bash
./search.py --autocomplete "auto"
# Returns: automation, automated, autocomplete, etc.
```

### Export Functionality

Export search results to various formats:

```bash
# Export to JSON
./filter.py --category design-tools --export results.json

# Export to CSV
./filter.py --category design-tools --export results.csv
```

### Statistical Information

Get insights about the search engine:

```bash
./search.py --stats
```

Output:
```
Search Engine Statistics:
  total_projects: 605
  categories: 8
  platforms: 11
  indexed_terms: 4929
  last_updated: 2024-01-01
```

## 📊 Output Formats

### Table Format (Default)
```
Name                 | Category     | Quality | Revenue              | Time   | Complexity
----------------------------------------------------------------------------------
DesignAudit Buddy    | design-tools | 6.8     | Realistic: $3,000/mo | 5 days | 4/10
BrandGuard Pro       | design-tools | 7.5     | Realistic: $5,000/mo | 7 days | 5/10
```

### Detailed Format
```
1. DesignAudit Buddy (Score: 7.68)
   Category: design-tools
   Quality Score: 6.8
   Platforms: figma-plugin
   Revenue Potential: Realistic: ~$3,000/month
   Development Time: 5 days
   Technical Complexity: 4/10
   Path: /home/sali/ai/projects/masterlist/design-tools/designaudit-buddy/
   Problem: Large design files often accumulate inconsistent styles...
```

### JSON Format
```json
[
  {
    "project_id": "designaudit-buddy",
    "name": "DesignAudit Buddy",
    "category": "design-tools",
    "quality_score": 6.8,
    "platforms": ["figma-plugin"],
    "revenue_potential": "Conservative: ~$800/month; Realistic: ~$3,000/month...",
    "development_time": "~5 days with AI assistance...",
    "technical_complexity": "4/10 – Mainly iterating through Figma document...",
    "path": "/home/sali/ai/projects/masterlist/design-tools/designaudit-buddy/",
    "score": 7.68,
    "matched_fields": ["name", "problem_statement"],
    "problem_statement": "Large design files often accumulate...",
    "solution_description": "An automated Figma plugin that scans...",
    "key_features": ["Automated detection of inconsistent text..."]
  }
]
```

## 🎯 Use Cases

### 1. Market Research
```bash
# Find high-potential opportunities
./filter.py --market-opportunity --min-quality 7 --min-revenue 5000

# Analyze competition levels
./filter.py --competition "low,medium"

# Find underserved categories
./filter.py --top-by-category 3
```

### 2. Project Discovery
```bash
# Find quick wins for rapid development
./filter.py --quick-wins --max-days 7 --min-revenue 1000

# Discover similar projects for inspiration
./find-similar.py --project-id your-project-id

# Find projects by problem domain
./find-similar.py --problem-keywords "automation,productivity"
```

### 3. Platform Analysis
```bash
# Analyze Figma plugin opportunities
./search.py --platform figma-plugin --output detailed

# Compare platform combinations
./filter.py --platform-groups "figma-plugin|vscode-extension"
```

### 4. Revenue Analysis
```bash
# High-revenue projects
./search.py --revenue-min 10k --output detailed

# Revenue distribution analysis
./filter.py --revenue-ranges "0-1000,1000-5000,5000-10000,10000+"
```

## 🔧 Technical Architecture

### Indexing System
- **Category Index**: Fast category-based lookups
- **Platform Index**: Multi-platform project discovery
- **Full-text Index**: 4,929 searchable terms
- **Revenue Index**: Parsed revenue ranges
- **Quality Index**: Score-based filtering
- **Time Index**: Development time extraction
- **Complexity Index**: Technical difficulty levels

### Search Algorithms
- **Exact Match**: Direct term matching
- **Fuzzy Search**: Approximate string matching (0.6 similarity threshold)
- **Ranking**: Multi-factor scoring system
- **Similarity**: Cosine similarity for text, Jaccard for features

### Performance Optimizations
- **Caching**: 1-hour result cache
- **Indexing**: Pre-built inverted indices
- **Lazy Loading**: On-demand project loading
- **Batch Operations**: Efficient multi-criteria filtering

## 🚀 Future Enhancements

### Planned Features
1. **Machine Learning Ranking**: AI-powered relevance scoring
2. **Semantic Search**: Understanding query intent
3. **Trend Analysis**: Market trend identification
4. **Collaborative Filtering**: User-based recommendations
5. **Real-time Updates**: Live project data synchronization

### Integration Possibilities
1. **API Interface**: RESTful API for external tools
2. **Web Interface**: Browser-based search portal
3. **IDE Integration**: VS Code extension
4. **Slack Bot**: Team collaboration features
5. **Analytics Dashboard**: Search metrics and insights

## 🤝 Contributing

To extend the search system:

1. **Add New Filters**: Extend the `_apply_filters` method in `search_infrastructure.py`
2. **Custom Similarity**: Implement new similarity algorithms in `find-similar.py`
3. **Output Formats**: Add new formatters in individual tools
4. **Performance**: Optimize indexing and caching mechanisms

## 📝 License

This search system is part of the masterlist project and follows the same licensing terms.

---

*For questions or issues, please refer to the main project documentation or create an issue in the project repository.*