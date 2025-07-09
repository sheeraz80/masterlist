# StyleDoc Generator

## Overview
**Problem Statement:** When handing off to developers or documenting a design system, designers spend time creating style guides manually – listing colors, fonts, spacings, etc. It’s repetitive to extract this info from Figma and format it into documentation or slides. A lot of teams want an up-to-date style guide but don’t have a quick automated way from Figma.

**Solution:** A plugin that generates a style guide document (inside Figma or as an exportable file) from the design file’s styles and components. It would create a new page summarizing text styles (with examples), color palette (swatches with names and values), and possibly a table of components with previews. Essentially, one click to get a “Design System Overview” page. This can be printed to PDF or shared with devs for quick reference.

**Target Users:** Design system maintainers, and any designers or front-end developers who want an easy way to see all styles used in a design. This spans freelancers (delivering a style guide to clients) to internal teams prepping for development handoff.

## Quality Score
**Overall Score:** 6.3/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 7/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-time purchase (e.g. $15) or a slightly higher one-time ($25) given it’s a deliverable generator. Alternatively, freemium: free does basic colors and fonts, Pro does components and advanced layout. But one-time could suffice as the value is delivered mainly at certain milestones (not daily use).

## Revenue Potential
Conservative: $400/month; Realistic: $1,200/month; Optimistic: $4,000/month. Many in the community ask for easier style documentation – a solid tool could sell well, especially if showcased on Product Hunt or similar. The optimistic case would require it becoming a go-to for agencies handing off style guides regularly.

## Development Time
~5 days. Retrieving all shared styles (color, text, effect) is easy via API, likewise listing components. The challenge is laying them out nicely on a page. We can programmatically create frames and text in Figma for the documentation. AI not needed except maybe to choose layout or group intelligently (not crucial).

## Technical Complexity
4/10 – Creating Figma nodes via plugin is straightforward. The complexity is in deciding how to display components (maybe snapshot each component as an icon, which might be tricky without an API to render – but we can instantiate each component master on the doc page as an instance to show it). Also if there are many styles, making it nicely paginated or scrollable is something to design carefully. Still, it’s manageable with static rules (e.g. 4 columns of color swatches, etc.).

## Competition Level
Medium – There’s at least one known plugin, “Stylify” or “Design System Documenter,” and some internal tools that generate style pages. However, none have cornered the market, possibly due to output format issues. There’s also Figma’s own “Tokens” plugin but that’s more for JSON export. Our competition is those existing attempts and the alternative of doing it by hand. With superior usability and formatting, we can compete.

## Key Features
- Color palette section: Generate a grid of color swatches with their names and hex codes below each. Group by style group if naming indicates (e.g. primary, secondary).
- Text styles section: List each text style name with a sample of text showing that style (font, size, weight) and label with properties (size, line-height).
- Components overview: Place an instance of each top-level component symbol with its name caption – essentially a sticker sheet. Possibly group by category if component naming has prefixes.
- Export options: Allow the generated guide page to be exported as PDF or image directly (using Figma’s built-in export of that page, user can do it, or maybe automate a PDF export of all frames in the page).
- Update sync: If styles change or new ones added, re-run plugin can update the style guide page rather than making a new one (maybe by updating existing nodes to avoid duplicate pages).

## Success Indicators
Number of style guides generated (especially if users come back to update them, indicates ongoing utility); anecdotal evidence like posts or tweets praising how quick it was; sales and maybe presence in “popular plugins” if Figma highlights it. Also, reduced manual documentation time as reported by users (e.g. “saved me half a day”).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
