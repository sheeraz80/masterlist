#!/usr/bin/env python3
"""
Find Similar Projects Tool for Masterlist
Uses multiple similarity algorithms to find related projects
"""

import argparse
import json
import sys
import os
import re
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict, Counter
from dataclasses import dataclass
from search_infrastructure import MasterlistSearchEngine, SearchResult
from search import (
    print_table_results, print_detailed_results, print_json_results,
    format_revenue, format_complexity, format_development_time
)


@dataclass
class SimilarityResult:
    """Represents a similarity result with score and reasons"""
    project_id: str
    project_data: Dict[str, Any]
    similarity_score: float
    similarity_reasons: List[str]
    path: str


class SimilarityEngine:
    """Engine for finding similar projects using multiple algorithms"""
    
    def __init__(self, search_engine: MasterlistSearchEngine):
        self.search_engine = search_engine
        self.projects = search_engine.projects_data['projects']
        self.index = search_engine.index
    
    def find_similar_projects(self, project_id: str, max_results: int = 10,
                            similarity_threshold: float = 0.1) -> List[SimilarityResult]:
        """
        Find projects similar to the given project
        
        Args:
            project_id: ID of the reference project
            max_results: Maximum number of similar projects to return
            similarity_threshold: Minimum similarity score to include
            
        Returns:
            List of SimilarityResult objects
        """
        if project_id not in self.projects:
            raise ValueError(f"Project '{project_id}' not found")
        
        reference_project = self.projects[project_id]
        similarities = []
        
        for other_id, other_project in self.projects.items():
            if other_id == project_id:
                continue
            
            score, reasons = self._calculate_similarity(reference_project, other_project)
            
            if score >= similarity_threshold:
                path = self._get_project_path(other_id, other_project)
                similarities.append(SimilarityResult(
                    project_id=other_id,
                    project_data=other_project,
                    similarity_score=score,
                    similarity_reasons=reasons,
                    path=path
                ))
        
        # Sort by similarity score
        similarities.sort(key=lambda x: x.similarity_score, reverse=True)
        return similarities[:max_results]
    
    def find_similar_by_criteria(self, criteria: Dict[str, Any], 
                                max_results: int = 10) -> List[SimilarityResult]:
        """
        Find projects similar to given criteria
        
        Args:
            criteria: Dictionary of criteria to match against
            max_results: Maximum number of results to return
            
        Returns:
            List of SimilarityResult objects
        """
        similarities = []
        
        for project_id, project_data in self.projects.items():
            score, reasons = self._calculate_criteria_similarity(criteria, project_data)
            
            if score > 0:
                path = self._get_project_path(project_id, project_data)
                similarities.append(SimilarityResult(
                    project_id=project_id,
                    project_data=project_data,
                    similarity_score=score,
                    similarity_reasons=reasons,
                    path=path
                ))
        
        # Sort by similarity score
        similarities.sort(key=lambda x: x.similarity_score, reverse=True)
        return similarities[:max_results]
    
    def _calculate_similarity(self, proj1: Dict[str, Any], 
                            proj2: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate similarity between two projects"""
        score = 0.0
        reasons = []
        
        # Category similarity (high weight)
        if proj1.get('category') == proj2.get('category'):
            score += 0.3
            reasons.append(f"Same category: {proj1.get('category')}")
        
        # Platform similarity
        platforms1 = set(proj1.get('platforms', []))
        platforms2 = set(proj2.get('platforms', []))
        platform_overlap = platforms1.intersection(platforms2)
        
        if platform_overlap:
            platform_score = len(platform_overlap) / max(len(platforms1), len(platforms2))
            score += platform_score * 0.2
            reasons.append(f"Shared platforms: {', '.join(platform_overlap)}")
        
        # Quality score similarity
        quality1 = proj1.get('quality_score', 0)
        quality2 = proj2.get('quality_score', 0)
        quality_diff = abs(quality1 - quality2)
        
        if quality_diff <= 1.0:
            quality_score = (1.0 - quality_diff / 1.0) * 0.1
            score += quality_score
            reasons.append(f"Similar quality scores: {quality1:.1f} vs {quality2:.1f}")
        
        # Text similarity
        text_score, text_reasons = self._calculate_text_similarity(proj1, proj2)
        score += text_score
        reasons.extend(text_reasons)
        
        # Revenue similarity
        revenue_score, revenue_reason = self._calculate_revenue_similarity(proj1, proj2)
        if revenue_score > 0:
            score += revenue_score
            reasons.append(revenue_reason)
        
        # Development time similarity
        dev_score, dev_reason = self._calculate_development_time_similarity(proj1, proj2)
        if dev_score > 0:
            score += dev_score
            reasons.append(dev_reason)
        
        # Technical complexity similarity
        complexity_score, complexity_reason = self._calculate_complexity_similarity(proj1, proj2)
        if complexity_score > 0:
            score += complexity_score
            reasons.append(complexity_reason)
        
        return score, reasons
    
    def _calculate_criteria_similarity(self, criteria: Dict[str, Any], 
                                     project: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate similarity between criteria and a project"""
        score = 0.0
        reasons = []
        
        # Category match
        if 'category' in criteria and criteria['category'] == project.get('category'):
            score += 0.3
            reasons.append(f"Category match: {criteria['category']}")
        
        # Platform match
        if 'platforms' in criteria:
            project_platforms = set(project.get('platforms', []))
            criteria_platforms = set(criteria['platforms'])
            overlap = project_platforms.intersection(criteria_platforms)
            
            if overlap:
                platform_score = len(overlap) / len(criteria_platforms)
                score += platform_score * 0.2
                reasons.append(f"Platform match: {', '.join(overlap)}")
        
        # Quality score range
        if 'quality_min' in criteria or 'quality_max' in criteria:
            quality = project.get('quality_score', 0)
            quality_min = criteria.get('quality_min', 0)
            quality_max = criteria.get('quality_max', 10)
            
            if quality_min <= quality <= quality_max:
                score += 0.15
                reasons.append(f"Quality in range: {quality:.1f}")
        
        # Keywords match
        if 'keywords' in criteria:
            keywords = criteria['keywords'].lower().split()
            project_text = self._get_project_text(project).lower()
            
            keyword_matches = sum(1 for keyword in keywords if keyword in project_text)
            if keyword_matches > 0:
                keyword_score = keyword_matches / len(keywords) * 0.2
                score += keyword_score
                reasons.append(f"Keyword matches: {keyword_matches}/{len(keywords)}")
        
        # Feature requirements
        if 'features' in criteria:
            features = criteria['features']
            project_features = ' '.join(project.get('key_features', [])).lower()
            project_text = self._get_project_text(project).lower()
            
            feature_matches = sum(1 for feature in features 
                                if feature.lower() in project_features or 
                                   feature.lower() in project_text)
            
            if feature_matches > 0:
                feature_score = feature_matches / len(features) * 0.25
                score += feature_score
                reasons.append(f"Feature matches: {feature_matches}/{len(features)}")
        
        return score, reasons
    
    def _calculate_text_similarity(self, proj1: Dict[str, Any], 
                                 proj2: Dict[str, Any]) -> Tuple[float, List[str]]:
        """Calculate text similarity between projects"""
        score = 0.0
        reasons = []
        
        # Get text content
        text1 = self._get_project_text(proj1)
        text2 = self._get_project_text(proj2)
        
        # Tokenize and create word frequency
        words1 = self._tokenize_text(text1)
        words2 = self._tokenize_text(text2)
        
        # Calculate Jaccard similarity
        set1 = set(words1)
        set2 = set(words2)
        
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        
        if union:
            jaccard_score = len(intersection) / len(union)
            if jaccard_score > 0.1:  # Threshold for text similarity
                score += jaccard_score * 0.15
                reasons.append(f"Text similarity: {jaccard_score:.2f}")
        
        # Key features similarity
        features1 = set(proj1.get('key_features', []))
        features2 = set(proj2.get('key_features', []))
        
        if features1 and features2:
            feature_words1 = set()
            feature_words2 = set()
            
            for feature in features1:
                feature_words1.update(self._tokenize_text(feature))
            
            for feature in features2:
                feature_words2.update(self._tokenize_text(feature))
            
            feature_intersection = feature_words1.intersection(feature_words2)
            feature_union = feature_words1.union(feature_words2)
            
            if feature_union:
                feature_similarity = len(feature_intersection) / len(feature_union)
                if feature_similarity > 0.2:
                    score += feature_similarity * 0.1
                    reasons.append(f"Feature similarity: {feature_similarity:.2f}")
        
        return score, reasons
    
    def _calculate_revenue_similarity(self, proj1: Dict[str, Any], 
                                    proj2: Dict[str, Any]) -> Tuple[float, str]:
        """Calculate revenue potential similarity"""
        revenue1 = self._extract_revenue_numbers(proj1.get('revenue_potential', ''))
        revenue2 = self._extract_revenue_numbers(proj2.get('revenue_potential', ''))
        
        if not revenue1 or not revenue2:
            return 0.0, ""
        
        # Use realistic revenue estimates
        realistic1 = self._get_realistic_revenue(revenue1)
        realistic2 = self._get_realistic_revenue(revenue2)
        
        if realistic1 and realistic2:
            # Calculate similarity based on revenue ranges
            ratio = min(realistic1, realistic2) / max(realistic1, realistic2)
            if ratio > 0.5:  # Similar revenue range
                score = ratio * 0.1
                return score, f"Similar revenue potential: ${realistic1:,} vs ${realistic2:,}"
        
        return 0.0, ""
    
    def _calculate_development_time_similarity(self, proj1: Dict[str, Any], 
                                             proj2: Dict[str, Any]) -> Tuple[float, str]:
        """Calculate development time similarity"""
        days1 = self._extract_days(proj1.get('development_time', ''))
        days2 = self._extract_days(proj2.get('development_time', ''))
        
        if days1 and days2:
            diff = abs(days1 - days2)
            if diff <= 3:  # Similar development time
                score = (1.0 - diff / 3.0) * 0.1
                return score, f"Similar development time: {days1} vs {days2} days"
        
        return 0.0, ""
    
    def _calculate_complexity_similarity(self, proj1: Dict[str, Any], 
                                       proj2: Dict[str, Any]) -> Tuple[float, str]:
        """Calculate technical complexity similarity"""
        complexity1 = self._extract_complexity(proj1.get('technical_complexity', ''))
        complexity2 = self._extract_complexity(proj2.get('technical_complexity', ''))
        
        if complexity1 and complexity2:
            diff = abs(complexity1 - complexity2)
            if diff <= 2:  # Similar complexity
                score = (1.0 - diff / 2.0) * 0.1
                return score, f"Similar complexity: {complexity1}/10 vs {complexity2}/10"
        
        return 0.0, ""
    
    def _get_project_text(self, project: Dict[str, Any]) -> str:
        """Get all text content from a project"""
        text_fields = [
            'name', 'problem_statement', 'solution_description',
            'target_users', 'revenue_model'
        ]
        
        text_parts = []
        for field in text_fields:
            if field in project:
                text_parts.append(str(project[field]))
        
        # Add key features
        if 'key_features' in project:
            text_parts.extend(project['key_features'])
        
        return ' '.join(text_parts)
    
    def _tokenize_text(self, text: str) -> List[str]:
        """Tokenize text into words"""
        # Convert to lowercase and extract words
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Remove common stop words
        stop_words = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
            'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
            'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'with', 'that',
            'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been',
            'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just',
            'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them',
            'well', 'were'
        }
        
        return [word for word in words if word not in stop_words]
    
    def _extract_revenue_numbers(self, text: str) -> List[int]:
        """Extract revenue numbers from text"""
        pattern = r'\$(\d{1,3}(?:,\d{3})*|\d+)'
        matches = re.findall(pattern, text)
        return [int(match.replace(',', '')) for match in matches]
    
    def _get_realistic_revenue(self, revenue_list: List[int]) -> Optional[int]:
        """Get realistic revenue estimate from list"""
        if not revenue_list:
            return None
        
        # Usually the middle value is realistic
        revenue_list.sort()
        if len(revenue_list) >= 2:
            return revenue_list[1]  # Second value is often realistic
        return revenue_list[0]
    
    def _extract_days(self, text: str) -> Optional[int]:
        """Extract number of days from text"""
        pattern = r'(\d+)(?:-\d+)?\s*days?'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
    
    def _extract_complexity(self, text: str) -> Optional[int]:
        """Extract technical complexity level"""
        pattern = r'(\d+)/10'
        match = re.search(pattern, text)
        if match:
            return int(match.group(1))
        return None
    
    def _get_project_path(self, project_id: str, project_data: Dict[str, Any]) -> str:
        """Get the file system path for a project"""
        category = project_data.get('category', 'other')
        return f"/home/sali/ai/projects/masterlist/{category}/{project_id}/"
    
    def find_projects_by_problem_domain(self, problem_keywords: List[str],
                                       max_results: int = 10) -> List[SimilarityResult]:
        """Find projects that solve similar problems"""
        similarities = []
        
        for project_id, project_data in self.projects.items():
            problem_statement = project_data.get('problem_statement', '').lower()
            solution_description = project_data.get('solution_description', '').lower()
            
            # Count keyword matches
            matches = 0
            matched_keywords = []
            
            for keyword in problem_keywords:
                keyword_lower = keyword.lower()
                if keyword_lower in problem_statement or keyword_lower in solution_description:
                    matches += 1
                    matched_keywords.append(keyword)
            
            if matches > 0:
                score = matches / len(problem_keywords)
                reasons = [f"Problem domain match: {', '.join(matched_keywords)}"]
                
                path = self._get_project_path(project_id, project_data)
                similarities.append(SimilarityResult(
                    project_id=project_id,
                    project_data=project_data,
                    similarity_score=score,
                    similarity_reasons=reasons,
                    path=path
                ))
        
        similarities.sort(key=lambda x: x.similarity_score, reverse=True)
        return similarities[:max_results]
    
    def find_projects_by_target_market(self, market_keywords: List[str],
                                      max_results: int = 10) -> List[SimilarityResult]:
        """Find projects targeting similar markets"""
        similarities = []
        
        for project_id, project_data in self.projects.items():
            target_users = project_data.get('target_users', '').lower()
            revenue_model = project_data.get('revenue_model', '').lower()
            
            matches = 0
            matched_keywords = []
            
            for keyword in market_keywords:
                keyword_lower = keyword.lower()
                if keyword_lower in target_users or keyword_lower in revenue_model:
                    matches += 1
                    matched_keywords.append(keyword)
            
            if matches > 0:
                score = matches / len(market_keywords)
                reasons = [f"Target market match: {', '.join(matched_keywords)}"]
                
                path = self._get_project_path(project_id, project_data)
                similarities.append(SimilarityResult(
                    project_id=project_id,
                    project_data=project_data,
                    similarity_score=score,
                    similarity_reasons=reasons,
                    path=path
                ))
        
        similarities.sort(key=lambda x: x.similarity_score, reverse=True)
        return similarities[:max_results]


def print_similarity_results(results: List[SimilarityResult], output_format: str = 'table',
                           show_path: bool = False, show_reasons: bool = True):
    """Print similarity results in various formats"""
    if not results:
        print("No similar projects found.")
        return
    
    if output_format == 'table':
        headers = ["Name", "Category", "Quality", "Similarity", "Platforms"]
        if show_path:
            headers.append("Path")
        
        # Calculate column widths
        col_widths = [len(header) for header in headers]
        
        for result in results:
            project = result.project_data
            row_data = [
                project.get('name', 'N/A'),
                project.get('category', 'N/A'),
                f"{project.get('quality_score', 0):.1f}",
                f"{result.similarity_score:.3f}",
                ', '.join(project.get('platforms', []))
            ]
            
            if show_path:
                row_data.append(result.path)
            
            for i, data in enumerate(row_data):
                col_widths[i] = max(col_widths[i], len(str(data)))
        
        # Print header
        header_line = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
        print(header_line)
        print("-" * len(header_line))
        
        # Print results
        for result in results:
            project = result.project_data
            row_data = [
                project.get('name', 'N/A'),
                project.get('category', 'N/A'),
                f"{project.get('quality_score', 0):.1f}",
                f"{result.similarity_score:.3f}",
                ', '.join(project.get('platforms', []))
            ]
            
            if show_path:
                row_data.append(result.path)
            
            row_line = " | ".join(str(data).ljust(col_widths[i]) for i, data in enumerate(row_data))
            print(row_line)
            
            if show_reasons and result.similarity_reasons:
                print(f"    Reasons: {'; '.join(result.similarity_reasons)}")
    
    elif output_format == 'detailed':
        for i, result in enumerate(results, 1):
            project = result.project_data
            print(f"\n{i}. {project.get('name', 'N/A')} (Similarity: {result.similarity_score:.3f})")
            print(f"   Category: {project.get('category', 'N/A')}")
            print(f"   Quality Score: {project.get('quality_score', 0):.1f}")
            print(f"   Platforms: {', '.join(project.get('platforms', []))}")
            
            if show_path:
                print(f"   Path: {result.path}")
            
            if show_reasons and result.similarity_reasons:
                print(f"   Similarity Reasons:")
                for reason in result.similarity_reasons:
                    print(f"     - {reason}")
            
            # Show problem statement
            problem = project.get('problem_statement', '')
            if problem:
                print(f"   Problem: {problem[:200]}..." if len(problem) > 200 else f"   Problem: {problem}")
    
    elif output_format == 'json':
        json_results = []
        for result in results:
            json_result = {
                'project_id': result.project_id,
                'name': result.project_data.get('name'),
                'category': result.project_data.get('category'),
                'quality_score': result.project_data.get('quality_score'),
                'platforms': result.project_data.get('platforms', []),
                'similarity_score': result.similarity_score,
                'similarity_reasons': result.similarity_reasons,
                'path': result.path,
                'problem_statement': result.project_data.get('problem_statement'),
                'solution_description': result.project_data.get('solution_description'),
                'key_features': result.project_data.get('key_features', [])
            }
            json_results.append(json_result)
        
        print(json.dumps(json_results, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Find similar projects in the masterlist",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Find projects similar to a specific project
  ./find-similar.py --project-id designaudit-buddy
  
  # Find projects similar to given criteria
  ./find-similar.py --category design-tools --platforms figma-plugin
  
  # Find projects solving similar problems
  ./find-similar.py --problem-keywords "automation,design,consistency"
  
  # Find projects targeting similar markets
  ./find-similar.py --market-keywords "developers,teams,enterprise"
  
  # Find similar projects with custom criteria
  ./find-similar.py --criteria-file similarity_criteria.json
        """
    )
    
    # Input methods
    parser.add_argument('--project-id', type=str,
                       help='Find projects similar to this project ID')
    parser.add_argument('--project-name', type=str,
                       help='Find projects similar to this project name')
    parser.add_argument('--category', type=str,
                       help='Find projects similar to this category')
    parser.add_argument('--platforms', type=str,
                       help='Find projects with similar platforms (comma-separated)')
    parser.add_argument('--keywords', type=str,
                       help='Find projects with similar keywords')
    parser.add_argument('--features', type=str,
                       help='Find projects with similar features (comma-separated)')
    parser.add_argument('--problem-keywords', type=str,
                       help='Find projects solving similar problems (comma-separated)')
    parser.add_argument('--market-keywords', type=str,
                       help='Find projects targeting similar markets (comma-separated)')
    parser.add_argument('--criteria-file', type=str,
                       help='JSON file with similarity criteria')
    
    # Filtering options
    parser.add_argument('--similarity-threshold', type=float, default=0.1,
                       help='Minimum similarity score threshold')
    parser.add_argument('--max-results', type=int, default=10,
                       help='Maximum number of results to return')
    
    # Output options
    parser.add_argument('--output', choices=['table', 'detailed', 'json'], default='table',
                       help='Output format')
    parser.add_argument('--show-path', action='store_true',
                       help='Show file system path for each project')
    parser.add_argument('--show-reasons', action='store_true', default=True,
                       help='Show similarity reasons')
    parser.add_argument('--no-reasons', action='store_true',
                       help='Hide similarity reasons')
    
    args = parser.parse_args()
    
    # Initialize search engine and similarity engine
    try:
        search_engine = MasterlistSearchEngine()
        similarity_engine = SimilarityEngine(search_engine)
    except ValueError as e:
        print(f"Error initializing search engine: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Determine show_reasons flag
    show_reasons = args.show_reasons and not args.no_reasons
    
    results = []
    
    # Find similar projects by project ID
    if args.project_id:
        try:
            results = similarity_engine.find_similar_projects(
                project_id=args.project_id,
                max_results=args.max_results,
                similarity_threshold=args.similarity_threshold
            )
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Find similar projects by project name
    elif args.project_name:
        # Find project ID by name
        project_id = None
        for pid, project_data in search_engine.projects_data['projects'].items():
            if project_data.get('name', '').lower() == args.project_name.lower():
                project_id = pid
                break
        
        if project_id:
            results = similarity_engine.find_similar_projects(
                project_id=project_id,
                max_results=args.max_results,
                similarity_threshold=args.similarity_threshold
            )
        else:
            print(f"Project with name '{args.project_name}' not found", file=sys.stderr)
            sys.exit(1)
    
    # Find similar projects by problem keywords
    elif args.problem_keywords:
        keywords = [k.strip() for k in args.problem_keywords.split(',')]
        results = similarity_engine.find_projects_by_problem_domain(
            problem_keywords=keywords,
            max_results=args.max_results
        )
    
    # Find similar projects by market keywords
    elif args.market_keywords:
        keywords = [k.strip() for k in args.market_keywords.split(',')]
        results = similarity_engine.find_projects_by_target_market(
            market_keywords=keywords,
            max_results=args.max_results
        )
    
    # Find similar projects by criteria file
    elif args.criteria_file:
        try:
            with open(args.criteria_file, 'r') as f:
                criteria = json.load(f)
            
            results = similarity_engine.find_similar_by_criteria(
                criteria=criteria,
                max_results=args.max_results
            )
        except (json.JSONDecodeError, OSError) as e:
            print(f"Error reading criteria file: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Find similar projects by manual criteria
    else:
        criteria = {}
        
        if args.category:
            criteria['category'] = args.category
        
        if args.platforms:
            criteria['platforms'] = [p.strip() for p in args.platforms.split(',')]
        
        if args.keywords:
            criteria['keywords'] = args.keywords
        
        if args.features:
            criteria['features'] = [f.strip() for f in args.features.split(',')]
        
        if criteria:
            results = similarity_engine.find_similar_by_criteria(
                criteria=criteria,
                max_results=args.max_results
            )
        else:
            parser.print_help()
            sys.exit(1)
    
    # Filter by similarity threshold
    if args.similarity_threshold > 0.1:
        results = [r for r in results if r.similarity_score >= args.similarity_threshold]
    
    # Display results
    print(f"Found {len(results)} similar projects:")
    print_similarity_results(results, args.output, args.show_path, show_reasons)
    
    if results and args.output != 'json':
        avg_similarity = sum(r.similarity_score for r in results) / len(results)
        print(f"\nAverage similarity score: {avg_similarity:.3f}")


if __name__ == "__main__":
    main()