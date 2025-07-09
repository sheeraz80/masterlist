#!/usr/bin/env python3
"""
Smart Tagging CLI - Comprehensive project tagging and search interface
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any
import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from simple_tagger import SimpleTagger
from tag_search import TagSearch

class TagCLI:
    def __init__(self):
        """Initialize the tag CLI."""
        self.tagger = SimpleTagger()
        self.searcher = TagSearch()
        
    def auto_tag_all(self):
        """Auto-tag all projects."""
        print("🏷️  Auto-tagging all projects...")
        project_tags = self.tagger.auto_tag_projects()
        self.tagger.tag_data['project_tags'] = project_tags
        self.tagger.save_tag_data()
        print(f"✅ Tagged {len(project_tags)} projects")
        
    def show_stats(self):
        """Show tagging statistics."""
        print("📊 Tag Statistics:")
        stats = self.tagger.generate_tag_statistics()
        
        print(f"📈 Total projects: {stats['total_projects']}")
        print(f"🏷️  Total tags: {stats['total_tags']}")
        print(f"🔖 Unique tags: {stats['unique_tags']}")
        print(f"📊 Avg tags per project: {stats['total_tags'] / max(1, stats['total_projects']):.1f}")
        
        print(f"\n🔝 Top 15 most common tags:")
        for tag, count in stats['most_common_tags'][:15]:
            print(f"   {tag}: {count} projects")
            
    def search_projects(self, include_tags=None, exclude_tags=None, min_quality=0, max_complexity=10, limit=10):
        """Search projects by tags."""
        print("🔍 Searching projects...")
        results = self.searcher.search_by_tags(
            include_tags=include_tags,
            exclude_tags=exclude_tags,
            min_quality=min_quality,
            max_complexity=max_complexity
        )
        
        if not results:
            print("❌ No projects found matching criteria")
            return
            
        print(f"✅ Found {len(results)} projects (showing top {min(limit, len(results))}):\n")
        
        for i, result in enumerate(results[:limit], 1):
            quality_emoji = "🌟" if result['quality_score'] >= 8 else "⭐" if result['quality_score'] >= 7 else "✨"
            complexity_emoji = "🔥" if result['technical_complexity'] >= 8 else "⚡" if result['technical_complexity'] >= 6 else "🟢"
            
            print(f"{i}. {quality_emoji} **{result['name']}** (Quality: {result['quality_score']}/10)")
            print(f"   📂 Category: {result['category']}")
            print(f"   {complexity_emoji} Complexity: {result['technical_complexity']}/10")
            print(f"   🏷️  Tags: {', '.join(result['tags'][:6])}...")
            print(f"   📝 {result['problem_statement']}\n")
            
    def find_similar(self, project_key, limit=5):
        """Find similar projects."""
        print(f"🔍 Finding projects similar to '{project_key}'...")
        results = self.searcher.find_similar_projects(project_key, limit)
        
        if not results:
            print("❌ No similar projects found")
            return
            
        print(f"✅ Found {len(results)} similar projects:\n")
        for result in results:
            similarity_emoji = "🎯" if result['similarity'] >= 0.7 else "🔗" if result['similarity'] >= 0.5 else "🔸"
            
            print(f"{similarity_emoji} **{result['name']}** (similarity: {result['similarity']:.2f})")
            print(f"   🏷️  Common tags: {', '.join(result['common_tags'])}")
            print(f"   ⭐ Quality: {result['quality_score']}/10\n")
            
    def show_combinations(self, limit=10):
        """Show interesting tag combinations."""
        print("🔗 Finding interesting tag combinations...")
        combinations = self.searcher.get_tag_combinations()
        
        print(f"✅ Found {len(combinations)} interesting combinations (showing top {limit}):\n")
        for combo in combinations[:limit]:
            print(f"🔗 **{' + '.join(combo['tags'])}** ({combo['project_count']} projects)")
            print(f"   📂 Examples: {', '.join(combo['projects'])}\n")
            
    def get_recommendations(self):
        """Get project recommendations."""
        print("💡 Getting project recommendations...")
        
        # Interactive preferences (could be expanded)
        preferences = {
            'preferred_tags': ['ai-powered', 'high-revenue', 'quick-win'],
            'avoid_tags': ['needs-improvement'],
            'min_quality': 6.0,
            'max_complexity': 7,
            'max_dev_time_days': 14
        }
        
        results = self.searcher.get_recommendations(preferences)
        
        if not results:
            print("❌ No recommendations found")
            return
            
        print(f"✅ Found {len(results)} recommendations:\n")
        for i, result in enumerate(results, 1):
            revenue_emoji = "💰" if 'high-revenue' in result['tags'] else "💵" if 'medium-revenue' in result['tags'] else "💸"
            time_emoji = "⚡" if 'quick-win' in result['tags'] else "🕐" if 'short-term' in result['tags'] else "⏳"
            
            print(f"{i}. {revenue_emoji} **{result['name']}** (Quality: {result['quality_score']}/10)")
            print(f"   {time_emoji} {result['development_time']}")
            print(f"   🏷️  Tags: {', '.join(result['tags'][:5])}...")
            print(f"   📝 {result['problem_statement']}\n")
            
    def list_all_tags(self):
        """List all available tags."""
        print("🏷️  All Available Tags:\n")
        
        if not self.tagger.tag_data.get('project_tags'):
            print("❌ No tags found. Run --auto-tag first.")
            return
            
        all_tags = set()
        for tags in self.tagger.tag_data['project_tags'].values():
            all_tags.update(tags)
            
        # Group tags by category
        categories = {
            'Category': [tag for tag in all_tags if tag.startswith('category-')],
            'Platform': [tag for tag in all_tags if tag.startswith('platform-')],
            'Difficulty': [tag for tag in all_tags if tag in ['beginner-friendly', 'intermediate', 'advanced']],
            'Revenue': [tag for tag in all_tags if tag in ['high-revenue', 'medium-revenue', 'low-revenue']],
            'Timeline': [tag for tag in all_tags if tag in ['quick-win', 'short-term', 'long-term']],
            'Quality': [tag for tag in all_tags if tag in ['top-rated', 'very-good', 'good', 'fair', 'needs-improvement']],
            'Technology': [tag for tag in all_tags if tag in ['ai-powered', 'blockchain', 'automation', 'analytics', 'web-based', 'mobile']],
            'Business': [tag for tag in all_tags if tag in ['b2b', 'b2c', 'subscription-model', 'freemium', 'one-time-purchase']],
            'Domain': [tag for tag in all_tags if tag in ['design-focused', 'productivity', 'security', 'social', 'e-commerce', 'education', 'finance', 'health', 'content', 'media', 'gaming', 'communication', 'project-management']],
            'Other': [tag for tag in all_tags if not any(tag.startswith(prefix) for prefix in ['category-', 'platform-']) and tag not in ['beginner-friendly', 'intermediate', 'advanced', 'high-revenue', 'medium-revenue', 'low-revenue', 'quick-win', 'short-term', 'long-term', 'top-rated', 'very-good', 'good', 'fair', 'needs-improvement', 'ai-powered', 'blockchain', 'automation', 'analytics', 'web-based', 'mobile', 'b2b', 'b2c', 'subscription-model', 'freemium', 'one-time-purchase', 'design-focused', 'productivity', 'security', 'social', 'e-commerce', 'education', 'finance', 'health', 'content', 'media', 'gaming', 'communication', 'project-management', 'cross-platform']]
        }
        
        for category, tags in categories.items():
            if tags:
                print(f"📂 **{category}** ({len(tags)} tags):")
                for tag in sorted(tags):
                    print(f"   - {tag}")
                print()
                
    def export_report(self, format='markdown'):
        """Export comprehensive report."""
        print(f"📝 Generating comprehensive report...")
        
        if format == 'markdown':
            report = self.tagger.export_tags_markdown()
            with open('comprehensive_tagging_report.md', 'w') as f:
                f.write(report)
            print("✅ Report saved to comprehensive_tagging_report.md")
        else:
            print("❌ Only markdown format is currently supported")

def main():
    parser = argparse.ArgumentParser(description="Smart Tagging CLI - Comprehensive project tagging and search")
    
    # Main commands
    parser.add_argument("--auto-tag", action="store_true", help="Auto-tag all projects")
    parser.add_argument("--stats", action="store_true", help="Show tagging statistics")
    parser.add_argument("--list-tags", action="store_true", help="List all available tags")
    parser.add_argument("--report", action="store_true", help="Generate comprehensive report")
    
    # Search commands
    parser.add_argument("--search", action="store_true", help="Search projects by tags")
    parser.add_argument("--include", nargs='+', help="Tags to include in search")
    parser.add_argument("--exclude", nargs='+', help="Tags to exclude from search")
    parser.add_argument("--min-quality", type=float, default=0, help="Minimum quality score")
    parser.add_argument("--max-complexity", type=int, default=10, help="Maximum complexity")
    parser.add_argument("--similar", help="Find projects similar to this one")
    parser.add_argument("--combinations", action="store_true", help="Show interesting tag combinations")
    parser.add_argument("--recommend", action="store_true", help="Get project recommendations")
    parser.add_argument("--limit", type=int, default=10, help="Limit results")
    
    args = parser.parse_args()
    
    cli = TagCLI()
    
    if args.auto_tag:
        cli.auto_tag_all()
    elif args.stats:
        cli.show_stats()
    elif args.list_tags:
        cli.list_all_tags()
    elif args.report:
        cli.export_report()
    elif args.search or args.include or args.exclude:
        cli.search_projects(
            include_tags=args.include,
            exclude_tags=args.exclude,
            min_quality=args.min_quality,
            max_complexity=args.max_complexity,
            limit=args.limit
        )
    elif args.similar:
        cli.find_similar(args.similar, args.limit)
    elif args.combinations:
        cli.show_combinations(args.limit)
    elif args.recommend:
        cli.get_recommendations()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()