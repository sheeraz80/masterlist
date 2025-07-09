#!/usr/bin/env python3
"""
Priority Scorer - Custom scoring algorithms for project prioritization
Provides multi-factor decision making with configurable weights and advanced analytics.
"""

import json
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple
import math
from datetime import datetime
import yaml

class PriorityScorer:
    def __init__(self, data_path: str = "projects.json", config_path: str = "scoring_config.yaml"):
        """Initialize the priority scorer."""
        self.data_path = Path(data_path)
        self.config_path = Path(config_path)
        self.projects = self.load_projects()
        self.config = self.load_config()
        
    def load_projects(self) -> List[Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: {self.data_path} not found")
            sys.exit(1)
            
    def load_config(self) -> Dict[str, Any]:
        """Load scoring configuration."""
        default_config = {
            'weights': {
                'roi': 0.25,
                'risk': 0.20,
                'effort': 0.15,
                'market_opportunity': 0.20,
                'time_to_market': 0.10,
                'strategic_value': 0.10
            },
            'roi_factors': {
                'revenue_weight': 0.7,
                'cost_weight': 0.3
            },
            'risk_factors': {
                'technical_risk': 0.4,
                'market_risk': 0.3,
                'competition_risk': 0.3
            },
            'effort_factors': {
                'development_time': 0.5,
                'technical_complexity': 0.3,
                'team_size_requirement': 0.2
            }
        }
        
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    loaded_config = yaml.safe_load(f)
                    # Merge with defaults
                    for key, value in loaded_config.items():
                        if key in default_config:
                            if isinstance(value, dict):
                                default_config[key].update(value)
                            else:
                                default_config[key] = value
                return default_config
            except Exception as e:
                print(f"Warning: Error loading config file: {e}")
                
        return default_config
        
    def calculate_roi_score(self, project: Dict[str, Any]) -> float:
        """Calculate Return on Investment score (0-10)."""
        revenue = project.get('revenue_potential', {}).get('realistic', 0)
        dev_time = project.get('development_time', 7)
        complexity = project.get('technical_complexity', 5)
        
        # Estimate development cost
        daily_rate = 500  # Average daily development cost
        development_cost = dev_time * daily_rate
        
        # Calculate ROI
        if development_cost > 0:
            roi_ratio = revenue / development_cost
        else:
            roi_ratio = 0
            
        # Convert to 0-10 scale
        if roi_ratio >= 20:
            return 10
        elif roi_ratio >= 10:
            return 9
        elif roi_ratio >= 5:
            return 8
        elif roi_ratio >= 3:
            return 7
        elif roi_ratio >= 2:
            return 6
        elif roi_ratio >= 1:
            return 5
        else:
            return max(0, roi_ratio * 5)
            
    def calculate_risk_score(self, project: Dict[str, Any]) -> float:
        """Calculate risk score (0-10, higher = lower risk)."""
        risk_config = self.config['risk_factors']
        
        # Technical risk (based on complexity)
        complexity = project.get('technical_complexity', 5)
        technical_risk = max(0, 10 - complexity)
        
        # Market risk (based on competition and market size)
        competition = project.get('competition_level', 'medium').lower()
        competition_risk_map = {'low': 8, 'medium': 5, 'high': 2}
        market_risk = competition_risk_map.get(competition, 5)
        
        # Competition risk (inverse of market opportunity)
        revenue = project.get('revenue_potential', {}).get('realistic', 0)
        if revenue >= 10000:
            competition_risk = 8
        elif revenue >= 5000:
            competition_risk = 6
        elif revenue >= 2000:
            competition_risk = 4
        else:
            competition_risk = 2
            
        # Weighted risk score
        risk_score = (
            technical_risk * risk_config['technical_risk'] +
            market_risk * risk_config['market_risk'] +
            competition_risk * risk_config['competition_risk']
        )
        
        return min(risk_score, 10)
        
    def calculate_effort_score(self, project: Dict[str, Any]) -> float:
        """Calculate effort score (0-10, higher = less effort)."""
        effort_config = self.config['effort_factors']
        
        # Development time score (inverse)
        dev_time = project.get('development_time', 7)
        time_score = max(0, 10 - (dev_time / 3))  # 30 days = 0 score
        
        # Technical complexity score (inverse)
        complexity = project.get('technical_complexity', 5)
        complexity_score = max(0, 10 - complexity)
        
        # Team size requirement (estimated from complexity and timeline)
        if complexity >= 8 or dev_time >= 20:
            team_requirement = 3
        elif complexity >= 6 or dev_time >= 10:
            team_requirement = 2
        else:
            team_requirement = 1
            
        team_score = max(0, 10 - team_requirement * 2)
        
        # Weighted effort score
        effort_score = (
            time_score * effort_config['development_time'] +
            complexity_score * effort_config['technical_complexity'] +
            team_score * effort_config['team_size_requirement']
        )
        
        return min(effort_score, 10)
        
    def calculate_market_opportunity_score(self, project: Dict[str, Any]) -> float:
        """Calculate market opportunity score (0-10)."""
        revenue = project.get('revenue_potential', {}).get('realistic', 0)
        competition = project.get('competition_level', 'medium').lower()
        
        # Base score from revenue potential
        if revenue >= 20000:
            base_score = 10
        elif revenue >= 10000:
            base_score = 9
        elif revenue >= 5000:
            base_score = 7
        elif revenue >= 2000:
            base_score = 5
        elif revenue >= 1000:
            base_score = 3
        else:
            base_score = 1
            
        # Adjust for competition
        competition_multiplier = {'low': 1.3, 'medium': 1.0, 'high': 0.7}
        
        return min(base_score * competition_multiplier.get(competition, 1.0), 10)
        
    def calculate_time_to_market_score(self, project: Dict[str, Any]) -> float:
        """Calculate time to market score (0-10, higher = faster)."""
        dev_time = project.get('development_time', 7)
        complexity = project.get('technical_complexity', 5)
        
        # Base time score
        if dev_time <= 3:
            time_score = 10
        elif dev_time <= 7:
            time_score = 8
        elif dev_time <= 14:
            time_score = 6
        elif dev_time <= 21:
            time_score = 4
        else:
            time_score = 2
            
        # Adjust for complexity (affects actual time)
        complexity_factor = 1.0 - (complexity - 5) * 0.1
        
        return min(time_score * complexity_factor, 10)
        
    def calculate_strategic_value_score(self, project: Dict[str, Any]) -> float:
        """Calculate strategic value score (0-10)."""
        quality = project.get('quality_score', 5)
        platforms = len(project.get('platforms', []))
        
        # Quality contributes to strategic value
        quality_score = quality
        
        # Multi-platform projects have higher strategic value
        platform_score = min(platforms * 2, 10)
        
        # Market category strategic value
        category = project.get('category', 'other')
        category_strategic_value = {
            'ai-ml': 9,
            'design-tools': 7,
            'development-tools': 8,
            'productivity': 6,
            'content-writing': 5,
            'browser-web': 4,
            'crypto-blockchain': 6,
            'other': 3
        }
        
        category_score = category_strategic_value.get(category, 5)
        
        # Weighted strategic value
        strategic_score = (quality_score * 0.5 + platform_score * 0.3 + category_score * 0.2)
        
        return min(strategic_score, 10)
        
    def calculate_priority_score(self, project: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        """Calculate overall priority score with breakdown."""
        weights = self.config['weights']
        
        # Calculate individual scores
        roi_score = self.calculate_roi_score(project)
        risk_score = self.calculate_risk_score(project)
        effort_score = self.calculate_effort_score(project)
        market_score = self.calculate_market_opportunity_score(project)
        time_score = self.calculate_time_to_market_score(project)
        strategic_score = self.calculate_strategic_value_score(project)
        
        # Calculate weighted total
        total_score = (
            roi_score * weights['roi'] +
            risk_score * weights['risk'] +
            effort_score * weights['effort'] +
            market_score * weights['market_opportunity'] +
            time_score * weights['time_to_market'] +
            strategic_score * weights['strategic_value']
        )
        
        breakdown = {
            'roi': roi_score,
            'risk': risk_score,
            'effort': effort_score,
            'market_opportunity': market_score,
            'time_to_market': time_score,
            'strategic_value': strategic_score,
            'total': total_score
        }
        
        return total_score, breakdown
        
    def prioritize_projects(self, filter_criteria: Dict[str, Any] = None) -> List[Tuple[Dict[str, Any], float, Dict[str, float]]]:
        """Prioritize all projects based on scoring criteria."""
        scored_projects = []
        
        for project in self.projects:
            # Apply filters if provided
            if filter_criteria and not self.matches_filter(project, filter_criteria):
                continue
                
            score, breakdown = self.calculate_priority_score(project)
            scored_projects.append((project, score, breakdown))
            
        # Sort by priority score (highest first)
        scored_projects.sort(key=lambda x: x[1], reverse=True)
        
        return scored_projects
        
    def matches_filter(self, project: Dict[str, Any], filter_criteria: Dict[str, Any]) -> bool:
        """Check if project matches filter criteria."""
        # Category filter
        if 'category' in filter_criteria:
            if project.get('category') != filter_criteria['category']:
                return False
                
        # Platform filter
        if 'platform' in filter_criteria:
            if filter_criteria['platform'] not in project.get('platforms', []):
                return False
                
        # Revenue filter
        if 'min_revenue' in filter_criteria:
            revenue = project.get('revenue_potential', {}).get('realistic', 0)
            if revenue < filter_criteria['min_revenue']:
                return False
                
        # Complexity filter
        if 'max_complexity' in filter_criteria:
            complexity = project.get('technical_complexity', 5)
            if complexity > filter_criteria['max_complexity']:
                return False
                
        # Development time filter
        if 'max_dev_time' in filter_criteria:
            dev_time = project.get('development_time', 7)
            if dev_time > filter_criteria['max_dev_time']:
                return False
                
        return True
        
    def portfolio_optimization(self, budget: int, timeline_months: int, team_size: int) -> Dict[str, Any]:
        """Optimize project portfolio based on constraints."""
        scored_projects = self.prioritize_projects()
        
        # Estimate costs and timelines
        selected_projects = []
        total_cost = 0
        total_time = 0
        
        daily_rate = 500
        
        for project, score, breakdown in scored_projects:
            dev_time = project.get('development_time', 7)
            complexity = project.get('technical_complexity', 5)
            
            # Estimate cost
            estimated_cost = dev_time * daily_rate
            
            # Estimate time considering team size
            estimated_time = dev_time / team_size
            
            # Check if we can afford this project
            if total_cost + estimated_cost <= budget and total_time + estimated_time <= timeline_months * 30:
                selected_projects.append({
                    'project': project,
                    'score': score,
                    'breakdown': breakdown,
                    'estimated_cost': estimated_cost,
                    'estimated_time': estimated_time
                })
                total_cost += estimated_cost
                total_time += estimated_time
            else:
                break
                
        return {
            'selected_projects': selected_projects,
            'total_cost': total_cost,
            'total_time': total_time,
            'budget_utilization': total_cost / budget if budget > 0 else 0,
            'timeline_utilization': total_time / (timeline_months * 30) if timeline_months > 0 else 0,
            'total_expected_revenue': sum(p['project'].get('revenue_potential', {}).get('realistic', 0) for p in selected_projects)
        }
        
    def sensitivity_analysis(self, project_name: str) -> Dict[str, Any]:
        """Perform sensitivity analysis on scoring factors."""
        project = None
        for p in self.projects:
            if p['name'].lower() == project_name.lower():
                project = p
                break
                
        if not project:
            return {'error': 'Project not found'}
            
        base_score, base_breakdown = self.calculate_priority_score(project)
        
        # Test weight variations
        sensitivity_results = {}
        weight_variations = [-0.1, -0.05, 0.05, 0.1]
        
        for factor in self.config['weights']:
            factor_sensitivity = []
            
            for variation in weight_variations:
                # Temporarily modify weight
                original_weight = self.config['weights'][factor]
                self.config['weights'][factor] += variation
                
                # Recalculate score
                new_score, _ = self.calculate_priority_score(project)
                
                # Restore original weight
                self.config['weights'][factor] = original_weight
                
                factor_sensitivity.append({
                    'weight_change': variation,
                    'score_change': new_score - base_score,
                    'sensitivity': (new_score - base_score) / variation if variation != 0 else 0
                })
                
            sensitivity_results[factor] = factor_sensitivity
            
        return {
            'project': project['name'],
            'base_score': base_score,
            'sensitivity_analysis': sensitivity_results
        }

def main():
    parser = argparse.ArgumentParser(description="Advanced project prioritization and scoring")
    parser.add_argument("--prioritize", "-p", action="store_true", help="Prioritize all projects")
    parser.add_argument("--portfolio", "-o", action="store_true", help="Optimize project portfolio")
    parser.add_argument("--sensitivity", "-s", help="Perform sensitivity analysis on project")
    parser.add_argument("--budget", type=int, help="Budget for portfolio optimization")
    parser.add_argument("--timeline", type=int, help="Timeline in months")
    parser.add_argument("--team-size", type=int, help="Team size")
    parser.add_argument("--category", help="Filter by category")
    parser.add_argument("--platform", help="Filter by platform")
    parser.add_argument("--min-revenue", type=int, help="Minimum revenue filter")
    parser.add_argument("--max-complexity", type=int, help="Maximum complexity filter")
    parser.add_argument("--max-dev-time", type=int, help="Maximum development time filter")
    parser.add_argument("--limit", "-l", type=int, default=20, help="Number of results to show")
    parser.add_argument("--export", help="Export results to file")
    
    args = parser.parse_args()
    
    scorer = PriorityScorer()
    
    if args.sensitivity:
        print(f"🔍 Sensitivity Analysis for '{args.sensitivity}':")
        print("=" * 50)
        
        analysis = scorer.sensitivity_analysis(args.sensitivity)
        if 'error' in analysis:
            print(f"Error: {analysis['error']}")
            return
            
        print(f"Project: {analysis['project']}")
        print(f"Base Score: {analysis['base_score']:.2f}")
        print("\nSensitivity Analysis:")
        
        for factor, sensitivity_data in analysis['sensitivity_analysis'].items():
            print(f"\n{factor.replace('_', ' ').title()}:")
            for data in sensitivity_data:
                print(f"  Weight {data['weight_change']:+.2f}: Score {data['score_change']:+.2f} (Sensitivity: {data['sensitivity']:.2f})")
        return
        
    if args.portfolio:
        budget = args.budget or 50000
        timeline = args.timeline or 6
        team_size = args.team_size or 2
        
        print(f"📊 Portfolio Optimization:")
        print("=" * 50)
        print(f"Budget: ${budget:,}")
        print(f"Timeline: {timeline} months")
        print(f"Team Size: {team_size}")
        print()
        
        portfolio = scorer.portfolio_optimization(budget, timeline, team_size)
        
        print(f"Selected Projects: {len(portfolio['selected_projects'])}")
        print(f"Total Cost: ${portfolio['total_cost']:,} ({portfolio['budget_utilization']:.1%} of budget)")
        print(f"Total Time: {portfolio['total_time']:.1f} days ({portfolio['timeline_utilization']:.1%} of timeline)")
        print(f"Expected Revenue: ${portfolio['total_expected_revenue']:,}")
        print(f"Expected ROI: {portfolio['total_expected_revenue'] / portfolio['total_cost']:.1f}x")
        print()
        
        for i, project_data in enumerate(portfolio['selected_projects'], 1):
            project = project_data['project']
            print(f"{i}. {project['name']}")
            print(f"   Priority Score: {project_data['score']:.2f}")
            print(f"   Cost: ${project_data['estimated_cost']:,}")
            print(f"   Time: {project_data['estimated_time']:.1f} days")
            print(f"   Revenue: ${project.get('revenue_potential', {}).get('realistic', 0):,}")
            print()
        return
        
    # Default: prioritize projects
    filter_criteria = {}
    if args.category:
        filter_criteria['category'] = args.category
    if args.platform:
        filter_criteria['platform'] = args.platform
    if args.min_revenue:
        filter_criteria['min_revenue'] = args.min_revenue
    if args.max_complexity:
        filter_criteria['max_complexity'] = args.max_complexity
    if args.max_dev_time:
        filter_criteria['max_dev_time'] = args.max_dev_time
        
    print("🎯 Project Prioritization:")
    print("=" * 50)
    
    if filter_criteria:
        print("Filters applied:")
        for key, value in filter_criteria.items():
            print(f"  {key}: {value}")
        print()
        
    prioritized = scorer.prioritize_projects(filter_criteria)
    
    for i, (project, score, breakdown) in enumerate(prioritized[:args.limit], 1):
        print(f"{i}. {project['name']} (Priority: {score:.2f})")
        print(f"   Category: {project.get('category', 'N/A')}")
        print(f"   Revenue: ${project.get('revenue_potential', {}).get('realistic', 0):,}")
        print(f"   Development: {project.get('development_time', 'N/A')} days")
        print(f"   Complexity: {project.get('technical_complexity', 'N/A')}/10")
        print(f"   Breakdown: ROI={breakdown['roi']:.1f}, Risk={breakdown['risk']:.1f}, Effort={breakdown['effort']:.1f}")
        print()
        
    if args.export:
        export_data = {
            'timestamp': datetime.now().isoformat(),
            'prioritized_projects': [
                {
                    'rank': i,
                    'project': project,
                    'priority_score': score,
                    'score_breakdown': breakdown
                }
                for i, (project, score, breakdown) in enumerate(prioritized[:args.limit], 1)
            ]
        }
        
        with open(args.export, 'w') as f:
            json.dump(export_data, f, indent=2)
        print(f"Results exported to {args.export}")

if __name__ == "__main__":
    main()