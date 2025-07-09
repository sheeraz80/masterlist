# UI Flow AutoMapper

## Overview
**Problem Statement:** Creating user flow diagrams can be time-consuming – designers often manually draw flowcharts to show how screens connect (e.g. login -> dashboard -> settings). While Figma has prototyping links, there’s no easy way to visualize those as a high-level flow diagram for presentations or documentation.

**Solution:** A plugin that reads the prototype connections between frames in a Figma file and automatically generates a flowchart (could be in a new FigJam board or as grouped arrows and labels in Figma). It essentially turns your interactive prototype links into a sitemap/flow diagram, saving hours of drawing boxes and arrows.

**Target Users:** UX designers, product managers, and anyone who needs to communicate screen flows or app structure. Especially useful after wireframing or during design reviews to quickly get a bird’s-eye view of navigation.

## Quality Score
**Overall Score:** 6.5/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-time purchase (e.g. $10 per user) via Figma Community or external. This tool is a bit situational (used when documenting flows), so a recurring fee might be less appealing; a low one-time price can drive volume. Possibly a free tier that generates flows for up to 10 screens, and a paid for unlimited (for those doing big apps).

## Revenue Potential
Conservative: $250/month; Realistic: $1,000/month; Optimistic: $3,000/month. Many designers would find this handy occasionally – conversion depends on how often they document flows. Optimistically, if it becomes popular on Figma Community and say 100 people buy weekly, that’s achievable.

## Development Time
~5 days. Accessing prototype links via Figma API is possible (the API provides interaction info). Generating a diagram can be done by creating new nodes (shapes and connectors) in Figma or outputting to a FigJam file (which might require writing a .json). The logic to layout the flow could use a simple algorithm (or delegate to a small JS graph layout library). AI not needed except maybe to assist in auto-layout of the graph, but deterministic algorithms suffice.

## Technical Complexity
5/10 – Parsing the graph of screens and connections is straightforward; the challenge is nicely laying it out without overlaps. We might use a basic heuristic (e.g. column by app section). Ensuring it looks clean for very complex flows might be tough, but we can start simple. No server needed; all computation and creation done within Figma environment.

## Competition Level
Low – No known direct plugin that “auto-draws” flow diagrams from prototypes. Some tools outside Figma (like Overflow or UXPressia) do user flows, but require extra work. If any plugin exists, it’s not prominent, so entering now could capture the niche.

## Key Features
- Auto-generate flowchart: With one click, produce a flow diagram of all frames and their prototype links. Frames become nodes in the diagram with arrows connecting them per interactions (e.g. buttons linking to other screens).
- Layout options: Choose layout style – e.g. vertical tree, horizontal, or force-directed. (Offer a few for user to pick what looks best.)
- Annotations: Label the connectors with the interaction (if a Figma interaction has a condition or label, include that text on the arrow, e.g. “on success” or “click Login”).
- Selective generation: Option to generate flow for a selection or a page, not the whole file, if user wants to focus on a subset.
- Update sync: After generation, if the design changes or prototype links update, running the plugin again can update the flowchart (or generate a new one). Possibly highlight changes if re-run (like new screen added).

## Success Indicators
How many flowcharts generated (especially for paid users); reduction in time spent on manual flow diagrams as reported by users; sales numbers and plugin user count; and qualitative feedback – e.g. if product managers start requesting designers to use it (an indicator of demand from stakeholders). Also, inclusion in design workflow recommendations would be a sign of success.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
