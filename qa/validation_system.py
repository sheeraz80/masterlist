#!/usr/bin/env python3
"""
Data Validation and Quality Assurance System
Comprehensive validation for project data integrity and quality standards.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple, Set
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class ValidationSystem:
    def __init__(self, projects_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize the validation system."""
        self.projects_path = Path(projects_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tags = self.load_tags()
        
        # Define validation rules
        self.required_fields = [
            'name', 'category', 'quality_score', 'platforms',
            'problem_statement', 'solution_description', 'target_users',
            'revenue_model', 'revenue_potential', 'development_time',
            'technical_complexity', 'competition_level', 'key_features'
        ]
        
        self.valid_categories = {
            'ai-ml', 'analytics', 'browser-web', 'business-analytics',
            'communication', 'content-writing', 'crypto-blockchain',
            'design-tools', 'development-tools', 'e-commerce', 'education',
            'finance-accounting', 'gaming-entertainment', 'health-fitness',
            'marketing-automation', 'other', 'productivity', 'project-management',
            'social-networking'
        }
        
        self.valid_platforms = {
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
        
        self.quality_score_ranges = {
            'needs-improvement': (0, 5),
            'fair': (5, 6),
            'good': (6, 7),
            'very-good': (7, 8),
            'top-rated': (8, 10)
        }
        
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
            
    def validate_project_structure(self, project_key: str, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate project data structure."""
        errors = []
        warnings = []
        
        # Check required fields
        for field in self.required_fields:
            if field not in project_data:
                errors.append({
                    'type': 'missing_field',
                    'severity': 'error',
                    'field': field,
                    'message': f"Required field '{field}' is missing"
                })
            elif not project_data[field]:
                warnings.append({
                    'type': 'empty_field',
                    'severity': 'warning',
                    'field': field,
                    'message': f"Field '{field}' is empty"
                })
                
        return errors + warnings
        
    def validate_data_quality(self, project_key: str, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate data quality and consistency."""
        issues = []
        
        # Validate quality score
        quality_score = project_data.get('quality_score', 0)
        if not isinstance(quality_score, (int, float)):
            issues.append({
                'type': 'invalid_type',
                'severity': 'error',
                'field': 'quality_score',
                'message': f"Quality score must be a number, got {type(quality_score).__name__}"
            })
        elif quality_score < 0 or quality_score > 10:
            issues.append({
                'type': 'invalid_range',
                'severity': 'error',
                'field': 'quality_score',
                'message': f"Quality score {quality_score} is out of range (0-10)"
            })
            
        # Validate category
        category = project_data.get('category', '')
        if category and category not in self.valid_categories:
            issues.append({
                'type': 'invalid_category',
                'severity': 'warning',
                'field': 'category',
                'message': f"Category '{category}' is not in the valid categories list"
            })
            
        # Validate platforms
        platforms = project_data.get('platforms', [])
        if platforms:
            invalid_platforms = [p for p in platforms if p not in self.valid_platforms]
            if invalid_platforms:
                issues.append({
                    'type': 'invalid_platform',
                    'severity': 'warning',
                    'field': 'platforms',
                    'message': f"Invalid platforms: {', '.join(invalid_platforms)}"
                })
                
        # Validate technical complexity
        complexity = project_data.get('technical_complexity', '')
        if isinstance(complexity, str):
            # Extract number from string like "4/10"
            match = re.search(r'(\d+)', complexity)
            if match:
                complexity_num = int(match.group(1))
                if complexity_num < 1 or complexity_num > 10:
                    issues.append({
                        'type': 'invalid_range',
                        'severity': 'warning',
                        'field': 'technical_complexity',
                        'message': f"Technical complexity {complexity_num} is out of range (1-10)"
                    })
                    
        # Validate revenue potential format
        revenue = project_data.get('revenue_potential', '')
        if revenue and not any(keyword in revenue.lower() for keyword in ['conservative', 'realistic', 'optimistic']):
            issues.append({
                'type': 'missing_revenue_estimates',
                'severity': 'warning',
                'field': 'revenue_potential',
                'message': "Revenue potential should include Conservative/Realistic/Optimistic estimates"
            })
            
        # Validate development time format
        dev_time = project_data.get('development_time', '')
        if dev_time and not re.search(r'\d+\s*(days?|weeks?|months?)', dev_time.lower()):
            issues.append({
                'type': 'invalid_format',
                'severity': 'warning',
                'field': 'development_time',
                'message': "Development time should specify a time unit (days/weeks/months)"
            })
            
        # Validate key features
        key_features = project_data.get('key_features', [])
        if isinstance(key_features, list):
            if len(key_features) < 3:
                issues.append({
                    'type': 'insufficient_features',
                    'severity': 'warning',
                    'field': 'key_features',
                    'message': f"Only {len(key_features)} key features listed, recommend at least 3"
                })
        else:
            issues.append({
                'type': 'invalid_type',
                'severity': 'error',
                'field': 'key_features',
                'message': "Key features must be a list"
            })
            
        return issues
        
    def validate_content_quality(self, project_key: str, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate content quality and completeness."""
        issues = []
        
        # Check problem statement length
        problem = project_data.get('problem_statement', '')
        if len(problem) < 50:
            issues.append({
                'type': 'content_too_short',
                'severity': 'warning',
                'field': 'problem_statement',
                'message': f"Problem statement is too short ({len(problem)} chars), recommend at least 50"
            })
            
        # Check solution description length
        solution = project_data.get('solution_description', '')
        if len(solution) < 50:
            issues.append({
                'type': 'content_too_short',
                'severity': 'warning',
                'field': 'solution_description',
                'message': f"Solution description is too short ({len(solution)} chars), recommend at least 50"
            })
            
        # Check for placeholder content
        placeholder_patterns = [
            r'\[.*?\]',  # [placeholder]
            r'TBD|TODO',  # TBD/TODO
            r'xxx|XXX',   # xxx placeholders
            r'<.*?>',     # <placeholder>
            r'FIXME'      # FIXME
        ]
        
        for field in ['problem_statement', 'solution_description', 'target_users']:
            content = project_data.get(field, '')
            for pattern in placeholder_patterns:
                if re.search(pattern, content):
                    issues.append({
                        'type': 'placeholder_content',
                        'severity': 'warning',
                        'field': field,
                        'message': f"Field contains placeholder content: {pattern}"
                    })
                    break
                    
        # Check for duplicate content
        name = project_data.get('name', '').lower()
        problem = project_data.get('problem_statement', '').lower()
        
        if name and problem and name in problem:
            issues.append({
                'type': 'duplicate_content',
                'severity': 'info',
                'field': 'problem_statement',
                'message': "Problem statement contains the project name"
            })
            
        return issues
        
    def validate_tag_consistency(self, project_key: str, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Validate tag consistency with project data."""
        issues = []
        project_tags = self.tags.get(project_key, [])
        
        # Check if project has tags
        if not project_tags:
            issues.append({
                'type': 'missing_tags',
                'severity': 'warning',
                'field': 'tags',
                'message': "Project has no tags assigned"
            })
            return issues
            
        # Validate quality score tags
        quality_score = project_data.get('quality_score', 0)
        expected_quality_tag = None
        
        for tag, (min_score, max_score) in self.quality_score_ranges.items():
            if min_score <= quality_score < max_score:
                expected_quality_tag = tag
                break
                
        if expected_quality_tag and expected_quality_tag not in project_tags:
            issues.append({
                'type': 'missing_expected_tag',
                'severity': 'info',
                'field': 'tags',
                'message': f"Expected quality tag '{expected_quality_tag}' based on score {quality_score}"
            })
            
        # Validate category tags
        category = project_data.get('category', '')
        expected_category_tag = f'category-{category}'
        
        if category and expected_category_tag not in project_tags:
            issues.append({
                'type': 'missing_expected_tag',
                'severity': 'info',
                'field': 'tags',
                'message': f"Expected category tag '{expected_category_tag}'"
            })
            
        # Validate platform tags
        platforms = project_data.get('platforms', [])
        for platform in platforms:
            expected_platform_tag = f'platform-{platform}'
            if expected_platform_tag not in project_tags:
                issues.append({
                    'type': 'missing_expected_tag',
                    'severity': 'info',
                    'field': 'tags',
                    'message': f"Expected platform tag '{expected_platform_tag}'"
                })
                
        return issues
        
    def validate_cross_references(self) -> List[Dict[str, Any]]:
        """Validate cross-references between different data files."""
        issues = []
        
        # Check for projects in tags that don't exist in projects
        for project_key in self.tags.keys():
            if project_key not in self.projects:
                issues.append({
                    'type': 'orphaned_tags',
                    'severity': 'error',
                    'project': project_key,
                    'message': f"Tags exist for non-existent project '{project_key}'"
                })
                
        # Check for duplicate project names
        project_names = {}
        for project_key, project_data in self.projects.items():
            name = project_data.get('name', '')
            if name:
                if name in project_names:
                    issues.append({
                        'type': 'duplicate_name',
                        'severity': 'warning',
                        'project': project_key,
                        'message': f"Duplicate project name '{name}' (also used by {project_names[name]})"
                    })
                else:
                    project_names[name] = project_key
                    
        return issues
        
    def validate_all(self) -> Dict[str, Any]:
        """Run all validation checks."""
        validation_results = {
            'summary': {
                'total_projects': len(self.projects),
                'projects_validated': 0,
                'total_issues': 0,
                'errors': 0,
                'warnings': 0,
                'info': 0
            },
            'project_issues': {},
            'cross_reference_issues': [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Validate each project
        for project_key, project_data in self.projects.items():
            project_issues = []
            
            # Run all validation checks
            project_issues.extend(self.validate_project_structure(project_key, project_data))
            project_issues.extend(self.validate_data_quality(project_key, project_data))
            project_issues.extend(self.validate_content_quality(project_key, project_data))
            project_issues.extend(self.validate_tag_consistency(project_key, project_data))
            
            if project_issues:
                validation_results['project_issues'][project_key] = project_issues
                
                # Count issues by severity
                for issue in project_issues:
                    validation_results['summary']['total_issues'] += 1
                    severity = issue.get('severity', 'info')
                    if severity == 'error':
                        validation_results['summary']['errors'] += 1
                    elif severity == 'warning':
                        validation_results['summary']['warnings'] += 1
                    else:
                        validation_results['summary']['info'] += 1
                        
            validation_results['summary']['projects_validated'] += 1
            
        # Validate cross-references
        cross_ref_issues = self.validate_cross_references()
        validation_results['cross_reference_issues'] = cross_ref_issues
        
        for issue in cross_ref_issues:
            validation_results['summary']['total_issues'] += 1
            severity = issue.get('severity', 'info')
            if severity == 'error':
                validation_results['summary']['errors'] += 1
            elif severity == 'warning':
                validation_results['summary']['warnings'] += 1
            else:
                validation_results['summary']['info'] += 1
                
        return validation_results
        
    def generate_validation_report(self, results: Dict[str, Any], format: str = 'markdown') -> str:
        """Generate validation report in specified format."""
        if format == 'markdown':
            return self._generate_markdown_report(results)
        elif format == 'json':
            return json.dumps(results, indent=2)
        else:
            return str(results)
            
    def _generate_markdown_report(self, results: Dict[str, Any]) -> str:
        """Generate markdown validation report."""
        lines = ["# Data Validation Report\n"]
        
        # Summary
        summary = results['summary']
        lines.append(f"**Generated:** {results['timestamp']}\n")
        lines.append("## Summary\n")
        lines.append(f"- **Total Projects:** {summary['total_projects']}")
        lines.append(f"- **Projects Validated:** {summary['projects_validated']}")
        lines.append(f"- **Total Issues:** {summary['total_issues']}")
        lines.append(f"- **Errors:** {summary['errors']} ❌")
        lines.append(f"- **Warnings:** {summary['warnings']} ⚠️")
        lines.append(f"- **Info:** {summary['info']} ℹ️")
        lines.append("")
        
        # Quality score
        if summary['total_issues'] == 0:
            lines.append("### 🎉 **Perfect Score!** All validations passed!\n")
        elif summary['errors'] == 0:
            lines.append("### ✅ **Good** - No critical errors found\n")
        else:
            lines.append("### ⚠️ **Needs Attention** - Critical errors found\n")
            
        # Cross-reference issues
        if results['cross_reference_issues']:
            lines.append("## Cross-Reference Issues\n")
            for issue in results['cross_reference_issues']:
                severity_emoji = self._get_severity_emoji(issue['severity'])
                lines.append(f"{severity_emoji} **{issue['type']}**: {issue['message']}")
            lines.append("")
            
        # Project issues
        if results['project_issues']:
            lines.append("## Project Issues\n")
            
            # Sort by number of issues
            sorted_projects = sorted(
                results['project_issues'].items(),
                key=lambda x: len(x[1]),
                reverse=True
            )
            
            for project_key, issues in sorted_projects[:20]:  # Show top 20
                project_name = self.projects.get(project_key, {}).get('name', project_key)
                lines.append(f"### {project_name} ({len(issues)} issues)\n")
                
                # Group by severity
                errors = [i for i in issues if i['severity'] == 'error']
                warnings = [i for i in issues if i['severity'] == 'warning']
                info = [i for i in issues if i['severity'] == 'info']
                
                if errors:
                    lines.append("**Errors:**")
                    for issue in errors:
                        lines.append(f"- ❌ {issue['type']}: {issue['message']}")
                        
                if warnings:
                    lines.append("\n**Warnings:**")
                    for issue in warnings:
                        lines.append(f"- ⚠️ {issue['type']}: {issue['message']}")
                        
                if info:
                    lines.append("\n**Info:**")
                    for issue in info[:5]:  # Limit info items
                        lines.append(f"- ℹ️ {issue['type']}: {issue['message']}")
                        
                lines.append("")
                
        # Recommendations
        lines.append("## Recommendations\n")
        
        if summary['errors'] > 0:
            lines.append("### Critical Issues to Fix:")
            lines.append("1. Address all missing required fields")
            lines.append("2. Fix invalid data types and ranges")
            lines.append("3. Resolve orphaned tag references")
            lines.append("")
            
        if summary['warnings'] > 0:
            lines.append("### Improvements Suggested:")
            lines.append("1. Complete all empty fields")
            lines.append("2. Standardize revenue and time formats")
            lines.append("3. Add more detailed descriptions")
            lines.append("4. Ensure all projects have appropriate tags")
            lines.append("")
            
        return '\n'.join(lines)
        
    def _get_severity_emoji(self, severity: str) -> str:
        """Get emoji for severity level."""
        return {
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        }.get(severity, '•')
        
    def fix_common_issues(self, auto_fix: bool = False) -> Dict[str, int]:
        """Fix common validation issues."""
        fixes = {
            'empty_fields_filled': 0,
            'invalid_types_fixed': 0,
            'missing_tags_added': 0,
            'formats_standardized': 0
        }
        
        if not auto_fix:
            print("🔧 Dry run mode - no changes will be made")
            
        # Fix issues in each project
        for project_key, project_data in self.projects.items():
            # Fix empty required fields with defaults
            if not project_data.get('target_users'):
                if auto_fix:
                    project_data['target_users'] = 'General users'
                fixes['empty_fields_filled'] += 1
                
            # Fix quality score type
            quality = project_data.get('quality_score')
            if isinstance(quality, str):
                try:
                    if auto_fix:
                        project_data['quality_score'] = float(quality)
                    fixes['invalid_types_fixed'] += 1
                except:
                    pass
                    
            # Standardize technical complexity format
            complexity = project_data.get('technical_complexity', '')
            if isinstance(complexity, int):
                if auto_fix:
                    project_data['technical_complexity'] = f"{complexity}/10"
                fixes['formats_standardized'] += 1
                
        # Save fixed data if auto_fix is enabled
        if auto_fix:
            try:
                with open(self.projects_path, 'r') as f:
                    full_data = json.load(f)
                    
                full_data['projects'] = self.projects
                
                with open(self.projects_path, 'w') as f:
                    json.dump(full_data, f, indent=2)
                    
                print("✅ Fixes applied successfully")
            except Exception as e:
                print(f"❌ Error saving fixes: {e}")
                
        return fixes

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Data validation and quality assurance")
    parser.add_argument('--validate', action='store_true', help='Run full validation')
    parser.add_argument('--quick-check', action='store_true', help='Quick validation check')
    parser.add_argument('--project', help='Validate specific project')
    parser.add_argument('--fix', action='store_true', help='Fix common issues')
    parser.add_argument('--auto-fix', action='store_true', help='Apply fixes automatically')
    parser.add_argument('--report', help='Generate validation report')
    parser.add_argument('--format', choices=['markdown', 'json'], default='markdown', help='Report format')
    
    args = parser.parse_args()
    
    validator = ValidationSystem()
    
    if args.validate or args.quick_check:
        print("🔍 Running validation checks...")
        results = validator.validate_all()
        
        # Print summary
        summary = results['summary']
        print(f"\n📊 Validation Summary:")
        print(f"   Projects validated: {summary['projects_validated']}")
        print(f"   Total issues: {summary['total_issues']}")
        print(f"   ❌ Errors: {summary['errors']}")
        print(f"   ⚠️  Warnings: {summary['warnings']}")
        print(f"   ℹ️  Info: {summary['info']}")
        
        # Save report if requested
        if args.report:
            report = validator.generate_validation_report(results, args.format)
            with open(args.report, 'w') as f:
                f.write(report)
            print(f"\n📄 Report saved to: {args.report}")
        else:
            # Show top issues
            if results['project_issues']:
                print("\n🔝 Top Issues:")
                sorted_projects = sorted(
                    results['project_issues'].items(),
                    key=lambda x: len(x[1]),
                    reverse=True
                )
                
                for project_key, issues in sorted_projects[:5]:
                    project_name = validator.projects.get(project_key, {}).get('name', project_key)
                    print(f"\n   {project_name}: {len(issues)} issues")
                    
                    # Show first few issues
                    for issue in issues[:3]:
                        emoji = validator._get_severity_emoji(issue['severity'])
                        print(f"     {emoji} {issue['type']}: {issue['message']}")
                        
    elif args.project:
        # Validate specific project
        if args.project not in validator.projects:
            print(f"❌ Project '{args.project}' not found")
            return
            
        project_data = validator.projects[args.project]
        issues = []
        
        issues.extend(validator.validate_project_structure(args.project, project_data))
        issues.extend(validator.validate_data_quality(args.project, project_data))
        issues.extend(validator.validate_content_quality(args.project, project_data))
        issues.extend(validator.validate_tag_consistency(args.project, project_data))
        
        print(f"🔍 Validation results for '{args.project}':")
        
        if not issues:
            print("✅ No issues found!")
        else:
            for issue in issues:
                emoji = validator._get_severity_emoji(issue['severity'])
                print(f"{emoji} {issue['type']}: {issue['message']}")
                
    elif args.fix:
        print("🔧 Analyzing common issues...")
        fixes = validator.fix_common_issues(args.auto_fix)
        
        print("\n📊 Issues found:")
        for fix_type, count in fixes.items():
            if count > 0:
                print(f"   {fix_type}: {count}")
                
        if not args.auto_fix:
            print("\nℹ️  Run with --auto-fix to apply these fixes")
            
    else:
        parser.print_help()

if __name__ == "__main__":
    main()