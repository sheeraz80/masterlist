# Prettier Playground

## Overview
**Problem Statement:** Teams using Prettier often debate the optimal configuration settings (printWidth, tabWidth, etc.). Testing out different configurations requires editing the .prettierrc file and re-saving files, which is a slow feedback loop.

**Solution:** An interactive "playground" panel in VSCode that lets you paste in code, tweak Prettier's configuration options with sliders and dropdowns, and see the formatted output in real-time.

**Target Users:** Development teams, open-source maintainers, and anyone setting up a new project's code style.

## Quality Score
**Overall Score:** 5.9/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 0/10
- **Technical Feasibility:** 8/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Vscode Extension](./platforms/vscode-extension/)

## Revenue Model
Free (as a lead magnet or reputation builder).

## Revenue Potential
N/A.

## Development Time
3-4 days.

## Technical Complexity
3/10. The extension would use the Prettier JavaScript API in a webview. The UI would consist of controls for the various Prettier options and text areas for the input and output code.

## Competition Level
Low. The official Prettier website has a playground, but having it integrated directly into VSCode where the configuration actually matters is a much better workflow.

## Key Features
- Real-Time Formatting: See the code format itself instantly as you adjust configuration options.
- All Prettier Options: UI controls for all of Prettier's main configuration options.
- Copy Configuration: A button to copy the final configuration as a JSON object, ready to be pasted into a .prettierrc file.
- Side-by-Side Diff: A view that highlights the specific changes the new configuration made.

## Success Indicators
Number of installs, positive reviews, and mentions in blogs about setting up project code styles.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
