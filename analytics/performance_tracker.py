#!/usr/bin/env python3
"""
Performance Metrics Tracker
Tracks and analyzes system performance, usage patterns, and growth metrics
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, deque
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class PerformanceTracker:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.metrics_file = os.path.join(data_dir, "performance_metrics.json")
        self.usage_file = os.path.join(data_dir, "usage_tracking.json")
        
        # Create data directory
        os.makedirs(data_dir, exist_ok=True)
        
        # Load existing metrics
        self.metrics = self._load_json(self.metrics_file, {
            "api_calls": defaultdict(list),
            "search_queries": [],
            "page_views": defaultdict(int),
            "feature_usage": defaultdict(int),
            "errors": [],
            "performance_timings": defaultdict(list)
        })
        
        self.usage_data = self._load_json(self.usage_file, {
            "daily_active_users": defaultdict(int),
            "feature_adoption": defaultdict(float),
            "user_sessions": [],
            "growth_metrics": {}
        })
        
        # In-memory buffers for real-time tracking
        self.response_times = deque(maxlen=1000)
        self.error_buffer = deque(maxlen=100)
        self.query_buffer = deque(maxlen=500)
    
    def _load_json(self, filepath: str, default: Any) -> Any:
        """Load JSON file or return default"""
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    return json.load(f)
            except:
                return default
        return default
    
    def _save_metrics(self):
        """Save metrics to file"""
        with open(self.metrics_file, 'w') as f:
            json.dump(self.metrics, f, indent=2, default=str)
    
    def _save_usage(self):
        """Save usage data to file"""
        with open(self.usage_file, 'w') as f:
            json.dump(self.usage_data, f, indent=2, default=str)
    
    def track_api_call(self, endpoint: str, method: str, response_time: float, 
                      status_code: int, user_id: str = None):
        """Track API call metrics"""
        call_data = {
            "timestamp": datetime.now().isoformat(),
            "endpoint": endpoint,
            "method": method,
            "response_time": response_time,
            "status_code": status_code,
            "user_id": user_id or "anonymous"
        }
        
        # Add to metrics
        date_key = datetime.now().strftime("%Y-%m-%d")
        self.metrics["api_calls"][date_key].append(call_data)
        
        # Add to response time buffer
        self.response_times.append(response_time)
        
        # Track errors
        if status_code >= 400:
            self.error_buffer.append(call_data)
            self.metrics["errors"].append(call_data)
        
        # Save periodically (every 100 calls)
        if len(self.metrics["api_calls"][date_key]) % 100 == 0:
            self._save_metrics()
    
    def track_search_query(self, query: str, filters: Dict, result_count: int, 
                          execution_time: float):
        """Track search query performance"""
        query_data = {
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "filters": filters,
            "result_count": result_count,
            "execution_time": execution_time
        }
        
        self.metrics["search_queries"].append(query_data)
        self.query_buffer.append(query_data)
        
        # Save periodically
        if len(self.metrics["search_queries"]) % 50 == 0:
            self._save_metrics()
    
    def track_page_view(self, page: str, user_id: str = None):
        """Track page view"""
        self.metrics["page_views"][page] += 1
        
        # Track daily active users
        date_key = datetime.now().strftime("%Y-%m-%d")
        if user_id:
            self.usage_data["daily_active_users"][date_key] += 1
    
    def track_feature_usage(self, feature: str, user_id: str = None):
        """Track feature usage"""
        self.metrics["feature_usage"][feature] += 1
        
        # Update feature adoption rate
        total_users = len(set(
            session.get("user_id") 
            for session in self.usage_data["user_sessions"]
        ))
        
        if total_users > 0:
            feature_users = sum(
                1 for session in self.usage_data["user_sessions"]
                if feature in session.get("features_used", [])
            )
            self.usage_data["feature_adoption"][feature] = feature_users / total_users
    
    def start_session(self, user_id: str, source: str = "web") -> str:
        """Start a new user session"""
        session_id = f"{user_id}_{int(time.time())}"
        
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "start_time": datetime.now().isoformat(),
            "source": source,
            "features_used": [],
            "pages_viewed": [],
            "actions": []
        }
        
        self.usage_data["user_sessions"].append(session_data)
        
        # Keep only last 1000 sessions
        if len(self.usage_data["user_sessions"]) > 1000:
            self.usage_data["user_sessions"] = self.usage_data["user_sessions"][-1000:]
        
        return session_id
    
    def update_session(self, session_id: str, action: str, details: Dict = None):
        """Update session with user action"""
        for session in reversed(self.usage_data["user_sessions"]):
            if session["session_id"] == session_id:
                session["actions"].append({
                    "action": action,
                    "timestamp": datetime.now().isoformat(),
                    "details": details or {}
                })
                
                # Track features and pages
                if action == "feature_use":
                    feature = details.get("feature")
                    if feature and feature not in session["features_used"]:
                        session["features_used"].append(feature)
                elif action == "page_view":
                    page = details.get("page")
                    if page and page not in session["pages_viewed"]:
                        session["pages_viewed"].append(page)
                
                break
    
    def end_session(self, session_id: str):
        """End a user session"""
        for session in reversed(self.usage_data["user_sessions"]):
            if session["session_id"] == session_id:
                session["end_time"] = datetime.now().isoformat()
                session["duration"] = (
                    datetime.now() - 
                    datetime.fromisoformat(session["start_time"])
                ).total_seconds()
                break
        
        self._save_usage()
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        # API performance
        avg_response_time = (
            sum(self.response_times) / len(self.response_times)
            if self.response_times else 0
        )
        
        # Error rate
        total_calls = sum(
            len(calls) for calls in self.metrics["api_calls"].values()
        )
        error_rate = len(self.metrics["errors"]) / total_calls if total_calls > 0 else 0
        
        # Search performance
        recent_queries = list(self.query_buffer)
        avg_search_time = (
            sum(q["execution_time"] for q in recent_queries) / len(recent_queries)
            if recent_queries else 0
        )
        
        return {
            "api_performance": {
                "average_response_time": round(avg_response_time, 3),
                "median_response_time": round(
                    sorted(self.response_times)[len(self.response_times)//2], 3
                ) if self.response_times else 0,
                "95th_percentile": round(
                    sorted(self.response_times)[int(len(self.response_times)*0.95)], 3
                ) if self.response_times else 0,
                "error_rate": round(error_rate * 100, 2),
                "total_calls": total_calls
            },
            "search_performance": {
                "average_execution_time": round(avg_search_time, 3),
                "total_queries": len(self.metrics["search_queries"]),
                "average_results": round(
                    sum(q["result_count"] for q in recent_queries) / len(recent_queries), 1
                ) if recent_queries else 0
            },
            "top_pages": dict(sorted(
                self.metrics["page_views"].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]),
            "top_features": dict(sorted(
                self.metrics["feature_usage"].items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
        }
    
    def get_usage_analytics(self) -> Dict[str, Any]:
        """Get usage analytics"""
        # Calculate DAU/MAU
        today = datetime.now()
        last_30_days = [
            (today - timedelta(days=i)).strftime("%Y-%m-%d")
            for i in range(30)
        ]
        
        dau_values = [
            self.usage_data["daily_active_users"].get(day, 0)
            for day in last_30_days
        ]
        
        # Session analytics
        recent_sessions = [
            s for s in self.usage_data["user_sessions"]
            if "duration" in s
        ][-100:]  # Last 100 completed sessions
        
        avg_session_duration = (
            sum(s["duration"] for s in recent_sessions) / len(recent_sessions)
            if recent_sessions else 0
        )
        
        # Feature adoption
        feature_adoption = dict(sorted(
            self.usage_data["feature_adoption"].items(),
            key=lambda x: x[1],
            reverse=True
        ))
        
        return {
            "user_metrics": {
                "daily_active_users": sum(dau_values) / len(dau_values),
                "monthly_active_users": len(set(
                    user for day_users in dau_values 
                    for user in day_users
                )),
                "dau_trend": "increasing" if dau_values[-7:] > dau_values[-14:-7] else "stable"
            },
            "session_metrics": {
                "average_duration": round(avg_session_duration, 1),
                "average_pages_per_session": round(
                    sum(len(s["pages_viewed"]) for s in recent_sessions) / len(recent_sessions), 1
                ) if recent_sessions else 0,
                "average_features_per_session": round(
                    sum(len(s["features_used"]) for s in recent_sessions) / len(recent_sessions), 1
                ) if recent_sessions else 0
            },
            "feature_adoption": feature_adoption,
            "user_flow": self._analyze_user_flow()
        }
    
    def _analyze_user_flow(self) -> Dict[str, Any]:
        """Analyze common user flows"""
        # Analyze page sequences
        page_sequences = defaultdict(int)
        
        for session in self.usage_data["user_sessions"][-100:]:
            pages = session.get("pages_viewed", [])
            for i in range(len(pages) - 1):
                sequence = f"{pages[i]} -> {pages[i+1]}"
                page_sequences[sequence] += 1
        
        return {
            "common_flows": dict(sorted(
                page_sequences.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
        }
    
    def get_growth_metrics(self) -> Dict[str, Any]:
        """Calculate growth metrics"""
        # User growth
        daily_users = self.usage_data["daily_active_users"]
        sorted_days = sorted(daily_users.keys())
        
        if len(sorted_days) >= 2:
            first_week = sorted_days[:7]
            last_week = sorted_days[-7:]
            
            first_week_avg = sum(daily_users[d] for d in first_week) / len(first_week)
            last_week_avg = sum(daily_users[d] for d in last_week) / len(last_week)
            
            growth_rate = (
                (last_week_avg - first_week_avg) / first_week_avg * 100
                if first_week_avg > 0 else 0
            )
        else:
            growth_rate = 0
        
        # Feature growth
        feature_growth = {}
        for feature, adoption in self.usage_data["feature_adoption"].items():
            # Mock growth calculation (in real app would track over time)
            feature_growth[feature] = {
                "current_adoption": round(adoption * 100, 1),
                "growth_trend": "increasing" if adoption > 0.3 else "stable"
            }
        
        return {
            "user_growth": {
                "weekly_growth_rate": round(growth_rate, 1),
                "trend": "positive" if growth_rate > 0 else "negative"
            },
            "feature_growth": feature_growth,
            "projections": {
                "30_day_users": int(last_week_avg * 30 / 7) if 'last_week_avg' in locals() else 0,
                "90_day_users": int(last_week_avg * 90 / 7 * (1 + growth_rate/100)) if 'last_week_avg' in locals() else 0
            }
        }
    
    def generate_performance_report(self) -> str:
        """Generate comprehensive performance report"""
        report = []
        report.append("# Performance & Analytics Report")
        report.append(f"\nGenerated: {datetime.now().isoformat()}\n")
        
        # Performance Summary
        perf_summary = self.get_performance_summary()
        report.append("## API Performance")
        report.append(f"- Average Response Time: {perf_summary['api_performance']['average_response_time']}ms")
        report.append(f"- 95th Percentile: {perf_summary['api_performance']['95th_percentile']}ms")
        report.append(f"- Error Rate: {perf_summary['api_performance']['error_rate']}%")
        report.append(f"- Total API Calls: {perf_summary['api_performance']['total_calls']}")
        
        # Usage Analytics
        usage = self.get_usage_analytics()
        report.append("\n## Usage Analytics")
        report.append(f"- Daily Active Users: {usage['user_metrics']['daily_active_users']:.0f}")
        report.append(f"- Average Session Duration: {usage['session_metrics']['average_duration']}s")
        report.append(f"- Pages per Session: {usage['session_metrics']['average_pages_per_session']}")
        
        # Top Features
        report.append("\n## Top Features")
        for feature, count in list(perf_summary['top_features'].items())[:5]:
            report.append(f"- {feature}: {count} uses")
        
        # Growth Metrics
        growth = self.get_growth_metrics()
        report.append("\n## Growth Metrics")
        report.append(f"- Weekly Growth Rate: {growth['user_growth']['weekly_growth_rate']}%")
        report.append(f"- 30-Day Projection: {growth['projections']['30_day_users']} users")
        
        return "\n".join(report)


def main():
    """Test performance tracker"""
    tracker = PerformanceTracker()
    
    print("=== Performance Tracker Test ===\n")
    
    # Simulate some API calls
    print("1. Simulating API calls...")
    for i in range(10):
        tracker.track_api_call(
            "/api/projects",
            "GET",
            response_time=50 + i * 10,
            status_code=200,
            user_id=f"user_{i % 3}"
        )
    
    # Simulate search queries
    print("2. Simulating search queries...")
    tracker.track_search_query(
        "ai-powered",
        {"min_quality": 7},
        result_count=25,
        execution_time=0.123
    )
    
    # Simulate page views
    print("3. Simulating page views...")
    pages = ["/", "/projects", "/search", "/analytics"]
    for page in pages:
        tracker.track_page_view(page, "user_1")
    
    # Get summaries
    print("\n4. Performance Summary:")
    summary = tracker.get_performance_summary()
    print(f"   - Avg Response Time: {summary['api_performance']['average_response_time']}ms")
    print(f"   - Error Rate: {summary['api_performance']['error_rate']}%")
    
    print("\n5. Generating Report...")
    report = tracker.generate_performance_report()
    print(report[:500] + "...")


if __name__ == "__main__":
    main()