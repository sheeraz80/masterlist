# Unused Asset Finder - Market Analysis

## Market Overview

### Problem Size
Figma files, especially older ones, accumulate unused components, styles, and layers (like hidden or detached elements). This bloat makes files heavier and design systems messy. Designers have no easy way to identify which components or styles aren’t actually used in any frame, or which imported images are not placed anywhere.

### Target Market
Design system managers and any designers dealing with legacy or team files who want to optimize and organize their Figma documents. Teams preparing a design system for publication or handoff will also benefit by removing cruft.

## Competition Analysis

### Competition Level
**Rating:** Low – Some designers manually do this or run custom scripts, but there’s no popular plugin that comprehensively cleans a file. The closest is “Design Lint” which finds missing styles (opposite problem). Our focus on deletion/cleanup is relatively unique. There might be a plugin to remove unused styles but likely not as complete. So competition is minimal.

### Competitive Landscape
Low – Some designers manually do this or run custom scripts, but there’s no popular plugin that comprehensively cleans a file. The closest is “Design Lint” which finds missing styles (opposite problem). Our focus on deletion/cleanup is relatively unique. There might be a plugin to remove unused styles but likely not as complete. So competition is minimal.

## Revenue Analysis

### Revenue Model
Freemium or one-time. Possibly freemium: free version identifies unused styles and components; Pro ($5 one-time or $2/month subscription) adds batch deletion and checks across multiple files (if we allow selecting a library file to scan usage in another). However, since Figma plugin scope is one file at a time, one-time purchase could suffice given it’s a straightforward utility.

### Revenue Potential
Conservative: $150/month; Realistic: $600/month; Optimistic: $1,500/month. This is a narrower utility, but every medium-to-large team likely faces this issue. Even if a few hundred designers globally pay a small fee, that’s within optimistic range. It might also attract one-off purchases when a need arises (spring cleaning of files).

### Revenue Breakdown
- **Conservative:** 150/month
- **Realistic:** 600/month
- **Optimistic:** 1,500/month

### Monetization Strategy
Market as a tool to optimize performance – cleaning file can reduce load times, which teams care about (especially if a file has too many unused assets causing slow Figma performance). Also a organization best practice: keeping a tidy design system. Share content (blog posts, tweets) showing “We cleaned a design file and reduced its size by 20%, here’s how.” The free version can show what’s unused (giving value), and users who want the convenience of auto-cleanup upgrade. Given the low price, impulse buys are likely if it saves an hour of manual cleaning. The plugin could also be mentioned in Figma community or at Config (Figma’s conference) if it gains traction.

## Risk Assessment

### Overall Risk
Data loss risk: Deleting assets is sensitive – mitigate by having an explicit confirm and perhaps moving to a separate page rather than permanent deletion, so users can recover if needed. Platform: Figma might not allow a plugin to directly delete styles (need to verify); worst case, we guide user to remove them manually (less ideal). We must ensure we don’t accidentally remove something in use (double-check references). Market: Some might feel this should be free (like an open-source script); however, we provide convenience and support which can justify a small price. We’ll likely keep price low to avoid pushback. Technical: Should be stable; scanning large files might be slow, but that’s expected and can be communicated (if a file is huge, user likely expects a wait).

### Key Risks
- Platform dependency risk
- Competition risk
- Technical implementation risk
- Market adoption risk
- Revenue sustainability risk

### Mitigation Strategies
- Diversify across multiple platforms
- Focus on unique value proposition
- Maintain technical excellence
- Build strong user community
- Develop sustainable revenue streams

## Market Opportunity

### Total Addressable Market (TAM)
- Platform user base size
- Market segment size
- Growth potential

### Serviceable Addressable Market (SAM)
- Targetable user subset
- Geographic limitations
- Platform-specific constraints

### Serviceable Obtainable Market (SOM)
- Realistic market capture
- Competitive positioning
- Resource limitations

## Success Indicators
Number of files scanned and cleaned (maybe track how many items found/removed as a proxy for impact); user testimonials about improved file performance or manageability; support requests (low is good, meaning it’s working safely); and perhaps being recommended by design ops folks (if they start telling teams to use it, it’s a success). Also, if teams regularly use it before publishing a design library, that indicates recurring value.
