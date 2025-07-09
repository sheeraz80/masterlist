# Frequently Asked Questions (FAQ)

## General Questions

### What is Masterlist?
Masterlist is a comprehensive project management and analytics platform designed to track, analyze, and optimize software project ideas. It provides intelligent categorization, quality scoring, collaboration features, and AI-powered insights.

### Who is Masterlist for?
- **Developers** looking for project ideas
- **Entrepreneurs** researching market opportunities
- **Teams** managing project portfolios
- **Researchers** analyzing software trends

### Is Masterlist free to use?
Yes, the core functionality is open source and free to use. Future premium features may be offered for enterprise users.

## Installation

### What are the system requirements?
- Python 3.8 or higher
- 2GB RAM minimum
- 1GB disk space
- Optional: Docker, Redis

### Can I run Masterlist on Windows?
Yes! Masterlist works on Windows, macOS, and Linux. Use the appropriate command for activating virtual environments on Windows.

### Do I need Docker?
Docker is optional but recommended for production deployments. You can run Masterlist directly with Python for development.

## Usage

### How do I search for projects?
Use the web interface search page or CLI:
```bash
./masterlist search "keyword" --min-quality 7
```

### What do the quality scores mean?
- **9-10**: Excellent - High potential, well-documented
- **8-8.9**: Very Good - Strong potential
- **7-7.9**: Good - Solid potential
- **6-6.9**: Fair - Moderate potential
- **0-5.9**: Needs Improvement

### How are projects categorized?
Projects are automatically categorized based on:
- Keywords in description
- Technical stack
- Target audience
- Problem domain

### Can I add my own projects?
Yes! You can add projects through:
- Web interface "Add Project" button
- CLI: `./masterlist add --interactive`
- API: POST to `/api/projects`

## Features

### What is AI Insights?
AI Insights analyzes your project database to provide:
- Market opportunities
- Trending technologies
- Development recommendations
- Risk assessments

### How does collaboration work?
- Create teams and workspaces
- Share projects publicly or privately
- Collect feedback and ratings
- Fork and modify projects

### Can I export data?
Yes, multiple formats are supported:
- JSON for programmatic access
- CSV for spreadsheet analysis
- PDF for reports
- Markdown for documentation

## Technical

### Where is data stored?
By default, data is stored in JSON files:
- `projects.json` - Project data
- `project_tags.json` - Tag mappings
- `data/` directory - Analytics and reports

### Can I use a real database?
PostgreSQL support is planned for v1.1. Currently, JSON storage is sufficient for most use cases.

### Is there an API?
Yes! Full RESTful API at `/api/`. See [API Reference](API_REFERENCE.md).

### How do I integrate with my tools?
- Use the REST API
- Export data in various formats
- Webhook support (coming in v1.1)

## Troubleshooting

### The web interface won't start
1. Check Python version: `python --version`
2. Verify dependencies: `pip install -r requirements.txt`
3. Check port 5000 is available
4. Try: `FLASK_ENV=development python web/app.py`

### Search is slow
- Run optimization: `make db-optimize`
- Clear cache: `make clean`
- Check available RAM

### Can't generate reports
1. Verify data files exist
2. Check write permissions in `data/` directory
3. Install matplotlib: `pip install matplotlib`

### Docker won't build
- Ensure Docker daemon is running
- Check available disk space
- Try: `docker system prune`

## Security

### Is my data secure?
- All data is stored locally
- No external API calls for core features
- Follow security best practices

### Can I self-host?
Yes! Masterlist is designed for self-hosting. Use Docker for easy deployment.

### Are there access controls?
Basic access control is implemented. Enterprise features with advanced permissions are planned.

## Contributing

### How can I contribute?
See [Contributing Guide](../CONTRIBUTING.md) for:
- Code contributions
- Bug reports
- Feature requests
- Documentation improvements

### Do you accept feature requests?
Yes! Create an issue on GitHub with:
- Clear description
- Use cases
- Expected behavior

### How do I report bugs?
1. Check existing issues
2. Create detailed bug report
3. Include steps to reproduce

## Future Plans

### What's in the roadmap?
**v1.1 (Q2 2024)**
- PostgreSQL support
- Advanced AI insights
- Mobile app
- Webhooks

**v2.0 (Q4 2024)**
- Microservices architecture
- Kubernetes deployment
- GraphQL API
- Real-time collaboration

### Will there be a cloud version?
A hosted SaaS version is under consideration based on community interest.

### Can I sponsor development?
Sponsorship options will be available soon. Contact support@masterlist.app.

## Contact

### How do I get help?
- Documentation: [docs/](.)
- GitHub Issues: [Report issues](https://github.com/yourusername/masterlist/issues)
- Email: support@masterlist.app

### Is there a community?
Join our GitHub Discussions for:
- Questions
- Feature discussions
- Showcase projects
- Best practices

### Where can I see examples?
- [User Guide](USER_GUIDE.md) has usage examples
- [API Reference](API_REFERENCE.md) includes code samples
- Example projects in `docs/examples/`