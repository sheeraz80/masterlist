#!/usr/bin/env python3
"""
Shared utilities for project analysis and comparison tools
"""

import json
import os
import re
import math
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from datetime import datetime
from collections import defaultdict


@dataclass
class ProjectMetrics:
    """Standardized project metrics for comparison"""
    quality_score: float
    revenue_potential: Dict[str, float]
    technical_complexity: float
    development_time: float
    market_opportunity: float
    platform_coverage: int
    completeness_score: float
    risk_score: float


class ProjectDataLoader:
    """Loads and processes project data from various sources"""
    
    def __init__(self, base_path: str = "/home/sali/ai/projects/masterlist"):
        self.base_path = base_path
        self.projects_data = {}
        self.categories = {}
        self.load_all_data()
    
    def load_all_data(self):
        """Load all project data from consolidated JSON and individual files"""
        # Load consolidated data
        consolidated_path = os.path.join(self.base_path, "consolidated_projects.json")
        if os.path.exists(consolidated_path):
            with open(consolidated_path, 'r') as f:
                self.projects_data = json.load(f)
        
        # Load individual project files for additional data
        self._load_individual_projects()
        
        # Build category index
        self._build_category_index()
    
    def _load_individual_projects(self):
        """Load individual project files for quality scores, market analysis, etc."""
        for category in os.listdir(self.base_path):
            category_path = os.path.join(self.base_path, category)
            if os.path.isdir(category_path) and not category.startswith('.'):
                self._load_category_projects(category, category_path)
    
    def _load_category_projects(self, category: str, category_path: str):
        """Load projects from a specific category"""
        for project_name in os.listdir(category_path):
            project_path = os.path.join(category_path, project_name)
            if os.path.isdir(project_path):
                self._load_project_additional_data(project_name, project_path, category)
    
    def _load_project_additional_data(self, project_name: str, project_path: str, category: str):
        """Load additional data for a specific project"""
        # Find matching project in consolidated data
        project_key = None
        for key, data in self.projects_data.items():
            if data.get('project_name', '').lower().replace(' ', '-') == project_name.lower():
                project_key = key
                break
        
        if not project_key:
            return
        
        # Load quality score
        quality_path = os.path.join(project_path, "quality-score.md")
        if os.path.exists(quality_path):
            quality_data = self._parse_quality_score(quality_path)
            self.projects_data[project_key].update(quality_data)
        
        # Load market analysis
        market_path = os.path.join(project_path, "market-analysis.md")
        if os.path.exists(market_path):
            market_data = self._parse_market_analysis(market_path)
            self.projects_data[project_key].update(market_data)
        
        # Load alternatives
        alternatives_path = os.path.join(project_path, "alternatives.json")
        if os.path.exists(alternatives_path):
            with open(alternatives_path, 'r') as f:
                alternatives_data = json.load(f)
                self.projects_data[project_key]['alternatives'] = alternatives_data.get('alternatives', [])
        
        # Add category
        self.projects_data[project_key]['category'] = category
    
    def _parse_quality_score(self, file_path: str) -> Dict[str, Any]:
        """Parse quality score markdown file"""
        with open(file_path, 'r') as f:
            content = f.read()
        
        data = {}
        
        # Extract overall quality score
        score_match = re.search(r'\*\*(\d+\.?\d*)/10\*\*', content)
        if score_match:
            data['quality_score'] = float(score_match.group(1))
        
        # Extract individual scores
        completeness_match = re.search(r'Completeness Score: (\d+)/10', content)
        if completeness_match:
            data['completeness_score'] = float(completeness_match.group(1))
        
        revenue_match = re.search(r'Revenue Potential Score: (\d+)/10', content)
        if revenue_match:
            data['revenue_score'] = float(revenue_match.group(1))
        
        technical_match = re.search(r'Technical Feasibility Score: (\d+)/10', content)
        if technical_match:
            data['technical_feasibility'] = float(technical_match.group(1))
        
        market_match = re.search(r'Market Opportunity Score: (\d+)/10', content)
        if market_match:
            data['market_opportunity'] = float(market_match.group(1))
        
        platform_match = re.search(r'Platform Coverage Score: (\d+)/10', content)
        if platform_match:
            data['platform_coverage'] = float(platform_match.group(1))
        
        return data
    
    def _parse_market_analysis(self, file_path: str) -> Dict[str, Any]:
        """Parse market analysis markdown file"""
        with open(file_path, 'r') as f:
            content = f.read()
        
        data = {}
        
        # Extract competition level
        competition_match = re.search(r'Competition Level.*?Rating:\*\* (.+)', content, re.DOTALL)
        if competition_match:
            data['competition_level'] = competition_match.group(1).strip()
        
        # Extract revenue potential
        revenue_match = re.search(r'Revenue Potential.*?\$([0-9,]+) / \$([0-9,]+) / \$([0-9,]+)', content)
        if revenue_match:
            data['revenue_breakdown'] = {
                'conservative': int(revenue_match.group(1).replace(',', '')),
                'realistic': int(revenue_match.group(2).replace(',', '')),
                'optimistic': int(revenue_match.group(3).replace(',', ''))
            }
        
        return data
    
    def _build_category_index(self):
        """Build index of projects by category"""
        for project_id, project_data in self.projects_data.items():
            category = project_data.get('category', 'other')
            if category not in self.categories:
                self.categories[category] = []
            self.categories[category].append(project_id)
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project data by ID"""
        return self.projects_data.get(project_id)
    
    def get_projects_by_category(self, category: str) -> List[str]:
        """Get all project IDs in a category"""
        return self.categories.get(category, [])
    
    def get_all_projects(self) -> Dict[str, Any]:
        """Get all project data"""
        return self.projects_data
    
    def get_categories(self) -> List[str]:
        """Get all categories"""
        return list(self.categories.keys())


class ProjectAnalyzer:
    """Analyzes and compares projects"""
    
    def __init__(self, data_loader: ProjectDataLoader):
        self.data_loader = data_loader
        self.projects = data_loader.get_all_projects()
    
    def get_project_metrics(self, project_id: str) -> ProjectMetrics:
        """Extract standardized metrics for a project"""
        project = self.projects.get(project_id, {})
        
        # Quality score
        quality_score = project.get('quality_score', 0.0)
        
        # Revenue potential
        revenue_potential = {}
        revenue_text = project.get('revenue_potential', '')
        if 'revenue_breakdown' in project:
            revenue_potential = project['revenue_breakdown']
        else:
            revenue_potential = self._extract_revenue_from_text(revenue_text)
        
        # Technical complexity (convert to 0-10 scale, lower is better)
        complexity = project.get('technical_complexity', '5/10')
        technical_complexity = self._extract_complexity_score(complexity)
        
        # Development time in days
        dev_time = project.get('development_time', '')
        development_time = self._extract_development_days(dev_time)
        
        # Market opportunity
        market_opportunity = project.get('market_opportunity', 5.0)
        
        # Platform coverage (number of platforms)
        platforms = project.get('platforms', {})
        platform_coverage = len(platforms) if isinstance(platforms, dict) else 1
        
        # Completeness score
        completeness_score = project.get('completeness_score', 0.0)
        
        # Risk score (derived from various factors)
        risk_score = self._calculate_risk_score(project)
        
        return ProjectMetrics(
            quality_score=quality_score,
            revenue_potential=revenue_potential,
            technical_complexity=technical_complexity,
            development_time=development_time,
            market_opportunity=market_opportunity,
            platform_coverage=platform_coverage,
            completeness_score=completeness_score,
            risk_score=risk_score
        )
    
    def _extract_revenue_from_text(self, text: str) -> Dict[str, float]:
        """Extract revenue numbers from text"""
        revenue = {'conservative': 0, 'realistic': 0, 'optimistic': 0}
        
        # Look for patterns like "$1,000/month" or "~$2,000/month"
        amounts = re.findall(r'[\$~]([0-9,]+)', text)
        if len(amounts) >= 3:
            revenue['conservative'] = float(amounts[0].replace(',', ''))
            revenue['realistic'] = float(amounts[1].replace(',', ''))
            revenue['optimistic'] = float(amounts[2].replace(',', ''))
        
        return revenue
    
    def _extract_complexity_score(self, complexity_text: str) -> float:
        """Extract complexity score from text like '4/10'"""
        match = re.search(r'(\d+)/10', complexity_text)
        return float(match.group(1)) if match else 5.0
    
    def _extract_development_days(self, dev_time_text: str) -> float:
        """Extract development time in days"""
        # Look for patterns like "5 days", "~5 days", "1 week"
        days_match = re.search(r'(\d+)\s*days?', dev_time_text)
        if days_match:
            return float(days_match.group(1))
        
        weeks_match = re.search(r'(\d+)\s*weeks?', dev_time_text)
        if weeks_match:
            return float(weeks_match.group(1)) * 7
        
        months_match = re.search(r'(\d+)\s*months?', dev_time_text)
        if months_match:
            return float(months_match.group(1)) * 30
        
        return 7.0  # Default to 1 week
    
    def _calculate_risk_score(self, project: Dict[str, Any]) -> float:
        """Calculate risk score based on various factors"""
        risk_factors = []
        
        # Technical complexity risk
        complexity = self._extract_complexity_score(project.get('technical_complexity', '5/10'))
        risk_factors.append(complexity / 10.0)
        
        # Competition risk
        competition = project.get('competition_level', 'Medium').lower()
        competition_risk = {'low': 0.2, 'medium': 0.5, 'high': 0.8}.get(competition, 0.5)
        risk_factors.append(competition_risk)
        
        # Platform dependency risk
        platforms = project.get('platforms', {})
        platform_risk = 0.8 if len(platforms) == 1 else 0.4
        risk_factors.append(platform_risk)
        
        # Revenue uncertainty risk
        revenue_text = project.get('revenue_potential', '')
        revenue_risk = 0.6 if 'conservative' in revenue_text.lower() else 0.4
        risk_factors.append(revenue_risk)
        
        return sum(risk_factors) / len(risk_factors) * 10  # Scale to 0-10
    
    def compare_projects(self, project_ids: List[str]) -> Dict[str, Any]:
        """Compare multiple projects across all metrics"""
        comparison = {
            'projects': {},
            'metrics': {},
            'ranking': {}
        }
        
        # Get metrics for all projects
        for project_id in project_ids:
            project_data = self.projects.get(project_id, {})
            metrics = self.get_project_metrics(project_id)
            
            comparison['projects'][project_id] = {
                'name': project_data.get('project_name', project_id),
                'category': project_data.get('category', 'unknown'),
                'metrics': metrics,
                'data': project_data
            }
        
        # Calculate comparative metrics
        comparison['metrics'] = self._calculate_comparative_metrics(project_ids)
        
        # Rank projects
        comparison['ranking'] = self._rank_projects(project_ids)
        
        return comparison
    
    def _calculate_comparative_metrics(self, project_ids: List[str]) -> Dict[str, Any]:
        """Calculate comparative metrics across projects"""
        metrics = {
            'quality_scores': [],
            'revenue_realistic': [],
            'technical_complexity': [],
            'development_time': [],
            'market_opportunity': [],
            'platform_coverage': [],
            'risk_scores': []
        }
        
        for project_id in project_ids:
            project_metrics = self.get_project_metrics(project_id)
            metrics['quality_scores'].append(project_metrics.quality_score)
            metrics['revenue_realistic'].append(project_metrics.revenue_potential.get('realistic', 0))
            metrics['technical_complexity'].append(project_metrics.technical_complexity)
            metrics['development_time'].append(project_metrics.development_time)
            metrics['market_opportunity'].append(project_metrics.market_opportunity)
            metrics['platform_coverage'].append(project_metrics.platform_coverage)
            metrics['risk_scores'].append(project_metrics.risk_score)
        
        # Calculate statistics
        stats = {}
        for metric_name, values in metrics.items():
            if values:
                stats[metric_name] = {
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'min': np.min(values),
                    'max': np.max(values),
                    'median': np.median(values)
                }
        
        return stats
    
    def _rank_projects(self, project_ids: List[str]) -> Dict[str, Any]:
        """Rank projects based on multiple criteria"""
        rankings = {}
        
        # Define ranking criteria and weights
        criteria = {
            'quality_score': {'weight': 0.25, 'higher_better': True},
            'revenue_realistic': {'weight': 0.25, 'higher_better': True},
            'technical_complexity': {'weight': 0.15, 'higher_better': False},  # Lower complexity is better
            'development_time': {'weight': 0.10, 'higher_better': False},  # Shorter time is better
            'market_opportunity': {'weight': 0.15, 'higher_better': True},
            'risk_score': {'weight': 0.10, 'higher_better': False}  # Lower risk is better
        }
        
        # Calculate weighted scores
        project_scores = {}
        for project_id in project_ids:
            metrics = self.get_project_metrics(project_id)
            
            weighted_score = 0
            for criterion, config in criteria.items():
                if criterion == 'revenue_realistic':
                    value = metrics.revenue_potential.get('realistic', 0)
                else:
                    value = getattr(metrics, criterion)
                
                # Normalize value (0-1 scale)
                if criterion == 'revenue_realistic':
                    # Normalize revenue to 0-1 scale (assuming max $50k/month)
                    normalized = min(value / 50000, 1.0)
                elif criterion in ['quality_score', 'market_opportunity']:
                    normalized = value / 10.0
                elif criterion == 'technical_complexity':
                    normalized = 1.0 - (value / 10.0)  # Invert since lower is better
                elif criterion == 'development_time':
                    normalized = 1.0 - min(value / 30, 1.0)  # Invert, cap at 30 days
                elif criterion == 'risk_score':
                    normalized = 1.0 - (value / 10.0)  # Invert since lower is better
                else:
                    normalized = value / 10.0
                
                weighted_score += normalized * config['weight']
            
            project_scores[project_id] = weighted_score
        
        # Sort by score
        sorted_projects = sorted(project_scores.items(), key=lambda x: x[1], reverse=True)
        
        rankings['overall'] = [{'project_id': pid, 'score': score} for pid, score in sorted_projects]
        rankings['criteria_scores'] = project_scores
        
        return rankings


class ReportGenerator:
    """Generates various types of reports and visualizations"""
    
    def __init__(self, analyzer: ProjectAnalyzer):
        self.analyzer = analyzer
    
    def generate_ascii_table(self, data: List[List[str]], headers: List[str]) -> str:
        """Generate ASCII table for console output"""
        if not data:
            return ""
        
        # Calculate column widths
        col_widths = [len(header) for header in headers]
        for row in data:
            for i, cell in enumerate(row):
                col_widths[i] = max(col_widths[i], len(str(cell)))
        
        # Create table
        table = []
        
        # Header
        header_row = "| " + " | ".join(f"{header:<{col_widths[i]}}" for i, header in enumerate(headers)) + " |"
        table.append(header_row)
        
        # Separator
        separator = "|-" + "-|-".join("-" * width for width in col_widths) + "-|"
        table.append(separator)
        
        # Data rows
        for row in data:
            data_row = "| " + " | ".join(f"{str(cell):<{col_widths[i]}}" for i, cell in enumerate(row)) + " |"
            table.append(data_row)
        
        return "\n".join(table)
    
    def generate_ascii_bar_chart(self, data: Dict[str, float], title: str, max_width: int = 50) -> str:
        """Generate ASCII bar chart"""
        if not data:
            return ""
        
        chart = [f"\n{title}", "=" * len(title)]
        
        max_value = max(data.values()) if data.values() else 1
        
        for label, value in data.items():
            bar_length = int((value / max_value) * max_width)
            bar = "█" * bar_length
            chart.append(f"{label:<20} {bar} {value:.2f}")
        
        return "\n".join(chart)
    
    def export_to_json(self, data: Any, filename: str) -> str:
        """Export data to JSON file"""
        filepath = f"/home/sali/ai/projects/masterlist/scripts/tools/exports/{filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        return filepath
    
    def export_to_csv(self, data: List[Dict[str, Any]], filename: str) -> str:
        """Export data to CSV file"""
        filepath = f"/home/sali/ai/projects/masterlist/scripts/tools/exports/{filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        df = pd.DataFrame(data)
        df.to_csv(filepath, index=False)
        
        return filepath
    
    def export_to_markdown(self, content: str, filename: str) -> str:
        """Export content to Markdown file"""
        filepath = f"/home/sali/ai/projects/masterlist/scripts/tools/exports/{filename}"
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w') as f:
            f.write(content)
        
        return filepath


def calculate_similarity(project1: Dict[str, Any], project2: Dict[str, Any]) -> float:
    """Calculate similarity between two projects"""
    similarity_score = 0.0
    factors = 0
    
    # Category similarity
    if project1.get('category') == project2.get('category'):
        similarity_score += 0.3
    factors += 1
    
    # Platform similarity
    platforms1 = set(project1.get('platforms', {}).keys())
    platforms2 = set(project2.get('platforms', {}).keys())
    if platforms1 and platforms2:
        platform_similarity = len(platforms1.intersection(platforms2)) / len(platforms1.union(platforms2))
        similarity_score += platform_similarity * 0.2
    factors += 1
    
    # Revenue similarity
    revenue1 = project1.get('revenue_breakdown', {}).get('realistic', 0)
    revenue2 = project2.get('revenue_breakdown', {}).get('realistic', 0)
    if revenue1 and revenue2:
        revenue_similarity = 1 - abs(revenue1 - revenue2) / max(revenue1, revenue2)
        similarity_score += revenue_similarity * 0.15
    factors += 1
    
    # Complexity similarity
    complexity1 = project1.get('technical_complexity', 5)
    complexity2 = project2.get('technical_complexity', 5)
    complexity_similarity = 1 - abs(complexity1 - complexity2) / 10
    similarity_score += complexity_similarity * 0.15
    factors += 1
    
    # Quality similarity
    quality1 = project1.get('quality_score', 5)
    quality2 = project2.get('quality_score', 5)
    quality_similarity = 1 - abs(quality1 - quality2) / 10
    similarity_score += quality_similarity * 0.2
    factors += 1
    
    return similarity_score / factors if factors > 0 else 0.0


def normalize_score(value: float, min_val: float, max_val: float) -> float:
    """Normalize a score to 0-1 range"""
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def weighted_average(values: List[float], weights: List[float]) -> float:
    """Calculate weighted average"""
    if not values or not weights or len(values) != len(weights):
        return 0.0
    
    return sum(v * w for v, w in zip(values, weights)) / sum(weights)