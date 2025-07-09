#!/usr/bin/env python3
"""
Smart Tagging System - Intelligent project categorization and tagging
Provides automated tagging, tag management, and project classification.

NOTE: This is the advanced version with NLTK dependencies.
For a lightweight version without external dependencies, use ../simple_tagger.py
"""

import json
import argparse
import sys
import re
from pathlib import Path
from typing import List, Dict, Any, Set, Tuple
from collections import defaultdict, Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import math

# Download required NLTK data (run once)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class SmartTagger:
    def __init__(self, data_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize the smart tagger."""
        self.data_path = Path(data_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tag_data = self.load_tag_data()
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self.tag_definitions = self.initialize_tag_definitions()
        
    def load_projects(self) -> List[Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                # Handle nested structure
                if isinstance(data, dict) and 'projects' in data:
                    projects = []
                    for project_name, project_data in data['projects'].items():
                        if isinstance(project_data, dict):
                            project_data['name'] = project_name
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
                'tag_categories': {},
                'tag_relationships': {},
                'auto_tags': {},
                'user_tags': {},
                'tag_statistics': {}
            }
            
    def save_tag_data(self):
        """Save tag data to JSON file."""
        with open(self.tags_path, 'w') as f:
            json.dump(self.tag_data, f, indent=2)
            
    def initialize_tag_definitions(self) -> Dict[str, Dict[str, Any]]:
        """Initialize predefined tag definitions."""
        return {
            # Difficulty tags
            'beginner-friendly': {
                'category': 'difficulty',
                'description': 'Suitable for beginners',
                'keywords': ['simple', 'basic', 'easy', 'beginner', 'starter'],
                'criteria': {'technical_complexity': (0, 3)}
            },
            'intermediate': {
                'category': 'difficulty',
                'description': 'Requires moderate experience',
                'keywords': ['moderate', 'intermediate', 'medium'],
                'criteria': {'technical_complexity': (4, 6)}
            },
            'advanced': {
                'category': 'difficulty',
                'description': 'Requires advanced skills',
                'keywords': ['advanced', 'complex', 'sophisticated', 'expert'],
                'criteria': {'technical_complexity': (7, 10)}
            },
            
            # Revenue tags
            'high-revenue': {
                'category': 'revenue',
                'description': 'High revenue potential',
                'keywords': ['profitable', 'lucrative', 'high-revenue', 'monetizable'],
                'criteria': {'revenue_realistic': (10000, float('inf'))}
            },
            'quick-win': {
                'category': 'timeline',
                'description': 'Quick to implement and deploy',
                'keywords': ['quick', 'fast', 'rapid', 'instant'],
                'criteria': {'development_time': (0, 7)}
            },
            'long-term': {
                'category': 'timeline',
                'description': 'Long-term project',
                'keywords': ['long-term', 'extended', 'complex', 'comprehensive'],
                'criteria': {'development_time': (21, float('inf'))}
            },
            
            # Platform tags
            'cross-platform': {
                'category': 'platform',
                'description': 'Works across multiple platforms',
                'keywords': ['cross-platform', 'multi-platform', 'universal'],
                'criteria': {'platform_count': (3, float('inf'))}
            },
            'mobile-first': {
                'category': 'platform',
                'description': 'Designed for mobile platforms',
                'keywords': ['mobile', 'smartphone', 'tablet', 'android', 'ios'],
                'criteria': {'platforms': ['android-app', 'ios-app', 'react-native-app', 'flutter-app']}
            },
            'web-based': {
                'category': 'platform',
                'description': 'Web-based application',
                'keywords': ['web', 'browser', 'online', 'cloud'],
                'criteria': {'platforms': ['web-app', 'saas-platform', 'progressive-web-app']}
            },
            
            # Market tags
            'b2b': {
                'category': 'market',
                'description': 'Business-to-business solution',
                'keywords': ['business', 'enterprise', 'corporate', 'professional'],
                'criteria': {'target_users': ['business', 'enterprise', 'corporate', 'professional']}
            },
            'b2c': {
                'category': 'market',
                'description': 'Business-to-consumer solution',
                'keywords': ['consumer', 'personal', 'individual', 'user'],
                'criteria': {'target_users': ['consumer', 'personal', 'individual', 'user']}
            },
            'saas': {
                'category': 'business_model',
                'description': 'Software as a Service',
                'keywords': ['saas', 'subscription', 'cloud', 'service'],
                'criteria': {'platforms': ['saas-platform', 'web-app']}
            },
            
            # Technology tags
            'ai-powered': {
                'category': 'technology',
                'description': 'Uses artificial intelligence',
                'keywords': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural'],
                'criteria': {'category': ['ai-ml']}
            },
            'blockchain': {
                'category': 'technology',
                'description': 'Blockchain-based solution',
                'keywords': ['blockchain', 'crypto', 'defi', 'web3', 'smart contract'],
                'criteria': {'category': ['crypto-blockchain']}
            },
            'automation': {
                'category': 'technology',
                'description': 'Automation-focused solution',
                'keywords': ['automation', 'auto', 'automated', 'workflow'],
                'criteria': {'keywords': ['automation', 'auto', 'automated', 'workflow']}
            }
        }
        
    def extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text using NLP."""
        if not text:
            return []
            
        # Tokenize and clean
        tokens = word_tokenize(text.lower())
        
        # Remove stopwords and non-alphabetic tokens
        keywords = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token.isalpha() and token not in self.stop_words and len(token) > 2
        ]
        
        return keywords
        
    def calculate_tf_idf(self, projects: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Calculate TF-IDF scores for project keywords."""
        # Extract all text from projects
        project_texts = {}
        all_keywords = []
        
        for i, project in enumerate(projects):
            text_parts = [
                project.get('name', ''),
                project.get('problem', ''),
                project.get('solution', ''),
                ' '.join(project.get('key_features', [])),
                project.get('target_users', '')
            ]
            
            combined_text = ' '.join(text_parts)
            keywords = self.extract_keywords(combined_text)
            project_texts[i] = keywords
            all_keywords.extend(keywords)
            
        # Calculate TF-IDF
        tf_idf_scores = {}
        unique_keywords = set(all_keywords)
        total_projects = len(projects)
        
        for project_id, keywords in project_texts.items():
            tf_idf_scores[project_id] = {}
            keyword_counts = Counter(keywords)
            total_keywords = len(keywords)
            
            for keyword in unique_keywords:
                # Term frequency
                tf = keyword_counts[keyword] / total_keywords if total_keywords > 0 else 0
                
                # Document frequency
                df = sum(1 for other_keywords in project_texts.values() if keyword in other_keywords)
                
                # Inverse document frequency
                idf = math.log(total_projects / df) if df > 0 else 0
                
                # TF-IDF score
                tf_idf_scores[project_id][keyword] = tf * idf
                
        return tf_idf_scores
        
    def auto_tag_projects(self, confidence_threshold: float = 0.7) -> Dict[str, List[str]]:
        """Automatically tag projects based on content analysis."""
        project_tags = {}
        tf_idf_scores = self.calculate_tf_idf(self.projects)
        
        for i, project in enumerate(self.projects):
            tags = set()
            project_name = project.get('name', f'project_{i}')
            
            # Apply rule-based tags
            for tag_name, tag_def in self.tag_definitions.items():
                if self.matches_tag_criteria(project, tag_def):
                    tags.add(tag_name)
                    
            # Apply keyword-based tags
            if i in tf_idf_scores:
                top_keywords = sorted(
                    tf_idf_scores[i].items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:10]
                
                for keyword, score in top_keywords:
                    if score > confidence_threshold:
                        # Create dynamic tags from high-scoring keywords
                        if keyword not in ['project', 'app', 'tool', 'system']:
                            tags.add(f'keyword-{keyword}')
                            
            # Category-based tags
            category = project.get('category', 'other')
            if category != 'other':
                tags.add(f'category-{category}')
                
            # Platform-based tags
            platforms = project.get('platforms', [])
            for platform in platforms:
                tags.add(f'platform-{platform}')
                
            project_tags[project_name] = list(tags)
            
        return project_tags
        
    def matches_tag_criteria(self, project: Dict[str, Any], tag_def: Dict[str, Any]) -> bool:
        """Check if project matches tag criteria."""
        criteria = tag_def.get('criteria', {})
        
        for criterion, value in criteria.items():
            if criterion == 'technical_complexity':
                complexity = project.get('technical_complexity', 5)
                if isinstance(value, tuple):
                    min_val, max_val = value
                    if not (min_val <= complexity <= max_val):
                        return False
                        
            elif criterion == 'revenue_realistic':
                revenue = project.get('revenue_potential', {}).get('realistic', 0)
                if isinstance(value, tuple):
                    min_val, max_val = value
                    if not (min_val <= revenue < max_val):
                        return False
                        
            elif criterion == 'development_time':
                dev_time = project.get('development_time', 7)
                if isinstance(value, tuple):
                    min_val, max_val = value
                    if not (min_val <= dev_time < max_val):
                        return False
                        
            elif criterion == 'platform_count':
                platform_count = len(project.get('platforms', []))
                if isinstance(value, tuple):
                    min_val, max_val = value
                    if not (min_val <= platform_count < max_val):
                        return False
                        
            elif criterion == 'platforms':
                project_platforms = project.get('platforms', [])
                if isinstance(value, list):
                    if not any(platform in project_platforms for platform in value):
                        return False
                        
            elif criterion == 'category':
                project_category = project.get('category', 'other')
                if isinstance(value, list):
                    if project_category not in value:
                        return False
                        
            elif criterion == 'keywords':
                # Check if any criterion keywords appear in project text
                text_parts = [
                    project.get('name', ''),
                    project.get('problem', ''),
                    project.get('solution', ''),
                    ' '.join(project.get('key_features', [])),
                    project.get('target_users', '')
                ]
                
                combined_text = ' '.join(text_parts).lower()
                if not any(keyword in combined_text for keyword in value):
                    return False
                    
        return True
        
    def get_tag_suggestions(self, project_name: str, limit: int = 10) -> List[Tuple[str, float]]:
        """Get tag suggestions for a specific project."""
        project = None
        for p in self.projects:
            if p.get('name', '').lower() == project_name.lower():
                project = p
                break
                
        if not project:
            return []
            
        suggestions = []
        
        # Get tags from similar projects
        similar_projects = self.find_similar_projects(project, limit=5)
        
        tag_scores = defaultdict(float)
        
        for similar_project, similarity in similar_projects:
            similar_project_tags = self.tag_data.get('project_tags', {}).get(similar_project.get('name', ''), [])
            for tag in similar_project_tags:
                tag_scores[tag] += similarity
                
        # Add rule-based tag suggestions
        for tag_name, tag_def in self.tag_definitions.items():
            if self.matches_tag_criteria(project, tag_def):
                tag_scores[tag_name] += 1.0
                
        # Sort by score
        suggestions = sorted(tag_scores.items(), key=lambda x: x[1], reverse=True)
        
        return suggestions[:limit]
        
    def find_similar_projects(self, target_project: Dict[str, Any], limit: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """Find projects similar to the target project."""
        similarities = []
        
        target_keywords = self.extract_keywords(
            ' '.join([
                target_project.get('name', ''),
                target_project.get('problem', ''),
                target_project.get('solution', ''),
                ' '.join(target_project.get('key_features', []))
            ])
        )
        
        for project in self.projects:
            if project.get('name') == target_project.get('name'):
                continue
                
            project_keywords = self.extract_keywords(
                ' '.join([
                    project.get('name', ''),
                    project.get('problem', ''),
                    project.get('solution', ''),
                    ' '.join(project.get('key_features', []))
                ])
            )
            
            # Calculate Jaccard similarity
            if target_keywords and project_keywords:
                intersection = len(set(target_keywords) & set(project_keywords))
                union = len(set(target_keywords) | set(project_keywords))
                similarity = intersection / union if union > 0 else 0
                
                if similarity > 0.1:  # Only include if reasonably similar
                    similarities.append((project, similarity))
                    
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:limit]
        
    def create_tag_hierarchy(self) -> Dict[str, List[str]]:
        """Create hierarchical tag structure."""
        hierarchy = {
            'difficulty': ['beginner-friendly', 'intermediate', 'advanced'],
            'revenue': ['high-revenue', 'medium-revenue', 'low-revenue'],
            'timeline': ['quick-win', 'short-term', 'long-term'],
            'platform': ['mobile-first', 'web-based', 'cross-platform', 'desktop'],
            'market': ['b2b', 'b2c', 'enterprise', 'consumer'],
            'technology': ['ai-powered', 'blockchain', 'automation', 'analytics'],
            'business_model': ['saas', 'marketplace', 'freemium', 'subscription']
        }
        
        return hierarchy
        
    def generate_tag_statistics(self) -> Dict[str, Any]:
        """Generate comprehensive tag usage statistics."""
        stats = {
            'total_tags': 0,
            'unique_tags': 0,
            'tag_frequency': {},
            'tag_categories': {},
            'most_common_tags': [],
            'least_common_tags': [],
            'tag_co_occurrence': {},
            'projects_per_tag': {}
        }
        
        all_tags = []
        tag_counter = Counter()
        
        for project_name, tags in self.tag_data.get('project_tags', {}).items():
            all_tags.extend(tags)
            tag_counter.update(tags)
            
        stats['total_tags'] = len(all_tags)
        stats['unique_tags'] = len(set(all_tags))
        stats['tag_frequency'] = dict(tag_counter)
        stats['most_common_tags'] = tag_counter.most_common(20)
        stats['least_common_tags'] = tag_counter.most_common()[-20:]
        
        # Calculate tag co-occurrence
        co_occurrence = defaultdict(lambda: defaultdict(int))
        for project_name, tags in self.tag_data.get('project_tags', {}).items():
            for i, tag1 in enumerate(tags):
                for tag2 in tags[i+1:]:
                    co_occurrence[tag1][tag2] += 1
                    co_occurrence[tag2][tag1] += 1
                    
        stats['tag_co_occurrence'] = dict(co_occurrence)
        
        # Projects per tag
        for tag in set(all_tags):
            count = sum(1 for tags in self.tag_data.get('project_tags', {}).values() if tag in tags)
            stats['projects_per_tag'][tag] = count
            
        return stats
        
    def export_tags(self, format: str = 'json') -> str:
        """Export tags in specified format."""
        if format == 'csv':
            return self.export_tags_csv()
        elif format == 'markdown':
            return self.export_tags_markdown()
        else:
            return json.dumps(self.tag_data, indent=2)
            
    def export_tags_csv(self) -> str:
        """Export tags as CSV."""
        lines = ['project_name,tags']
        
        for project_name, tags in self.tag_data.get('project_tags', {}).items():
            tags_str = ';'.join(tags)
            lines.append(f'"{project_name}","{tags_str}"')
            
        return '\n'.join(lines)
        
    def export_tags_markdown(self) -> str:
        """Export tags as Markdown."""
        lines = ['# Project Tags Report\n']
        
        # Tag statistics
        stats = self.generate_tag_statistics()
        lines.append('## Tag Statistics\n')
        lines.append(f'- Total Tags: {stats["total_tags"]}')
        lines.append(f'- Unique Tags: {stats["unique_tags"]}')
        lines.append(f'- Average Tags per Project: {stats["total_tags"] / len(self.tag_data.get("project_tags", {})):.1f}\n')
        
        # Most common tags
        lines.append('## Most Common Tags\n')
        for tag, count in stats['most_common_tags'][:10]:
            lines.append(f'- **{tag}**: {count} projects')
            
        lines.append('\n## Projects by Tag\n')
        
        # Group projects by tag
        tag_projects = defaultdict(list)
        for project_name, tags in self.tag_data.get('project_tags', {}).items():
            for tag in tags:
                tag_projects[tag].append(project_name)
                
        for tag in sorted(tag_projects.keys()):
            lines.append(f'### {tag}\n')
            for project in tag_projects[tag]:
                lines.append(f'- {project}')
            lines.append('')
            
        return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description="Smart project tagging and categorization")
    parser.add_argument("--auto-tag", "-a", action="store_true", help="Auto-tag all projects")
    parser.add_argument("--suggest", "-s", help="Get tag suggestions for a project")
    parser.add_argument("--stats", action="store_true", help="Show tag statistics")
    parser.add_argument("--export", help="Export tags (json, csv, markdown)")
    parser.add_argument("--project", help="Specific project name")
    parser.add_argument("--add-tag", help="Add tag to project")
    parser.add_argument("--remove-tag", help="Remove tag from project")
    parser.add_argument("--list-tags", action="store_true", help="List all tags")
    parser.add_argument("--threshold", type=float, default=0.7, help="Confidence threshold for auto-tagging")
    
    args = parser.parse_args()
    
    tagger = SmartTagger()
    
    if args.auto_tag:
        print("🏷️  Auto-tagging projects...")
        project_tags = tagger.auto_tag_projects(args.threshold)
        tagger.tag_data['project_tags'] = project_tags
        tagger.save_tag_data()
        
        print(f"Tagged {len(project_tags)} projects")
        
        # Show sample results
        for project_name, tags in list(project_tags.items())[:5]:
            print(f"\n{project_name}:")
            for tag in tags[:10]:  # Show first 10 tags
                print(f"  - {tag}")
                
    elif args.suggest:
        print(f"🔍 Tag suggestions for '{args.suggest}':")
        suggestions = tagger.get_tag_suggestions(args.suggest)
        
        for tag, score in suggestions:
            print(f"  {tag} (confidence: {score:.2f})")
            
    elif args.stats:
        print("📊 Tag Statistics:")
        stats = tagger.generate_tag_statistics()
        
        print(f"Total tags: {stats['total_tags']}")
        print(f"Unique tags: {stats['unique_tags']}")
        print(f"Most common tags:")
        
        for tag, count in stats['most_common_tags'][:15]:
            print(f"  {tag}: {count} projects")
            
    elif args.export:
        print(f"📤 Exporting tags as {args.export}...")
        exported = tagger.export_tags(args.export)
        
        filename = f"project_tags.{args.export}"
        with open(filename, 'w') as f:
            f.write(exported)
        print(f"Exported to {filename}")
        
    elif args.list_tags:
        print("🏷️  All Tags:")
        all_tags = set()
        for tags in tagger.tag_data.get('project_tags', {}).values():
            all_tags.update(tags)
            
        for tag in sorted(all_tags):
            print(f"  - {tag}")
            
    elif args.add_tag and args.project:
        project_tags = tagger.tag_data.get('project_tags', {})
        if args.project not in project_tags:
            project_tags[args.project] = []
            
        if args.add_tag not in project_tags[args.project]:
            project_tags[args.project].append(args.add_tag)
            tagger.save_tag_data()
            print(f"Added tag '{args.add_tag}' to project '{args.project}'")
        else:
            print(f"Tag '{args.add_tag}' already exists for project '{args.project}'")
            
    elif args.remove_tag and args.project:
        project_tags = tagger.tag_data.get('project_tags', {})
        if args.project in project_tags and args.remove_tag in project_tags[args.project]:
            project_tags[args.project].remove(args.remove_tag)
            tagger.save_tag_data()
            print(f"Removed tag '{args.remove_tag}' from project '{args.project}'")
        else:
            print(f"Tag '{args.remove_tag}' not found for project '{args.project}'")
            
    else:
        parser.print_help()

if __name__ == "__main__":
    main()