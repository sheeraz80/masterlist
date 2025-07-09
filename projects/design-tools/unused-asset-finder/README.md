# Unused Asset Finder

## Overview
**Problem Statement:** Figma files, especially older ones, accumulate unused components, styles, and layers (like hidden or detached elements). This bloat makes files heavier and design systems messy. Designers have no easy way to identify which components or styles aren’t actually used in any frame, or which imported images are not placed anywhere.

**Solution:** A plugin that scans the Figma file for unused assets: it lists color styles and text styles that are defined but not applied to any object, components in the library or page that have 0 instances, and large images or layers that are hidden/off-canvas. It then offers the ability to highlight or remove these to clean up the file (with confirmation). Think of it as a “garbage collector” for Figma assets.

**Target Users:** Design system managers and any designers dealing with legacy or team files who want to optimize and organize their Figma documents. Teams preparing a design system for publication or handoff will also benefit by removing cruft.

## Quality Score
**Overall Score:** 6.4/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 2/10
- **Technical Feasibility:** 8/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium or one-time. Possibly freemium: free version identifies unused styles and components; Pro ($5 one-time or $2/month subscription) adds batch deletion and checks across multiple files (if we allow selecting a library file to scan usage in another). However, since Figma plugin scope is one file at a time, one-time purchase could suffice given it’s a straightforward utility.

## Revenue Potential
Conservative: $150/month; Realistic: $600/month; Optimistic: $1,500/month. This is a narrower utility, but every medium-to-large team likely faces this issue. Even if a few hundred designers globally pay a small fee, that’s within optimistic range. It might also attract one-off purchases when a need arises (spring cleaning of files).

## Development Time
~4 days. The Figma plugin API can list all styles and components in a file and all nodes. We can cross-check usage by scanning nodes’ styleId/componentId references. Hidden or off-canvas layers can be found by checking layer visibility or coordinates. AI not needed; just careful iteration and matching.

## Technical Complexity
3/10 – Listing and matching IDs is straightforward. Removing a style via plugin might not be directly possible (styles may require user action to delete if used; if truly unused, we might simulate deletion by creating an edit). For components, we can flag them for user to manually delete or possibly move them to a “Trash” page. Ensuring accuracy (not flagging something as unused when it is used) is important, but we can double-check references easily.

## Competition Level
Low – Some designers manually do this or run custom scripts, but there’s no popular plugin that comprehensively cleans a file. The closest is “Design Lint” which finds missing styles (opposite problem). Our focus on deletion/cleanup is relatively unique. There might be a plugin to remove unused styles but likely not as complete. So competition is minimal.

## Key Features
- Unused style list: Show all color styles, text styles, and effect styles that no layer currently uses.
- Unused components: List components and symbols that have zero instances in the file (and optionally across files if the library usage API allows – but likely just local).
- Hidden/layer clean-up: Optionally, list layers that are hidden or outside the canvas bounds (could indicate forgotten elements), particularly large images that increase file size without being visible.
- One-click clean (Pro): Remove all unused styles from the file, and detach or delete unused components (maybe move them to an archive page first for safety). For layers, offer to bulk delete hidden/off-canvas layers.
- Report: Summary like “Removed 5 unused color styles, 3 components” so user sees the impact. Possibly an estimate of size reduction if relevant.

## Success Indicators
Number of files scanned and cleaned (maybe track how many items found/removed as a proxy for impact); user testimonials about improved file performance or manageability; support requests (low is good, meaning it’s working safely); and perhaps being recommended by design ops folks (if they start telling teams to use it, it’s a success). Also, if teams regularly use it before publishing a design library, that indicates recurring value.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
