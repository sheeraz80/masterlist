#!/usr/bin/env python3
"""
Search Infrastructure for Masterlist Projects
Provides indexing, fuzzy search, ranking, and caching capabilities
"""

import json
import os
import re
import pickle
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict
import difflib


@dataclass
class SearchResult:
    """Represents a search result with metadata"""
    project_id: str
    project_data: Dict[str, Any]
    score: float
    matched_fields: List[str]
    path: str


class SearchIndex:
    """Creates and manages search indices for projects"""
    
    def __init__(self, projects_data: Dict[str, Any]):
        self.projects = projects_data.get('projects', {})
        self.metadata = projects_data.get('metadata', {})
        self.indices = {}
        self._build_indices()
    
    def _build_indices(self):
        """Build search indices for different fields"""
        self.indices = {
            'category': defaultdict(list),
            'platform': defaultdict(list),
            'keywords': defaultdict(list),
            'name': defaultdict(list),
            'quality_score': defaultdict(list),
            'revenue_potential': defaultdict(list),
            'development_time': defaultdict(list),
            'technical_complexity': defaultdict(list),
            'full_text': defaultdict(list)
        }
        
        for project_id, project_data in self.projects.items():
            # Index by category
            if 'category' in project_data:
                self.indices['category'][project_data['category']].append(project_id)
            
            # Index by platform
            if 'platforms' in project_data:
                for platform in project_data['platforms']:
                    self.indices['platform'][platform].append(project_id)
            
            # Index by name
            if 'name' in project_data:
                name_words = project_data['name'].lower().split()
                for word in name_words:
                    self.indices['name'][word].append(project_id)
            
            # Index by quality score ranges
            if 'quality_score' in project_data:
                score = project_data['quality_score']
                score_range = f"{int(score)}-{int(score) + 1}"
                self.indices['quality_score'][score_range].append(project_id)
            
            # Index by revenue potential (extract numeric values)
            if 'revenue_potential' in project_data:
                revenue_text = project_data['revenue_potential']
                revenue_numbers = self._extract_revenue_numbers(revenue_text)
                for revenue_range in revenue_numbers:
                    self.indices['revenue_potential'][revenue_range].append(project_id)
            
            # Index by development time
            if 'development_time' in project_data:
                days = self._extract_days(project_data['development_time'])
                if days:
                    self.indices['development_time'][f"{days}_days"].append(project_id)
            
            # Index by technical complexity
            if 'technical_complexity' in project_data:
                complexity = self._extract_complexity(project_data['technical_complexity'])
                if complexity:
                    self.indices['technical_complexity'][f"level_{complexity}"].append(project_id)
            
            # Full text indexing
            full_text = self._get_full_text(project_data)
            words = self._tokenize(full_text)
            for word in words:
                self.indices['full_text'][word].append(project_id)
    
    def _extract_revenue_numbers(self, text: str) -> List[str]:
        """Extract revenue numbers and create ranges"""
        # Extract dollar amounts like $800, $3,000, $15,000
        pattern = r'\$(\d{1,3}(?:,\d{3})*|\d+)'
        matches = re.findall(pattern, text)
        ranges = []
        
        for match in matches:
            amount = int(match.replace(',', ''))
            if amount < 1000:
                ranges.append('0-1000')
            elif amount < 5000:
                ranges.append('1000-5000')
            elif amount < 10000:
                ranges.append('5000-10000')
            elif amount < 20000:
                ranges.append('10000-20000')
            else:
                ranges.append('20000+')
        
        return ranges
    
    def _extract_days(self, text: str) -> Optional[int]:
        """Extract number of days from development time text"""
        # Look for patterns like "~5 days", "7 days", "3-5 days"
        pattern = r'(\d+)(?:-\d+)?\s*days?'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
    
    def _extract_complexity(self, text: str) -> Optional[int]:
        """Extract technical complexity level"""
        # Look for patterns like "4/10", "5/10"
        pattern = r'(\d+)/10'
        match = re.search(pattern, text)
        if match:
            return int(match.group(1))
        return None
    
    def _get_full_text(self, project_data: Dict[str, Any]) -> str:
        """Get full text content for a project"""
        text_fields = [
            'name', 'problem_statement', 'solution_description',
            'target_users', 'revenue_model', 'key_features'
        ]
        
        full_text = []
        for field in text_fields:
            if field in project_data:
                value = project_data[field]
                if isinstance(value, list):
                    full_text.extend(value)
                else:
                    full_text.append(str(value))
        
        return ' '.join(full_text).lower()
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into searchable words"""
        # Remove punctuation and split into words
        words = re.findall(r'\b[a-zA-Z]{2,}\b', text.lower())
        return [word for word in words if len(word) > 2]


class FuzzySearch:
    """Provides fuzzy search capabilities"""
    
    def __init__(self, index: SearchIndex):
        self.index = index
        self.all_terms = self._build_term_list()
    
    def _build_term_list(self) -> List[str]:
        """Build a list of all searchable terms"""
        terms = set()
        
        # Add category names
        terms.update(self.index.indices['category'].keys())
        
        # Add platform names
        terms.update(self.index.indices['platform'].keys())
        
        # Add common words from full text
        word_counts = defaultdict(int)
        for word_list in self.index.indices['full_text'].keys():
            word_counts[word_list] += len(self.index.indices['full_text'][word_list])
        
        # Only include words that appear in multiple projects
        common_words = [word for word, count in word_counts.items() if count > 1]
        terms.update(common_words)
        
        return sorted(list(terms))
    
    def find_similar_terms(self, query: str, max_results: int = 5) -> List[str]:
        """Find similar terms using fuzzy matching"""
        query = query.lower()
        matches = difflib.get_close_matches(query, self.all_terms, n=max_results, cutoff=0.6)
        return matches
    
    def search(self, query: str, threshold: float = 0.6) -> List[str]:
        """Perform fuzzy search and return matching terms"""
        query = query.lower()
        matches = []
        
        for term in self.all_terms:
            similarity = difflib.SequenceMatcher(None, query, term).ratio()
            if similarity >= threshold:
                matches.append((term, similarity))
        
        # Sort by similarity score
        matches.sort(key=lambda x: x[1], reverse=True)
        return [match[0] for match in matches]


class RankingEngine:
    """Ranks search results based on various criteria"""
    
    def __init__(self, index: SearchIndex):
        self.index = index
    
    def rank_results(self, project_ids: List[str], query_terms: List[str], 
                    boost_fields: Dict[str, float] = None) -> List[SearchResult]:
        """Rank search results with scoring"""
        if boost_fields is None:
            boost_fields = {
                'name': 2.0,
                'problem_statement': 1.5,
                'solution_description': 1.3,
                'key_features': 1.2,
                'quality_score': 1.0
            }
        
        results = []
        
        for project_id in project_ids:
            project_data = self.index.projects[project_id]
            score, matched_fields = self._calculate_score(project_data, query_terms, boost_fields)
            
            # Get project path
            path = self._get_project_path(project_id, project_data)
            
            results.append(SearchResult(
                project_id=project_id,
                project_data=project_data,
                score=score,
                matched_fields=matched_fields,
                path=path
            ))
        
        # Sort by score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results
    
    def _calculate_score(self, project_data: Dict[str, Any], query_terms: List[str], 
                        boost_fields: Dict[str, float]) -> Tuple[float, List[str]]:
        """Calculate relevance score for a project"""
        score = 0.0
        matched_fields = []
        
        # Base score from quality
        if 'quality_score' in project_data:
            score += project_data['quality_score'] * 0.1
        
        # Text matching score
        for field, boost in boost_fields.items():
            if field in project_data:
                field_text = str(project_data[field]).lower()
                field_matches = 0
                
                for term in query_terms:
                    term_lower = term.lower()
                    if term_lower in field_text:
                        field_matches += 1
                        if field not in matched_fields:
                            matched_fields.append(field)
                
                if field_matches > 0:
                    field_score = (field_matches / len(query_terms)) * boost
                    score += field_score
        
        # Bonus for exact name matches
        if 'name' in project_data:
            name = project_data['name'].lower()
            for term in query_terms:
                if term.lower() in name:
                    score += 1.0
        
        return score, matched_fields
    
    def _get_project_path(self, project_id: str, project_data: Dict[str, Any]) -> str:
        """Get the file system path for a project"""
        category = project_data.get('category', 'other')
        return f"/home/sali/ai/projects/masterlist/{category}/{project_id}/"


class SearchCache:
    """Caches search results to improve performance"""
    
    def __init__(self, cache_dir: str = None):
        if cache_dir is None:
            cache_dir = os.path.join(os.path.dirname(__file__), '.search_cache')
        
        self.cache_dir = cache_dir
        self.cache_duration = timedelta(hours=1)  # Cache for 1 hour
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def _get_cache_key(self, query: str, filters: Dict[str, Any]) -> str:
        """Generate cache key from query and filters"""
        cache_data = {
            'query': query,
            'filters': filters
        }
        cache_string = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_string.encode()).hexdigest()
    
    def get(self, query: str, filters: Dict[str, Any]) -> Optional[List[SearchResult]]:
        """Get cached results if available and not expired"""
        cache_key = self._get_cache_key(query, filters)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.cache")
        
        if not os.path.exists(cache_file):
            return None
        
        try:
            with open(cache_file, 'rb') as f:
                cached_data = pickle.load(f)
            
            # Check if cache is still valid
            if datetime.now() - cached_data['timestamp'] < self.cache_duration:
                return cached_data['results']
        except (pickle.PickleError, KeyError, OSError):
            pass
        
        return None
    
    def set(self, query: str, filters: Dict[str, Any], results: List[SearchResult]):
        """Cache search results"""
        cache_key = self._get_cache_key(query, filters)
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.cache")
        
        cached_data = {
            'timestamp': datetime.now(),
            'results': results
        }
        
        try:
            with open(cache_file, 'wb') as f:
                pickle.dump(cached_data, f)
        except (pickle.PickleError, OSError):
            pass  # Silently fail if caching doesn't work
    
    def clear(self):
        """Clear all cached results"""
        for filename in os.listdir(self.cache_dir):
            if filename.endswith('.cache'):
                try:
                    os.remove(os.path.join(self.cache_dir, filename))
                except OSError:
                    pass


class MasterlistSearchEngine:
    """Main search engine that coordinates all components"""
    
    def __init__(self, projects_file: str = None):
        if projects_file is None:
            projects_file = os.path.join(os.path.dirname(__file__), '..', 'projects.json')
        
        self.projects_file = projects_file
        self.projects_data = self._load_projects()
        self.index = SearchIndex(self.projects_data)
        self.fuzzy_search = FuzzySearch(self.index)
        self.ranking_engine = RankingEngine(self.index)
        self.cache = SearchCache()
    
    def _load_projects(self) -> Dict[str, Any]:
        """Load projects from JSON file"""
        try:
            with open(self.projects_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            raise ValueError(f"Error loading projects file: {e}")
    
    def search(self, query: str = "", filters: Dict[str, Any] = None, 
               use_cache: bool = True, max_results: int = 50) -> List[SearchResult]:
        """
        Perform a comprehensive search with filters
        
        Args:
            query: Search query string
            filters: Dictionary of filters to apply
            use_cache: Whether to use cached results
            max_results: Maximum number of results to return
            
        Returns:
            List of SearchResult objects
        """
        if filters is None:
            filters = {}
        
        # Check cache first
        if use_cache:
            cached_results = self.cache.get(query, filters)
            if cached_results:
                return cached_results[:max_results]
        
        # Get matching project IDs
        matching_projects = self._apply_filters(filters)
        
        # Apply text search if query provided
        if query.strip():
            text_matches = self._text_search(query)
            matching_projects = matching_projects.intersection(text_matches)
        
        # Rank results
        query_terms = query.split() if query else []
        results = self.ranking_engine.rank_results(list(matching_projects), query_terms)
        
        # Limit results
        results = results[:max_results]
        
        # Cache results
        if use_cache:
            self.cache.set(query, filters, results)
        
        return results
    
    def _apply_filters(self, filters: Dict[str, Any]) -> set:
        """Apply various filters to get matching project IDs"""
        matching_projects = set(self.projects_data['projects'].keys())
        
        # Category filter
        if 'category' in filters:
            categories = filters['category']
            if isinstance(categories, str):
                categories = [categories]
            
            category_matches = set()
            for category in categories:
                category_matches.update(self.index.indices['category'].get(category, []))
            
            matching_projects = matching_projects.intersection(category_matches)
        
        # Platform filter
        if 'platform' in filters or 'platforms' in filters:
            platforms = filters.get('platform', filters.get('platforms', []))
            if isinstance(platforms, str):
                platforms = [platforms]
            
            platform_matches = set()
            for platform in platforms:
                platform_matches.update(self.index.indices['platform'].get(platform, []))
            
            matching_projects = matching_projects.intersection(platform_matches)
        
        # Quality score filter
        if 'quality_min' in filters or 'quality_max' in filters:
            quality_min = filters.get('quality_min', 0)
            quality_max = filters.get('quality_max', 10)
            
            quality_matches = set()
            for project_id in matching_projects:
                project = self.projects_data['projects'][project_id]
                quality = project.get('quality_score', 0)
                if quality_min <= quality <= quality_max:
                    quality_matches.add(project_id)
            
            matching_projects = matching_projects.intersection(quality_matches)
        
        # Revenue filter
        if 'revenue_min' in filters or 'revenue_max' in filters:
            revenue_min = filters.get('revenue_min', 0)
            revenue_max = filters.get('revenue_max', float('inf'))
            
            revenue_matches = set()
            for project_id in matching_projects:
                project = self.projects_data['projects'][project_id]
                revenue_text = project.get('revenue_potential', '')
                revenue_values = self._extract_revenue_values(revenue_text)
                
                if revenue_values and any(revenue_min <= val <= revenue_max for val in revenue_values):
                    revenue_matches.add(project_id)
            
            matching_projects = matching_projects.intersection(revenue_matches)
        
        # Development time filter
        if 'development_time_max' in filters:
            max_days = filters['development_time_max']
            
            time_matches = set()
            for project_id in matching_projects:
                project = self.projects_data['projects'][project_id]
                days = self.index._extract_days(project.get('development_time', ''))
                if days and days <= max_days:
                    time_matches.add(project_id)
            
            matching_projects = matching_projects.intersection(time_matches)
        
        # Technical complexity filter
        if 'complexity_max' in filters:
            max_complexity = filters['complexity_max']
            
            complexity_matches = set()
            for project_id in matching_projects:
                project = self.projects_data['projects'][project_id]
                complexity = self.index._extract_complexity(project.get('technical_complexity', ''))
                if complexity and complexity <= max_complexity:
                    complexity_matches.add(project_id)
            
            matching_projects = matching_projects.intersection(complexity_matches)
        
        return matching_projects
    
    def _text_search(self, query: str) -> set:
        """Perform text search across projects"""
        query_terms = query.lower().split()
        matching_projects = set()
        
        for term in query_terms:
            # Direct matches
            direct_matches = self.index.indices['full_text'].get(term, [])
            matching_projects.update(direct_matches)
            
            # Fuzzy matches
            fuzzy_matches = self.fuzzy_search.search(term, threshold=0.7)
            for fuzzy_term in fuzzy_matches:
                fuzzy_project_matches = self.index.indices['full_text'].get(fuzzy_term, [])
                matching_projects.update(fuzzy_project_matches)
        
        return matching_projects
    
    def _extract_revenue_values(self, text: str) -> List[int]:
        """Extract numeric revenue values from text"""
        pattern = r'\$(\d{1,3}(?:,\d{3})*|\d+)'
        matches = re.findall(pattern, text)
        return [int(match.replace(',', '')) for match in matches]
    
    def get_autocomplete_suggestions(self, partial_query: str, max_suggestions: int = 10) -> List[str]:
        """Get autocomplete suggestions for a partial query"""
        return self.fuzzy_search.find_similar_terms(partial_query, max_suggestions)
    
    def get_categories(self) -> List[str]:
        """Get all available categories"""
        return sorted(list(self.index.indices['category'].keys()))
    
    def get_platforms(self) -> List[str]:
        """Get all available platforms"""
        return sorted(list(self.index.indices['platform'].keys()))
    
    def get_stats(self) -> Dict[str, Any]:
        """Get search engine statistics"""
        return {
            'total_projects': len(self.projects_data['projects']),
            'categories': len(self.index.indices['category']),
            'platforms': len(self.index.indices['platform']),
            'indexed_terms': len(self.index.indices['full_text']),
            'last_updated': self.projects_data['metadata'].get('last_updated', 'Unknown')
        }


def main():
    """Test the search infrastructure"""
    search_engine = MasterlistSearchEngine()
    
    print("Search Engine Statistics:")
    stats = search_engine.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\nAvailable Categories:")
    for category in search_engine.get_categories():
        print(f"  - {category}")
    
    print("\nAvailable Platforms:")
    for platform in search_engine.get_platforms():
        print(f"  - {platform}")
    
    # Test search
    print("\nTesting search for 'design':")
    results = search_engine.search("design", max_results=5)
    for result in results:
        print(f"  - {result.project_data['name']} (score: {result.score:.2f})")


if __name__ == "__main__":
    main()