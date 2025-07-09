# Smart Tagging System

A comprehensive project tagging and search system for the masterlist project repository.

## Overview

The Smart Tagging System automatically categorizes and tags projects based on their content, making it easy to search, filter, and discover relevant projects. It uses intelligent analysis to assign meaningful tags covering difficulty, revenue potential, technology stack, target market, and more.

## Features

- **Automatic Tagging**: Intelligently assigns tags based on project content
- **Advanced Search**: Search projects by tags, quality, complexity, and more
- **Similarity Detection**: Find projects similar to a given project
- **Tag Management**: Add, remove, rename, and validate tags
- **Analytics**: Comprehensive statistics and insights
- **Export Capabilities**: Export results and reports in multiple formats

## Files

- `simple_tagger.py` - Core tagging engine (lightweight, no external dependencies)
- `tag_search.py` - Advanced search functionality
- `tag_cli.py` - Comprehensive CLI interface
- `tag_manager.py` - Tag management utilities
- `project_tags.json` - Tag data storage
- `smart_tagging_report.md` - Generated analysis report

## Quick Start

### 1. Auto-tag all projects
```bash
python tag_cli.py --auto-tag
```

### 2. View statistics
```bash
python tag_cli.py --stats
```

### 3. Search projects
```bash
# Search for AI-powered, high-quality projects
python tag_cli.py --search --include ai-powered --min-quality 7

# Search for beginner-friendly, quick-win projects
python tag_cli.py --search --include beginner-friendly quick-win --limit 5
```

### 4. Find similar projects
```bash
python tag_cli.py --similar ai-powered-seo-assistant
```

### 5. Get recommendations
```bash
python tag_cli.py --recommend
```

## Tag Categories

### Difficulty Tags
- `beginner-friendly` - Technical complexity 1-3
- `intermediate` - Technical complexity 4-6
- `advanced` - Technical complexity 7-10

### Revenue Tags
- `high-revenue` - Realistic revenue potential $10k+
- `medium-revenue` - Realistic revenue potential $1k-$10k
- `low-revenue` - Realistic revenue potential <$1k

### Timeline Tags
- `quick-win` - Development time ≤7 days
- `short-term` - Development time 8-14 days
- `long-term` - Development time >14 days

### Quality Tags
- `top-rated` - Quality score 8-10
- `very-good` - Quality score 7-8
- `good` - Quality score 6-7
- `fair` - Quality score 5-6
- `needs-improvement` - Quality score <5

### Technology Tags
- `ai-powered` - Uses AI/ML technologies
- `blockchain` - Blockchain-based solutions
- `automation` - Automation-focused
- `analytics` - Data analytics features
- `web-based` - Web applications
- `mobile` - Mobile applications

### Business Model Tags
- `subscription-model` - SaaS/subscription pricing
- `freemium` - Freemium model
- `one-time-purchase` - One-time payment
- `b2b` - Business-to-business
- `b2c` - Business-to-consumer

### Platform Tags
- `platform-figma-plugin` - Figma plugins
- `platform-chrome-extension` - Chrome extensions
- `platform-vscode-extension` - VSCode extensions
- `platform-web-app` - Web applications
- `platform-mobile-app` - Mobile applications

### Category Tags
- `category-ai-ml` - AI/ML category
- `category-design-tools` - Design tools
- `category-productivity` - Productivity tools
- `category-finance-accounting` - Finance/accounting
- (and more...)

## Advanced Usage

### Tag Management
```bash
# Add a tag to a project
python tag_manager.py --add-tag project-key new-tag

# Remove a tag from a project
python tag_manager.py --remove-tag project-key old-tag

# Rename a tag across all projects
python tag_manager.py --rename-tag old-tag new-tag

# Delete a tag from all projects
python tag_manager.py --delete-tag unwanted-tag
```

### Data Validation
```bash
# Validate tag data integrity
python tag_manager.py --validate

# Clean up tag data
python tag_manager.py --clean

# Find untagged projects
python tag_manager.py --untagged
```

### Export Data
```bash
# Export tag matrix for analysis
python tag_manager.py --export-matrix tags_matrix.csv

# Generate comprehensive report
python tag_cli.py --report
```

## Search Examples

### Find high-potential projects
```bash
python tag_cli.py --search --include high-revenue ai-powered --min-quality 7 --max-complexity 6
```

### Find beginner-friendly projects
```bash
python tag_cli.py --search --include beginner-friendly quick-win --exclude needs-improvement
```

### Find design tool projects
```bash
python tag_cli.py --search --include category-design-tools platform-figma-plugin
```

### Find business analytics projects
```bash
python tag_cli.py --search --include category-business-analytics b2b --min-quality 6
```

## Statistics

Current tag statistics:
- **Total projects**: 710
- **Total tags**: 6,771
- **Unique tags**: 77
- **Average tags per project**: 9.5

Top tags by frequency:
1. `quick-win` (526 projects)
2. `ai-powered` (380 projects)
3. `design-focused` (367 projects)
4. `intermediate` (330 projects)
5. `low-revenue` (306 projects)

## Data Structure

Tags are stored in `project_tags.json`:
```json
{
  "project_tags": {
    "project-key": ["tag1", "tag2", "tag3"],
    "another-project": ["tag4", "tag5"]
  }
}
```

## Best Practices

1. **Run auto-tagging** after adding new projects
2. **Use specific tags** for better search results
3. **Combine multiple tags** for refined searches
4. **Validate regularly** to maintain data integrity
5. **Clean up periodically** to remove duplicates

## Extending the System

To add new tag categories:
1. Update `simple_tagger.py` with new tag logic
2. Add criteria in the `auto_tag_projects()` method
3. Update this README with new tag descriptions
4. Re-run auto-tagging to apply changes

## Troubleshooting

### Common Issues

1. **No tags found**: Run `python tag_cli.py --auto-tag` first
2. **Slow search**: Use more specific tag combinations
3. **Duplicate tags**: Run `python tag_manager.py --clean`
4. **Missing projects**: Verify project exists in `projects.json`

### Performance Tips

- Use `--limit` parameter for large result sets
- Combine inclusion and exclusion tags for better filtering
- Use quality and complexity filters to narrow results
- Regular cleanup improves performance

## Contributing

To improve the tagging system:
1. Analyze tag usage patterns
2. Add new meaningful tag categories
3. Improve automatic tagging logic
4. Add new search and filter capabilities
5. Enhance export and reporting features