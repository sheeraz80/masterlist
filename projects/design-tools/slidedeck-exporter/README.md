# SlideDeck Exporter

## Overview
**Problem Statement:** Turning Figma designs into presentation decks (for client readouts, pitch decks, etc.) is manual. Designers often take screenshots of Figma frames and paste into PowerPoint or Google Slides, then animate or adjust. This duplication of effort is time-consuming.

**Solution:** A Figma plugin that exports selected frames or pages into a ready-to-use presentation format. It can generate a PowerPoint file (PPTX) or PDF where each Figma frame becomes a slid】. It could also retain text as editable and images separately for later tweaks. Additionally, support simple slide animations or speaker notes derived from Figma prototype links or frame descriptions. Essentially an automated way to go from design to deck.

**Target Users:** UX/UI designers presenting designs to stakeholders, product managers compiling presentations of design work, and startup founders who design pitch slides in Figma (increasingly common). Also agencies packaging deliverables as PowerPoint.

## Quality Score
**Overall Score:** 7.0/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 6/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-time purchase, likely on the higher side (e.g. $40) because it replaces a lot of tedious work each project. Many might expense it for a client project. Alternatively, a lower subscription if we anticipate frequent usage, but one-time fits since each user might use it per project cycle.

## Revenue Potential
Conservative: $500/month; Realistic: $2,000/month; Optimistic: $6,000/month. Given that an existing plugin (Pitchdeck by Hypermatic) does this and likely has significant users, the demand is prove】. By capturing a slice of that market or appealing to those who need a simpler/cheaper alternative, we could see solid sales. Optimistic if we become a top recommended tool for agencies and startups prepping decks.

## Development Time
~7 days. Exporting to PDF is easy (Figma can already export frames to PDF sequence). The challenge is PPTX: we’d need to construct an Office XML format. Possibly use an open-source PPTX library in JS to build slides with images of frames. To keep text editable, we’d have to parse Figma text layers and convert to PPTX text boxes – doable for simple text (font, size, color), though exact fidelity might suffer if Figma uses custom fonts (we can embed or require them). As a simpler route, we export all frames to images and put each as full-slide image in PPT – which is what many do manually. That loses editability but is safe. Perhaps offer choice: quick image slides vs. experimental editable export. AI assistance not needed, straightforward file assembly.

## Technical Complexity
5/10 – Creating a PPTX (which is essentially a ZIP of XML and media) isn’t trivial but there are libraries. Ensuring formatting consistency is moderate complexity. If we skip editable text, it’s simpler (just export images and wrap them in slides XML). If including text, mapping Figma fonts to system fonts and layout might be messy. We may start with image-based slides (which already solves 90% use case: quick deck visuals), and iterate on adding editable text support for Pro version.

## Competition Level
Medium – Hypermatic’s Pitchdeck is a direct competitor (they charge subscription or bundl】). Ours could differentiate by pricing model or simplicity. Also, Google Slides now has Figma integration (but that’s more embedding Figma prototype into a slide, not native export). There’s also Figmagic for Notion exports, etc. But specifically for PPT, competition is limited. If we match core needs and price lower than existing, we can capture budget-conscious users.

## Key Features
- Export to PPTX: One-click to generate a PowerPoint file with each selected frame as a slide. The plugin will handle sizing (fit frame content into standard 16:9 or A4 slide dimensions, adding padding or background if needed).
- Keep text editable (Pro): Attempt to convert large text layers into actual PPT text boxes with matching font size/color. This allows minor edits in PowerPoint (like fixing a typo or translating a pitch) without coming back to Figma.
- Basic slide transitions: If frames are named with prefix numbers or notes (e.g. “Slide 1 – Title”), preserve that order and possibly add a default slide transition in PPT for polish (if doable via XML or leave to user).
- Speaker notes from Figma: If the Figma frames have descriptions or comments, allow exporting those as speaker notes in the PPT. This is useful for presenters (could map a Figma frame’s description to that slide’s notes).
- PDF and Google Slides: Additionally, offer direct PDF export (multipage PDF using Figma’s built-in, just collate) and perhaps a Google Slides link by converting on the fly (maybe using Google Slides API if user provides credentials, or instruct to import PPT to Google). At minimum, PPT and PDF cover majority.

## Success Indicators
Sales volume (if we can capture even 50% of those who consider the leading competitor, that’s big). Also, user stories: “We delivered 10 client presentations with no time wasted thanks to SlideDeck Exporter.” If our plugin gets mentioned on social media by satisfied consultants or founders, it will drive further interest. Minimizing support tickets around conversion fidelity is another internal success measure (means our output is robust).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
