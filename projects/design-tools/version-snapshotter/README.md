# Version Snapshotter

## Overview
**Problem Statement:** When presenting design updates to clients or stakeholders, it's often difficult to clearly communicate what has changed between versions. Figma's version history is not visual and is hard to navigate for non-designers.

**Solution:** A plugin that takes two versions of a frame (e.g., the current version and a version from yesterday) and generates a new "diff" frame that visually highlights the changes: elements that were added, removed, or modified.

**Target Users:** Design agencies, freelance designers, and product managers.

## Quality Score
**Overall Score:** 6.8/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 6/10
- **Technical Feasibility:** 5/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Subscription.

## Revenue Potential
Conservative: $700/mo; Realistic: $4,000/mo; Optimistic: $12,000/mo.

## Development Time
6-7 days.

## Technical Complexity
The "diffing" algorithm is the core of the product and is very difficult to get right, especially for complex, nested frames. This is a significant technical risk. Market Risk: The need might be perceived as a "nice-to-have," but for agencies, clear communication is a billable efficiency.

## Competition Level
Low. This is a unique tool that solves a communication problem, not just a design problem. No major plugins currently offer a visual "diffing" capability for design frames.

## Key Features
- Frame Selection: Select two frames to compare.
- Visual Diff Generation: Creates a new page showing the two frames side-by-side, with a third "diff" view that highlights changes.
- Highlighting Modes: Options to highlight changes with outlines, color overlays, or annotations.
- Change Summary: Generates a text summary of changes (e.g., "3 elements added, 5 text layers modified, 1 element removed").
- Integration with Version History: An advanced feature to compare the current frame with a named version from Figma's version history.

## Success Indicators
MRR, number of active subscribers, and testimonials about reduced client revision cycles.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
