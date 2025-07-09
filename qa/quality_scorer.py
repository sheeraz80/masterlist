#!/usr/bin/env python3
"""
Quality Scoring System - Automated project quality assessment
Evaluates projects based on multiple criteria and provides actionable feedback.
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple
from datetime import datetime
import statistics

class QualityScorer:
    def __init__(self, projects_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize the quality scorer."""
        self.projects_path = Path(projects_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tags = self.load_tags()
        
        # Define scoring criteria and weights
        self.criteria_weights = {
            'completeness': 0.20,      # How complete is the project data
            'clarity': 0.15,           # How clear is the description
            'feasibility': 0.15,       # How feasible is the project
            'market_fit': 0.15,        # How well does it fit the market
            'innovation': 0.10,        # How innovative is the idea
            'monetization': 0.10,      # How clear is the monetization
            'technical_balance': 0.10, # Balance between complexity and time
            'documentation': 0.05      # Quality of documentation
        }
        
    def load_projects(self) -> Dict[str, Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.projects_path, 'r') as f:
                data = json.load(f)
                return data.get('projects', {})
        except FileNotFoundError:
            return {}
            
    def load_tags(self) -> Dict[str, List[str]]:
        """Load tags from JSON file."""
        try:
            with open(self.tags_path, 'r') as f:
                data = json.load(f)
                return data.get('project_tags', {})
        except FileNotFoundError:
            return {}
            
    def score_completeness(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score how complete the project data is."""
        score = 10.0
        feedback = []
        
        # Required fields check
        required_fields = [
            'name', 'category', 'platforms', 'problem_statement',
            'solution_description', 'target_users', 'revenue_model',
            'revenue_potential', 'development_time', 'technical_complexity',
            'competition_level', 'key_features'
        ]
        
        missing_fields = []
        empty_fields = []
        
        for field in required_fields:
            if field not in project_data:
                missing_fields.append(field)
                score -= 1.0
            elif not project_data[field]:
                empty_fields.append(field)
                score -= 0.5
                
        if missing_fields:
            feedback.append(f"Missing fields: {', '.join(missing_fields)}")
        if empty_fields:
            feedback.append(f"Empty fields: {', '.join(empty_fields)}")
            
        # Bonus for extra fields
        optional_fields = ['cross_platform_project', 'completeness_score']
        for field in optional_fields:
            if field in project_data and project_data[field]:
                score += 0.25
                
        return max(0, min(10, score)), feedback
        
    def score_clarity(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score the clarity of descriptions."""
        score = 10.0
        feedback = []
        
        # Problem statement clarity
        problem = project_data.get('problem_statement', '')
        if len(problem) < 50:
            score -= 2.0
            feedback.append("Problem statement too short (< 50 chars)")
        elif len(problem) > 500:
            score -= 0.5
            feedback.append("Problem statement might be too verbose")
            
        # Solution description clarity
        solution = project_data.get('solution_description', '')
        if len(solution) < 50:
            score -= 2.0
            feedback.append("Solution description too short (< 50 chars)")
            
        # Check for vague language
        vague_terms = ['some', 'many', 'various', 'etc', 'and so on', 'stuff', 'things']
        problem_lower = problem.lower()
        solution_lower = solution.lower()
        
        vague_count = sum(1 for term in vague_terms if term in problem_lower or term in solution_lower)
        if vague_count > 2:
            score -= 1.0
            feedback.append("Too many vague terms in descriptions")
            
        # Check for clear value proposition
        value_keywords = ['save', 'improve', 'reduce', 'increase', 'automate', 'simplify', 'enhance']
        has_value = any(keyword in solution_lower for keyword in value_keywords)
        if not has_value:
            score -= 1.0
            feedback.append("Value proposition not clearly stated")
            
        return max(0, min(10, score)), feedback
        
    def score_feasibility(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score project feasibility."""
        score = 10.0
        feedback = []
        
        # Extract complexity and time
        complexity_str = project_data.get('technical_complexity', '')
        dev_time_str = project_data.get('development_time', '')
        
        # Parse complexity
        complexity = 5
        if isinstance(complexity_str, (int, float)):
            complexity = complexity_str
        elif isinstance(complexity_str, str):
            match = re.search(r'(\d+)', complexity_str)
            if match:
                complexity = int(match.group(1))
                
        # Parse development time
        dev_days = 7
        if dev_time_str:
            days_match = re.search(r'(\d+)\s*days?', dev_time_str.lower())
            weeks_match = re.search(r'(\d+)\s*weeks?', dev_time_str.lower())
            if days_match:
                dev_days = int(days_match.group(1))
            elif weeks_match:
                dev_days = int(weeks_match.group(1)) * 7
                
        # Check if complexity matches development time
        expected_days = complexity * 3  # Rough estimate
        
        if dev_days < expected_days * 0.5:
            score -= 2.0
            feedback.append(f"Development time ({dev_days} days) seems too optimistic for complexity {complexity}")
        elif dev_days > expected_days * 2:
            score -= 1.0
            feedback.append(f"Development time ({dev_days} days) seems excessive for complexity {complexity}")
            
        # Check platform feasibility
        platforms = project_data.get('platforms', [])
        if len(platforms) > 3:
            score -= 1.0
            feedback.append("Too many platforms for initial release")
            
        # Check feature count vs time
        features = project_data.get('key_features', [])
        if len(features) > dev_days:
            score -= 1.0
            feedback.append("Too many features for the development timeframe")
            
        return max(0, min(10, score)), feedback
        
    def score_market_fit(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score market fit and demand."""
        score = 8.0  # Start at 8 since market fit is harder to assess
        feedback = []
        
        # Target users clarity
        target_users = project_data.get('target_users', '').lower()
        if not target_users:
            score -= 3.0
            feedback.append("No target users specified")
        elif 'everyone' in target_users or 'anyone' in target_users:
            score -= 2.0
            feedback.append("Target users too broad - needs more focus")
            
        # Competition assessment
        competition = project_data.get('competition_level', '').lower()
        if 'high' in competition:
            score -= 1.0
            feedback.append("High competition may make market entry difficult")
        elif 'low' in competition:
            score += 1.0
            feedback.append("Low competition is a positive indicator")
            
        # Revenue model clarity
        revenue_model = project_data.get('revenue_model', '').lower()
        proven_models = ['subscription', 'freemium', 'saas', 'license', 'commission']
        
        has_proven_model = any(model in revenue_model for model in proven_models)
        if has_proven_model:
            score += 1.0
        else:
            feedback.append("Consider using a proven revenue model")
            
        # Check if problem is well-defined
        problem = project_data.get('problem_statement', '').lower()
        problem_keywords = ['struggle', 'difficult', 'time-consuming', 'expensive', 'inefficient', 'manual']
        
        has_clear_problem = any(keyword in problem for keyword in problem_keywords)
        if has_clear_problem:
            score += 0.5
        else:
            feedback.append("Problem statement could be more compelling")
            
        return max(0, min(10, score)), feedback
        
    def score_innovation(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score innovation and uniqueness."""
        score = 7.0  # Start at 7 since most ideas build on existing concepts
        feedback = []
        
        # Check for innovative keywords
        solution = project_data.get('solution_description', '').lower()
        innovation_keywords = ['ai', 'machine learning', 'blockchain', 'novel', 'unique', 'first', 'new approach']
        
        innovation_count = sum(1 for keyword in innovation_keywords if keyword in solution)
        if innovation_count >= 2:
            score += 2.0
            feedback.append("Uses innovative technologies or approaches")
        elif innovation_count == 1:
            score += 1.0
            
        # Check for unique features
        features = project_data.get('key_features', [])
        feature_text = ' '.join(features).lower()
        
        unique_keywords = ['automatic', 'intelligent', 'smart', 'adaptive', 'personalized', 'real-time']
        unique_count = sum(1 for keyword in unique_keywords if keyword in feature_text)
        
        if unique_count >= 3:
            score += 1.0
            feedback.append("Features show innovative thinking")
            
        # Penalty for me-too products
        category = project_data.get('category', '')
        if category in ['content-writing', 'productivity'] and 'ai' not in solution:
            score -= 1.0
            feedback.append("Crowded category needs more differentiation")
            
        return max(0, min(10, score)), feedback
        
    def score_monetization(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score monetization clarity and potential."""
        score = 8.0
        feedback = []
        
        # Revenue model clarity
        revenue_model = project_data.get('revenue_model', '')
        if not revenue_model:
            score -= 4.0
            feedback.append("No revenue model specified")
        elif len(revenue_model) < 30:
            score -= 2.0
            feedback.append("Revenue model needs more detail")
            
        # Revenue potential analysis
        revenue_potential = project_data.get('revenue_potential', '')
        if revenue_potential:
            # Check for concrete numbers
            has_numbers = bool(re.search(r'\$?\d+', revenue_potential))
            if has_numbers:
                score += 1.0
            else:
                score -= 1.0
                feedback.append("Revenue potential should include specific estimates")
                
            # Check for conservative/realistic/optimistic estimates
            has_scenarios = all(term in revenue_potential.lower() for term in ['conservative', 'realistic', 'optimistic'])
            if has_scenarios:
                score += 1.0
            else:
                feedback.append("Include Conservative/Realistic/Optimistic scenarios")
        else:
            score -= 3.0
            feedback.append("No revenue potential specified")
            
        return max(0, min(10, score)), feedback
        
    def score_technical_balance(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score technical complexity balance."""
        score = 8.0
        feedback = []
        
        # Parse complexity
        complexity_str = project_data.get('technical_complexity', '')
        complexity = 5
        
        if isinstance(complexity_str, (int, float)):
            complexity = complexity_str
        elif isinstance(complexity_str, str):
            match = re.search(r'(\d+)', complexity_str)
            if match:
                complexity = int(match.group(1))
                
        # Sweet spot analysis
        if 3 <= complexity <= 6:
            score += 2.0
            feedback.append("Good technical complexity balance")
        elif complexity < 3:
            score -= 1.0
            feedback.append("May be too simple to differentiate")
        elif complexity > 8:
            score -= 2.0
            feedback.append("High complexity increases risk")
            
        # Platform complexity
        platforms = project_data.get('platforms', [])
        if len(platforms) == 1:
            score += 1.0
            feedback.append("Single platform focus is good for MVP")
        elif len(platforms) > 2:
            score -= 1.0
            feedback.append("Consider focusing on fewer platforms initially")
            
        return max(0, min(10, score)), feedback
        
    def score_documentation(self, project_data: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Score documentation quality."""
        score = 8.0
        feedback = []
        
        # Key features quality
        features = project_data.get('key_features', [])
        if len(features) < 3:
            score -= 2.0
            feedback.append("Need at least 3 key features")
        elif len(features) > 7:
            score -= 1.0
            feedback.append("Too many features - focus on core value")
            
        # Feature description quality
        if features:
            avg_feature_length = sum(len(f) for f in features) / len(features)
            if avg_feature_length < 20:
                score -= 1.0
                feedback.append("Feature descriptions too brief")
            elif avg_feature_length > 100:
                score -= 0.5
                feedback.append("Feature descriptions too verbose")
                
        # Check for structured content
        problem = project_data.get('problem_statement', '')
        solution = project_data.get('solution_description', '')
        
        # Bonus for statistics or specifics
        has_stats = bool(re.search(r'\d+%|\$\d+|\d+ hours?|\d+ users?', problem + solution))
        if has_stats:
            score += 1.0
            feedback.append("Good use of specific statistics")
            
        # Check for technical details in solution
        tech_keywords = ['api', 'algorithm', 'database', 'framework', 'integration', 'platform']
        has_tech_details = any(keyword in solution.lower() for keyword in tech_keywords)
        if has_tech_details:
            score += 0.5
            
        return max(0, min(10, score)), feedback
        
    def calculate_overall_score(self, project_key: str, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall quality score for a project."""
        scores = {}
        all_feedback = []
        
        # Calculate individual scores
        criteria_scores = {
            'completeness': self.score_completeness(project_data),
            'clarity': self.score_clarity(project_data),
            'feasibility': self.score_feasibility(project_data),
            'market_fit': self.score_market_fit(project_data),
            'innovation': self.score_innovation(project_data),
            'monetization': self.score_monetization(project_data),
            'technical_balance': self.score_technical_balance(project_data),
            'documentation': self.score_documentation(project_data)
        }
        
        # Calculate weighted overall score
        overall_score = 0
        for criterion, (score, feedback) in criteria_scores.items():
            weight = self.criteria_weights[criterion]
            overall_score += score * weight
            scores[criterion] = {
                'score': score,
                'weight': weight,
                'weighted_score': score * weight,
                'feedback': feedback
            }
            all_feedback.extend(feedback)
            
        # Get current score for comparison
        current_score = project_data.get('quality_score', 0)
        
        return {
            'project_key': project_key,
            'project_name': project_data.get('name', project_key),
            'overall_score': round(overall_score, 1),
            'current_score': current_score,
            'score_change': round(overall_score - current_score, 1),
            'criteria_scores': scores,
            'all_feedback': all_feedback,
            'grade': self._get_grade(overall_score),
            'recommendation': self._get_recommendation(overall_score, current_score)
        }
        
    def _get_grade(self, score: float) -> str:
        """Get letter grade for score."""
        if score >= 9:
            return 'A+'
        elif score >= 8.5:
            return 'A'
        elif score >= 8:
            return 'A-'
        elif score >= 7.5:
            return 'B+'
        elif score >= 7:
            return 'B'
        elif score >= 6.5:
            return 'B-'
        elif score >= 6:
            return 'C+'
        elif score >= 5.5:
            return 'C'
        elif score >= 5:
            return 'C-'
        else:
            return 'D'
            
    def _get_recommendation(self, new_score: float, current_score: float) -> str:
        """Get recommendation based on scores."""
        diff = new_score - current_score
        
        if abs(diff) < 0.5:
            return "Score is accurate"
        elif diff > 2:
            return "Consider updating - significantly underrated"
        elif diff > 1:
            return "Slightly underrated"
        elif diff < -2:
            return "Consider updating - significantly overrated"
        elif diff < -1:
            return "Slightly overrated"
        else:
            return "Minor adjustment suggested"
            
    def score_all_projects(self) -> Dict[str, Any]:
        """Score all projects and generate report."""
        results = {
            'timestamp': datetime.now().isoformat(),
            'total_projects': len(self.projects),
            'projects_scored': 0,
            'average_score': 0,
            'score_distribution': {},
            'projects': {}
        }
        
        all_scores = []
        score_changes = []
        
        for project_key, project_data in self.projects.items():
            score_result = self.calculate_overall_score(project_key, project_data)
            results['projects'][project_key] = score_result
            results['projects_scored'] += 1
            
            overall_score = score_result['overall_score']
            all_scores.append(overall_score)
            score_changes.append(score_result['score_change'])
            
            # Track distribution
            grade = score_result['grade']
            results['score_distribution'][grade] = results['score_distribution'].get(grade, 0) + 1
            
        # Calculate statistics
        if all_scores:
            results['average_score'] = round(statistics.mean(all_scores), 2)
            results['median_score'] = round(statistics.median(all_scores), 2)
            results['score_std_dev'] = round(statistics.stdev(all_scores), 2) if len(all_scores) > 1 else 0
            results['average_change'] = round(statistics.mean(score_changes), 2)
            
        return results
        
    def generate_quality_report(self, results: Dict[str, Any], top_n: int = 20) -> str:
        """Generate quality assessment report."""
        lines = ["# Project Quality Assessment Report\n"]
        
        lines.append(f"**Generated:** {results['timestamp']}\n")
        
        # Summary statistics
        lines.append("## Summary Statistics\n")
        lines.append(f"- **Total Projects:** {results['total_projects']}")
        lines.append(f"- **Projects Scored:** {results['projects_scored']}")
        lines.append(f"- **Average Score:** {results.get('average_score', 0)}/10")
        lines.append(f"- **Median Score:** {results.get('median_score', 0)}/10")
        lines.append(f"- **Standard Deviation:** {results.get('score_std_dev', 0)}")
        lines.append(f"- **Average Score Change:** {results.get('average_change', 0):+.1f}")
        lines.append("")
        
        # Grade distribution
        lines.append("## Grade Distribution\n")
        for grade in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']:
            count = results['score_distribution'].get(grade, 0)
            if count > 0:
                percentage = (count / results['projects_scored']) * 100
                bar = '█' * int(percentage / 2)
                lines.append(f"{grade:3s}: {bar} {count} ({percentage:.1f}%)")
        lines.append("")
        
        # Top performers
        sorted_projects = sorted(
            results['projects'].items(),
            key=lambda x: x[1]['overall_score'],
            reverse=True
        )
        
        lines.append(f"## Top {top_n} Projects\n")
        for i, (project_key, score_data) in enumerate(sorted_projects[:top_n], 1):
            lines.append(f"### {i}. {score_data['project_name']} ({score_data['overall_score']}/10)\n")
            lines.append(f"**Grade:** {score_data['grade']} | **Current Score:** {score_data['current_score']} | **Change:** {score_data['score_change']:+.1f}")
            lines.append("\n**Criteria Scores:**")
            
            for criterion, data in score_data['criteria_scores'].items():
                lines.append(f"- {criterion.title()}: {data['score']:.1f}/10")
                
            if score_data['all_feedback']:
                lines.append("\n**Key Feedback:**")
                for feedback in score_data['all_feedback'][:3]:
                    lines.append(f"- {feedback}")
                    
            lines.append("")
            
        # Projects needing attention
        needs_attention = [
            (k, v) for k, v in results['projects'].items()
            if v['overall_score'] < 6 or abs(v['score_change']) > 2
        ]
        
        if needs_attention:
            lines.append("## Projects Needing Attention\n")
            
            for project_key, score_data in sorted(needs_attention, key=lambda x: x[1]['overall_score'])[:10]:
                lines.append(f"**{score_data['project_name']}** ({score_data['overall_score']}/10)")
                lines.append(f"- Current Score: {score_data['current_score']} | Change: {score_data['score_change']:+.1f}")
                lines.append(f"- Recommendation: {score_data['recommendation']}")
                
                # Show main issues
                if score_data['all_feedback']:
                    lines.append("- Main issues:")
                    for feedback in score_data['all_feedback'][:2]:
                        lines.append(f"  - {feedback}")
                lines.append("")
                
        # Recommendations
        lines.append("## General Recommendations\n")
        
        avg_change = results.get('average_change', 0)
        if abs(avg_change) > 1:
            lines.append(f"1. **Score Calibration Needed**: Average change of {avg_change:+.1f} suggests systematic over/under-rating")
            
        low_scorers = sum(1 for p in results['projects'].values() if p['overall_score'] < 6)
        if low_scorers > results['projects_scored'] * 0.2:
            lines.append(f"2. **Quality Improvement**: {low_scorers} projects ({low_scorers/results['projects_scored']*100:.1f}%) score below 6/10")
            
        lines.append("3. **Common Issues to Address:**")
        
        # Analyze common feedback
        feedback_counts = {}
        for project_data in results['projects'].values():
            for feedback in project_data['all_feedback']:
                key = feedback.split(':')[0] if ':' in feedback else feedback
                feedback_counts[key] = feedback_counts.get(key, 0) + 1
                
        for feedback, count in sorted(feedback_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
            lines.append(f"   - {feedback} ({count} projects)")
            
        return '\n'.join(lines)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Project quality scoring system")
    parser.add_argument('--score-all', action='store_true', help='Score all projects')
    parser.add_argument('--score-project', help='Score specific project')
    parser.add_argument('--report', help='Generate quality report')
    parser.add_argument('--update-scores', action='store_true', help='Update project quality scores')
    parser.add_argument('--top', type=int, default=20, help='Number of top projects to show')
    
    args = parser.parse_args()
    
    scorer = QualityScorer()
    
    if args.score_all:
        print("📊 Scoring all projects...")
        results = scorer.score_all_projects()
        
        print(f"\n✅ Scored {results['projects_scored']} projects")
        print(f"📈 Average Score: {results.get('average_score', 0)}/10")
        print(f"📊 Median Score: {results.get('median_score', 0)}/10")
        print(f"🔄 Average Change: {results.get('average_change', 0):+.1f}")
        
        if args.report:
            report = scorer.generate_quality_report(results, args.top)
            with open(args.report, 'w') as f:
                f.write(report)
            print(f"\n📄 Report saved to: {args.report}")
            
    elif args.score_project:
        if args.score_project not in scorer.projects:
            print(f"❌ Project '{args.score_project}' not found")
            return
            
        project_data = scorer.projects[args.score_project]
        result = scorer.calculate_overall_score(args.score_project, project_data)
        
        print(f"\n📊 Quality Score for '{result['project_name']}'")
        print(f"{'='*50}")
        print(f"Overall Score: {result['overall_score']}/10 ({result['grade']})")
        print(f"Current Score: {result['current_score']}/10")
        print(f"Score Change: {result['score_change']:+.1f}")
        print(f"Recommendation: {result['recommendation']}")
        
        print(f"\n📈 Criteria Breakdown:")
        for criterion, data in result['criteria_scores'].items():
            print(f"\n{criterion.title()}:")
            print(f"  Score: {data['score']:.1f}/10 (weight: {data['weight']:.0%})")
            if data['feedback']:
                print("  Feedback:")
                for feedback in data['feedback']:
                    print(f"    - {feedback}")
                    
    elif args.update_scores:
        print("🔄 Updating quality scores...")
        
        # Score all projects
        results = scorer.score_all_projects()
        
        # Load full project data
        try:
            with open(scorer.projects_path, 'r') as f:
                full_data = json.load(f)
                
            # Update scores
            updated_count = 0
            for project_key, score_data in results['projects'].items():
                if project_key in full_data['projects']:
                    old_score = full_data['projects'][project_key].get('quality_score', 0)
                    new_score = score_data['overall_score']
                    
                    if abs(old_score - new_score) > 0.1:
                        full_data['projects'][project_key]['quality_score'] = new_score
                        updated_count += 1
                        
            # Save updated data
            with open(scorer.projects_path, 'w') as f:
                json.dump(full_data, f, indent=2)
                
            print(f"✅ Updated {updated_count} quality scores")
            
        except Exception as e:
            print(f"❌ Error updating scores: {e}")
            
    else:
        parser.print_help()

if __name__ == "__main__":
    main()