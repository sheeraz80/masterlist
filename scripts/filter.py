#!/usr/bin/env python3
"""
Advanced Filtering Tool for Masterlist Projects
Provides complex filtering capabilities with multiple criteria combinations
"""

import argparse
import json
import sys
import os
from typing import Dict, List, Any, Optional, Union
from search_infrastructure import MasterlistSearchEngine, SearchResult
from search import (
    parse_revenue_range, parse_platforms, format_revenue, format_complexity,
    format_development_time, print_table_results, print_detailed_results,
    print_json_results, save_search_query, load_saved_search, list_saved_searches
)


class AdvancedFilter:
    """Advanced filtering with complex criteria combinations"""
    
    def __init__(self, search_engine: MasterlistSearchEngine):
        self.search_engine = search_engine
    
    def filter_by_multiple_criteria(self, criteria: List[Dict[str, Any]], 
                                   combine_mode: str = 'AND') -> List[SearchResult]:
        """
        Filter projects using multiple criteria with AND/OR logic
        
        Args:
            criteria: List of filter criteria dictionaries
            combine_mode: 'AND' or 'OR' - how to combine criteria
            
        Returns:
            List of SearchResult objects
        """
        if not criteria:
            return []
        
        # Apply first criterion
        first_criterion = criteria[0]
        result_sets = [set(r.project_id for r in self.search_engine.search(
            query=first_criterion.get('query', ''),
            filters=first_criterion.get('filters', {}),
            max_results=1000
        ))]
        
        # Apply remaining criteria
        for criterion in criteria[1:]:
            results = self.search_engine.search(
                query=criterion.get('query', ''),
                filters=criterion.get('filters', {}),
                max_results=1000
            )
            result_sets.append(set(r.project_id for r in results))
        
        # Combine results based on mode
        if combine_mode.upper() == 'AND':
            final_ids = set.intersection(*result_sets)
        else:  # OR
            final_ids = set.union(*result_sets)
        
        # Get full results for final IDs
        all_results = self.search_engine.search(max_results=1000)
        final_results = [r for r in all_results if r.project_id in final_ids]
        
        return final_results
    
    def filter_by_revenue_ranges(self, ranges: List[Dict[str, int]]) -> List[SearchResult]:
        """Filter by multiple revenue ranges"""
        all_results = []
        
        for range_filter in ranges:
            results = self.search_engine.search(
                filters={
                    'revenue_min': range_filter.get('min', 0),
                    'revenue_max': range_filter.get('max', float('inf'))
                },
                max_results=1000
            )
            all_results.extend(results)
        
        # Remove duplicates
        seen_ids = set()
        unique_results = []
        for result in all_results:
            if result.project_id not in seen_ids:
                seen_ids.add(result.project_id)
                unique_results.append(result)
        
        return unique_results
    
    def filter_by_platform_combinations(self, platform_groups: List[List[str]]) -> List[SearchResult]:
        """Filter by combinations of platforms"""
        all_results = []
        
        for platform_group in platform_groups:
            results = self.search_engine.search(
                filters={'platforms': platform_group},
                max_results=1000
            )
            all_results.extend(results)
        
        # Remove duplicates
        seen_ids = set()
        unique_results = []
        for result in all_results:
            if result.project_id not in seen_ids:
                seen_ids.add(result.project_id)
                unique_results.append(result)
        
        return unique_results
    
    def filter_by_complexity_development_matrix(self, complexity_max: int, 
                                              development_max: int) -> List[SearchResult]:
        """Filter by complexity vs development time matrix"""
        return self.search_engine.search(
            filters={
                'complexity_max': complexity_max,
                'development_time_max': development_max
            },
            max_results=1000
        )
    
    def filter_top_projects_by_category(self, top_n: int = 5) -> Dict[str, List[SearchResult]]:
        """Get top N projects from each category"""
        categories = self.search_engine.get_categories()
        top_projects = {}
        
        for category in categories:
            results = self.search_engine.search(
                filters={'category': category},
                max_results=1000
            )
            # Sort by quality score
            results.sort(key=lambda r: r.project_data.get('quality_score', 0), reverse=True)
            top_projects[category] = results[:top_n]
        
        return top_projects
    
    def filter_by_feature_requirements(self, required_features: List[str]) -> List[SearchResult]:
        """Filter projects that mention all required features"""
        all_results = self.search_engine.search(max_results=1000)
        matching_results = []
        
        for result in all_results:
            project_data = result.project_data
            
            # Check key features
            key_features = project_data.get('key_features', [])
            key_features_text = ' '.join(key_features).lower()
            
            # Check other text fields
            text_fields = [
                project_data.get('problem_statement', ''),
                project_data.get('solution_description', ''),
                project_data.get('name', '')
            ]
            all_text = ' '.join(text_fields).lower()
            
            # Check if all required features are mentioned
            feature_matches = 0
            for feature in required_features:
                feature_lower = feature.lower()
                if feature_lower in key_features_text or feature_lower in all_text:
                    feature_matches += 1
            
            if feature_matches == len(required_features):
                matching_results.append(result)
        
        return matching_results
    
    def filter_by_target_audience(self, audience_keywords: List[str]) -> List[SearchResult]:
        """Filter by target audience keywords"""
        all_results = self.search_engine.search(max_results=1000)
        matching_results = []
        
        for result in all_results:
            target_users = result.project_data.get('target_users', '').lower()
            
            for keyword in audience_keywords:
                if keyword.lower() in target_users:
                    matching_results.append(result)
                    break
        
        return matching_results
    
    def filter_by_market_opportunity(self, min_quality: float = 7.0, 
                                   min_revenue: int = 5000,
                                   max_complexity: int = 6) -> List[SearchResult]:
        """Filter projects with good market opportunity"""
        return self.search_engine.search(
            filters={
                'quality_min': min_quality,
                'revenue_min': min_revenue,
                'complexity_max': max_complexity
            },
            max_results=1000
        )
    
    def filter_quick_wins(self, max_days: int = 7, min_revenue: int = 1000) -> List[SearchResult]:
        """Filter projects that are quick wins (low dev time, decent revenue)"""
        return self.search_engine.search(
            filters={
                'development_time_max': max_days,
                'revenue_min': min_revenue
            },
            max_results=1000
        )
    
    def filter_by_competition_level(self, competition_keywords: List[str]) -> List[SearchResult]:
        """Filter by competition level keywords"""
        all_results = self.search_engine.search(max_results=1000)
        matching_results = []
        
        for result in all_results:
            competition_text = result.project_data.get('competition_level', '').lower()
            
            for keyword in competition_keywords:
                if keyword.lower() in competition_text:
                    matching_results.append(result)
                    break
        
        return matching_results


def parse_criteria_file(file_path: str) -> List[Dict[str, Any]]:
    """Parse filter criteria from JSON file"""
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        raise ValueError(f"Error reading criteria file: {e}")


def parse_revenue_ranges(ranges_str: str) -> List[Dict[str, int]]:
    """Parse revenue ranges from string like '0-1000,5000-10000'"""
    ranges = []
    for range_str in ranges_str.split(','):
        range_str = range_str.strip()
        if '-' in range_str:
            min_val, max_val = range_str.split('-')
            ranges.append({
                'min': parse_revenue_range(min_val),
                'max': parse_revenue_range(max_val)
            })
        else:
            # Single value - treat as minimum
            ranges.append({
                'min': parse_revenue_range(range_str),
                'max': float('inf')
            })
    return ranges


def parse_platform_groups(groups_str: str) -> List[List[str]]:
    """Parse platform groups from string like 'figma-plugin,vscode|chrome-extension'"""
    groups = []
    for group_str in groups_str.split('|'):
        platforms = [p.strip() for p in group_str.split(',')]
        groups.append(platforms)
    return groups


def main():
    parser = argparse.ArgumentParser(
        description="Advanced filtering tool for masterlist projects",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Filter Examples:
  
  # Basic filtering
  ./filter.py --category design-tools --quality-min 8
  
  # Multiple revenue ranges
  ./filter.py --revenue-ranges "0-1000,5000-10000"
  
  # Platform combinations (OR logic)
  ./filter.py --platform-groups "figma-plugin,vscode|chrome-extension"
  
  # Complexity vs development time matrix
  ./filter.py --complexity-max 5 --development-time-max 10
  
  # Top projects by category
  ./filter.py --top-by-category 3
  
  # Projects with specific features
  ./filter.py --required-features "automation,AI,productivity"
  
  # Target audience filtering
  ./filter.py --audience "developers,designers,students"
  
  # Market opportunity filter
  ./filter.py --market-opportunity --min-quality 7 --min-revenue 5000 --max-complexity 6
  
  # Quick wins filter
  ./filter.py --quick-wins --max-days 7 --min-revenue 1000
  
  # Competition level filter
  ./filter.py --competition "low,medium"
  
  # Complex criteria from file
  ./filter.py --criteria-file complex_filter.json
        """
    )
    
    # Basic filters
    parser.add_argument('--category', help='Filter by category')
    parser.add_argument('--platform', '--platforms', help='Filter by platform(s)')
    parser.add_argument('--quality-min', type=float, help='Minimum quality score')
    parser.add_argument('--quality-max', type=float, help='Maximum quality score')
    parser.add_argument('--revenue-min', type=str, help='Minimum revenue potential')
    parser.add_argument('--revenue-max', type=str, help='Maximum revenue potential')
    parser.add_argument('--development-time-max', type=int, help='Maximum development time (days)')
    parser.add_argument('--complexity-max', type=int, help='Maximum technical complexity')
    
    # Advanced filters
    parser.add_argument('--revenue-ranges', type=str,
                       help='Multiple revenue ranges (e.g., "0-1000,5000-10000")')
    parser.add_argument('--platform-groups', type=str,
                       help='Platform combinations with OR logic (e.g., "figma,vscode|chrome")')
    parser.add_argument('--top-by-category', type=int, metavar='N',
                       help='Show top N projects from each category')
    parser.add_argument('--required-features', type=str,
                       help='Required features (comma-separated)')
    parser.add_argument('--audience', type=str,
                       help='Target audience keywords (comma-separated)')
    parser.add_argument('--competition', type=str,
                       help='Competition level keywords (comma-separated)')
    
    # Predefined filters
    parser.add_argument('--market-opportunity', action='store_true',
                       help='Filter for good market opportunities')
    parser.add_argument('--quick-wins', action='store_true',
                       help='Filter for quick win projects')
    
    # Market opportunity parameters
    parser.add_argument('--min-quality', type=float, default=7.0,
                       help='Minimum quality for market opportunity filter')
    parser.add_argument('--min-revenue', type=int, default=5000,
                       help='Minimum revenue for market opportunity filter')
    parser.add_argument('--max-complexity', type=int, default=6,
                       help='Maximum complexity for market opportunity filter')
    
    # Quick wins parameters
    parser.add_argument('--max-days', type=int, default=7,
                       help='Maximum days for quick wins filter')
    parser.add_argument('--min-revenue-quick', type=int, default=1000,
                       help='Minimum revenue for quick wins filter')
    
    # Advanced criteria
    parser.add_argument('--criteria-file', type=str,
                       help='JSON file with complex filter criteria')
    parser.add_argument('--combine-mode', choices=['AND', 'OR'], default='AND',
                       help='How to combine multiple criteria')
    
    # Output options
    parser.add_argument('--output', choices=['table', 'detailed', 'json'], default='table',
                       help='Output format')
    parser.add_argument('--show-path', action='store_true',
                       help='Show file system path for each project')
    parser.add_argument('--max-results', type=int, default=50,
                       help='Maximum number of results to show')
    parser.add_argument('--export', type=str,
                       help='Export results to file (CSV or JSON)')
    
    # Search management
    parser.add_argument('--save-filter', help='Save this filter with a name')
    parser.add_argument('--load-filter', help='Load a saved filter')
    parser.add_argument('--list-saved', action='store_true',
                       help='List all saved filters')
    
    args = parser.parse_args()
    
    # Initialize search engine
    try:
        search_engine = MasterlistSearchEngine()
    except ValueError as e:
        print(f"Error initializing search engine: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Initialize advanced filter
    advanced_filter = AdvancedFilter(search_engine)
    
    # Handle special modes
    if args.list_saved:
        list_saved_searches()
        return
    
    # Load saved filter if specified
    if args.load_filter:
        saved_filter = load_saved_search(args.load_filter)
        if saved_filter:
            print(f"Loaded saved filter: {args.load_filter}")
            # Apply saved filter settings to args
            # This is a simplified implementation
        else:
            print(f"Saved filter '{args.load_filter}' not found.")
            return
    
    results = []
    
    # Handle complex criteria from file
    if args.criteria_file:
        try:
            criteria = parse_criteria_file(args.criteria_file)
            results = advanced_filter.filter_by_multiple_criteria(criteria, args.combine_mode)
        except ValueError as e:
            print(f"Error processing criteria file: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Handle predefined filters
    elif args.market_opportunity:
        results = advanced_filter.filter_by_market_opportunity(
            min_quality=args.min_quality,
            min_revenue=args.min_revenue,
            max_complexity=args.max_complexity
        )
    
    elif args.quick_wins:
        results = advanced_filter.filter_quick_wins(
            max_days=args.max_days,
            min_revenue=args.min_revenue_quick
        )
    
    elif args.top_by_category:
        top_projects = advanced_filter.filter_top_projects_by_category(args.top_by_category)
        
        if args.output == 'json':
            json_output = {}
            for category, projects in top_projects.items():
                json_output[category] = [
                    {
                        'project_id': p.project_id,
                        'name': p.project_data.get('name'),
                        'quality_score': p.project_data.get('quality_score'),
                        'score': p.score
                    }
                    for p in projects
                ]
            print(json.dumps(json_output, indent=2))
        else:
            for category, projects in top_projects.items():
                print(f"\n{category.upper()}:")
                if args.output == 'table':
                    print_table_results(projects, args.show_path)
                else:
                    print_detailed_results(projects, args.show_path)
        return
    
    # Handle advanced filters
    elif args.revenue_ranges:
        ranges = parse_revenue_ranges(args.revenue_ranges)
        results = advanced_filter.filter_by_revenue_ranges(ranges)
    
    elif args.platform_groups:
        groups = parse_platform_groups(args.platform_groups)
        results = advanced_filter.filter_by_platform_combinations(groups)
    
    elif args.required_features:
        features = [f.strip() for f in args.required_features.split(',')]
        results = advanced_filter.filter_by_feature_requirements(features)
    
    elif args.audience:
        audience_keywords = [a.strip() for a in args.audience.split(',')]
        results = advanced_filter.filter_by_target_audience(audience_keywords)
    
    elif args.competition:
        competition_keywords = [c.strip() for c in args.competition.split(',')]
        results = advanced_filter.filter_by_competition_level(competition_keywords)
    
    # Handle basic filters
    else:
        filters = {}
        
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
        
        results = search_engine.search(filters=filters, max_results=args.max_results)
    
    # Save filter if requested
    if args.save_filter:
        filter_data = {
            'query': '',
            'filters': vars(args)  # Save all arguments
        }
        save_search_query('', filter_data, args.save_filter)
    
    # Limit results
    if len(results) > args.max_results:
        results = results[:args.max_results]
    
    # Export results if requested
    if args.export:
        export_results(results, args.export)
    
    # Display results
    if args.output == 'table':
        print(f"Found {len(results)} filtered results:")
        print_table_results(results, args.show_path)
    elif args.output == 'detailed':
        print(f"Found {len(results)} filtered results:")
        print_detailed_results(results, args.show_path)
    elif args.output == 'json':
        print_json_results(results)
    
    # Show filter summary
    if args.output != 'json' and results:
        print(f"\nFiltering completed. {len(results)} results found.")


def export_results(results: List[SearchResult], export_file: str):
    """Export results to CSV or JSON file"""
    if export_file.endswith('.json'):
        export_data = []
        for result in results:
            export_data.append({
                'project_id': result.project_id,
                'name': result.project_data.get('name'),
                'category': result.project_data.get('category'),
                'quality_score': result.project_data.get('quality_score'),
                'platforms': result.project_data.get('platforms', []),
                'revenue_potential': result.project_data.get('revenue_potential'),
                'development_time': result.project_data.get('development_time'),
                'technical_complexity': result.project_data.get('technical_complexity'),
                'path': result.path,
                'score': result.score
            })
        
        with open(export_file, 'w') as f:
            json.dump(export_data, f, indent=2)
    
    elif export_file.endswith('.csv'):
        import csv
        with open(export_file, 'w', newline='') as f:
            fieldnames = ['project_id', 'name', 'category', 'quality_score', 'platforms',
                         'revenue_potential', 'development_time', 'technical_complexity',
                         'path', 'score']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            
            for result in results:
                writer.writerow({
                    'project_id': result.project_id,
                    'name': result.project_data.get('name'),
                    'category': result.project_data.get('category'),
                    'quality_score': result.project_data.get('quality_score'),
                    'platforms': '|'.join(result.project_data.get('platforms', [])),
                    'revenue_potential': format_revenue(result.project_data.get('revenue_potential', '')),
                    'development_time': format_development_time(result.project_data.get('development_time', '')),
                    'technical_complexity': format_complexity(result.project_data.get('technical_complexity', '')),
                    'path': result.path,
                    'score': result.score
                })
    
    print(f"Results exported to {export_file}")


if __name__ == "__main__":
    main()