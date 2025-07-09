# ContrastMaster - Figma Plugin Features

## Core Features
- One-click scan: Scans all visible text layers on all frames/pages and identifies any that don’t meet AA contrast guidelines
- Detailed report: List of failing elements with their contrast ratio and the required ratio (e.g. “3.5:1 – fails AA (needs 4.5:1)”)
- Suggested fixes: If possible, suggest a darker or lighter variant of the color from the document’s styles that would pass, or highlight the closest passing color (this can be a manual adjustment aid)
- Live monitoring (Pro): Option to turn on a mode where new text layers or color changes get evaluated in real-time and flagged immediately if below contrast threshold
- Export/Share report: Generate a summary that can be shared with developers or in design reviews to prove accessibility checks (could be a simple markdown or PDF output listing issues)

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
