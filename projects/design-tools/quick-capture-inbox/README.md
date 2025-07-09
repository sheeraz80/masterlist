# Quick Capture Inbox

## Overview
**Problem Statement:** A core principle of many productivity systems is to have a single, frictionless "inbox" to capture ideas before they're lost. While Obsidian can be this inbox, quickly adding a thought often requires finding the right note or opening the app, which adds friction.

**Solution:** A plugin that provides a global hotkey to open a "Quick Capture" window from anywhere on your computer. You can type a quick note, and it will be instantly appended to your daily note or a designated "Inbox" note in Obsidian.

**Target Users:** All Obsidian users, especially those following productivity systems like GTD.

## Quality Score
**Overall Score:** 5.5/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 0/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Obsidian Plugin](./platforms/obsidian-plugin/)

## Revenue Model
Free (Donation-based).

## Revenue Potential
N/A.

## Development Time
4-5 days.

## Technical Complexity
5/10. This requires a small, lightweight helper application that runs in the system tray to register the global hotkey. The helper app then communicates with the Obsidian plugin to add the note.

## Competition Level
Low. This is a common feature in other note-taking apps but is missing from Obsidian. It solves a fundamental workflow problem.

## Key Features
- Global Hotkey: Open the Quick Capture window from any application.
- Instant Capture: Type your note and hit enter to save it to your Obsidian vault.
- Configurable Destination: Choose whether to append to your daily note or a specific "" file.
- Minimalist UI: The capture window is simple, fast, and unobtrusive.

## Success Indicators
Number of downloads and becoming a "must-have" plugin for all serious Obsidian users.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
