# StyleDoc Generator - Figma Plugin Features

## Core Features
- Color palette section: Generate a grid of color swatches with their names and hex codes below each. Group by style group if naming indicates (e.g. primary, secondary).
- Text styles section: List each text style name with a sample of text showing that style (font, size, weight) and label with properties (size, line-height).
- Components overview: Place an instance of each top-level component symbol with its name caption – essentially a sticker sheet. Possibly group by category if component naming has prefixes.
- Export options: Allow the generated guide page to be exported as PDF or image directly (using Figma’s built-in export of that page, user can do it, or maybe automate a PDF export of all frames in the page).
- Update sync: If styles change or new ones added, re-run plugin can update the style guide page rather than making a new one (maybe by updating existing nodes to avoid duplicate pages).

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
