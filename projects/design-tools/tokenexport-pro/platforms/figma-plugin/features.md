# TokenExport Pro - Figma Plugin Features

## Core Features
- Multi-format export: Support CSS/SCSS variables, JSON design tokens, JavaScript object, Swift/Android resource files. The user picks their stack and gets a ready-to-use snippet.
- Batch icon export: Option to export all SVG icons from components named a certain way (e.g. all components in an “Icons” frame) into an icon font or SVG sprite directory.
- Name transformation: Automatically convert Figma style names (which might have spaces or slashes) into code-friendly constants (uppercase snake case, camelCase, etc. configurable).
- Style updates sync: Save configurations so that next time, running the plugin only shows changes or can update an existing tokens file with new values (highlighting what changed so devs know to update thos
- 
- 】).
- Documentation stub: Optionally generate a simple markdown or HTML style guide listing tokens and their values (useful for design docs or developer handoff docs).

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
