# LayoutPlanner (Grid & Guide Assistant) - Figma Plugin Features

## Core Features
- Grid template presets: Predefined common grids (Bootstrap 12-col, 8px baseline grid, etc.) and the ability to custom define columns, gutter, margins.
- Apply to multiple frames: Select multiple artboards/frames and apply the grid in one go (ensuring every screen uses identical columns, which Figma doesn’t auto-sync if you create new frames).
- Global guide lines: Option to draw actual guide lines on a separate layer that span across frames (useful in a flow presentation context or when layout grids aren’t visible to viewers in prototype mode).
- Alignment checker: Scan selected frames for elements that are not aligned to the set grid (either vertically to baseline or horizontally to columns). Flag those elements (maybe by temporarily highlighting in red or listing them). This serves as a lint for layout consistency.
- Guide manager: If using drawn guides, ability to remove or adjust them easily via the plugin interface.

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
