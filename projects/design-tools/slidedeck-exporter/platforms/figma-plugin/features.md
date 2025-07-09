# SlideDeck Exporter - Figma Plugin Features

## Core Features
- Export to PPTX: One-click to generate a PowerPoint file with each selected frame as a slide. The plugin will handle sizing (fit frame content into standard 16:9 or A4 slide dimensions, adding padding or background if needed).
- Keep text editable (Pro): Attempt to convert large text layers into actual PPT text boxes with matching font size/color. This allows minor edits in PowerPoint (like fixing a typo or translating a pitch) without coming back to Figma.
- Basic slide transitions: If frames are named with prefix numbers or notes (e.g. “Slide 1 – Title”), preserve that order and possibly add a default slide transition in PPT for polish (if doable via XML or leave to user).
- Speaker notes from Figma: If the Figma frames have descriptions or comments, allow exporting those as speaker notes in the PPT. This is useful for presenters (could map a Figma frame’s description to that slide’s notes).
- PDF and Google Slides: Additionally, offer direct PDF export (multipage PDF using Figma’s built-in, just collate) and perhaps a Google Slides link by converting on the fly (maybe using Google Slides API if user provides credentials, or instruct to import PPT to Google). At minimum, PPT and PDF cover majority.

## Platform-Specific Capabilities
This implementation leverages the unique capabilities of the Figma Plugin platform:

### API Integration
- Access to platform-specific APIs
- Native integration with platform ecosystem

### User Experience
- Follows platform design guidelines
- Optimized for platform-specific workflows

### Performance
- Optimized for platform performance characteristics
- Efficient resource utilization
