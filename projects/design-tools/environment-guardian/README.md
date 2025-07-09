# Environment Guardian

## Overview
**Problem Statement:** Managing environment variables (.env files) across different environments (development, staging, production) is messy and error-prone. Developers often accidentally commit sensitive keys to Git, a major security risk.

**Solution:** A dedicated UI within VSCode for managing multiple .env files. It provides a table view of all variables, allows for easy switching between environments, and includes a pre-commit hook to prevent accidental commits of .env files.

**Target Users:** Web developers, DevOps teams, and anyone working with applications that require environment-specific configurations.

## Quality Score
**Overall Score:** 7.2/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 6/10
- **Technical Feasibility:** 7/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Vscode Extension](./platforms/vscode-extension/)

## Revenue Model
One-Time Purchase.

## Revenue Potential
Conservative: $600/mo; Realistic: $2,500/mo; Optimistic: $7,000/mo.

## Development Time
4-5 days.

## Technical Complexity
4/10. The core functionality involves reading and parsing .env files and displaying them in a webview-based UI. The pre-commit hook can be implemented by creating or modifying a local Git hook file (.git/hooks/pre-commit). All data remains local to the user's machine.

## Competition Level
Low. While some extensions provide syntax highlighting for .env files, a dedicated management tool with a focus on security and multi-environment workflows is a clear gap in the market.

## Key Features
- Unified UI: View and manage variables from multiple .env files (e.g., ., .) in one table.
- Environment Switcher: A dropdown to quickly switch which .env file is active (e.g., by renaming it to .env).
- Schema Sync: A feature to compare the keys across different .env files and highlight any that are missing.
- Secret Leak Prevention: Automatically checks for .env files in the staging area before a commit and warns the user.
- Value Masking: Option to hide the values of secrets in the UI to prevent shoulder-surfing.

## Success Indicators
Total sales volume, high ratings in the marketplace, and reviews focusing on its security benefits.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
