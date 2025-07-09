# ComponentWizard AI

## Overview
**Problem Statement:** Designers waste time recreating similar elements because they miss opportunities to reuse components. Inconsistent use of components leads to design drift and extra work updating multiple instances.

**Solution:** An AI-assisted plugin that analyzes your Figma file to find layers or groups that are similar and suggests converting them into a single reusable component or using an existing component. It’s like a “spellcheck” but for component reuse, improving consistency and efficiency.

**Target Users:** Product designers and design system leads working on large projects with many repetitive UI elements (dashboards, lists, cards) who want to enforce DRY (Don’t Repeat Yourself) principles in design.

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
Freemium – free version identifies potential components; Pro version ($10/month per user) offers one-click component creation/replace and advanced suggestions (like detecting variant opportunities across different states). Team licenses for design departments could also be offered (e.g. $30/month for 5 users).

## Revenue Potential
Conservative: ~$500/month; Realistic: ~$2,000/month; Optimistic: ~$7,000/month, driven by upsells to teams that value efficiency (just a few mid-size teams adopting could hit realistic targets).

## Development Time
~6 days. Implementing similarity detection using simple heuristics (layer structure, naming) or embedding via an AI model (could use local ML or small cloud call if needed) and integrating with Figma’s component creation API. AI assistance accelerates pattern recognition logic development.

## Technical Complexity
6/10 – The toughest part is devising a reliable method to identify “similar” elements. Could start with rule-based checks (same size, style, content structure) and later integrate an AI model for better accuracy. Figma API allows creating and swapping components easily, so the main complexity is the algorithm. No server needed; computation can happen in-plugin (possibly leveraging or a small ML model in the browser).

## Competition Level
Low – While Figma encourages components, there’s no built-in assistant for it, and community plugins in this space are minimal. This idea is relatively novel; most plugins focus on organizing existing components, not discovering new ones. Thus, competition is low aside from manual designer diligence.

## Key Features
- Similarity scan: Scans frames to list groups/layers that look alike (e.g. 10 identical buttons that aren’t linked as one component)
- One-click componentization: Automatically create a Figma component from a selection of similar elements, or replace all with an existing component
- Variant suggestion: If similar elements only differ by text or color, suggest making them variants of a component
- Ignore list: Ability to ignore certain suggestions or mark certain differences as intentional
- Report: Summary of how many potential components were found and how much repetition was reduced (e.g. “20 instances consolidated into 1 component”)

## Success Indicators
Number of components created or consolidated through the plugin (a measure of value delivered); user engagement (how often scans are run per file); retention of Pro users (indicating continued value); qualitative feedback like “our design library size stabilized after using this”; and conversion rate from free to paid, showing willingness to pay for advanced automation.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
