# Git Time-Lapse

## Overview
**Problem Statement:** When reviewing a pull request or trying to understand the history of a file, it's hard to visualize how the code evolved. A standard git diff shows the final changes but not the journey.

**Solution:** A simple extension that generates a "time-lapse" video or GIF of a selected file's Git history, showing the changes from each commit being applied sequentially.

**Target Users:** Software developers, team leads, and technical educators.

## Quality Score
**Overall Score:** 6.5/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Vscode Extension](./platforms/vscode-extension/)

## Revenue Model
One-Time Purchase.

## Revenue Potential
Conservative: $300/mo; Realistic: $1,500/mo; Optimistic: $4,000/mo.

## Development Time
5-6 days.

## Technical Complexity
5/10. The core logic involves using Git commands (git log, git show) to get the content of the file at each historical commit. The extension would then need to use a client-side library to stitch these snapshots together into a GIF or video format.

## Competition Level
Low. This is a niche visualization tool. While some external websites offer this, an integrated VSCode extension provides a much smoother workflow.

## Key Features
- Generate Time-Lapse: Right-click a file and select "Generate Git Time-Lapse."
- Speed Control: Control the playback speed of the generated animation.
- Commit Message Overlay: Option to overlay the commit message for each change in the video.
- Export to GIF/MP4: Save the generated time-lapse to share with others.
- Date Range Selection: A premium feature to generate a time-lapse for a specific date range or number of commits.

## Success Indicators
Total sales volume and social media shares of content created with the tool.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
