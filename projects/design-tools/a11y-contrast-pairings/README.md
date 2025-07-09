# A11y Contrast Pairings

## Overview
**Problem Statement:** Designers often struggle to find accessible (WCAG AA/AAA compliant) text and background color combinations from their brand's color palette. Manually checking each pair with a contrast checker is slow and inefficient, stifling creativity during the design process.

**Solution:** A plugin that takes a designer's color palette (from local styles) and automatically generates a matrix of all possible text/background color pairings, clearly marking which ones pass WCAG AA and AAA contrast ratios.

**Target Users:** UI/UX designers, product designers, and any designer concerned with accessibility.

## Quality Score
**Overall Score:** 7.2/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 6/10
- **Technical Feasibility:** 7/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-Time Purchase.

## Revenue Potential
Conservative: $600/mo; Realistic: $3,000/mo; Optimistic: $7,000/mo.

## Development Time
3-4 days.

## Technical Complexity
4/10. The core logic involves reading color styles, iterating through every possible pair, calculating the WCAG contrast ratio for each pair using a standard formula (which can be implemented in client-side JavaScript), and then generating a visual grid in the plugin's UI or on the canvas.

## Competition Level
Low to Medium. Plugins like Contrast and Stark check contrast for selected layers but do not proactively generate compliant pairings from a full palette. This tool is about discovery and system-building, not just validation.

## Key Features
- Palette Ingestion: Automatically imports all solid color styles from the current Figma file.
- Contrast Matrix Generation: Displays a visual grid showing every color used as a background against every other color used as text.
- Clear WCAG Badging: Each cell in the matrix is clearly marked with "AA", "AAA", or "Fail" badges for both normal and large text sizes.
- Interactive Preview: Clicking a compliant pair in the matrix shows a live preview of the text on the background.
- Palette Export: Allows users to export the generated matrix as a Figma component or image for their style guide.

## Success Indicators
Total sales volume, positive reviews focusing on time saved, and adoption by design teams in accessibility-conscious organizations.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
