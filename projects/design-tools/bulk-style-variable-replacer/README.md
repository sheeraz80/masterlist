# Bulk Style & Variable Replacer

## Overview
**Problem Statement:** When refactoring a design system or merging two files, designers often need to replace all instances of one color/text style with another. Figma's native "Select all with..." feature can be cumbersome and doesn't work well for replacing a style with a completely different one across hundreds of frames.

**Solution:** A simple utility that allows a user to select a "find" style/variable and a "replace" style/variable, then scans the entire document and replaces every instance of the former with the latter.

**Target Users:** Design system maintainers, designers working on large-scale redesigns, and anyone who needs to perform bulk style updates.

## Quality Score
**Overall Score:** 6.6/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 6/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium.

## Revenue Potential
Conservative: $500/mo; Realistic: $2,000/mo; Optimistic: $5,500/mo.

## Development Time
4-5 days.

## Technical Complexity
5/10. This requires a deep traversal of the document tree. The logic must identify every layer property (fills, strokes, effects, fonts) that uses the target style and then re-assign it to the replacement style. Handling edge cases and ensuring performance on large files is the main challenge.

## Competition Level
Medium. Plugins like Style Replacer exist, but there is room for a more robust tool that also handles variables, offers a better UI, and includes advanced features like a "dry run" preview.

## Key Features
- Simple UI: Two dropdowns: "Find Style/Variable" and "Replace With Style/Variable".
- Global Scope: Scans all pages and all nested layers within the document.
- Dry Run Preview: A "Preview Changes" mode that highlights all layers that would be affected without actually making the change.
- History/Undo: A log of recent replacements with a one-click undo capability, independent of Figma's main undo stack.
- Variable Support: Works for both classic styles (color, text, effect) and the newer Figma Variables.

## Success Indicators
MRR, conversion rate from free to pro, and user reviews praising its reliability and time-saving capabilities.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
