# Analytics and Reporting System

Comprehensive analytics framework for the Masterlist project, providing detailed insights, performance tracking, and custom reporting capabilities.

## Components

### 1. Report Generator (`report_generator.py`)
Generates various types of analytical reports with multiple export formats.

#### Features
- **Executive Summary**: High-level overview of all metrics
- **Quality Analysis**: Detailed quality score analysis by category/platform
- **Trend Analysis**: Identify trends in categories, technologies, and platforms
- **Custom Reports**: Filter-based custom report generation
- **Multiple Formats**: Export to JSON, Markdown, or HTML
- **Visualizations**: Generate charts as base64 images

#### Usage
```bash
# Generate executive summary
python analytics/report_generator.py executive --format markdown

# Generate quality report
python analytics/report_generator.py quality --format html

# Generate trend analysis (30-day period)
python analytics/report_generator.py trends --period 30

# Generate custom filtered report
python analytics/report_generator.py custom \
  --category "ai-ml" \
  --platform "figma-plugin" \
  --min-quality 7 \
  --tags "high-revenue" "quick-win"

# Generate all reports
python analytics/report_generator.py all --format json
```

### 2. Dashboard Analytics (`dashboard_analytics.py`)
Real-time analytics engine for web dashboard integration.

#### Features
- **Caching System**: 5-minute cache for performance
- **Overview Metrics**: Total projects, quality scores, tag statistics
- **Category Analytics**: Detailed breakdown by category
- **Platform Analytics**: Platform performance and diversity metrics
- **Quality Analytics**: Distribution, percentiles, and quality levels
- **Tag Analytics**: Usage patterns and co-occurrence analysis
- **Revenue Analytics**: Revenue potential analysis by tier
- **Timeline Analytics**: Development timeline insights

#### API Methods
```python
from analytics.dashboard_analytics import DashboardAnalytics

analytics = DashboardAnalytics()

# Get overview metrics
overview = analytics.get_overview_metrics()

# Get category breakdown
categories = analytics.get_category_analytics()

# Get platform statistics
platforms = analytics.get_platform_analytics()

# Get quality distribution
quality = analytics.get_quality_analytics()

# Get tag usage patterns
tags = analytics.get_tag_analytics()

# Get revenue analysis
revenue = analytics.get_revenue_analytics()

# Get timeline analysis
timeline = analytics.get_development_timeline_analytics()

# Get live metrics for dashboard
live = analytics.get_live_metrics()
```

### 3. Performance Tracker (`performance_tracker.py`)
Tracks system performance, usage patterns, and growth metrics.

#### Features
- **API Performance**: Response times, error rates, endpoint usage
- **Search Analytics**: Query performance and result metrics
- **Page View Tracking**: Most visited pages and user flow
- **Feature Usage**: Track feature adoption and usage patterns
- **Session Management**: User session tracking and analysis
- **Growth Metrics**: User growth, feature adoption trends
- **Performance Reports**: Comprehensive performance summaries

#### Usage
```python
from analytics.performance_tracker import PerformanceTracker

tracker = PerformanceTracker()

# Track API call
tracker.track_api_call(
    endpoint="/api/projects",
    method="GET",
    response_time=45.2,  # milliseconds
    status_code=200,
    user_id="user_123"
)

# Track search query
tracker.track_search_query(
    query="ai-powered",
    filters={"min_quality": 7},
    result_count=25,
    execution_time=0.123  # seconds
)

# Track page view
tracker.track_page_view("/projects", "user_123")

# Track feature usage
tracker.track_feature_usage("advanced_search", "user_123")

# Session management
session_id = tracker.start_session("user_123", "web")
tracker.update_session(session_id, "feature_use", {"feature": "search"})
tracker.end_session(session_id)

# Get analytics
performance = tracker.get_performance_summary()
usage = tracker.get_usage_analytics()
growth = tracker.get_growth_metrics()
```

## Report Types

### Executive Summary
- Total projects and average quality
- Category and platform distribution
- Revenue potential breakdown
- Development timeline analysis
- Collaboration metrics
- Top AI-powered insights

### Quality Report
- Overall quality metrics (mean, median, std dev)
- Quality distribution by score ranges
- Quality by category and platform
- Improvement opportunities
- Low-quality project identification

### Trend Report
- Category trends and emerging areas
- Technology adoption patterns
- Platform growth analysis
- Quality improvement trends
- User engagement trends

### Custom Reports
- Filtered project lists
- Custom statistics calculation
- Tag-based analysis
- Multi-criteria filtering

## Data Storage

Analytics data is stored in the `data/` directory:
- `reports/` - Generated report files
- `performance_metrics.json` - API and system performance data
- `usage_tracking.json` - User behavior and session data
- `ai_insights.json` - AI-generated insights (used by reports)

## Integration

### Web Interface
The analytics system integrates with the Flask web app:
- Dashboard widgets use `DashboardAnalytics`
- Performance monitoring uses `PerformanceTracker`
- Report downloads use `ReportGenerator`

### CLI Tools
Analytics commands in the main CLI:
```bash
./masterlist analytics executive
./masterlist analytics quality --format html
./masterlist analytics trends --period 7
./masterlist analytics custom --tags "ai-powered"
```

### API Endpoints
- `GET /api/analytics/overview` - Overview metrics
- `GET /api/analytics/categories` - Category analytics
- `GET /api/analytics/quality` - Quality analytics
- `GET /api/analytics/performance` - Performance metrics
- `POST /api/analytics/report` - Generate custom report

## Visualization

The system supports data visualization through:
- Chart.js integration in web interface
- Matplotlib for report generation
- Base64 encoded images for HTML reports
- JSON data for custom visualization

## Performance Considerations

1. **Caching**: 5-minute cache for expensive computations
2. **Buffering**: In-memory buffers for real-time metrics
3. **Pagination**: Large datasets are paginated
4. **Async Processing**: Long reports can be generated asynchronously
5. **Data Sampling**: Performance metrics use rolling windows

## Best Practices

1. **Regular Monitoring**
   - Check performance metrics daily
   - Review error rates and response times
   - Monitor user growth trends

2. **Report Generation**
   - Schedule regular executive summaries
   - Generate quality reports after major updates
   - Use custom reports for specific investigations

3. **Data Management**
   - Archive old performance data monthly
   - Aggregate historical data for long-term trends
   - Clean up session data periodically

4. **Alert Thresholds**
   - Error rate > 5%
   - Response time > 500ms (95th percentile)
   - Quality score drop > 0.5 points
   - User growth < 0% for 7 days

## Future Enhancements

- Real-time WebSocket dashboard
- Predictive analytics using ML
- A/B testing framework
- Custom alert configuration
- Data export to external analytics platforms
- Automated report scheduling
- Comparative analysis tools
- ROI calculations for projects