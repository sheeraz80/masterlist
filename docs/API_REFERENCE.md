# Masterlist API Reference

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Endpoints](#endpoints)
   - [Projects](#projects)
   - [Search](#search)
   - [Analytics](#analytics)
   - [Quality Assurance](#quality-assurance)
   - [AI Insights](#ai-insights)
   - [Collaboration](#collaboration)
   - [Reports](#reports)
8. [Webhooks](#webhooks)
9. [Examples](#examples)

## Overview

The Masterlist API provides programmatic access to project data, analytics, and insights. The API follows RESTful principles and returns JSON responses.

### API Version
Current version: `v1`

### Content Types
- Request: `application/json`
- Response: `application/json`

## Authentication

Currently, the API does not require authentication for read operations. Write operations may require authentication in future versions.

### Future Authentication (Planned)
```http
Authorization: Bearer <token>
```

## Base URL

```
http://localhost:5000/api
```

For production:
```
https://api.masterlist.app/v1
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project not found",
    "details": {
      "project_key": "invalid-key"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Error Handling

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Error Codes
| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

- **Default limit**: 100 requests per minute
- **Authenticated limit**: 1000 requests per minute (future)

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251360
```

## Endpoints

### Projects

#### List Projects
```http
GET /api/projects
```

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `per_page` | integer | Items per page (max 100) | 20 |
| `category` | string | Filter by category | - |
| `platform` | string | Filter by platform | - |
| `min_quality` | float | Minimum quality score | 0 |
| `max_complexity` | integer | Maximum complexity | 10 |
| `sort` | string | Sort field | quality_score |
| `order` | string | Sort order (asc/desc) | desc |

**Response:**
```json
{
  "projects": [
    {
      "key": "ai-code-reviewer",
      "name": "AI Code Reviewer",
      "category": "ai-ml",
      "platforms": ["vscode-extension"],
      "quality_score": 8.5,
      "tags": ["ai-powered", "developer-tools"],
      // ... other fields
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 20,
  "total_pages": 8
}
```

#### Get Project Details
```http
GET /api/project/:project_key
```

**Parameters:**
- `project_key` (path) - Unique project identifier

**Response:**
```json
{
  "key": "ai-code-reviewer",
  "name": "AI Code Reviewer",
  "description": "Intelligent code review assistant",
  "problem_statement": "Code reviews are time-consuming",
  "solution_description": "AI-powered automated reviews",
  "category": "ai-ml",
  "platforms": ["vscode-extension"],
  "key_features": [
    "Real-time code analysis",
    "Security vulnerability detection",
    "Style guide enforcement"
  ],
  "technical_complexity": 7,
  "development_time": "2-3 months",
  "quality_score": 8.5,
  "tags": ["ai-powered", "developer-tools"],
  "similar": [
    {
      "key": "smart-linter",
      "name": "Smart Linter",
      "similarity": 0.85,
      "quality_score": 7.8
    }
  ]
}
```

#### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Project description",
  "category": "ai-ml",
  "platforms": ["web"],
  "key_features": ["feature1", "feature2"],
  "technical_complexity": 5
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "key": "project-name",
    "quality_score": 7.5,
    "tags": ["auto-generated-tag1", "auto-generated-tag2"]
  }
}
```

### Search

#### Search Projects
```http
GET /api/search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `include[]` | array | Tags to include |
| `exclude[]` | array | Tags to exclude |
| `min_quality` | float | Minimum quality score |
| `max_complexity` | integer | Maximum complexity |
| `category` | string | Filter by category |
| `platform` | string | Filter by platform |

**Example:**
```
GET /api/search?q=blockchain&include[]=high-revenue&exclude[]=complex&min_quality=7
```

**Response:**
```json
{
  "results": [
    {
      "key": "blockchain-wallet",
      "name": "Blockchain Wallet",
      "score": 0.95,
      "quality_score": 8.2,
      "matched_tags": ["blockchain", "high-revenue"]
    }
  ],
  "total": 5,
  "query": {
    "text": "blockchain",
    "filters": {
      "include_tags": ["high-revenue"],
      "exclude_tags": ["complex"],
      "min_quality": 7
    }
  }
}
```

### Analytics

#### Overview Metrics
```http
GET /api/analytics/overview
```

**Response:**
```json
{
  "total_projects": 605,
  "average_quality": 7.2,
  "high_quality_count": 234,
  "total_tags": 3420,
  "unique_tags": 89,
  "category_count": 12,
  "platform_count": 15,
  "quick_wins": 45,
  "last_updated": "2024-01-15T10:30:00Z"
}
```

#### Category Analytics
```http
GET /api/analytics/categories
```

**Response:**
```json
{
  "categories": {
    "ai-ml": {
      "count": 125,
      "average_quality": 7.8,
      "platform_count": 8,
      "high_quality_count": 67,
      "high_quality_percentage": 53.6,
      "top_tags": {
        "ai-powered": 89,
        "machine-learning": 67,
        "automation": 45
      }
    }
  },
  "total_categories": 12,
  "top_categories": ["ai-ml", "productivity", "developer-tools"]
}
```

#### Quality Analytics
```http
GET /api/analytics/quality
```

**Response:**
```json
{
  "distribution": {
    "0-5": 23,
    "5-6": 45,
    "6-7": 89,
    "7-8": 167,
    "8-9": 201,
    "9-10": 80
  },
  "statistics": {
    "mean": 7.2,
    "median": 7.5,
    "std_dev": 1.3,
    "min": 2.1,
    "max": 9.8
  },
  "percentiles": {
    "25th": 6.2,
    "50th": 7.5,
    "75th": 8.3,
    "90th": 9.0,
    "95th": 9.4
  }
}
```

#### Performance Metrics
```http
GET /api/analytics/performance
```

**Response:**
```json
{
  "api_performance": {
    "average_response_time": 45.3,
    "median_response_time": 38.0,
    "95th_percentile": 125.0,
    "error_rate": 0.02,
    "total_calls": 15420
  },
  "search_performance": {
    "average_execution_time": 0.123,
    "total_queries": 3421,
    "average_results": 12.5
  },
  "top_pages": {
    "/projects": 4532,
    "/search": 3421,
    "/analytics": 2156
  }
}
```

### Quality Assurance

#### Validate Projects
```http
POST /api/qa/validate
```

**Request Body:**
```json
{
  "project_keys": ["project1", "project2"],
  "validation_level": "strict"
}
```

**Response:**
```json
{
  "validation_results": {
    "project1": {
      "valid": true,
      "issues": [],
      "score": 8.5
    },
    "project2": {
      "valid": false,
      "issues": [
        {
          "field": "description",
          "issue": "Too short",
          "severity": "warning"
        }
      ],
      "score": 5.2
    }
  },
  "summary": {
    "total": 2,
    "valid": 1,
    "invalid": 1
  }
}
```

### AI Insights

#### Get Insights
```http
GET /api/insights
```

**Response:**
```json
{
  "market_opportunities": [
    {
      "opportunity": "AI-powered productivity tools",
      "score": 0.92,
      "reasoning": "High demand, low competition",
      "recommendation": "Focus on browser extensions"
    }
  ],
  "trending_technologies": [
    {
      "technology": "GPT-4 integration",
      "growth_rate": 0.85,
      "projects_count": 45,
      "potential": "high"
    }
  ],
  "development_recommendations": [
    {
      "category": "Quick wins",
      "projects": ["ai-email-assistant", "smart-bookmarks"],
      "estimated_roi": 3.5
    }
  ],
  "generated_at": "2024-01-15T10:30:00Z"
}
```

#### Refresh Insights
```http
POST /api/insights/refresh
```

**Response:**
```json
{
  "status": "success",
  "generated_at": "2024-01-15T10:35:00Z",
  "next_refresh": "2024-01-15T16:35:00Z"
}
```

### Collaboration

#### Add Feedback
```http
POST /api/collaborate/feedback/:project_key
```

**Request Body:**
```json
{
  "user_id": "user123",
  "type": "feature",
  "content": "Add dark mode support",
  "metadata": {
    "priority": "high",
    "category": "ui"
  }
}
```

**Response:**
```json
{
  "feedback_id": "fb_abc123",
  "status": "success"
}
```

#### Add Rating
```http
POST /api/collaborate/rating/:project_key
```

**Request Body:**
```json
{
  "user_id": "user123",
  "rating": 4.5,
  "criteria": {
    "innovation": 5,
    "feasibility": 4,
    "market_fit": 4.5
  }
}
```

#### Share Project
```http
POST /api/collaborate/share
```

**Request Body:**
```json
{
  "project_key": "ai-assistant",
  "user_id": "user123",
  "visibility": "public",
  "settings": {
    "allow_fork": true,
    "allow_comments": true
  }
}
```

### Reports

#### Generate Report
```http
POST /api/reports/generate
```

**Request Body:**
```json
{
  "type": "executive",
  "format": "pdf",
  "filters": {
    "category": "ai-ml",
    "min_quality": 7,
    "period": 30
  }
}
```

**Response:**
```json
{
  "status": "success",
  "report_type": "executive",
  "format": "pdf",
  "download_url": "/api/reports/download/executive_report_20240115_103000.pdf"
}
```

#### Download Report
```http
GET /api/reports/download/:filename
```

**Parameters:**
- `filename` (path) - Report filename

**Response:**
Binary file download

#### List Available Reports
```http
GET /api/reports
```

**Response:**
```json
{
  "reports": [
    {
      "filename": "executive_report_20240115.pdf",
      "type": "executive",
      "format": "pdf",
      "size": 245678,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15
}
```

## Webhooks

### Webhook Events (Future)

#### Project Updated
```json
{
  "event": "project.updated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "project_key": "ai-assistant",
    "changes": ["quality_score", "tags"],
    "old_values": {
      "quality_score": 7.2,
      "tags": ["ai-powered"]
    },
    "new_values": {
      "quality_score": 8.1,
      "tags": ["ai-powered", "high-quality"]
    }
  }
}
```

## Examples

### cURL Examples

#### Search for AI projects
```bash
curl -X GET "http://localhost:5000/api/search?q=ai&min_quality=7" \
  -H "Accept: application/json"
```

#### Get project details
```bash
curl -X GET "http://localhost:5000/api/project/ai-code-reviewer" \
  -H "Accept: application/json"
```

#### Generate executive report
```bash
curl -X POST "http://localhost:5000/api/reports/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "executive",
    "format": "json"
  }'
```

### Python Examples

```python
import requests

class MasterlistAPI:
    def __init__(self, base_url="http://localhost:5000/api"):
        self.base_url = base_url
    
    def search_projects(self, query, **filters):
        """Search for projects"""
        params = {"q": query, **filters}
        response = requests.get(f"{self.base_url}/search", params=params)
        return response.json()
    
    def get_project(self, project_key):
        """Get project details"""
        response = requests.get(f"{self.base_url}/project/{project_key}")
        return response.json()
    
    def get_analytics(self, metric_type="overview"):
        """Get analytics data"""
        response = requests.get(f"{self.base_url}/analytics/{metric_type}")
        return response.json()

# Usage
api = MasterlistAPI()

# Search for high-quality AI projects
results = api.search_projects(
    "artificial intelligence",
    min_quality=8,
    include=["ai-powered", "high-revenue"]
)

for project in results["results"][:5]:
    print(f"{project['name']} - Score: {project['quality_score']}")
```

### JavaScript Examples

```javascript
class MasterlistAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  async searchProjects(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await fetch(`${this.baseURL}/search?${params}`);
    return response.json();
  }

  async getProject(projectKey) {
    const response = await fetch(`${this.baseURL}/project/${projectKey}`);
    return response.json();
  }

  async generateReport(type, format = 'json') {
    const response = await fetch(`${this.baseURL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, format })
    });
    return response.json();
  }
}

// Usage
const api = new MasterlistAPI();

// Search for blockchain projects
api.searchProjects('blockchain', {
  min_quality: 7,
  'include[]': ['high-revenue']
}).then(results => {
  console.log(`Found ${results.total} projects`);
  results.results.forEach(project => {
    console.log(`- ${project.name} (${project.quality_score}/10)`);
  });
});
```

### Response Pagination

When dealing with large result sets:

```python
def get_all_projects(api, **filters):
    """Get all projects with pagination"""
    page = 1
    all_projects = []
    
    while True:
        response = api.get(f"/projects", params={
            **filters,
            "page": page,
            "per_page": 100
        })
        data = response.json()
        
        all_projects.extend(data["projects"])
        
        if page >= data["total_pages"]:
            break
        
        page += 1
    
    return all_projects
```

### Error Handling

```python
import requests
from requests.exceptions import RequestException

def safe_api_call(url, **kwargs):
    """Make API call with error handling"""
    try:
        response = requests.get(url, **kwargs)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:
            # Rate limited - wait and retry
            retry_after = int(e.response.headers.get('X-RateLimit-Reset', 60))
            print(f"Rate limited. Retry after {retry_after} seconds")
        elif e.response.status_code == 404:
            print("Resource not found")
        else:
            print(f"HTTP error: {e}")
    except RequestException as e:
        print(f"Request failed: {e}")
    return None
```