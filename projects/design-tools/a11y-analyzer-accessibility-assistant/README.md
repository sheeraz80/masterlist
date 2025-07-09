# A11y Analyzer (Accessibility Assistant)

## Overview
**Problem Statement:** Beyond color contrast, other accessibility considerations in design (like sufficient tap target sizes, proper heading structures, use of semantic annotations) are often overlooked in the design phase. Designers may not realize their design could be hard for screen readers or motor-impaired users until development. There’s no built-in Figma tool to assess these aspects.

**Solution:** An accessibility auditing plugin for Figma. It would check things like: Are interactive elements (buttons, icons) at least X pixels in size? Are form controls labeled (designers might leave placeholder text which could be ambiguous)? Are color combinations colorblind-friendly (simulate color blindness on the design)? It can simulate how a screen reader would linearize the content (based on layer order/naming), flagging if something might not make sense. Essentially a toolkit to catch potential a11y issues early in the design.

**Target Users:** UX/UI designers concerned with accessibility, product designers in regulated industries that mandate accessible design, and design leads who want to ensure their team’s output meets standards (WCAG) before handing to dev. Many organizations now prioritize inclusive design, so this fits that trend.

## Quality Score
**Overall Score:** 6.1/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 4/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium with a likely focus on teams (maybe even enterprise pricing if we got traction). Basic checks (like tap size and contrast – though contrast we did separate plugin, but maybe basic included here too) can be free. Pro version ($10/month or $99/year per seat) includes advanced simulations (color blindness filters, screen reader outline generation, PDF of report, etc.). Possibly offer team licenses at a discount for companies.

## Revenue Potential
Conservative: $300/month; Realistic: $1,500/month; Optimistic: $5,000+/month. Accessibility is increasingly a requirement, and a tool that saves time in auditing designs could justify company spend. The optimistic scenario could happen if several mid-size companies adopt it for all designers (like 50 designers paying $99 each annually adds up). It’s somewhat niche but with strong impetus (legal compliance in some cases).

## Development Time
~7 days. Some checks are straightforward (size measurements, color checks reuse code from contrast plugin). Color blindness simulation can be done by applying filters to frames (we might generate an image of the frame and shift colors). Generating a screen reader outline is tricky: we could use layer structure (frames as landmarks, etc.). Perhaps integrate basic rules from WCAG guidelines (like ensure headings vs body text contrast, etc.). The complexity is medium due to variety of checks. AI could assist e.g. summarizing a screen’s content order, but not necessary.

## Technical Complexity
7/10 – Some aspects like analyzing touch target sizes means scanning for components that look like buttons (maybe based on layer naming or type) and measuring them – we might need heuristics. Colorblind filter: applying a matrix to colors or exporting image and modifying might be heavy if done in plugin (maybe just approximate by adjusting colors, or request user to visually inspect via filter CSS in plugin UI?). Screen reader sim: would require reading text layers in order – could attempt to output a text outline of the screen by traversing layers (assuming reading left-to-right, top-to-bottom from canvas coordinates or layer order). That’s complex to perfect. Possibly an iterative approach where initial version focuses on easier checks (size, contrast, maybe colorblind filter) and later adds others.

## Competition Level
Low – In design tools, few a11y plugins exist. Stark (a plugin) does color contrast and color blindness simulation (they have a subscription model and have some traction, Night Eye etc for dark mode). Stark is known in this space (color contrast, suggestions). Our plugin could be broader in scope but will inevitably overlap with contrast (which Stark does well). Competing with Stark could be tough if they expand, but we differentiate by covering other aspects. Essentially moderate competition from Stark for color checks; otherwise mostly novel.

## Key Features
- Touch target check: Flag any interactive-looking element (buttons, icons inside clickable areas) that is smaller than, say, 44x44 px (the Apple guideline) or too close to another tap target. Could highlight them in red overlays.
- Spacing and zoom: Warn if text is very small (below 12px for body text, as that may be hard to read, or below 16px which is recommended for web), because that affects readability.
- Color blindness simulator: Choose a type of color vision deficiency (e.g. protanopia) and the plugin will show a simulation (maybe by duplicating the frame or applying a filter) to let the designer visually check if information is still distinguishable without color cues.
- Screen reader outline (Pro): Generate a structured outline of all text and images in the order a screen reader might read them. E.g. list frames/artboards as separate pages with their content listed (we’d infer reading order either by layer order or coordinates). This helps designers see if, for example, they have meaningful labels for icons or if the reading order is logical.
- Alt-text reminders: Identify images or icons that likely need alt text and ensure there’s a text layer nearby that could serve as alt (or flag if not). This could be as simple as highlighting images that have no descriptive text.
- Report export: Generate an audit report listing all issues found (like “Button X is only 30px high – too small for tap” or “Color contrast of text Y on background Z is 3:1, below recommended”). Pro users might get a nicely formatted PDF/Markdown to share with QA or devs.

## Success Indicators
Adoption by accessibility-conscious teams (maybe if known inclusive design advocates recommend it). A drop in common a11y issues in designs for users (hard to measure, but maybe via user testimonials). Conversion rates might actually be high among those who download it, because those who seek it probably need the full features. If we see teams buying multiple pro seats, that’s a strong sign. Also integration: maybe event organizers or blogs listing it as a top plugin for inclusive design – that indicates impact.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
