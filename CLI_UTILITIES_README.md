# Masterlist CLI Utilities

A comprehensive command-line interface for managing 710+ curated project ideas with advanced search, tagging, and analytics capabilities.

## 🚀 Installation

### Quick Install
```bash
bash install.sh
```

### Manual Install
```bash
chmod +x masterlist
python3 masterlist tag --auto-tag  # Initialize tags
```

### Global Access (Optional)
```bash
sudo ln -sf $(pwd)/masterlist /usr/local/bin/masterlist
```

## 📋 Core Commands

### 1. Search Projects
```bash
# Basic search
masterlist search --include ai-powered --min-quality 7

# Advanced search
masterlist search --include ai-powered high-revenue --exclude needs-improvement --min-quality 7 --max-complexity 6 --limit 5

# Category-specific search
masterlist search --category ai-ml --platform figma-plugin --min-quality 6

# Export results
masterlist search --include design-focused --export results.json --format json
```

### 2. Get Recommendations
```bash
# Beginner-friendly recommendations
masterlist recommend --difficulty beginner --timeline quick --limit 5

# High-revenue focus
masterlist recommend --revenue-focus high --max-complexity 7

# Category-specific recommendations
masterlist recommend --category ai-ml --difficulty intermediate
```

### 3. Project Information
```bash
# Get detailed project info
masterlist info ai-powered-seo-assistant --detailed --similar

# Compare projects
masterlist compare ai-powered-seo-assistant ai-content-detector ai-writing-assistant

# List projects by category
masterlist list --category design-tools --quality 7 --limit 10
```

### 4. Statistics & Analytics
```bash
# Show comprehensive stats
masterlist stats --detailed --tags --categories --platforms

# Revenue analysis
masterlist stats --revenue --export revenue_analysis.json

# Tag statistics
masterlist stats --tags
```

### 5. Project Tracking
```bash
# Start tracking a project
masterlist track --project my-ai-tool --status started --progress 25

# Update progress
masterlist track --project my-ai-tool --progress 50 --notes "Completed core features"

# List tracked projects
masterlist track --list
```

### 6. Market Analysis
```bash
# Comprehensive market analysis
masterlist analyze --market-trends --revenue-analysis --opportunities

# Competition analysis
masterlist analyze --competition --risks

# Export analysis
masterlist analyze --market-trends --export market_report.md
```

### 7. Tag Management
```bash
# Auto-tag all projects
masterlist tag --auto-tag

# List all available tags
masterlist tag --list

# Find similar projects
masterlist tag --similar ai-powered-seo-assistant

# Validate tag data
masterlist tag --validate
```

## 🛠️ Advanced Utilities

### Bulk Operations
```bash
# Bulk add tags
python utils/bulk_operations.py --bulk-add-tag high-priority project1 project2 project3

# Export to CSV
python utils/bulk_operations.py --export-csv projects.csv --include-tags

# Validate all projects
python utils/bulk_operations.py --validate

# Generate comprehensive report
python utils/bulk_operations.py --generate-report project_analysis.md
```

### Backup & Restore
```bash
# Create backup
python utils/backup_restore.py --create-backup my_backup

# Auto backup with cleanup
python utils/backup_restore.py --auto-backup

# List backups
python utils/backup_restore.py --list-backups

# Restore from backup
python utils/backup_restore.py --restore my_backup --confirm

# Verify backup integrity
python utils/backup_restore.py --verify my_backup
```

### Tag Management
```bash
# Add tag to project
python tag_manager.py --add-tag project-key new-tag

# Remove tag from project
python tag_manager.py --remove-tag project-key old-tag

# Rename tag globally
python tag_manager.py --rename-tag old-name new-name

# Clean up tag data
python tag_manager.py --clean
```

## 📊 Output Formats

### Table Format (Default)
```bash
masterlist search --include ai-powered --format table
```

### JSON Format
```bash
masterlist search --include ai-powered --format json --export results.json
```

### Markdown Format
```bash
masterlist search --include ai-powered --format markdown --export results.md
```

## 🔍 Search Examples

### Find Quick Wins
```bash
masterlist search --include quick-win beginner-friendly --max-complexity 5
```

### High-Revenue Opportunities
```bash
masterlist search --include high-revenue ai-powered --min-quality 7 --limit 10
```

### Platform-Specific Projects
```bash
masterlist search --platform figma-plugin --include design-focused --min-quality 6
```

### B2B Solutions
```bash
masterlist search --include b2b subscription-model --min-quality 7
```

### Mobile Projects
```bash
masterlist search --include mobile platform-android-app platform-ios-app
```

## 📈 Analytics Examples

### Tag Analysis
```bash
masterlist stats --tags
# Shows: Most common tags, tag frequency, usage patterns
```

### Revenue Analysis
```bash
masterlist stats --revenue
# Shows: Revenue distribution, high-potential projects
```

### Category Breakdown
```bash
masterlist stats --categories
# Shows: Projects per category, category trends
```

### Market Trends
```bash
masterlist analyze --market-trends
# Shows: AI trends, platform popularity, emerging opportunities
```

## 🏷️ Available Tags

### Difficulty Tags
- `beginner-friendly` - Technical complexity 1-3
- `intermediate` - Technical complexity 4-6
- `advanced` - Technical complexity 7-10

### Revenue Tags
- `high-revenue` - Realistic potential $10k+
- `medium-revenue` - Realistic potential $1k-$10k
- `low-revenue` - Realistic potential <$1k

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
- `ai-powered` - Uses AI/ML
- `blockchain` - Blockchain-based
- `automation` - Automation-focused
- `analytics` - Data analytics
- `web-based` - Web applications
- `mobile` - Mobile applications

### Business Tags
- `b2b` - Business-to-business
- `b2c` - Business-to-consumer
- `subscription-model` - SaaS/subscription
- `freemium` - Freemium model
- `one-time-purchase` - One-time payment

### Platform Tags (23 total)
- `platform-figma-plugin`
- `platform-chrome-extension`
- `platform-vscode-extension`
- `platform-web-app`
- `platform-mobile-app`
- And 18 more...

### Category Tags (17 total)
- `category-ai-ml`
- `category-design-tools`
- `category-productivity`
- `category-finance-accounting`
- And 13 more...

## 🔧 Configuration

### User Preferences
Create `masterlist_config.json`:
```json
{
  "preferences": {
    "default_limit": 10,
    "preferred_categories": ["ai-ml", "design-tools"],
    "preferred_difficulty": "intermediate",
    "min_quality_threshold": 6.0,
    "max_complexity_threshold": 7
  }
}
```

### Environment Variables
```bash
export MASTERLIST_DEFAULT_LIMIT=20
export MASTERLIST_QUALITY_THRESHOLD=7.0
export MASTERLIST_COMPLEXITY_THRESHOLD=6
```

## 📋 Project Tracking

### Track Development Progress
```bash
# Start project
masterlist track --project my-tool --status planning --progress 0

# Update progress
masterlist track --project my-tool --status in-progress --progress 45

# Complete project
masterlist track --project my-tool --status completed --progress 100
```

### Status Options
- `idea` - Initial concept
- `planning` - Planning phase
- `started` - Development started
- `in-progress` - Active development
- `testing` - Testing phase
- `completed` - Finished
- `paused` - Temporarily paused
- `cancelled` - Cancelled

## 📊 Statistics Overview

### Current Statistics
- **Total Projects**: 710
- **Total Tags**: 6,771
- **Unique Tags**: 77
- **Average Tags per Project**: 9.5

### Top Tags
1. `quick-win` - 526 projects (74.1%)
2. `ai-powered` - 380 projects (53.5%)
3. `design-focused` - 367 projects (51.7%)
4. `intermediate` - 330 projects (46.5%)
5. `low-revenue` - 306 projects (43.1%)

## 🚨 Troubleshooting

### Common Issues

**Tags not found**
```bash
python masterlist tag --auto-tag
```

**Slow search**
```bash
# Use more specific filters
masterlist search --include specific-tag --category specific-category --limit 5
```

**Export errors**
```bash
# Check file permissions
ls -la results.json
```

**Missing projects**
```bash
# Validate project data
python utils/bulk_operations.py --validate
```

### Performance Tips
- Use `--limit` for large result sets
- Combine multiple filters for better targeting
- Use category filters for faster searches
- Export large datasets to files

## 🔄 Backup & Maintenance

### Regular Backups
```bash
# Daily backup
python utils/backup_restore.py --auto-backup

# Manual backup
python utils/backup_restore.py --create-backup weekly_backup
```

### Data Validation
```bash
# Validate all data
python utils/bulk_operations.py --validate

# Clean tag data
python tag_manager.py --clean
```

### Updates
```bash
# Re-tag projects after updates
python masterlist tag --auto-tag

# Generate fresh statistics
python masterlist stats --detailed
```

## 📚 Additional Resources

- **Quick Start Guide**: `QUICKSTART.md`
- **Tagging System**: `TAGGING_SYSTEM_README.md`
- **Project Structure**: `README.md`
- **API Documentation**: `scripts/README.md`

## 🤝 Contributing

1. Add new tag categories in `simple_tagger.py`
2. Extend search functionality in `tag_search.py`
3. Add new CLI commands in `masterlist`
4. Update documentation and examples

## 📄 License

This project is part of the Masterlist project management system. See main repository for license information.

---

**Ready to explore 710 curated projects!** 🚀

Start with: `masterlist search --include ai-powered --min-quality 7`