#!/usr/bin/env python3
"""
AI-Powered Project Recommendation Engine
Provides personalized project suggestions based on user preferences and profile
"""

import argparse
import json
import sys
import os
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import math

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.utils import (
    ProjectDataLoader, ProjectAnalyzer, ReportGenerator, 
    ProjectMetrics, calculate_similarity, weighted_average
)


@dataclass
class UserProfile:
    """User profile for personalized recommendations"""
    experience_level: str  # 'beginner', 'intermediate', 'advanced'
    budget: int  # Monthly budget in USD
    timeline: int  # Desired timeline in days
    team_size: int  # Number of team members
    preferred_categories: List[str]  # Preferred project categories
    risk_tolerance: str  # 'low', 'medium', 'high'
    revenue_priority: float  # 0-1 scale
    technical_preference: str  # 'simple', 'moderate', 'complex'
    platforms: List[str]  # Preferred platforms
    time_commitment: int  # Hours per week available
    skills: List[str]  # Technical skills
    interests: List[str]  # Business interests


class RecommendationEngine:
    """Main recommendation engine class"""
    
    def __init__(self):
        self.data_loader = ProjectDataLoader()
        self.analyzer = ProjectAnalyzer(self.data_loader)
        self.report_generator = ReportGenerator(self.analyzer)
        self.all_projects = self.data_loader.get_all_projects()
        
        # Load or initialize user profiles
        self.user_profiles = self._load_user_profiles()
        
        # Initialize recommendation models
        self._initialize_models()
    
    def _load_user_profiles(self) -> Dict[str, UserProfile]:
        """Load saved user profiles"""
        profiles_file = "/home/sali/ai/projects/masterlist/scripts/tools/user_profiles.json"
        if os.path.exists(profiles_file):
            try:
                with open(profiles_file, 'r') as f:
                    data = json.load(f)
                    return {k: UserProfile(**v) for k, v in data.items()}
            except Exception:
                return {}
        return {}
    
    def _save_user_profiles(self):
        """Save user profiles to file"""
        profiles_file = "/home/sali/ai/projects/masterlist/scripts/tools/user_profiles.json"
        os.makedirs(os.path.dirname(profiles_file), exist_ok=True)
        
        data = {k: asdict(v) for k, v in self.user_profiles.items()}
        with open(profiles_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _initialize_models(self):
        """Initialize recommendation models and data structures"""
        # Build feature vectors for all projects
        self.project_features = {}
        self.feature_names = [
            'quality_score', 'revenue_realistic', 'technical_complexity',
            'development_time', 'market_opportunity', 'risk_score',
            'platform_coverage', 'completeness_score'
        ]
        
        for project_id in self.all_projects.keys():
            self.project_features[project_id] = self._extract_feature_vector(project_id)
        
        # Build category and platform indices
        self.category_projects = {}
        self.platform_projects = {}
        
        for project_id, project_data in self.all_projects.items():
            # Category index
            category = project_data.get('category', 'other')
            if category not in self.category_projects:
                self.category_projects[category] = []
            self.category_projects[category].append(project_id)
            
            # Platform index
            platforms = project_data.get('platforms', {})
            for platform in platforms.keys():
                if platform not in self.platform_projects:
                    self.platform_projects[platform] = []
                self.platform_projects[platform].append(project_id)
    
    def _extract_feature_vector(self, project_id: str) -> List[float]:
        """Extract numerical feature vector for a project"""
        metrics = self.analyzer.get_project_metrics(project_id)
        
        return [
            metrics.quality_score / 10.0,
            min(metrics.revenue_potential.get('realistic', 0) / 10000, 1.0),  # Normalize to 10k
            metrics.technical_complexity / 10.0,
            min(metrics.development_time / 30, 1.0),  # Normalize to 30 days
            metrics.market_opportunity / 10.0,
            metrics.risk_score / 10.0,
            min(metrics.platform_coverage / 5, 1.0),  # Normalize to 5 platforms
            metrics.completeness_score / 10.0
        ]
    
    def create_user_profile(self, user_id: str, **kwargs) -> UserProfile:
        """Create or update user profile"""
        profile = UserProfile(
            experience_level=kwargs.get('experience_level', 'intermediate'),
            budget=kwargs.get('budget', 1000),
            timeline=kwargs.get('timeline', 30),
            team_size=kwargs.get('team_size', 1),
            preferred_categories=kwargs.get('preferred_categories', []),
            risk_tolerance=kwargs.get('risk_tolerance', 'medium'),
            revenue_priority=kwargs.get('revenue_priority', 0.5),
            technical_preference=kwargs.get('technical_preference', 'moderate'),
            platforms=kwargs.get('platforms', []),
            time_commitment=kwargs.get('time_commitment', 20),
            skills=kwargs.get('skills', []),
            interests=kwargs.get('interests', [])
        )
        
        self.user_profiles[user_id] = profile
        self._save_user_profiles()
        
        return profile
    
    def get_recommendations(self, user_id: str, 
                          num_recommendations: int = 10,
                          recommendation_type: str = 'personalized') -> Dict[str, Any]:
        """Get personalized project recommendations"""
        
        if user_id not in self.user_profiles:
            raise ValueError(f"User profile '{user_id}' not found. Create a profile first.")
        
        profile = self.user_profiles[user_id]
        
        if recommendation_type == 'personalized':
            return self._get_personalized_recommendations(profile, num_recommendations)
        elif recommendation_type == 'trending':
            return self._get_trending_recommendations(profile, num_recommendations)
        elif recommendation_type == 'similar':
            return self._get_similar_recommendations(profile, num_recommendations)
        elif recommendation_type == 'gap_analysis':
            return self._get_gap_analysis_recommendations(profile, num_recommendations)
        else:
            raise ValueError(f"Unknown recommendation type: {recommendation_type}")
    
    def _get_personalized_recommendations(self, profile: UserProfile, 
                                        num_recommendations: int) -> Dict[str, Any]:
        """Get personalized recommendations based on user profile"""
        
        # Calculate compatibility scores for all projects
        project_scores = {}
        
        for project_id in self.all_projects.keys():
            score = self._calculate_compatibility_score(project_id, profile)
            project_scores[project_id] = score
        
        # Sort by score and get top recommendations
        sorted_projects = sorted(project_scores.items(), key=lambda x: x[1], reverse=True)
        top_projects = sorted_projects[:num_recommendations]
        
        # Generate detailed recommendations
        recommendations = {
            'user_profile': asdict(profile),
            'recommendation_type': 'personalized',
            'timestamp': datetime.now().isoformat(),
            'recommendations': [],
            'explanation': self._generate_recommendation_explanation(profile, top_projects)
        }
        
        for project_id, score in top_projects:
            project_data = self.all_projects[project_id]
            metrics = self.analyzer.get_project_metrics(project_id)
            
            recommendation = {
                'project_id': project_id,
                'project_name': project_data.get('project_name', project_id),
                'category': project_data.get('category', 'unknown'),
                'compatibility_score': score,
                'metrics': asdict(metrics),
                'match_reasons': self._generate_match_reasons(project_id, profile),
                'fit_analysis': self._analyze_project_fit(project_id, profile),
                'next_steps': self._suggest_next_steps(project_id, profile)
            }
            
            recommendations['recommendations'].append(recommendation)
        
        return recommendations
    
    def _calculate_compatibility_score(self, project_id: str, profile: UserProfile) -> float:
        """Calculate compatibility score between project and user profile"""
        
        project_data = self.all_projects[project_id]
        metrics = self.analyzer.get_project_metrics(project_id)
        
        score_components = []
        weights = []
        
        # Experience level compatibility
        exp_score = self._calculate_experience_compatibility(metrics, profile)
        score_components.append(exp_score)
        weights.append(0.2)
        
        # Budget compatibility
        budget_score = self._calculate_budget_compatibility(metrics, profile)
        score_components.append(budget_score)
        weights.append(0.15)
        
        # Timeline compatibility
        timeline_score = self._calculate_timeline_compatibility(metrics, profile)
        score_components.append(timeline_score)
        weights.append(0.15)
        
        # Category preference
        category_score = self._calculate_category_compatibility(project_data, profile)
        score_components.append(category_score)
        weights.append(0.1)
        
        # Risk tolerance
        risk_score = self._calculate_risk_compatibility(metrics, profile)
        score_components.append(risk_score)
        weights.append(0.15)
        
        # Revenue priority
        revenue_score = self._calculate_revenue_compatibility(metrics, profile)
        score_components.append(revenue_score)
        weights.append(profile.revenue_priority * 0.15)
        
        # Technical preference
        tech_score = self._calculate_technical_compatibility(metrics, profile)
        score_components.append(tech_score)
        weights.append(0.1)
        
        # Platform preference
        platform_score = self._calculate_platform_compatibility(project_data, profile)
        score_components.append(platform_score)
        weights.append(0.05)
        
        # Quality score factor
        quality_factor = metrics.quality_score / 10.0
        score_components.append(quality_factor)
        weights.append(0.05)
        
        # Calculate weighted average
        total_score = weighted_average(score_components, weights)
        
        return min(total_score, 1.0)
    
    def _calculate_experience_compatibility(self, metrics: ProjectMetrics, 
                                          profile: UserProfile) -> float:
        """Calculate experience level compatibility"""
        complexity = metrics.technical_complexity
        
        if profile.experience_level == 'beginner':
            return max(0, 1.0 - (complexity - 3) / 7.0)  # Prefer complexity <= 3
        elif profile.experience_level == 'intermediate':
            return 1.0 - abs(complexity - 5) / 5.0  # Prefer complexity around 5
        else:  # advanced
            return min(1.0, complexity / 10.0)  # Prefer higher complexity
    
    def _calculate_budget_compatibility(self, metrics: ProjectMetrics, 
                                      profile: UserProfile) -> float:
        """Calculate budget compatibility"""
        dev_cost = metrics.development_time * 50  # Assume $50/hour, 8 hours/day
        
        if dev_cost <= profile.budget:
            return 1.0
        else:
            return max(0, 1.0 - (dev_cost - profile.budget) / profile.budget)
    
    def _calculate_timeline_compatibility(self, metrics: ProjectMetrics, 
                                        profile: UserProfile) -> float:
        """Calculate timeline compatibility"""
        if metrics.development_time <= profile.timeline:
            return 1.0
        else:
            return max(0, 1.0 - (metrics.development_time - profile.timeline) / profile.timeline)
    
    def _calculate_category_compatibility(self, project_data: Dict[str, Any], 
                                        profile: UserProfile) -> float:
        """Calculate category preference compatibility"""
        if not profile.preferred_categories:
            return 0.5  # Neutral if no preferences
        
        category = project_data.get('category', 'other')
        return 1.0 if category in profile.preferred_categories else 0.0
    
    def _calculate_risk_compatibility(self, metrics: ProjectMetrics, 
                                    profile: UserProfile) -> float:
        """Calculate risk tolerance compatibility"""
        risk_score = metrics.risk_score
        
        if profile.risk_tolerance == 'low':
            return max(0, 1.0 - (risk_score - 2) / 8.0)  # Prefer risk <= 2
        elif profile.risk_tolerance == 'medium':
            return 1.0 - abs(risk_score - 5) / 5.0  # Prefer risk around 5
        else:  # high
            return min(1.0, risk_score / 10.0)  # Prefer higher risk
    
    def _calculate_revenue_compatibility(self, metrics: ProjectMetrics, 
                                       profile: UserProfile) -> float:
        """Calculate revenue potential compatibility"""
        revenue = metrics.revenue_potential.get('realistic', 0)
        
        # Normalize revenue to 0-1 scale (assuming max desired revenue of $10k/month)
        normalized_revenue = min(revenue / 10000, 1.0)
        
        return normalized_revenue
    
    def _calculate_technical_compatibility(self, metrics: ProjectMetrics, 
                                         profile: UserProfile) -> float:
        """Calculate technical preference compatibility"""
        complexity = metrics.technical_complexity
        
        if profile.technical_preference == 'simple':
            return max(0, 1.0 - (complexity - 2) / 8.0)  # Prefer complexity <= 2
        elif profile.technical_preference == 'moderate':
            return 1.0 - abs(complexity - 5) / 5.0  # Prefer complexity around 5
        else:  # complex
            return min(1.0, complexity / 10.0)  # Prefer higher complexity
    
    def _calculate_platform_compatibility(self, project_data: Dict[str, Any], 
                                        profile: UserProfile) -> float:
        """Calculate platform preference compatibility"""
        if not profile.platforms:
            return 0.5  # Neutral if no preferences
        
        project_platforms = set(project_data.get('platforms', {}).keys())
        user_platforms = set(profile.platforms)
        
        if project_platforms.intersection(user_platforms):
            return 1.0
        else:
            return 0.0
    
    def _get_trending_recommendations(self, profile: UserProfile, 
                                    num_recommendations: int) -> Dict[str, Any]:
        """Get trending project recommendations"""
        
        # Calculate trending score based on various factors
        trending_scores = {}
        
        for project_id in self.all_projects.keys():
            metrics = self.analyzer.get_project_metrics(project_id)
            project_data = self.all_projects[project_id]
            
            # Trending factors
            trending_score = 0
            
            # High quality projects trend more
            trending_score += metrics.quality_score / 10.0 * 0.3
            
            # High revenue potential projects trend more
            revenue = metrics.revenue_potential.get('realistic', 0)
            trending_score += min(revenue / 5000, 1.0) * 0.25
            
            # Low complexity projects trend more (easier to implement)
            trending_score += (10 - metrics.technical_complexity) / 10.0 * 0.2
            
            # Quick development projects trend more
            trending_score += (30 - min(metrics.development_time, 30)) / 30.0 * 0.15
            
            # High market opportunity projects trend more
            trending_score += metrics.market_opportunity / 10.0 * 0.1
            
            trending_scores[project_id] = trending_score
        
        # Sort by trending score
        sorted_projects = sorted(trending_scores.items(), key=lambda x: x[1], reverse=True)
        top_projects = sorted_projects[:num_recommendations]
        
        return {
            'user_profile': asdict(profile),
            'recommendation_type': 'trending',
            'timestamp': datetime.now().isoformat(),
            'recommendations': [
                {
                    'project_id': project_id,
                    'project_name': self.all_projects[project_id].get('project_name', project_id),
                    'category': self.all_projects[project_id].get('category', 'unknown'),
                    'trending_score': score,
                    'metrics': asdict(self.analyzer.get_project_metrics(project_id)),
                    'trending_reasons': self._generate_trending_reasons(project_id)
                }
                for project_id, score in top_projects
            ]
        }
    
    def _get_similar_recommendations(self, profile: UserProfile, 
                                   num_recommendations: int,
                                   reference_project: str = None) -> Dict[str, Any]:
        """Get similar project recommendations"""
        
        if reference_project and reference_project not in self.all_projects:
            raise ValueError(f"Reference project '{reference_project}' not found")
        
        # If no reference project, use user's most compatible project
        if not reference_project:
            personalized = self._get_personalized_recommendations(profile, 1)
            if personalized['recommendations']:
                reference_project = personalized['recommendations'][0]['project_id']
            else:
                raise ValueError("No suitable reference project found")
        
        # Calculate similarity to reference project
        reference_data = self.all_projects[reference_project]
        similarity_scores = {}
        
        for project_id in self.all_projects.keys():
            if project_id == reference_project:
                continue
            
            project_data = self.all_projects[project_id]
            similarity = calculate_similarity(reference_data, project_data)
            similarity_scores[project_id] = similarity
        
        # Sort by similarity
        sorted_projects = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)
        top_projects = sorted_projects[:num_recommendations]
        
        return {
            'user_profile': asdict(profile),
            'recommendation_type': 'similar',
            'reference_project': reference_project,
            'timestamp': datetime.now().isoformat(),
            'recommendations': [
                {
                    'project_id': project_id,
                    'project_name': self.all_projects[project_id].get('project_name', project_id),
                    'category': self.all_projects[project_id].get('category', 'unknown'),
                    'similarity_score': score,
                    'metrics': asdict(self.analyzer.get_project_metrics(project_id)),
                    'similarity_reasons': self._generate_similarity_reasons(project_id, reference_project)
                }
                for project_id, score in top_projects
            ]
        }
    
    def _get_gap_analysis_recommendations(self, profile: UserProfile, 
                                        num_recommendations: int) -> Dict[str, Any]:
        """Get gap analysis recommendations to identify market opportunities"""
        
        # Analyze current market coverage
        category_coverage = {}
        platform_coverage = {}
        complexity_coverage = {}
        
        for project_id, project_data in self.all_projects.items():
            metrics = self.analyzer.get_project_metrics(project_id)
            
            # Category coverage
            category = project_data.get('category', 'other')
            if category not in category_coverage:
                category_coverage[category] = []
            category_coverage[category].append(metrics.quality_score)
            
            # Platform coverage
            for platform in project_data.get('platforms', {}).keys():
                if platform not in platform_coverage:
                    platform_coverage[platform] = []
                platform_coverage[platform].append(metrics.quality_score)
            
            # Complexity coverage
            complexity_level = int(metrics.technical_complexity)
            if complexity_level not in complexity_coverage:
                complexity_coverage[complexity_level] = []
            complexity_coverage[complexity_level].append(metrics.quality_score)
        
        # Find gaps (areas with low average quality or few projects)
        gaps = []
        
        # Category gaps
        for category, scores in category_coverage.items():
            avg_quality = np.mean(scores)
            project_count = len(scores)
            gap_score = (10 - avg_quality) / 10.0 + (10 - project_count) / 10.0
            gaps.append({
                'type': 'category',
                'name': category,
                'gap_score': gap_score,
                'avg_quality': avg_quality,
                'project_count': project_count
            })
        
        # Platform gaps
        for platform, scores in platform_coverage.items():
            avg_quality = np.mean(scores)
            project_count = len(scores)
            gap_score = (10 - avg_quality) / 10.0 + (10 - project_count) / 10.0
            gaps.append({
                'type': 'platform',
                'name': platform,
                'gap_score': gap_score,
                'avg_quality': avg_quality,
                'project_count': project_count
            })
        
        # Sort gaps by opportunity
        gaps.sort(key=lambda x: x['gap_score'], reverse=True)
        
        # Find projects that could fill these gaps
        gap_recommendations = []
        
        for gap in gaps[:num_recommendations]:
            # Find projects in this gap area with improvement potential
            gap_projects = []
            
            if gap['type'] == 'category':
                gap_projects = self.category_projects.get(gap['name'], [])
            elif gap['type'] == 'platform':
                gap_projects = self.platform_projects.get(gap['name'], [])
            
            # Get lowest quality projects in this gap (improvement opportunities)
            project_qualities = []
            for project_id in gap_projects:
                metrics = self.analyzer.get_project_metrics(project_id)
                project_qualities.append((project_id, metrics.quality_score))
            
            project_qualities.sort(key=lambda x: x[1])  # Sort by quality (lowest first)
            
            if project_qualities:
                project_id, quality = project_qualities[0]
                gap_recommendations.append({
                    'project_id': project_id,
                    'project_name': self.all_projects[project_id].get('project_name', project_id),
                    'gap_info': gap,
                    'current_quality': quality,
                    'improvement_potential': 10 - quality,
                    'metrics': asdict(self.analyzer.get_project_metrics(project_id))
                })
        
        return {
            'user_profile': asdict(profile),
            'recommendation_type': 'gap_analysis',
            'timestamp': datetime.now().isoformat(),
            'market_gaps': gaps[:10],  # Top 10 gaps
            'recommendations': gap_recommendations
        }
    
    def _generate_match_reasons(self, project_id: str, profile: UserProfile) -> List[str]:
        """Generate reasons why a project matches the user profile"""
        reasons = []
        
        project_data = self.all_projects[project_id]
        metrics = self.analyzer.get_project_metrics(project_id)
        
        # Experience level match
        if profile.experience_level == 'beginner' and metrics.technical_complexity <= 4:
            reasons.append("Low technical complexity suitable for beginners")
        elif profile.experience_level == 'advanced' and metrics.technical_complexity >= 7:
            reasons.append("High technical complexity matches advanced skills")
        
        # Budget compatibility
        estimated_cost = metrics.development_time * 50 * 8  # $50/hour, 8 hours/day
        if estimated_cost <= profile.budget:
            reasons.append(f"Estimated cost (${estimated_cost:,}) fits within budget")
        
        # Timeline compatibility
        if metrics.development_time <= profile.timeline:
            reasons.append(f"Development time ({metrics.development_time} days) fits timeline")
        
        # Category preference
        if project_data.get('category') in profile.preferred_categories:
            reasons.append(f"Matches preferred category: {project_data.get('category')}")
        
        # Risk tolerance
        if profile.risk_tolerance == 'low' and metrics.risk_score <= 4:
            reasons.append("Low risk profile matches risk tolerance")
        elif profile.risk_tolerance == 'high' and metrics.risk_score >= 6:
            reasons.append("High risk/reward profile matches risk tolerance")
        
        # Revenue potential
        revenue = metrics.revenue_potential.get('realistic', 0)
        if revenue >= 2000:
            reasons.append(f"Strong revenue potential: ${revenue:,}/month")
        
        # Platform preference
        project_platforms = set(project_data.get('platforms', {}).keys())
        user_platforms = set(profile.platforms)
        if project_platforms.intersection(user_platforms):
            matching_platforms = project_platforms.intersection(user_platforms)
            reasons.append(f"Matches preferred platforms: {', '.join(matching_platforms)}")
        
        return reasons
    
    def _generate_recommendation_explanation(self, profile: UserProfile, 
                                           top_projects: List[Tuple[str, float]]) -> str:
        """Generate explanation for why these recommendations were made"""
        
        explanations = []
        
        # Profile-based explanation
        explanations.append(f"Based on your {profile.experience_level} experience level")
        explanations.append(f"${profile.budget:,} budget and {profile.timeline}-day timeline")
        
        if profile.preferred_categories:
            explanations.append(f"Preference for {', '.join(profile.preferred_categories)} projects")
        
        explanations.append(f"{profile.risk_tolerance} risk tolerance")
        
        # Recommendation-based explanation
        if top_projects:
            top_score = top_projects[0][1]
            explanations.append(f"Top recommendation has {top_score:.1%} compatibility")
        
        return ". ".join(explanations) + "."
    
    def _generate_trending_reasons(self, project_id: str) -> List[str]:
        """Generate reasons why a project is trending"""
        reasons = []
        
        metrics = self.analyzer.get_project_metrics(project_id)
        
        if metrics.quality_score >= 7:
            reasons.append("High quality score")
        
        if metrics.revenue_potential.get('realistic', 0) >= 3000:
            reasons.append("Strong revenue potential")
        
        if metrics.technical_complexity <= 4:
            reasons.append("Accessible implementation")
        
        if metrics.development_time <= 10:
            reasons.append("Quick to market")
        
        if metrics.market_opportunity >= 7:
            reasons.append("Large market opportunity")
        
        return reasons
    
    def _generate_similarity_reasons(self, project_id: str, reference_project: str) -> List[str]:
        """Generate reasons why projects are similar"""
        reasons = []
        
        project_data = self.all_projects[project_id]
        reference_data = self.all_projects[reference_project]
        
        # Category similarity
        if project_data.get('category') == reference_data.get('category'):
            reasons.append("Same category")
        
        # Platform similarity
        project_platforms = set(project_data.get('platforms', {}).keys())
        reference_platforms = set(reference_data.get('platforms', {}).keys())
        common_platforms = project_platforms.intersection(reference_platforms)
        if common_platforms:
            reasons.append(f"Common platforms: {', '.join(common_platforms)}")
        
        # Complexity similarity
        project_metrics = self.analyzer.get_project_metrics(project_id)
        reference_metrics = self.analyzer.get_project_metrics(reference_project)
        
        if abs(project_metrics.technical_complexity - reference_metrics.technical_complexity) <= 2:
            reasons.append("Similar technical complexity")
        
        # Revenue similarity
        project_revenue = project_metrics.revenue_potential.get('realistic', 0)
        reference_revenue = reference_metrics.revenue_potential.get('realistic', 0)
        
        if abs(project_revenue - reference_revenue) / max(project_revenue, reference_revenue, 1) <= 0.5:
            reasons.append("Similar revenue potential")
        
        return reasons
    
    def _analyze_project_fit(self, project_id: str, profile: UserProfile) -> Dict[str, Any]:
        """Analyze how well a project fits the user profile"""
        
        metrics = self.analyzer.get_project_metrics(project_id)
        project_data = self.all_projects[project_id]
        
        fit_analysis = {
            'overall_fit': 'Good',  # Will be calculated
            'strengths': [],
            'concerns': [],
            'effort_required': 'Medium',
            'success_probability': 0.7
        }
        
        # Calculate fit scores
        fit_scores = []
        
        # Technical fit
        if profile.experience_level == 'beginner' and metrics.technical_complexity <= 4:
            fit_scores.append(0.9)
            fit_analysis['strengths'].append("Technical complexity matches skill level")
        elif profile.experience_level == 'advanced' and metrics.technical_complexity >= 6:
            fit_scores.append(0.8)
            fit_analysis['strengths'].append("Technical challenge matches expertise")
        elif abs(metrics.technical_complexity - 5) <= 2:
            fit_scores.append(0.7)
        else:
            fit_scores.append(0.4)
            fit_analysis['concerns'].append("Technical complexity mismatch")
        
        # Resource fit
        estimated_cost = metrics.development_time * 50 * 8
        if estimated_cost <= profile.budget:
            fit_scores.append(0.9)
            fit_analysis['strengths'].append("Within budget constraints")
        else:
            fit_scores.append(0.3)
            fit_analysis['concerns'].append("May exceed budget")
        
        # Timeline fit
        if metrics.development_time <= profile.timeline:
            fit_scores.append(0.9)
            fit_analysis['strengths'].append("Fits timeline requirements")
        else:
            fit_scores.append(0.4)
            fit_analysis['concerns'].append("May exceed timeline")
        
        # Risk fit
        risk_fit = self._calculate_risk_compatibility(metrics, profile)
        fit_scores.append(risk_fit)
        if risk_fit >= 0.7:
            fit_analysis['strengths'].append("Risk level matches tolerance")
        elif risk_fit <= 0.3:
            fit_analysis['concerns'].append("Risk level mismatch")
        
        # Overall fit calculation
        overall_fit = np.mean(fit_scores)
        if overall_fit >= 0.8:
            fit_analysis['overall_fit'] = 'Excellent'
        elif overall_fit >= 0.6:
            fit_analysis['overall_fit'] = 'Good'
        elif overall_fit >= 0.4:
            fit_analysis['overall_fit'] = 'Fair'
        else:
            fit_analysis['overall_fit'] = 'Poor'
        
        # Effort required
        effort_score = (metrics.technical_complexity + metrics.development_time / 7) / 2
        if effort_score <= 3:
            fit_analysis['effort_required'] = 'Low'
        elif effort_score <= 6:
            fit_analysis['effort_required'] = 'Medium'
        else:
            fit_analysis['effort_required'] = 'High'
        
        # Success probability
        success_factors = [
            metrics.quality_score / 10,
            metrics.market_opportunity / 10,
            1 - metrics.risk_score / 10,
            overall_fit
        ]
        fit_analysis['success_probability'] = np.mean(success_factors)
        
        return fit_analysis
    
    def _suggest_next_steps(self, project_id: str, profile: UserProfile) -> List[str]:
        """Suggest next steps for a recommended project"""
        
        next_steps = []
        
        project_data = self.all_projects[project_id]
        metrics = self.analyzer.get_project_metrics(project_id)
        
        # Always start with research
        next_steps.append("Research market demand and competition")
        
        # Technical preparation
        if metrics.technical_complexity >= 6:
            next_steps.append("Create detailed technical specification")
            next_steps.append("Identify required skills and tools")
        
        # Budget planning
        estimated_cost = metrics.development_time * 50 * 8
        if estimated_cost > profile.budget * 0.8:
            next_steps.append("Secure additional funding or reduce scope")
        
        # Team planning
        if profile.team_size == 1 and metrics.development_time >= 21:
            next_steps.append("Consider hiring additional team members")
        
        # Risk mitigation
        if metrics.risk_score >= 6:
            next_steps.append("Develop risk mitigation strategies")
        
        # Market validation
        if metrics.market_opportunity <= 5:
            next_steps.append("Validate market need through surveys or interviews")
        
        # Platform preparation
        platforms = project_data.get('platforms', {})
        if len(platforms) > 1:
            next_steps.append("Choose initial platform for MVP")
        
        # Revenue planning
        if metrics.revenue_potential.get('realistic', 0) >= 2000:
            next_steps.append("Develop detailed monetization strategy")
        
        next_steps.append("Create project timeline and milestones")
        next_steps.append("Build minimum viable product (MVP)")
        
        return next_steps
    
    def find_projects_like(self, project_id: str, 
                          num_similar: int = 5) -> Dict[str, Any]:
        """Find projects similar to a given project"""
        
        if project_id not in self.all_projects:
            raise ValueError(f"Project '{project_id}' not found")
        
        reference_data = self.all_projects[project_id]
        similarity_scores = {}
        
        for pid in self.all_projects.keys():
            if pid == project_id:
                continue
            
            project_data = self.all_projects[pid]
            similarity = calculate_similarity(reference_data, project_data)
            similarity_scores[pid] = similarity
        
        # Sort by similarity
        sorted_projects = sorted(similarity_scores.items(), key=lambda x: x[1], reverse=True)
        top_projects = sorted_projects[:num_similar]
        
        return {
            'reference_project': {
                'id': project_id,
                'name': reference_data.get('project_name', project_id),
                'category': reference_data.get('category', 'unknown')
            },
            'similar_projects': [
                {
                    'project_id': pid,
                    'project_name': self.all_projects[pid].get('project_name', pid),
                    'category': self.all_projects[pid].get('category', 'unknown'),
                    'similarity_score': score,
                    'similarity_reasons': self._generate_similarity_reasons(pid, project_id)
                }
                for pid, score in top_projects
            ]
        }
    
    def display_recommendations(self, recommendations: Dict[str, Any]):
        """Display recommendations in console"""
        
        print("\n" + "="*80)
        print("PROJECT RECOMMENDATIONS")
        print("="*80)
        
        rec_type = recommendations['recommendation_type']
        print(f"\nRecommendation Type: {rec_type.title()}")
        
        if 'explanation' in recommendations:
            print(f"Explanation: {recommendations['explanation']}")
        
        print(f"\nTop {len(recommendations['recommendations'])} Recommendations:")
        print("-" * 50)
        
        for i, rec in enumerate(recommendations['recommendations'], 1):
            print(f"\n{i}. {rec['project_name']} ({rec['category']})")
            
            if 'compatibility_score' in rec:
                print(f"   Compatibility: {rec['compatibility_score']:.1%}")
            elif 'trending_score' in rec:
                print(f"   Trending Score: {rec['trending_score']:.3f}")
            elif 'similarity_score' in rec:
                print(f"   Similarity: {rec['similarity_score']:.1%}")
            
            # Show key metrics
            metrics = rec['metrics']
            print(f"   Quality: {metrics['quality_score']:.1f}/10")
            print(f"   Revenue: ${metrics['revenue_potential']['realistic']:,}/month")
            print(f"   Complexity: {metrics['technical_complexity']:.1f}/10")
            print(f"   Time: {metrics['development_time']:.0f} days")
            
            # Show reasons
            if 'match_reasons' in rec:
                print("   Why it matches:")
                for reason in rec['match_reasons'][:3]:
                    print(f"     • {reason}")
            
            if 'trending_reasons' in rec:
                print("   Why it's trending:")
                for reason in rec['trending_reasons'][:3]:
                    print(f"     • {reason}")
            
            if 'similarity_reasons' in rec:
                print("   Why it's similar:")
                for reason in rec['similarity_reasons'][:3]:
                    print(f"     • {reason}")
        
        print("\n" + "="*80)


def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(description="AI-powered project recommendation engine")
    parser.add_argument("--user-id", required=True, help="User ID for recommendations")
    parser.add_argument("--create-profile", action="store_true", help="Create or update user profile")
    parser.add_argument("--type", choices=['personalized', 'trending', 'similar', 'gap_analysis'], 
                       default='personalized', help="Type of recommendations")
    parser.add_argument("--num-recs", type=int, default=10, help="Number of recommendations")
    parser.add_argument("--export", choices=["json", "csv", "markdown"], help="Export format")
    parser.add_argument("--find-similar", help="Find projects similar to given project ID")
    
    # Profile creation arguments
    parser.add_argument("--experience", choices=['beginner', 'intermediate', 'advanced'], 
                       default='intermediate', help="Experience level")
    parser.add_argument("--budget", type=int, default=1000, help="Budget in USD")
    parser.add_argument("--timeline", type=int, default=30, help="Timeline in days")
    parser.add_argument("--team-size", type=int, default=1, help="Team size")
    parser.add_argument("--categories", nargs="+", help="Preferred categories")
    parser.add_argument("--risk-tolerance", choices=['low', 'medium', 'high'], 
                       default='medium', help="Risk tolerance")
    parser.add_argument("--revenue-priority", type=float, default=0.5, 
                       help="Revenue priority (0-1)")
    parser.add_argument("--tech-preference", choices=['simple', 'moderate', 'complex'], 
                       default='moderate', help="Technical preference")
    parser.add_argument("--platforms", nargs="+", help="Preferred platforms")
    
    args = parser.parse_args()
    
    engine = RecommendationEngine()
    
    try:
        if args.create_profile:
            # Create user profile
            profile = engine.create_user_profile(
                args.user_id,
                experience_level=args.experience,
                budget=args.budget,
                timeline=args.timeline,
                team_size=args.team_size,
                preferred_categories=args.categories or [],
                risk_tolerance=args.risk_tolerance,
                revenue_priority=args.revenue_priority,
                technical_preference=args.tech_preference,
                platforms=args.platforms or []
            )
            print(f"Profile created for user '{args.user_id}'")
            print(f"Experience: {profile.experience_level}")
            print(f"Budget: ${profile.budget:,}")
            print(f"Timeline: {profile.timeline} days")
            return
        
        if args.find_similar:
            # Find similar projects
            similar = engine.find_projects_like(args.find_similar, args.num_recs)
            
            print(f"\nProjects similar to '{similar['reference_project']['name']}':")
            for proj in similar['similar_projects']:
                print(f"  {proj['project_name']} (similarity: {proj['similarity_score']:.1%})")
            return
        
        # Get recommendations
        recommendations = engine.get_recommendations(
            args.user_id,
            args.num_recs,
            args.type
        )
        
        # Display recommendations
        engine.display_recommendations(recommendations)
        
        # Export if requested
        if args.export:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"recommendations_{args.user_id}_{timestamp}.{args.export}"
            
            if args.export == 'json':
                engine.report_generator.export_to_json(recommendations, filename)
            elif args.export == 'csv':
                # Convert to CSV format
                csv_data = []
                for rec in recommendations['recommendations']:
                    csv_data.append({
                        'project_id': rec['project_id'],
                        'project_name': rec['project_name'],
                        'category': rec['category'],
                        'compatibility_score': rec.get('compatibility_score', 0),
                        'quality_score': rec['metrics']['quality_score'],
                        'revenue_potential': rec['metrics']['revenue_potential']['realistic'],
                        'technical_complexity': rec['metrics']['technical_complexity'],
                        'development_time': rec['metrics']['development_time']
                    })
                engine.report_generator.export_to_csv(csv_data, filename)
            
            print(f"\nRecommendations exported to: {filename}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()