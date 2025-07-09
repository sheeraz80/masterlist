#!/usr/bin/env python3
"""
Script to create a function-first repository structure from parsed_masterlist.json
"""

import json
import os
import re
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any, Set
import hashlib

def load_masterlist_data(file_path: str) -> Dict[str, Any]:
    """Load and parse the masterlist JSON data"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def normalize_project_name(name: str) -> str:
    """Convert project name to lowercase with hyphens"""
    # Remove special characters and convert to lowercase
    normalized = re.sub(r'[^\w\s-]', '', name.lower())
    # Replace spaces and underscores with hyphens
    normalized = re.sub(r'[\s_]+', '-', normalized)
    # Remove multiple consecutive hyphens
    normalized = re.sub(r'-+', '-', normalized)
    # Remove leading/trailing hyphens
    return normalized.strip('-')

def normalize_category_name(category: str) -> str:
    """Convert category name to lowercase with hyphens"""
    return normalize_project_name(category)

def normalize_platform_name(platform: str) -> str:
    """Convert platform name to lowercase with hyphens"""
    platform_map = {
        'Figma Plugins': 'figma-plugin',
        'Chrome Browser Extensions': 'chrome-extension',
        'VSCode Extensions': 'vscode-extension',
        'VSCode Extensions (Developer productivity tools)': 'vscode-extension',
        'AI-Powered Browser Tools': 'ai-browser-tools',
        'Notion Templates & Widgets': 'notion-templates',
        'Obsidian Plugins': 'obsidian-plugin',
        'Crypto/Blockchain Browser Tools': 'crypto-browser-tools',
        'AI-Powered Productivity Automation Tools (Zero-Server, Platform-Hosted)': 'ai-productivity-tools',
        'AI Productivity Automation Platforms (e.g., Zapier, IFTTT, Power Automate, Make)': 'ai-automation-platforms',
        'Zapier AI Automation Apps (Zero-Server, Platform-Hosted)': 'zapier-ai-apps',
        'Jasper Canvas & AI Studio': 'jasper-canvas'
    }
    return platform_map.get(platform, normalize_project_name(platform))

def generate_project_hash(project: Dict[str, Any]) -> str:
    """Generate a hash for project similarity comparison"""
    key_fields = [
        project.get('problem_statement', ''),
        project.get('solution_description', ''),
        project.get('target_users', '')
    ]
    content = ''.join(key_fields).lower()
    return hashlib.md5(content.encode()).hexdigest()

def find_similar_projects(all_projects: List[Dict[str, Any]], similarity_threshold: float = 0.7) -> List[List[Dict[str, Any]]]:
    """Find groups of similar projects across platforms"""
    from difflib import SequenceMatcher
    
    similar_groups = []
    processed = set()
    
    for i, project1 in enumerate(all_projects):
        if i in processed:
            continue
            
        similar_group = [project1]
        processed.add(i)
        
        for j, project2 in enumerate(all_projects[i+1:], i+1):
            if j in processed:
                continue
                
            # Compare key fields for similarity
            fields1 = [
                project1.get('problem_statement', ''),
                project1.get('solution_description', ''),
                project1.get('target_users', '')
            ]
            fields2 = [
                project2.get('problem_statement', ''),
                project2.get('solution_description', ''),
                project2.get('target_users', '')
            ]
            
            # Calculate similarity
            similarities = []
            for f1, f2 in zip(fields1, fields2):
                if f1 and f2:
                    similarity = SequenceMatcher(None, f1.lower(), f2.lower()).ratio()
                    similarities.append(similarity)
            
            if similarities and sum(similarities) / len(similarities) >= similarity_threshold:
                similar_group.append(project2)
                processed.add(j)
        
        if len(similar_group) > 1:
            similar_groups.append(similar_group)
    
    return similar_groups

def consolidate_projects(data: Dict[str, Any]) -> Dict[str, Any]:
    """Consolidate duplicate projects by functionality"""
    all_projects = []
    
    # Collect all projects from all platforms
    for platform, projects in data['projects_by_platform'].items():
        for project in projects:
            project['original_platform'] = platform
            all_projects.append(project)
    
    # Find similar projects
    similar_groups = find_similar_projects(all_projects)
    
    # Create consolidated projects
    consolidated_projects = {}
    processed_projects = set()
    
    for group in similar_groups:
        # Use the project with the highest completeness score as the base
        base_project = max(group, key=lambda p: p.get('completeness_score', 0))
        
        # Create a consolidated project
        consolidated = base_project.copy()
        consolidated['platforms'] = {}
        consolidated['cross_platform_project'] = True
        
        # Add platform-specific information
        for project in group:
            platform = normalize_platform_name(project['original_platform'])
            consolidated['platforms'][platform] = {
                'features': project.get('key_features', []),
                'technical_notes': {
                    'complexity': project.get('technical_complexity', 'Unknown'),
                    'development_time': project.get('development_time', 'Unknown'),
                    'platform_specific_details': project.get('solution_description', '')
                },
                'market_fit': {
                    'target_users': project.get('target_users', ''),
                    'revenue_model': project.get('revenue_model', ''),
                    'revenue_potential': project.get('revenue_potential', ''),
                    'monetization_details': project.get('monetization_details', '')
                }
            }
            processed_projects.add(id(project))
        
        project_name = normalize_project_name(consolidated['project_name'])
        consolidated_projects[project_name] = consolidated
    
    # Add remaining non-duplicate projects
    for project in all_projects:
        if id(project) not in processed_projects:
            project_name = normalize_project_name(project['project_name'])
            project['cross_platform_project'] = False
            platform = normalize_platform_name(project['original_platform'])
            project['platforms'] = {
                platform: {
                    'features': project.get('key_features', []),
                    'technical_notes': {
                        'complexity': project.get('technical_complexity', 'Unknown'),
                        'development_time': project.get('development_time', 'Unknown'),
                        'platform_specific_details': project.get('solution_description', '')
                    },
                    'market_fit': {
                        'target_users': project.get('target_users', ''),
                        'revenue_model': project.get('revenue_model', ''),
                        'revenue_potential': project.get('revenue_potential', ''),
                        'monetization_details': project.get('monetization_details', '')
                    }
                }
            }
            consolidated_projects[project_name] = project
    
    return consolidated_projects

def calculate_quality_score(project: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate quality score for a project"""
    score_components = {}
    
    # Completeness score (from original data)
    completeness = project.get('completeness_score', 0)
    score_components['completeness'] = completeness
    
    # Revenue potential score (based on realistic revenue)
    revenue_text = project.get('revenue_potential', '')
    revenue_score = 0
    if 'realistic' in revenue_text.lower():
        # Extract numeric value from realistic revenue
        import re
        matches = re.findall(r'realistic[:\s]*[~$]*([0-9,]+)', revenue_text.lower())
        if matches:
            try:
                revenue_amount = int(matches[0].replace(',', ''))
                if revenue_amount >= 10000:
                    revenue_score = 10
                elif revenue_amount >= 5000:
                    revenue_score = 8
                elif revenue_amount >= 2000:
                    revenue_score = 6
                elif revenue_amount >= 1000:
                    revenue_score = 4
                else:
                    revenue_score = 2
            except:
                revenue_score = 5
    
    score_components['revenue_potential'] = revenue_score
    
    # Technical complexity score (inverse - lower complexity = higher score)
    complexity_text = project.get('technical_complexity', '5/10')
    complexity_score = 5
    if '/' in complexity_text:
        try:
            complexity_num = int(complexity_text.split('/')[0])
            complexity_score = 11 - complexity_num  # Inverse scoring
        except:
            complexity_score = 5
    
    score_components['technical_feasibility'] = complexity_score
    
    # Market opportunity score (based on competition level)
    competition = project.get('competition_level', 'Medium').lower()
    if 'low' in competition:
        market_score = 8
    elif 'medium' in competition:
        market_score = 6
    else:
        market_score = 4
    
    score_components['market_opportunity'] = market_score
    
    # Platform coverage score
    platform_count = len(project.get('platforms', {}))
    platform_score = min(10, platform_count * 2)  # Max 10 points
    score_components['platform_coverage'] = platform_score
    
    # Calculate overall score
    weights = {
        'completeness': 0.25,
        'revenue_potential': 0.25,
        'technical_feasibility': 0.20,
        'market_opportunity': 0.20,
        'platform_coverage': 0.10
    }
    
    overall_score = sum(score_components[key] * weights[key] for key in weights)
    
    return {
        'overall_score': round(overall_score, 2),
        'components': score_components,
        'max_score': 10.0
    }

def main():
    """Main function to create the repository structure"""
    # Load data
    data = load_masterlist_data('/home/sali/ai/projects/masterlist/parsed_masterlist.json')
    
    # Consolidate projects
    print("Consolidating duplicate projects...")
    consolidated_projects = consolidate_projects(data)
    
    print(f"Consolidated {len(consolidated_projects)} projects from {data['summary']['total_projects']} original projects")
    
    # Save consolidated data for use by other scripts
    with open('/home/sali/ai/projects/masterlist/consolidated_projects.json', 'w') as f:
        json.dump(consolidated_projects, f, indent=2)
    
    print("Consolidation complete. Consolidated data saved to consolidated_projects.json")

if __name__ == "__main__":
    main()