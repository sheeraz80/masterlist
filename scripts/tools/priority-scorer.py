#!/usr/bin/env python3
"""
Priority Scoring System
Custom scoring algorithms for project prioritization and portfolio optimization
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
    ProjectMetrics, weighted_average, normalize_score
)


@dataclass
class ScoringCriteria:
    """Custom scoring criteria configuration"""
    name: str
    weight: float
    metric_type: str  # 'quality', 'revenue', 'complexity', 'time', 'risk', 'market'
    preference: str  # 'higher', 'lower', 'optimal'
    optimal_value: Optional[float] = None
    min_threshold: Optional[float] = None
    max_threshold: Optional[float] = None


@dataclass
class PortfolioConstraints:
    """Portfolio optimization constraints"""
    max_projects: int = 5
    total_budget: float = 10000
    total_timeline: int = 90  # days
    max_risk_exposure: float = 0.6
    category_diversity: bool = True
    platform_diversity: bool = True
    min_revenue_target: float = 5000


class PriorityScorer:
    """Main priority scoring system"""
    
    def __init__(self):
        self.data_loader = ProjectDataLoader()
        self.analyzer = ProjectAnalyzer(self.data_loader)
        self.report_generator = ReportGenerator(self.analyzer)
        self.all_projects = self.data_loader.get_all_projects()
        
        # Default scoring criteria
        self.default_criteria = [
            ScoringCriteria("Quality", 0.20, "quality", "higher"),
            ScoringCriteria("Revenue", 0.25, "revenue", "higher"),
            ScoringCriteria("Complexity", 0.15, "complexity", "lower"),
            ScoringCriteria("Time", 0.15, "time", "lower"),
            ScoringCriteria("Risk", 0.15, "risk", "lower"),
            ScoringCriteria("Market", 0.10, "market", "higher")
        ]
        
        # Load saved scoring configurations
        self.scoring_configs = self._load_scoring_configs()
    
    def _load_scoring_configs(self) -> Dict[str, List[ScoringCriteria]]:
        """Load saved scoring configurations"""
        config_file = "/home/sali/ai/projects/masterlist/scripts/tools/scoring_configs.json"
        if os.path.exists(config_file):
            try:
                with open(config_file, 'r') as f:
                    data = json.load(f)
                    return {
                        name: [ScoringCriteria(**criteria) for criteria in criteria_list]
                        for name, criteria_list in data.items()
                    }
            except Exception:
                return {}
        return {}
    
    def _save_scoring_configs(self):
        """Save scoring configurations to file"""
        config_file = "/home/sali/ai/projects/masterlist/scripts/tools/scoring_configs.json"
        os.makedirs(os.path.dirname(config_file), exist_ok=True)
        
        data = {
            name: [asdict(criteria) for criteria in criteria_list]
            for name, criteria_list in self.scoring_configs.items()
        }
        
        with open(config_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def create_scoring_config(self, config_name: str, 
                            criteria: List[ScoringCriteria]) -> None:
        """Create and save a custom scoring configuration"""
        
        # Validate criteria
        total_weight = sum(c.weight for c in criteria)
        if abs(total_weight - 1.0) > 0.01:
            raise ValueError(f"Criteria weights must sum to 1.0, got {total_weight}")
        
        self.scoring_configs[config_name] = criteria
        self._save_scoring_configs()
    
    def get_scoring_config(self, config_name: str = "default") -> List[ScoringCriteria]:
        """Get scoring configuration by name"""
        if config_name == "default":
            return self.default_criteria
        
        if config_name not in self.scoring_configs:
            raise ValueError(f"Scoring configuration '{config_name}' not found")
        
        return self.scoring_configs[config_name]
    
    def calculate_priority_scores(self, project_ids: Optional[List[str]] = None,
                                config_name: str = "default") -> Dict[str, Any]:
        """Calculate priority scores for projects"""
        
        if project_ids is None:
            project_ids = list(self.all_projects.keys())
        
        criteria = self.get_scoring_config(config_name)
        
        # Calculate scores for each project
        project_scores = {}
        score_breakdown = {}
        
        for project_id in project_ids:
            if project_id not in self.all_projects:
                continue
            
            metrics = self.analyzer.get_project_metrics(project_id)
            
            # Calculate score for each criterion
            criterion_scores = {}
            weighted_scores = []
            weights = []
            
            for criterion in criteria:
                score = self._calculate_criterion_score(metrics, criterion)
                criterion_scores[criterion.name] = score
                weighted_scores.append(score)
                weights.append(criterion.weight)
            
            # Calculate total weighted score
            total_score = weighted_average(weighted_scores, weights)
            
            project_scores[project_id] = total_score
            score_breakdown[project_id] = criterion_scores
        
        # Sort projects by score
        sorted_projects = sorted(project_scores.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'config_name': config_name,
            'criteria': [asdict(c) for c in criteria],
            'project_scores': dict(sorted_projects),
            'score_breakdown': score_breakdown,
            'rankings': [
                {
                    'rank': i + 1,
                    'project_id': project_id,
                    'project_name': self.all_projects[project_id].get('project_name', project_id),
                    'score': score,
                    'category': self.all_projects[project_id].get('category', 'unknown')
                }
                for i, (project_id, score) in enumerate(sorted_projects)
            ]
        }
    
    def _calculate_criterion_score(self, metrics: ProjectMetrics, 
                                 criterion: ScoringCriteria) -> float:
        """Calculate score for a single criterion"""
        
        # Get the metric value
        if criterion.metric_type == "quality":
            value = metrics.quality_score
            max_value = 10.0
        elif criterion.metric_type == "revenue":
            value = metrics.revenue_potential.get('realistic', 0)
            max_value = 10000.0  # Normalize to $10k/month
        elif criterion.metric_type == "complexity":
            value = metrics.technical_complexity
            max_value = 10.0
        elif criterion.metric_type == "time":
            value = metrics.development_time
            max_value = 60.0  # Normalize to 60 days
        elif criterion.metric_type == "risk":
            value = metrics.risk_score
            max_value = 10.0
        elif criterion.metric_type == "market":
            value = metrics.market_opportunity
            max_value = 10.0
        else:
            raise ValueError(f"Unknown metric type: {criterion.metric_type}")
        
        # Apply thresholds
        if criterion.min_threshold is not None and value < criterion.min_threshold:
            return 0.0
        
        if criterion.max_threshold is not None and value > criterion.max_threshold:
            return 0.0
        
        # Normalize value
        normalized_value = min(value / max_value, 1.0)
        
        # Apply preference
        if criterion.preference == "higher":
            score = normalized_value
        elif criterion.preference == "lower":
            score = 1.0 - normalized_value
        elif criterion.preference == "optimal":
            if criterion.optimal_value is None:
                raise ValueError("Optimal value required for 'optimal' preference")
            
            optimal_normalized = criterion.optimal_value / max_value
            distance = abs(normalized_value - optimal_normalized)
            score = 1.0 - distance
        else:
            raise ValueError(f"Unknown preference: {criterion.preference}")
        
        return max(0.0, min(1.0, score))
    
    def analyze_roi(self, project_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyze return on investment for projects"""
        
        if project_ids is None:
            project_ids = list(self.all_projects.keys())
        
        roi_analysis = {}
        
        for project_id in project_ids:
            if project_id not in self.all_projects:
                continue
            
            metrics = self.analyzer.get_project_metrics(project_id)
            project_data = self.all_projects[project_id]
            
            # Calculate investment (cost)
            development_cost = metrics.development_time * 8 * 50  # $50/hour, 8 hours/day
            marketing_cost = development_cost * 0.2  # Assume 20% of dev cost
            operational_cost = 200 * 12  # $200/month for 12 months
            total_investment = development_cost + marketing_cost + operational_cost
            
            # Calculate return (revenue)
            monthly_revenue = metrics.revenue_potential.get('realistic', 0)
            annual_revenue = monthly_revenue * 12
            
            # Calculate ROI metrics
            roi_percentage = ((annual_revenue - total_investment) / total_investment * 100) if total_investment > 0 else 0
            payback_period = (total_investment / monthly_revenue) if monthly_revenue > 0 else float('inf')
            
            # Risk-adjusted ROI
            risk_factor = 1.0 - (metrics.risk_score / 10.0)
            risk_adjusted_roi = roi_percentage * risk_factor
            
            # Time-to-market factor
            time_factor = max(0.1, 1.0 - (metrics.development_time / 60.0))  # Penalty for long dev time
            
            # Market opportunity factor
            market_factor = metrics.market_opportunity / 10.0
            
            # Composite score
            composite_score = (
                (roi_percentage / 100.0) * 0.4 +
                risk_factor * 0.3 +
                time_factor * 0.2 +
                market_factor * 0.1
            )
            
            roi_analysis[project_id] = {
                'project_name': project_data.get('project_name', project_id),
                'investment': {
                    'development_cost': development_cost,
                    'marketing_cost': marketing_cost,
                    'operational_cost': operational_cost,
                    'total_investment': total_investment
                },
                'revenue': {
                    'monthly_revenue': monthly_revenue,
                    'annual_revenue': annual_revenue
                },
                'roi_metrics': {
                    'roi_percentage': roi_percentage,
                    'payback_period_months': payback_period,
                    'risk_adjusted_roi': risk_adjusted_roi,
                    'composite_score': composite_score
                },
                'factors': {
                    'risk_factor': risk_factor,
                    'time_factor': time_factor,
                    'market_factor': market_factor
                }
            }
        
        # Sort by composite score
        sorted_projects = sorted(
            roi_analysis.items(), 
            key=lambda x: x[1]['roi_metrics']['composite_score'], 
            reverse=True
        )
        
        return {
            'analysis': dict(sorted_projects),
            'summary': self._generate_roi_summary(roi_analysis)
        }
    
    def _generate_roi_summary(self, roi_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate ROI analysis summary"""
        
        roi_percentages = [data['roi_metrics']['roi_percentage'] for data in roi_analysis.values()]
        payback_periods = [data['roi_metrics']['payback_period_months'] for data in roi_analysis.values() if data['roi_metrics']['payback_period_months'] != float('inf')]
        composite_scores = [data['roi_metrics']['composite_score'] for data in roi_analysis.values()]
        
        return {
            'total_projects': len(roi_analysis),
            'profitable_projects': len([roi for roi in roi_percentages if roi > 0]),
            'average_roi': np.mean(roi_percentages) if roi_percentages else 0,
            'median_roi': np.median(roi_percentages) if roi_percentages else 0,
            'average_payback': np.mean(payback_periods) if payback_periods else 0,
            'best_roi_project': max(roi_analysis.items(), key=lambda x: x[1]['roi_metrics']['roi_percentage'])[0] if roi_analysis else None,
            'best_composite_project': max(roi_analysis.items(), key=lambda x: x[1]['roi_metrics']['composite_score'])[0] if roi_analysis else None,
            'average_composite_score': np.mean(composite_scores) if composite_scores else 0
        }
    
    def optimize_portfolio(self, project_ids: Optional[List[str]] = None,
                          constraints: Optional[PortfolioConstraints] = None) -> Dict[str, Any]:
        """Optimize project portfolio based on constraints"""
        
        if project_ids is None:
            project_ids = list(self.all_projects.keys())
        
        if constraints is None:
            constraints = PortfolioConstraints()
        
        # Get all project metrics
        project_metrics = {}
        for project_id in project_ids:
            if project_id in self.all_projects:
                project_metrics[project_id] = self.analyzer.get_project_metrics(project_id)
        
        # Calculate portfolio optimization score for each project
        portfolio_scores = {}
        
        for project_id, metrics in project_metrics.items():
            project_data = self.all_projects[project_id]
            
            # Calculate costs
            development_cost = metrics.development_time * 8 * 50
            
            # Base value score
            monthly_revenue = metrics.revenue_potential.get('realistic', 0)
            value_score = monthly_revenue / 1000  # Normalize to $1k
            
            # Quality factor
            quality_factor = metrics.quality_score / 10.0
            
            # Risk factor (lower risk is better)
            risk_factor = 1.0 - (metrics.risk_score / 10.0)
            
            # Time factor (faster is better)
            time_factor = max(0.1, 1.0 - (metrics.development_time / 60.0))
            
            # Market opportunity factor
            market_factor = metrics.market_opportunity / 10.0
            
            # Efficiency score (value per dollar invested)
            efficiency_score = (monthly_revenue * 12) / development_cost if development_cost > 0 else 0
            
            # Composite portfolio score
            portfolio_score = (
                value_score * 0.25 +
                quality_factor * 0.20 +
                risk_factor * 0.20 +
                time_factor * 0.15 +
                market_factor * 0.10 +
                min(efficiency_score, 2.0) * 0.10  # Cap efficiency at 2.0
            )
            
            portfolio_scores[project_id] = {
                'score': portfolio_score,
                'cost': development_cost,
                'time': metrics.development_time,
                'revenue': monthly_revenue,
                'risk': metrics.risk_score,
                'category': project_data.get('category', 'unknown'),
                'platforms': list(project_data.get('platforms', {}).keys())
            }
        
        # Optimize portfolio using greedy algorithm with constraints
        optimized_portfolio = self._greedy_portfolio_optimization(
            portfolio_scores, constraints
        )
        
        return {
            'constraints': asdict(constraints),
            'all_projects': portfolio_scores,
            'optimized_portfolio': optimized_portfolio,
            'portfolio_analysis': self._analyze_portfolio(optimized_portfolio, portfolio_scores)
        }
    
    def _greedy_portfolio_optimization(self, project_scores: Dict[str, Any],
                                     constraints: PortfolioConstraints) -> Dict[str, Any]:
        """Greedy portfolio optimization algorithm"""
        
        # Sort projects by score
        sorted_projects = sorted(
            project_scores.items(), 
            key=lambda x: x[1]['score'], 
            reverse=True
        )
        
        selected_projects = []
        total_cost = 0
        total_time = 0
        total_revenue = 0
        categories_used = set()
        platforms_used = set()
        total_risk = 0
        
        for project_id, project_data in sorted_projects:
            # Check constraints
            if len(selected_projects) >= constraints.max_projects:
                break
            
            new_cost = total_cost + project_data['cost']
            if new_cost > constraints.total_budget:
                continue
            
            new_time = max(total_time, project_data['time'])  # Parallel development
            if new_time > constraints.total_timeline:
                continue
            
            new_risk = (total_risk * len(selected_projects) + project_data['risk']) / (len(selected_projects) + 1)
            if new_risk > constraints.max_risk_exposure * 10:
                continue
            
            # Check diversity constraints
            if constraints.category_diversity:
                if project_data['category'] in categories_used and len(categories_used) < 3:
                    continue
            
            if constraints.platform_diversity:
                project_platforms = set(project_data['platforms'])
                if project_platforms.issubset(platforms_used) and len(platforms_used) < 3:
                    continue
            
            # Add project to portfolio
            selected_projects.append(project_id)
            total_cost = new_cost
            total_time = new_time
            total_revenue += project_data['revenue']
            total_risk = new_risk
            categories_used.add(project_data['category'])
            platforms_used.update(project_data['platforms'])
        
        return {
            'selected_projects': selected_projects,
            'portfolio_metrics': {
                'total_projects': len(selected_projects),
                'total_cost': total_cost,
                'total_timeline': total_time,
                'total_monthly_revenue': total_revenue,
                'average_risk': total_risk,
                'categories_covered': len(categories_used),
                'platforms_covered': len(platforms_used)
            },
            'constraint_utilization': {
                'budget_utilization': total_cost / constraints.total_budget,
                'timeline_utilization': total_time / constraints.total_timeline,
                'risk_utilization': total_risk / (constraints.max_risk_exposure * 10),
                'project_utilization': len(selected_projects) / constraints.max_projects
            }
        }
    
    def _analyze_portfolio(self, portfolio: Dict[str, Any], 
                          all_projects: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze optimized portfolio"""
        
        selected_projects = portfolio['selected_projects']
        
        # Calculate portfolio statistics
        scores = [all_projects[pid]['score'] for pid in selected_projects]
        revenues = [all_projects[pid]['revenue'] for pid in selected_projects]
        risks = [all_projects[pid]['risk'] for pid in selected_projects]
        times = [all_projects[pid]['time'] for pid in selected_projects]
        
        # Diversification analysis
        categories = [all_projects[pid]['category'] for pid in selected_projects]
        platforms = []
        for pid in selected_projects:
            platforms.extend(all_projects[pid]['platforms'])
        
        category_diversity = len(set(categories)) / len(categories) if categories else 0
        platform_diversity = len(set(platforms)) / len(platforms) if platforms else 0
        
        # Risk analysis
        portfolio_risk = np.mean(risks) if risks else 0
        risk_concentration = np.std(risks) if len(risks) > 1 else 0
        
        # Return analysis
        total_investment = sum(all_projects[pid]['cost'] for pid in selected_projects)
        total_monthly_revenue = sum(revenues)
        annual_return = total_monthly_revenue * 12
        portfolio_roi = ((annual_return - total_investment) / total_investment * 100) if total_investment > 0 else 0
        
        return {
            'portfolio_quality': {
                'average_score': np.mean(scores) if scores else 0,
                'score_variance': np.var(scores) if len(scores) > 1 else 0,
                'score_range': [min(scores), max(scores)] if scores else [0, 0]
            },
            'diversification': {
                'category_diversity': category_diversity,
                'platform_diversity': platform_diversity,
                'risk_concentration': risk_concentration
            },
            'financial_metrics': {
                'total_investment': total_investment,
                'total_monthly_revenue': total_monthly_revenue,
                'annual_revenue': annual_return,
                'portfolio_roi': portfolio_roi,
                'revenue_per_project': total_monthly_revenue / len(selected_projects) if selected_projects else 0
            },
            'risk_metrics': {
                'portfolio_risk': portfolio_risk,
                'risk_concentration': risk_concentration,
                'max_risk_project': max(risks) if risks else 0,
                'min_risk_project': min(risks) if risks else 0
            },
            'efficiency_metrics': {
                'average_development_time': np.mean(times) if times else 0,
                'longest_project': max(times) if times else 0,
                'shortest_project': min(times) if times else 0,
                'revenue_per_dollar': total_monthly_revenue / total_investment if total_investment > 0 else 0
            }
        }
    
    def analyze_sensitivity(self, project_ids: Optional[List[str]] = None,
                          config_name: str = "default") -> Dict[str, Any]:
        """Analyze sensitivity of scoring to weight changes"""
        
        if project_ids is None:
            project_ids = list(self.all_projects.keys())[:10]  # Limit for performance
        
        base_criteria = self.get_scoring_config(config_name)
        base_scores = self.calculate_priority_scores(project_ids, config_name)
        
        sensitivity_analysis = {}
        
        for criterion in base_criteria:
            # Test weight changes
            weight_variations = [-0.1, -0.05, 0.05, 0.1]
            criterion_sensitivity = {}
            
            for variation in weight_variations:
                # Create modified criteria
                modified_criteria = []
                for c in base_criteria:
                    if c.name == criterion.name:
                        new_weight = max(0, c.weight + variation)
                        modified_criteria.append(ScoringCriteria(
                            c.name, new_weight, c.metric_type, c.preference,
                            c.optimal_value, c.min_threshold, c.max_threshold
                        ))
                    else:
                        # Adjust other weights proportionally
                        adjustment = -variation / (len(base_criteria) - 1)
                        new_weight = max(0, c.weight + adjustment)
                        modified_criteria.append(ScoringCriteria(
                            c.name, new_weight, c.metric_type, c.preference,
                            c.optimal_value, c.min_threshold, c.max_threshold
                        ))
                
                # Normalize weights
                total_weight = sum(c.weight for c in modified_criteria)
                if total_weight > 0:
                    for c in modified_criteria:
                        c.weight /= total_weight
                
                # Calculate scores with modified criteria
                temp_config_name = f"temp_{criterion.name}_{variation}"
                self.scoring_configs[temp_config_name] = modified_criteria
                
                modified_scores = self.calculate_priority_scores(project_ids, temp_config_name)
                
                # Calculate ranking changes
                base_rankings = {p['project_id']: p['rank'] for p in base_scores['rankings']}
                modified_rankings = {p['project_id']: p['rank'] for p in modified_scores['rankings']}
                
                ranking_changes = {}
                for project_id in project_ids:
                    if project_id in base_rankings and project_id in modified_rankings:
                        ranking_changes[project_id] = modified_rankings[project_id] - base_rankings[project_id]
                
                # Calculate score changes
                score_changes = {}
                for project_id in project_ids:
                    if project_id in base_scores['project_scores'] and project_id in modified_scores['project_scores']:
                        score_changes[project_id] = modified_scores['project_scores'][project_id] - base_scores['project_scores'][project_id]
                
                criterion_sensitivity[f"weight_{variation:+.2f}"] = {
                    'ranking_changes': ranking_changes,
                    'score_changes': score_changes,
                    'average_ranking_change': np.mean(list(ranking_changes.values())) if ranking_changes else 0,
                    'average_score_change': np.mean(list(score_changes.values())) if score_changes else 0
                }
                
                # Clean up temp config
                del self.scoring_configs[temp_config_name]
            
            sensitivity_analysis[criterion.name] = criterion_sensitivity
        
        return {
            'base_config': config_name,
            'base_scores': base_scores,
            'sensitivity_analysis': sensitivity_analysis,
            'summary': self._generate_sensitivity_summary(sensitivity_analysis)
        }
    
    def _generate_sensitivity_summary(self, sensitivity_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate sensitivity analysis summary"""
        
        criterion_impact = {}
        
        for criterion, analysis in sensitivity_analysis.items():
            # Calculate overall impact
            total_impact = 0
            for variation, data in analysis.items():
                total_impact += abs(data['average_ranking_change'])
            
            criterion_impact[criterion] = total_impact / len(analysis)
        
        # Sort by impact
        sorted_impact = sorted(criterion_impact.items(), key=lambda x: x[1], reverse=True)
        
        return {
            'most_influential_criteria': sorted_impact[:3],
            'least_influential_criteria': sorted_impact[-3:],
            'overall_stability': 1.0 - (sum(criterion_impact.values()) / len(criterion_impact)) if criterion_impact else 1.0
        }
    
    def analyze_time_to_market(self, project_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """Analyze time-to-market factors"""
        
        if project_ids is None:
            project_ids = list(self.all_projects.keys())
        
        time_analysis = {}
        
        for project_id in project_ids:
            if project_id not in self.all_projects:
                continue
            
            metrics = self.analyzer.get_project_metrics(project_id)
            project_data = self.all_projects[project_id]
            
            # Base development time
            base_time = metrics.development_time
            
            # Complexity factor
            complexity_factor = 1.0 + (metrics.technical_complexity - 5) * 0.1
            
            # Team size factor (assuming single developer baseline)
            team_size = 1  # This could be parameterized
            team_factor = 1.0 / math.sqrt(team_size)  # Diminishing returns
            
            # Risk delay factor
            risk_delay = (metrics.risk_score / 10.0) * 0.3  # Up to 30% delay
            
            # Market window factor
            market_urgency = metrics.market_opportunity / 10.0
            
            # Adjusted time to market
            adjusted_time = base_time * complexity_factor * team_factor * (1 + risk_delay)
            
            # Revenue opportunity cost
            monthly_revenue = metrics.revenue_potential.get('realistic', 0)
            daily_opportunity_cost = monthly_revenue / 30
            
            # Calculate time value
            time_value = {
                'base_time': base_time,
                'adjusted_time': adjusted_time,
                'complexity_factor': complexity_factor,
                'team_factor': team_factor,
                'risk_delay': risk_delay,
                'daily_opportunity_cost': daily_opportunity_cost,
                'total_opportunity_cost': daily_opportunity_cost * adjusted_time,
                'market_urgency': market_urgency,
                'time_pressure_score': market_urgency * (1 / max(adjusted_time, 1))
            }
            
            time_analysis[project_id] = {
                'project_name': project_data.get('project_name', project_id),
                'time_metrics': time_value,
                'recommendations': self._generate_time_recommendations(time_value)
            }
        
        # Sort by time pressure score
        sorted_projects = sorted(
            time_analysis.items(),
            key=lambda x: x[1]['time_metrics']['time_pressure_score'],
            reverse=True
        )
        
        return {
            'time_analysis': dict(sorted_projects),
            'time_priorities': [
                {
                    'project_id': project_id,
                    'project_name': data['project_name'],
                    'time_pressure_score': data['time_metrics']['time_pressure_score'],
                    'adjusted_time': data['time_metrics']['adjusted_time'],
                    'opportunity_cost': data['time_metrics']['total_opportunity_cost']
                }
                for project_id, data in sorted_projects[:10]
            ]
        }
    
    def _generate_time_recommendations(self, time_value: Dict[str, Any]) -> List[str]:
        """Generate time-to-market recommendations"""
        
        recommendations = []
        
        if time_value['complexity_factor'] > 1.2:
            recommendations.append("Consider reducing scope or complexity to accelerate delivery")
        
        if time_value['risk_delay'] > 0.2:
            recommendations.append("Implement risk mitigation strategies to avoid delays")
        
        if time_value['market_urgency'] > 0.7:
            recommendations.append("High market urgency - prioritize rapid development")
        
        if time_value['daily_opportunity_cost'] > 100:
            recommendations.append("High opportunity cost - consider additional resources")
        
        if time_value['adjusted_time'] > 30:
            recommendations.append("Long development time - consider phased delivery")
        
        return recommendations
    
    def generate_scoring_report(self, results: Dict[str, Any], 
                              analysis_type: str = "priority") -> str:
        """Generate comprehensive scoring report"""
        
        report = []
        
        # Header
        report.append("# Project Scoring Report")
        report.append(f"Analysis Type: {analysis_type.title()}")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        if analysis_type == "priority":
            # Priority scoring report
            report.append("## Scoring Configuration")
            for criterion in results['criteria']:
                report.append(f"- **{criterion['name']}**: {criterion['weight']:.1%} weight ({criterion['preference']} preference)")
            report.append("")
            
            report.append("## Top 10 Projects")
            for ranking in results['rankings'][:10]:
                report.append(f"{ranking['rank']}. **{ranking['project_name']}** ({ranking['category']})")
                report.append(f"   Score: {ranking['score']:.3f}")
                
                # Show score breakdown
                if ranking['project_id'] in results['score_breakdown']:
                    breakdown = results['score_breakdown'][ranking['project_id']]
                    report.append("   Breakdown:")
                    for criterion, score in breakdown.items():
                        report.append(f"     - {criterion}: {score:.3f}")
                report.append("")
        
        elif analysis_type == "roi":
            # ROI analysis report
            report.append("## ROI Analysis Summary")
            summary = results['summary']
            report.append(f"- Total Projects: {summary['total_projects']}")
            report.append(f"- Profitable Projects: {summary['profitable_projects']}")
            report.append(f"- Average ROI: {summary['average_roi']:.1f}%")
            report.append(f"- Average Payback: {summary['average_payback']:.1f} months")
            report.append("")
            
            report.append("## Top ROI Projects")
            for i, (project_id, data) in enumerate(list(results['analysis'].items())[:10], 1):
                report.append(f"{i}. **{data['project_name']}**")
                report.append(f"   ROI: {data['roi_metrics']['roi_percentage']:.1f}%")
                report.append(f"   Investment: ${data['investment']['total_investment']:,.0f}")
                report.append(f"   Annual Revenue: ${data['revenue']['annual_revenue']:,.0f}")
                report.append(f"   Payback: {data['roi_metrics']['payback_period_months']:.1f} months")
                report.append("")
        
        elif analysis_type == "portfolio":
            # Portfolio optimization report
            portfolio = results['optimized_portfolio']
            analysis = results['portfolio_analysis']
            
            report.append("## Portfolio Optimization Results")
            report.append(f"- Selected Projects: {portfolio['portfolio_metrics']['total_projects']}")
            report.append(f"- Total Investment: ${portfolio['portfolio_metrics']['total_cost']:,.0f}")
            report.append(f"- Total Monthly Revenue: ${portfolio['portfolio_metrics']['total_monthly_revenue']:,.0f}")
            report.append(f"- Portfolio ROI: {analysis['financial_metrics']['portfolio_roi']:.1f}%")
            report.append(f"- Average Risk: {portfolio['portfolio_metrics']['average_risk']:.1f}/10")
            report.append("")
            
            report.append("## Selected Projects")
            for project_id in portfolio['selected_projects']:
                project_data = self.all_projects[project_id]
                report.append(f"- **{project_data.get('project_name', project_id)}** ({project_data.get('category', 'unknown')})")
            report.append("")
        
        return "\n".join(report)
    
    def display_results(self, results: Dict[str, Any], analysis_type: str = "priority"):
        """Display results in console"""
        
        print("\n" + "="*80)
        print(f"PROJECT {analysis_type.upper()} ANALYSIS")
        print("="*80)
        
        if analysis_type == "priority":
            print(f"\nScoring Configuration: {results['config_name']}")
            print("Criteria:")
            for criterion in results['criteria']:
                print(f"  {criterion['name']}: {criterion['weight']:.1%} ({criterion['preference']})")
            
            print(f"\nTop {min(10, len(results['rankings']))} Projects:")
            print("-" * 60)
            
            for ranking in results['rankings'][:10]:
                print(f"{ranking['rank']:2d}. {ranking['project_name'][:40]:<40} {ranking['score']:.3f}")
        
        elif analysis_type == "roi":
            summary = results['summary']
            print(f"\nROI Analysis Summary:")
            print(f"  Total Projects: {summary['total_projects']}")
            print(f"  Profitable Projects: {summary['profitable_projects']}")
            print(f"  Average ROI: {summary['average_roi']:.1f}%")
            print(f"  Best ROI Project: {summary['best_roi_project']}")
            
            print(f"\nTop 10 ROI Projects:")
            print("-" * 60)
            
            for i, (project_id, data) in enumerate(list(results['analysis'].items())[:10], 1):
                print(f"{i:2d}. {data['project_name'][:30]:<30} ROI: {data['roi_metrics']['roi_percentage']:6.1f}%")
        
        elif analysis_type == "portfolio":
            portfolio = results['optimized_portfolio']
            metrics = portfolio['portfolio_metrics']
            
            print(f"\nPortfolio Optimization Results:")
            print(f"  Selected Projects: {metrics['total_projects']}")
            print(f"  Total Investment: ${metrics['total_cost']:,.0f}")
            print(f"  Monthly Revenue: ${metrics['total_monthly_revenue']:,.0f}")
            print(f"  Average Risk: {metrics['average_risk']:.1f}/10")
            
            print(f"\nSelected Projects:")
            print("-" * 60)
            
            for project_id in portfolio['selected_projects']:
                project_data = self.all_projects[project_id]
                print(f"  • {project_data.get('project_name', project_id)}")
        
        print("\n" + "="*80)


def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(description="Project priority scoring system")
    parser.add_argument("--analysis", choices=['priority', 'roi', 'portfolio', 'sensitivity', 'time'],
                       default='priority', help="Type of analysis to perform")
    parser.add_argument("--config", default="default", help="Scoring configuration name")
    parser.add_argument("--projects", nargs="+", help="Specific project IDs to analyze")
    parser.add_argument("--export", choices=["json", "csv", "markdown"], help="Export format")
    parser.add_argument("--create-config", help="Create new scoring configuration")
    parser.add_argument("--list-configs", action="store_true", help="List available configurations")
    
    # Portfolio optimization arguments
    parser.add_argument("--max-projects", type=int, default=5, help="Maximum projects in portfolio")
    parser.add_argument("--budget", type=float, default=10000, help="Total budget")
    parser.add_argument("--timeline", type=int, default=90, help="Total timeline in days")
    parser.add_argument("--max-risk", type=float, default=0.6, help="Maximum risk exposure")
    
    args = parser.parse_args()
    
    scorer = PriorityScorer()
    
    try:
        if args.list_configs:
            print("Available scoring configurations:")
            print("  default (built-in)")
            for config_name in scorer.scoring_configs.keys():
                print(f"  {config_name}")
            return
        
        if args.create_config:
            print("Creating scoring configuration requires interactive input")
            print("This feature would be implemented in a full interactive version")
            return
        
        # Perform analysis
        if args.analysis == "priority":
            results = scorer.calculate_priority_scores(args.projects, args.config)
            scorer.display_results(results, "priority")
        
        elif args.analysis == "roi":
            results = scorer.analyze_roi(args.projects)
            scorer.display_results(results, "roi")
        
        elif args.analysis == "portfolio":
            constraints = PortfolioConstraints(
                max_projects=args.max_projects,
                total_budget=args.budget,
                total_timeline=args.timeline,
                max_risk_exposure=args.max_risk
            )
            results = scorer.optimize_portfolio(args.projects, constraints)
            scorer.display_results(results, "portfolio")
        
        elif args.analysis == "sensitivity":
            results = scorer.analyze_sensitivity(args.projects, args.config)
            print("Sensitivity analysis completed")
            print(f"Most influential criteria: {results['summary']['most_influential_criteria']}")
            print(f"Overall stability: {results['summary']['overall_stability']:.3f}")
        
        elif args.analysis == "time":
            results = scorer.analyze_time_to_market(args.projects)
            print("Time-to-market analysis completed")
            print("Top time-sensitive projects:")
            for priority in results['time_priorities'][:5]:
                print(f"  {priority['project_name']}: {priority['time_pressure_score']:.3f}")
        
        # Export if requested
        if args.export:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{args.analysis}_analysis_{timestamp}.{args.export}"
            
            if args.export == 'json':
                scorer.report_generator.export_to_json(results, filename)
            elif args.export == 'markdown':
                report = scorer.generate_scoring_report(results, args.analysis)
                scorer.report_generator.export_to_markdown(report, filename)
            
            print(f"\nAnalysis exported to: {filename}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()