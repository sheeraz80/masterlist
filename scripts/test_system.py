#!/usr/bin/env python3
"""
Comprehensive test suite for the masterlist search system
"""

import subprocess
import sys
import os
import json
import tempfile
from pathlib import Path

def run_command(cmd, expected_success=True):
    """Run a command and check its result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if expected_success and result.returncode != 0:
            print(f"❌ Command failed: {cmd}")
            print(f"   Error: {result.stderr}")
            return False
        elif not expected_success and result.returncode == 0:
            print(f"❌ Command should have failed but didn't: {cmd}")
            return False
        else:
            print(f"✅ Command succeeded: {cmd}")
            return True
    except subprocess.TimeoutExpired:
        print(f"❌ Command timed out: {cmd}")
        return False
    except Exception as e:
        print(f"❌ Command error: {cmd} - {e}")
        return False

def test_search_infrastructure():
    """Test the search infrastructure"""
    print("\n=== Testing Search Infrastructure ===")
    
    # Test basic functionality
    cmd = "python3 search_infrastructure.py"
    return run_command(cmd)

def test_basic_search():
    """Test basic search functionality"""
    print("\n=== Testing Basic Search ===")
    
    tests = [
        # Basic search
        "python3 search.py design --max-results 5",
        
        # Category filter
        "python3 search.py --category design-tools --max-results 5",
        
        # Platform filter
        "python3 search.py --platform figma-plugin --max-results 5",
        
        # Quality filter
        "python3 search.py --quality-min 7 --max-results 5",
        
        # Revenue filter
        "python3 search.py --revenue-min 5000 --max-results 5",
        
        # Development time filter
        "python3 search.py --development-time-max 7 --max-results 5",
        
        # Complexity filter
        "python3 search.py --complexity-max 6 --max-results 5",
        
        # Combined filters
        "python3 search.py --category design-tools --quality-min 7 --max-results 3",
        
        # Keywords search
        "python3 search.py --keywords \"automation productivity\" --max-results 5",
        
        # Output formats
        "python3 search.py --category design-tools --output table --max-results 3",
        "python3 search.py --category design-tools --output detailed --max-results 2",
        "python3 search.py --category design-tools --output json --max-results 2",
        
        # Stats and autocomplete
        "python3 search.py --stats",
        "python3 search.py --autocomplete auto"
    ]
    
    success_count = 0
    for test in tests:
        if run_command(test):
            success_count += 1
    
    print(f"Search tests: {success_count}/{len(tests)} passed")
    return success_count == len(tests)

def test_advanced_filtering():
    """Test advanced filtering functionality"""
    print("\n=== Testing Advanced Filtering ===")
    
    tests = [
        # Basic filter
        "python3 filter.py --category design-tools --max-results 5",
        
        # Platform filter
        "python3 filter.py --platform figma-plugin --max-results 5",
        
        # Quality range
        "python3 filter.py --quality-min 7 --quality-max 9 --max-results 5",
        
        # Revenue ranges
        "python3 filter.py --revenue-ranges \"1000-5000,5000-10000\" --max-results 5",
        
        # Platform groups
        "python3 filter.py --platform-groups \"figma-plugin|vscode-extension\" --max-results 5",
        
        # Top by category
        "python3 filter.py --top-by-category 2",
        
        # Required features
        "python3 filter.py --required-features \"automation,design\" --max-results 5",
        
        # Market opportunity
        "python3 filter.py --market-opportunity --max-results 5",
        
        # Quick wins
        "python3 filter.py --quick-wins --max-results 5",
        
        # Output formats
        "python3 filter.py --category design-tools --output json --max-results 2"
    ]
    
    success_count = 0
    for test in tests:
        if run_command(test):
            success_count += 1
    
    print(f"Filter tests: {success_count}/{len(tests)} passed")
    return success_count == len(tests)

def test_similarity_search():
    """Test similarity search functionality"""
    print("\n=== Testing Similarity Search ===")
    
    tests = [
        # Project similarity
        "python3 find-similar.py --project-id designaudit-buddy --max-results 3",
        
        # Problem keywords
        "python3 find-similar.py --problem-keywords \"automation,design\" --max-results 3",
        
        # Market keywords
        "python3 find-similar.py --market-keywords \"developers,teams\" --max-results 3",
        
        # Category similarity
        "python3 find-similar.py --category design-tools --max-results 3",
        
        # Platform similarity
        "python3 find-similar.py --platforms figma-plugin --max-results 3",
        
        # Output formats
        "python3 find-similar.py --project-id designaudit-buddy --output json --max-results 2",
        "python3 find-similar.py --project-id designaudit-buddy --output detailed --max-results 2"
    ]
    
    success_count = 0
    for test in tests:
        if run_command(test):
            success_count += 1
    
    print(f"Similarity tests: {success_count}/{len(tests)} passed")
    return success_count == len(tests)

def test_saved_searches():
    """Test saved search functionality"""
    print("\n=== Testing Saved Searches ===")
    
    tests = [
        # Save a search
        "python3 search.py --category design-tools --save-search test-search",
        
        # List saved searches
        "python3 search.py --list-saved",
        
        # Load saved search
        "python3 search.py --load-search test-search --max-results 3"
    ]
    
    success_count = 0
    for test in tests:
        if run_command(test):
            success_count += 1
    
    print(f"Saved search tests: {success_count}/{len(tests)} passed")
    return success_count == len(tests)

def test_export_functionality():
    """Test export functionality"""
    print("\n=== Testing Export Functionality ===")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        json_file = os.path.join(temp_dir, "test_export.json")
        csv_file = os.path.join(temp_dir, "test_export.csv")
        
        tests = [
            f"python3 filter.py --category design-tools --export {json_file} --max-results 3",
            f"python3 filter.py --category design-tools --export {csv_file} --max-results 3"
        ]
        
        success_count = 0
        for test in tests:
            if run_command(test):
                success_count += 1
        
        # Check if files were created
        if os.path.exists(json_file):
            print("✅ JSON export file created")
            success_count += 1
        else:
            print("❌ JSON export file not created")
        
        if os.path.exists(csv_file):
            print("✅ CSV export file created")
            success_count += 1
        else:
            print("❌ CSV export file not created")
    
    print(f"Export tests: {success_count}/4 passed")
    return success_count == 4

def test_requirements_examples():
    """Test the specific examples from requirements"""
    print("\n=== Testing Requirements Examples ===")
    
    examples = [
        # From requirements
        "python3 search.py --category design-tools --revenue-min 5000 --complexity-max 6 --max-results 3",
        "python3 filter.py --platform figma-plugin --development-time-max 7 --quality-min 6 --max-results 3",
        "python3 search.py --keywords \"automation productivity\" --platforms \"vscode-extension,chrome-extension\" --max-results 5"
    ]
    
    success_count = 0
    for example in examples:
        if run_command(example):
            success_count += 1
    
    print(f"Requirements examples: {success_count}/{len(examples)} passed")
    return success_count == len(examples)

def main():
    """Run all tests"""
    print("🚀 Starting Masterlist Search System Tests")
    print("=" * 50)
    
    # Change to scripts directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run all test suites
    tests = [
        test_search_infrastructure,
        test_basic_search,
        test_advanced_filtering,
        test_similarity_search,
        test_saved_searches,
        test_export_functionality,
        test_requirements_examples
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test in tests:
        try:
            if test():
                passed_tests += 1
        except Exception as e:
            print(f"❌ Test suite failed with error: {e}")
    
    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed_tests}/{total_tests} test suites passed")
    
    if passed_tests == total_tests:
        print("✅ All tests passed! The search system is working correctly.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main()