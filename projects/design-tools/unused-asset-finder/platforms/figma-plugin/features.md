# Unused Asset Finder - Figma Plugin Features

## Core Features
- Unused style list: Show all color styles, text styles, and effect styles that no layer currently uses.
- Unused components: List components and symbols that have zero instances in the file (and optionally across files if the library usage API allows – but likely just local).
- Hidden/layer clean-up: Optionally, list layers that are hidden or outside the canvas bounds (could indicate forgotten elements), particularly large images that increase file size without being visible.
- One-click clean (Pro): Remove all unused styles from the file, and detach or delete unused components (maybe move them to an archive page first for safety). For layers, offer to bulk delete hidden/off-canvas layers.
- Report: Summary like “Removed 5 unused color styles, 3 components” so user sees the impact. Possibly an estimate of size reduction if relevant.

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
