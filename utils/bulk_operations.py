#!/usr/bin/env python3
"""
Bulk Operations - Batch processing utilities for project management
"""

import json
import csv
import argparse
from pathlib import Path
from typing import List, Dict, Any
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class BulkOperations:
    def __init__(self, projects_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize bulk operations."""
        self.projects_path = Path(projects_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tags = self.load_tags()
        
    def load_projects(self) -> Dict[str, Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.projects_path, 'r') as f:
                data = json.load(f)
                return data.get('projects', {})
        except FileNotFoundError:
            return {}
            
    def load_tags(self) -> Dict[str, List[str]]:
        """Load tags from JSON file."""
        try:
            with open(self.tags_path, 'r') as f:
                data = json.load(f)
                return data.get('project_tags', {})
        except FileNotFoundError:
            return {}
            
    def save_tags(self):
        """Save tags to JSON file."""
        with open(self.tags_path, 'w') as f:
            json.dump({'project_tags': self.tags}, f, indent=2)
            
    def bulk_add_tag(self, project_keys: List[str], tag: str) -> Dict[str, str]:
        """Add a tag to multiple projects."""
        results = {}
        for project_key in project_keys:
            if project_key not in self.projects:
                results[project_key] = "Project not found"
                continue
                
            if project_key not in self.tags:
                self.tags[project_key] = []
                
            if tag not in self.tags[project_key]:
                self.tags[project_key].append(tag)
                results[project_key] = "Tag added"
            else:
                results[project_key] = "Tag already exists"
                
        self.save_tags()
        return results
        
    def bulk_remove_tag(self, project_keys: List[str], tag: str) -> Dict[str, str]:
        """Remove a tag from multiple projects."""
        results = {}
        for project_key in project_keys:
            if project_key not in self.tags:
                results[project_key] = "No tags found"
                continue
                
            if tag in self.tags[project_key]:
                self.tags[project_key].remove(tag)
                results[project_key] = "Tag removed"
            else:
                results[project_key] = "Tag not found"
                
        self.save_tags()
        return results
        
    def bulk_update_quality(self, updates: Dict[str, float]) -> Dict[str, str]:
        """Update quality scores for multiple projects."""
        results = {}
        
        # Load full projects data
        try:
            with open(self.projects_path, 'r') as f:
                data = json.load(f)
        except:
            return {"error": "Could not load projects data"}
            
        for project_key, quality_score in updates.items():
            if project_key not in data['projects']:
                results[project_key] = "Project not found"
                continue
                
            data['projects'][project_key]['quality_score'] = quality_score
            results[project_key] = f"Quality updated to {quality_score}"
            
        # Save updated data
        try:
            with open(self.projects_path, 'w') as f:
                json.dump(data, f, indent=2)
        except:
            return {"error": "Could not save projects data"}
            
        return results
        
    def export_projects_csv(self, filename: str, include_tags: bool = True) -> str:
        """Export projects to CSV format."""
        fieldnames = [
            'key', 'name', 'category', 'quality_score', 'technical_complexity',
            'platforms', 'revenue_potential', 'development_time', 'problem_statement'
        ]
        
        if include_tags:
            fieldnames.append('tags')
            
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for project_key, project_data in self.projects.items():
                row = {
                    'key': project_key,
                    'name': project_data.get('name', ''),
                    'category': project_data.get('category', ''),
                    'quality_score': project_data.get('quality_score', 0),
                    'technical_complexity': project_data.get('technical_complexity', ''),
                    'platforms': ';'.join(project_data.get('platforms', [])),
                    'revenue_potential': project_data.get('revenue_potential', ''),
                    'development_time': project_data.get('development_time', ''),
                    'problem_statement': project_data.get('problem_statement', '')
                }
                
                if include_tags:
                    row['tags'] = ';'.join(self.tags.get(project_key, []))
                    
                writer.writerow(row)
                
        return f"Exported {len(self.projects)} projects to {filename}"
        
    def import_tags_csv(self, filename: str) -> Dict[str, str]:
        """Import tags from CSV file."""
        results = {}
        
        try:
            with open(filename, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    project_key = row.get('project_key', '')
                    tags_str = row.get('tags', '')
                    
                    if not project_key or not tags_str:
                        continue
                        
                    if project_key not in self.projects:
                        results[project_key] = "Project not found"
                        continue
                        
                    tags = [tag.strip() for tag in tags_str.split(';') if tag.strip()]
                    self.tags[project_key] = tags
                    results[project_key] = f"Imported {len(tags)} tags"
                    
            self.save_tags()
            
        except Exception as e:
            results['error'] = f"Import failed: {str(e)}"
            
        return results
        
    def validate_all_projects(self) -> Dict[str, Any]:
        """Validate all project data."""
        validation_results = {
            'total_projects': len(self.projects),
            'errors': [],
            'warnings': [],
            'stats': {
                'missing_names': 0,
                'missing_categories': 0,
                'invalid_quality_scores': 0,
                'missing_platforms': 0,
                'untagged_projects': 0
            }
        }
        
        for project_key, project_data in self.projects.items():
            # Check required fields
            if not project_data.get('name'):
                validation_results['errors'].append(f"{project_key}: Missing name")
                validation_results['stats']['missing_names'] += 1
                
            if not project_data.get('category'):
                validation_results['errors'].append(f"{project_key}: Missing category")
                validation_results['stats']['missing_categories'] += 1
                
            # Check quality score
            quality_score = project_data.get('quality_score', 0)
            if not isinstance(quality_score, (int, float)) or quality_score < 0 or quality_score > 10:
                validation_results['errors'].append(f"{project_key}: Invalid quality score: {quality_score}")
                validation_results['stats']['invalid_quality_scores'] += 1
                
            # Check platforms
            if not project_data.get('platforms'):
                validation_results['warnings'].append(f"{project_key}: No platforms specified")
                validation_results['stats']['missing_platforms'] += 1
                
            # Check tags
            if project_key not in self.tags or not self.tags[project_key]:
                validation_results['warnings'].append(f"{project_key}: No tags")
                validation_results['stats']['untagged_projects'] += 1
                
        return validation_results
        
    def generate_project_report(self, output_file: str = "project_report.md") -> str:
        """Generate comprehensive project report."""
        lines = ["# Project Report\n"]
        
        # Summary statistics
        lines.append("## Summary Statistics\n")
        lines.append(f"- Total Projects: {len(self.projects)}")
        lines.append(f"- Total Tags: {sum(len(tags) for tags in self.tags.values())}")
        lines.append(f"- Unique Tags: {len(set(tag for tags in self.tags.values() for tag in tags))}")
        lines.append(f"- Average Quality Score: {sum(p.get('quality_score', 0) for p in self.projects.values()) / len(self.projects):.1f}")
        lines.append("")
        
        # Category breakdown
        categories = {}
        for project_data in self.projects.values():
            category = project_data.get('category', 'other')
            categories[category] = categories.get(category, 0) + 1
            
        lines.append("## Category Breakdown\n")
        for category, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            lines.append(f"- {category}: {count} projects")
        lines.append("")
        
        # Platform breakdown
        platforms = {}
        for project_data in self.projects.values():
            for platform in project_data.get('platforms', []):
                platforms[platform] = platforms.get(platform, 0) + 1
                
        lines.append("## Platform Breakdown\n")
        for platform, count in sorted(platforms.items(), key=lambda x: x[1], reverse=True):
            lines.append(f"- {platform}: {count} projects")
        lines.append("")
        
        # Quality distribution
        quality_ranges = {'8-10': 0, '6-8': 0, '4-6': 0, '0-4': 0}
        for project_data in self.projects.values():
            quality = project_data.get('quality_score', 0)
            if quality >= 8:
                quality_ranges['8-10'] += 1
            elif quality >= 6:
                quality_ranges['6-8'] += 1
            elif quality >= 4:
                quality_ranges['4-6'] += 1
            else:
                quality_ranges['0-4'] += 1
                
        lines.append("## Quality Distribution\n")
        for range_name, count in quality_ranges.items():
            lines.append(f"- {range_name}: {count} projects")
        lines.append("")
        
        # Write report
        with open(output_file, 'w') as f:
            f.write('\n'.join(lines))
            
        return f"Report generated: {output_file}"

def main():
    parser = argparse.ArgumentParser(description="Bulk operations for project management")
    
    # Bulk tag operations
    parser.add_argument('--bulk-add-tag', nargs='+', help='Add tag to multiple projects: TAG PROJECT1 PROJECT2...')
    parser.add_argument('--bulk-remove-tag', nargs='+', help='Remove tag from multiple projects: TAG PROJECT1 PROJECT2...')
    
    # Export/import
    parser.add_argument('--export-csv', help='Export projects to CSV file')
    parser.add_argument('--import-tags-csv', help='Import tags from CSV file')
    parser.add_argument('--include-tags', action='store_true', help='Include tags in CSV export')
    
    # Validation and reporting
    parser.add_argument('--validate', action='store_true', help='Validate all project data')
    parser.add_argument('--generate-report', help='Generate project report (markdown file)')
    
    # Quality updates
    parser.add_argument('--update-quality', help='Update quality scores from CSV file')
    
    args = parser.parse_args()
    
    bulk_ops = BulkOperations()
    
    if args.bulk_add_tag:
        tag = args.bulk_add_tag[0]
        project_keys = args.bulk_add_tag[1:]
        results = bulk_ops.bulk_add_tag(project_keys, tag)
        
        print(f"🏷️  Bulk adding tag '{tag}' to {len(project_keys)} projects:")
        for project_key, result in results.items():
            status_emoji = "✅" if result == "Tag added" else "⚠️"
            print(f"   {status_emoji} {project_key}: {result}")
            
    elif args.bulk_remove_tag:
        tag = args.bulk_remove_tag[0]
        project_keys = args.bulk_remove_tag[1:]
        results = bulk_ops.bulk_remove_tag(project_keys, tag)
        
        print(f"🗑️  Bulk removing tag '{tag}' from {len(project_keys)} projects:")
        for project_key, result in results.items():
            status_emoji = "✅" if result == "Tag removed" else "⚠️"
            print(f"   {status_emoji} {project_key}: {result}")
            
    elif args.export_csv:
        result = bulk_ops.export_projects_csv(args.export_csv, args.include_tags)
        print(f"📤 {result}")
        
    elif args.import_tags_csv:
        results = bulk_ops.import_tags_csv(args.import_tags_csv)
        print(f"📥 Importing tags from {args.import_tags_csv}:")
        for project_key, result in results.items():
            status_emoji = "✅" if "Imported" in result else "⚠️"
            print(f"   {status_emoji} {project_key}: {result}")
            
    elif args.validate:
        validation = bulk_ops.validate_all_projects()
        print("🔍 Project Validation Results:")
        print(f"   Total Projects: {validation['total_projects']}")
        print(f"   Errors: {len(validation['errors'])}")
        print(f"   Warnings: {len(validation['warnings'])}")
        
        if validation['errors']:
            print("\n❌ Errors:")
            for error in validation['errors'][:10]:  # Show first 10
                print(f"   {error}")
                
        if validation['warnings']:
            print("\n⚠️  Warnings:")
            for warning in validation['warnings'][:10]:  # Show first 10
                print(f"   {warning}")
                
        print(f"\n📊 Statistics:")
        for key, value in validation['stats'].items():
            print(f"   {key}: {value}")
            
    elif args.generate_report:
        result = bulk_ops.generate_project_report(args.generate_report)
        print(f"📋 {result}")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()