# Data Visualization Wizard

## Overview
**Problem Statement:** Standard chart plugins in Figma are great for basic bar, line, and pie charts, but they lack support for more complex and specialized data visualizations like Sankey diagrams, heatmaps, or chord diagrams, which are essential for data-heavy dashboards and reports.

**Solution:** A "wizard-style" plugin that guides users through a step-by-step process to create advanced, highly-customizable data visualizations by simply inputting data in a structured format.

**Target Users:** Data analysts, UX designers working on analytics products, and researchers who need to present complex data visually.

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
One-Time Purchase with add-on packs.

## Revenue Potential
Conservative: $600/mo; Realistic: $3,000/mo; Optimistic: $8,000/mo.

## Development Time
6-7 days.

## Technical Complexity
6/10. This would leverage a powerful client-side JavaScript charting library like or ECharts. The plugin would render the chart as an SVG within a webview inside the plugin's UI, and then allow the user to import the final SVG onto the Figma canvas. The main work is building the UI "wizard" and integrating the charting library.

## Competition Level
Low. This is a clear gap in the market. Existing chart plugins focus on the most common chart types, leaving advanced visualizations underserved.

## Key Features
- Advanced Chart Types: Support for Sankey diagrams, heatmaps, chord diagrams, treemaps, and sunburst charts.
- Wizard Interface: A step-by-step guide: 1. Choose chart type. 2. Paste data from CSV/JSON. 3. Map data columns. 4. Customize colors and labels. 5. Insert into Figma.
- Rich Customization: Extensive options for colors, fonts, labels, and legends.
- SVG Output: Inserts the final chart as a clean, editable SVG vector object.
- Data Templates: Provides templates for how data should be structured for each chart type.

## Success Indicators
Sales of the core plugin and add-on packs, and use of the plugin in high-profile data visualization projects.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
