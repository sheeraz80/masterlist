# Layer Path Copier

## Overview
**Problem Statement:** When writing documentation or communicating with developers, designers often need to refer to a specific layer within a complex file. Manually typing out the nested path (e.g., Page > Frame > Group > Element) is tedious and error-prone.

**Solution:** A simple utility plugin that adds a "Copy Layer Path" option to the right-click context menu, which copies the full hierarchical path of the selected layer to the clipboard.

**Target Users:** Design system documenters, UX writers, and designers collaborating closely with developers.

## Quality Score
**Overall Score:** 6.1/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 0/10
- **Technical Feasibility:** 9/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Free.

## Revenue Potential
N/A.

## Development Time
1-2 days.

## Technical Complexity
2/10. The logic is very simple. It requires getting the selected node, then traversing up its parent property repeatedly until it reaches the canvas, building the path string along the way.

## Competition Level
Very Low. This is a micro-utility that solves a small but annoying problem for a specific group of power users.

## Key Features
- Context Menu Integration: Adds a "Copy Layer Path" command to the right-click menu.
- Customizable Separator: A setting to change the separator character (e.g., > or /).
- Copy Node ID: An option to also copy the unique node ID for API use.

## Success Indicators
Number of installs and positive reviews from developers and technical writers.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
