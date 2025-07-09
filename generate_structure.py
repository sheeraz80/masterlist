#!/usr/bin/env python3
"""
Script to generate the complete repository structure
"""

import json
import os
import re
import csv
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any, Set
import hashlib

def load_consolidated_projects() -> Dict[str, Any]:
    """Load consolidated projects data"""
    with open('/home/sali/ai/projects/masterlist/consolidated_projects.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def ensure_directory(path: str):
    """Ensure directory exists"""
    Path(path).mkdir(parents=True, exist_ok=True)

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
    
    return {
        'overall_score': round(overall_score, 2),
        'components': score_components,
        'max_score': 10.0
    }

def generate_project_readme(project: Dict[str, Any], project_name: str) -> str:
    """Generate main project README.md content"""
    quality_score = calculate_quality_score(project)
    
    content = f"""# {project['project_name']}

## Overview
**Problem Statement:** {project.get('problem_statement', 'Not specified')}

**Solution:** {project.get('solution_description', 'Not specified')}

**Target Users:** {project.get('target_users', 'Not specified')}

## Quality Score
**Overall Score:** {quality_score['overall_score']}/10

### Score Breakdown
- **Completeness:** {quality_score['components']['completeness']}/10
- **Revenue Potential:** {quality_score['components']['revenue_potential']}/10
- **Technical Feasibility:** {quality_score['components']['technical_feasibility']}/10
- **Market Opportunity:** {quality_score['components']['market_opportunity']}/10
- **Platform Coverage:** {quality_score['components']['platform_coverage']}/10

## Platforms
This project can be implemented on the following platforms:
"""
    
    for platform_name in project.get('platforms', {}).keys():
        content += f"- [{platform_name.replace('-', ' ').title()}](./platforms/{platform_name}/)\n"
    
    content += f"""
## Revenue Model
{project.get('revenue_model', 'Not specified')}

## Revenue Potential
{project.get('revenue_potential', 'Not specified')}

## Development Time
{project.get('development_time', 'Not specified')}

## Technical Complexity
{project.get('technical_complexity', 'Not specified')}

## Competition Level
{project.get('competition_level', 'Not specified')}

## Key Features
"""
    
    key_features = project.get('key_features', [])
    if key_features:
        for feature in key_features:
            content += f"- {feature}\n"
    else:
        content += "- Features not specified\n"
    
    content += f"""
## Success Indicators
{project.get('success_indicators', 'Not specified')}

## Additional Information
- **Cross-platform Project:** {'Yes' if project.get('cross_platform_project', False) else 'No'}
- **Completeness Score:** {project.get('completeness_score', 0)}/10
"""
    
    return content

def generate_platform_readme(project: Dict[str, Any], platform_name: str, platform_data: Dict[str, Any]) -> str:
    """Generate platform-specific README.md content"""
    return f"""# {project['project_name']} - {platform_name.replace('-', ' ').title()}

## Platform-Specific Implementation

### Overview
This implementation targets the **{platform_name.replace('-', ' ').title()}** platform.

### Target Users
{platform_data.get('market_fit', {}).get('target_users', 'Not specified')}

### Platform-Specific Features
"""

def generate_platform_features(project: Dict[str, Any], platform_name: str, platform_data: Dict[str, Any]) -> str:
    """Generate platform-specific features.md content"""
    content = f"""# {project['project_name']} - {platform_name.replace('-', ' ').title()} Features

## Core Features
"""
    
    features = platform_data.get('features', [])
    if features:
        for feature in features:
            content += f"- {feature}\n"
    else:
        content += "- Features not specified\n"
    
    content += f"""
## Platform-Specific Capabilities
This implementation leverages the unique capabilities of the {platform_name.replace('-', ' ').title()} platform:

### API Integration
- Access to platform-specific APIs
- Native integration with platform ecosystem

### User Experience
- Follows platform design guidelines
- Optimized for platform-specific workflows

### Performance
- Optimized for platform performance characteristics
- Efficient resource utilization
"""
    
    return content

def generate_platform_technical_notes(project: Dict[str, Any], platform_name: str, platform_data: Dict[str, Any]) -> str:
    """Generate platform-specific technical-notes.md content"""
    technical_notes = platform_data.get('technical_notes', {})
    
    content = f"""# {project['project_name']} - {platform_name.replace('-', ' ').title()} Technical Notes

## Technical Complexity
**Rating:** {technical_notes.get('complexity', 'Not specified')}

## Development Time
**Estimated:** {technical_notes.get('development_time', 'Not specified')}

## Platform-Specific Technical Details
{technical_notes.get('platform_specific_details', 'Not specified')}

## Technical Requirements

### Platform Constraints
"""
    
    # Add platform-specific constraints
    platform_constraints = {
        'figma-plugin': [
            'Must use Figma Plugin API',
            'Limited to Figma runtime environment',
            'No direct file system access',
            'Sandboxed execution environment'
        ],
        'chrome-extension': [
            'Must follow Chrome Extension Manifest V3',
            'Limited by Chrome security policies',
            'Content script limitations',
            'Background service worker constraints'
        ],
        'vscode-extension': [
            'Must use VS Code Extension API',
            'Node.js runtime environment',
            'Limited UI customization options',
            'Extension host process limitations'
        ]
    }
    
    constraints = platform_constraints.get(platform_name, ['Platform-specific constraints not documented'])
    for constraint in constraints:
        content += f"- {constraint}\n"
    
    content += f"""
### Platform Opportunities
- Rich ecosystem integration
- Large user base
- Established distribution channels
- Platform-specific APIs and capabilities

## Implementation Notes
- Follow platform best practices
- Optimize for platform performance
- Ensure compatibility with platform updates
- Implement proper error handling
"""
    
    return content

def generate_platform_market_fit(project: Dict[str, Any], platform_name: str, platform_data: Dict[str, Any]) -> str:
    """Generate platform-specific market-fit.md content"""
    market_fit = platform_data.get('market_fit', {})
    
    content = f"""# {project['project_name']} - {platform_name.replace('-', ' ').title()} Market Fit

## Platform Ecosystem Fit

### Target Market
{market_fit.get('target_users', 'Not specified')}

### Revenue Model
{market_fit.get('revenue_model', 'Not specified')}

### Revenue Potential
{market_fit.get('revenue_potential', 'Not specified')}

### Platform-Specific Advantages
"""
    
    # Add platform-specific advantages
    platform_advantages = {
        'figma-plugin': [
            'Access to millions of Figma users',
            'Built-in distribution through Figma Community',
            'Direct integration with design workflows',
            'No need for separate user acquisition'
        ],
        'chrome-extension': [
            'Massive Chrome user base (3+ billion users)',
            'Chrome Web Store distribution',
            'Cross-website functionality',
            'Rich web API access'
        ],
        'vscode-extension': [
            'Large developer community',
            'VS Code Marketplace distribution',
            'Deep IDE integration',
            'Developer-focused monetization opportunities'
        ]
    }
    
    advantages = platform_advantages.get(platform_name, ['Platform-specific advantages not documented'])
    for advantage in advantages:
        content += f"- {advantage}\n"
    
    content += f"""
### Monetization Strategy
{market_fit.get('monetization_details', 'Not specified')}

### Distribution Strategy
- Primary: Platform-specific marketplace
- Secondary: Direct marketing to platform users
- Tertiary: Content marketing and community engagement

### Success Metrics
- Platform-specific installation metrics
- User engagement within platform context
- Revenue generated through platform channels
- User retention and satisfaction scores
"""
    
    return content

def generate_market_analysis(project: Dict[str, Any]) -> str:
    """Generate market-analysis.md content"""
    content = f"""# {project['project_name']} - Market Analysis

## Market Overview

### Problem Size
{project.get('problem_statement', 'Not specified')}

### Target Market
{project.get('target_users', 'Not specified')}

## Competition Analysis

### Competition Level
**Rating:** {project.get('competition_level', 'Not specified')}

### Competitive Landscape
{project.get('competition_level', 'Detailed competition analysis not available')}

## Revenue Analysis

### Revenue Model
{project.get('revenue_model', 'Not specified')}

### Revenue Potential
{project.get('revenue_potential', 'Not specified')}

### Revenue Breakdown
"""
    
    # Extract revenue breakdown if available
    revenue_breakdown = project.get('revenue_breakdown', {})
    if revenue_breakdown:
        for scenario, amount in revenue_breakdown.items():
            content += f"- **{scenario.title()}:** {amount}\n"
    else:
        content += "- Revenue breakdown not available\n"
    
    content += f"""
### Monetization Strategy
{project.get('monetization_details', 'Not specified')}

## Risk Assessment

### Overall Risk
{project.get('risk_assessment', 'Risk assessment not available')}

### Key Risks
- Platform dependency risk
- Competition risk
- Technical implementation risk
- Market adoption risk
- Revenue sustainability risk

### Mitigation Strategies
- Diversify across multiple platforms
- Focus on unique value proposition
- Maintain technical excellence
- Build strong user community
- Develop sustainable revenue streams

## Market Opportunity

### Total Addressable Market (TAM)
- Platform user base size
- Market segment size
- Growth potential

### Serviceable Addressable Market (SAM)
- Targetable user subset
- Geographic limitations
- Platform-specific constraints

### Serviceable Obtainable Market (SOM)
- Realistic market capture
- Competitive positioning
- Resource limitations

## Success Indicators
{project.get('success_indicators', 'Not specified')}
"""
    
    return content

def generate_quality_score_file(project: Dict[str, Any]) -> str:
    """Generate quality-score.md content"""
    quality_score = calculate_quality_score(project)
    
    content = f"""# {project['project_name']} - Quality Score

## Overall Quality Score
**{quality_score['overall_score']}/10**

## Score Breakdown

### Completeness Score: {quality_score['components']['completeness']}/10
- Based on the completeness of project documentation
- Includes problem statement, solution, target users, revenue model, etc.

### Revenue Potential Score: {quality_score['components']['revenue_potential']}/10
- Based on realistic revenue projections
- Higher scores for projects with higher revenue potential

### Technical Feasibility Score: {quality_score['components']['technical_feasibility']}/10
- Inverse of technical complexity
- Higher scores for projects that are easier to implement

### Market Opportunity Score: {quality_score['components']['market_opportunity']}/10
- Based on competition level analysis
- Higher scores for projects with lower competition

### Platform Coverage Score: {quality_score['components']['platform_coverage']}/10
- Based on number of platforms the project can be implemented on
- Higher scores for cross-platform projects

## Scoring Methodology

### Weighting System
- **Completeness:** 25%
- **Revenue Potential:** 25%
- **Technical Feasibility:** 20%
- **Market Opportunity:** 20%
- **Platform Coverage:** 10%

### Score Interpretation
- **9-10:** Excellent project with high potential
- **7-8:** Good project with solid potential
- **5-6:** Average project with moderate potential
- **3-4:** Below average project with limited potential
- **1-2:** Poor project with minimal potential

## Recommendations

### Strengths
"""
    
    # Add recommendations based on score
    components = quality_score['components']
    if components['completeness'] >= 8:
        content += "- Well-documented project with clear requirements\n"
    if components['revenue_potential'] >= 8:
        content += "- Strong revenue potential\n"
    if components['technical_feasibility'] >= 8:
        content += "- Technically feasible and relatively easy to implement\n"
    if components['market_opportunity'] >= 8:
        content += "- Good market opportunity with low competition\n"
    if components['platform_coverage'] >= 6:
        content += "- Good platform coverage for broader market reach\n"
    
    content += """
### Areas for Improvement
"""
    
    if components['completeness'] < 6:
        content += "- Improve project documentation and requirements clarity\n"
    if components['revenue_potential'] < 6:
        content += "- Analyze and improve revenue model and potential\n"
    if components['technical_feasibility'] < 6:
        content += "- Simplify technical implementation or break into phases\n"
    if components['market_opportunity'] < 6:
        content += "- Conduct deeper market analysis and competitive research\n"
    if components['platform_coverage'] < 4:
        content += "- Consider expanding to additional platforms\n"
    
    content += f"""
### Priority Recommendation
"""
    
    if quality_score['overall_score'] >= 8:
        content += "**HIGH PRIORITY** - This project has excellent potential and should be prioritized for development.\n"
    elif quality_score['overall_score'] >= 6:
        content += "**MEDIUM PRIORITY** - This project has good potential and should be considered for development.\n"
    else:
        content += "**LOW PRIORITY** - This project needs significant improvement before development.\n"
    
    return content

def generate_alternatives_json(project: Dict[str, Any], all_projects: Dict[str, Any]) -> str:
    """Generate alternatives.json content"""
    alternatives = []
    
    # Find similar projects based on category and keywords
    current_category = project.get('estimated_category', '')
    current_keywords = set(project.get('problem_statement', '').lower().split())
    
    for other_name, other_project in all_projects.items():
        if other_name == project.get('project_name', '').lower().replace(' ', '-'):
            continue
            
        # Check if similar category
        if other_project.get('estimated_category', '') == current_category:
            other_keywords = set(other_project.get('problem_statement', '').lower().split())
            # Simple similarity check
            if len(current_keywords.intersection(other_keywords)) > 2:
                alternatives.append({
                    'name': other_project['project_name'],
                    'path': f"../{other_name}/",
                    'similarity_reason': 'Similar problem domain and category',
                    'category': other_project.get('estimated_category', '')
                })
    
    # Limit to top 5 alternatives
    alternatives = alternatives[:5]
    
    return json.dumps({
        'project_name': project['project_name'],
        'alternatives': alternatives,
        'last_updated': '2024-01-01'
    }, indent=2)

def create_project_structure(projects: Dict[str, Any]):
    """Create the complete project structure"""
    base_path = "/home/sali/ai/projects/masterlist"
    
    # Create category directories
    category_projects = defaultdict(list)
    for project_name, project in projects.items():
        category = project.get('estimated_category', 'other')
        category_projects[category].append((project_name, project))
    
    for category, category_project_list in category_projects.items():
        category_path = f"{base_path}/{category}"
        ensure_directory(category_path)
        
        for project_name, project in category_project_list:
            project_path = f"{category_path}/{project_name}"
            ensure_directory(project_path)
            
            # Create main project README
            readme_content = generate_project_readme(project, project_name)
            with open(f"{project_path}/README.md", 'w', encoding='utf-8') as f:
                f.write(readme_content)
            
            # Create platforms directory
            platforms_path = f"{project_path}/platforms"
            ensure_directory(platforms_path)
            
            # Create platform-specific directories and files
            for platform_name, platform_data in project.get('platforms', {}).items():
                platform_path = f"{platforms_path}/{platform_name}"
                ensure_directory(platform_path)
                
                # Platform README
                platform_readme = generate_platform_readme(project, platform_name, platform_data)
                with open(f"{platform_path}/README.md", 'w', encoding='utf-8') as f:
                    f.write(platform_readme)
                
                # Platform features
                features_content = generate_platform_features(project, platform_name, platform_data)
                with open(f"{platform_path}/features.md", 'w', encoding='utf-8') as f:
                    f.write(features_content)
                
                # Platform technical notes
                technical_notes_content = generate_platform_technical_notes(project, platform_name, platform_data)
                with open(f"{platform_path}/technical-notes.md", 'w', encoding='utf-8') as f:
                    f.write(technical_notes_content)
                
                # Platform market fit
                market_fit_content = generate_platform_market_fit(project, platform_name, platform_data)
                with open(f"{platform_path}/market-fit.md", 'w', encoding='utf-8') as f:
                    f.write(market_fit_content)
            
            # Create market analysis
            market_analysis_content = generate_market_analysis(project)
            with open(f"{project_path}/market-analysis.md", 'w', encoding='utf-8') as f:
                f.write(market_analysis_content)
            
            # Create quality score file
            quality_score_content = generate_quality_score_file(project)
            with open(f"{project_path}/quality-score.md", 'w', encoding='utf-8') as f:
                f.write(quality_score_content)
            
            # Create alternatives.json
            alternatives_content = generate_alternatives_json(project, projects)
            with open(f"{project_path}/alternatives.json", 'w', encoding='utf-8') as f:
                f.write(alternatives_content)
    
    print(f"Created project structure for {len(projects)} projects across {len(category_projects)} categories")

def main():
    """Main function"""
    projects = load_consolidated_projects()
    create_project_structure(projects)
    print("Project structure creation complete!")

if __name__ == "__main__":
    main()