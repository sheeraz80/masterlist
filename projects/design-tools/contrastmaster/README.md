# ContrastMaster

## Overview
**Problem Statement:** Designers need to ensure text and UI elements meet accessibility contrast standards (WCAG), but manually checking color contrast across dozens of text layers is tedious. It’s easy to overlook low-contrast text, leading to accessibility issues.

**Solution:** A Figma plugin that automatically checks the color contrast of all text (and other elements) against backgrounds and flags any that fail accessibility standards. It provides a clear pass/fail report and suggestions for accessible color alternatives from the design’s palette.

**Target Users:** UX designers, accessibility specialists, and product teams concerned with inclusive design – essentially anyone designing UIs who wants to easily catch and fix low-contrast elements to comply with accessibility guidelines.

## Quality Score
**Overall Score:** 6.7/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 9/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium. Free tier performs basic contrast checking (AA standard) on demand. A Pro tier (e.g. $5/month or $50/year per user) adds advanced features like checking against AAA standards, batch fixing suggestions, integration with design systems (ensuring all official colors have contrast combos), and continuous monitoring as you design.

## Revenue Potential
Conservative: ~$300/month; Realistic: ~$1,200/month; Optimistic: ~$4,000/month. Accessibility is important but somewhat niche – growth might come as accessibility becomes a standard requirement (trending upward). A realistic scenario might be a few hundred paid users globally, including some organizations buying multiple seats.

## Development Time
~4 days. Contrast calculation is straightforward math (using relative luminance formulas). Implementing the scan across all frames and layers and a UI to display results is doable quickly. AI not needed except perhaps to suggest nearest compliant color (which can be done with algorithmic adjustments).

## Technical Complexity
2/10 – Technically simple. Iterate through text nodes and shapes, compute contrast ratios between foreground text and its background color (requires determining background, which can be tricky if layered – but we can simplify by using the immediate parent fill or artboard color). The math and rule definitions for WCAG 2.1 (contrast ratio 4.5:1 for normal text etc.) are well-defined. Everything runs client-side.

## Competition Level
Medium – There are a couple of existing plugins for contrast (e.g. “Contrast” plugin) but they typically check one selection at a time. No major player dominates this, and many designers still do it manually or forget. Our edge is an automated full-document scan and suggestions, which is relatively unique.

## Key Features
- One-click scan: Scans all visible text layers on all frames/pages and identifies any that don’t meet AA contrast guidelines
- Detailed report: List of failing elements with their contrast ratio and the required ratio (e.g. “3.5:1 – fails AA (needs 4.5:1)”)
- Suggested fixes: If possible, suggest a darker or lighter variant of the color from the document’s styles that would pass, or highlight the closest passing color (this can be a manual adjustment aid)
- Live monitoring (Pro): Option to turn on a mode where new text layers or color changes get evaluated in real-time and flagged immediately if below contrast threshold
- Export/Share report: Generate a summary that can be shared with developers or in design reviews to prove accessibility checks (could be a simple markdown or PDF output listing issues)

## Success Indicators
Number of issues detected and fixed (the plugin could internally count “X issues resolved” – a metric to show impact); user adoption (especially in organizations or edu institutions); feedback from accessibility specialists; conversion rate from free to Pro (indicating our advanced features are valued); and possibly recognition in accessibility circles (e.g. recommended by accessibility blogs).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
