# Variable Style Guide Generator

## Overview
**Problem Statement:** Creating and maintaining style guide documentation for a design system is a manual and laborious process. When design tokens (colors, fonts, spacing) stored in Figma Variables are updated, the documentation becomes outdated, leading to inconsistencies between design and code.

**Solution:** A one-click plugin that automatically generates a clean, organized, and shareable style guide page directly within Figma, populated from the file's local variables.

**Target Users:** Design system teams, UI/UX designers, and product managers who need to document and share design specifications.

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
Conservative: $500/mo; Realistic: $2,500/mo; Optimistic: $8,000/mo.

## Development Time
4-5 days.

## Technical Complexity
4/10. The core logic involves using the Figma API to read all defined variable collections and modes, then programmatically creating frames, text nodes, and rectangles to visually represent them. Complexity increases with the level of customization offered.

## Competition Level
Low. While plugins like Variables Doc Designer exist, the market is not saturated. Many teams still document manually. The opportunity lies in creating a highly polished, customizable, and aesthetically pleasing output that looks like a professionally designed style guide.

## Key Features
- Automated Generation: Creates a new Figma page titled "Style Guide" with neatly organized sections for colors, typography, spacing, and corner radii.
- Customizable Templates: Users can choose from several layout templates for the generated style guide (e.g., compact, detailed, brand-focused).
- Variable Mode Support: Automatically generates separate sections or variants for different variable modes (e.g., Light Mode, Dark Mode).
- Code Snippet Output: For each variable, it generates corresponding CSS custom property or Tailwind CSS config snippets for easy developer handoff.
- Live Update: A "Refresh Style Guide" button to update the generated page instantly after variables are changed.

## Success Indicators
Number of units sold, user ratings on the Figma Community, and number of "style guides generated" tracked anonymously.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
