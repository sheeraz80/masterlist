#!/usr/bin/env python3
"""
Simple Smart Tagging System - Fast project categorization without NLTK
"""

import json
import argparse
import re
from pathlib import Path
from typing import List, Dict, Any, Set
from collections import defaultdict, Counter

class SimpleTagger:
    def __init__(self, data_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize the simple tagger."""
        self.data_path = Path(data_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tag_data = self.load_tag_data()
        
    def load_projects(self) -> List[Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                # Handle nested structure
                if isinstance(data, dict) and 'projects' in data:
                    projects = []
                    for project_key, project_data in data['projects'].items():
                        if isinstance(project_data, dict):
                            project_data['key'] = project_key
                            projects.append(project_data)
                    return projects
                elif isinstance(data, list):
                    return data
                else:
                    return []
        except FileNotFoundError:
            print(f"Error: {self.data_path} not found")
            return []
            
    def load_tag_data(self) -> Dict[str, Any]:
        """Load tag data from JSON file."""
        try:
            with open(self.tags_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                'project_tags': {},
                'tag_definitions': {},
                'tag_statistics': {}
            }
            
    def save_tag_data(self):
        """Save tag data to JSON file."""
        with open(self.tags_path, 'w') as f:
            json.dump(self.tag_data, f, indent=2)
            
    def extract_keywords(self, text: str) -> List[str]:
        """Simple keyword extraction without NLTK."""
        if not text:
            return []
            
        # Basic cleanup and tokenization
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        words = text.split()
        
        # Remove common stop words
        stop_words = {
            'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were',
            'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'of', 'in', 'for', 'with', 'by', 'from',
            'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
            'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
            'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
            'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
            'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now', 'also',
            'app', 'tool', 'system', 'using', 'use', 'users', 'user', 'like', 'need', 'needs',
            'provide', 'provides', 'help', 'helps', 'plugin', 'extension', 'platform', 'project'
        }
        
        # Filter words
        keywords = [word for word in words if len(word) > 2 and word not in stop_words]
        
        return keywords
        
    def auto_tag_projects(self) -> Dict[str, List[str]]:
        """Automatically tag projects based on content analysis."""
        project_tags = {}
        
        for project in self.projects:
            tags = set()
            project_key = project.get('key', project.get('name', 'unknown'))
            
            # Category-based tags
            category = project.get('category', 'other')
            if category != 'other':
                tags.add(f'category-{category}')
                
            # Platform-based tags
            platforms = project.get('platforms', [])
            for platform in platforms:
                tags.add(f'platform-{platform}')
                
            # Difficulty tags based on technical complexity
            complexity = project.get('technical_complexity', 5)
            if isinstance(complexity, str):
                # Extract number from string like "4/10"
                match = re.search(r'(\d+)', complexity)
                if match:
                    complexity = int(match.group(1))
                else:
                    complexity = 5
                    
            if complexity <= 3:
                tags.add('beginner-friendly')
            elif complexity <= 6:
                tags.add('intermediate')
            else:
                tags.add('advanced')
                
            # Revenue tags
            revenue_text = project.get('revenue_potential', '')
            if revenue_text:
                # Extract realistic revenue estimate
                realistic_match = re.search(r'realistic[:\s]*[~$]*(\d+)[,\d]*', revenue_text.lower())
                if realistic_match:
                    realistic_revenue = int(realistic_match.group(1))
                    if realistic_revenue >= 5000:
                        tags.add('high-revenue')
                    elif realistic_revenue >= 1000:
                        tags.add('medium-revenue')
                    else:
                        tags.add('low-revenue')
                        
            # Development time tags
            dev_time_text = project.get('development_time', '')
            if dev_time_text:
                # Extract days from text like "~5 days"
                days_match = re.search(r'(\d+)\s*days?', dev_time_text.lower())
                if days_match:
                    days = int(days_match.group(1))
                    if days <= 7:
                        tags.add('quick-win')
                    elif days <= 14:
                        tags.add('short-term')
                    else:
                        tags.add('long-term')
                        
            # Business model tags
            revenue_model = project.get('revenue_model', '').lower()
            if 'subscription' in revenue_model or 'saas' in revenue_model:
                tags.add('subscription-model')
            if 'freemium' in revenue_model:
                tags.add('freemium')
            if 'one-time' in revenue_model:
                tags.add('one-time-purchase')
                
            # Target market tags
            target_users = project.get('target_users', '').lower()
            if 'enterprise' in target_users or 'business' in target_users:
                tags.add('b2b')
            if 'personal' in target_users or 'individual' in target_users:
                tags.add('b2c')
                
            # Technology tags based on keywords
            all_text = ' '.join([
                project.get('name', ''),
                project.get('problem_statement', ''),
                project.get('solution_description', ''),
                str(project.get('key_features', [])),
                project.get('target_users', '')
            ]).lower()
            
            if any(term in all_text for term in ['ai', 'artificial intelligence', 'machine learning', 'ml']):
                tags.add('ai-powered')
            if any(term in all_text for term in ['blockchain', 'crypto', 'defi', 'web3']):
                tags.add('blockchain')
            if any(term in all_text for term in ['automation', 'automated', 'auto']):
                tags.add('automation')
            if any(term in all_text for term in ['analytics', 'analysis', 'data']):
                tags.add('analytics')
            if any(term in all_text for term in ['mobile', 'smartphone', 'android', 'ios']):
                tags.add('mobile')
            if any(term in all_text for term in ['web', 'browser', 'online']):
                tags.add('web-based')
            if any(term in all_text for term in ['design', 'ui', 'ux', 'interface']):
                tags.add('design-focused')
            if any(term in all_text for term in ['productivity', 'efficiency', 'workflow']):
                tags.add('productivity')
            if any(term in all_text for term in ['security', 'privacy', 'protection']):
                tags.add('security')
            if any(term in all_text for term in ['social', 'sharing', 'collaboration']):
                tags.add('social')
            if any(term in all_text for term in ['e-commerce', 'shopping', 'marketplace']):
                tags.add('e-commerce')
            if any(term in all_text for term in ['education', 'learning', 'training']):
                tags.add('education')
            if any(term in all_text for term in ['finance', 'financial', 'money', 'payment']):
                tags.add('finance')
            if any(term in all_text for term in ['health', 'fitness', 'medical']):
                tags.add('health')
            if any(term in all_text for term in ['content', 'writing', 'text']):
                tags.add('content')
            if any(term in all_text for term in ['video', 'audio', 'media']):
                tags.add('media')
            if any(term in all_text for term in ['game', 'gaming', 'entertainment']):
                tags.add('gaming')
            if any(term in all_text for term in ['communication', 'messaging', 'chat']):
                tags.add('communication')
            if any(term in all_text for term in ['project', 'task', 'management']):
                tags.add('project-management')
                
            # Quality score tags
            quality_score = project.get('quality_score', 0)
            if quality_score >= 8:
                tags.add('top-rated')
            elif quality_score >= 7:
                tags.add('very-good')
            elif quality_score >= 6:
                tags.add('good')
            elif quality_score >= 5:
                tags.add('fair')
            else:
                tags.add('needs-improvement')
                
            # Cross-platform tag
            if len(platforms) > 1:
                tags.add('cross-platform')
                
            project_tags[project_key] = list(tags)
            
        return project_tags
        
    def generate_tag_statistics(self) -> Dict[str, Any]:
        """Generate tag usage statistics."""
        stats = {
            'total_projects': len(self.projects),
            'total_tags': 0,
            'unique_tags': 0,
            'tag_frequency': {},
            'most_common_tags': [],
            'projects_per_tag': {},
            'tag_categories': {}
        }
        
        all_tags = []
        tag_counter = Counter()
        
        for project_key, tags in self.tag_data.get('project_tags', {}).items():
            all_tags.extend(tags)
            tag_counter.update(tags)
            
        stats['total_tags'] = len(all_tags)
        stats['unique_tags'] = len(set(all_tags))
        stats['tag_frequency'] = dict(tag_counter)
        stats['most_common_tags'] = tag_counter.most_common(20)
        
        # Projects per tag
        for tag in set(all_tags):
            count = sum(1 for tags in self.tag_data.get('project_tags', {}).values() if tag in tags)
            stats['projects_per_tag'][tag] = count
            
        # Categorize tags
        for tag in set(all_tags):
            if tag.startswith('category-'):
                stats['tag_categories'].setdefault('category', []).append(tag)
            elif tag.startswith('platform-'):
                stats['tag_categories'].setdefault('platform', []).append(tag)
            elif tag in ['beginner-friendly', 'intermediate', 'advanced']:
                stats['tag_categories'].setdefault('difficulty', []).append(tag)
            elif tag in ['high-revenue', 'medium-revenue', 'low-revenue']:
                stats['tag_categories'].setdefault('revenue', []).append(tag)
            elif tag in ['quick-win', 'short-term', 'long-term']:
                stats['tag_categories'].setdefault('timeline', []).append(tag)
            else:
                stats['tag_categories'].setdefault('other', []).append(tag)
                
        return stats
        
    def export_tags_markdown(self) -> str:
        """Export tags as Markdown."""
        lines = ['# Smart Tagging System Report\n']
        
        # Statistics
        stats = self.generate_tag_statistics()
        lines.append('## Tag Statistics\n')
        lines.append(f'- Total Projects: {stats["total_projects"]}')
        lines.append(f'- Total Tags: {stats["total_tags"]}')
        lines.append(f'- Unique Tags: {stats["unique_tags"]}')
        lines.append(f'- Average Tags per Project: {stats["total_tags"] / max(1, stats["total_projects"]):.1f}\n')
        
        # Most common tags
        lines.append('## Most Common Tags\n')
        for tag, count in stats['most_common_tags'][:15]:
            lines.append(f'- **{tag}**: {count} projects')
            
        # Tag categories
        lines.append('\n## Tag Categories\n')
        for category, tags in stats['tag_categories'].items():
            lines.append(f'### {category.title()}\n')
            for tag in sorted(tags):
                count = stats['projects_per_tag'].get(tag, 0)
                lines.append(f'- {tag}: {count} projects')
            lines.append('')
            
        return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description="Simple project tagging system")
    parser.add_argument("--auto-tag", "-a", action="store_true", help="Auto-tag all projects")
    parser.add_argument("--stats", action="store_true", help="Show tag statistics")
    parser.add_argument("--report", action="store_true", help="Generate markdown report")
    
    args = parser.parse_args()
    
    tagger = SimpleTagger()
    
    if args.auto_tag:
        print("🏷️  Auto-tagging projects...")
        project_tags = tagger.auto_tag_projects()
        tagger.tag_data['project_tags'] = project_tags
        tagger.save_tag_data()
        
        print(f"✅ Tagged {len(project_tags)} projects")
        
        # Show sample results
        print("\n📋 Sample tags:")
        for project_key, tags in list(project_tags.items())[:5]:
            print(f"\n{project_key}:")
            for tag in sorted(tags)[:8]:  # Show first 8 tags
                print(f"  - {tag}")
                
    elif args.stats:
        print("📊 Tag Statistics:")
        stats = tagger.generate_tag_statistics()
        
        print(f"Total projects: {stats['total_projects']}")
        print(f"Total tags: {stats['total_tags']}")
        print(f"Unique tags: {stats['unique_tags']}")
        print(f"Average tags per project: {stats['total_tags'] / max(1, stats['total_projects']):.1f}")
        print(f"\nMost common tags:")
        
        for tag, count in stats['most_common_tags'][:15]:
            print(f"  {tag}: {count} projects")
            
    elif args.report:
        print("📝 Generating markdown report...")
        report = tagger.export_tags_markdown()
        
        with open('smart_tagging_report.md', 'w') as f:
            f.write(report)
        print("✅ Report saved to smart_tagging_report.md")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()