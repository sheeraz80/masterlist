#!/usr/bin/env python3
"""
AI-Powered Project Recommendation Engine
Provides personalized project recommendations based on user preferences and criteria.
"""

import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple
import math
from datetime import datetime

class ProjectRecommendationEngine:
    def __init__(self, data_path: str = "projects.json"):
        """Initialize the recommendation engine."""
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
            
    def calculate_user_score(self, project: Dict[str, Any], user_profile: Dict[str, Any]) -> float:
        """Calculate personalized score based on user profile."""
        score = 0
        
        # Budget compatibility (25% weight)
        budget_score = self.calculate_budget_score(project, user_profile.get('budget', 50000))
        score += budget_score * 0.25
        
        # Timeline compatibility (20% weight)
        timeline_score = self.calculate_timeline_score(project, user_profile.get('timeline_months', 6))
        score += timeline_score * 0.20
        
        # Technical complexity match (20% weight)
        complexity_score = self.calculate_complexity_score(project, user_profile.get('technical_level', 'intermediate'))
        score += complexity_score * 0.20
        
        # Market opportunity (15% weight)
        market_score = self.calculate_market_score(project)
        score += market_score * 0.15
        
        # Platform preference (10% weight)
        platform_score = self.calculate_platform_score(project, user_profile.get('preferred_platforms', []))
        score += platform_score * 0.10
        
        # Team size compatibility (10% weight)
        team_score = self.calculate_team_score(project, user_profile.get('team_size', 2))
        score += team_score * 0.10
        
        return min(score, 10)  # Cap at 10
        
    def calculate_budget_score(self, project: Dict[str, Any], budget: int) -> float:
        """Calculate budget compatibility score."""
        revenue_realistic = project.get('revenue_potential', {}).get('realistic', 0)
        dev_time = project.get('development_time', 7)
        
        # Estimate development cost (assuming $100/day for development)
        estimated_cost = dev_time * 100
        
        if budget >= estimated_cost * 2:  # Comfortable budget
            return 10
        elif budget >= estimated_cost * 1.5:  # Adequate budget
            return 8
        elif budget >= estimated_cost:  # Tight budget
            return 6
        else:  # Insufficient budget
            return 2
            
    def calculate_timeline_score(self, project: Dict[str, Any], timeline_months: int) -> float:
        """Calculate timeline compatibility score."""
        dev_time_days = project.get('development_time', 7)
        dev_time_months = dev_time_days / 30  # Convert to months
        
        if dev_time_months <= timeline_months * 0.5:  # Very comfortable timeline
            return 10
        elif dev_time_months <= timeline_months * 0.75:  # Comfortable timeline
            return 8
        elif dev_time_months <= timeline_months:  # Tight timeline
            return 6
        else:  # Timeline too short
            return 2
            
    def calculate_complexity_score(self, project: Dict[str, Any], technical_level: str) -> float:
        """Calculate technical complexity compatibility score."""
        complexity = project.get('technical_complexity', 5)
        
        level_mapping = {
            'beginner': 3,
            'intermediate': 6,
            'advanced': 10
        }
        
        user_level = level_mapping.get(technical_level, 6)
        
        if complexity <= user_level:
            return 10
        elif complexity <= user_level + 2:
            return 7
        elif complexity <= user_level + 4:
            return 4
        else:
            return 1
            
    def calculate_market_score(self, project: Dict[str, Any]) -> float:
        """Calculate market opportunity score."""
        revenue_realistic = project.get('revenue_potential', {}).get('realistic', 0)
        competition = project.get('competition_level', 'medium').lower()
        
        # Base score from revenue
        if revenue_realistic >= 10000:
            base_score = 10
        elif revenue_realistic >= 5000:
            base_score = 8
        elif revenue_realistic >= 2000:
            base_score = 6
        else:
            base_score = 4
            
        # Adjust for competition
        competition_multiplier = {
            'low': 1.2,
            'medium': 1.0,
            'high': 0.8
        }
        
        return min(base_score * competition_multiplier.get(competition, 1.0), 10)
        
    def calculate_platform_score(self, project: Dict[str, Any], preferred_platforms: List[str]) -> float:
        """Calculate platform preference score."""
        if not preferred_platforms:
            return 5  # Neutral if no preference
            
        project_platforms = project.get('platforms', [])
        
        # Check if any preferred platform is available
        for platform in preferred_platforms:
            if platform in project_platforms:
                return 10
                
        return 3  # Lower score if no preferred platform available
        
    def calculate_team_score(self, project: Dict[str, Any], team_size: int) -> float:
        """Calculate team size compatibility score."""
        complexity = project.get('technical_complexity', 5)
        dev_time = project.get('development_time', 7)
        
        # Estimate ideal team size based on complexity and timeline
        if complexity >= 8 or dev_time >= 15:
            ideal_team_size = 3
        elif complexity >= 6 or dev_time >= 10:
            ideal_team_size = 2
        else:
            ideal_team_size = 1
            
        if team_size >= ideal_team_size:
            return 10
        elif team_size >= ideal_team_size - 1:
            return 7
        else:
            return 4
            
    def find_similar_projects(self, project_name: str, limit: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """Find projects similar to the given project."""
        target_project = None
        for project in self.projects:
            if project['name'].lower() == project_name.lower():
                target_project = project
                break
                
        if not target_project:
            return []
            
        similarities = []
        for project in self.projects:
            if project['name'] == target_project['name']:
                continue
                
            similarity = self.calculate_similarity(target_project, project)
            similarities.append((project, similarity))
            
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:limit]
        
    def calculate_similarity(self, project1: Dict[str, Any], project2: Dict[str, Any]) -> float:
        """Calculate similarity between two projects."""
        score = 0
        
        # Category similarity (30%)
        if project1.get('category') == project2.get('category'):
            score += 0.3
            
        # Platform overlap (20%)
        platforms1 = set(project1.get('platforms', []))
        platforms2 = set(project2.get('platforms', []))
        if platforms1 and platforms2:
            overlap = len(platforms1.intersection(platforms2))
            union = len(platforms1.union(platforms2))
            score += (overlap / union) * 0.2
            
        # Revenue similarity (15%)
        revenue1 = project1.get('revenue_potential', {}).get('realistic', 0)
        revenue2 = project2.get('revenue_potential', {}).get('realistic', 0)
        if revenue1 > 0 and revenue2 > 0:
            ratio = min(revenue1, revenue2) / max(revenue1, revenue2)
            score += ratio * 0.15
            
        # Complexity similarity (15%)
        complexity1 = project1.get('technical_complexity', 5)
        complexity2 = project2.get('technical_complexity', 5)
        complexity_diff = abs(complexity1 - complexity2)
        score += (1 - complexity_diff / 10) * 0.15
        
        # Development time similarity (10%)
        time1 = project1.get('development_time', 7)
        time2 = project2.get('development_time', 7)
        time_diff = abs(time1 - time2)
        score += (1 - min(time_diff / 30, 1)) * 0.10
        
        # Quality score similarity (10%)
        quality1 = project1.get('quality_score', 5)
        quality2 = project2.get('quality_score', 5)
        quality_diff = abs(quality1 - quality2)
        score += (1 - quality_diff / 10) * 0.10
        
        return score
        
    def get_trending_projects(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Identify trending projects based on various factors."""
        scored_projects = []
        
        for project in self.projects:
            trend_score = 0
            
            # High revenue potential
            revenue = project.get('revenue_potential', {}).get('realistic', 0)
            if revenue >= 10000:
                trend_score += 3
            elif revenue >= 5000:
                trend_score += 2
            elif revenue >= 2000:
                trend_score += 1
                
            # Low competition
            competition = project.get('competition_level', 'medium').lower()
            if competition == 'low':
                trend_score += 2
            elif competition == 'medium':
                trend_score += 1
                
            # Quick development
            dev_time = project.get('development_time', 7)
            if dev_time <= 5:
                trend_score += 2
            elif dev_time <= 10:
                trend_score += 1
                
            # High quality
            quality = project.get('quality_score', 5)
            if quality >= 8:
                trend_score += 2
            elif quality >= 7:
                trend_score += 1
                
            # Moderate complexity
            complexity = project.get('technical_complexity', 5)
            if 4 <= complexity <= 6:
                trend_score += 1
                
            scored_projects.append((project, trend_score))
            
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        return [project for project, _ in scored_projects[:limit]]
        
    def gap_analysis(self, category: str = None) -> Dict[str, Any]:
        """Perform gap analysis to identify underserved market segments."""
        analysis = {
            'underserved_categories': [],
            'platform_gaps': [],
            'complexity_gaps': [],
            'revenue_gaps': []
        }
        
        # Category analysis
        category_counts = {}
        for project in self.projects:
            cat = project.get('category', 'other')
            category_counts[cat] = category_counts.get(cat, 0) + 1
            
        avg_projects_per_category = sum(category_counts.values()) / len(category_counts)
        for cat, count in category_counts.items():
            if count < avg_projects_per_category * 0.7:
                analysis['underserved_categories'].append({
                    'category': cat,
                    'project_count': count,
                    'opportunity': 'High'
                })
                
        # Platform analysis
        platform_counts = {}
        for project in self.projects:
            for platform in project.get('platforms', []):
                platform_counts[platform] = platform_counts.get(platform, 0) + 1
                
        avg_projects_per_platform = sum(platform_counts.values()) / len(platform_counts)
        for platform, count in platform_counts.items():
            if count < avg_projects_per_platform * 0.6:
                analysis['platform_gaps'].append({
                    'platform': platform,
                    'project_count': count,
                    'opportunity': 'Medium'
                })
                
        return analysis
        
    def recommend_projects(self, user_profile: Dict[str, Any], limit: int = 10) -> List[Tuple[Dict[str, Any], float]]:
        """Get personalized project recommendations."""
        recommendations = []
        
        for project in self.projects:
            score = self.calculate_user_score(project, user_profile)
            recommendations.append((project, score))
            
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:limit]
        
    def create_user_profile_interactive(self) -> Dict[str, Any]:
        """Create user profile through interactive questions."""
        profile = {}
        
        print("🎯 Project Recommendation Profile Setup")
        print("=" * 50)
        
        # Budget
        try:
            budget = int(input("What's your budget for development? ($): "))
            profile['budget'] = budget
        except ValueError:
            profile['budget'] = 50000
            
        # Timeline
        try:
            timeline = int(input("Timeline for completion (months): "))
            profile['timeline_months'] = timeline
        except ValueError:
            profile['timeline_months'] = 6
            
        # Technical level
        print("\nTechnical level options: beginner, intermediate, advanced")
        tech_level = input("Your technical level: ").lower()
        profile['technical_level'] = tech_level if tech_level in ['beginner', 'intermediate', 'advanced'] else 'intermediate'
        
        # Team size
        try:
            team_size = int(input("Team size: "))
            profile['team_size'] = team_size
        except ValueError:
            profile['team_size'] = 2
            
        # Platform preferences
        print("\nAvailable platforms: figma-plugin, vscode-extension, chrome-extension, etc.")
        platforms = input("Preferred platforms (comma-separated, or leave blank): ").strip()
        if platforms:
            profile['preferred_platforms'] = [p.strip() for p in platforms.split(',')]
        else:
            profile['preferred_platforms'] = []
            
        return profile

def main():
    parser = argparse.ArgumentParser(description="Get AI-powered project recommendations")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive profile setup")
    parser.add_argument("--similar", "-s", help="Find projects similar to this one")
    parser.add_argument("--trending", "-t", action="store_true", help="Show trending projects")
    parser.add_argument("--gap-analysis", "-g", action="store_true", help="Perform gap analysis")
    parser.add_argument("--budget", type=int, help="Budget for development")
    parser.add_argument("--timeline", type=int, help="Timeline in months")
    parser.add_argument("--technical-level", choices=['beginner', 'intermediate', 'advanced'], help="Technical level")
    parser.add_argument("--team-size", type=int, help="Team size")
    parser.add_argument("--platforms", help="Preferred platforms (comma-separated)")
    parser.add_argument("--limit", "-l", type=int, default=10, help="Number of recommendations")
    
    args = parser.parse_args()
    
    engine = ProjectRecommendationEngine()
    
    if args.similar:
        print(f"🔍 Projects similar to '{args.similar}':")
        print("=" * 50)
        similar_projects = engine.find_similar_projects(args.similar, args.limit)
        for i, (project, similarity) in enumerate(similar_projects, 1):
            print(f"{i}. {project['name']} (Similarity: {similarity:.2f})")
            print(f"   Category: {project.get('category', 'N/A')}")
            print(f"   Revenue: ${project.get('revenue_potential', {}).get('realistic', 0):,}")
            print(f"   Complexity: {project.get('technical_complexity', 'N/A')}/10")
            print()
        return
        
    if args.trending:
        print("📈 Trending Projects:")
        print("=" * 50)
        trending = engine.get_trending_projects(args.limit)
        for i, project in enumerate(trending, 1):
            print(f"{i}. {project['name']}")
            print(f"   Category: {project.get('category', 'N/A')}")
            print(f"   Revenue: ${project.get('revenue_potential', {}).get('realistic', 0):,}")
            print(f"   Development: {project.get('development_time', 'N/A')} days")
            print(f"   Quality: {project.get('quality_score', 'N/A')}/10")
            print()
        return
        
    if args.gap_analysis:
        print("🔍 Market Gap Analysis:")
        print("=" * 50)
        gaps = engine.gap_analysis()
        
        print("\nUnderserved Categories:")
        for gap in gaps['underserved_categories']:
            print(f"• {gap['category']}: {gap['project_count']} projects ({gap['opportunity']} opportunity)")
            
        print("\nPlatform Gaps:")
        for gap in gaps['platform_gaps']:
            print(f"• {gap['platform']}: {gap['project_count']} projects ({gap['opportunity']} opportunity)")
        return
        
    # Build user profile
    if args.interactive:
        user_profile = engine.create_user_profile_interactive()
    else:
        user_profile = {
            'budget': args.budget or 50000,
            'timeline_months': args.timeline or 6,
            'technical_level': args.technical_level or 'intermediate',
            'team_size': args.team_size or 2,
            'preferred_platforms': args.platforms.split(',') if args.platforms else []
        }
        
    print("\n🎯 Personalized Project Recommendations:")
    print("=" * 50)
    
    recommendations = engine.recommend_projects(user_profile, args.limit)
    
    for i, (project, score) in enumerate(recommendations, 1):
        print(f"{i}. {project['name']} (Score: {score:.2f}/10)")
        print(f"   Category: {project.get('category', 'N/A')}")
        print(f"   Revenue: ${project.get('revenue_potential', {}).get('realistic', 0):,}")
        print(f"   Development: {project.get('development_time', 'N/A')} days")
        print(f"   Complexity: {project.get('technical_complexity', 'N/A')}/10")
        print(f"   Quality: {project.get('quality_score', 'N/A')}/10")
        print()

if __name__ == "__main__":
    main()