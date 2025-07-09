# LayoutPlanner (Grid & Guide Assistant)

## Overview
**Problem Statement:** Setting up consistent grids, columns, and guides in Figma is manual. Designers often eyeball spacing or copy guides from one page to another. Lack of proper grid alignment leads to misaligned elements and inconsistencies across screens. Especially for responsive web designs or multi-screen flows, maintaining a consistent grid is critical but not enforced by Figma beyond per-frame grid settings.

**Solution:** A plugin that helps plan and apply grid systems and guides across multiple frames. The user can define a grid (say 12-column with 16px gutter, margin X) once and the plugin will apply corresponding layout grids to all selected frames or even draw guide lines. It can also detect elements that are off-grid and highlight them. This ensures pixel-perfect layout alignment throughout a project with minimal manual setup.

**Target Users:** Web and app designers dealing with column grids (especially those designing responsive web where they might simulate breakpoints in Figma), and anyone who cares about consistent spacing and alignment (designers moving from Sketch might miss some guide features). Design teams establishing a design system might also use it to enforce grid standards.

## Quality Score
**Overall Score:** 6.6/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 2/10
- **Technical Feasibility:** 9/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Mostly one-time or low-cost. This is a utility that appeals to precision-focused designers. A one-time $10 might be reasonable. Hard to make this subscription-worthy as it’s somewhat set-and-forget per project, unless we add more ongoing features like continuous off-grid monitoring. Possibly freeware with donation, but to meet the task requirement, let’s say one-time purchase.

## Revenue Potential
Conservative: $100/month; Realistic: $500/month; Optimistic: $1,500/month. It’s a narrower audience (some designers are fine eyeballing or using built-in grids), but those who need it will appreciate it. Optimistic if it becomes standard for agency web designers. Might not be a huge money-maker but complements others.

## Development Time
~4 days. Figma’s API allows setting layoutGrid properties on frames (which define column grids). We can easily loop and apply. Drawing persistent guide lines might be trickier since Figma doesn’t have a guide concept in API, but we could create line objects on a separate locked layer as “guides.” Highlighting misaligned elements would require scanning positions relative to grid – doable.

## Technical Complexity
2/10 – Very straightforward to apply grid settings via API (just copying an array of grid definitions). Calculating positions to check alignment requires basic math mod operations. Drawing lines for guides is simple shape creation. This is mostly a UI/UX design problem to present options nicely, technically not complex.

## Competition Level
Low – There’s little noise about grid plugins; Figma has built-in layout grids, so many might not seek a plugin. There was a “GuideMate” plugin in Sketch times, not sure about Figma. If any exist, not well-known. So mostly competing with manual use of grids.

## Key Features
- Grid template presets: Predefined common grids (Bootstrap 12-col, 8px baseline grid, etc.) and the ability to custom define columns, gutter, margins.
- Apply to multiple frames: Select multiple artboards/frames and apply the grid in one go (ensuring every screen uses identical columns, which Figma doesn’t auto-sync if you create new frames).
- Global guide lines: Option to draw actual guide lines on a separate layer that span across frames (useful in a flow presentation context or when layout grids aren’t visible to viewers in prototype mode).
- Alignment checker: Scan selected frames for elements that are not aligned to the set grid (either vertically to baseline or horizontally to columns). Flag those elements (maybe by temporarily highlighting in red or listing them). This serves as a lint for layout consistency.
- Guide manager: If using drawn guides, ability to remove or adjust them easily via the plugin interface.

## Success Indicators
Adoption by detail-oriented designers (maybe see mentions on Twitter or YouTube if someone highlights it as a top plugin for web design). Fewer support requests (since it should be straightforward). Sales numbers might be modest, but if we see steady trickle it means new designers discover it as they start complex projects. If teams start including it in their official process (e.g. a creative director tells team to use it for consistency), that indicates strong value.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
