# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a single text file `masterlist.txt` that serves as a comprehensive list of business ideas and project concepts. The file contains structured entries for various software projects, primarily focused on Figma plugins and other development tools.

## Repository Structure

The repository is minimal with only one main file:
- `masterlist.txt` - A large text file (>1MB) containing detailed project ideas with structured information including:
  - Problem descriptions
  - Solution approaches
  - Target users
  - Revenue models and potential
  - Development time estimates
  - Competition analysis
  - Technical complexity ratings
  - Key features
  - Monetization details
  - Risk assessments
  - Success indicators

## Working with the Content

### Reading the File
Due to the large size of `masterlist.txt`, use the Read tool with offset and limit parameters to read specific sections:
```
Read with offset=1 and limit=100 to read the first 100 lines
Use Grep to search for specific content within the file
```

### Content Structure
Each project entry follows a consistent format:
- PROJECT [NUMBER]: [Project Name]
- Problem: Description of the issue being solved
- Solution: Proposed approach
- Target Users: Intended audience
- Revenue Model: Monetization strategy
- Revenue Potential: Conservative/Realistic/Optimistic estimates
- Development Time: Time estimates with AI assistance
- Competition Level: Assessment of existing solutions
- Technical Complexity: Rated on a scale (e.g., 4/10)
- Key Features: Bulleted list of main functionality
- Monetization Details: Detailed business strategy
- Risk Assessment: Potential challenges and mitigation
- Success Indicators: Metrics for measuring success

## Common Tasks

Since this is a text-based repository with no build tools or package management:

- **Search for specific projects**: Use Grep to find projects by keyword
- **Read project details**: Use Read with appropriate offset/limit for large sections
- **Analyze content**: The file contains business intelligence for software development projects
- **Extract information**: Projects cover various platforms (Figma, web tools, etc.)

## Notes

- No package.json, build tools, or test frameworks are present
- The repository is not a git repository
- Content is purely informational/reference material
- All entries appear to focus on legitimate business software solutions