#!/usr/bin/env python3
"""
Advanced Search Tool for Masterlist Projects
Command-line interface for searching projects with multiple filters
"""

import argparse
import json
import sys
import os
from typing import Dict, List, Any, Optional
from search_infrastructure import MasterlistSearchEngine, SearchResult


def parse_revenue_range(value: str) -> int:
    """Parse revenue value (handles k suffix and comma-separated numbers)"""
    if not value:
        return 0
    
    value = value.lower().replace('$', '').replace(',', '')
    
    if value.endswith('k'):
        return int(float(value[:-1]) * 1000)
    elif value.endswith('m'):
        return int(float(value[:-1]) * 1000000)
    else:
        return int(float(value))


def parse_platforms(platforms_str: str) -> List[str]:
    """Parse comma-separated platforms"""
    if not platforms_str:
        return []
    return [p.strip() for p in platforms_str.split(',')]


def format_revenue(revenue_text: str) -> str:
    """Format revenue potential for display"""
    if not revenue_text:
        return "N/A"
    
    # Extract realistic revenue estimate
    lines = revenue_text.split(';')
    for line in lines:
        if 'realistic' in line.lower():
            return line.strip()
    
    return revenue_text[:100] + "..." if len(revenue_text) > 100 else revenue_text


def format_complexity(complexity_text: str) -> str:
    """Format technical complexity for display"""
    if not complexity_text:
        return "N/A"
    
    # Extract the X/10 rating
    import re
    match = re.search(r'(\d+)/10', complexity_text)
    if match:
        return f"{match.group(1)}/10"
    
    return complexity_text[:50] + "..." if len(complexity_text) > 50 else complexity_text


def format_development_time(time_text: str) -> str:
    """Format development time for display"""
    if not time_text:
        return "N/A"
    
    # Extract days estimate
    import re
    match = re.search(r'(\d+)(?:-\d+)?\s*days?', time_text, re.IGNORECASE)
    if match:
        return f"{match.group(1)} days"
    
    return time_text[:50] + "..." if len(time_text) > 50 else time_text


def print_table_results(results: List[SearchResult], show_path: bool = False):
    """Print results in a formatted table"""
    if not results:
        print("No results found.")
        return
    
    headers = ["Name", "Category", "Quality", "Revenue", "Time", "Complexity"]
    if show_path:
        headers.append("Path")
    
    # Calculate column widths
    col_widths = [len(header) for header in headers]
    
    for result in results:
        project = result.project_data
        row_data = [
            project.get('name', 'N/A'),
            project.get('category', 'N/A'),
            f"{project.get('quality_score', 0):.1f}",
            format_revenue(project.get('revenue_potential', '')),
            format_development_time(project.get('development_time', '')),
            format_complexity(project.get('technical_complexity', ''))
        ]
        
        if show_path:
            row_data.append(result.path)
        
        for i, data in enumerate(row_data):
            col_widths[i] = max(col_widths[i], len(str(data)))
    
    # Print header
    header_line = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
    print(header_line)
    print("-" * len(header_line))
    
    # Print results
    for result in results:
        project = result.project_data
        row_data = [
            project.get('name', 'N/A'),
            project.get('category', 'N/A'),
            f"{project.get('quality_score', 0):.1f}",
            format_revenue(project.get('revenue_potential', '')),
            format_development_time(project.get('development_time', '')),
            format_complexity(project.get('technical_complexity', ''))
        ]
        
        if show_path:
            row_data.append(result.path)
        
        row_line = " | ".join(str(data).ljust(col_widths[i]) for i, data in enumerate(row_data))
        print(row_line)


def print_detailed_results(results: List[SearchResult], show_path: bool = False):
    """Print detailed results"""
    if not results:
        print("No results found.")
        return
    
    for i, result in enumerate(results, 1):
        project = result.project_data
        print(f"\n{i}. {project.get('name', 'N/A')}")
        print(f"   Category: {project.get('category', 'N/A')}")
        print(f"   Quality Score: {project.get('quality_score', 0):.1f}")
        print(f"   Platforms: {', '.join(project.get('platforms', []))}")
        print(f"   Revenue Potential: {format_revenue(project.get('revenue_potential', ''))}")
        print(f"   Development Time: {format_development_time(project.get('development_time', ''))}")
        print(f"   Technical Complexity: {format_complexity(project.get('technical_complexity', ''))}")
        
        if show_path:
            print(f"   Path: {result.path}")
        
        if result.matched_fields:
            print(f"   Matched Fields: {', '.join(result.matched_fields)}")
        
        print(f"   Score: {result.score:.2f}")
        
        # Show problem statement
        problem = project.get('problem_statement', '')
        if problem:
            print(f"   Problem: {problem[:200]}..." if len(problem) > 200 else f"   Problem: {problem}")


def print_json_results(results: List[SearchResult]):
    """Print results in JSON format"""
    json_results = []
    for result in results:
        json_result = {
            'project_id': result.project_id,
            'name': result.project_data.get('name'),
            'category': result.project_data.get('category'),
            'quality_score': result.project_data.get('quality_score'),
            'platforms': result.project_data.get('platforms', []),
            'revenue_potential': result.project_data.get('revenue_potential'),
            'development_time': result.project_data.get('development_time'),
            'technical_complexity': result.project_data.get('technical_complexity'),
            'path': result.path,
            'score': result.score,
            'matched_fields': result.matched_fields,
            'problem_statement': result.project_data.get('problem_statement'),
            'solution_description': result.project_data.get('solution_description'),
            'key_features': result.project_data.get('key_features', [])
        }
        json_results.append(json_result)
    
    print(json.dumps(json_results, indent=2))


def save_search_query(query: str, filters: Dict[str, Any], name: str):
    """Save a search query for later use"""
    saved_searches_file = os.path.join(os.path.dirname(__file__), 'saved_searches.json')
    
    saved_searches = {}
    if os.path.exists(saved_searches_file):
        try:
            with open(saved_searches_file, 'r') as f:
                saved_searches = json.load(f)
        except json.JSONDecodeError:
            pass
    
    saved_searches[name] = {
        'query': query,
        'filters': filters,
        'created_at': str(os.path.getctime(saved_searches_file)) if os.path.exists(saved_searches_file) else None
    }
    
    with open(saved_searches_file, 'w') as f:
        json.dump(saved_searches, f, indent=2)
    
    print(f"Search saved as '{name}'")


def load_saved_search(name: str) -> Optional[Dict[str, Any]]:
    """Load a saved search query"""
    saved_searches_file = os.path.join(os.path.dirname(__file__), 'saved_searches.json')
    
    if not os.path.exists(saved_searches_file):
        return None
    
    try:
        with open(saved_searches_file, 'r') as f:
            saved_searches = json.load(f)
        return saved_searches.get(name)
    except json.JSONDecodeError:
        return None


def list_saved_searches():
    """List all saved searches"""
    saved_searches_file = os.path.join(os.path.dirname(__file__), 'saved_searches.json')
    
    if not os.path.exists(saved_searches_file):
        print("No saved searches found.")
        return
    
    try:
        with open(saved_searches_file, 'r') as f:
            saved_searches = json.load(f)
        
        if not saved_searches:
            print("No saved searches found.")
            return
        
        print("Saved searches:")
        for name, search_data in saved_searches.items():
            print(f"  - {name}")
            print(f"    Query: {search_data.get('query', 'N/A')}")
            print(f"    Filters: {search_data.get('filters', {})}")
            print()
    except json.JSONDecodeError:
        print("Error reading saved searches file.")


def main():
    parser = argparse.ArgumentParser(
        description="Advanced search tool for masterlist projects",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Search for design tools with high quality
  ./search.py --category design-tools --quality-min 8
  
  # Search for Figma plugins with quick development time
  ./search.py --platform figma-plugin --development-time-max 7
  
  # Search for high-revenue projects with moderate complexity
  ./search.py --revenue-min 5000 --complexity-max 6
  
  # Search for automation projects with keywords
  ./search.py --keywords "automation productivity" --platforms "vscode,chrome"
  
  # Search and save the query
  ./search.py --category ai-ml --save-search "ai-projects"
  
  # Load a saved search
  ./search.py --load-search "ai-projects"
        """
    )
    
    # Search parameters
    parser.add_argument('query', nargs='?', help='Search query (keywords)')
    parser.add_argument('--category', help='Filter by category')
    parser.add_argument('--platform', '--platforms', help='Filter by platform(s), comma-separated')
    parser.add_argument('--quality-min', type=float, help='Minimum quality score (0-10)')
    parser.add_argument('--quality-max', type=float, help='Maximum quality score (0-10)')
    parser.add_argument('--revenue-min', type=str, help='Minimum revenue potential (e.g., 1000, 5k)')
    parser.add_argument('--revenue-max', type=str, help='Maximum revenue potential (e.g., 10k, 1m)')
    parser.add_argument('--development-time-max', type=int, help='Maximum development time (days)')
    parser.add_argument('--complexity-max', type=int, help='Maximum technical complexity (1-10)')
    parser.add_argument('--keywords', help='Search keywords in problem/solution')
    
    # Output options
    parser.add_argument('--output', choices=['table', 'detailed', 'json'], default='table',
                       help='Output format')
    parser.add_argument('--show-path', action='store_true',
                       help='Show file system path for each project')
    parser.add_argument('--max-results', type=int, default=20,
                       help='Maximum number of results to show')
    
    # Search management
    parser.add_argument('--save-search', help='Save this search query with a name')
    parser.add_argument('--load-search', help='Load a saved search query')
    parser.add_argument('--list-saved', action='store_true',
                       help='List all saved searches')
    
    # Other options
    parser.add_argument('--no-cache', action='store_true',
                       help='Disable search result caching')
    parser.add_argument('--autocomplete', help='Get autocomplete suggestions for a term')
    parser.add_argument('--stats', action='store_true',
                       help='Show search engine statistics')
    
    args = parser.parse_args()
    
    # Initialize search engine
    try:
        search_engine = MasterlistSearchEngine()
    except ValueError as e:
        print(f"Error initializing search engine: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Handle special modes
    if args.stats:
        stats = search_engine.get_stats()
        print("Search Engine Statistics:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
        return
    
    if args.autocomplete:
        suggestions = search_engine.get_autocomplete_suggestions(args.autocomplete)
        print(f"Autocomplete suggestions for '{args.autocomplete}':")
        for suggestion in suggestions:
            print(f"  - {suggestion}")
        return
    
    if args.list_saved:
        list_saved_searches()
        return
    
    # Load saved search if specified
    query = args.query or ""
    filters = {}
    
    if args.load_search:
        saved_search = load_saved_search(args.load_search)
        if saved_search:
            query = saved_search.get('query', '')
            filters = saved_search.get('filters', {})
            print(f"Loaded saved search: {args.load_search}")
        else:
            print(f"Saved search '{args.load_search}' not found.")
            return
    
    # Build filters from command line arguments
    if args.category:
        filters['category'] = args.category
    
    if args.platform:
        filters['platforms'] = parse_platforms(args.platform)
    
    if args.quality_min is not None:
        filters['quality_min'] = args.quality_min
    
    if args.quality_max is not None:
        filters['quality_max'] = args.quality_max
    
    if args.revenue_min:
        filters['revenue_min'] = parse_revenue_range(args.revenue_min)
    
    if args.revenue_max:
        filters['revenue_max'] = parse_revenue_range(args.revenue_max)
    
    if args.development_time_max:
        filters['development_time_max'] = args.development_time_max
    
    if args.complexity_max:
        filters['complexity_max'] = args.complexity_max
    
    # Handle keywords
    if args.keywords:
        if query:
            query += " " + args.keywords
        else:
            query = args.keywords
    
    # Perform search
    try:
        results = search_engine.search(
            query=query,
            filters=filters,
            use_cache=not args.no_cache,
            max_results=args.max_results
        )
    except Exception as e:
        print(f"Search error: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Save search if requested
    if args.save_search:
        save_search_query(query, filters, args.save_search)
    
    # Display results
    if args.output == 'table':
        print(f"Found {len(results)} results:")
        print_table_results(results, args.show_path)
    elif args.output == 'detailed':
        print(f"Found {len(results)} results:")
        print_detailed_results(results, args.show_path)
    elif args.output == 'json':
        print_json_results(results)
    
    # Show search summary
    if args.output != 'json' and results:
        print(f"\nSearch completed. {len(results)} results found.")
        if query:
            print(f"Query: {query}")
        if filters:
            print(f"Filters: {filters}")


if __name__ == "__main__":
    main()