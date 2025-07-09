#!/usr/bin/env python3
"""
Script to create view files and consolidated data files
"""

import json
import os
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any, Set

def load_consolidated_projects() -> Dict[str, Any]:
    """Load consolidated projects data"""
    with open('/home/sali/ai/projects/masterlist/consolidated_projects.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def ensure_directory(path: str):
    """Ensure directory exists"""
    Path(path).mkdir(parents=True, exist_ok=True)

def calculate_quality_score(project: Dict[str, Any]) -> float:
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
    complexity_text = str(project.get('technical_complexity', '5/10'))
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
    
    return round(overall_score, 2)

def create_platform_view(projects: Dict[str, Any]):
    """Create platform-specific view files"""
    base_path = "/home/sali/ai/projects/masterlist/views/by-platform"
    ensure_directory(base_path)
    
    platform_projects = defaultdict(list)
    
    # Group projects by platform
    for project_name, project in projects.items():
        for platform in project.get('platforms', {}).keys():
            platform_projects[platform].append((project_name, project))
    
    # Create view files for each platform
    for platform, project_list in platform_projects.items():
        # Sort by quality score descending
        project_list.sort(key=lambda x: calculate_quality_score(x[1]), reverse=True)
        
        platform_display_name = platform.replace('-', ' ').title()
        content = f"""# {platform_display_name} Projects

This view contains all projects that can be implemented as {platform_display_name} solutions.

## Summary
- **Total Projects:** {len(project_list)}
- **Average Quality Score:** {sum(calculate_quality_score(p[1]) for p in project_list) / len(project_list):.2f}/10
- **Top Quality Score:** {calculate_quality_score(project_list[0][1]):.2f}/10

## Projects by Quality Score

"""
        
        for project_name, project in project_list:
            category = project.get('estimated_category', 'other')
            quality_score = calculate_quality_score(project)
            
            # Extract revenue potential
            revenue_text = project.get('revenue_potential', '')
            revenue_match = ""
            if 'realistic' in revenue_text.lower():
                import re
                matches = re.findall(r'realistic[:\s]*[~$]*([0-9,]+)', revenue_text.lower())
                if matches:
                    revenue_match = f"${matches[0]}/month"
            
            content += f"""### [{project['project_name']}](../../{category}/{project_name}/)
- **Quality Score:** {quality_score}/10
- **Category:** {category.replace('-', ' ').title()}
- **Revenue Potential:** {revenue_match or 'Not specified'}
- **Problem:** {project.get('problem_statement', 'Not specified')[:200]}...
- **Platforms:** {', '.join(project.get('platforms', {}).keys())}

"""
        
        with open(f"{base_path}/{platform}.md", 'w', encoding='utf-8') as f:
            f.write(content)
    
    print(f"Created platform view files for {len(platform_projects)} platforms")

def create_category_view(projects: Dict[str, Any]):
    """Create category-specific view files"""
    base_path = "/home/sali/ai/projects/masterlist/views/by-category"
    ensure_directory(base_path)
    
    category_projects = defaultdict(list)
    
    # Group projects by category
    for project_name, project in projects.items():
        category = project.get('estimated_category', 'other')
        category_projects[category].append((project_name, project))
    
    # Create view files for each category
    for category, project_list in category_projects.items():
        # Sort by quality score descending
        project_list.sort(key=lambda x: calculate_quality_score(x[1]), reverse=True)
        
        category_display_name = category.replace('-', ' ').title()
        content = f"""# {category_display_name} Projects

This view contains all projects in the {category_display_name} category.

## Summary
- **Total Projects:** {len(project_list)}
- **Average Quality Score:** {sum(calculate_quality_score(p[1]) for p in project_list) / len(project_list):.2f}/10
- **Top Quality Score:** {calculate_quality_score(project_list[0][1]):.2f}/10

## Platform Distribution
"""
        
        # Platform distribution
        platform_count = defaultdict(int)
        for _, project in project_list:
            for platform in project.get('platforms', {}).keys():
                platform_count[platform] += 1
        
        for platform, count in sorted(platform_count.items(), key=lambda x: x[1], reverse=True):
            content += f"- **{platform.replace('-', ' ').title()}:** {count} projects\n"
        
        content += "\n## Projects by Quality Score\n\n"
        
        for project_name, project in project_list:
            quality_score = calculate_quality_score(project)
            
            # Extract revenue potential
            revenue_text = project.get('revenue_potential', '')
            revenue_match = ""
            if 'realistic' in revenue_text.lower():
                import re
                matches = re.findall(r'realistic[:\s]*[~$]*([0-9,]+)', revenue_text.lower())
                if matches:
                    revenue_match = f"${matches[0]}/month"
            
            platforms = list(project.get('platforms', {}).keys())
            
            content += f"""### [{project['project_name']}](../../{category}/{project_name}/)
- **Quality Score:** {quality_score}/10
- **Revenue Potential:** {revenue_match or 'Not specified'}
- **Platforms:** {', '.join([p.replace('-', ' ').title() for p in platforms])}
- **Problem:** {project.get('problem_statement', 'Not specified')[:200]}...
- **Technical Complexity:** {project.get('technical_complexity', 'Not specified')}

"""
        
        with open(f"{base_path}/{category}.md", 'w', encoding='utf-8') as f:
            f.write(content)
    
    print(f"Created category view files for {len(category_projects)} categories")

def create_quality_score_view(projects: Dict[str, Any]):
    """Create quality score view files"""
    base_path = "/home/sali/ai/projects/masterlist/views/by-quality-score"
    ensure_directory(base_path)
    
    # Calculate quality scores for all projects
    scored_projects = []
    for project_name, project in projects.items():
        quality_score = calculate_quality_score(project)
        scored_projects.append((project_name, project, quality_score))
    
    # Sort by quality score descending
    scored_projects.sort(key=lambda x: x[2], reverse=True)
    
    # Create top-rated view
    top_rated_content = f"""# Top Rated Projects

This view contains the highest quality projects based on our comprehensive scoring system.

## Scoring Methodology
Our quality score considers:
- **Completeness (25%):** How well-documented the project is
- **Revenue Potential (25%):** Realistic revenue projections
- **Technical Feasibility (20%):** How easy it is to implement
- **Market Opportunity (20%):** Competition level and market size
- **Platform Coverage (10%):** Number of platforms available

## Top 50 Projects

"""
    
    for i, (project_name, project, quality_score) in enumerate(scored_projects[:50]):
        category = project.get('estimated_category', 'other')
        
        # Extract revenue potential
        revenue_text = project.get('revenue_potential', '')
        revenue_match = ""
        if 'realistic' in revenue_text.lower():
            import re
            matches = re.findall(r'realistic[:\s]*[~$]*([0-9,]+)', revenue_text.lower())
            if matches:
                revenue_match = f"${matches[0]}/month"
        
        platforms = list(project.get('platforms', {}).keys())
        
        top_rated_content += f"""### {i+1}. [{project['project_name']}](../../{category}/{project_name}/)
- **Quality Score:** {quality_score}/10
- **Category:** {category.replace('-', ' ').title()}
- **Revenue Potential:** {revenue_match or 'Not specified'}
- **Platforms:** {', '.join([p.replace('-', ' ').title() for p in platforms])}
- **Problem:** {project.get('problem_statement', 'Not specified')[:150]}...

"""
    
    with open(f"{base_path}/top-rated.md", 'w', encoding='utf-8') as f:
        f.write(top_rated_content)
    
    # Create quality score ranges
    ranges = [
        (9, 10, "excellent"),
        (8, 8.99, "very-good"),
        (7, 7.99, "good"),
        (6, 6.99, "fair"),
        (0, 5.99, "needs-improvement")
    ]
    
    for min_score, max_score, range_name in ranges:
        range_projects = [(name, proj, score) for name, proj, score in scored_projects 
                         if min_score <= score <= max_score]
        
        if range_projects:
            range_content = f"""# {range_name.replace('-', ' ').title()} Projects ({min_score}-{max_score}/10)

This view contains projects with quality scores between {min_score} and {max_score}.

## Summary
- **Total Projects:** {len(range_projects)}
- **Average Quality Score:** {sum(s[2] for s in range_projects) / len(range_projects):.2f}/10

## Projects

"""
            
            for project_name, project, quality_score in range_projects:
                category = project.get('estimated_category', 'other')
                platforms = list(project.get('platforms', {}).keys())
                
                range_content += f"""### [{project['project_name']}](../../{category}/{project_name}/)
- **Quality Score:** {quality_score}/10
- **Category:** {category.replace('-', ' ').title()}
- **Platforms:** {', '.join([p.replace('-', ' ').title() for p in platforms])}
- **Problem:** {project.get('problem_statement', 'Not specified')[:150]}...

"""
            
            with open(f"{base_path}/{range_name}.md", 'w', encoding='utf-8') as f:
                f.write(range_content)
    
    print(f"Created quality score view files")

def create_consolidated_files(projects: Dict[str, Any]):
    """Create consolidated JSON and CSV files"""
    base_path = "/home/sali/ai/projects/masterlist"
    
    # Create consolidated projects.json
    consolidated_data = {
        'metadata': {
            'total_projects': len(projects),
            'last_updated': '2024-01-01',
            'version': '1.0.0'
        },
        'projects': {}
    }
    
    for project_name, project in projects.items():
        quality_score = calculate_quality_score(project)
        
        consolidated_data['projects'][project_name] = {
            'name': project['project_name'],
            'category': project.get('estimated_category', 'other'),
            'quality_score': quality_score,
            'platforms': list(project.get('platforms', {}).keys()),
            'problem_statement': project.get('problem_statement', ''),
            'solution_description': project.get('solution_description', ''),
            'target_users': project.get('target_users', ''),
            'revenue_model': project.get('revenue_model', ''),
            'revenue_potential': project.get('revenue_potential', ''),
            'development_time': project.get('development_time', ''),
            'technical_complexity': project.get('technical_complexity', ''),
            'competition_level': project.get('competition_level', ''),
            'key_features': project.get('key_features', []),
            'cross_platform_project': project.get('cross_platform_project', False),
            'completeness_score': project.get('completeness_score', 0)
        }
    
    with open(f"{base_path}/projects.json", 'w', encoding='utf-8') as f:
        json.dump(consolidated_data, f, indent=2)
    
    # Create projects.csv
    csv_data = []
    for project_name, project in projects.items():
        quality_score = calculate_quality_score(project)
        
        # Extract revenue potential
        revenue_text = project.get('revenue_potential', '')
        revenue_match = ""
        if 'realistic' in revenue_text.lower():
            import re
            matches = re.findall(r'realistic[:\s]*[~$]*([0-9,]+)', revenue_text.lower())
            if matches:
                revenue_match = matches[0]
        
        csv_data.append({
            'project_name': project['project_name'],
            'category': project.get('estimated_category', 'other'),
            'quality_score': quality_score,
            'platforms': ', '.join(project.get('platforms', {}).keys()),
            'problem_statement': project.get('problem_statement', ''),
            'solution_description': project.get('solution_description', ''),
            'target_users': project.get('target_users', ''),
            'revenue_model': project.get('revenue_model', ''),
            'realistic_revenue': revenue_match,
            'development_time': project.get('development_time', ''),
            'technical_complexity': project.get('technical_complexity', ''),
            'competition_level': project.get('competition_level', ''),
            'cross_platform_project': project.get('cross_platform_project', False),
            'completeness_score': project.get('completeness_score', 0)
        })
    
    # Sort by quality score descending
    csv_data.sort(key=lambda x: x['quality_score'], reverse=True)
    
    with open(f"{base_path}/projects.csv", 'w', newline='', encoding='utf-8') as f:
        if csv_data:
            writer = csv.DictWriter(f, fieldnames=csv_data[0].keys())
            writer.writeheader()
            writer.writerows(csv_data)
    
    print(f"Created consolidated files: projects.json and projects.csv")

def main():
    """Main function"""
    projects = load_consolidated_projects()
    
    print("Creating view files...")
    create_platform_view(projects)
    create_category_view(projects)
    create_quality_score_view(projects)
    create_consolidated_files(projects)
    
    print("All view files created successfully!")

if __name__ == "__main__":
    main()