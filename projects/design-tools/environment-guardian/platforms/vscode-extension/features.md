# Environment Guardian - Vscode Extension Features

## Core Features
- Unified UI: View and manage variables from multiple .env files (e.g., ., .) in one table.
- Environment Switcher: A dropdown to quickly switch which .env file is active (e.g., by renaming it to .env).
- Schema Sync: A feature to compare the keys across different .env files and highlight any that are missing.
- Secret Leak Prevention: Automatically checks for .env files in the staging area before a commit and warns the user.
- Value Masking: Option to hide the values of secrets in the UI to prevent shoulder-surfing.

## Platform-Specific Capabilities
This implementation leverages the unique capabilities of the Vscode Extension platform:

### API Integration
- Access to platform-specific APIs
- Native integration with platform ecosystem

### User Experience
- Follows platform design guidelines
- Optimized for platform-specific workflows

### Performance
- Optimized for platform performance characteristics
- Efficient resource utilization
