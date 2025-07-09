# Localization Text Swapper

## Overview
**Problem Statement:** Designing for multilingual applications requires managing and previewing text in various languages. Manually copying and pasting translations from spreadsheets into Figma is error-prone and doesn't account for text expansion or contraction, which can break layouts.

**Solution:** A plugin that connects to a Google Sheet or CSV file containing translation strings and allows the designer to instantly swap the text content of an entire design to a different language.

**Target Users:** Designers working on global products, localization teams, and agencies with international clients.

## Quality Score
**Overall Score:** 7.0/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 6/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
One-Time Purchase.

## Revenue Potential
Conservative: $700/mo; Realistic: $3,500/mo; Optimistic: $9,000/mo.

## Development Time
5-6 days.

## Technical Complexity
5/10. Requires integrating with the Google Sheets API or using a client-side CSV parsing library. The core logic involves mapping a "key" column in the spreadsheet to layer names in Figma (e.g., a layer named maps to a row with that key) and then swapping the text based on the selected language column.

## Competition Level
Low. This is a specific utility that solves a major pain point in the localization workflow. While Google Sheets Sync exists, it's generic; this tool would be purpose-built for the localization use case.

## Key Features
- Data Source Connection: Connect to a public Google Sheet URL or upload a CSV file.
- Language Switcher: A simple dropdown in the plugin UI to select the target language (based on the columns in the spreadsheet).
- Key-Based Mapping: Automatically finds text layers named with a specific prefix (e.g., loc_) and matches them to keys in the spreadsheet.
- Layout Breakage Warnings: A feature that flags text layers where the new text content is significantly longer than the original, potentially breaking the UI.
- Pseudo-Localization: A utility to automatically generate "pseudo-localized" text (e.g., "Account Settings" becomes "[!!! Àççôûñţ Šéţţîñĝš!!!]") to test for layout issues before actual translations are ready.

## Success Indicators
Total sales, adoption by design teams at global companies, and positive reviews from localization managers.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
