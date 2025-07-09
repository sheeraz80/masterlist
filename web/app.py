#!/usr/bin/env python3
"""
Masterlist Web Interface - Interactive dashboard for project management
"""

from flask import Flask, render_template, jsonify, request, send_file
import json
from pathlib import Path
import sys
import os
from datetime import datetime
import markdown
import time

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from simple_tagger import SimpleTagger
from tag_search import TagSearch
from qa.validation_system import ValidationSystem
from qa.quality_scorer import QualityScorer
from insights.ai_insights import AIInsightsEngine
from collaboration.feedback_system import FeedbackSystem
from collaboration.team_workspace import TeamWorkspace
from collaboration.project_sharing import ProjectSharingHub
from analytics.report_generator import ReportGenerator
from analytics.dashboard_analytics import DashboardAnalytics
from analytics.performance_tracker import PerformanceTracker

app = Flask(__name__)
app.config['SECRET_KEY'] = 'masterlist-web-interface-2024'

# Initialize systems
tagger = SimpleTagger()
searcher = TagSearch()
validator = ValidationSystem()
scorer = QualityScorer()
insights_engine = AIInsightsEngine()
feedback_system = FeedbackSystem()
team_workspace = TeamWorkspace()
sharing_hub = ProjectSharingHub()
report_generator = ReportGenerator()
dashboard_analytics = DashboardAnalytics()
performance_tracker = PerformanceTracker()

# Cache for performance
CACHE = {
    'projects': None,
    'tags': None,
    'stats': None,
    'last_update': None
}

def load_data():
    """Load or refresh data cache."""
    if CACHE['last_update'] and (datetime.now() - CACHE['last_update']).seconds < 300:
        return  # Use cache if less than 5 minutes old
        
    # Load projects
    with open('projects.json', 'r') as f:
        data = json.load(f)
        CACHE['projects'] = data.get('projects', {})
        
    # Load tags
    with open('project_tags.json', 'r') as f:
        data = json.load(f)
        CACHE['tags'] = data.get('project_tags', {})
        
    # Calculate statistics
    CACHE['stats'] = calculate_statistics()
    CACHE['last_update'] = datetime.now()

def calculate_statistics():
    """Calculate project statistics."""
    projects = CACHE['projects']
    tags = CACHE['tags']
    
    # Basic stats
    total_projects = len(projects)
    
    # Category distribution
    categories = {}
    for project in projects.values():
        category = project.get('category', 'other')
        categories[category] = categories.get(category, 0) + 1
        
    # Platform distribution
    platforms = {}
    for project in projects.values():
        for platform in project.get('platforms', []):
            platforms[platform] = platforms.get(platform, 0) + 1
            
    # Quality score distribution
    quality_ranges = {'0-5': 0, '5-6': 0, '6-7': 0, '7-8': 0, '8-9': 0, '9-10': 0}
    total_quality = 0
    
    for project in projects.values():
        score = project.get('quality_score', 0)
        total_quality += score
        
        if score < 5:
            quality_ranges['0-5'] += 1
        elif score < 6:
            quality_ranges['5-6'] += 1
        elif score < 7:
            quality_ranges['6-7'] += 1
        elif score < 8:
            quality_ranges['7-8'] += 1
        elif score < 9:
            quality_ranges['8-9'] += 1
        else:
            quality_ranges['9-10'] += 1
            
    # Tag statistics
    all_tags = []
    for project_tags in tags.values():
        all_tags.extend(project_tags)
        
    tag_counts = {}
    for tag in all_tags:
        tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
    return {
        'total_projects': total_projects,
        'categories': categories,
        'platforms': platforms,
        'quality_ranges': quality_ranges,
        'average_quality': round(total_quality / total_projects, 2) if total_projects > 0 else 0,
        'total_tags': len(all_tags),
        'unique_tags': len(set(all_tags)),
        'top_tags': sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:20]
    }

@app.route('/')
def index():
    """Main dashboard page."""
    load_data()
    return render_template('index.html', stats=CACHE['stats'])

@app.route('/projects')
def projects():
    """Projects listing page."""
    load_data()
    return render_template('projects.html')

@app.route('/search')
def search():
    """Search page."""
    load_data()
    return render_template('search.html')

@app.route('/analytics')
def analytics():
    """Analytics page."""
    load_data()
    return render_template('analytics.html', stats=CACHE['stats'])

@app.route('/qa')
def qa():
    """Quality assurance page."""
    # Check if QA reports exist
    qa_report_path = Path('qa_reports/comprehensive_qa_report.md')
    qa_report = None
    
    if qa_report_path.exists():
        with open(qa_report_path, 'r') as f:
            qa_report = markdown.markdown(f.read())
            
    return render_template('qa.html', qa_report=qa_report)

@app.route('/api/projects')
def api_projects():
    """API endpoint for projects data."""
    load_data()
    
    # Get query parameters
    category = request.args.get('category')
    platform = request.args.get('platform')
    min_quality = float(request.args.get('min_quality', 0))
    max_complexity = int(request.args.get('max_complexity', 10))
    search_query = request.args.get('q', '').lower()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Filter projects
    filtered_projects = []
    
    for key, project in CACHE['projects'].items():
        # Category filter
        if category and project.get('category') != category:
            continue
            
        # Platform filter
        if platform and platform not in project.get('platforms', []):
            continue
            
        # Quality filter
        if project.get('quality_score', 0) < min_quality:
            continue
            
        # Search filter
        if search_query:
            searchable_text = ' '.join([
                project.get('name', ''),
                project.get('problem_statement', ''),
                project.get('solution_description', ''),
                ' '.join(project.get('key_features', []))
            ]).lower()
            
            if search_query not in searchable_text:
                continue
                
        # Add project with key
        project_data = project.copy()
        project_data['key'] = key
        project_data['tags'] = CACHE['tags'].get(key, [])
        filtered_projects.append(project_data)
        
    # Sort by quality score
    filtered_projects.sort(key=lambda x: x.get('quality_score', 0), reverse=True)
    
    # Pagination
    total = len(filtered_projects)
    start = (page - 1) * per_page
    end = start + per_page
    
    return jsonify({
        'projects': filtered_projects[start:end],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@app.route('/api/project/<project_key>')
def api_project_detail(project_key):
    """API endpoint for project details."""
    load_data()
    
    project = CACHE['projects'].get(project_key)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
        
    project_data = project.copy()
    project_data['key'] = project_key
    project_data['tags'] = CACHE['tags'].get(project_key, [])
    
    # Find similar projects
    project_tags = CACHE['tags'].get(project_key, [])
    if project_tags:
        similar_results = searcher.search_by_tags(
            include_tags=project_tags[:3],  # Use first 3 tags
            limit=6
        )
        # Filter out the current project and format
        similar_projects = []
        for p in similar_results:
            if p['key'] != project_key:
                similar_projects.append({
                    'key': p['key'],
                    'name': p['name'],
                    'similarity': 0.8,  # Placeholder similarity score
                    'quality_score': p['quality_score']
                })
            if len(similar_projects) >= 5:
                break
    else:
        similar_projects = []
    project_data['similar'] = similar_projects
    
    return jsonify(project_data)

@app.route('/api/search')
def api_search():
    """API endpoint for advanced search."""
    load_data()
    
    # Get search parameters
    include_tags = request.args.getlist('include[]')
    exclude_tags = request.args.getlist('exclude[]')
    min_quality = float(request.args.get('min_quality', 0))
    max_complexity = int(request.args.get('max_complexity', 10))
    
    # Perform search
    results = searcher.search_by_tags(
        include_tags=include_tags,
        exclude_tags=exclude_tags,
        min_quality=min_quality,
        max_complexity=max_complexity
    )
    
    return jsonify({
        'results': results[:50],  # Limit to 50 results
        'total': len(results)
    })

@app.route('/api/stats')
def api_stats():
    """API endpoint for statistics."""
    load_data()
    return jsonify(CACHE['stats'])

@app.route('/api/tags')
def api_tags():
    """API endpoint for all tags."""
    load_data()
    
    # Get all unique tags
    all_tags = set()
    for tags in CACHE['tags'].values():
        all_tags.update(tags)
        
    # Categorize tags
    categorized = {
        'category': [],
        'platform': [],
        'difficulty': [],
        'revenue': [],
        'timeline': [],
        'quality': [],
        'technology': [],
        'business': [],
        'other': []
    }
    
    for tag in sorted(all_tags):
        if tag.startswith('category-'):
            categorized['category'].append(tag)
        elif tag.startswith('platform-'):
            categorized['platform'].append(tag)
        elif tag in ['beginner-friendly', 'intermediate', 'advanced']:
            categorized['difficulty'].append(tag)
        elif tag in ['high-revenue', 'medium-revenue', 'low-revenue']:
            categorized['revenue'].append(tag)
        elif tag in ['quick-win', 'short-term', 'long-term']:
            categorized['timeline'].append(tag)
        elif tag in ['top-rated', 'very-good', 'good', 'fair', 'needs-improvement']:
            categorized['quality'].append(tag)
        elif tag in ['ai-powered', 'blockchain', 'automation', 'analytics', 'web-based', 'mobile']:
            categorized['technology'].append(tag)
        elif tag in ['b2b', 'b2c', 'subscription-model', 'freemium', 'one-time-purchase']:
            categorized['business'].append(tag)
        else:
            categorized['other'].append(tag)
            
    return jsonify(categorized)

@app.route('/api/export/<format>')
def api_export(format):
    """API endpoint for data export."""
    load_data()
    
    if format == 'json':
        return jsonify({
            'projects': CACHE['projects'],
            'tags': CACHE['tags'],
            'stats': CACHE['stats']
        })
    elif format == 'csv':
        # Create CSV data
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            'Key', 'Name', 'Category', 'Quality Score', 'Platforms',
            'Technical Complexity', 'Development Time', 'Revenue Potential',
            'Target Users', 'Tags'
        ])
        
        # Data rows
        for key, project in CACHE['projects'].items():
            writer.writerow([
                key,
                project.get('name', ''),
                project.get('category', ''),
                project.get('quality_score', 0),
                ';'.join(project.get('platforms', [])),
                project.get('technical_complexity', ''),
                project.get('development_time', ''),
                project.get('revenue_potential', ''),
                project.get('target_users', ''),
                ';'.join(CACHE['tags'].get(key, []))
            ])
            
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name='masterlist_projects.csv'
        )
    else:
        return jsonify({'error': 'Unsupported format'}), 400

# ===== INSIGHTS ROUTES =====

@app.route('/insights')
def insights():
    """Insights page."""
    load_data()
    
    # Load or generate insights
    insights_file = 'data/ai_insights.json'
    if os.path.exists(insights_file):
        # Check if insights are recent
        file_age = (datetime.now() - datetime.fromtimestamp(os.path.getmtime(insights_file))).total_seconds() / 3600
        if file_age > 24:  # Older than 24 hours
            # Generate new insights
            insights_data = insights_engine.generate_all_insights()
            insights_engine.save_insights(insights_data)
        else:
            with open(insights_file, 'r') as f:
                insights_data = json.load(f)
    else:
        # Generate new insights
        insights_data = insights_engine.generate_all_insights()
        insights_engine.save_insights(insights_data)
    
    return render_template('insights.html', insights=insights_data)

@app.route('/api/insights')
def api_insights():
    """API endpoint for insights data."""
    load_data()
    
    insights_file = 'data/ai_insights.json'
    if os.path.exists(insights_file):
        with open(insights_file, 'r') as f:
            return jsonify(json.load(f))
    else:
        # Generate quick insights
        insights_data = {
            "market_opportunities": insights_engine.analyze_market_opportunities()[:5],
            "trending_technologies": insights_engine.identify_trending_technologies()[:5],
            "development_recommendations": insights_engine.generate_development_recommendations()[:3],
            "risk_assessment": insights_engine.assess_portfolio_risks(),
            "generated_at": datetime.now().isoformat()
        }
        return jsonify(insights_data)

@app.route('/api/insights/refresh', methods=['POST'])
def api_insights_refresh():
    """Refresh AI insights."""
    load_data()
    
    # Generate new insights
    insights_data = insights_engine.generate_all_insights()
    insights_engine.save_insights(insights_data)
    
    return jsonify({'status': 'success', 'generated_at': insights_data['generated_at']})

@app.route('/api/insights/export')
def api_insights_export():
    """Export insights report."""
    insights_file = 'data/ai_insights_report.md'
    if os.path.exists(insights_file):
        return send_file(
            insights_file,
            mimetype='text/markdown',
            as_attachment=True,
            download_name='masterlist_insights_report.md'
        )
    else:
        return jsonify({'error': 'Report not found'}), 404

@app.route('/api/insights/detailed')
def api_insights_detailed():
    """Detailed insights view."""
    insights_file = 'data/ai_insights.json'
    if os.path.exists(insights_file):
        with open(insights_file, 'r') as f:
            insights_data = json.load(f)
        
        # Convert to HTML
        report = []
        report.append("<h1>Detailed AI Insights Report</h1>")
        report.append(f"<p>Generated: {insights_data.get('generated_at', 'Unknown')}</p>")
        report.append("<hr>")
        
        # Format each section
        for key, value in insights_data.items():
            if key != 'generated_at':
                report.append(f"<h2>{key.replace('_', ' ').title()}</h2>")
                report.append(f"<pre>{json.dumps(value, indent=2)}</pre>")
                report.append("<hr>")
        
        return "<br>".join(report)
    else:
        return "No insights data found", 404

# ===== COLLABORATION ROUTES =====

@app.route('/collaborate')
def collaborate():
    """Collaboration hub page."""
    load_data()
    
    # Get collaboration statistics
    collab_stats = feedback_system.get_collaboration_stats()
    sharing_stats = sharing_hub.get_sharing_stats()
    
    stats = {
        "total_shared": sharing_stats["total_shared_projects"],
        "active_teams": len(team_workspace.teams),
        "total_feedback": collab_stats["total_feedback"],
        "total_stars": sharing_stats["total_stars"]
    }
    
    # Get shared projects
    shared_projects = sharing_hub.get_shared_projects(visibility="public")[:12]
    
    # Get teams (simplified - in real app would filter by user)
    teams = list(team_workspace.teams.values())[:6]
    
    # Get recent feedback
    recent_feedback = feedback_system.get_trending_feedback(10)
    
    # Feedback stats
    feedback_stats = {
        "bugs": collab_stats["feedback_by_type"].get("bug", 0),
        "features": collab_stats["feedback_by_type"].get("feature", 0),
        "improvements": collab_stats["feedback_by_type"].get("improvement", 0),
        "praise": collab_stats["feedback_by_type"].get("praise", 0)
    }
    
    # Mock user stats (in real app would use session)
    user_stats = {
        "owned_projects": 5,
        "collaborating": 3,
        "forked": 2,
        "starred": 8
    }
    
    # Mock user teams
    user_teams = teams[:2]
    
    # Mock user activities
    user_activities = [
        {"description": "Submitted feedback on AI Code Reviewer", "timestamp": "2 hours ago"},
        {"description": "Joined team 'AI Innovators'", "timestamp": "1 day ago"},
        {"description": "Starred project 'Smart Contract Auditor'", "timestamp": "3 days ago"}
    ]
    
    return render_template('collaborate.html',
                         stats=stats,
                         shared_projects=shared_projects,
                         teams=teams,
                         recent_feedback=[f["feedback"] for f in recent_feedback],
                         feedback_stats=feedback_stats,
                         user_stats=user_stats,
                         user_teams=user_teams,
                         user_activities=user_activities)

@app.route('/api/collaborate/feedback/<project_key>', methods=['POST'])
def api_add_feedback(project_key):
    """Add feedback to a project."""
    data = request.get_json()
    
    feedback_id = feedback_system.add_feedback(
        project_key,
        data.get('user_id', 'anonymous'),
        data.get('type', 'improvement'),
        data.get('content', ''),
        data.get('metadata', {})
    )
    
    return jsonify({'feedback_id': feedback_id, 'status': 'success'})

@app.route('/api/collaborate/rating/<project_key>', methods=['POST'])
def api_add_rating(project_key):
    """Add rating to a project."""
    data = request.get_json()
    
    feedback_system.add_rating(
        project_key,
        data.get('user_id', 'anonymous'),
        data.get('rating', 5),
        data.get('criteria', {})
    )
    
    return jsonify({'status': 'success'})

@app.route('/api/collaborate/share', methods=['POST'])
def api_share_project():
    """Share a project."""
    data = request.get_json()
    
    share_id = sharing_hub.share_project(
        data.get('project_key'),
        data.get('user_id', 'anonymous'),
        data.get('visibility', 'public'),
        data.get('settings', {})
    )
    
    return jsonify({'share_id': share_id, 'status': 'success'})

@app.route('/api/collaborate/team', methods=['POST'])
def api_create_team():
    """Create a new team."""
    data = request.get_json()
    
    team_id = team_workspace.create_team(
        data.get('name'),
        data.get('owner_id', 'anonymous'),
        data.get('description', '')
    )
    
    return jsonify({'team_id': team_id, 'status': 'success'})

@app.route('/api/collaborate/stats')
def api_collaboration_stats():
    """Get collaboration statistics."""
    collab_stats = feedback_system.get_collaboration_stats()
    sharing_stats = sharing_hub.get_sharing_stats()
    
    return jsonify({
        'feedback': collab_stats,
        'sharing': sharing_stats,
        'teams': len(team_workspace.teams)
    })

# ===== ANALYTICS ROUTES =====

@app.route('/api/analytics/<metric_type>')
def api_analytics(metric_type):
    """Get analytics data by type."""
    # Track API call
    start_time = time.time()
    
    try:
        if metric_type == 'overview':
            data = dashboard_analytics.get_overview_metrics()
        elif metric_type == 'categories':
            data = dashboard_analytics.get_category_analytics()
        elif metric_type == 'platforms':
            data = dashboard_analytics.get_platform_analytics()
        elif metric_type == 'quality':
            data = dashboard_analytics.get_quality_analytics()
        elif metric_type == 'tags':
            data = dashboard_analytics.get_tag_analytics()
        elif metric_type == 'revenue':
            data = dashboard_analytics.get_revenue_analytics()
        elif metric_type == 'timeline':
            data = dashboard_analytics.get_development_timeline_analytics()
        elif metric_type == 'live':
            data = dashboard_analytics.get_live_metrics()
        elif metric_type == 'performance':
            data = performance_tracker.get_performance_summary()
        elif metric_type == 'usage':
            data = performance_tracker.get_usage_analytics()
        elif metric_type == 'growth':
            data = performance_tracker.get_growth_metrics()
        else:
            return jsonify({'error': 'Invalid metric type'}), 400
        
        # Track performance
        response_time = (time.time() - start_time) * 1000
        performance_tracker.track_api_call(
            f'/api/analytics/{metric_type}',
            'GET',
            response_time,
            200
        )
        
        return jsonify(data)
        
    except Exception as e:
        # Track error
        response_time = (time.time() - start_time) * 1000
        performance_tracker.track_api_call(
            f'/api/analytics/{metric_type}',
            'GET',
            response_time,
            500
        )
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/generate', methods=['POST'])
def api_generate_report():
    """Generate a custom report."""
    data = request.get_json()
    
    report_type = data.get('type', 'executive')
    format_type = data.get('format', 'json')
    filters = data.get('filters', {})
    
    try:
        if report_type == 'executive':
            report_data = report_generator.generate_executive_summary()
        elif report_type == 'quality':
            report_data = report_generator.generate_quality_report()
        elif report_type == 'trends':
            period = filters.get('period', 30)
            report_data = report_generator.generate_trend_report(period)
        elif report_type == 'custom':
            report_data = report_generator.generate_custom_report(filters)
        else:
            return jsonify({'error': 'Invalid report type'}), 400
        
        # Export report
        filepath = report_generator.export_report(report_type, report_data, format_type)
        
        return jsonify({
            'status': 'success',
            'report_type': report_type,
            'format': format_type,
            'download_url': f'/api/reports/download/{os.path.basename(filepath)}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/download/<filename>')
def api_download_report(filename):
    """Download a generated report."""
    import re
    
    # Sanitize filename
    if not re.match(r'^[\w\-_]+\.(json|md|html)$', filename):
        return jsonify({'error': 'Invalid filename'}), 400
    
    filepath = os.path.join(report_generator.reports_dir, filename)
    
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    else:
        return jsonify({'error': 'Report not found'}), 404

@app.route('/api/analytics/chart/<chart_type>')
def api_analytics_chart(chart_type):
    """Generate chart visualization."""
    try:
        if chart_type == 'quality_distribution':
            quality_data = dashboard_analytics.get_quality_analytics()
            image_data = report_generator.create_visualization(
                'quality_distribution',
                quality_data['distribution']
            )
        elif chart_type == 'category_distribution':
            category_data = dashboard_analytics.get_category_analytics()
            categories = {
                cat: data['count'] 
                for cat, data in category_data['categories'].items()
            }
            image_data = report_generator.create_visualization(
                'category_distribution',
                categories
            )
        elif chart_type == 'platform_trends':
            platform_data = dashboard_analytics.get_platform_analytics()
            platforms = {
                plat: data['count'] 
                for plat, data in list(platform_data['platforms'].items())[:10]
            }
            image_data = report_generator.create_visualization(
                'platform_trends',
                platforms
            )
        else:
            return jsonify({'error': 'Invalid chart type'}), 400
        
        return jsonify({'image': image_data})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add before_request hook for tracking
@app.before_request
def track_request():
    """Track page views and start session."""
    if request.endpoint and not request.path.startswith('/api/'):
        # Track page view
        performance_tracker.track_page_view(request.path)
        
        # Start or update session (in production would use real session)
        session_id = request.cookies.get('session_id')
        if not session_id:
            session_id = performance_tracker.start_session('anonymous', 'web')

# Add after_request hook for performance tracking
@app.after_request
def track_response(response):
    """Track response metrics."""
    # This is simplified - in production you'd track actual processing time
    if request.endpoint and request.path.startswith('/api/'):
        # Already tracked in individual routes
        pass
    return response

@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'masterlist',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.errorhandler(404)
def not_found(error):
    """404 error handler."""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """500 error handler."""
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    Path('web/templates').mkdir(parents=True, exist_ok=True)
    Path('web/static').mkdir(parents=True, exist_ok=True)
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)