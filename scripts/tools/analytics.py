#!/usr/bin/env python3
"""
Advanced Analytics and Visualization Tools
Provides comprehensive analytics, trend analysis, and visualization capabilities
"""

import argparse
import json
import sys
import os
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import math
import statistics
from collections import defaultdict, Counter

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tools.utils import (
    ProjectDataLoader, ProjectAnalyzer, ReportGenerator, 
    ProjectMetrics, calculate_similarity
)


@dataclass
class TrendAnalysis:
    """Trend analysis results"""
    metric_name: str
    trend_direction: str  # 'up', 'down', 'stable'
    trend_strength: float  # 0-1
    correlation_with_quality: float
    outliers: List[str]
    recommendations: List[str]


@dataclass
class MarketSegment:
    """Market segment analysis"""
    segment_name: str
    project_count: int
    avg_quality: float
    avg_revenue: float
    avg_complexity: float
    market_saturation: float
    growth_potential: float
    top_projects: List[str]


class AdvancedAnalytics:
    """Advanced analytics and visualization system"""
    
    def __init__(self):
        self.data_loader = ProjectDataLoader()
        self.analyzer = ProjectAnalyzer(self.data_loader)
        self.report_generator = ReportGenerator(self.analyzer)
        self.all_projects = self.data_loader.get_all_projects()
        
        # Initialize analytics data structures
        self.project_vectors = {}
        self.similarity_matrix = {}
        self.trend_data = {}
        
        self._precompute_analytics_data()
    
    def _precompute_analytics_data(self):
        """Precompute analytics data structures for better performance"""
        
        # Create project feature vectors
        for project_id in self.all_projects.keys():
            metrics = self.analyzer.get_project_metrics(project_id)
            
            self.project_vectors[project_id] = {
                'quality_score': metrics.quality_score,
                'revenue_realistic': metrics.revenue_potential.get('realistic', 0),
                'technical_complexity': metrics.technical_complexity,
                'development_time': metrics.development_time,
                'market_opportunity': metrics.market_opportunity,
                'risk_score': metrics.risk_score,
                'platform_coverage': metrics.platform_coverage,
                'completeness_score': metrics.completeness_score
            }
        
        # Compute similarity matrix
        project_ids = list(self.all_projects.keys())
        for i, project_id1 in enumerate(project_ids):
            self.similarity_matrix[project_id1] = {}
            for j, project_id2 in enumerate(project_ids):
                if i <= j:
                    project1 = self.all_projects[project_id1]
                    project2 = self.all_projects[project_id2]
                    similarity = calculate_similarity(project1, project2)
                    self.similarity_matrix[project_id1][project_id2] = similarity
                    if project_id2 not in self.similarity_matrix:
                        self.similarity_matrix[project_id2] = {}
                    self.similarity_matrix[project_id2][project_id1] = similarity
    
    def analyze_portfolio_trends(self) -> Dict[str, Any]:
        """Analyze trends across the entire project portfolio"""
        
        print("\n" + "="*80)
        print("PORTFOLIO TREND ANALYSIS")
        print("="*80)
        
        trend_analysis = {}
        
        # Get all project vectors
        vectors = list(self.project_vectors.values())
        if not vectors:
            return {'error': 'No project data available'}
        
        # Analyze each metric
        metrics = ['quality_score', 'revenue_realistic', 'technical_complexity', 
                  'development_time', 'market_opportunity', 'risk_score']
        
        for metric in metrics:
            values = [v[metric] for v in vectors]
            
            # Calculate trend statistics
            trend_stats = {
                'mean': np.mean(values),
                'median': np.median(values),
                'std': np.std(values),
                'min': np.min(values),
                'max': np.max(values),
                'percentiles': {
                    '25th': np.percentile(values, 25),
                    '75th': np.percentile(values, 75),
                    '90th': np.percentile(values, 90)
                }
            }
            
            # Find outliers (values beyond 2 standard deviations)
            outlier_threshold = 2 * trend_stats['std']
            outliers = []
            
            for project_id, vector in self.project_vectors.items():
                value = vector[metric]
                if abs(value - trend_stats['mean']) > outlier_threshold:
                    outliers.append({
                        'project_id': project_id,
                        'project_name': self.all_projects[project_id].get('project_name', project_id),
                        'value': value,
                        'deviation': abs(value - trend_stats['mean'])
                    })
            
            # Sort outliers by deviation
            outliers.sort(key=lambda x: x['deviation'], reverse=True)
            
            # Correlation with quality score
            quality_values = [v['quality_score'] for v in vectors]
            correlation = np.corrcoef(values, quality_values)[0, 1] if len(values) > 1 else 0
            
            # Generate recommendations
            recommendations = self._generate_trend_recommendations(metric, trend_stats, outliers, correlation)
            
            trend_analysis[metric] = {
                'statistics': trend_stats,
                'outliers': outliers[:5],  # Top 5 outliers
                'quality_correlation': correlation,
                'recommendations': recommendations
            }
        
        # Overall portfolio health
        portfolio_health = self._calculate_portfolio_health(trend_analysis)
        trend_analysis['portfolio_health'] = portfolio_health
        
        # Display results
        self._display_trend_analysis(trend_analysis)
        
        return trend_analysis
    
    def _generate_trend_recommendations(self, metric: str, stats: Dict[str, Any], 
                                      outliers: List[Dict], correlation: float) -> List[str]:
        """Generate recommendations based on trend analysis"""
        
        recommendations = []
        
        if metric == 'quality_score':
            if stats['mean'] < 6:
                recommendations.append("Overall quality is below average - focus on improving project selection criteria")
            if stats['std'] > 2:
                recommendations.append("High quality variance - establish more consistent evaluation standards")
        
        elif metric == 'revenue_realistic':
            if stats['mean'] < 2000:
                recommendations.append("Low average revenue potential - consider higher-value project opportunities")
            if len(outliers) > 0:
                recommendations.append("Consider why some projects have much higher revenue potential")
        
        elif metric == 'technical_complexity':
            if stats['mean'] > 7:
                recommendations.append("High average complexity - consider simpler alternatives for faster development")
            if stats['std'] > 2:
                recommendations.append("Wide complexity range - segment projects by skill level requirements")
        
        elif metric == 'development_time':
            if stats['mean'] > 30:
                recommendations.append("Long average development time - consider breaking projects into phases")
            if stats['std'] > 15:
                recommendations.append("High time variance - improve estimation accuracy")
        
        elif metric == 'risk_score':
            if stats['mean'] > 6:
                recommendations.append("High average risk - implement risk mitigation strategies")
            if correlation > 0.5:
                recommendations.append("Risk positively correlates with quality - balanced approach needed")
        
        # Correlation-based recommendations
        if abs(correlation) > 0.7:
            if correlation > 0:
                recommendations.append(f"Strong positive correlation with quality - {metric} is a good quality indicator")
            else:
                recommendations.append(f"Strong negative correlation with quality - monitor {metric} carefully")
        
        return recommendations
    
    def _calculate_portfolio_health(self, trend_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall portfolio health score"""
        
        health_score = 0
        max_score = 0
        
        # Quality score health (higher is better)
        quality_stats = trend_analysis['quality_score']['statistics']
        quality_health = min(quality_stats['mean'] / 10, 1.0)
        health_score += quality_health * 0.3
        max_score += 0.3
        
        # Revenue health (higher is better, normalized to $10k)
        revenue_stats = trend_analysis['revenue_realistic']['statistics']
        revenue_health = min(revenue_stats['mean'] / 10000, 1.0)
        health_score += revenue_health * 0.25
        max_score += 0.25
        
        # Complexity health (moderate is better)
        complexity_stats = trend_analysis['technical_complexity']['statistics']
        complexity_health = 1.0 - abs(complexity_stats['mean'] - 5) / 5
        health_score += complexity_health * 0.15
        max_score += 0.15
        
        # Time health (shorter is better, normalized to 30 days)
        time_stats = trend_analysis['development_time']['statistics']
        time_health = max(0, 1.0 - time_stats['mean'] / 30)
        health_score += time_health * 0.15
        max_score += 0.15
        
        # Risk health (lower is better)
        risk_stats = trend_analysis['risk_score']['statistics']
        risk_health = max(0, 1.0 - risk_stats['mean'] / 10)
        health_score += risk_health * 0.15
        max_score += 0.15
        
        # Normalize to 0-1 scale
        overall_health = health_score / max_score if max_score > 0 else 0
        
        # Health grade
        if overall_health >= 0.8:
            grade = 'A'
        elif overall_health >= 0.6:
            grade = 'B'
        elif overall_health >= 0.4:
            grade = 'C'
        elif overall_health >= 0.2:
            grade = 'D'
        else:
            grade = 'F'
        
        return {
            'overall_score': overall_health,
            'grade': grade,
            'component_scores': {
                'quality': quality_health,
                'revenue': revenue_health,
                'complexity': complexity_health,
                'time': time_health,
                'risk': risk_health
            }
        }
    
    def _display_trend_analysis(self, trend_analysis: Dict[str, Any]):
        """Display trend analysis results"""
        
        print("\n📊 PORTFOLIO STATISTICS")
        print("-" * 60)
        
        for metric, analysis in trend_analysis.items():
            if metric == 'portfolio_health':
                continue
            
            stats = analysis['statistics']
            print(f"\n{metric.replace('_', ' ').title()}:")
            print(f"  Mean: {stats['mean']:.2f}")
            print(f"  Median: {stats['median']:.2f}")
            print(f"  Std Dev: {stats['std']:.2f}")
            print(f"  Range: {stats['min']:.2f} - {stats['max']:.2f}")
            print(f"  Quality Correlation: {analysis['quality_correlation']:.3f}")
            
            if analysis['outliers']:
                print(f"  Top Outliers:")
                for outlier in analysis['outliers'][:3]:
                    print(f"    • {outlier['project_name']}: {outlier['value']:.2f}")
        
        # Portfolio health
        if 'portfolio_health' in trend_analysis:
            health = trend_analysis['portfolio_health']
            print(f"\n🏥 PORTFOLIO HEALTH: {health['grade']} ({health['overall_score']:.1%})")
            
            components = health['component_scores']
            for component, score in components.items():
                print(f"  {component.title()}: {score:.1%}")
    
    def segment_market_analysis(self) -> Dict[str, Any]:
        """Perform market segmentation analysis"""
        
        print("\n" + "="*80)
        print("MARKET SEGMENTATION ANALYSIS")
        print("="*80)
        
        segmentation_results = {}
        
        # Segment by category
        category_segments = self._segment_by_category()
        segmentation_results['by_category'] = category_segments
        
        # Segment by revenue potential
        revenue_segments = self._segment_by_revenue()
        segmentation_results['by_revenue'] = revenue_segments
        
        # Segment by complexity
        complexity_segments = self._segment_by_complexity()
        segmentation_results['by_complexity'] = complexity_segments
        
        # Segment by platform
        platform_segments = self._segment_by_platform()
        segmentation_results['by_platform'] = platform_segments
        
        # Find market gaps
        market_gaps = self._identify_market_gaps()
        segmentation_results['market_gaps'] = market_gaps
        
        # Display results
        self._display_segmentation_results(segmentation_results)
        
        return segmentation_results
    
    def _segment_by_category(self) -> Dict[str, MarketSegment]:
        """Segment projects by category"""
        
        categories = {}
        
        for project_id, project_data in self.all_projects.items():
            category = project_data.get('category', 'unknown')
            metrics = self.analyzer.get_project_metrics(project_id)
            
            if category not in categories:
                categories[category] = {
                    'projects': [],
                    'quality_scores': [],
                    'revenue_values': [],
                    'complexity_values': []
                }
            
            categories[category]['projects'].append(project_id)
            categories[category]['quality_scores'].append(metrics.quality_score)
            categories[category]['revenue_values'].append(metrics.revenue_potential.get('realistic', 0))
            categories[category]['complexity_values'].append(metrics.technical_complexity)
        
        # Calculate segment statistics
        segments = {}
        
        for category, data in categories.items():
            project_count = len(data['projects'])
            avg_quality = np.mean(data['quality_scores'])
            avg_revenue = np.mean(data['revenue_values'])
            avg_complexity = np.mean(data['complexity_values'])
            
            # Market saturation (based on project count and average quality)
            # More projects with lower quality = higher saturation
            saturation = min(project_count / 10, 1.0) * (1.0 - avg_quality / 10)
            
            # Growth potential (inverse of saturation, adjusted for quality)
            growth_potential = (1.0 - saturation) * (avg_quality / 10)
            
            # Top projects in segment
            project_metrics = [(pid, self.analyzer.get_project_metrics(pid).quality_score) 
                             for pid in data['projects']]
            project_metrics.sort(key=lambda x: x[1], reverse=True)
            top_projects = [pid for pid, _ in project_metrics[:5]]
            
            segments[category] = MarketSegment(
                segment_name=category,
                project_count=project_count,
                avg_quality=avg_quality,
                avg_revenue=avg_revenue,
                avg_complexity=avg_complexity,
                market_saturation=saturation,
                growth_potential=growth_potential,
                top_projects=top_projects
            )
        
        return segments
    
    def _segment_by_revenue(self) -> Dict[str, MarketSegment]:
        """Segment projects by revenue potential"""
        
        revenue_ranges = {
            'low': (0, 1000),
            'medium': (1000, 5000),
            'high': (5000, float('inf'))
        }
        
        segments = {}
        
        for range_name, (min_revenue, max_revenue) in revenue_ranges.items():
            projects_in_range = []
            
            for project_id in self.all_projects.keys():
                metrics = self.analyzer.get_project_metrics(project_id)
                revenue = metrics.revenue_potential.get('realistic', 0)
                
                if min_revenue <= revenue < max_revenue:
                    projects_in_range.append(project_id)
            
            if projects_in_range:
                # Calculate statistics
                quality_scores = [self.analyzer.get_project_metrics(pid).quality_score 
                                for pid in projects_in_range]
                revenue_values = [self.analyzer.get_project_metrics(pid).revenue_potential.get('realistic', 0) 
                                for pid in projects_in_range]
                complexity_values = [self.analyzer.get_project_metrics(pid).technical_complexity 
                                   for pid in projects_in_range]
                
                # Market saturation based on project count and revenue distribution
                saturation = min(len(projects_in_range) / 20, 1.0)
                
                # Growth potential
                growth_potential = (1.0 - saturation) * (np.mean(quality_scores) / 10)
                
                # Top projects
                project_metrics = [(pid, self.analyzer.get_project_metrics(pid).quality_score) 
                                 for pid in projects_in_range]
                project_metrics.sort(key=lambda x: x[1], reverse=True)
                top_projects = [pid for pid, _ in project_metrics[:5]]
                
                segments[range_name] = MarketSegment(
                    segment_name=f"{range_name}_revenue",
                    project_count=len(projects_in_range),
                    avg_quality=np.mean(quality_scores),
                    avg_revenue=np.mean(revenue_values),
                    avg_complexity=np.mean(complexity_values),
                    market_saturation=saturation,
                    growth_potential=growth_potential,
                    top_projects=top_projects
                )
        
        return segments
    
    def _segment_by_complexity(self) -> Dict[str, MarketSegment]:
        """Segment projects by technical complexity"""
        
        complexity_ranges = {
            'simple': (0, 4),
            'moderate': (4, 7),
            'complex': (7, 10)
        }
        
        segments = {}
        
        for range_name, (min_complexity, max_complexity) in complexity_ranges.items():
            projects_in_range = []
            
            for project_id in self.all_projects.keys():
                metrics = self.analyzer.get_project_metrics(project_id)
                complexity = metrics.technical_complexity
                
                if min_complexity <= complexity < max_complexity:
                    projects_in_range.append(project_id)
            
            if projects_in_range:
                # Calculate statistics
                quality_scores = [self.analyzer.get_project_metrics(pid).quality_score 
                                for pid in projects_in_range]
                revenue_values = [self.analyzer.get_project_metrics(pid).revenue_potential.get('realistic', 0) 
                                for pid in projects_in_range]
                complexity_values = [self.analyzer.get_project_metrics(pid).technical_complexity 
                                   for pid in projects_in_range]
                
                # Market saturation
                saturation = min(len(projects_in_range) / 30, 1.0)
                
                # Growth potential (adjusted for complexity level)
                complexity_factor = 1.0 if range_name == 'moderate' else 0.8
                growth_potential = (1.0 - saturation) * (np.mean(quality_scores) / 10) * complexity_factor
                
                # Top projects
                project_metrics = [(pid, self.analyzer.get_project_metrics(pid).quality_score) 
                                 for pid in projects_in_range]
                project_metrics.sort(key=lambda x: x[1], reverse=True)
                top_projects = [pid for pid, _ in project_metrics[:5]]
                
                segments[range_name] = MarketSegment(
                    segment_name=f"{range_name}_complexity",
                    project_count=len(projects_in_range),
                    avg_quality=np.mean(quality_scores),
                    avg_revenue=np.mean(revenue_values),
                    avg_complexity=np.mean(complexity_values),
                    market_saturation=saturation,
                    growth_potential=growth_potential,
                    top_projects=top_projects
                )
        
        return segments
    
    def _segment_by_platform(self) -> Dict[str, MarketSegment]:
        """Segment projects by platform"""
        
        platform_projects = defaultdict(list)
        
        for project_id, project_data in self.all_projects.items():
            platforms = project_data.get('platforms', {})
            
            for platform in platforms.keys():
                platform_projects[platform].append(project_id)
        
        segments = {}
        
        for platform, projects in platform_projects.items():
            if len(projects) < 3:  # Skip platforms with too few projects
                continue
            
            # Calculate statistics
            quality_scores = [self.analyzer.get_project_metrics(pid).quality_score 
                            for pid in projects]
            revenue_values = [self.analyzer.get_project_metrics(pid).revenue_potential.get('realistic', 0) 
                            for pid in projects]
            complexity_values = [self.analyzer.get_project_metrics(pid).technical_complexity 
                               for pid in projects]
            
            # Market saturation
            saturation = min(len(projects) / 15, 1.0)
            
            # Growth potential
            growth_potential = (1.0 - saturation) * (np.mean(quality_scores) / 10)
            
            # Top projects
            project_metrics = [(pid, self.analyzer.get_project_metrics(pid).quality_score) 
                             for pid in projects]
            project_metrics.sort(key=lambda x: x[1], reverse=True)
            top_projects = [pid for pid, _ in project_metrics[:3]]
            
            segments[platform] = MarketSegment(
                segment_name=platform,
                project_count=len(projects),
                avg_quality=np.mean(quality_scores),
                avg_revenue=np.mean(revenue_values),
                avg_complexity=np.mean(complexity_values),
                market_saturation=saturation,
                growth_potential=growth_potential,
                top_projects=top_projects
            )
        
        return segments
    
    def _identify_market_gaps(self) -> List[Dict[str, Any]]:
        """Identify potential market gaps and opportunities"""
        
        gaps = []
        
        # Category gaps (categories with few high-quality projects)
        category_segments = self._segment_by_category()
        
        for category, segment in category_segments.items():
            if segment.project_count < 5 and segment.avg_quality < 6:
                gaps.append({
                    'type': 'category',
                    'name': category,
                    'gap_type': 'quality',
                    'description': f"Category '{category}' has few high-quality projects",
                    'opportunity_score': (10 - segment.avg_quality) / 10,
                    'project_count': segment.project_count
                })
        
        # Revenue gaps (high complexity, low revenue)
        for project_id, project_data in self.all_projects.items():
            metrics = self.analyzer.get_project_metrics(project_id)
            
            if metrics.technical_complexity >= 7 and metrics.revenue_potential.get('realistic', 0) < 2000:
                gaps.append({
                    'type': 'project',
                    'name': project_data.get('project_name', project_id),
                    'gap_type': 'revenue',
                    'description': 'High complexity project with low revenue potential',
                    'opportunity_score': metrics.technical_complexity / 10,
                    'current_revenue': metrics.revenue_potential.get('realistic', 0)
                })
        
        # Platform gaps (platforms with low coverage)
        platform_segments = self._segment_by_platform()
        all_platforms = set()
        
        for project_data in self.all_projects.values():
            all_platforms.update(project_data.get('platforms', {}).keys())
        
        for platform in all_platforms:
            if platform not in platform_segments:
                gaps.append({
                    'type': 'platform',
                    'name': platform,
                    'gap_type': 'coverage',
                    'description': f"Platform '{platform}' has insufficient project coverage",
                    'opportunity_score': 0.8,  # High opportunity for uncovered platforms
                    'project_count': 0
                })
        
        # Sort gaps by opportunity score
        gaps.sort(key=lambda x: x['opportunity_score'], reverse=True)
        
        return gaps[:10]  # Return top 10 gaps
    
    def _display_segmentation_results(self, segmentation_results: Dict[str, Any]):
        """Display market segmentation results"""
        
        print("\n📊 MARKET SEGMENTATION RESULTS")
        print("-" * 60)
        
        # Category segments
        print("\n🏷️  BY CATEGORY:")
        category_segments = segmentation_results['by_category']
        for category, segment in category_segments.items():
            print(f"  {category}:")
            print(f"    Projects: {segment.project_count}")
            print(f"    Avg Quality: {segment.avg_quality:.1f}")
            print(f"    Avg Revenue: ${segment.avg_revenue:,.0f}")
            print(f"    Saturation: {segment.market_saturation:.1%}")
            print(f"    Growth Potential: {segment.growth_potential:.1%}")
        
        # Revenue segments
        print("\n💰 BY REVENUE:")
        revenue_segments = segmentation_results['by_revenue']
        for revenue_range, segment in revenue_segments.items():
            print(f"  {revenue_range.title()} Revenue:")
            print(f"    Projects: {segment.project_count}")
            print(f"    Avg Quality: {segment.avg_quality:.1f}")
            print(f"    Avg Revenue: ${segment.avg_revenue:,.0f}")
            print(f"    Growth Potential: {segment.growth_potential:.1%}")
        
        # Market gaps
        print("\n🔍 MARKET GAPS:")
        gaps = segmentation_results['market_gaps']
        for i, gap in enumerate(gaps[:5], 1):
            print(f"  {i}. {gap['name']} ({gap['type']})")
            print(f"     {gap['description']}")
            print(f"     Opportunity Score: {gap['opportunity_score']:.1%}")
    
    def analyze_competitive_landscape(self) -> Dict[str, Any]:
        """Analyze competitive landscape and positioning"""
        
        print("\n" + "="*80)
        print("COMPETITIVE LANDSCAPE ANALYSIS")
        print("="*80)
        
        competitive_analysis = {}
        
        # Cluster projects by similarity
        clusters = self._cluster_similar_projects()
        competitive_analysis['project_clusters'] = clusters
        
        # Analyze competition intensity
        competition_metrics = self._analyze_competition_intensity()
        competitive_analysis['competition_metrics'] = competition_metrics
        
        # Identify competitive advantages
        competitive_advantages = self._identify_competitive_advantages()
        competitive_analysis['competitive_advantages'] = competitive_advantages
        
        # Market positioning analysis
        positioning = self._analyze_market_positioning()
        competitive_analysis['market_positioning'] = positioning
        
        # Display results
        self._display_competitive_analysis(competitive_analysis)
        
        return competitive_analysis
    
    def _cluster_similar_projects(self) -> Dict[str, Any]:
        """Cluster projects by similarity"""
        
        # Simple clustering based on similarity threshold
        clusters = {}
        processed_projects = set()
        cluster_id = 0
        
        for project_id1 in self.all_projects.keys():
            if project_id1 in processed_projects:
                continue
            
            # Start new cluster
            cluster_id += 1
            cluster_name = f"cluster_{cluster_id}"
            clusters[cluster_name] = {
                'projects': [project_id1],
                'center_project': project_id1,
                'avg_similarity': 0,
                'characteristics': {}
            }
            processed_projects.add(project_id1)
            
            # Find similar projects
            for project_id2 in self.all_projects.keys():
                if project_id2 in processed_projects:
                    continue
                
                similarity = self.similarity_matrix[project_id1][project_id2]
                
                if similarity > 0.7:  # High similarity threshold
                    clusters[cluster_name]['projects'].append(project_id2)
                    processed_projects.add(project_id2)
            
            # Calculate cluster characteristics
            cluster_projects = clusters[cluster_name]['projects']
            if len(cluster_projects) > 1:
                similarities = []
                for i in range(len(cluster_projects)):
                    for j in range(i + 1, len(cluster_projects)):
                        similarities.append(
                            self.similarity_matrix[cluster_projects[i]][cluster_projects[j]]
                        )
                
                clusters[cluster_name]['avg_similarity'] = np.mean(similarities)
                
                # Analyze cluster characteristics
                quality_scores = [self.analyzer.get_project_metrics(pid).quality_score 
                                for pid in cluster_projects]
                revenue_values = [self.analyzer.get_project_metrics(pid).revenue_potential.get('realistic', 0) 
                                for pid in cluster_projects]
                
                clusters[cluster_name]['characteristics'] = {
                    'avg_quality': np.mean(quality_scores),
                    'avg_revenue': np.mean(revenue_values),
                    'size': len(cluster_projects)
                }
        
        return clusters
    
    def _analyze_competition_intensity(self) -> Dict[str, Any]:
        """Analyze competition intensity across different dimensions"""
        
        competition_metrics = {}
        
        # Category competition
        category_competition = {}
        categories = {}
        
        for project_id, project_data in self.all_projects.items():
            category = project_data.get('category', 'unknown')
            if category not in categories:
                categories[category] = []
            categories[category].append(project_id)
        
        for category, projects in categories.items():
            if len(projects) < 2:
                continue
            
            # Calculate average similarity within category
            similarities = []
            for i in range(len(projects)):
                for j in range(i + 1, len(projects)):
                    similarities.append(
                        self.similarity_matrix[projects[i]][projects[j]]
                    )
            
            avg_similarity = np.mean(similarities) if similarities else 0
            project_count = len(projects)
            
            # Competition intensity = high similarity + many projects
            competition_intensity = avg_similarity * min(project_count / 10, 1.0)
            
            category_competition[category] = {
                'project_count': project_count,
                'avg_similarity': avg_similarity,
                'competition_intensity': competition_intensity
            }
        
        competition_metrics['by_category'] = category_competition
        
        # Revenue range competition
        revenue_ranges = {
            'low': (0, 1000),
            'medium': (1000, 5000),
            'high': (5000, float('inf'))
        }
        
        revenue_competition = {}
        
        for range_name, (min_revenue, max_revenue) in revenue_ranges.items():
            projects_in_range = []
            
            for project_id in self.all_projects.keys():
                metrics = self.analyzer.get_project_metrics(project_id)
                revenue = metrics.revenue_potential.get('realistic', 0)
                
                if min_revenue <= revenue < max_revenue:
                    projects_in_range.append(project_id)
            
            if len(projects_in_range) >= 2:
                similarities = []
                for i in range(len(projects_in_range)):
                    for j in range(i + 1, len(projects_in_range)):
                        similarities.append(
                            self.similarity_matrix[projects_in_range[i]][projects_in_range[j]]
                        )
                
                avg_similarity = np.mean(similarities) if similarities else 0
                competition_intensity = avg_similarity * min(len(projects_in_range) / 15, 1.0)
                
                revenue_competition[range_name] = {
                    'project_count': len(projects_in_range),
                    'avg_similarity': avg_similarity,
                    'competition_intensity': competition_intensity
                }
        
        competition_metrics['by_revenue'] = revenue_competition
        
        return competition_metrics
    
    def _identify_competitive_advantages(self) -> List[Dict[str, Any]]:
        """Identify potential competitive advantages"""
        
        advantages = []
        
        for project_id, project_data in self.all_projects.items():
            metrics = self.analyzer.get_project_metrics(project_id)
            
            project_advantages = []
            
            # Quality advantage
            if metrics.quality_score >= 8:
                project_advantages.append("High quality score")
            
            # Revenue advantage
            if metrics.revenue_potential.get('realistic', 0) >= 5000:
                project_advantages.append("High revenue potential")
            
            # Simplicity advantage
            if metrics.technical_complexity <= 3:
                project_advantages.append("Low technical complexity")
            
            # Speed advantage
            if metrics.development_time <= 7:
                project_advantages.append("Quick development time")
            
            # Market opportunity advantage
            if metrics.market_opportunity >= 8:
                project_advantages.append("Strong market opportunity")
            
            # Low risk advantage
            if metrics.risk_score <= 3:
                project_advantages.append("Low risk profile")
            
            # Platform diversity advantage
            if metrics.platform_coverage >= 3:
                project_advantages.append("Multi-platform reach")
            
            # Uniqueness advantage (low similarity with others)
            similarities = [self.similarity_matrix[project_id][other_id] 
                          for other_id in self.all_projects.keys() 
                          if other_id != project_id]
            
            if similarities and np.mean(similarities) < 0.3:
                project_advantages.append("Unique market position")
            
            if project_advantages:
                advantages.append({
                    'project_id': project_id,
                    'project_name': project_data.get('project_name', project_id),
                    'advantages': project_advantages,
                    'advantage_count': len(project_advantages)
                })
        
        # Sort by advantage count
        advantages.sort(key=lambda x: x['advantage_count'], reverse=True)
        
        return advantages[:10]  # Top 10 projects with most advantages
    
    def _analyze_market_positioning(self) -> Dict[str, Any]:
        """Analyze market positioning"""
        
        positioning = {}
        
        # Create positioning matrix: Quality vs Revenue
        quality_revenue_positions = []
        
        for project_id, project_data in self.all_projects.items():
            metrics = self.analyzer.get_project_metrics(project_id)
            
            quality_revenue_positions.append({
                'project_id': project_id,
                'project_name': project_data.get('project_name', project_id),
                'quality': metrics.quality_score,
                'revenue': metrics.revenue_potential.get('realistic', 0),
                'category': project_data.get('category', 'unknown')
            })
        
        # Define positioning quadrants
        quality_threshold = np.median([p['quality'] for p in quality_revenue_positions])
        revenue_threshold = np.median([p['revenue'] for p in quality_revenue_positions])
        
        quadrants = {
            'stars': [],      # High quality, high revenue
            'cash_cows': [],  # High quality, low revenue
            'question_marks': [],  # Low quality, high revenue
            'dogs': []        # Low quality, low revenue
        }
        
        for position in quality_revenue_positions:
            if position['quality'] >= quality_threshold:
                if position['revenue'] >= revenue_threshold:
                    quadrants['stars'].append(position)
                else:
                    quadrants['cash_cows'].append(position)
            else:
                if position['revenue'] >= revenue_threshold:
                    quadrants['question_marks'].append(position)
                else:
                    quadrants['dogs'].append(position)
        
        positioning['quadrants'] = quadrants
        positioning['thresholds'] = {
            'quality': quality_threshold,
            'revenue': revenue_threshold
        }
        
        return positioning
    
    def _display_competitive_analysis(self, competitive_analysis: Dict[str, Any]):
        """Display competitive analysis results"""
        
        print("\n🏆 COMPETITIVE LANDSCAPE")
        print("-" * 60)
        
        # Competition intensity by category
        print("\nCompetition Intensity by Category:")
        competition_metrics = competitive_analysis['competition_metrics']
        
        for category, metrics in competition_metrics['by_category'].items():
            print(f"  {category}:")
            print(f"    Projects: {metrics['project_count']}")
            print(f"    Avg Similarity: {metrics['avg_similarity']:.3f}")
            print(f"    Competition Intensity: {metrics['competition_intensity']:.3f}")
        
        # Top competitive advantages
        print("\nTop Competitive Advantages:")
        advantages = competitive_analysis['competitive_advantages']
        
        for i, advantage in enumerate(advantages[:5], 1):
            print(f"  {i}. {advantage['project_name']}:")
            for adv in advantage['advantages']:
                print(f"     • {adv}")
        
        # Market positioning
        print("\nMarket Positioning (Quality vs Revenue):")
        positioning = competitive_analysis['market_positioning']
        
        for quadrant, projects in positioning['quadrants'].items():
            print(f"  {quadrant.title().replace('_', ' ')}: {len(projects)} projects")
            if projects:
                top_project = max(projects, key=lambda x: x['quality'] + x['revenue'] / 1000)
                print(f"    Top: {top_project['project_name']}")
    
    def generate_analytics_dashboard(self) -> str:
        """Generate comprehensive analytics dashboard"""
        
        # Run all analyses
        trend_analysis = self.analyze_portfolio_trends()
        segmentation = self.segment_market_analysis()
        competitive_analysis = self.analyze_competitive_landscape()
        
        # Generate dashboard
        dashboard = []
        
        # Header
        dashboard.append("# PROJECT ANALYTICS DASHBOARD")
        dashboard.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        dashboard.append("")
        
        # Executive Summary
        dashboard.append("## Executive Summary")
        dashboard.append("")
        
        # Portfolio health
        portfolio_health = trend_analysis.get('portfolio_health', {})
        dashboard.append(f"**Portfolio Health Grade:** {portfolio_health.get('grade', 'N/A')}")
        dashboard.append(f"**Overall Score:** {portfolio_health.get('overall_score', 0):.1%}")
        dashboard.append("")
        
        # Key metrics
        dashboard.append("### Key Metrics")
        total_projects = len(self.all_projects)
        dashboard.append(f"- Total Projects: {total_projects}")
        
        # Calculate averages
        quality_scores = [self.analyzer.get_project_metrics(pid).quality_score 
                         for pid in self.all_projects.keys()]
        revenue_values = [self.analyzer.get_project_metrics(pid).revenue_potential.get('realistic', 0) 
                         for pid in self.all_projects.keys()]
        
        dashboard.append(f"- Average Quality Score: {np.mean(quality_scores):.1f}/10")
        dashboard.append(f"- Average Revenue Potential: ${np.mean(revenue_values):,.0f}/month")
        dashboard.append(f"- Total Revenue Potential: ${np.sum(revenue_values):,.0f}/month")
        dashboard.append("")
        
        # Top categories
        dashboard.append("### Top Categories")
        category_counts = Counter(project_data.get('category', 'unknown') 
                                for project_data in self.all_projects.values())
        
        for category, count in category_counts.most_common(5):
            dashboard.append(f"- {category}: {count} projects")
        dashboard.append("")
        
        # Market opportunities
        dashboard.append("### Top Market Opportunities")
        market_gaps = segmentation.get('market_gaps', [])
        
        for i, gap in enumerate(market_gaps[:5], 1):
            dashboard.append(f"{i}. {gap['name']} ({gap['type']})")
            dashboard.append(f"   Opportunity Score: {gap['opportunity_score']:.1%}")
        dashboard.append("")
        
        # Competitive insights
        dashboard.append("### Competitive Insights")
        advantages = competitive_analysis.get('competitive_advantages', [])
        
        if advantages:
            top_project = advantages[0]
            dashboard.append(f"**Most Competitive Project:** {top_project['project_name']}")
            dashboard.append(f"**Advantages:** {', '.join(top_project['advantages'])}")
        dashboard.append("")
        
        # Recommendations
        dashboard.append("## Strategic Recommendations")
        dashboard.append("")
        
        # Portfolio health recommendations
        health_components = portfolio_health.get('component_scores', {})
        
        dashboard.append("### Portfolio Health Improvements")
        for component, score in health_components.items():
            if score < 0.6:
                dashboard.append(f"- **{component.title()}**: Score {score:.1%} - Needs improvement")
        dashboard.append("")
        
        # Market expansion
        dashboard.append("### Market Expansion Opportunities")
        for gap in market_gaps[:3]:
            dashboard.append(f"- **{gap['name']}**: {gap['description']}")
        dashboard.append("")
        
        return "\n".join(dashboard)


def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(description="Advanced project analytics")
    parser.add_argument("--analysis", 
                       choices=['trends', 'segmentation', 'competitive', 'dashboard', 'all'],
                       default='all', help="Type of analysis to perform")
    parser.add_argument("--export", choices=["json", "markdown"], help="Export format")
    parser.add_argument("--visualize", action="store_true", help="Generate visualizations")
    
    args = parser.parse_args()
    
    analytics = AdvancedAnalytics()
    
    try:
        results = {}
        
        if args.analysis in ['trends', 'all']:
            print("Running trend analysis...")
            results['trends'] = analytics.analyze_portfolio_trends()
        
        if args.analysis in ['segmentation', 'all']:
            print("Running market segmentation analysis...")
            results['segmentation'] = analytics.segment_market_analysis()
        
        if args.analysis in ['competitive', 'all']:
            print("Running competitive landscape analysis...")
            results['competitive'] = analytics.analyze_competitive_landscape()
        
        if args.analysis == 'dashboard':
            print("Generating analytics dashboard...")
            dashboard_content = analytics.generate_analytics_dashboard()
            print(dashboard_content)
            
            if args.export == 'markdown':
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"analytics_dashboard_{timestamp}.md"
                analytics.report_generator.export_to_markdown(dashboard_content, filename)
                print(f"\nDashboard exported to: {filename}")
        
        # Export results if requested
        if args.export and args.analysis != 'dashboard':
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if args.export == 'json':
                filename = f"analytics_{args.analysis}_{timestamp}.json"
                analytics.report_generator.export_to_json(results, filename)
                print(f"\nAnalysis exported to: {filename}")
            
            elif args.export == 'markdown':
                # Convert results to markdown
                content = f"# Analytics Report - {args.analysis.title()}\n\n"
                content += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
                content += json.dumps(results, indent=2, default=str)
                
                filename = f"analytics_{args.analysis}_{timestamp}.md"
                analytics.report_generator.export_to_markdown(content, filename)
                print(f"\nAnalysis exported to: {filename}")
        
        print("\nAnalysis completed successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()