#!/bin/bash

# Masterlist CLI Installation Script

set -e

echo "🚀 Installing Masterlist CLI v2.0..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "masterlist" ]; then
    echo "❌ Installation must be run from the masterlist directory"
    exit 1
fi

# Make sure the CLI is executable
chmod +x masterlist

# Create a symlink for global access (optional)
read -p "Create global symlink? This will allow you to run 'masterlist' from anywhere (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -w /usr/local/bin ]; then
        ln -sf "$(pwd)/masterlist" /usr/local/bin/masterlist
        echo "✅ Global symlink created: /usr/local/bin/masterlist"
    else
        echo "⚠️  Need sudo permissions for global installation"
        sudo ln -sf "$(pwd)/masterlist" /usr/local/bin/masterlist
        echo "✅ Global symlink created: /usr/local/bin/masterlist"
    fi
fi

# Initialize the tag system
echo "🏷️  Initializing tag system..."
python3 masterlist tag --auto-tag > /dev/null 2>&1 || true

# Create sample configuration
if [ ! -f "masterlist_config.json" ]; then
    cat > masterlist_config.json << 'EOF'
{
  "preferences": {
    "default_limit": 10,
    "preferred_categories": ["ai-ml", "design-tools", "productivity"],
    "preferred_difficulty": "intermediate",
    "preferred_timeline": "quick",
    "min_quality_threshold": 6.0,
    "max_complexity_threshold": 7
  },
  "export_formats": {
    "default": "table",
    "supported": ["table", "json", "markdown"]
  },
  "tracking": {
    "enable_auto_tracking": true,
    "backup_interval": "daily"
  }
}
EOF
    echo "📋 Created sample configuration: masterlist_config.json"
fi

# Create quick start guide
if [ ! -f "QUICKSTART.md" ]; then
    cat > QUICKSTART.md << 'EOF'
# Masterlist CLI Quick Start Guide

## Installation Complete! 🎉

### Basic Commands

```bash
# Search for projects
masterlist search --include ai-powered --min-quality 7

# Get recommendations
masterlist recommend --difficulty beginner --timeline quick

# Show statistics
masterlist stats --tags

# Get project info
masterlist info project-key

# Track project progress
masterlist track --project my-project --status started
```

### Common Use Cases

1. **Find beginner-friendly projects**
   ```bash
   masterlist search --include beginner-friendly quick-win --limit 5
   ```

2. **High-revenue opportunities**
   ```bash
   masterlist search --include high-revenue ai-powered --min-quality 7
   ```

3. **Compare similar projects**
   ```bash
   masterlist compare project1 project2 project3
   ```

4. **Market analysis**
   ```bash
   masterlist analyze --market-trends --revenue-analysis
   ```

### Help

- `masterlist --help` - Show all commands
- `masterlist COMMAND --help` - Show command-specific help
- Check README.md for detailed documentation

Happy building! 🚀
EOF
    echo "📖 Created quick start guide: QUICKSTART.md"
fi

echo ""
echo "✅ Masterlist CLI v2.0 installation complete!"
echo ""
echo "🚀 Quick Start:"
echo "   masterlist search --include ai-powered --min-quality 7"
echo "   masterlist recommend --difficulty beginner"
echo "   masterlist stats --tags"
echo ""
echo "📖 Documentation:"
echo "   cat QUICKSTART.md"
echo "   masterlist --help"
echo ""
echo "🎯 Ready to explore 710 curated projects!"