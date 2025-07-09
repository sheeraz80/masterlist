# Localization Text Swapper - Figma Plugin Features

## Core Features
- Data Source Connection: Connect to a public Google Sheet URL or upload a CSV file.
- Language Switcher: A simple dropdown in the plugin UI to select the target language (based on the columns in the spreadsheet).
- Key-Based Mapping: Automatically finds text layers named with a specific prefix (e.g., loc_) and matches them to keys in the spreadsheet.
- Layout Breakage Warnings: A feature that flags text layers where the new text content is significantly longer than the original, potentially breaking the UI.
- Pseudo-Localization: A utility to automatically generate "pseudo-localized" text (e.g., "Account Settings" becomes "[!!! Àççôûñţ Šéţţîñĝš!!!]") to test for layout issues before actual translations are ready.

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
