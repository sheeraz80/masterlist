#!/usr/bin/env python3
"""
Comprehensive Analytics and Reporting System
Generates various reports and analytics for the Masterlist project
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import statistics
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from io import BytesIO
import base64

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from insights.ai_insights import AIInsightsEngine
from qa.quality_scorer import QualityScorer
from collaboration.feedback_system import FeedbackSystem
from collaboration.team_workspace import TeamWorkspace
from collaboration.project_sharing import ProjectSharingHub


class ReportGenerator:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.reports_dir = os.path.join(data_dir, "reports")
        
        # Create reports directory
        os.makedirs(self.reports_dir, exist_ok=True)
        
        # Load systems
        self.insights_engine = AIInsightsEngine(data_dir)
        self.quality_scorer = QualityScorer()
        self.feedback_system = FeedbackSystem(data_dir)
        self.team_workspace = TeamWorkspace(data_dir)
        self.sharing_hub = ProjectSharingHub(data_dir)
        
        # Load project data
        self.projects = self._load_projects()
        self.tags = self._load_tags()
    
    def _load_projects(self) -> Dict[str, Any]:
        """Load project data"""
        projects_file = "projects.json"
        if os.path.exists(projects_file):
            with open(projects_file, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict) and "projects" in data:
                    return data["projects"]
                return data
        return {}
    
    def _load_tags(self) -> Dict[str, List[str]]:
        """Load tag data"""
        tags_file = "project_tags.json"
        if os.path.exists(tags_file):
            with open(tags_file, 'r') as f:
                return json.load(f)
        return {}
    
    def generate_executive_summary(self) -> Dict[str, Any]:
        """Generate executive summary report"""
        print("Generating executive summary...")
        
        # Basic metrics
        total_projects = len(self.projects)
        total_tags = sum(len(tags) for tags in self.tags.values())
        unique_tags = len(set(tag for tags in self.tags.values() for tag in tags))
        
        # Quality metrics
        quality_scores = [p.get("quality_score", 0) for p in self.projects.values()]
        avg_quality = statistics.mean(quality_scores) if quality_scores else 0
        high_quality = sum(1 for score in quality_scores if score >= 8)
        
        # Category distribution
        categories = Counter(p.get("category", "other") for p in self.projects.values())
        
        # Platform distribution
        platforms = Counter()
        for project in self.projects.values():
            platforms.update(project.get("platforms", []))
        
        # Revenue potential
        revenue_tags = {
            "high-revenue": 0,
            "moderate-revenue": 0,
            "low-revenue": 0
        }
        for project_key, tags in self.tags.items():
            for rev_type in revenue_tags:
                if rev_type in tags:
                    revenue_tags[rev_type] += 1
        
        # Development timeline
        timeline_distribution = Counter()
        for project in self.projects.values():
            timeline = project.get("development_time", "Unknown")
            if "day" in timeline.lower():
                timeline_distribution["Quick (≤7 days)"] += 1
            elif "week" in timeline.lower():
                timeline_distribution["Short (1-4 weeks)"] += 1
            elif "month" in timeline.lower():
                timeline_distribution["Medium (1-3 months)"] += 1
            else:
                timeline_distribution["Long (3+ months)"] += 1
        
        # Collaboration metrics
        collab_stats = self.feedback_system.get_collaboration_stats()
        sharing_stats = self.sharing_hub.get_sharing_stats()
        
        summary = {
            "generated_at": datetime.now().isoformat(),
            "overview": {
                "total_projects": total_projects,
                "average_quality": round(avg_quality, 2),
                "high_quality_projects": high_quality,
                "total_tags": total_tags,
                "unique_tags": unique_tags
            },
            "categories": dict(categories.most_common()),
            "platforms": dict(platforms.most_common(10)),
            "revenue_distribution": revenue_tags,
            "timeline_distribution": dict(timeline_distribution),
            "collaboration": {
                "total_feedback": collab_stats["total_feedback"],
                "active_users": collab_stats["active_users"],
                "shared_projects": sharing_stats["total_shared_projects"],
                "total_forks": sharing_stats["total_forks"]
            },
            "top_insights": self._get_top_insights()
        }
        
        return summary
    
    def _get_top_insights(self) -> List[str]:
        """Get top insights from AI engine"""
        insights_file = os.path.join(self.data_dir, "ai_insights.json")
        if os.path.exists(insights_file):
            with open(insights_file, 'r') as f:
                insights = json.load(f)
            
            top_insights = []
            
            # Market opportunities
            if "market_opportunities" in insights and insights["market_opportunities"]:
                top_opp = insights["market_opportunities"][0]
                top_insights.append(f"Top opportunity: {top_opp.get('recommendation', '')}")
            
            # Trending tech
            if "trending_technologies" in insights and insights["trending_technologies"]:
                top_tech = insights["trending_technologies"][0]
                top_insights.append(f"Trending: {top_tech.get('technology', '')} technology")
            
            # Risk
            if "risk_assessment" in insights:
                risk_level = insights["risk_assessment"].get("risk_level", "Unknown")
                top_insights.append(f"Portfolio risk: {risk_level}")
            
            return top_insights[:5]
        
        return []
    
    def generate_quality_report(self) -> Dict[str, Any]:
        """Generate detailed quality analysis report"""
        print("Generating quality report...")
        
        quality_data = {
            "generated_at": datetime.now().isoformat(),
            "overall_metrics": {},
            "quality_distribution": {},
            "quality_by_category": {},
            "quality_by_platform": {},
            "quality_trends": {},
            "improvement_opportunities": []
        }
        
        # Overall metrics
        quality_scores = []
        for project_key, project in self.projects.items():
            score = project.get("quality_score", 0)
            quality_scores.append(score)
        
        if quality_scores:
            quality_data["overall_metrics"] = {
                "average": round(statistics.mean(quality_scores), 2),
                "median": round(statistics.median(quality_scores), 2),
                "std_dev": round(statistics.stdev(quality_scores), 2) if len(quality_scores) > 1 else 0,
                "min": min(quality_scores),
                "max": max(quality_scores)
            }
        
        # Quality distribution
        ranges = {
            "0-5": 0, "5-6": 0, "6-7": 0, 
            "7-8": 0, "8-9": 0, "9-10": 0
        }
        
        for score in quality_scores:
            if score < 5:
                ranges["0-5"] += 1
            elif score < 6:
                ranges["5-6"] += 1
            elif score < 7:
                ranges["6-7"] += 1
            elif score < 8:
                ranges["7-8"] += 1
            elif score < 9:
                ranges["8-9"] += 1
            else:
                ranges["9-10"] += 1
        
        quality_data["quality_distribution"] = ranges
        
        # Quality by category
        category_qualities = defaultdict(list)
        for project in self.projects.values():
            category = project.get("category", "other")
            score = project.get("quality_score", 0)
            category_qualities[category].append(score)
        
        quality_data["quality_by_category"] = {
            cat: {
                "average": round(statistics.mean(scores), 2),
                "count": len(scores),
                "high_quality": sum(1 for s in scores if s >= 8)
            }
            for cat, scores in category_qualities.items()
        }
        
        # Quality by platform
        platform_qualities = defaultdict(list)
        for project in self.projects.values():
            score = project.get("quality_score", 0)
            for platform in project.get("platforms", []):
                platform_qualities[platform].append(score)
        
        quality_data["quality_by_platform"] = {
            plat: {
                "average": round(statistics.mean(scores), 2),
                "count": len(scores)
            }
            for plat, scores in platform_qualities.items()
            if len(scores) >= 5  # Only platforms with enough data
        }
        
        # Identify improvement opportunities
        low_quality_projects = [
            {
                "key": key,
                "name": proj.get("name", "Unknown"),
                "score": proj.get("quality_score", 0),
                "category": proj.get("category", "other")
            }
            for key, proj in self.projects.items()
            if proj.get("quality_score", 0) < 6
        ]
        
        quality_data["improvement_opportunities"] = sorted(
            low_quality_projects, 
            key=lambda x: x["score"]
        )[:20]
        
        return quality_data
    
    def generate_trend_report(self, period_days: int = 30) -> Dict[str, Any]:
        """Generate trend analysis report"""
        print("Generating trend report...")
        
        # For this demo, we'll simulate trends since we don't have historical data
        # In a real implementation, you'd track changes over time
        
        trends = {
            "generated_at": datetime.now().isoformat(),
            "period": f"{period_days} days",
            "category_trends": self._analyze_category_trends(),
            "technology_trends": self._analyze_technology_trends(),
            "platform_trends": self._analyze_platform_trends(),
            "quality_trends": self._simulate_quality_trends(),
            "engagement_trends": self._analyze_engagement_trends()
        }
        
        return trends
    
    def _analyze_category_trends(self) -> Dict[str, Any]:
        """Analyze category trends"""
        category_counts = Counter(p.get("category", "other") for p in self.projects.values())
        
        # Identify growing categories (based on AI/ML tags as proxy)
        ai_categories = defaultdict(int)
        for project_key, project in self.projects.items():
            if "ai-powered" in self.tags.get(project_key, []):
                ai_categories[project["category"]] += 1
        
        return {
            "distribution": dict(category_counts),
            "emerging": dict(ai_categories.most_common(5)),
            "insights": [
                f"{cat} shows strong AI integration" 
                for cat, _ in ai_categories.most_common(3)
            ]
        }
    
    def _analyze_technology_trends(self) -> Dict[str, Any]:
        """Analyze technology trends"""
        tech_tags = ["ai-powered", "blockchain", "no-code", "automation", "real-time"]
        tech_counts = defaultdict(int)
        
        for project_key, tags in self.tags.items():
            for tech in tech_tags:
                if tech in tags:
                    tech_counts[tech] += 1
        
        return {
            "adoption": dict(tech_counts),
            "growth_areas": [tech for tech, count in tech_counts.items() if count > 10],
            "recommendations": [
                f"Consider {tech} integration" 
                for tech in tech_tags 
                if tech_counts[tech] < 5
            ]
        }
    
    def _analyze_platform_trends(self) -> Dict[str, Any]:
        """Analyze platform trends"""
        platform_counts = Counter()
        platform_quality = defaultdict(list)
        
        for project in self.projects.values():
            for platform in project.get("platforms", []):
                platform_counts[platform] += 1
                platform_quality[platform].append(project.get("quality_score", 0))
        
        # Calculate average quality per platform
        platform_avg_quality = {
            plat: round(statistics.mean(scores), 2)
            for plat, scores in platform_quality.items()
            if scores
        }
        
        return {
            "distribution": dict(platform_counts.most_common()),
            "quality_leaders": dict(sorted(
                platform_avg_quality.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]),
            "emerging_platforms": [
                plat for plat, count in platform_counts.items()
                if 0 < count < 5
            ]
        }
    
    def _simulate_quality_trends(self) -> Dict[str, Any]:
        """Simulate quality trends (in real app would use historical data)"""
        current_avg = statistics.mean([p.get("quality_score", 0) for p in self.projects.values()])
        
        return {
            "current_average": round(current_avg, 2),
            "trend": "improving",  # Simulated
            "projected_average": round(current_avg + 0.2, 2),  # Simulated projection
            "improvement_rate": "2.5%"  # Simulated
        }
    
    def _analyze_engagement_trends(self) -> Dict[str, Any]:
        """Analyze user engagement trends"""
        collab_stats = self.feedback_system.get_collaboration_stats()
        sharing_stats = self.sharing_hub.get_sharing_stats()
        
        return {
            "feedback_activity": {
                "total": collab_stats["total_feedback"],
                "by_type": collab_stats["feedback_by_type"],
                "trend": "increasing"  # Simulated
            },
            "sharing_activity": {
                "shared_projects": sharing_stats["total_shared_projects"],
                "forks": sharing_stats["total_forks"],
                "stars": sharing_stats["total_stars"]
            },
            "user_growth": {
                "active_users": collab_stats["active_users"],
                "trend": "steady"  # Simulated
            }
        }
    
    def generate_custom_report(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Generate custom filtered report"""
        print("Generating custom report...")
        
        # Apply filters
        filtered_projects = []
        for project_key, project in self.projects.items():
            # Category filter
            if filters.get("category") and project.get("category") != filters["category"]:
                continue
            
            # Platform filter
            if filters.get("platform"):
                if filters["platform"] not in project.get("platforms", []):
                    continue
            
            # Quality filter
            if filters.get("min_quality"):
                if project.get("quality_score", 0) < filters["min_quality"]:
                    continue
            
            # Tag filter
            if filters.get("tags"):
                project_tags = self.tags.get(project_key, [])
                if not any(tag in project_tags for tag in filters["tags"]):
                    continue
            
            filtered_projects.append({
                "key": project_key,
                "project": project,
                "tags": self.tags.get(project_key, [])
            })
        
        # Generate report
        report = {
            "generated_at": datetime.now().isoformat(),
            "filters": filters,
            "total_results": len(filtered_projects),
            "projects": filtered_projects[:100],  # Limit to 100
            "statistics": self._calculate_statistics(filtered_projects)
        }
        
        return report
    
    def _calculate_statistics(self, projects: List[Dict]) -> Dict[str, Any]:
        """Calculate statistics for a set of projects"""
        if not projects:
            return {}
        
        quality_scores = [p["project"].get("quality_score", 0) for p in projects]
        categories = Counter(p["project"].get("category", "other") for p in projects)
        
        all_tags = []
        for p in projects:
            all_tags.extend(p["tags"])
        tag_counts = Counter(all_tags)
        
        return {
            "average_quality": round(statistics.mean(quality_scores), 2) if quality_scores else 0,
            "quality_range": {
                "min": min(quality_scores) if quality_scores else 0,
                "max": max(quality_scores) if quality_scores else 0
            },
            "top_categories": dict(categories.most_common(5)),
            "top_tags": dict(tag_counts.most_common(10))
        }
    
    def export_report(self, report_type: str, report_data: Dict[str, Any], 
                     format: str = "json") -> str:
        """Export report to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{report_type}_report_{timestamp}.{format}"
        filepath = os.path.join(self.reports_dir, filename)
        
        if format == "json":
            with open(filepath, 'w') as f:
                json.dump(report_data, f, indent=2)
        
        elif format == "markdown":
            markdown_content = self._convert_to_markdown(report_type, report_data)
            with open(filepath, 'w') as f:
                f.write(markdown_content)
        
        elif format == "html":
            html_content = self._convert_to_html(report_type, report_data)
            with open(filepath, 'w') as f:
                f.write(html_content)
        
        print(f"Report exported to: {filepath}")
        return filepath
    
    def _convert_to_markdown(self, report_type: str, data: Dict[str, Any]) -> str:
        """Convert report data to markdown"""
        md = []
        md.append(f"# {report_type.replace('_', ' ').title()} Report")
        md.append(f"\nGenerated: {data.get('generated_at', 'Unknown')}\n")
        
        # Recursive function to format nested data
        def format_section(key: str, value: Any, level: int = 2):
            header = "#" * level
            if isinstance(value, dict):
                md.append(f"\n{header} {key.replace('_', ' ').title()}")
                for k, v in value.items():
                    format_section(k, v, level + 1)
            elif isinstance(value, list):
                md.append(f"\n{header} {key.replace('_', ' ').title()}")
                for item in value[:10]:  # Limit lists
                    if isinstance(item, dict):
                        md.append(f"- {item}")
                    else:
                        md.append(f"- {item}")
            else:
                md.append(f"**{key.replace('_', ' ').title()}**: {value}")
        
        for key, value in data.items():
            if key != "generated_at":
                format_section(key, value)
        
        return "\n".join(md)
    
    def _convert_to_html(self, report_type: str, data: Dict[str, Any]) -> str:
        """Convert report data to HTML"""
        html = []
        html.append("<!DOCTYPE html>")
        html.append("<html><head>")
        html.append(f"<title>{report_type.replace('_', ' ').title()} Report</title>")
        html.append("<style>")
        html.append("body { font-family: Arial, sans-serif; margin: 40px; }")
        html.append("table { border-collapse: collapse; width: 100%; margin: 20px 0; }")
        html.append("th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }")
        html.append("th { background-color: #f2f2f2; }")
        html.append(".metric { background-color: #e7f3ff; padding: 10px; margin: 10px 0; }")
        html.append("</style>")
        html.append("</head><body>")
        
        html.append(f"<h1>{report_type.replace('_', ' ').title()} Report</h1>")
        html.append(f"<p>Generated: {data.get('generated_at', 'Unknown')}</p>")
        
        # Format content
        for key, value in data.items():
            if key != "generated_at":
                html.append(f"<h2>{key.replace('_', ' ').title()}</h2>")
                if isinstance(value, dict):
                    html.append("<table>")
                    for k, v in value.items():
                        html.append(f"<tr><th>{k}</th><td>{v}</td></tr>")
                    html.append("</table>")
                elif isinstance(value, list):
                    html.append("<ul>")
                    for item in value[:20]:
                        html.append(f"<li>{item}</li>")
                    html.append("</ul>")
                else:
                    html.append(f"<div class='metric'>{value}</div>")
        
        html.append("</body></html>")
        return "\n".join(html)
    
    def create_visualization(self, data_type: str, data: Dict[str, Any]) -> str:
        """Create visualization and return as base64 encoded image"""
        plt.figure(figsize=(10, 6))
        
        if data_type == "quality_distribution":
            # Create quality distribution chart
            labels = list(data.keys())
            values = list(data.values())
            
            plt.bar(labels, values, color='skyblue', edgecolor='navy')
            plt.xlabel('Quality Score Range')
            plt.ylabel('Number of Projects')
            plt.title('Project Quality Distribution')
            
        elif data_type == "category_distribution":
            # Create category pie chart
            labels = list(data.keys())[:8]  # Top 8
            values = list(data.values())[:8]
            
            plt.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
            plt.title('Project Distribution by Category')
            
        elif data_type == "platform_trends":
            # Create platform bar chart
            labels = list(data.keys())[:10]
            values = list(data.values())[:10]
            
            plt.barh(labels, values, color='lightgreen', edgecolor='darkgreen')
            plt.xlabel('Number of Projects')
            plt.title('Top Platforms by Project Count')
        
        # Save to base64
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return f"data:image/png;base64,{image_base64}"


def main():
    """CLI for report generation"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate analytics reports')
    parser.add_argument('report_type', choices=['executive', 'quality', 'trends', 
                                               'custom', 'all'])
    parser.add_argument('--format', choices=['json', 'markdown', 'html'], 
                       default='json', help='Output format')
    parser.add_argument('--category', help='Filter by category (for custom reports)')
    parser.add_argument('--platform', help='Filter by platform')
    parser.add_argument('--min-quality', type=float, help='Minimum quality score')
    parser.add_argument('--tags', nargs='+', help='Filter by tags')
    parser.add_argument('--period', type=int, default=30, help='Period in days for trends')
    
    args = parser.parse_args()
    
    generator = ReportGenerator()
    
    if args.report_type == 'executive':
        report = generator.generate_executive_summary()
        generator.export_report('executive_summary', report, args.format)
        
    elif args.report_type == 'quality':
        report = generator.generate_quality_report()
        generator.export_report('quality_analysis', report, args.format)
        
    elif args.report_type == 'trends':
        report = generator.generate_trend_report(args.period)
        generator.export_report('trend_analysis', report, args.format)
        
    elif args.report_type == 'custom':
        filters = {}
        if args.category:
            filters['category'] = args.category
        if args.platform:
            filters['platform'] = args.platform
        if args.min_quality:
            filters['min_quality'] = args.min_quality
        if args.tags:
            filters['tags'] = args.tags
            
        report = generator.generate_custom_report(filters)
        generator.export_report('custom_report', report, args.format)
        
    elif args.report_type == 'all':
        # Generate all reports
        reports = {
            'executive': generator.generate_executive_summary(),
            'quality': generator.generate_quality_report(),
            'trends': generator.generate_trend_report(args.period)
        }
        
        for report_name, report_data in reports.items():
            generator.export_report(report_name, report_data, args.format)
    
    print("\n✅ Report generation complete!")


if __name__ == "__main__":
    main()