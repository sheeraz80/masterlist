#!/usr/bin/env python3
"""
Comprehensive parser for masterlist.txt
Extracts all project data and structures it as JSON
"""

import re
import json
import difflib
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

@dataclass
class Project:
    """Data class for a project entry"""
    project_name: str = ""
    platform: str = ""
    problem_statement: str = ""
    solution_description: str = ""
    target_users: str = ""
    revenue_model: str = ""
    revenue_potential: str = ""
    development_time: str = ""
    competition_level: str = ""
    technical_complexity: str = ""
    key_features: List[str] = None
    monetization_details: str = ""
    risk_assessment: str = ""
    success_indicators: str = ""
    raw_text: str = ""
    line_numbers: tuple = (0, 0)
    
    def __post_init__(self):
        if self.key_features is None:
            self.key_features = []

def clean_text(text: str) -> str:
    """Clean up text by removing URLs and fixing formatting issues"""
    # Remove standalone URLs (like animaapp.com, xrilion.com)
    text = re.sub(r'\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b', '', text)
    
    # Remove extra whitespace and newlines
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Fix sentence fragments
    text = re.sub(r'\s*\.\s*([A-Z])', r'. \1', text)
    
    return text

def extract_revenue_info(text: str) -> Dict[str, str]:
    """Extract conservative, realistic, and optimistic revenue figures"""
    revenue_info = {"conservative": "", "realistic": "", "optimistic": ""}
    
    # Look for patterns like "Conservative: ~$800/month; Realistic: ~$3,000/month; Optimistic: ~$8,000/month"
    pattern = r'Conservative:\s*~?\$?([^;]+);?\s*Realistic:\s*~?\$?([^;]+);?\s*Optimistic:\s*~?\$?([^;.]+)'
    match = re.search(pattern, text, re.IGNORECASE)
    
    if match:
        revenue_info["conservative"] = match.group(1).strip()
        revenue_info["realistic"] = match.group(2).strip()
        revenue_info["optimistic"] = match.group(3).strip()
    
    return revenue_info

def parse_project(project_text: str, platform: str, start_line: int, end_line: int) -> Project:
    """Parse a single project entry"""
    project = Project()
    project.platform = platform
    project.raw_text = project_text
    project.line_numbers = (start_line, end_line)
    
    lines = project_text.split('\n')
    
    # Extract project name from first line
    if lines:
        match = re.match(r'PROJECT\s+\d+:\s*(.+)', lines[0])
        if match:
            project.project_name = match.group(1).strip()
    
    # Parse each field
    current_field = None
    current_content = []
    
    for line in lines[1:]:  # Skip the project name line
        line = line.strip()
        if not line:
            continue
            
        # Check for field headers
        if line.startswith('Problem:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'problem_statement'
            current_content = [line[8:].strip()]
        elif line.startswith('Solution:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'solution_description'
            current_content = [line[9:].strip()]
        elif line.startswith('Target Users:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'target_users'
            current_content = [line[13:].strip()]
        elif line.startswith('Revenue Model:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'revenue_model'
            current_content = [line[14:].strip()]
        elif line.startswith('Revenue Potential:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'revenue_potential'
            current_content = [line[18:].strip()]
        elif line.startswith('Development Time:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'development_time'
            current_content = [line[17:].strip()]
        elif line.startswith('Competition Level:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'competition_level'
            current_content = [line[18:].strip()]
        elif line.startswith('Technical Complexity:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'technical_complexity'
            current_content = [line[21:].strip()]
        elif line.startswith('Key Features:'):
            if current_field:
                setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'key_features'
            current_content = []
        elif line.startswith('Monetization Details:'):
            if current_field:
                if current_field == 'key_features':
                    project.key_features = [clean_text(f) for f in current_content if f.strip()]
                else:
                    setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'monetization_details'
            current_content = [line[21:].strip()]
        elif line.startswith('Risk Assessment:'):
            if current_field:
                if current_field == 'key_features':
                    project.key_features = [clean_text(f) for f in current_content if f.strip()]
                else:
                    setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'risk_assessment'
            current_content = [line[16:].strip()]
        elif line.startswith('Success Indicators:'):
            if current_field:
                if current_field == 'key_features':
                    project.key_features = [clean_text(f) for f in current_content if f.strip()]
                else:
                    setattr(project, current_field, clean_text('\n'.join(current_content)))
            current_field = 'success_indicators'
            current_content = [line[19:].strip()]
        else:
            # Continuation of current field
            if current_field:
                current_content.append(line)
    
    # Handle the last field
    if current_field:
        if current_field == 'key_features':
            project.key_features = [clean_text(f) for f in current_content if f.strip()]
        else:
            setattr(project, current_field, clean_text('\n'.join(current_content)))
    
    return project

def categorize_project(project: Project) -> str:
    """Categorize project based on name and description"""
    name_lower = project.project_name.lower()
    description_lower = (project.problem_statement + " " + project.solution_description).lower()
    
    # Design tools
    if any(term in name_lower or term in description_lower for term in 
           ['design', 'figma', 'ui', 'ux', 'component', 'layout', 'color', 'typography', 'brand']):
        return "design-tools"
    
    # Development tools
    if any(term in name_lower or term in description_lower for term in 
           ['code', 'developer', 'programming', 'api', 'debug', 'git', 'vscode']):
        return "development-tools"
    
    # Productivity
    if any(term in name_lower or term in description_lower for term in 
           ['productivity', 'workflow', 'automation', 'task', 'project management', 'organize']):
        return "productivity"
    
    # AI/ML
    if any(term in name_lower or term in description_lower for term in 
           ['ai', 'artificial intelligence', 'machine learning', 'ml', 'chatgpt', 'openai']):
        return "ai-ml"
    
    # Crypto/Blockchain
    if any(term in name_lower or term in description_lower for term in 
           ['crypto', 'blockchain', 'bitcoin', 'ethereum', 'defi', 'nft', 'web3']):
        return "crypto-blockchain"
    
    # Content/Writing
    if any(term in name_lower or term in description_lower for term in 
           ['content', 'writing', 'copy', 'text', 'documentation', 'note']):
        return "content-writing"
    
    # Browser/Web
    if any(term in name_lower or term in description_lower for term in 
           ['browser', 'web', 'chrome', 'extension', 'website']):
        return "browser-web"
    
    return "other"

def calculate_completeness_score(project: Project) -> int:
    """Calculate completeness score from 1-10 based on available information"""
    score = 0
    
    # Core fields (2 points each)
    core_fields = ['project_name', 'problem_statement', 'solution_description', 'target_users']
    for field in core_fields:
        if getattr(project, field, '').strip():
            score += 2
    
    # Important fields (1 point each)  
    important_fields = ['revenue_model', 'revenue_potential', 'development_time', 'competition_level']
    for field in important_fields:
        if getattr(project, field, '').strip():
            score += 1
    
    # Additional fields (0.5 points each, rounded)
    additional_fields = ['technical_complexity', 'monetization_details', 'risk_assessment', 'success_indicators']
    for field in additional_fields:
        if getattr(project, field, '').strip():
            score += 0.5
    
    # Key features
    if project.key_features and len(project.key_features) > 0:
        score += 1
    
    return min(10, int(score))

def find_duplicates(projects: List[Project]) -> List[Dict[str, Any]]:
    """Find potential duplicate projects by name similarity"""
    duplicates = []
    processed = set()
    
    for i, project1 in enumerate(projects):
        if i in processed:
            continue
            
        similar_projects = []
        for j, project2 in enumerate(projects[i+1:], i+1):
            if j in processed:
                continue
                
            # Calculate similarity ratio
            similarity = difflib.SequenceMatcher(None, 
                                               project1.project_name.lower(), 
                                               project2.project_name.lower()).ratio()
            
            if similarity > 0.6:  # 60% similarity threshold
                similar_projects.append({
                    "project": project2.project_name,
                    "platform": project2.platform,
                    "similarity": similarity,
                    "index": j
                })
                processed.add(j)
        
        if similar_projects:
            duplicates.append({
                "main_project": project1.project_name,
                "main_platform": project1.platform,
                "main_index": i,
                "similar_projects": similar_projects
            })
            processed.add(i)
    
    return duplicates

def parse_masterlist(file_path: str) -> Dict[str, Any]:
    """Parse the entire masterlist file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    projects = []
    current_platform = ""
    current_project = []
    project_start_line = 0
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        
        if line.startswith('PLATFORM:'):
            current_platform = line[9:].strip()
            continue
            
        if line.startswith('PROJECT ') and ':' in line:
            # Save previous project if exists
            if current_project:
                project_text = '\n'.join(current_project)
                project = parse_project(project_text, current_platform, project_start_line, line_num-1)
                projects.append(project)
            
            # Start new project
            current_project = [line]
            project_start_line = line_num
            
        elif current_project:
            current_project.append(line)
    
    # Don't forget the last project
    if current_project:
        project_text = '\n'.join(current_project)
        project = parse_project(project_text, current_platform, project_start_line, len(lines))
        projects.append(project)
    
    # Group projects by platform
    projects_by_platform = {}
    for project in projects:
        platform = project.platform
        if platform not in projects_by_platform:
            projects_by_platform[platform] = []
        projects_by_platform[platform].append(project)
    
    # Add analysis data
    for project in projects:
        project.estimated_category = categorize_project(project)
        project.completeness_score = calculate_completeness_score(project)
        
        # Extract revenue breakdown
        revenue_breakdown = extract_revenue_info(project.revenue_potential)
        project.revenue_breakdown = revenue_breakdown
        
        # Check for broken formatting
        broken_issues = []
        if 'animaapp.com' in project.raw_text or 'xrilion.com' in project.raw_text:
            broken_issues.append("Contains embedded URLs")
        if project.raw_text.count('\n') < 5:
            broken_issues.append("Very short entry")
        if not project.problem_statement.strip():
            broken_issues.append("Missing problem statement")
        if not project.solution_description.strip():
            broken_issues.append("Missing solution description")
        
        project.formatting_issues = broken_issues
    
    # Find duplicates
    duplicates = find_duplicates(projects)
    
    # Prepare summary statistics
    total_projects = len(projects)
    platforms = list(projects_by_platform.keys())
    avg_completeness = sum(p.completeness_score for p in projects) / total_projects if total_projects > 0 else 0
    
    categories = {}
    for project in projects:
        cat = project.estimated_category
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    return {
        "summary": {
            "total_projects": total_projects,
            "platforms": platforms,
            "platform_counts": {platform: len(projects_by_platform[platform]) for platform in platforms},
            "categories": categories,
            "average_completeness_score": round(avg_completeness, 2),
            "total_duplicates": len(duplicates)
        },
        "projects_by_platform": {
            platform: [
                {
                    **asdict(project),
                    "estimated_category": project.estimated_category,
                    "completeness_score": project.completeness_score,
                    "revenue_breakdown": project.revenue_breakdown,
                    "formatting_issues": project.formatting_issues
                }
                for project in projects_by_platform[platform]
            ]
            for platform in platforms
        },
        "potential_duplicates": duplicates
    }

if __name__ == "__main__":
    file_path = "/home/sali/ai/projects/masterlist/masterlist.txt"
    
    print("Parsing masterlist.txt...")
    results = parse_masterlist(file_path)
    
    print(f"Found {results['summary']['total_projects']} projects across {len(results['summary']['platforms'])} platforms")
    print(f"Average completeness score: {results['summary']['average_completeness_score']}/10")
    print(f"Potential duplicates: {results['summary']['total_duplicates']}")
    
    # Save results
    output_file = "/home/sali/ai/projects/masterlist/parsed_masterlist.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"Results saved to {output_file}")