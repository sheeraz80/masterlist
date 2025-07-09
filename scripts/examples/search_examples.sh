#!/bin/bash

# Masterlist Search Examples
# This script demonstrates various search capabilities

echo "=== Masterlist Search System Examples ==="
echo

# Basic search examples
echo "1. Basic Search Examples:"
echo "   ./search.py \"automation productivity\""
echo "   ./search.py --category design-tools"
echo "   ./search.py --platform figma-plugin"
echo

# Advanced filtering examples
echo "2. Advanced Filtering Examples:"
echo "   ./search.py --category design-tools --quality-min 7 --revenue-min 5000"
echo "   ./search.py --platform figma-plugin --development-time-max 7 --complexity-max 6"
echo "   ./search.py --keywords \"automation productivity\" --platforms \"vscode,chrome\""
echo

# Filter script examples
echo "3. Filter Script Examples:"
echo "   ./filter.py --revenue-ranges \"0-1000,5000-10000\""
echo "   ./filter.py --platform-groups \"figma-plugin,vscode|chrome-extension\""
echo "   ./filter.py --top-by-category 3"
echo "   ./filter.py --required-features \"automation,AI,productivity\""
echo "   ./filter.py --market-opportunity --min-quality 7 --min-revenue 5000"
echo "   ./filter.py --quick-wins --max-days 7 --min-revenue 1000"
echo

# Similarity search examples
echo "4. Similarity Search Examples:"
echo "   ./find-similar.py --project-id designaudit-buddy"
echo "   ./find-similar.py --problem-keywords \"automation,design,consistency\""
echo "   ./find-similar.py --market-keywords \"developers,teams,enterprise\""
echo "   ./find-similar.py --category design-tools --platforms figma-plugin"
echo

# Complex search examples
echo "5. Complex Search Examples:"
echo "   ./filter.py --criteria-file examples/complex_filter.json"
echo "   ./find-similar.py --criteria-file examples/similarity_criteria.json"
echo

# Output format examples
echo "6. Output Format Examples:"
echo "   ./search.py --category design-tools --output table"
echo "   ./search.py --category design-tools --output detailed --show-path"
echo "   ./search.py --category design-tools --output json"
echo

# Export examples
echo "7. Export Examples:"
echo "   ./filter.py --category design-tools --export results.json"
echo "   ./filter.py --category design-tools --export results.csv"
echo

# Utility examples
echo "8. Utility Examples:"
echo "   ./search.py --stats"
echo "   ./search.py --autocomplete \"auto\""
echo "   ./search.py --save-search \"my-search\" --category design-tools"
echo "   ./search.py --load-search \"my-search\""
echo "   ./search.py --list-saved"
echo

echo "=== End of Examples ==="