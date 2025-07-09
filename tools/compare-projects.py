#!/usr/bin/env python3
"""
Project Comparison Matrix
Provides detailed side-by-side comparison of projects with visual charts and recommendations.
"""

import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any
import csv
from datetime import datetime

class ProjectComparator:
    def __init__(self, data_path: str = "projects.json"):
        """Initialize the project comparator."""
        self.data_path = Path(data_path)
        self.projects = self.load_projects()
        
    def load_projects(self) -> Dict[str, Any]:
        """Load projects from JSON file."""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: {self.data_path} not found")
            sys.exit(1)
            
    def find_project(self, project_name: str) -> Dict[str, Any]:
        """Find a project by name (case-insensitive)."""
        project_name_lower = project_name.lower()
        for project in self.projects:
            if project['name'].lower() == project_name_lower:
                return project
        return None
        
    def get_project_score(self, project: Dict[str, Any]) -> float:
        """Calculate overall project score."""
        quality = project.get('quality_score', 0)
        revenue = self.normalize_revenue(project.get('revenue_potential', {}).get('realistic', 0))
        complexity_penalty = (10 - project.get('technical_complexity', 5)) / 10
        return (quality * 0.4) + (revenue * 0.4) + (complexity_penalty * 0.2)
        
    def normalize_revenue(self, revenue: int) -> float:
        """Normalize revenue to 0-10 scale."""
        if revenue <= 1000:
            return 2
        elif revenue <= 5000:
            return 5
        elif revenue <= 10000:
            return 7
        elif revenue <= 20000:
            return 8.5
        else:
            return 10
            
    def create_comparison_table(self, projects: List[Dict[str, Any]]) -> str:
        """Create ASCII comparison table."""
        if not projects:
            return "No projects to compare"
            
        # Define comparison fields
        fields = [
            ('Name', 'name'),
            ('Category', 'category'),
            ('Quality Score', 'quality_score'),
            ('Revenue (Realistic)', lambda p: f"${p.get('revenue_potential', {}).get('realistic', 0):,}"),
            ('Development Time', lambda p: f"{p.get('development_time', 0)} days"),
            ('Technical Complexity', 'technical_complexity'),
            ('Competition Level', 'competition_level'),
            ('Overall Score', self.get_project_score)
        ]
        
        # Calculate column widths
        col_widths = []
        for field_name, _ in fields:
            max_width = len(field_name)
            for project in projects:
                value = self.get_field_value(project, field_name, fields)
                max_width = max(max_width, len(str(value)))
            col_widths.append(max_width + 2)
        
        # Create table
        table = []
        
        # Header
        header = "|"
        separator = "|"
        for i, (field_name, _) in enumerate(fields):
            header += f" {field_name:<{col_widths[i]-1}}|"
            separator += "-" * col_widths[i] + "|"
        
        table.append(header)
        table.append(separator)
        
        # Data rows
        for project in projects:
            row = "|"
            for i, (field_name, field_func) in enumerate(fields):
                value = self.get_field_value(project, field_name, fields)
                row += f" {str(value):<{col_widths[i]-1}}|"
            table.append(row)
            
        return "\n".join(table)
        
    def get_field_value(self, project: Dict[str, Any], field_name: str, fields: List) -> Any:
        """Get field value from project."""
        for fname, field_func in fields:
            if fname == field_name:
                if callable(field_func):
                    return field_func(project)
                else:
                    return project.get(field_func, 'N/A')
        return 'N/A'
        
    def create_pros_cons_analysis(self, projects: List[Dict[str, Any]]) -> str:
        """Create pros and cons analysis for each project."""
        analysis = []
        
        for project in projects:
            analysis.append(f"\n## {project['name']} - Pros & Cons Analysis")
            analysis.append("=" * 50)
            
            # Pros
            pros = []
            if project.get('quality_score', 0) >= 8:
                pros.append("High quality score - well-documented and viable")
            if project.get('revenue_potential', {}).get('realistic', 0) >= 5000:
                pros.append("Strong revenue potential")
            if project.get('technical_complexity', 10) <= 5:
                pros.append("Low technical complexity - easier to implement")
            if project.get('development_time', 30) <= 7:
                pros.append("Quick development time")
            if project.get('competition_level', '').lower() == 'low':
                pros.append("Low competition in market")
                
            # Cons
            cons = []
            if project.get('quality_score', 0) < 6:
                cons.append("Lower quality score - may need more research")
            if project.get('revenue_potential', {}).get('realistic', 0) < 2000:
                cons.append("Limited revenue potential")
            if project.get('technical_complexity', 0) >= 8:
                cons.append("High technical complexity")
            if project.get('development_time', 0) > 10:
                cons.append("Long development time required")
            if project.get('competition_level', '').lower() == 'high':
                cons.append("High competition in market")
                
            analysis.append("\n### Pros:")
            for pro in pros:
                analysis.append(f"✅ {pro}")
            if not pros:
                analysis.append("• No significant advantages identified")
                
            analysis.append("\n### Cons:")
            for con in cons:
                analysis.append(f"❌ {con}")
            if not cons:
                analysis.append("• No significant disadvantages identified")
                
        return "\n".join(analysis)
        
    def create_recommendation(self, projects: List[Dict[str, Any]]) -> str:
        """Create overall recommendation based on comparison."""
        if not projects:
            return "No projects to recommend"
            
        # Score projects
        scored_projects = []
        for project in projects:
            score = self.get_project_score(project)
            scored_projects.append((project, score))
            
        # Sort by score
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        
        recommendation = []
        recommendation.append("\n## Recommendation")
        recommendation.append("=" * 50)
        
        best_project = scored_projects[0][0]
        recommendation.append(f"\n🏆 **Recommended Project: {best_project['name']}**")
        recommendation.append(f"Overall Score: {scored_projects[0][1]:.2f}/10")
        
        # Reasoning
        recommendation.append("\n### Why this project:")
        reasons = []
        if best_project.get('quality_score', 0) >= 8:
            reasons.append(f"Excellent quality score ({best_project.get('quality_score', 0)}/10)")
        if best_project.get('revenue_potential', {}).get('realistic', 0) >= 5000:
            revenue = best_project.get('revenue_potential', {}).get('realistic', 0)
            reasons.append(f"Strong revenue potential (${revenue:,})")
        if best_project.get('technical_complexity', 10) <= 5:
            reasons.append(f"Manageable complexity ({best_project.get('technical_complexity', 0)}/10)")
        if best_project.get('development_time', 30) <= 7:
            reasons.append(f"Quick time to market ({best_project.get('development_time', 0)} days)")
            
        for reason in reasons:
            recommendation.append(f"• {reason}")
            
        # Alternative suggestions
        if len(scored_projects) > 1:
            recommendation.append(f"\n### Alternative: {scored_projects[1][0]['name']}")
            recommendation.append(f"Score: {scored_projects[1][1]:.2f}/10")
            
        return "\n".join(recommendation)
        
    def export_comparison(self, projects: List[Dict[str, Any]], format: str = "markdown") -> str:
        """Export comparison in specified format."""
        if format == "json":
            return self.export_json(projects)
        elif format == "csv":
            return self.export_csv(projects)
        else:
            return self.export_markdown(projects)
            
    def export_json(self, projects: List[Dict[str, Any]]) -> str:
        """Export comparison as JSON."""
        comparison_data = {
            "timestamp": datetime.now().isoformat(),
            "projects": projects,
            "comparison_summary": {
                "total_projects": len(projects),
                "recommended": projects[0]['name'] if projects else None,
                "scores": [self.get_project_score(p) for p in projects]
            }
        }
        return json.dumps(comparison_data, indent=2)
        
    def export_csv(self, projects: List[Dict[str, Any]]) -> str:
        """Export comparison as CSV."""
        if not projects:
            return "No projects to export"
            
        csv_data = []
        headers = ['Name', 'Category', 'Quality Score', 'Revenue (Realistic)', 
                  'Development Time', 'Technical Complexity', 'Competition Level', 'Overall Score']
        
        csv_data.append(headers)
        
        for project in projects:
            row = [
                project['name'],
                project.get('category', ''),
                project.get('quality_score', 0),
                project.get('revenue_potential', {}).get('realistic', 0),
                project.get('development_time', 0),
                project.get('technical_complexity', 0),
                project.get('competition_level', ''),
                f"{self.get_project_score(project):.2f}"
            ]
            csv_data.append(row)
            
        return "\n".join([",".join(map(str, row)) for row in csv_data])
        
    def export_markdown(self, projects: List[Dict[str, Any]]) -> str:
        """Export comparison as Markdown."""
        markdown = []
        markdown.append("# Project Comparison Report")
        markdown.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        markdown.append("")
        
        # Comparison table
        markdown.append("## Comparison Matrix")
        markdown.append(self.create_comparison_table(projects))
        
        # Pros and cons
        markdown.append(self.create_pros_cons_analysis(projects))
        
        # Recommendation
        markdown.append(self.create_recommendation(projects))
        
        return "\n".join(markdown)
        
    def compare_projects(self, project_names: List[str], export_format: str = "table") -> str:
        """Main comparison function."""
        projects = []
        not_found = []
        
        for name in project_names:
            project = self.find_project(name)
            if project:
                projects.append(project)
            else:
                not_found.append(name)
                
        if not_found:
            print(f"Warning: Projects not found: {', '.join(not_found)}")
            
        if not projects:
            return "No valid projects found for comparison"
            
        if export_format == "table":
            result = []
            result.append("# Project Comparison")
            result.append("=" * 50)
            result.append(self.create_comparison_table(projects))
            result.append(self.create_pros_cons_analysis(projects))
            result.append(self.create_recommendation(projects))
            return "\n".join(result)
        else:
            return self.export_comparison(projects, export_format)

def main():
    parser = argparse.ArgumentParser(description="Compare projects side by side")
    parser.add_argument("projects", nargs="+", help="Project names to compare")
    parser.add_argument("--format", choices=["table", "json", "csv", "markdown"], 
                       default="table", help="Output format")
    parser.add_argument("--output", "-o", help="Output file path")
    
    args = parser.parse_args()
    
    comparator = ProjectComparator()
    result = comparator.compare_projects(args.projects, args.format)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(result)
        print(f"Comparison saved to {args.output}")
    else:
        print(result)

if __name__ == "__main__":
    main()