# GitLens Lite

## Overview
**Problem Statement:** GitLens is an incredibly powerful and popular extension, but it can be overwhelming for some users, with a huge number of features and configuration options. Some developers want just the core "git blame" annotation without all the extra UI.

**Solution:** A "lite" version of GitLens that does one thing and one thing only: it provides the inline "blame" annotation on the current line, showing who last changed it and when. No extra sidebars, no complex views.

**Target Users:** Minimalist developers or those who find the full GitLens extension to be too much "bloat."

## Quality Score
**Overall Score:** 5.1/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 0/10
- **Technical Feasibility:** 8/10
- **Market Opportunity:** 4/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Vscode Extension](./platforms/vscode-extension/)

## Revenue Model
Free (Donation-based).

## Revenue Potential
N/A.

## Development Time
2-3 days.

## Technical Complexity
3/10. The core logic involves shelling out to the git blame command for the current file and line, parsing the output, and displaying it as an editor decoration.

## Competition Level
High, but indirect. It competes with a feature of a much larger extension. Its value proposition is simplicity and minimalism.

## Key Features
- Inline Blame Annotation: Displays the author, date, and commit message for the current line.
- Minimalist: No extra UI elements, sidebars, or menus are added.
- Highly Performant: By doing only one thing, it remains lightweight and fast.
- Click to View Commit: Clicking the annotation opens the full commit details on GitHub/GitLab.

## Success Indicators
Number of installs and positive reviews praising its simplicity and performance.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
