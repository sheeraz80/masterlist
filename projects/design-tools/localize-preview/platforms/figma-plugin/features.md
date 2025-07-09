# Localize Preview - Figma Plugin Features

## Core Features
- Language selection: Choose from common target locales (French, German, Spanish, Chinese, Arabic, etc.). On selection, plugin replaces all visible text with translated text in that language (via API or pre-stored common translations for certain words if not using API).
- Pseudo-expand: Option to use pseudo-localization (e.g. “Login” -> “Łőğīņņ [!!!!!!]”) which both makes it longer and adds odd characters to reveal encoding issues. This usually expands by ~30%. Useful for any language expansion test without actual translation.
- RTL mode: If Arabic/Hebrew selected, plugin can set text alignment in those text nodes to right (to simulate RTL reading) and maybe reverse their order in container frames if applicable. At least highlight that this is an RTL layout scenario for designer to consider adjustments.
- Per-frame vs global: Option to localize the whole page or just selected frame(s), so the designer can e.g. duplicate a screen and localize the copy for comparison side-by-side.
- Restore text: A “Reset to original language” button that puts everything back exactly as it was (we’ll store original text content mapping when first run so it can revert). Undo stack might also handle it, but better to explicitly offer restore in case multiple operations done.

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
