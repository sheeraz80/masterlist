#!/usr/bin/env python3
"""
Real-time Dashboard Analytics System
Provides live analytics and metrics for the web dashboard
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import statistics
from collections import defaultdict, Counter
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class DashboardAnalytics:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.cache = {}
        self.cache_expiry = {}
        self.cache_duration = 300  # 5 minutes
        
        # Load data
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
    
    def _get_cached_or_compute(self, key: str, compute_func, *args, **kwargs):
        """Get cached result or compute new one"""
        now = time.time()
        
        # Check if cached and not expired
        if key in self.cache and key in self.cache_expiry:
            if now < self.cache_expiry[key]:
                return self.cache[key]
        
        # Compute new result
        result = compute_func(*args, **kwargs)
        
        # Cache it
        self.cache[key] = result
        self.cache_expiry[key] = now + self.cache_duration
        
        return result
    
    def get_overview_metrics(self) -> Dict[str, Any]:
        """Get overview metrics for main dashboard"""
        return self._get_cached_or_compute("overview_metrics", self._compute_overview_metrics)
    
    def _compute_overview_metrics(self) -> Dict[str, Any]:
        """Compute overview metrics"""
        total_projects = len(self.projects)
        
        # Quality metrics
        quality_scores = [p.get("quality_score", 0) for p in self.projects.values()]
        avg_quality = statistics.mean(quality_scores) if quality_scores else 0
        
        # Tag metrics
        total_tags = sum(len(tags) for tags in self.tags.values())
        unique_tags = len(set(tag for tags in self.tags.values() for tag in tags))
        
        # Category count
        categories = set(p.get("category", "other") for p in self.projects.values())
        
        # Platform count
        platforms = set()
        for project in self.projects.values():
            platforms.update(project.get("platforms", []))
        
        # High quality projects
        high_quality = sum(1 for score in quality_scores if score >= 8)
        
        # Quick wins
        quick_wins = sum(
            1 for key, tags in self.tags.items()
            if "quick-win" in tags
        )
        
        return {
            "total_projects": total_projects,
            "average_quality": round(avg_quality, 2),
            "high_quality_count": high_quality,
            "total_tags": total_tags,
            "unique_tags": unique_tags,
            "category_count": len(categories),
            "platform_count": len(platforms),
            "quick_wins": quick_wins,
            "last_updated": datetime.now().isoformat()
        }
    
    def get_category_analytics(self) -> Dict[str, Any]:
        """Get detailed category analytics"""
        return self._get_cached_or_compute("category_analytics", self._compute_category_analytics)
    
    def _compute_category_analytics(self) -> Dict[str, Any]:
        """Compute category analytics"""
        category_data = defaultdict(lambda: {
            "count": 0,
            "total_quality": 0,
            "platforms": set(),
            "high_quality": 0,
            "tags": Counter()
        })
        
        for project_key, project in self.projects.items():
            category = project.get("category", "other")
            quality = project.get("quality_score", 0)
            
            category_data[category]["count"] += 1
            category_data[category]["total_quality"] += quality
            category_data[category]["platforms"].update(project.get("platforms", []))
            
            if quality >= 8:
                category_data[category]["high_quality"] += 1
            
            # Count tags
            project_tags = self.tags.get(project_key, [])
            category_data[category]["tags"].update(project_tags)
        
        # Format results
        results = {}
        for category, data in category_data.items():
            results[category] = {
                "count": data["count"],
                "average_quality": round(data["total_quality"] / data["count"], 2) if data["count"] > 0 else 0,
                "platform_count": len(data["platforms"]),
                "high_quality_count": data["high_quality"],
                "high_quality_percentage": round(data["high_quality"] / data["count"] * 100, 1) if data["count"] > 0 else 0,
                "top_tags": dict(data["tags"].most_common(5))
            }
        
        return {
            "categories": results,
            "total_categories": len(results),
            "top_categories": sorted(results.keys(), key=lambda x: results[x]["count"], reverse=True)[:5]
        }
    
    def get_platform_analytics(self) -> Dict[str, Any]:
        """Get detailed platform analytics"""
        return self._get_cached_or_compute("platform_analytics", self._compute_platform_analytics)
    
    def _compute_platform_analytics(self) -> Dict[str, Any]:
        """Compute platform analytics"""
        platform_data = defaultdict(lambda: {
            "count": 0,
            "total_quality": 0,
            "categories": set(),
            "high_quality": 0,
            "complexity_sum": 0
        })
        
        for project in self.projects.values():
            quality = project.get("quality_score", 0)
            category = project.get("category", "other")
            
            # Extract complexity number
            complexity_str = project.get("technical_complexity", "5")
            try:
                complexity = float(str(complexity_str).split('/')[0])
            except:
                complexity = 5
            
            for platform in project.get("platforms", []):
                platform_data[platform]["count"] += 1
                platform_data[platform]["total_quality"] += quality
                platform_data[platform]["categories"].add(category)
                platform_data[platform]["complexity_sum"] += complexity
                
                if quality >= 8:
                    platform_data[platform]["high_quality"] += 1
        
        # Format results
        results = {}
        for platform, data in platform_data.items():
            if data["count"] > 0:
                results[platform] = {
                    "count": data["count"],
                    "average_quality": round(data["total_quality"] / data["count"], 2),
                    "category_diversity": len(data["categories"]),
                    "high_quality_count": data["high_quality"],
                    "high_quality_percentage": round(data["high_quality"] / data["count"] * 100, 1),
                    "average_complexity": round(data["complexity_sum"] / data["count"], 1)
                }
        
        # Sort platforms by project count
        sorted_platforms = sorted(results.items(), key=lambda x: x[1]["count"], reverse=True)
        
        return {
            "platforms": dict(sorted_platforms),
            "total_platforms": len(results),
            "top_platforms": [p[0] for p in sorted_platforms[:10]],
            "emerging_platforms": [p[0] for p in sorted_platforms if 0 < p[1]["count"] < 5]
        }
    
    def get_quality_analytics(self) -> Dict[str, Any]:
        """Get quality score analytics"""
        return self._get_cached_or_compute("quality_analytics", self._compute_quality_analytics)
    
    def _compute_quality_analytics(self) -> Dict[str, Any]:
        """Compute quality analytics"""
        quality_scores = [p.get("quality_score", 0) for p in self.projects.values()]
        
        if not quality_scores:
            return {"error": "No quality data available"}
        
        # Distribution
        distribution = {
            "0-5": 0, "5-6": 0, "6-7": 0,
            "7-8": 0, "8-9": 0, "9-10": 0
        }
        
        for score in quality_scores:
            if score < 5:
                distribution["0-5"] += 1
            elif score < 6:
                distribution["5-6"] += 1
            elif score < 7:
                distribution["6-7"] += 1
            elif score < 8:
                distribution["7-8"] += 1
            elif score < 9:
                distribution["8-9"] += 1
            else:
                distribution["9-10"] += 1
        
        # Percentiles
        sorted_scores = sorted(quality_scores)
        n = len(sorted_scores)
        
        percentiles = {
            "25th": sorted_scores[int(n * 0.25)],
            "50th": sorted_scores[int(n * 0.50)],
            "75th": sorted_scores[int(n * 0.75)],
            "90th": sorted_scores[int(n * 0.90)],
            "95th": sorted_scores[int(n * 0.95)]
        }
        
        return {
            "distribution": distribution,
            "statistics": {
                "mean": round(statistics.mean(quality_scores), 2),
                "median": round(statistics.median(quality_scores), 2),
                "std_dev": round(statistics.stdev(quality_scores), 2) if len(quality_scores) > 1 else 0,
                "min": min(quality_scores),
                "max": max(quality_scores)
            },
            "percentiles": percentiles,
            "quality_levels": {
                "excellent": sum(1 for s in quality_scores if s >= 9),
                "very_good": sum(1 for s in quality_scores if 8 <= s < 9),
                "good": sum(1 for s in quality_scores if 7 <= s < 8),
                "fair": sum(1 for s in quality_scores if 6 <= s < 7),
                "needs_improvement": sum(1 for s in quality_scores if s < 6)
            }
        }
    
    def get_tag_analytics(self) -> Dict[str, Any]:
        """Get tag usage analytics"""
        return self._get_cached_or_compute("tag_analytics", self._compute_tag_analytics)
    
    def _compute_tag_analytics(self) -> Dict[str, Any]:
        """Compute tag analytics"""
        # Count all tags
        tag_counter = Counter()
        tag_cooccurrence = defaultdict(Counter)
        projects_per_tag = defaultdict(list)
        
        for project_key, tags in self.tags.items():
            tag_counter.update(tags)
            
            # Track which projects have each tag
            for tag in tags:
                projects_per_tag[tag].append(project_key)
            
            # Track co-occurrence
            for i, tag1 in enumerate(tags):
                for tag2 in tags[i+1:]:
                    tag_cooccurrence[tag1][tag2] += 1
                    tag_cooccurrence[tag2][tag1] += 1
        
        # Find most common combinations
        common_pairs = []
        for tag1, related in tag_cooccurrence.items():
            for tag2, count in related.most_common(3):
                if (tag2, tag1, count) not in common_pairs:
                    common_pairs.append((tag1, tag2, count))
        
        common_pairs.sort(key=lambda x: x[2], reverse=True)
        
        # Tag categories
        tag_categories = {
            "difficulty": ["beginner-friendly", "intermediate", "advanced", "expert-level"],
            "revenue": ["high-revenue", "moderate-revenue", "low-revenue"],
            "timeline": ["quick-win", "short-term", "medium-term", "long-term"],
            "technology": ["ai-powered", "blockchain", "no-code", "automation", "real-time"],
            "business": ["b2b", "b2c", "enterprise", "subscription-model", "freemium"]
        }
        
        categorized_counts = {}
        for category, category_tags in tag_categories.items():
            categorized_counts[category] = {
                tag: tag_counter.get(tag, 0) 
                for tag in category_tags
            }
        
        return {
            "total_tags": len(tag_counter),
            "total_tag_assignments": sum(tag_counter.values()),
            "most_common_tags": dict(tag_counter.most_common(20)),
            "tag_combinations": [
                {"tag1": t[0], "tag2": t[1], "count": t[2]} 
                for t in common_pairs[:10]
            ],
            "categorized_usage": categorized_counts,
            "tags_per_project": {
                "average": round(sum(tag_counter.values()) / len(self.projects), 2) if self.projects else 0,
                "min": min(len(tags) for tags in self.tags.values()) if self.tags else 0,
                "max": max(len(tags) for tags in self.tags.values()) if self.tags else 0
            }
        }
    
    def get_revenue_analytics(self) -> Dict[str, Any]:
        """Get revenue potential analytics"""
        return self._get_cached_or_compute("revenue_analytics", self._compute_revenue_analytics)
    
    def _compute_revenue_analytics(self) -> Dict[str, Any]:
        """Compute revenue analytics"""
        revenue_projects = {
            "high": [],
            "moderate": [],
            "low": []
        }
        
        # Categorize projects by revenue potential
        for project_key, tags in self.tags.items():
            project = self.projects.get(project_key, {})
            
            if "high-revenue" in tags:
                revenue_projects["high"].append({
                    "key": project_key,
                    "name": project.get("name", "Unknown"),
                    "quality": project.get("quality_score", 0),
                    "category": project.get("category", "other")
                })
            elif "moderate-revenue" in tags:
                revenue_projects["moderate"].append({
                    "key": project_key,
                    "name": project.get("name", "Unknown"),
                    "quality": project.get("quality_score", 0),
                    "category": project.get("category", "other")
                })
            elif "low-revenue" in tags:
                revenue_projects["low"].append({
                    "key": project_key,
                    "name": project.get("name", "Unknown"),
                    "quality": project.get("quality_score", 0),
                    "category": project.get("category", "other")
                })
        
        # Calculate average quality by revenue tier
        avg_quality_by_tier = {}
        for tier, projects in revenue_projects.items():
            if projects:
                avg_quality_by_tier[tier] = round(
                    statistics.mean([p["quality"] for p in projects]), 2
                )
            else:
                avg_quality_by_tier[tier] = 0
        
        # Revenue by category
        revenue_by_category = defaultdict(lambda: {"high": 0, "moderate": 0, "low": 0})
        
        for tier, projects in revenue_projects.items():
            for project in projects:
                revenue_by_category[project["category"]][tier] += 1
        
        # Find best revenue categories
        best_categories = []
        for category, revenue_data in revenue_by_category.items():
            total = sum(revenue_data.values())
            if total > 0:
                high_ratio = revenue_data["high"] / total
                best_categories.append({
                    "category": category,
                    "high_revenue_ratio": round(high_ratio, 2),
                    "total_projects": total
                })
        
        best_categories.sort(key=lambda x: x["high_revenue_ratio"], reverse=True)
        
        return {
            "distribution": {
                "high": len(revenue_projects["high"]),
                "moderate": len(revenue_projects["moderate"]),
                "low": len(revenue_projects["low"])
            },
            "average_quality_by_tier": avg_quality_by_tier,
            "top_high_revenue": sorted(
                revenue_projects["high"], 
                key=lambda x: x["quality"], 
                reverse=True
            )[:10],
            "best_revenue_categories": best_categories[:5],
            "revenue_by_category": dict(revenue_by_category),
            "insights": {
                "high_revenue_percentage": round(
                    len(revenue_projects["high"]) / len(self.projects) * 100, 1
                ) if self.projects else 0,
                "quality_correlation": "High revenue projects have " + 
                    f"{avg_quality_by_tier.get('high', 0):.1f}/10 average quality"
            }
        }
    
    def get_development_timeline_analytics(self) -> Dict[str, Any]:
        """Get development timeline analytics"""
        return self._get_cached_or_compute("timeline_analytics", self._compute_timeline_analytics)
    
    def _compute_timeline_analytics(self) -> Dict[str, Any]:
        """Compute timeline analytics"""
        timeline_categories = {
            "quick": [],  # <= 7 days
            "short": [],  # 1-4 weeks
            "medium": [], # 1-3 months
            "long": []    # 3+ months
        }
        
        # Categorize projects by timeline
        for project_key, project in self.projects.items():
            timeline = project.get("development_time", "").lower()
            tags = self.tags.get(project_key, [])
            
            project_info = {
                "key": project_key,
                "name": project.get("name", "Unknown"),
                "quality": project.get("quality_score", 0),
                "complexity": project.get("technical_complexity", "Unknown")
            }
            
            if "quick-win" in tags or "day" in timeline:
                timeline_categories["quick"].append(project_info)
            elif "week" in timeline:
                timeline_categories["short"].append(project_info)
            elif "month" in timeline and "3" not in timeline:
                timeline_categories["medium"].append(project_info)
            else:
                timeline_categories["long"].append(project_info)
        
        # Calculate metrics
        distribution = {
            category: len(projects) 
            for category, projects in timeline_categories.items()
        }
        
        # Average quality by timeline
        avg_quality_by_timeline = {}
        for category, projects in timeline_categories.items():
            if projects:
                avg_quality_by_timeline[category] = round(
                    statistics.mean([p["quality"] for p in projects]), 2
                )
            else:
                avg_quality_by_timeline[category] = 0
        
        # Quick wins with high quality
        high_quality_quick_wins = [
            p for p in timeline_categories["quick"] 
            if p["quality"] >= 7
        ]
        
        return {
            "distribution": distribution,
            "average_quality_by_timeline": avg_quality_by_timeline,
            "quick_wins": {
                "total": len(timeline_categories["quick"]),
                "high_quality": len(high_quality_quick_wins),
                "top_projects": sorted(
                    high_quality_quick_wins, 
                    key=lambda x: x["quality"], 
                    reverse=True
                )[:10]
            },
            "insights": {
                "quick_win_percentage": round(
                    len(timeline_categories["quick"]) / len(self.projects) * 100, 1
                ) if self.projects else 0,
                "optimal_timeline": max(
                    avg_quality_by_timeline.items(), 
                    key=lambda x: x[1]
                )[0] if avg_quality_by_timeline else "unknown"
            }
        }
    
    def get_live_metrics(self) -> Dict[str, Any]:
        """Get live updating metrics for dashboard"""
        # This would connect to real-time data in production
        # For now, return current snapshot with timestamp
        
        return {
            "timestamp": datetime.now().isoformat(),
            "overview": self.get_overview_metrics(),
            "trending": {
                "hot_categories": self._get_trending_categories(),
                "rising_tags": self._get_rising_tags(),
                "popular_platforms": self._get_popular_platforms()
            },
            "alerts": self._get_system_alerts()
        }
    
    def _get_trending_categories(self) -> List[str]:
        """Get trending categories (mock implementation)"""
        category_analytics = self.get_category_analytics()
        return category_analytics.get("top_categories", [])[:3]
    
    def _get_rising_tags(self) -> List[str]:
        """Get rising tags (mock implementation)"""
        tag_analytics = self.get_tag_analytics()
        common_tags = tag_analytics.get("most_common_tags", {})
        return list(common_tags.keys())[:5]
    
    def _get_popular_platforms(self) -> List[str]:
        """Get popular platforms"""
        platform_analytics = self.get_platform_analytics()
        return platform_analytics.get("top_platforms", [])[:3]
    
    def _get_system_alerts(self) -> List[Dict[str, str]]:
        """Get system alerts and notifications"""
        alerts = []
        
        # Check for low quality projects
        quality_analytics = self.get_quality_analytics()
        low_quality_count = quality_analytics["quality_levels"].get("needs_improvement", 0)
        
        if low_quality_count > 50:
            alerts.append({
                "type": "warning",
                "message": f"{low_quality_count} projects need quality improvement"
            })
        
        # Check for underutilized platforms
        platform_analytics = self.get_platform_analytics()
        emerging = platform_analytics.get("emerging_platforms", [])
        
        if emerging:
            alerts.append({
                "type": "info",
                "message": f"{len(emerging)} emerging platforms have growth potential"
            })
        
        return alerts


def main():
    """Test dashboard analytics"""
    analytics = DashboardAnalytics()
    
    print("=== Dashboard Analytics Test ===\n")
    
    # Test each analytics function
    print("1. Overview Metrics:")
    print(json.dumps(analytics.get_overview_metrics(), indent=2))
    
    print("\n2. Category Analytics (top 3):")
    cat_analytics = analytics.get_category_analytics()
    for cat in cat_analytics["top_categories"][:3]:
        print(f"  - {cat}: {cat_analytics['categories'][cat]['count']} projects")
    
    print("\n3. Quality Distribution:")
    quality = analytics.get_quality_analytics()
    for range_name, count in quality["distribution"].items():
        print(f"  - {range_name}: {count} projects")
    
    print("\n4. Revenue Analytics:")
    revenue = analytics.get_revenue_analytics()
    print(f"  - High revenue: {revenue['distribution']['high']} projects")
    print(f"  - Best category: {revenue['best_revenue_categories'][0]['category'] if revenue['best_revenue_categories'] else 'N/A'}")
    
    print("\n5. Live Metrics:")
    live = analytics.get_live_metrics()
    print(f"  - Timestamp: {live['timestamp']}")
    print(f"  - Trending: {live['trending']['hot_categories']}")
    print(f"  - Alerts: {len(live['alerts'])}")


if __name__ == "__main__":
    main()