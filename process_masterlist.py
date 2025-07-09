#!/usr/bin/env python3
"""
Process parsed_masterlist.json to create a structured repository
- Consolidate duplicates 
- Create directory structure
- Generate standardized files
"""

import json
import os
import shutil
import re
from pathlib import Path
from collections import defaultdict
import hashlib
from difflib import SequenceMatcher

def load_masterlist(filepath):
    """Load the parsed masterlist JSON file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def clean_name(name):
    """Clean names for directory/file usage"""
    # Remove special characters and convert to lowercase
    clean = re.sub(r'[^\w\s-]', '', name.lower())
    # Replace spaces with hyphens
    clean = re.sub(r'\s+', '-', clean)
    # Remove multiple hyphens
    clean = re.sub(r'-+', '-', clean)
    # Remove leading/trailing hyphens
    return clean.strip('-')

def similarity_score(a, b):
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def calculate_quality_score(project):
    """Calculate quality score 1-10 based on completeness and clarity"""
    score = 0
    
    # Base completeness score (already provided)
    score += min(project.get('completeness_score', 0), 10) * 0.3
    
    # Revenue clarity (30% weight)
    revenue_potential = project.get('revenue_potential', '')
    if 'Conservative:' in revenue_potential and 'Realistic:' in revenue_potential:
        score += 3
    elif revenue_potential:
        score += 2
    
    # Problem/solution clarity (20% weight)
    if len(project.get('problem_statement', '')) > 50:
        score += 1
    if len(project.get('solution_description', '')) > 50:
        score += 1
    
    # Market viability (10% weight)
    if project.get('target_users'):
        score += 1
    
    # Technical feasibility (10% weight)
    tech_complexity = project.get('technical_complexity', '10/10')
    if '/' in tech_complexity:
        complexity = int(tech_complexity.split('/')[0])
        if complexity <= 5:
            score += 1
    
    return min(round(score, 1), 10)

def find_duplicates(projects):
    """Find duplicate projects across all platforms"""
    duplicates = []
    seen = []
    
    for project in projects:
        name = project.get('project_name', '')
        problem = project.get('problem_statement', '')
        solution = project.get('solution_description', '')
        
        # Check against all seen projects
        for seen_project in seen:
            seen_name = seen_project.get('project_name', '')
            seen_problem = seen_project.get('problem_statement', '')
            seen_solution = seen_project.get('solution_description', '')
            
            # Check similarity
            name_sim = similarity_score(name, seen_name)
            problem_sim = similarity_score(problem, seen_problem)
            solution_sim = similarity_score(solution, seen_solution)
            
            # Consider duplicate if high similarity in name or problem+solution
            if (name_sim > 0.8 or (problem_sim > 0.7 and solution_sim > 0.7)):
                duplicates.append({
                    'project1': project,
                    'project2': seen_project,
                    'similarity': {
                        'name': name_sim,
                        'problem': problem_sim,
                        'solution': solution_sim
                    }
                })
        
        seen.append(project)
    
    return duplicates

def merge_projects(project1, project2):
    """Merge two similar projects, keeping the most complete version as base"""
    # Use the project with higher completeness score as base
    if project1.get('completeness_score', 0) >= project2.get('completeness_score', 0):
        base, other = project1, project2
    else:
        base, other = project2, project1
    
    merged = base.copy()
    
    # Merge key features
    features1 = set(base.get('key_features', []))
    features2 = set(other.get('key_features', []))
    merged['key_features'] = list(features1.union(features2))
    
    # Merge line numbers
    lines1 = base.get('line_numbers', [])
    lines2 = other.get('line_numbers', [])
    merged['line_numbers'] = sorted(list(set(lines1 + lines2)))
    
    # Add merge metadata
    merged['merged_from'] = [
        {
            'project_name': other.get('project_name'),
            'platform': other.get('platform'),
            'completeness_score': other.get('completeness_score')
        }
    ]
    
    return merged

def create_directory_structure(base_path):
    """Create the hierarchical directory structure"""
    platforms = {
        'Figma Plugins': 'figma',
        'Chrome Browser Extensions': 'chrome',
        'VSCode Extensions': 'vscode',
        'AI-Powered Browser Tools': 'ai-browser',
        'Notion Templates & Widgets': 'notion',
        'Obsidian Plugins': 'obsidian',
        'Crypto/Blockchain Browser Tools': 'crypto-browser',
        'AI-Powered Productivity Automation Tools (Zero-Server, Platform-Hosted)': 'ai-productivity',
        'AI Productivity Automation Platforms (e.g., Zapier, IFTTT, Power Automate, Make)': 'ai-platforms',
        'Zapier AI Automation Apps (Zero-Server, Platform-Hosted)': 'zapier-ai',
        'Jasper Canvas & AI Studio': 'jasper-ai',
        'VSCode Extensions (Developer productivity tools)': 'vscode-dev'
    }
    
    categories = [
        'design-tools',
        'content-writing', 
        'productivity',
        'ai-ml',
        'development-tools',
        'crypto-blockchain',
        'browser-web',
        'other'
    ]
    
    # Create platform directories
    for platform_name, platform_dir in platforms.items():
        for category in categories:
            dir_path = os.path.join(base_path, platform_dir, category)
            os.makedirs(dir_path, exist_ok=True)
    
    return platforms

def generate_project_readme(project, output_path):
    """Generate a standardized README.md for each project"""
    
    quality_score = calculate_quality_score(project)
    
    readme_content = f"""# {project.get('project_name', 'Unnamed Project')}

## Overview
**Platform**: {project.get('platform', 'N/A')}  
**Category**: {project.get('estimated_category', 'other')}  
**Quality Score**: {quality_score}/10  

## Problem Statement
{project.get('problem_statement', 'Not specified')}

## Solution
{project.get('solution_description', 'Not specified')}

## Target Users
{project.get('target_users', 'Not specified')}

## Revenue Model
{project.get('revenue_model', 'Not specified')}

## Revenue Potential
{project.get('revenue_potential', 'Not specified')}

## Development Time
{project.get('development_time', 'Not specified')}

## Competition Level
{project.get('competition_level', 'Not specified')}

## Technical Complexity
{project.get('technical_complexity', 'Not specified')}

## Key Features
"""
    
    features = project.get('key_features', [])
    if features:
        for feature in features:
            readme_content += f"- {feature}\n"
    else:
        readme_content += "- Not specified\n"
    
    readme_content += f"""
## Monetization Details
{project.get('monetization_details', 'Not specified')}

## Risk Assessment
{project.get('risk_assessment', 'Not specified')}

## Success Indicators
{project.get('success_indicators', 'Not specified')}

## Metadata
- **Completeness Score**: {project.get('completeness_score', 'N/A')}/10
- **Line Numbers**: {project.get('line_numbers', [])}
- **Formatting Issues**: {project.get('formatting_issues', [])}
"""
    
    if project.get('merged_from'):
        readme_content += f"\n## Merged From\n"
        for merged in project.get('merged_from', []):
            readme_content += f"- {merged.get('project_name')} ({merged.get('platform')})\n"
    
    # Write the file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)

def main():
    """Main processing function"""
    
    # Load the masterlist
    print("Loading masterlist...")
    masterlist = load_masterlist('/home/sali/ai/projects/masterlist/parsed_masterlist.json')
    
    # Extract all projects
    all_projects = []
    for platform_name, projects in masterlist.get('projects_by_platform', {}).items():
        for project in projects:
            all_projects.append(project)
    
    print(f"Found {len(all_projects)} total projects")
    
    # Find duplicates
    print("Finding duplicates...")
    duplicates = find_duplicates(all_projects)
    print(f"Found {len(duplicates)} duplicate pairs")
    
    # Consolidate duplicates
    print("Consolidating duplicates...")
    consolidated_projects = []
    processed_projects = set()
    
    # Process duplicates first
    for dup in duplicates:
        project1 = dup['project1']
        project2 = dup['project2']
        
        # Create unique keys for tracking
        key1 = f"{project1.get('project_name', '')}_{project1.get('platform', '')}"
        key2 = f"{project2.get('project_name', '')}_{project2.get('platform', '')}"
        
        if key1 not in processed_projects and key2 not in processed_projects:
            merged = merge_projects(project1, project2)
            consolidated_projects.append(merged)
            processed_projects.add(key1)
            processed_projects.add(key2)
    
    # Add remaining non-duplicate projects
    for project in all_projects:
        key = f"{project.get('project_name', '')}_{project.get('platform', '')}"
        if key not in processed_projects:
            consolidated_projects.append(project)
    
    print(f"After consolidation: {len(consolidated_projects)} projects")
    
    # Create directory structure
    print("Creating directory structure...")
    base_path = '/home/sali/ai/projects/masterlist'
    platforms = create_directory_structure(base_path)
    
    # Generate project files
    print("Generating project files...")
    projects_data = []
    
    for project in consolidated_projects:
        platform = project.get('platform', '')
        category = project.get('estimated_category', 'other')
        project_name = clean_name(project.get('project_name', 'unnamed'))
        
        # Map platform to directory name
        platform_dir = platforms.get(platform, 'other')
        
        # Create project directory
        project_dir = os.path.join(base_path, platform_dir, category, project_name)
        os.makedirs(project_dir, exist_ok=True)
        
        # Generate README
        readme_path = os.path.join(project_dir, 'README.md')
        generate_project_readme(project, readme_path)
        
        # Add to projects data
        project_data = project.copy()
        project_data['quality_score'] = calculate_quality_score(project)
        project_data['directory_path'] = f"{platform_dir}/{category}/{project_name}"
        projects_data.append(project_data)
    
    # Generate consolidated JSON
    print("Generating consolidated formats...")
    consolidated_json = {
        'metadata': {
            'total_projects': len(projects_data),
            'original_total': len(all_projects),
            'duplicates_merged': len(duplicates),
            'processing_date': '2025-07-08'
        },
        'projects': projects_data
    }
    
    with open(os.path.join(base_path, 'projects.json'), 'w', encoding='utf-8') as f:
        json.dump(consolidated_json, f, indent=2, ensure_ascii=False)
    
    print(f"Processing complete! Created {len(consolidated_projects)} consolidated projects")

if __name__ == "__main__":
    main()