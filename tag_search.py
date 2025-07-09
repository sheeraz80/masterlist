#!/usr/bin/env python3
"""
Tag-based Search System - Search projects using smart tags
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Set
from collections import defaultdict

class TagSearch:
    def __init__(self, projects_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize the tag search system."""
        self.projects_path = Path(projects_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tags = self.load_tags()
        
    def load_projects(self) -> Dict[str, Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.projects_path, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict) and 'projects' in data:
                    return data['projects']
                return {}
        except FileNotFoundError:
            print(f"Error: {self.projects_path} not found")
            return {}
            
    def load_tags(self) -> Dict[str, List[str]]:
        """Load tags from JSON file."""
        try:
            with open(self.tags_path, 'r') as f:
                data = json.load(f)
                return data.get('project_tags', {})
        except FileNotFoundError:
            print(f"Error: {self.tags_path} not found")
            return {}
            
    def search_by_tags(self, include_tags: List[str] = None, exclude_tags: List[str] = None, 
                      min_quality: float = 0, max_complexity: int = 10) -> List[Dict[str, Any]]:
        """Search projects by tags and filters."""
        results = []
        
        for project_key, project_tags in self.tags.items():
            if project_key not in self.projects:
                continue
                
            project = self.projects[project_key]
            
            # Apply tag filters
            if include_tags:
                if not any(tag in project_tags for tag in include_tags):
                    continue
                    
            if exclude_tags:
                if any(tag in project_tags for tag in exclude_tags):
                    continue
                    
            # Apply quality filter
            quality_score = project.get('quality_score', 0)
            if quality_score < min_quality:
                continue
                
            # Apply complexity filter
            complexity_text = project.get('technical_complexity', '5')
            if isinstance(complexity_text, str):
                import re
                match = re.search(r'(\d+)', complexity_text)
                complexity = int(match.group(1)) if match else 5
            else:
                complexity = complexity_text
                
            if complexity > max_complexity:
                continue
                
            # Add project to results
            result = {
                'key': project_key,
                'name': project.get('name', project_key),
                'category': project.get('category', 'other'),
                'quality_score': quality_score,
                'technical_complexity': complexity,
                'platforms': project.get('platforms', []),
                'tags': project_tags,
                'revenue_potential': project.get('revenue_potential', ''),
                'development_time': project.get('development_time', ''),
                'problem_statement': project.get('problem_statement', '')[:150] + '...' if len(project.get('problem_statement', '')) > 150 else project.get('problem_statement', '')
            }
            results.append(result)
            
        # Sort by quality score descending
        results.sort(key=lambda x: x['quality_score'], reverse=True)
        return results
        
    def find_similar_projects(self, project_key: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Find projects similar to the given project based on tags."""
        if project_key not in self.tags:
            return []
            
        target_tags = set(self.tags[project_key])
        similarities = []
        
        for other_key, other_tags in self.tags.items():
            if other_key == project_key:
                continue
                
            other_tags_set = set(other_tags)
            
            # Calculate Jaccard similarity
            intersection = len(target_tags & other_tags_set)
            union = len(target_tags | other_tags_set)
            similarity = intersection / union if union > 0 else 0
            
            if similarity > 0.1:  # Only include reasonably similar projects
                similarities.append({
                    'key': other_key,
                    'name': self.projects.get(other_key, {}).get('name', other_key),
                    'similarity': similarity,
                    'common_tags': list(target_tags & other_tags_set),
                    'quality_score': self.projects.get(other_key, {}).get('quality_score', 0)
                })
                
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:limit]
        
    def get_tag_combinations(self, min_projects: int = 5) -> List[Dict[str, Any]]:
        """Find interesting tag combinations."""
        tag_combinations = defaultdict(list)
        
        # Find pairs of tags that often appear together
        for project_key, project_tags in self.tags.items():
            for i, tag1 in enumerate(project_tags):
                for tag2 in project_tags[i+1:]:
                    combo = tuple(sorted([tag1, tag2]))
                    tag_combinations[combo].append(project_key)
                    
        # Filter and sort combinations
        interesting_combos = []
        for combo, projects in tag_combinations.items():
            if len(projects) >= min_projects:
                interesting_combos.append({
                    'tags': combo,
                    'project_count': len(projects),
                    'projects': projects[:5]  # Show first 5 projects
                })
                
        interesting_combos.sort(key=lambda x: x['project_count'], reverse=True)
        return interesting_combos
        
    def get_recommendations(self, preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get project recommendations based on preferences."""
        include_tags = preferences.get('preferred_tags', [])
        exclude_tags = preferences.get('avoid_tags', [])
        min_quality = preferences.get('min_quality', 6.0)
        max_complexity = preferences.get('max_complexity', 7)
        max_dev_time = preferences.get('max_dev_time_days', 14)
        
        results = self.search_by_tags(include_tags, exclude_tags, min_quality, max_complexity)
        
        # Filter by development time if specified
        if max_dev_time:
            filtered_results = []
            for result in results:
                dev_time_text = result.get('development_time', '')
                if dev_time_text:
                    import re
                    days_match = re.search(r'(\d+)\s*days?', dev_time_text.lower())
                    if days_match:
                        days = int(days_match.group(1))
                        if days <= max_dev_time:
                            filtered_results.append(result)
                    else:
                        filtered_results.append(result)  # Include if no time specified
                else:
                    filtered_results.append(result)
            results = filtered_results
            
        return results[:10]  # Return top 10 recommendations
        
    def export_search_results(self, results: List[Dict[str, Any]], format: str = 'markdown') -> str:
        """Export search results in specified format."""
        if format == 'markdown':
            return self._export_markdown(results)
        elif format == 'json':
            return json.dumps(results, indent=2)
        else:
            return str(results)
            
    def _export_markdown(self, results: List[Dict[str, Any]]) -> str:
        """Export results as Markdown."""
        lines = [f'# Search Results ({len(results)} projects)\n']
        
        for i, result in enumerate(results, 1):
            lines.append(f'## {i}. {result["name"]}\n')
            lines.append(f'**Category:** {result["category"]}')
            lines.append(f'**Quality Score:** {result["quality_score"]}/10')
            lines.append(f'**Technical Complexity:** {result["technical_complexity"]}/10')
            lines.append(f'**Platforms:** {", ".join(result["platforms"])}')
            lines.append(f'**Development Time:** {result["development_time"]}')
            lines.append(f'**Revenue Potential:** {result["revenue_potential"]}')
            lines.append(f'\n**Problem:** {result["problem_statement"]}\n')
            
            # Show tags
            lines.append('**Tags:**')
            for tag in sorted(result["tags"]):
                lines.append(f'- {tag}')
            lines.append('')
            
        return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description="Tag-based project search")
    parser.add_argument("--include", "-i", nargs='+', help="Tags to include")
    parser.add_argument("--exclude", "-e", nargs='+', help="Tags to exclude")
    parser.add_argument("--min-quality", "-q", type=float, default=0, help="Minimum quality score")
    parser.add_argument("--max-complexity", "-c", type=int, default=10, help="Maximum complexity")
    parser.add_argument("--similar", "-s", help="Find projects similar to this one")
    parser.add_argument("--combinations", action="store_true", help="Show interesting tag combinations")
    parser.add_argument("--recommend", action="store_true", help="Get recommendations")
    parser.add_argument("--limit", "-l", type=int, default=10, help="Limit results")
    parser.add_argument("--export", help="Export results (markdown, json)")
    
    args = parser.parse_args()
    
    searcher = TagSearch()
    
    if args.similar:
        print(f"🔍 Finding projects similar to '{args.similar}'...")
        results = searcher.find_similar_projects(args.similar, args.limit)
        
        if not results:
            print("❌ No similar projects found")
        else:
            print(f"✅ Found {len(results)} similar projects:\n")
            for result in results:
                print(f"**{result['name']}** (similarity: {result['similarity']:.2f})")
                print(f"Common tags: {', '.join(result['common_tags'])}")
                print(f"Quality: {result['quality_score']}/10\n")
                
    elif args.combinations:
        print("🔗 Finding interesting tag combinations...")
        combinations = searcher.get_tag_combinations()
        
        print(f"✅ Found {len(combinations)} interesting combinations:\n")
        for combo in combinations[:args.limit]:
            print(f"**{' + '.join(combo['tags'])}** ({combo['project_count']} projects)")
            print(f"Examples: {', '.join(combo['projects'])}\n")
            
    elif args.recommend:
        print("💡 Getting project recommendations...")
        
        # Example preferences - in real use, this could be interactive
        preferences = {
            'preferred_tags': ['ai-powered', 'high-revenue', 'quick-win'],
            'avoid_tags': ['needs-improvement'],
            'min_quality': 6.0,
            'max_complexity': 7,
            'max_dev_time_days': 14
        }
        
        results = searcher.get_recommendations(preferences)
        
        if not results:
            print("❌ No recommendations found")
        else:
            print(f"✅ Found {len(results)} recommendations:\n")
            for i, result in enumerate(results, 1):
                print(f"{i}. **{result['name']}** (Quality: {result['quality_score']}/10)")
                print(f"   Tags: {', '.join(result['tags'][:5])}...")
                print(f"   {result['problem_statement']}\n")
                
    else:
        print("🔍 Searching projects...")
        results = searcher.search_by_tags(
            include_tags=args.include,
            exclude_tags=args.exclude,
            min_quality=args.min_quality,
            max_complexity=args.max_complexity
        )
        
        if not results:
            print("❌ No projects found matching criteria")
        else:
            print(f"✅ Found {len(results)} projects:\n")
            
            # Show results
            for i, result in enumerate(results[:args.limit], 1):
                print(f"{i}. **{result['name']}** (Quality: {result['quality_score']}/10)")
                print(f"   Category: {result['category']}")
                print(f"   Tags: {', '.join(result['tags'][:5])}...")
                print(f"   {result['problem_statement']}\n")
                
        # Export if requested
        if args.export and results:
            exported = searcher.export_search_results(results, args.export)
            filename = f"search_results.{args.export}"
            with open(filename, 'w') as f:
                f.write(exported)
            print(f"📤 Results exported to {filename}")

if __name__ == "__main__":
    main()