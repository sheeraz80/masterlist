#!/usr/bin/env python3
"""
Project Comparison Matrix Tool
Provides side-by-side comparison of 2-5 projects with detailed analysis
"""

import argparse
import json
import sys
import os
from typing import List, Dict, Any, Optional
from dataclasses import asdict

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.utils import (
    ProjectDataLoader, ProjectAnalyzer, ReportGenerator, 
    ProjectMetrics, calculate_similarity
)


class ProjectComparator:
    """Main class for comparing projects"""
    
    def __init__(self):
        self.data_loader = ProjectDataLoader()
        self.analyzer = ProjectAnalyzer(self.data_loader)
        self.report_generator = ReportGenerator(self.analyzer)
    
    def compare_projects(self, project_ids: List[str], 
                        detailed: bool = True, 
                        export_format: Optional[str] = None) -> Dict[str, Any]:
        """Compare multiple projects and generate comprehensive analysis"""
        
        if len(project_ids) < 2:
            raise ValueError("At least 2 projects are required for comparison")
        
        if len(project_ids) > 5:
            raise ValueError("Maximum 5 projects can be compared at once")
        
        # Validate all projects exist
        for project_id in project_ids:
            if not self.data_loader.get_project(project_id):
                raise ValueError(f"Project '{project_id}' not found")
        
        # Perform comparison
        comparison = self.analyzer.compare_projects(project_ids)
        
        # Add detailed analysis
        if detailed:
            comparison['detailed_analysis'] = self._generate_detailed_analysis(project_ids)
            comparison['pros_cons'] = self._generate_pros_cons_analysis(project_ids)
            comparison['recommendations'] = self._generate_recommendations(project_ids, comparison)
        
        # Add similarity analysis
        comparison['similarity_matrix'] = self._calculate_similarity_matrix(project_ids)
        
        # Export if requested
        if export_format:
            self._export_comparison(comparison, export_format)
        
        return comparison
    
    def _generate_detailed_analysis(self, project_ids: List[str]) -> Dict[str, Any]:
        """Generate detailed analysis for each project"""
        analysis = {}
        
        for project_id in project_ids:
            project = self.data_loader.get_project(project_id)
            metrics = self.analyzer.get_project_metrics(project_id)
            
            analysis[project_id] = {
                'overview': {
                    'name': project.get('project_name', project_id),
                    'category': project.get('category', 'unknown'),
                    'platform': project.get('platform', 'unknown'),
                    'description': project.get('solution_description', 'No description available')
                },
                'metrics_breakdown': {
                    'quality_score': {
                        'value': metrics.quality_score,
                        'interpretation': self._interpret_quality_score(metrics.quality_score)
                    },
                    'revenue_potential': {
                        'conservative': metrics.revenue_potential.get('conservative', 0),
                        'realistic': metrics.revenue_potential.get('realistic', 0),
                        'optimistic': metrics.revenue_potential.get('optimistic', 0),
                        'interpretation': self._interpret_revenue_potential(metrics.revenue_potential)
                    },
                    'technical_complexity': {
                        'value': metrics.technical_complexity,
                        'interpretation': self._interpret_technical_complexity(metrics.technical_complexity)
                    },
                    'development_time': {
                        'value': metrics.development_time,
                        'interpretation': self._interpret_development_time(metrics.development_time)
                    },
                    'market_opportunity': {
                        'value': metrics.market_opportunity,
                        'interpretation': self._interpret_market_opportunity(metrics.market_opportunity)
                    },
                    'risk_score': {
                        'value': metrics.risk_score,
                        'interpretation': self._interpret_risk_score(metrics.risk_score)
                    }
                },
                'target_users': project.get('target_users', 'Not specified'),
                'revenue_model': project.get('revenue_model', 'Not specified'),
                'competition_level': project.get('competition_level', 'Unknown'),
                'key_features': project.get('key_features', [])
            }
        
        return analysis
    
    def _generate_pros_cons_analysis(self, project_ids: List[str]) -> Dict[str, Any]:
        """Generate pros and cons for each project"""
        pros_cons = {}
        
        for project_id in project_ids:
            project = self.data_loader.get_project(project_id)
            metrics = self.analyzer.get_project_metrics(project_id)
            
            pros = []
            cons = []
            
            # Analyze quality score
            if metrics.quality_score >= 7:
                pros.append("High quality score indicating strong overall potential")
            elif metrics.quality_score < 4:
                cons.append("Low quality score indicates significant weaknesses")
            
            # Analyze revenue potential
            realistic_revenue = metrics.revenue_potential.get('realistic', 0)
            if realistic_revenue >= 5000:
                pros.append(f"Strong revenue potential (${realistic_revenue:,}/month)")
            elif realistic_revenue < 1000:
                cons.append(f"Limited revenue potential (${realistic_revenue:,}/month)")
            
            # Analyze technical complexity
            if metrics.technical_complexity <= 3:
                pros.append("Low technical complexity - easier to implement")
            elif metrics.technical_complexity >= 7:
                cons.append("High technical complexity - challenging to implement")
            
            # Analyze development time
            if metrics.development_time <= 7:
                pros.append("Quick development time - fast to market")
            elif metrics.development_time >= 21:
                cons.append("Long development time - slow to market")
            
            # Analyze market opportunity
            if metrics.market_opportunity >= 7:
                pros.append("Strong market opportunity with low competition")
            elif metrics.market_opportunity <= 3:
                cons.append("Limited market opportunity or high competition")
            
            # Analyze platform coverage
            if metrics.platform_coverage >= 3:
                pros.append("Multi-platform reach increases market potential")
            elif metrics.platform_coverage == 1:
                cons.append("Single platform limits market reach")
            
            # Analyze risk
            if metrics.risk_score <= 3:
                pros.append("Low risk profile")
            elif metrics.risk_score >= 7:
                cons.append("High risk profile")
            
            # Analyze competition
            competition = project.get('competition_level', 'Medium').lower()
            if competition == 'low':
                pros.append("Low competition provides market advantage")
            elif competition == 'high':
                cons.append("High competition makes market entry difficult")
            
            # Analyze completeness
            if metrics.completeness_score >= 9:
                pros.append("Well-documented and thoroughly analyzed")
            elif metrics.completeness_score <= 5:
                cons.append("Incomplete analysis - needs more research")
            
            pros_cons[project_id] = {
                'pros': pros,
                'cons': cons,
                'net_assessment': 'Positive' if len(pros) > len(cons) else 'Negative' if len(cons) > len(pros) else 'Neutral'
            }
        
        return pros_cons
    
    def _generate_recommendations(self, project_ids: List[str], comparison: Dict[str, Any]) -> Dict[str, Any]:
        """Generate recommendations based on comparison"""
        recommendations = {
            'overall_winner': None,
            'best_for_beginners': None,
            'best_revenue_potential': None,
            'quickest_to_market': None,
            'lowest_risk': None,
            'most_innovative': None,
            'detailed_recommendations': {}
        }
        
        # Find best overall project
        rankings = comparison.get('ranking', {}).get('overall', [])
        if rankings:
            recommendations['overall_winner'] = rankings[0]['project_id']
        
        # Find best for beginners (lowest complexity, shortest time)
        best_for_beginners = None
        best_beginner_score = float('inf')
        
        for project_id in project_ids:
            metrics = self.analyzer.get_project_metrics(project_id)
            beginner_score = metrics.technical_complexity + (metrics.development_time / 7)  # Normalize time to weeks
            if beginner_score < best_beginner_score:
                best_beginner_score = beginner_score
                best_for_beginners = project_id
        
        recommendations['best_for_beginners'] = best_for_beginners
        
        # Find best revenue potential
        best_revenue = None
        best_revenue_amount = 0
        
        for project_id in project_ids:
            metrics = self.analyzer.get_project_metrics(project_id)
            realistic_revenue = metrics.revenue_potential.get('realistic', 0)
            if realistic_revenue > best_revenue_amount:
                best_revenue_amount = realistic_revenue
                best_revenue = project_id
        
        recommendations['best_revenue_potential'] = best_revenue
        
        # Find quickest to market
        quickest_project = None
        shortest_time = float('inf')
        
        for project_id in project_ids:
            metrics = self.analyzer.get_project_metrics(project_id)
            if metrics.development_time < shortest_time:
                shortest_time = metrics.development_time
                quickest_project = project_id
        
        recommendations['quickest_to_market'] = quickest_project
        
        # Find lowest risk
        lowest_risk_project = None
        lowest_risk_score = float('inf')
        
        for project_id in project_ids:
            metrics = self.analyzer.get_project_metrics(project_id)
            if metrics.risk_score < lowest_risk_score:
                lowest_risk_score = metrics.risk_score
                lowest_risk_project = project_id
        
        recommendations['lowest_risk'] = lowest_risk_project
        
        # Find most innovative (highest platform coverage + market opportunity)
        most_innovative = None
        highest_innovation_score = 0
        
        for project_id in project_ids:
            metrics = self.analyzer.get_project_metrics(project_id)
            innovation_score = metrics.platform_coverage * 2 + metrics.market_opportunity
            if innovation_score > highest_innovation_score:
                highest_innovation_score = innovation_score
                most_innovative = project_id
        
        recommendations['most_innovative'] = most_innovative
        
        # Generate detailed recommendations for each project
        for project_id in project_ids:
            project = self.data_loader.get_project(project_id)
            metrics = self.analyzer.get_project_metrics(project_id)
            
            recommendation = {
                'priority': 'High' if project_id == recommendations['overall_winner'] else 'Medium',
                'reasoning': [],
                'suggested_next_steps': [],
                'risk_mitigation': []
            }
            
            # Add reasoning based on strengths
            if metrics.quality_score >= 7:
                recommendation['reasoning'].append("Strong overall quality metrics")
            
            if metrics.revenue_potential.get('realistic', 0) >= 3000:
                recommendation['reasoning'].append("Excellent revenue potential")
            
            if metrics.technical_complexity <= 4:
                recommendation['reasoning'].append("Manageable technical complexity")
            
            if metrics.development_time <= 10:
                recommendation['reasoning'].append("Quick time to market")
            
            # Add suggested next steps
            if metrics.completeness_score < 8:
                recommendation['suggested_next_steps'].append("Complete market research and analysis")
            
            if metrics.technical_complexity >= 6:
                recommendation['suggested_next_steps'].append("Create detailed technical specification")
                recommendation['suggested_next_steps'].append("Consider breaking into phases")
            
            if metrics.revenue_potential.get('realistic', 0) < 1000:
                recommendation['suggested_next_steps'].append("Reevaluate and improve monetization strategy")
            
            # Add risk mitigation
            if metrics.risk_score >= 6:
                recommendation['risk_mitigation'].append("Develop comprehensive risk mitigation plan")
            
            competition = project.get('competition_level', 'Medium').lower()
            if competition == 'high':
                recommendation['risk_mitigation'].append("Identify unique differentiators")
                recommendation['risk_mitigation'].append("Consider pivot or niche focus")
            
            if metrics.platform_coverage == 1:
                recommendation['risk_mitigation'].append("Plan multi-platform expansion")
            
            recommendations['detailed_recommendations'][project_id] = recommendation
        
        return recommendations
    
    def _calculate_similarity_matrix(self, project_ids: List[str]) -> Dict[str, Any]:
        """Calculate similarity matrix between all projects"""
        similarity_matrix = {}
        
        for i, project_id1 in enumerate(project_ids):
            similarity_matrix[project_id1] = {}
            project1 = self.data_loader.get_project(project_id1)
            
            for j, project_id2 in enumerate(project_ids):
                if i == j:
                    similarity_matrix[project_id1][project_id2] = 1.0
                else:
                    project2 = self.data_loader.get_project(project_id2)
                    similarity = calculate_similarity(project1, project2)
                    similarity_matrix[project_id1][project_id2] = similarity
        
        return similarity_matrix
    
    def _export_comparison(self, comparison: Dict[str, Any], export_format: str):
        """Export comparison results in various formats"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if export_format.lower() == 'json':
            filename = f"project_comparison_{timestamp}.json"
            self.report_generator.export_to_json(comparison, filename)
            print(f"Comparison exported to: {filename}")
        
        elif export_format.lower() == 'csv':
            # Convert to CSV-friendly format
            csv_data = []
            for project_id, project_data in comparison['projects'].items():
                metrics = project_data['metrics']
                csv_data.append({
                    'project_id': project_id,
                    'project_name': project_data['name'],
                    'category': project_data['category'],
                    'quality_score': metrics.quality_score,
                    'revenue_realistic': metrics.revenue_potential.get('realistic', 0),
                    'technical_complexity': metrics.technical_complexity,
                    'development_time': metrics.development_time,
                    'market_opportunity': metrics.market_opportunity,
                    'risk_score': metrics.risk_score,
                    'platform_coverage': metrics.platform_coverage
                })
            
            filename = f"project_comparison_{timestamp}.csv"
            self.report_generator.export_to_csv(csv_data, filename)
            print(f"Comparison exported to: {filename}")
        
        elif export_format.lower() == 'markdown':
            markdown_content = self._generate_markdown_report(comparison)
            filename = f"project_comparison_{timestamp}.md"
            self.report_generator.export_to_markdown(markdown_content, filename)
            print(f"Comparison exported to: {filename}")
    
    def _generate_markdown_report(self, comparison: Dict[str, Any]) -> str:
        """Generate markdown report from comparison data"""
        report = []
        
        # Title
        report.append("# Project Comparison Report")
        report.append(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Overview
        report.append("## Overview")
        projects = comparison['projects']
        report.append(f"Comparing {len(projects)} projects:")
        for project_id, project_data in projects.items():
            report.append(f"- **{project_data['name']}** ({project_data['category']})")
        report.append("")
        
        # Rankings
        if 'ranking' in comparison:
            report.append("## Overall Rankings")
            for i, ranking in enumerate(comparison['ranking']['overall'], 1):
                project_name = projects[ranking['project_id']]['name']
                report.append(f"{i}. **{project_name}** (Score: {ranking['score']:.3f})")
            report.append("")
        
        # Detailed Analysis
        if 'detailed_analysis' in comparison:
            report.append("## Detailed Analysis")
            for project_id, analysis in comparison['detailed_analysis'].items():
                report.append(f"### {analysis['overview']['name']}")
                report.append(f"**Category:** {analysis['overview']['category']}")
                report.append(f"**Platform:** {analysis['overview']['platform']}")
                report.append("")
                report.append(f"**Description:** {analysis['overview']['description']}")
                report.append("")
                
                # Metrics
                report.append("#### Key Metrics")
                metrics = analysis['metrics_breakdown']
                report.append(f"- Quality Score: {metrics['quality_score']['value']:.1f}/10")
                report.append(f"- Revenue Potential: ${metrics['revenue_potential']['realistic']:,}/month")
                report.append(f"- Technical Complexity: {metrics['technical_complexity']['value']:.1f}/10")
                report.append(f"- Development Time: {metrics['development_time']['value']:.1f} days")
                report.append(f"- Market Opportunity: {metrics['market_opportunity']['value']:.1f}/10")
                report.append(f"- Risk Score: {metrics['risk_score']['value']:.1f}/10")
                report.append("")
        
        # Pros and Cons
        if 'pros_cons' in comparison:
            report.append("## Pros and Cons Analysis")
            for project_id, pros_cons in comparison['pros_cons'].items():
                project_name = projects[project_id]['name']
                report.append(f"### {project_name}")
                
                report.append("#### Pros")
                for pro in pros_cons['pros']:
                    report.append(f"- {pro}")
                
                report.append("#### Cons")
                for con in pros_cons['cons']:
                    report.append(f"- {con}")
                
                report.append(f"**Net Assessment:** {pros_cons['net_assessment']}")
                report.append("")
        
        # Recommendations
        if 'recommendations' in comparison:
            report.append("## Recommendations")
            rec = comparison['recommendations']
            
            if rec['overall_winner']:
                winner_name = projects[rec['overall_winner']]['name']
                report.append(f"**Overall Winner:** {winner_name}")
            
            if rec['best_for_beginners']:
                beginner_name = projects[rec['best_for_beginners']]['name']
                report.append(f"**Best for Beginners:** {beginner_name}")
            
            if rec['best_revenue_potential']:
                revenue_name = projects[rec['best_revenue_potential']]['name']
                report.append(f"**Best Revenue Potential:** {revenue_name}")
            
            if rec['quickest_to_market']:
                quick_name = projects[rec['quickest_to_market']]['name']
                report.append(f"**Quickest to Market:** {quick_name}")
            
            if rec['lowest_risk']:
                risk_name = projects[rec['lowest_risk']]['name']
                report.append(f"**Lowest Risk:** {risk_name}")
            
            report.append("")
        
        return "\n".join(report)
    
    def display_comparison(self, comparison: Dict[str, Any]):
        """Display comparison results in console"""
        projects = comparison['projects']
        
        print("\n" + "="*80)
        print("PROJECT COMPARISON RESULTS")
        print("="*80)
        
        # Overview table
        print("\n📊 OVERVIEW")
        print("-" * 50)
        
        table_data = []
        headers = ["Project", "Category", "Quality", "Revenue", "Complexity", "Time", "Risk"]
        
        for project_id, project_data in projects.items():
            metrics = project_data['metrics']
            table_data.append([
                project_data['name'][:20],
                project_data['category'][:15],
                f"{metrics.quality_score:.1f}/10",
                f"${metrics.revenue_potential.get('realistic', 0):,}",
                f"{metrics.technical_complexity:.1f}/10",
                f"{metrics.development_time:.0f}d",
                f"{metrics.risk_score:.1f}/10"
            ])
        
        print(self.report_generator.generate_ascii_table(table_data, headers))
        
        # Rankings
        if 'ranking' in comparison:
            print("\n🏆 OVERALL RANKINGS")
            print("-" * 50)
            
            for i, ranking in enumerate(comparison['ranking']['overall'], 1):
                project_name = projects[ranking['project_id']]['name']
                print(f"{i}. {project_name} (Score: {ranking['score']:.3f})")
        
        # Pros and Cons
        if 'pros_cons' in comparison:
            print("\n⚖️  PROS AND CONS")
            print("-" * 50)
            
            for project_id, pros_cons in comparison['pros_cons'].items():
                project_name = projects[project_id]['name']
                print(f"\n{project_name}:")
                
                print("  ✅ Pros:")
                for pro in pros_cons['pros'][:3]:  # Show top 3
                    print(f"    • {pro}")
                
                print("  ❌ Cons:")
                for con in pros_cons['cons'][:3]:  # Show top 3
                    print(f"    • {con}")
                
                print(f"  📊 Net Assessment: {pros_cons['net_assessment']}")
        
        # Recommendations
        if 'recommendations' in comparison:
            print("\n💡 RECOMMENDATIONS")
            print("-" * 50)
            
            rec = comparison['recommendations']
            
            if rec['overall_winner']:
                winner_name = projects[rec['overall_winner']]['name']
                print(f"🥇 Overall Winner: {winner_name}")
            
            if rec['best_for_beginners']:
                beginner_name = projects[rec['best_for_beginners']]['name']
                print(f"🔰 Best for Beginners: {beginner_name}")
            
            if rec['best_revenue_potential']:
                revenue_name = projects[rec['best_revenue_potential']]['name']
                print(f"💰 Best Revenue Potential: {revenue_name}")
            
            if rec['quickest_to_market']:
                quick_name = projects[rec['quickest_to_market']]['name']
                print(f"⚡ Quickest to Market: {quick_name}")
            
            if rec['lowest_risk']:
                risk_name = projects[rec['lowest_risk']]['name']
                print(f"🛡️  Lowest Risk: {risk_name}")
        
        # Revenue comparison chart
        revenue_data = {}
        for project_id, project_data in projects.items():
            revenue_data[project_data['name'][:15]] = project_data['metrics'].revenue_potential.get('realistic', 0)
        
        print(self.report_generator.generate_ascii_bar_chart(
            revenue_data, 
            "💰 REVENUE POTENTIAL COMPARISON (Monthly)"
        ))
        
        print("\n" + "="*80)
    
    # Interpretation helper methods
    def _interpret_quality_score(self, score: float) -> str:
        if score >= 8: return "Excellent"
        elif score >= 6: return "Good"
        elif score >= 4: return "Average"
        else: return "Poor"
    
    def _interpret_revenue_potential(self, revenue: Dict[str, float]) -> str:
        realistic = revenue.get('realistic', 0)
        if realistic >= 10000: return "Very High"
        elif realistic >= 5000: return "High"
        elif realistic >= 2000: return "Moderate"
        elif realistic >= 500: return "Low"
        else: return "Very Low"
    
    def _interpret_technical_complexity(self, complexity: float) -> str:
        if complexity <= 2: return "Very Easy"
        elif complexity <= 4: return "Easy"
        elif complexity <= 6: return "Moderate"
        elif complexity <= 8: return "Hard"
        else: return "Very Hard"
    
    def _interpret_development_time(self, days: float) -> str:
        if days <= 3: return "Very Quick"
        elif days <= 7: return "Quick"
        elif days <= 14: return "Moderate"
        elif days <= 30: return "Long"
        else: return "Very Long"
    
    def _interpret_market_opportunity(self, score: float) -> str:
        if score >= 8: return "Excellent"
        elif score >= 6: return "Good"
        elif score >= 4: return "Average"
        else: return "Poor"
    
    def _interpret_risk_score(self, score: float) -> str:
        if score <= 2: return "Very Low"
        elif score <= 4: return "Low"
        elif score <= 6: return "Moderate"
        elif score <= 8: return "High"
        else: return "Very High"


def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(description="Compare multiple projects side-by-side")
    parser.add_argument("projects", nargs="+", help="Project IDs to compare (2-5 projects)")
    parser.add_argument("--detailed", action="store_true", help="Generate detailed analysis")
    parser.add_argument("--export", choices=["json", "csv", "markdown"], help="Export format")
    parser.add_argument("--list-projects", action="store_true", help="List all available projects")
    
    args = parser.parse_args()
    
    comparator = ProjectComparator()
    
    if args.list_projects:
        print("Available projects:")
        for project_id, project_data in comparator.data_loader.get_all_projects().items():
            print(f"  {project_id}: {project_data.get('project_name', 'Unknown')}")
        return
    
    try:
        # Perform comparison
        comparison = comparator.compare_projects(
            args.projects, 
            detailed=args.detailed,
            export_format=args.export
        )
        
        # Display results
        comparator.display_comparison(comparison)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()