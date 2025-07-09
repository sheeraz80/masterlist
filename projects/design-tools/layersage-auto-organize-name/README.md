# LayerSage (Auto-Organize & Name)

## Overview
**Problem Statement:** Large Figma files often get disorganized – layer names like “Rectangle 123” or random grouping, making it hard to navigate or hand off to others. Cleaning up layers by grouping logically and renaming (e.g. “Header/Bg”, “Button/Icon”) is tedious but important for team collaboration.

**Solution:** A plugin that uses smart rules to auto-organize the layers and structure. It can group layers that form a component (e.g. detect a rectangle and label text as a “button” group) and suggest meaningful names based on their content or design function (possibly using a bit of AI/NLP on the layer properties). It can also apply a consistent naming convention (like Title Case or slashes for hierarchy) across the fil 】. Think of it as a linter/formatter for Figma layers.

**Target Users:** Designers working in teams or handing files to developers, design ops people who maintain library hygiene, and anyone inheriting a messy file who wants to tidy it up quickly.

## Quality Score
**Overall Score:** 5.6/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 2/10
- **Technical Feasibility:** 4/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-time purchase (~$15) or Freemium (basic grouping free, advanced AI naming in Pro). Probably one-time suits since it’s a utility used periodically. Teams might buy a few copies if they value cleanliness.

## Revenue Potential
Conservative: $200/month; Realistic: $800/month; Optimistic: $2,500/month. Many know the pain of messy files; the question is will they pay or just manually fix? If we show huge time savings on a complex file, many pros would pay. Optimistic if some large teams make it part of their process (like always run LayerSage before committing library files).

## Development Time
~6 days. The logic includes: scanning layers for patterns (text above rectangle often = button), proximity-based grouping (elements that overlap to form a component), and making decisions on grouping. That can be rule-based initially. For naming, we could use some heuristics (if a text layer says “Login”, name group “Button/Login” etc.). Possibly call an AI for suggestion if content isn’t obvious (like a vector icon could be identified via an AI vision API to name it “Icon/Home” for a home icon). That’s a stretch goal. Without AI, we rely on layer type and styles to guess (“Layer with 8px stroke and no fill likely ‘Divider’ line”). AI assistance can help code but also maybe we can use an image recognition API for icons. Complexity moderate.

## Technical Complexity
7/10 – Grouping layers programmatically without messing up constraints or component structures is tricky. We must ensure if we create a group, we don’t disrupt auto-layout or component definitions – maybe limit to frames where grouping won’t break layout. Or only rename and not group if auto-layout present. Renaming is easier (just changing name property). Using AI for icon naming means extracting image data and calling an API like Azure Vision or custom model, possible but adds to cost. We could stick to using existing layer name or library info (if an icon is from a known set, might already have a name). The complexity is mostly in not screwing up the file integrity while improving it.

## Competition Level
Low – There are a few plugins like “Rename It” (for batch renaming with find/replace) and “AutoGrid” or “tidy up” features in Figma (just aligns). But no holistic solution that intelligently groups and names semantically. So mostly unique. However, some designers might be wary letting a plugin rearrange layers in case it breaks prototypes or constraints. So trust-building and maybe partial application (preview changes) is needed.

## Key Features
- Intelligent grouping: Option to “Group related layers” – e.g. wrap label and input rectangle into a “Input Field” group, or all nav icons into a “Navbar” frame. It might offer suggestions for group names (“Group these 3 layers as ‘Card/ListItem’?”) that user can accept.
- Batch renaming: Identify layers with default names and rename them based on their role. For example, a layer that is an image often can be named “Image/[contents or category]”. Text layers can be named by their text content truncated (a layer with text “Sign In” named “Txt_SignIn”). Provide consistent prefixes for types (like “Btn_…”, “Icon/…”) according to a chosen convention.
- Apply naming convention: If a team uses “slash naming” for variants (like “Button/Primary/Enabled”), the plugin can enforce casing and delimiter rules. E.g. change all spaces to camelCase or slashes as configured.
- Cleanup: Remove unused layers or stray points (sometimes files have invisible stray elements). Also, optionally re-order layers in the list in a logical top-to-bottom or z-index order. This just tidies for human reading; Figma’s visual is unchanged but it’s nicer for someone examining layer list.
- Preview and Undo: Show a summary of changes (e.g. “Rename Rectangle 45 -> Card Background; Group 3 layers into Group ‘Header’”). User can uncheck any suggestion before applying. And one-click undo if layout breaks. This builds user trust.

## Success Indicators
A tangible measure: reduction in time spent organizing files – maybe user testimonials like “It cleaned a 100-screen app file in 2 minutes, would’ve taken me a day.” Also, if the plugin becomes recommended in company onboarding (“Use LayerSage to keep files clean, as per our guidelines”), that’s great penetration. Monitoring how often it’s used per file could indicate value: e.g. designers might run it at project end or regularly. Fewer frustrated remarks about messy layers from developers might be indirect evidence if used widely in a team.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
