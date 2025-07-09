#!/usr/bin/env python3
"""
Market Analyzer - Business Intelligence and Market Analysis Tools
Provides comprehensive market analysis, trend identification, and business intelligence.
"""

import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple
import statistics
from datetime import datetime
import collections
import re

class MarketAnalyzer:
    def __init__(self, data_path: str = "projects.json"):
        """Initialize the market analyzer."""
        self.data_path = Path(data_path)
        self.projects = self.load_projects()
        
    def load_projects(self) -> List[Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: {self.data_path} not found")
            sys.exit(1)
            
    def analyze_market_trends(self) -> Dict[str, Any]:
        """Analyze market trends across categories and platforms."""
        trends = {
            'category_analysis': {},
            'platform_analysis': {},
            'revenue_trends': {},
            'complexity_trends': {},
            'growth_opportunities': [],
            'market_saturation': {}
        }
        
        # Category analysis
        category_metrics = {}
        for project in self.projects:
            category = project.get('category', 'other')
            if category not in category_metrics:
                category_metrics[category] = {
                    'count': 0,
                    'total_revenue': 0,
                    'avg_complexity': 0,
                    'avg_quality': 0,
                    'platforms': set()
                }
            
            metrics = category_metrics[category]
            metrics['count'] += 1
            metrics['total_revenue'] += project.get('revenue_potential', {}).get('realistic', 0)
            metrics['avg_complexity'] += project.get('technical_complexity', 5)
            metrics['avg_quality'] += project.get('quality_score', 5)
            metrics['platforms'].update(project.get('platforms', []))
            
        # Calculate averages and insights
        for category, metrics in category_metrics.items():
            count = metrics['count']
            trends['category_analysis'][category] = {
                'project_count': count,
                'avg_revenue': metrics['total_revenue'] / count if count > 0 else 0,
                'avg_complexity': metrics['avg_complexity'] / count if count > 0 else 0,
                'avg_quality': metrics['avg_quality'] / count if count > 0 else 0,
                'platform_diversity': len(metrics['platforms']),
                'market_opportunity': self.calculate_market_opportunity(metrics, count)
            }
            
        # Platform analysis
        platform_metrics = {}
        for project in self.projects:
            for platform in project.get('platforms', []):
                if platform not in platform_metrics:
                    platform_metrics[platform] = {
                        'count': 0,
                        'total_revenue': 0,
                        'categories': set()
                    }
                
                metrics = platform_metrics[platform]
                metrics['count'] += 1
                metrics['total_revenue'] += project.get('revenue_potential', {}).get('realistic', 0)
                metrics['categories'].add(project.get('category', 'other'))
                
        for platform, metrics in platform_metrics.items():
            count = metrics['count']
            trends['platform_analysis'][platform] = {
                'project_count': count,
                'avg_revenue': metrics['total_revenue'] / count if count > 0 else 0,
                'category_diversity': len(metrics['categories']),
                'market_penetration': self.calculate_market_penetration(platform, count)
            }
            
        # Revenue trends
        revenue_ranges = {
            'low': (0, 2000),
            'medium': (2000, 10000),
            'high': (10000, 50000),
            'premium': (50000, float('inf'))
        }
        
        for range_name, (min_rev, max_rev) in revenue_ranges.items():
            projects_in_range = [
                p for p in self.projects 
                if min_rev <= p.get('revenue_potential', {}).get('realistic', 0) < max_rev
            ]
            
            trends['revenue_trends'][range_name] = {
                'count': len(projects_in_range),
                'percentage': len(projects_in_range) / len(self.projects) * 100,
                'avg_complexity': statistics.mean([
                    p.get('technical_complexity', 5) for p in projects_in_range
                ]) if projects_in_range else 0,
                'top_categories': self.get_top_categories(projects_in_range, 3)
            }
            
        return trends
        
    def calculate_market_opportunity(self, metrics: Dict[str, Any], count: int) -> str:
        """Calculate market opportunity score."""
        avg_revenue = metrics['total_revenue'] / count if count > 0 else 0
        platform_diversity = len(metrics['platforms'])
        
        if avg_revenue > 20000 and platform_diversity > 5:
            return "Very High"
        elif avg_revenue > 10000 and platform_diversity > 3:
            return "High"
        elif avg_revenue > 5000 and platform_diversity > 2:
            return "Medium"
        else:
            return "Low"
            
    def calculate_market_penetration(self, platform: str, count: int) -> str:
        """Calculate market penetration level."""
        total_projects = len(self.projects)
        penetration = count / total_projects * 100
        
        if penetration > 15:
            return "High"
        elif penetration > 10:
            return "Medium"
        elif penetration > 5:
            return "Low"
        else:
            return "Very Low"
            
    def get_top_categories(self, projects: List[Dict[str, Any]], limit: int) -> List[str]:
        """Get top categories from a list of projects."""
        category_counts = collections.Counter(p.get('category', 'other') for p in projects)
        return [cat for cat, _ in category_counts.most_common(limit)]
        
    def identify_market_gaps(self) -> Dict[str, Any]:
        """Identify underserved market segments and opportunities."""
        gaps = {
            'underserved_categories': [],
            'platform_gaps': [],
            'revenue_gaps': [],
            'complexity_gaps': [],
            'recommendations': []
        }
        
        # Analyze category distribution
        category_counts = collections.Counter(p.get('category', 'other') for p in self.projects)
        total_projects = len(self.projects)
        avg_projects_per_category = total_projects / len(category_counts)
        
        for category, count in category_counts.items():
            if count < avg_projects_per_category * 0.7:  # 30% below average
                avg_revenue = statistics.mean([
                    p.get('revenue_potential', {}).get('realistic', 0) 
                    for p in self.projects if p.get('category') == category
                ])
                
                gaps['underserved_categories'].append({
                    'category': category,
                    'project_count': count,
                    'avg_revenue': avg_revenue,
                    'opportunity_score': self.calculate_opportunity_score(count, avg_revenue)
                })
                
        # Platform gap analysis
        platform_counts = collections.Counter()
        for project in self.projects:
            for platform in project.get('platforms', []):
                platform_counts[platform] += 1
                
        avg_projects_per_platform = sum(platform_counts.values()) / len(platform_counts)
        
        for platform, count in platform_counts.items():
            if count < avg_projects_per_platform * 0.6:  # 40% below average
                gaps['platform_gaps'].append({
                    'platform': platform,
                    'project_count': count,
                    'growth_potential': self.calculate_platform_growth_potential(platform)
                })
                
        # Revenue gap analysis
        high_revenue_projects = [
            p for p in self.projects 
            if p.get('revenue_potential', {}).get('realistic', 0) > 20000
        ]
        
        if len(high_revenue_projects) < total_projects * 0.2:  # Less than 20% high revenue
            gaps['revenue_gaps'].append({
                'issue': 'Low percentage of high-revenue projects',
                'current_percentage': len(high_revenue_projects) / total_projects * 100,
                'recommendation': 'Focus on enterprise and B2B solutions'
            })
            
        return gaps
        
    def calculate_opportunity_score(self, project_count: int, avg_revenue: float) -> float:
        """Calculate opportunity score for underserved categories."""
        # Lower project count = higher opportunity
        count_score = max(0, 10 - project_count * 0.5)
        
        # Higher revenue = higher opportunity
        revenue_score = min(10, avg_revenue / 5000)
        
        return (count_score + revenue_score) / 2
        
    def calculate_platform_growth_potential(self, platform: str) -> str:
        """Calculate growth potential for platforms."""
        # Platform growth potential based on market trends
        high_growth_platforms = [
            'android-app', 'ios-app', 'web-app', 'saas-platform',
            'shopify-app', 'wordpress-plugin', 'slack-bot', 'discord-bot'
        ]
        
        medium_growth_platforms = [
            'chrome-extension', 'vscode-extension', 'figma-plugin',
            'desktop-app', 'electron-app'
        ]
        
        if platform in high_growth_platforms:
            return "High"
        elif platform in medium_growth_platforms:
            return "Medium"
        else:
            return "Low"
            
    def competitive_landscape_analysis(self) -> Dict[str, Any]:
        """Analyze competitive landscape across categories and platforms."""
        landscape = {
            'competition_by_category': {},
            'competition_by_platform': {},
            'blue_ocean_opportunities': [],
            'red_ocean_warnings': []
        }
        
        # Category competition analysis
        for project in self.projects:
            category = project.get('category', 'other')
            competition = project.get('competition_level', 'medium').lower()
            
            if category not in landscape['competition_by_category']:
                landscape['competition_by_category'][category] = {
                    'low': 0, 'medium': 0, 'high': 0
                }
                
            if competition in landscape['competition_by_category'][category]:
                landscape['competition_by_category'][category][competition] += 1
                
        # Platform competition analysis
        platform_competition = {}
        for project in self.projects:
            for platform in project.get('platforms', []):
                if platform not in platform_competition:
                    platform_competition[platform] = {'low': 0, 'medium': 0, 'high': 0}
                    
                competition = project.get('competition_level', 'medium').lower()
                if competition in platform_competition[platform]:
                    platform_competition[platform][competition] += 1
                    
        landscape['competition_by_platform'] = platform_competition
        
        # Blue ocean opportunities (low competition, high revenue)
        for project in self.projects:
            competition = project.get('competition_level', 'medium').lower()
            revenue = project.get('revenue_potential', {}).get('realistic', 0)
            
            if competition == 'low' and revenue > 10000:
                landscape['blue_ocean_opportunities'].append({
                    'project': project['name'],
                    'category': project.get('category', 'other'),
                    'revenue': revenue,
                    'platforms': project.get('platforms', [])
                })
                
        # Red ocean warnings (high competition, saturated markets)
        category_high_competition = {}
        for project in self.projects:
            if project.get('competition_level', 'medium').lower() == 'high':
                category = project.get('category', 'other')
                category_high_competition[category] = category_high_competition.get(category, 0) + 1
                
        for category, count in category_high_competition.items():
            if count > 10:  # More than 10 high-competition projects
                landscape['red_ocean_warnings'].append({
                    'category': category,
                    'high_competition_projects': count,
                    'recommendation': 'Consider differentiation or niche targeting'
                })
                
        return landscape
        
    def roi_analysis(self) -> Dict[str, Any]:
        """Analyze return on investment across projects."""
        roi_data = {
            'roi_by_category': {},
            'roi_by_platform': {},
            'top_roi_projects': [],
            'roi_distribution': {},
            'investment_recommendations': []
        }
        
        # Calculate ROI for each project
        projects_with_roi = []
        for project in self.projects:
            revenue = project.get('revenue_potential', {}).get('realistic', 0)
            dev_time = project.get('development_time', 7)
            complexity = project.get('technical_complexity', 5)
            
            # Estimate development cost
            daily_rate = 500
            development_cost = dev_time * daily_rate
            
            # Calculate ROI
            roi = (revenue - development_cost) / development_cost if development_cost > 0 else 0
            
            projects_with_roi.append({
                'project': project,
                'roi': roi,
                'revenue': revenue,
                'cost': development_cost
            })
            
        # Sort by ROI
        projects_with_roi.sort(key=lambda x: x['roi'], reverse=True)
        
        # Top ROI projects
        roi_data['top_roi_projects'] = [
            {
                'name': p['project']['name'],
                'category': p['project'].get('category', 'other'),
                'roi': p['roi'],
                'revenue': p['revenue'],
                'cost': p['cost']
            }
            for p in projects_with_roi[:20]
        ]
        
        # ROI by category
        category_roi = {}
        for item in projects_with_roi:
            category = item['project'].get('category', 'other')
            if category not in category_roi:
                category_roi[category] = []
            category_roi[category].append(item['roi'])
            
        for category, rois in category_roi.items():
            roi_data['roi_by_category'][category] = {
                'avg_roi': statistics.mean(rois),
                'median_roi': statistics.median(rois),
                'project_count': len(rois)
            }
            
        return roi_data
        
    def generate_insights_report(self) -> str:
        """Generate comprehensive insights report."""
        report = []
        report.append("# Market Analysis & Business Intelligence Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Total Projects Analyzed: {len(self.projects)}")
        report.append("")
        
        # Market trends
        trends = self.analyze_market_trends()
        report.append("## Market Trends Analysis")
        report.append("")
        
        # Top categories by revenue
        top_categories = sorted(
            trends['category_analysis'].items(),
            key=lambda x: x[1]['avg_revenue'],
            reverse=True
        )[:5]
        
        report.append("### Top Categories by Average Revenue:")
        for i, (category, data) in enumerate(top_categories, 1):
            report.append(f"{i}. **{category.replace('-', ' ').title()}**: ${data['avg_revenue']:,.0f}")
            report.append(f"   - Projects: {data['project_count']}")
            report.append(f"   - Platform Diversity: {data['platform_diversity']}")
            report.append(f"   - Market Opportunity: {data['market_opportunity']}")
            report.append("")
            
        # Platform analysis
        report.append("### Platform Performance:")
        top_platforms = sorted(
            trends['platform_analysis'].items(),
            key=lambda x: x[1]['avg_revenue'],
            reverse=True
        )[:10]
        
        for platform, data in top_platforms:
            report.append(f"- **{platform}**: ${data['avg_revenue']:,.0f} avg revenue ({data['project_count']} projects)")
            
        report.append("")
        
        # Market gaps
        gaps = self.identify_market_gaps()
        report.append("## Market Opportunities")
        report.append("")
        
        if gaps['underserved_categories']:
            report.append("### Underserved Categories:")
            for gap in gaps['underserved_categories'][:5]:
                report.append(f"- **{gap['category']}**: {gap['project_count']} projects, "
                            f"${gap['avg_revenue']:,.0f} avg revenue "
                            f"(Opportunity Score: {gap['opportunity_score']:.1f}/10)")
                            
        report.append("")
        
        # Competitive landscape
        landscape = self.competitive_landscape_analysis()
        report.append("## Competitive Landscape")
        report.append("")
        
        if landscape['blue_ocean_opportunities']:
            report.append("### Blue Ocean Opportunities (Low Competition, High Revenue):")
            for opp in landscape['blue_ocean_opportunities'][:10]:
                report.append(f"- **{opp['project']}** ({opp['category']}): ${opp['revenue']:,}")
                
        report.append("")
        
        # ROI analysis
        roi_data = self.roi_analysis()
        report.append("## ROI Analysis")
        report.append("")
        
        report.append("### Top ROI Projects:")
        for project in roi_data['top_roi_projects'][:10]:
            report.append(f"- **{project['name']}**: {project['roi']:.1f}x ROI "
                        f"(${project['revenue']:,} revenue, ${project['cost']:,} cost)")
                        
        report.append("")
        
        # Investment recommendations
        report.append("## Investment Recommendations")
        report.append("")
        
        high_roi_categories = sorted(
            roi_data['roi_by_category'].items(),
            key=lambda x: x[1]['avg_roi'],
            reverse=True
        )[:5]
        
        report.append("### Recommended Categories for Investment:")
        for category, data in high_roi_categories:
            report.append(f"- **{category.replace('-', ' ').title()}**: "
                        f"{data['avg_roi']:.1f}x average ROI "
                        f"({data['project_count']} projects)")
                        
        return "\n".join(report)

def main():
    parser = argparse.ArgumentParser(description="Market analysis and business intelligence")
    parser.add_argument("--trends", "-t", action="store_true", help="Analyze market trends")
    parser.add_argument("--gaps", "-g", action="store_true", help="Identify market gaps")
    parser.add_argument("--competition", "-c", action="store_true", help="Analyze competitive landscape")
    parser.add_argument("--roi", "-r", action="store_true", help="Analyze ROI across projects")
    parser.add_argument("--report", action="store_true", help="Generate comprehensive insights report")
    parser.add_argument("--category", help="Filter analysis by category")
    parser.add_argument("--platform", help="Filter analysis by platform")
    parser.add_argument("--export", help="Export results to file")
    
    args = parser.parse_args()
    
    analyzer = MarketAnalyzer()
    
    if args.report:
        report = analyzer.generate_insights_report()
        if args.export:
            with open(args.export, 'w') as f:
                f.write(report)
            print(f"Report exported to {args.export}")
        else:
            print(report)
        return
        
    if args.trends:
        print("📈 Market Trends Analysis")
        print("=" * 50)
        trends = analyzer.analyze_market_trends()
        
        print("\nTop Categories by Revenue:")
        top_categories = sorted(
            trends['category_analysis'].items(),
            key=lambda x: x[1]['avg_revenue'],
            reverse=True
        )[:10]
        
        for category, data in top_categories:
            print(f"  {category}: ${data['avg_revenue']:,.0f} avg ({data['project_count']} projects)")
            
        print("\nTop Platforms by Revenue:")
        top_platforms = sorted(
            trends['platform_analysis'].items(),
            key=lambda x: x[1]['avg_revenue'],
            reverse=True
        )[:10]
        
        for platform, data in top_platforms:
            print(f"  {platform}: ${data['avg_revenue']:,.0f} avg ({data['project_count']} projects)")
            
    if args.gaps:
        print("\n🔍 Market Gap Analysis")
        print("=" * 50)
        gaps = analyzer.identify_market_gaps()
        
        print("\nUnderserved Categories:")
        for gap in gaps['underserved_categories'][:10]:
            print(f"  {gap['category']}: {gap['project_count']} projects "
                  f"(${gap['avg_revenue']:,.0f} avg revenue)")
                  
        print("\nPlatform Gaps:")
        for gap in gaps['platform_gaps'][:10]:
            print(f"  {gap['platform']}: {gap['project_count']} projects "
                  f"({gap['growth_potential']} growth potential)")
                  
    if args.competition:
        print("\n⚔️ Competitive Landscape")
        print("=" * 50)
        landscape = analyzer.competitive_landscape_analysis()
        
        print("\nBlue Ocean Opportunities:")
        for opp in landscape['blue_ocean_opportunities'][:10]:
            print(f"  {opp['project']}: ${opp['revenue']:,} ({opp['category']})")
            
        print("\nRed Ocean Warnings:")
        for warning in landscape['red_ocean_warnings']:
            print(f"  {warning['category']}: {warning['high_competition_projects']} high-competition projects")
            
    if args.roi:
        print("\n💰 ROI Analysis")
        print("=" * 50)
        roi_data = analyzer.roi_analysis()
        
        print("\nTop ROI Projects:")
        for project in roi_data['top_roi_projects'][:10]:
            print(f"  {project['name']}: {project['roi']:.1f}x ROI "
                  f"(${project['revenue']:,} revenue)")
                  
        print("\nROI by Category:")
        top_roi_categories = sorted(
            roi_data['roi_by_category'].items(),
            key=lambda x: x[1]['avg_roi'],
            reverse=True
        )[:10]
        
        for category, data in top_roi_categories:
            print(f"  {category}: {data['avg_roi']:.1f}x average ROI "
                  f"({data['project_count']} projects)")

if __name__ == "__main__":
    main()