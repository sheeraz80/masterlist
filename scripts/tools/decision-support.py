#!/usr/bin/env python3
"""
Interactive Decision Support System
Provides guided project selection wizard, what-if scenarios, and decision trees
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

from tools.utils import ProjectDataLoader, ProjectAnalyzer, ReportGenerator, ProjectMetrics
from tools.recommendation_engine import RecommendationEngine, UserProfile
from tools.priority_scorer import PriorityScorer, ScoringCriteria, PortfolioConstraints
from tools.compare_projects import ProjectComparator


@dataclass
class DecisionNode:
    """Node in decision tree"""
    question: str
    node_type: str  # 'question', 'recommendation', 'filter'
    options: List[str] = None
    filters: Dict[str, Any] = None
    children: Dict[str, 'DecisionNode'] = None
    recommendations: List[str] = None


@dataclass
class WhatIfScenario:
    """What-if scenario configuration"""
    name: str
    changes: Dict[str, Any]
    description: str


class DecisionSupportSystem:
    """Main decision support system class"""
    
    def __init__(self):
        self.data_loader = ProjectDataLoader()
        self.analyzer = ProjectAnalyzer(self.data_loader)
        self.report_generator = ReportGenerator(self.analyzer)
        self.recommendation_engine = RecommendationEngine()
        self.priority_scorer = PriorityScorer()
        self.comparator = ProjectComparator()
        self.all_projects = self.data_loader.get_all_projects()
        
        # Initialize decision tree
        self.decision_tree = self._build_decision_tree()
        
        # Load saved sessions
        self.saved_sessions = self._load_saved_sessions()
    
    def _build_decision_tree(self) -> DecisionNode:
        """Build decision tree for guided selection"""
        
        # Root node
        root = DecisionNode(
            question="What's your primary goal for this project?",
            node_type="question",
            options=["Learn new skills", "Generate revenue", "Build portfolio", "Solve a problem"],
            children={}
        )
        
        # Learning path
        learn_node = DecisionNode(
            question="What's your current experience level?",
            node_type="question",
            options=["Beginner", "Intermediate", "Advanced"],
            children={}
        )
        
        # Beginner learning
        learn_node.children["Beginner"] = DecisionNode(
            question="How much time can you dedicate per week?",
            node_type="question",
            options=["5-10 hours", "10-20 hours", "20+ hours"],
            children={}
        )
        
        # Revenue path
        revenue_node = DecisionNode(
            question="What's your target monthly revenue?",
            node_type="question",
            options=["$500-$2000", "$2000-$5000", "$5000+"],
            children={}
        )
        
        # Portfolio path
        portfolio_node = DecisionNode(
            question="What type of projects do you want to showcase?",
            node_type="question",
            options=["Technical complexity", "Business impact", "Innovation"],
            children={}
        )
        
        # Problem-solving path
        problem_node = DecisionNode(
            question="What domain interests you most?",
            node_type="question",
            options=["AI/ML", "Web Development", "Crypto/Blockchain", "Productivity"],
            children={}
        )
        
        # Add children to root
        root.children = {
            "Learn new skills": learn_node,
            "Generate revenue": revenue_node,
            "Build portfolio": portfolio_node,
            "Solve a problem": problem_node
        }
        
        # Build out the tree further
        self._build_detailed_tree(root)
        
        return root
    
    def _build_detailed_tree(self, root: DecisionNode):
        """Build detailed branches of the decision tree"""
        
        # Helper function to create terminal nodes with recommendations
        def create_terminal_node(filters: Dict[str, Any], description: str) -> DecisionNode:
            return DecisionNode(
                question=f"Based on your preferences: {description}",
                node_type="recommendation",
                filters=filters,
                recommendations=self._get_filtered_recommendations(filters)
            )
        
        # Learning path - Beginner
        beginner_node = root.children["Learn new skills"].children["Beginner"]
        beginner_node.children = {
            "5-10 hours": create_terminal_node(
                {"complexity_max": 4, "time_max": 14, "category": "ai-ml"},
                "Simple AI/ML projects for beginners"
            ),
            "10-20 hours": create_terminal_node(
                {"complexity_max": 6, "time_max": 21, "category": "browser-web"},
                "Web development projects with moderate complexity"
            ),
            "20+ hours": create_terminal_node(
                {"complexity_max": 8, "time_max": 30, "quality_min": 6},
                "More challenging learning projects"
            )
        }
        
        # Revenue path
        revenue_low = root.children["Generate revenue"].children["$500-$2000"]
        revenue_low = create_terminal_node(
            {"revenue_min": 500, "revenue_max": 2000, "risk_max": 6},
            "Lower-risk projects with steady revenue potential"
        )
        
        revenue_med = root.children["Generate revenue"].children["$2000-$5000"]
        revenue_med = create_terminal_node(
            {"revenue_min": 2000, "revenue_max": 5000, "quality_min": 6},
            "Medium-revenue projects with good market potential"
        )
        
        revenue_high = root.children["Generate revenue"].children["$5000+"]
        revenue_high = create_terminal_node(
            {"revenue_min": 5000, "quality_min": 7},
            "High-revenue projects with strong market potential"
        )
        
        # Portfolio path
        portfolio_tech = root.children["Build portfolio"].children["Technical complexity"]
        portfolio_tech = create_terminal_node(
            {"complexity_min": 7, "quality_min": 6},
            "Technically challenging projects that showcase skills"
        )
        
        portfolio_business = root.children["Build portfolio"].children["Business impact"]
        portfolio_business = create_terminal_node(
            {"revenue_min": 1000, "market_min": 7},
            "Business-focused projects with real market impact"
        )
        
        portfolio_innovation = root.children["Build portfolio"].children["Innovation"]
        portfolio_innovation = create_terminal_node(
            {"platform_coverage_min": 2, "market_min": 8},
            "Innovative projects exploring new platforms or markets"
        )
        
        # Problem-solving path
        ai_projects = root.children["Solve a problem"].children["AI/ML"]
        ai_projects = create_terminal_node(
            {"category": "ai-ml", "quality_min": 6},
            "AI/ML projects solving real problems"
        )
        
        web_projects = root.children["Solve a problem"].children["Web Development"]
        web_projects = create_terminal_node(
            {"category": "browser-web", "quality_min": 6},
            "Web development projects with practical applications"
        )
        
        crypto_projects = root.children["Solve a problem"].children["Crypto/Blockchain"]
        crypto_projects = create_terminal_node(
            {"category": "crypto-blockchain", "quality_min": 6},
            "Crypto/blockchain projects addressing market needs"
        )
        
        productivity_projects = root.children["Solve a problem"].children["Productivity"]
        productivity_projects = create_terminal_node(
            {"category": "productivity", "quality_min": 6},
            "Productivity tools and applications"
        )
    
    def _get_filtered_recommendations(self, filters: Dict[str, Any]) -> List[str]:
        """Get project recommendations based on filters"""
        
        filtered_projects = []
        
        for project_id, project_data in self.all_projects.items():
            metrics = self.analyzer.get_project_metrics(project_id)
            
            # Apply filters
            if "complexity_max" in filters and metrics.technical_complexity > filters["complexity_max"]:
                continue
            
            if "complexity_min" in filters and metrics.technical_complexity < filters["complexity_min"]:
                continue
            
            if "time_max" in filters and metrics.development_time > filters["time_max"]:
                continue
            
            if "revenue_min" in filters and metrics.revenue_potential.get('realistic', 0) < filters["revenue_min"]:
                continue
            
            if "revenue_max" in filters and metrics.revenue_potential.get('realistic', 0) > filters["revenue_max"]:
                continue
            
            if "risk_max" in filters and metrics.risk_score > filters["risk_max"]:
                continue
            
            if "quality_min" in filters and metrics.quality_score < filters["quality_min"]:
                continue
            
            if "market_min" in filters and metrics.market_opportunity < filters["market_min"]:
                continue
            
            if "platform_coverage_min" in filters and metrics.platform_coverage < filters["platform_coverage_min"]:
                continue
            
            if "category" in filters and project_data.get('category') != filters["category"]:
                continue
            
            filtered_projects.append(project_id)
        
        # Sort by quality score and return top 5
        filtered_projects.sort(key=lambda pid: self.analyzer.get_project_metrics(pid).quality_score, reverse=True)
        
        return filtered_projects[:5]
    
    def run_guided_wizard(self) -> Dict[str, Any]:
        """Run interactive guided project selection wizard"""
        
        print("\n" + "="*80)
        print("GUIDED PROJECT SELECTION WIZARD")
        print("="*80)
        print("Let's find the perfect project for you!")
        print()
        
        # Start traversal from root
        current_node = self.decision_tree
        path = []
        
        while current_node.node_type != "recommendation":
            print(f"❓ {current_node.question}")
            print()
            
            for i, option in enumerate(current_node.options, 1):
                print(f"   {i}. {option}")
            
            print()
            while True:
                try:
                    choice = input("Enter your choice (1-{}): ".format(len(current_node.options)))
                    choice_idx = int(choice) - 1
                    
                    if 0 <= choice_idx < len(current_node.options):
                        selected_option = current_node.options[choice_idx]
                        path.append((current_node.question, selected_option))
                        current_node = current_node.children[selected_option]
                        break
                    else:
                        print("Invalid choice. Please try again.")
                except ValueError:
                    print("Please enter a valid number.")
            
            print()
        
        # We've reached a recommendation node
        print("🎯 " + current_node.question)
        print()
        
        if current_node.recommendations:
            print("📋 Recommended Projects:")
            print("-" * 50)
            
            for i, project_id in enumerate(current_node.recommendations, 1):
                project_data = self.all_projects[project_id]
                metrics = self.analyzer.get_project_metrics(project_id)
                
                print(f"{i}. {project_data.get('project_name', project_id)}")
                print(f"   Category: {project_data.get('category', 'unknown')}")
                print(f"   Quality: {metrics.quality_score:.1f}/10")
                print(f"   Revenue: ${metrics.revenue_potential.get('realistic', 0):,}/month")
                print(f"   Complexity: {metrics.technical_complexity:.1f}/10")
                print(f"   Time: {metrics.development_time:.0f} days")
                print()
        
        # Ask if user wants detailed comparison
        if len(current_node.recommendations) > 1:
            compare = input("Would you like to see a detailed comparison? (y/n): ").lower().strip()
            if compare == 'y':
                comparison = self.comparator.compare_projects(current_node.recommendations)
                self.comparator.display_comparison(comparison)
        
        # Save wizard session
        wizard_session = {
            'timestamp': datetime.now().isoformat(),
            'path': path,
            'recommendations': current_node.recommendations,
            'filters': current_node.filters
        }
        
        self._save_wizard_session(wizard_session)
        
        return wizard_session
    
    def run_what_if_analysis(self, base_scenario: Dict[str, Any],
                           scenarios: List[WhatIfScenario]) -> Dict[str, Any]:
        """Run what-if scenario analysis"""
        
        print("\n" + "="*80)
        print("WHAT-IF SCENARIO ANALYSIS")
        print("="*80)
        
        results = {
            'base_scenario': base_scenario,
            'scenarios': {},
            'comparison': {}
        }
        
        # Calculate base scenario results
        print("📊 Base Scenario:")
        print(f"   {base_scenario.get('description', 'Current situation')}")
        print()
        
        if 'user_profile' in base_scenario:
            # Use recommendation engine for user-based scenarios
            user_profile = UserProfile(**base_scenario['user_profile'])
            base_recommendations = self.recommendation_engine.get_recommendations(
                'what_if_user', 10, 'personalized'
            )
            results['base_scenario']['recommendations'] = base_recommendations
            
            print("Base scenario recommendations:")
            for i, rec in enumerate(base_recommendations['recommendations'][:5], 1):
                print(f"   {i}. {rec['project_name']} (Score: {rec['compatibility_score']:.3f})")
        
        elif 'scoring_criteria' in base_scenario:
            # Use priority scorer for scoring-based scenarios
            base_scores = self.priority_scorer.calculate_priority_scores(
                config_name='what_if_base'
            )
            results['base_scenario']['scores'] = base_scores
            
            print("Base scenario top projects:")
            for ranking in base_scores['rankings'][:5]:
                print(f"   {ranking['rank']}. {ranking['project_name']} (Score: {ranking['score']:.3f})")
        
        print()
        
        # Run each scenario
        for scenario in scenarios:
            print(f"🔄 Scenario: {scenario.name}")
            print(f"   {scenario.description}")
            
            scenario_results = self._run_single_scenario(scenario, base_scenario)
            results['scenarios'][scenario.name] = scenario_results
            
            print("   Results:")
            if 'recommendations' in scenario_results:
                for i, rec in enumerate(scenario_results['recommendations']['recommendations'][:3], 1):
                    print(f"     {i}. {rec['project_name']} (Score: {rec['compatibility_score']:.3f})")
            elif 'scores' in scenario_results:
                for ranking in scenario_results['scores']['rankings'][:3]:
                    print(f"     {ranking['rank']}. {ranking['project_name']} (Score: {ranking['score']:.3f})")
            
            print()
        
        # Generate comparison
        results['comparison'] = self._compare_scenarios(results)
        
        print("📈 Scenario Comparison:")
        for comparison in results['comparison']['changes']:
            print(f"   {comparison['scenario']}: {comparison['summary']}")
        
        return results
    
    def _run_single_scenario(self, scenario: WhatIfScenario, 
                           base_scenario: Dict[str, Any]) -> Dict[str, Any]:
        """Run a single what-if scenario"""
        
        results = {}
        
        if 'user_profile' in base_scenario:
            # Modify user profile
            modified_profile = base_scenario['user_profile'].copy()
            modified_profile.update(scenario.changes)
            
            # Create temporary user profile
            temp_profile = UserProfile(**modified_profile)
            self.recommendation_engine.user_profiles['what_if_temp'] = temp_profile
            
            # Get recommendations
            recommendations = self.recommendation_engine.get_recommendations(
                'what_if_temp', 10, 'personalized'
            )
            results['recommendations'] = recommendations
        
        elif 'scoring_criteria' in base_scenario:
            # Modify scoring criteria
            modified_criteria = []
            for criterion in base_scenario['scoring_criteria']:
                modified_criterion = criterion.copy()
                
                # Apply changes
                if criterion['name'] in scenario.changes:
                    modified_criterion.update(scenario.changes[criterion['name']])
                
                modified_criteria.append(ScoringCriteria(**modified_criterion))
            
            # Create temporary scoring config
            temp_config_name = f"what_if_{scenario.name}"
            self.priority_scorer.scoring_configs[temp_config_name] = modified_criteria
            
            # Calculate scores
            scores = self.priority_scorer.calculate_priority_scores(
                config_name=temp_config_name
            )
            results['scores'] = scores
        
        return results
    
    def _compare_scenarios(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Compare scenario results"""
        
        comparison = {
            'changes': [],
            'stability_analysis': {},
            'sensitivity_metrics': {}
        }
        
        base_scenario = results['base_scenario']
        
        for scenario_name, scenario_results in results['scenarios'].items():
            
            if 'recommendations' in scenario_results and 'recommendations' in base_scenario:
                # Compare recommendations
                base_recs = {rec['project_id']: rec['compatibility_score'] 
                           for rec in base_scenario['recommendations']['recommendations']}
                scenario_recs = {rec['project_id']: rec['compatibility_score'] 
                               for rec in scenario_results['recommendations']['recommendations']}
                
                # Calculate changes
                common_projects = set(base_recs.keys()) & set(scenario_recs.keys())
                new_projects = set(scenario_recs.keys()) - set(base_recs.keys())
                removed_projects = set(base_recs.keys()) - set(scenario_recs.keys())
                
                avg_score_change = np.mean([
                    scenario_recs[pid] - base_recs[pid] 
                    for pid in common_projects
                ]) if common_projects else 0
                
                comparison['changes'].append({
                    'scenario': scenario_name,
                    'summary': f"{len(new_projects)} new, {len(removed_projects)} removed, avg score change: {avg_score_change:+.3f}",
                    'new_projects': len(new_projects),
                    'removed_projects': len(removed_projects),
                    'score_change': avg_score_change
                })
            
            elif 'scores' in scenario_results and 'scores' in base_scenario:
                # Compare scores
                base_scores = base_scenario['scores']['project_scores']
                scenario_scores = scenario_results['scores']['project_scores']
                
                # Calculate ranking changes
                base_rankings = {pid: rank for rank, pid in enumerate(
                    sorted(base_scores.keys(), key=lambda x: base_scores[x], reverse=True)
                )}
                scenario_rankings = {pid: rank for rank, pid in enumerate(
                    sorted(scenario_scores.keys(), key=lambda x: scenario_scores[x], reverse=True)
                )}
                
                ranking_changes = [
                    abs(scenario_rankings[pid] - base_rankings[pid])
                    for pid in base_rankings.keys() if pid in scenario_rankings
                ]
                
                avg_ranking_change = np.mean(ranking_changes) if ranking_changes else 0
                
                comparison['changes'].append({
                    'scenario': scenario_name,
                    'summary': f"Avg ranking change: {avg_ranking_change:.1f} positions",
                    'ranking_stability': 1.0 - (avg_ranking_change / len(base_rankings)) if base_rankings else 1.0
                })
        
        return comparison
    
    def analyze_decision_sensitivity(self, decision_factors: List[str],
                                   variation_range: float = 0.2) -> Dict[str, Any]:
        """Analyze sensitivity of decisions to factor changes"""
        
        print("\n" + "="*80)
        print("DECISION SENSITIVITY ANALYSIS")
        print("="*80)
        
        sensitivity_results = {}
        
        # Create base user profile
        base_profile = UserProfile(
            experience_level='intermediate',
            budget=5000,
            timeline=30,
            team_size=1,
            preferred_categories=['ai-ml', 'browser-web'],
            risk_tolerance='medium',
            revenue_priority=0.5,
            technical_preference='moderate',
            platforms=['chrome-extension', 'web-app'],
            time_commitment=20,
            skills=['python', 'javascript'],
            interests=['productivity', 'automation']
        )
        
        # Get base recommendations
        self.recommendation_engine.user_profiles['sensitivity_base'] = base_profile
        base_recommendations = self.recommendation_engine.get_recommendations(
            'sensitivity_base', 10, 'personalized'
        )
        
        base_top_projects = [rec['project_id'] for rec in base_recommendations['recommendations'][:5]]
        
        print("Base top 5 projects:")
        for i, rec in enumerate(base_recommendations['recommendations'][:5], 1):
            print(f"   {i}. {rec['project_name']} (Score: {rec['compatibility_score']:.3f})")
        print()
        
        # Test sensitivity for each factor
        for factor in decision_factors:
            print(f"🔬 Testing sensitivity to: {factor}")
            
            factor_sensitivity = {
                'factor': factor,
                'variations': {},
                'stability_score': 0,
                'impact_score': 0
            }
            
            # Test different variations
            variations = [-variation_range, -variation_range/2, variation_range/2, variation_range]
            
            for variation in variations:
                modified_profile = self._modify_profile_factor(base_profile, factor, variation)
                
                # Get recommendations with modified profile
                profile_id = f"sensitivity_{factor}_{variation}"
                self.recommendation_engine.user_profiles[profile_id] = modified_profile
                
                modified_recommendations = self.recommendation_engine.get_recommendations(
                    profile_id, 10, 'personalized'
                )
                
                modified_top_projects = [rec['project_id'] for rec in modified_recommendations['recommendations'][:5]]
                
                # Calculate stability metrics
                overlap = len(set(base_top_projects) & set(modified_top_projects))
                stability = overlap / 5.0
                
                # Calculate ranking changes
                ranking_changes = []
                for i, project_id in enumerate(base_top_projects):
                    if project_id in modified_top_projects:
                        new_rank = modified_top_projects.index(project_id)
                        ranking_changes.append(abs(new_rank - i))
                
                avg_ranking_change = np.mean(ranking_changes) if ranking_changes else 2.5
                
                factor_sensitivity['variations'][f"{variation:+.1f}"] = {
                    'stability': stability,
                    'avg_ranking_change': avg_ranking_change,
                    'top_projects': modified_top_projects
                }
                
                print(f"   {variation:+.1f}: Stability={stability:.2f}, Avg rank change={avg_ranking_change:.1f}")
            
            # Calculate overall factor sensitivity
            stabilities = [v['stability'] for v in factor_sensitivity['variations'].values()]
            factor_sensitivity['stability_score'] = np.mean(stabilities)
            factor_sensitivity['impact_score'] = 1.0 - factor_sensitivity['stability_score']
            
            sensitivity_results[factor] = factor_sensitivity
            print(f"   Overall stability: {factor_sensitivity['stability_score']:.3f}")
            print()
        
        # Summary
        print("📊 Sensitivity Summary:")
        sorted_factors = sorted(sensitivity_results.items(), 
                              key=lambda x: x[1]['impact_score'], reverse=True)
        
        for factor, data in sorted_factors:
            print(f"   {factor}: Impact={data['impact_score']:.3f}, Stability={data['stability_score']:.3f}")
        
        return {
            'base_recommendations': base_recommendations,
            'sensitivity_results': sensitivity_results,
            'factor_ranking': sorted_factors
        }
    
    def _modify_profile_factor(self, base_profile: UserProfile, 
                              factor: str, variation: float) -> UserProfile:
        """Modify a specific factor in user profile"""
        
        profile_dict = asdict(base_profile)
        
        if factor == 'budget':
            profile_dict['budget'] = int(base_profile.budget * (1 + variation))
        elif factor == 'timeline':
            profile_dict['timeline'] = int(base_profile.timeline * (1 + variation))
        elif factor == 'revenue_priority':
            profile_dict['revenue_priority'] = max(0, min(1, base_profile.revenue_priority + variation))
        elif factor == 'risk_tolerance':
            # Cycle through risk levels
            levels = ['low', 'medium', 'high']
            current_idx = levels.index(base_profile.risk_tolerance)
            new_idx = (current_idx + int(variation * 3)) % len(levels)
            profile_dict['risk_tolerance'] = levels[new_idx]
        elif factor == 'experience_level':
            # Cycle through experience levels
            levels = ['beginner', 'intermediate', 'advanced']
            current_idx = levels.index(base_profile.experience_level)
            new_idx = (current_idx + int(variation * 3)) % len(levels)
            profile_dict['experience_level'] = levels[new_idx]
        elif factor == 'team_size':
            profile_dict['team_size'] = max(1, int(base_profile.team_size * (1 + variation)))
        
        return UserProfile(**profile_dict)
    
    def build_decision_tree_interactive(self) -> Dict[str, Any]:
        """Build custom decision tree interactively"""
        
        print("\n" + "="*80)
        print("CUSTOM DECISION TREE BUILDER")
        print("="*80)
        print("Let's build a custom decision tree for your specific needs!")
        print()
        
        # Get root question
        root_question = input("What's the main decision you want to make? ")
        
        # Get options
        print("What are the main options or categories to consider?")
        options = []
        while True:
            option = input(f"Option {len(options) + 1} (or 'done' to finish): ").strip()
            if option.lower() == 'done':
                break
            if option:
                options.append(option)
        
        # Build tree structure
        tree_structure = {
            'root_question': root_question,
            'options': options,
            'branches': {},
            'timestamp': datetime.now().isoformat()
        }
        
        # For each option, define filtering criteria
        for option in options:
            print(f"\n📋 Setting up criteria for: {option}")
            
            criteria = {}
            
            # Quality threshold
            quality_min = input("Minimum quality score (0-10, or skip): ").strip()
            if quality_min.isdigit():
                criteria['quality_min'] = float(quality_min)
            
            # Revenue range
            revenue_min = input("Minimum monthly revenue (or skip): ").strip()
            if revenue_min.isdigit():
                criteria['revenue_min'] = float(revenue_min)
            
            # Complexity preference
            complexity_pref = input("Complexity preference (low/medium/high, or skip): ").strip().lower()
            if complexity_pref in ['low', 'medium', 'high']:
                if complexity_pref == 'low':
                    criteria['complexity_max'] = 4
                elif complexity_pref == 'medium':
                    criteria['complexity_min'] = 4
                    criteria['complexity_max'] = 7
                else:  # high
                    criteria['complexity_min'] = 7
            
            # Time constraint
            time_max = input("Maximum development time in days (or skip): ").strip()
            if time_max.isdigit():
                criteria['time_max'] = float(time_max)
            
            # Category preference
            category = input("Preferred category (ai-ml/browser-web/crypto-blockchain/etc, or skip): ").strip()
            if category:
                criteria['category'] = category
            
            tree_structure['branches'][option] = {
                'criteria': criteria,
                'recommendations': self._get_filtered_recommendations(criteria)
            }
        
        # Save custom tree
        tree_filename = f"custom_tree_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        tree_path = f"/home/sali/ai/projects/masterlist/scripts/tools/custom_trees/{tree_filename}"
        os.makedirs(os.path.dirname(tree_path), exist_ok=True)
        
        with open(tree_path, 'w') as f:
            json.dump(tree_structure, f, indent=2)
        
        print(f"\n✅ Custom decision tree saved to: {tree_filename}")
        
        # Display results
        print("\n📊 Decision Tree Results:")
        print(f"Main Question: {root_question}")
        print()
        
        for option, branch in tree_structure['branches'].items():
            print(f"Option: {option}")
            print(f"  Criteria: {branch['criteria']}")
            print(f"  Top Recommendations:")
            
            for i, project_id in enumerate(branch['recommendations'][:3], 1):
                project_data = self.all_projects[project_id]
                print(f"    {i}. {project_data.get('project_name', project_id)}")
            print()
        
        return tree_structure
    
    def _load_saved_sessions(self) -> Dict[str, Any]:
        """Load saved wizard sessions"""
        sessions_file = "/home/sali/ai/projects/masterlist/scripts/tools/wizard_sessions.json"
        if os.path.exists(sessions_file):
            try:
                with open(sessions_file, 'r') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}
    
    def _save_wizard_session(self, session: Dict[str, Any]):
        """Save wizard session"""
        sessions_file = "/home/sali/ai/projects/masterlist/scripts/tools/wizard_sessions.json"
        os.makedirs(os.path.dirname(sessions_file), exist_ok=True)
        
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.saved_sessions[session_id] = session
        
        with open(sessions_file, 'w') as f:
            json.dump(self.saved_sessions, f, indent=2)
    
    def generate_decision_report(self, analysis_results: Dict[str, Any]) -> str:
        """Generate comprehensive decision support report"""
        
        report = []
        
        # Header
        report.append("# Decision Support Analysis Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Wizard results
        if 'wizard_session' in analysis_results:
            session = analysis_results['wizard_session']
            report.append("## Guided Selection Results")
            report.append("### Decision Path")
            
            for question, answer in session.get('path', []):
                report.append(f"**Q:** {question}")
                report.append(f"**A:** {answer}")
                report.append("")
            
            report.append("### Recommended Projects")
            for project_id in session.get('recommendations', []):
                project_data = self.all_projects[project_id]
                metrics = self.analyzer.get_project_metrics(project_id)
                
                report.append(f"#### {project_data.get('project_name', project_id)}")
                report.append(f"- **Category:** {project_data.get('category', 'unknown')}")
                report.append(f"- **Quality Score:** {metrics.quality_score:.1f}/10")
                report.append(f"- **Revenue Potential:** ${metrics.revenue_potential.get('realistic', 0):,}/month")
                report.append(f"- **Technical Complexity:** {metrics.technical_complexity:.1f}/10")
                report.append(f"- **Development Time:** {metrics.development_time:.0f} days")
                report.append("")
        
        # What-if analysis
        if 'what_if_results' in analysis_results:
            what_if = analysis_results['what_if_results']
            report.append("## What-If Analysis")
            
            for scenario_name, scenario_data in what_if.get('scenarios', {}).items():
                report.append(f"### Scenario: {scenario_name}")
                
                if 'recommendations' in scenario_data:
                    report.append("Top recommendations:")
                    for i, rec in enumerate(scenario_data['recommendations']['recommendations'][:5], 1):
                        report.append(f"{i}. {rec['project_name']} (Score: {rec['compatibility_score']:.3f})")
                
                report.append("")
            
            # Comparison summary
            report.append("### Scenario Comparison")
            for comparison in what_if.get('comparison', {}).get('changes', []):
                report.append(f"**{comparison['scenario']}:** {comparison['summary']}")
            
            report.append("")
        
        # Sensitivity analysis
        if 'sensitivity_results' in analysis_results:
            sensitivity = analysis_results['sensitivity_results']
            report.append("## Sensitivity Analysis")
            
            report.append("### Factor Impact Ranking")
            for factor, data in sensitivity.get('factor_ranking', []):
                report.append(f"- **{factor}:** Impact={data['impact_score']:.3f}, Stability={data['stability_score']:.3f}")
            
            report.append("")
        
        return "\n".join(report)


def main():
    """Main function for command-line interface"""
    parser = argparse.ArgumentParser(description="Interactive decision support system")
    parser.add_argument("--mode", choices=['wizard', 'what-if', 'sensitivity', 'custom-tree'], 
                       default='wizard', help="Decision support mode")
    parser.add_argument("--export", choices=["json", "markdown"], help="Export format")
    parser.add_argument("--factors", nargs="+", 
                       default=['budget', 'timeline', 'revenue_priority', 'risk_tolerance'],
                       help="Factors for sensitivity analysis")
    parser.add_argument("--variation", type=float, default=0.2, 
                       help="Variation range for sensitivity analysis")
    
    args = parser.parse_args()
    
    decision_support = DecisionSupportSystem()
    
    try:
        results = {}
        
        if args.mode == 'wizard':
            # Run guided wizard
            wizard_session = decision_support.run_guided_wizard()
            results['wizard_session'] = wizard_session
        
        elif args.mode == 'what-if':
            # Run what-if analysis
            print("What-if analysis requires predefined scenarios.")
            print("This would be implemented with specific scenario definitions.")
            
            # Example scenarios
            base_scenario = {
                'description': 'Current user profile',
                'user_profile': {
                    'experience_level': 'intermediate',
                    'budget': 5000,
                    'timeline': 30,
                    'team_size': 1,
                    'preferred_categories': ['ai-ml'],
                    'risk_tolerance': 'medium',
                    'revenue_priority': 0.5,
                    'technical_preference': 'moderate',
                    'platforms': ['web-app'],
                    'time_commitment': 20,
                    'skills': ['python'],
                    'interests': ['automation']
                }
            }
            
            scenarios = [
                WhatIfScenario(
                    "Higher Budget",
                    {'budget': 10000},
                    "What if budget was doubled?"
                ),
                WhatIfScenario(
                    "Shorter Timeline",
                    {'timeline': 14},
                    "What if timeline was halved?"
                ),
                WhatIfScenario(
                    "Higher Risk Tolerance",
                    {'risk_tolerance': 'high'},
                    "What if willing to take more risk?"
                )
            ]
            
            what_if_results = decision_support.run_what_if_analysis(base_scenario, scenarios)
            results['what_if_results'] = what_if_results
        
        elif args.mode == 'sensitivity':
            # Run sensitivity analysis
            sensitivity_results = decision_support.analyze_decision_sensitivity(
                args.factors, args.variation
            )
            results['sensitivity_results'] = sensitivity_results
        
        elif args.mode == 'custom-tree':
            # Build custom decision tree
            custom_tree = decision_support.build_decision_tree_interactive()
            results['custom_tree'] = custom_tree
        
        # Export results if requested
        if args.export:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if args.export == 'json':
                filename = f"decision_support_{args.mode}_{timestamp}.json"
                filepath = decision_support.report_generator.export_to_json(results, filename)
                print(f"\nResults exported to: {filepath}")
            
            elif args.export == 'markdown':
                report = decision_support.generate_decision_report(results)
                filename = f"decision_support_{args.mode}_{timestamp}.md"
                filepath = decision_support.report_generator.export_to_markdown(report, filename)
                print(f"\nReport exported to: {filepath}")
        
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()