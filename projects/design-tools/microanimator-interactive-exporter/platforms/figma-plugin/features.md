# MicroAnimator (Interactive Exporter) - Figma Plugin Features

## Core Features
- Frame sequence to GIF: Take a series of frames (or variants) and export as an animated GIF or MP4 video. Options for frame duration and looping.
- Smart Animate capture: If user has set up a prototype between two frames with Smart Animate, the plugin can tween between them and record that animation (this might involve rapidly changing properties via API and capturing – experimental but powerful).
- Lottie JSON (Pro): Export simple vector animations to Lottie (e.g. shape position, scale, opacity changes) for use in apps. Possibly limited to animations created in a special way (like via an integrated timeline UI in the plugin for supported properties).
- Controls: Basic timeline UI to adjust easing, delays between frames, and preview the animation inside Figma before export.
- Templates: A small library of pre-made micro-interactions (like a bouncing loader, a fade-in effect) that users can apply to their layers as a starting point.

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
