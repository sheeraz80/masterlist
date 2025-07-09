# Masterlist Web Interface

A modern web interface for browsing, searching, and analyzing the Masterlist project database.

## Features

- **Dashboard**: Overview of all projects with key statistics and charts
- **Project Browser**: Browse all projects with filtering and pagination
- **Advanced Search**: Smart tag-based search with quality filters
- **Analytics**: Comprehensive insights and trend analysis
- **Quality Assurance**: Validation reports and health checks
- **Export**: Download data in JSON or CSV format

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
python run.py
```

3. Open your browser to: http://localhost:5000

## Running Options

### Development Mode
```bash
# Basic development server
python run.py

# With debug mode
python run.py --debug

# Custom host/port
python run.py --host 0.0.0.0 --port 8080
```

### Production Mode
```bash
# Run with Waitress WSGI server
python run.py --production

# Custom host/port in production
python run.py --production --host 0.0.0.0 --port 80
```

## API Endpoints

### Projects
- `GET /api/projects` - List projects with pagination
- `GET /api/project/<key>` - Get project details
- `GET /api/stats` - Get statistics

### Search
- `GET /api/search` - Search with smart tags
- `GET /api/tags` - Get available tags

### Export
- `GET /api/export/json` - Export as JSON
- `GET /api/export/csv` - Export as CSV

### QA
- `GET /api/qa` - Get QA results
- `POST /api/qa/run` - Run QA check
- `POST /api/qa/autofix` - Auto-fix issues
- `GET /api/qa/export` - Export QA report

## Architecture

- **Backend**: Flask with RESTful API
- **Frontend**: Bootstrap 5 with jQuery
- **Charts**: Chart.js for visualizations
- **Data**: Integration with CLI tools

## Development

The web interface integrates with the existing CLI tools:
- Uses the same data files in `data/`
- Leverages smart tagging system
- Integrates validation and QA tools
- Maintains compatibility with CLI workflows

## Security Notes

- Default binding is localhost only
- Use reverse proxy (nginx) for production
- No authentication built-in (add if needed)
- Read-only interface (no data modification)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile responsive design