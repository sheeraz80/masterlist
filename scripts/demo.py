#!/usr/bin/env python3
"""
Demo script showing all the features of the masterlist search system
"""

import os
import sys
import subprocess
import time

def run_demo_command(description, command, wait=True):
    """Run a demo command with description"""
    print(f"\n🔍 {description}")
    print(f"Command: {command}")
    print("=" * 60)
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
        print(result.stdout)
        if result.stderr:
            print("Stderr:", result.stderr)
    except subprocess.TimeoutExpired:
        print("Command timed out")
    except Exception as e:
        print(f"Error running command: {e}")
    
    if wait:
        input("\nPress Enter to continue...")

def main():
    """Run the demo"""
    print("🚀 Masterlist Advanced Search System Demo")
    print("=" * 50)
    
    # Change to scripts directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Search Infrastructure Stats
    run_demo_command(
        "Search Engine Statistics",
        "python3 search.py --stats"
    )
    
    # 2. Basic Search
    run_demo_command(
        "Basic Search - Find design-related projects",
        "python3 search.py design --max-results 5"
    )
    
    # 3. Category Filter
    run_demo_command(
        "Category Filter - High-quality design tools",
        "python3 search.py --category design-tools --quality-min 7 --max-results 5"
    )
    
    # 4. Platform Filter
    run_demo_command(
        "Platform Filter - Figma plugins with quick development",
        "python3 search.py --platform figma-plugin --development-time-max 7 --max-results 5"
    )
    
    # 5. Revenue Filter
    run_demo_command(
        "Revenue Filter - High-revenue opportunities",
        "python3 search.py --revenue-min 5000 --complexity-max 6 --max-results 5"
    )
    
    # 6. Advanced Filtering - Market Opportunities
    run_demo_command(
        "Advanced Filter - Market Opportunities",
        "python3 filter.py --market-opportunity --max-results 5"
    )
    
    # 7. Advanced Filtering - Quick Wins
    run_demo_command(
        "Advanced Filter - Quick Wins",
        "python3 filter.py --quick-wins --max-results 5"
    )
    
    # 8. Top Projects by Category
    run_demo_command(
        "Top Projects by Category",
        "python3 filter.py --top-by-category 2"
    )
    
    # 9. Similarity Search
    run_demo_command(
        "Similarity Search - Find projects similar to DesignAudit Buddy",
        "python3 find-similar.py --project-id designaudit-buddy --max-results 3"
    )
    
    # 10. Problem Domain Search
    run_demo_command(
        "Problem Domain Search - Automation and productivity",
        "python3 find-similar.py --problem-keywords \"automation,productivity\" --max-results 3"
    )
    
    # 11. JSON Output
    run_demo_command(
        "JSON Output - Machine-readable format",
        "python3 search.py --category design-tools --output json --max-results 2"
    )
    
    # 12. Detailed Output
    run_demo_command(
        "Detailed Output - Full project information",
        "python3 search.py --category design-tools --output detailed --max-results 2"
    )
    
    # 13. Autocomplete
    run_demo_command(
        "Autocomplete Suggestions",
        "python3 search.py --autocomplete auto"
    )
    
    # 14. Complex Example from Requirements
    run_demo_command(
        "Requirements Example - Design tools with good revenue and low complexity",
        "python3 search.py --category design-tools --revenue-min 5000 --complexity-max 6 --max-results 3"
    )
    
    # 15. Export Demo
    run_demo_command(
        "Export Demo - Save results to JSON file",
        "python3 filter.py --category design-tools --export demo_results.json --max-results 3",
        wait=False
    )
    
    # Check if export file was created
    if os.path.exists("demo_results.json"):
        print("\n✅ Export file 'demo_results.json' created successfully!")
        print("You can now use this file for further analysis or integration.")
    
    print("\n🎉 Demo completed!")
    print("\nKey Features Demonstrated:")
    print("✅ Basic search with keywords")
    print("✅ Category, platform, and quality filtering")
    print("✅ Revenue and complexity filtering")
    print("✅ Development time constraints")
    print("✅ Advanced market opportunity analysis")
    print("✅ Quick wins identification")
    print("✅ Top projects by category")
    print("✅ Similarity search algorithms")
    print("✅ Problem domain matching")
    print("✅ Multiple output formats (table, detailed, JSON)")
    print("✅ Autocomplete suggestions")
    print("✅ Export functionality")
    
    print("\n📚 For more examples, run:")
    print("  ./examples/search_examples.sh")
    print("  ./test_system.py")
    print("  cat README.md")

if __name__ == "__main__":
    main()