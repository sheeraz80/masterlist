#!/usr/bin/env python3
"""
Data Integrity Checker - Ensures consistency across all project data files
Checks relationships, dependencies, and data synchronization.
"""

import json
import hashlib
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple
from datetime import datetime
import os

class IntegrityChecker:
    def __init__(self, base_path: str = "."):
        """Initialize the integrity checker."""
        self.base_path = Path(base_path)
        
        # Define data files to check
        self.data_files = {
            'projects': 'projects.json',
            'tags': 'project_tags.json',
            'tracking': 'project_tracking.json',
            'consolidated': 'consolidated_projects.json',
            'parsed': 'parsed_masterlist.json',
            'config': 'masterlist_config.json'
        }
        
        # Load all data
        self.data = self.load_all_data()
        
    def load_all_data(self) -> Dict[str, Any]:
        """Load all data files."""
        data = {}
        
        for key, filename in self.data_files.items():
            file_path = self.base_path / filename
            if file_path.exists():
                try:
                    with open(file_path, 'r') as f:
                        data[key] = json.load(f)
                except Exception as e:
                    data[key] = {'error': str(e)}
            else:
                data[key] = None
                
        return data
        
    def check_file_integrity(self) -> Dict[str, Any]:
        """Check basic file integrity."""
        results = {
            'files_present': {},
            'files_readable': {},
            'file_sizes': {},
            'file_checksums': {},
            'issues': []
        }
        
        for key, filename in self.data_files.items():
            file_path = self.base_path / filename
            
            # Check if file exists
            results['files_present'][key] = file_path.exists()
            
            if file_path.exists():
                # Check if readable
                try:
                    with open(file_path, 'r') as f:
                        content = f.read()
                        results['files_readable'][key] = True
                        results['file_sizes'][key] = len(content)
                        results['file_checksums'][key] = hashlib.md5(content.encode()).hexdigest()[:8]
                except Exception as e:
                    results['files_readable'][key] = False
                    results['issues'].append(f"{key}: {str(e)}")
            else:
                results['files_readable'][key] = False
                results['issues'].append(f"{key}: File not found")
                
        return results
        
    def check_project_consistency(self) -> Dict[str, Any]:
        """Check consistency between project files."""
        results = {
            'total_projects': 0,
            'consistent_projects': 0,
            'inconsistencies': [],
            'orphaned_data': []
        }
        
        if not self.data.get('projects') or not isinstance(self.data['projects'], dict):
            results['issues'] = ["Projects data not available"]
            return results
            
        projects_data = self.data['projects'].get('projects', {})
        results['total_projects'] = len(projects_data)
        
        # Get all project keys from different sources
        project_keys = set(projects_data.keys())
        tag_keys = set(self.data.get('tags', {}).get('project_tags', {}).keys()) if self.data.get('tags') else set()
        tracking_keys = set(self.data.get('tracking', {}).keys()) if self.data.get('tracking') else set()
        
        # Check for orphaned tags
        orphaned_tags = tag_keys - project_keys
        if orphaned_tags:
            for key in orphaned_tags:
                results['orphaned_data'].append({
                    'type': 'orphaned_tags',
                    'project_key': key,
                    'message': f"Tags exist for non-existent project '{key}'"
                })
                
        # Check for orphaned tracking data
        orphaned_tracking = tracking_keys - project_keys
        if orphaned_tracking:
            for key in orphaned_tracking:
                results['orphaned_data'].append({
                    'type': 'orphaned_tracking',
                    'project_key': key,
                    'message': f"Tracking data exists for non-existent project '{key}'"
                })
                
        # Check project data consistency
        for project_key, project_data in projects_data.items():
            issues = []
            
            # Check if project has required fields
            required_fields = ['name', 'category', 'platforms']
            for field in required_fields:
                if field not in project_data:
                    issues.append(f"Missing required field: {field}")
                    
            # Check if project has tags
            if tag_keys and project_key not in tag_keys:
                issues.append("No tags assigned")
                
            if not issues:
                results['consistent_projects'] += 1
            else:
                results['inconsistencies'].append({
                    'project_key': project_key,
                    'issues': issues
                })
                
        return results
        
    def check_data_relationships(self) -> Dict[str, Any]:
        """Check relationships between data elements."""
        results = {
            'valid_relationships': 0,
            'invalid_relationships': 0,
            'relationship_issues': []
        }
        
        if not self.data.get('projects'):
            return results
            
        projects_data = self.data['projects'].get('projects', {})
        tags_data = self.data.get('tags', {}).get('project_tags', {}) if self.data.get('tags') else {}
        
        # Define valid categories and platforms
        valid_categories = {
            'ai-ml', 'analytics', 'browser-web', 'business-analytics',
            'communication', 'content-writing', 'crypto-blockchain',
            'design-tools', 'development-tools', 'e-commerce', 'education',
            'finance-accounting', 'gaming-entertainment', 'health-fitness',
            'marketing-automation', 'other', 'productivity', 'project-management',
            'social-networking'
        }
        
        valid_platforms = {
            'figma-plugin', 'chrome-extension', 'vscode-extension', 'obsidian-plugin',
            'notion-templates', 'ai-browser-tools', 'crypto-browser-tools',
            'ai-productivity-tools', 'ai-automation-platforms', 'zapier-ai-apps',
            'jasper-canvas', 'android-app', 'ios-app', 'react-native-app',
            'flutter-app', 'web-app', 'saas-platform', 'progressive-web-app',
            'windows-app', 'macos-app', 'linux-app', 'electron-app',
            'shopify-app', 'wordpress-plugin', 'woocommerce-plugin',
            'slack-bot', 'discord-bot', 'telegram-bot', 'whatsapp-bot',
            'rest-api', 'graphql-api', 'microservice', 'serverless-function',
            'aws-service', 'google-cloud-service', 'azure-service',
            'salesforce-app', 'microsoft-teams-app', 'office-365-addon'
        }
        
        # Check each project
        for project_key, project_data in projects_data.items():
            # Check category validity
            category = project_data.get('category', '')
            if category and category not in valid_categories:
                results['relationship_issues'].append({
                    'project_key': project_key,
                    'type': 'invalid_category',
                    'value': category,
                    'message': f"Invalid category: {category}"
                })
                results['invalid_relationships'] += 1
            else:
                results['valid_relationships'] += 1
                
            # Check platform validity
            platforms = project_data.get('platforms', [])
            for platform in platforms:
                if platform not in valid_platforms:
                    results['relationship_issues'].append({
                        'project_key': project_key,
                        'type': 'invalid_platform',
                        'value': platform,
                        'message': f"Invalid platform: {platform}"
                    })
                    results['invalid_relationships'] += 1
                else:
                    results['valid_relationships'] += 1
                    
            # Check tag relationships
            if project_key in tags_data:
                project_tags = tags_data[project_key]
                
                # Check if category tag matches project category
                expected_category_tag = f"category-{category}"
                if category and expected_category_tag not in project_tags:
                    results['relationship_issues'].append({
                        'project_key': project_key,
                        'type': 'missing_category_tag',
                        'message': f"Expected category tag '{expected_category_tag}' not found"
                    })
                    
                # Check if platform tags match project platforms
                for platform in platforms:
                    expected_platform_tag = f"platform-{platform}"
                    if expected_platform_tag not in project_tags:
                        results['relationship_issues'].append({
                            'project_key': project_key,
                            'type': 'missing_platform_tag',
                            'message': f"Expected platform tag '{expected_platform_tag}' not found"
                        })
                        
        return results
        
    def check_data_synchronization(self) -> Dict[str, Any]:
        """Check if data is synchronized across files."""
        results = {
            'sync_status': {},
            'sync_issues': []
        }
        
        # Check project count synchronization
        if self.data.get('projects') and self.data.get('consolidated'):
            projects_count = len(self.data['projects'].get('projects', {}))
            consolidated_count = len(self.data['consolidated']) if isinstance(self.data['consolidated'], list) else 0
            
            if projects_count != consolidated_count:
                results['sync_issues'].append({
                    'type': 'count_mismatch',
                    'message': f"Project count mismatch: projects.json has {projects_count}, consolidated has {consolidated_count}"
                })
                results['sync_status']['projects_consolidated'] = False
            else:
                results['sync_status']['projects_consolidated'] = True
                
        # Check metadata synchronization
        if self.data.get('projects'):
            metadata = self.data['projects'].get('metadata', {})
            if metadata:
                # Check if metadata is up to date
                last_updated = metadata.get('last_updated', '')
                if last_updated:
                    try:
                        update_date = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
                        days_old = (datetime.now() - update_date).days
                        if days_old > 30:
                            results['sync_issues'].append({
                                'type': 'stale_metadata',
                                'message': f"Metadata last updated {days_old} days ago"
                            })
                    except:
                        pass
                        
        return results
        
    def verify_project_structure(self) -> Dict[str, Any]:
        """Verify project directory structure."""
        results = {
            'directories_checked': 0,
            'files_checked': 0,
            'structure_issues': []
        }
        
        projects_dir = self.base_path / 'projects'
        if not projects_dir.exists():
            results['structure_issues'].append({
                'type': 'missing_directory',
                'path': 'projects/',
                'message': "Projects directory not found"
            })
            return results
            
        # Expected category directories
        expected_categories = [
            'ai-ml', 'analytics', 'browser-web', 'business-analytics',
            'communication', 'content-writing', 'crypto-blockchain',
            'design-tools', 'development-tools', 'e-commerce', 'education',
            'finance-accounting', 'gaming-entertainment', 'health-fitness',
            'marketing-automation', 'other', 'productivity', 'project-management',
            'social-networking'
        ]
        
        # Check category directories
        for category in expected_categories:
            category_dir = projects_dir / category
            if not category_dir.exists():
                results['structure_issues'].append({
                    'type': 'missing_category_directory',
                    'path': f'projects/{category}/',
                    'message': f"Category directory '{category}' not found"
                })
            else:
                results['directories_checked'] += 1
                
                # Check for project directories
                project_dirs = [d for d in category_dir.iterdir() if d.is_dir()]
                results['directories_checked'] += len(project_dirs)
                
                # Check expected files in each project directory
                for project_dir in project_dirs:
                    expected_files = ['README.md', 'alternatives.json', 'market-analysis.md', 'quality-score.md']
                    
                    for expected_file in expected_files:
                        file_path = project_dir / expected_file
                        if file_path.exists():
                            results['files_checked'] += 1
                        else:
                            results['structure_issues'].append({
                                'type': 'missing_file',
                                'path': str(file_path.relative_to(self.base_path)),
                                'message': f"Expected file '{expected_file}' not found in {project_dir.name}"
                            })
                            
        return results
        
    def generate_integrity_report(self, checks: Dict[str, Any]) -> str:
        """Generate comprehensive integrity report."""
        lines = ["# Data Integrity Report\n"]
        
        lines.append(f"**Generated:** {datetime.now().isoformat()}\n")
        
        # File integrity
        lines.append("## File Integrity\n")
        file_check = checks.get('file_integrity', {})
        
        lines.append("### Files Status")
        for key, filename in self.data_files.items():
            present = file_check.get('files_present', {}).get(key, False)
            readable = file_check.get('files_readable', {}).get(key, False)
            size = file_check.get('file_sizes', {}).get(key, 0)
            
            status = "✅" if present and readable else "❌"
            lines.append(f"{status} **{filename}** - {'Present' if present else 'Missing'}, {'Readable' if readable else 'Unreadable'} ({size:,} bytes)")
            
        if file_check.get('issues'):
            lines.append("\n### File Issues")
            for issue in file_check['issues']:
                lines.append(f"- ❌ {issue}")
                
        lines.append("")
        
        # Project consistency
        lines.append("## Project Consistency\n")
        consistency = checks.get('project_consistency', {})
        
        lines.append(f"- Total Projects: {consistency.get('total_projects', 0)}")
        lines.append(f"- Consistent Projects: {consistency.get('consistent_projects', 0)}")
        lines.append(f"- Inconsistencies: {len(consistency.get('inconsistencies', []))}")
        lines.append(f"- Orphaned Data: {len(consistency.get('orphaned_data', []))}")
        
        if consistency.get('orphaned_data'):
            lines.append("\n### Orphaned Data")
            for orphan in consistency['orphaned_data'][:10]:
                lines.append(f"- ⚠️ {orphan['type']}: {orphan['message']}")
                
        lines.append("")
        
        # Data relationships
        lines.append("## Data Relationships\n")
        relationships = checks.get('data_relationships', {})
        
        total_relationships = relationships.get('valid_relationships', 0) + relationships.get('invalid_relationships', 0)
        if total_relationships > 0:
            validity_rate = (relationships.get('valid_relationships', 0) / total_relationships) * 100
            lines.append(f"- Relationship Validity: {validity_rate:.1f}%")
            lines.append(f"- Valid Relationships: {relationships.get('valid_relationships', 0)}")
            lines.append(f"- Invalid Relationships: {relationships.get('invalid_relationships', 0)}")
            
        if relationships.get('relationship_issues'):
            lines.append("\n### Relationship Issues")
            for issue in relationships['relationship_issues'][:10]:
                lines.append(f"- ⚠️ {issue['project_key']}: {issue['message']}")
                
        lines.append("")
        
        # Data synchronization
        lines.append("## Data Synchronization\n")
        sync = checks.get('data_synchronization', {})
        
        if sync.get('sync_status'):
            for key, status in sync['sync_status'].items():
                emoji = "✅" if status else "❌"
                lines.append(f"{emoji} {key.replace('_', ' ').title()}")
                
        if sync.get('sync_issues'):
            lines.append("\n### Synchronization Issues")
            for issue in sync['sync_issues']:
                lines.append(f"- ⚠️ {issue['type']}: {issue['message']}")
                
        lines.append("")
        
        # Project structure
        lines.append("## Project Structure\n")
        structure = checks.get('project_structure', {})
        
        lines.append(f"- Directories Checked: {structure.get('directories_checked', 0)}")
        lines.append(f"- Files Checked: {structure.get('files_checked', 0)}")
        lines.append(f"- Structure Issues: {len(structure.get('structure_issues', []))}")
        
        if structure.get('structure_issues'):
            lines.append("\n### Structure Issues")
            for issue in structure['structure_issues'][:20]:
                lines.append(f"- ⚠️ {issue['type']}: {issue['message']}")
                
        # Overall health score
        lines.append("\n## Overall Health Score\n")
        
        # Calculate health score
        health_score = 100
        
        # Deduct for file issues
        file_issues = len(file_check.get('issues', []))
        health_score -= file_issues * 5
        
        # Deduct for inconsistencies
        inconsistencies = len(consistency.get('inconsistencies', []))
        health_score -= min(inconsistencies * 2, 20)
        
        # Deduct for orphaned data
        orphaned = len(consistency.get('orphaned_data', []))
        health_score -= min(orphaned * 3, 15)
        
        # Deduct for relationship issues
        rel_issues = len(relationships.get('relationship_issues', []))
        health_score -= min(rel_issues * 1, 10)
        
        # Deduct for sync issues
        sync_issues = len(sync.get('sync_issues', []))
        health_score -= sync_issues * 5
        
        # Deduct for structure issues
        struct_issues = len(structure.get('structure_issues', []))
        health_score -= min(struct_issues * 0.5, 10)
        
        health_score = max(0, health_score)
        
        if health_score >= 90:
            grade = "A"
            status = "Excellent"
        elif health_score >= 80:
            grade = "B"
            status = "Good"
        elif health_score >= 70:
            grade = "C"
            status = "Fair"
        elif health_score >= 60:
            grade = "D"
            status = "Poor"
        else:
            grade = "F"
            status = "Critical"
            
        lines.append(f"**Health Score:** {health_score}/100 ({grade} - {status})")
        
        # Recommendations
        lines.append("\n## Recommendations\n")
        
        if file_issues > 0:
            lines.append("1. **Fix file issues** - Ensure all required files are present and readable")
            
        if inconsistencies > 10:
            lines.append("2. **Address data inconsistencies** - Review and fix project data issues")
            
        if orphaned > 0:
            lines.append("3. **Clean orphaned data** - Remove references to non-existent projects")
            
        if rel_issues > 20:
            lines.append("4. **Fix relationship issues** - Ensure categories and platforms are valid")
            
        if struct_issues > 50:
            lines.append("5. **Complete project structure** - Add missing directories and files")
            
        return '\n'.join(lines)
        
    def run_all_checks(self) -> Dict[str, Any]:
        """Run all integrity checks."""
        return {
            'file_integrity': self.check_file_integrity(),
            'project_consistency': self.check_project_consistency(),
            'data_relationships': self.check_data_relationships(),
            'data_synchronization': self.check_data_synchronization(),
            'project_structure': self.verify_project_structure()
        }

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Data integrity checker")
    parser.add_argument('--check', choices=['all', 'files', 'consistency', 'relationships', 'sync', 'structure'],
                       default='all', help='Type of check to run')
    parser.add_argument('--report', help='Generate integrity report')
    parser.add_argument('--fix', action='store_true', help='Attempt to fix issues')
    
    args = parser.parse_args()
    
    checker = IntegrityChecker()
    
    print("🔍 Running integrity checks...")
    
    if args.check == 'all':
        checks = checker.run_all_checks()
    elif args.check == 'files':
        checks = {'file_integrity': checker.check_file_integrity()}
    elif args.check == 'consistency':
        checks = {'project_consistency': checker.check_project_consistency()}
    elif args.check == 'relationships':
        checks = {'data_relationships': checker.check_data_relationships()}
    elif args.check == 'sync':
        checks = {'data_synchronization': checker.check_data_synchronization()}
    elif args.check == 'structure':
        checks = {'project_structure': checker.verify_project_structure()}
        
    # Display summary
    total_issues = 0
    for check_name, check_data in checks.items():
        if isinstance(check_data, dict):
            issues = len(check_data.get('issues', []))
            issues += len(check_data.get('inconsistencies', []))
            issues += len(check_data.get('orphaned_data', []))
            issues += len(check_data.get('relationship_issues', []))
            issues += len(check_data.get('sync_issues', []))
            issues += len(check_data.get('structure_issues', []))
            total_issues += issues
            
    print(f"\n✅ Checks completed")
    print(f"{'❌' if total_issues > 0 else '✅'} Total issues found: {total_issues}")
    
    if args.report:
        report = checker.generate_integrity_report(checks)
        with open(args.report, 'w') as f:
            f.write(report)
        print(f"📄 Report saved to: {args.report}")
        
    if args.fix and total_issues > 0:
        print("\n🔧 Attempting to fix issues...")
        # In a real implementation, this would fix common issues
        print("ℹ️  Manual intervention required for most issues")

if __name__ == "__main__":
    main()