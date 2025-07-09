# CopySync (Figma Text Sync)

## Overview
**Problem Statement:** Keeping design content in sync with copy documents is a pain. Designers often copy-paste updated text from Google Docs or spreadsheets into Figma manually, leading to version mismatches. This is inefficient and error-prone, especially for teams working with content writers.

**Solution:** A plugin that links text nodes in Figma to an external content source (like a Google Sheet, CSV, or JSON file). With one click, a designer can import or refresh all the copy in their designs from the source, ensuring the latest content is reflected. It also allows exporting text from Figma to a sheet for copywriters to edit, enabling a round-trip workflow without any server (using Google’s API directly from the plugin or manual file import/export).

**Target Users:** Product designers, UX writers, and design teams that iterate on content frequently – for example, teams localizing apps to many languages or marketing teams updating landing page copy.

## Quality Score
**Overall Score:** 6.1/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium. Free version allows linking to one Google Sheet and manual syncing. Pro ($8/month per user or $20/month per team for multiple users) unlocks multiple sources, auto-sync scheduling, and support for multiple formats (CSV, JSON, maybe Notion integration) with encryption for API keys if needed.

## Revenue Potential
Conservative: ~$400/month; Realistic: ~$1,500/month; Optimistic: ~$5,000/month. Many small teams could find value in this; even 200 paying users globally at $8 each yields $1.6k. Optimistic if it becomes a standard tool in larger orgs’ workflow (with team plans).

## Development Time
~7 days. Google Sheets API integration is straightforward (HTTP calls from the plugin context; user will input a share link or API key). The challenging part is mapping text nodes to sheet cells – we can use unique identifiers in layer names to link to keys. AI assistance can help expedite parsing and mapping logic.

## Technical Complexity
5/10 – Handling external API from within Figma (Google Sheets API or others) and ensuring no server needed (users may have to provide an API key or use public share links). Google’s API usage might need OAuth – which is tricky without a backend, but we can use the simpler approach: require the sheet to be published or use an API key restricted to that sheet. Alternatively, let users upload a CSV. The two-way sync (export text) involves iterating Figma nodes and generating CSV. All doable in plugin environment.

## Competition Level
Medium – There’s an official Google Sheets sync Figma plugin (from Figma/Google) that fills content from sheets. However, its functionality is somewhat basic. Our advantage can be two-way sync and more formats. Also, other plugins like “Content Reel” provide sample data but not real content sync. So while the concept exists, there’s room for a more powerful tool, but we must outshine existing free solutions on features to convince users to pay.

## Key Features
- Sheet-to-Figma import: Map text objects to spreadsheet cells by ID or position and update all at once (e.g. update all UX copy in a design with latest from a content doc)
- Figma-to-sheet export: Pull all text from selected frames or whole file into a CSV/Google Sheet (with identifiers), enabling copywriters to edit in a familiar environment
- Two-way sync: Preserve the mapping so that after writers edit and you refresh in Figma, text goes to the right place
- Multi-source support (Pro): Link different frames to different sheets or JSON endpoints (for apps with multiple content sources or multi-language support)
- Diff preview: Before applying updates, show what text will change (old vs new) so designers can review large content changes safely

## Success Indicators
Number of documents synced and text fields updated (the volume of content handled through the plugin); retention of users over multiple projects (showing they rely on it for workflow); feedback from teams about reduction in copy-related errors; support inquiries from larger teams (which may indicate interest beyond individual users); and conversion rate to Pro for those who try free (a sign the extra features are valued).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
