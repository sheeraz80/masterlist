# Figma2Notion (Design-to-Docs)

## Overview
**Problem Statement:** Teams often document their designs in Notion or Confluence – including screenshots of designs with descriptions. Currently, designers manually export images and paste them into docs, then write descriptions. This is laborious and keeping the documentation updated as designs change is difficult (often docs become stale).

**Solution:** A plugin that automates pushing Figma frames into Notion pages (or Confluence, as a stretch). The user could select frames and the plugin will generate a Notion page with those design images and optionally some metadata (like frame name, last updated). It could also allow updating an existing Notion doc when the design updates by replacing the images. Essentially a bridge between Figma and documentation, zero server by leveraging Notion’s public API via client calls.

**Target Users:** Product teams and UX designers who maintain design documentation or style guides in Notion/Confluence. Also developers or stakeholders who prefer reading specs in Notion – this helps designers get content there easily.

## Quality Score
**Overall Score:** 6.5/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Subscription or one-time (depending on complexity). Possibly subscription for teams (since this ties into workflow) – e.g. $10/month for a team license to use the plugin, especially if they use it continuously. Alternatively, a one-time $20 if it’s simpler. Given it might need maintenance to adapt to Notion API changes, a subscription could make sense. We can start with one-time and shift if usage is heavy.

## Revenue Potential
Conservative: $300/month; Realistic: $1,000/month; Optimistic: $3,000/month. Many teams document in Notion nowadays; if even a small fraction adopt this to streamline their process, it’s viable. Optimistic if we attract some larger org teams who buy multiple licenses or encourage it org-wide.

## Development Time
~7 days. Capturing frame as image: Figma plugin can export frames as data (via exportAsync to PNG). Then Notion API calls to create a page and upload images – Notion’s API requires authentication (user will provide a token or use an integration token). The plugin can make HTTP calls directly (should be possible). Confluence integration would be more complex and might need skipping or later addition. AI not needed; straightforward data formatting.

## Technical Complexity
5/10 – Dealing with the Notion API (auth flow and formatting content in their JSON structure) is a bit of work, but the scope is limited: just placing images and text. Possibly have to host images? Notion API might require an image URL; if so, we might have to upload images to a storage (this would break zero-server if we need our own storage). However, we can possibly use Notion’s ability to encode images from URLs: maybe we upload to an anonymous image host (not ideal) or use base64 (if Notion supports). Alternatively, instruct user to copy/paste if needed. If Confluence, their API might allow attachments upload. So complexity revolves around file upload without our server. Perhaps we leverage GitHub Gist or data URI (Notion might not accept data URI for images). This needs careful approach to remain serverless. Maybe we push the burden: e.g. open a browser tab with all images and user saves them to Notion – not elegant. Perhaps limit MVP to generating text content with frame names and a link to Figma prototypes (which can be embedded by link in Notion), if file upload is a problem. In any case, core complexity is medium.

## Competition Level
Low – There’s not much in terms of direct Figma-to-Notion integration. Some manual or third-party scripts exist, and Notion has Figma embed, but that’s static (or live embed that always shows current frame but not suitable for documentation context with multiple images). We’d be pretty unique in automating documentation. A similar concept is “Zoo for Confluence” which exports from design to docs, but for Figma specifically it’s rare.

## Key Features
- Notion page generation: User selects frames, enters a Notion page ID or chooses to create new. The plugin exports each frame image and populates a nicely formatted Notion page (e.g. header = project name, then sections with image and frame name as subheader, and description placeholder).
- Update sync: Ability to update the Notion page later – e.g. if design changes, run plugin again and it will update the images on the existing page rather than duplicating (requires storing the mapping of frames to Notion blocks, which we can via the Notion block IDs saved in plugin data).
- Metadata capture: Include data like frame link (with a “Open in Figma” button), last updated timestamp, etc., so documentation stays contextual.
- Confluence support (maybe Pro): If feasible, allow similar export to Confluence Cloud via their API, since many enterprises use that. Could be a selling point.
- Authentication management: UI to input and securely store Notion integration token (in plugin settings, stored locally or in file data but encrypted perhaps).

## Success Indicators
Successful creation of docs (maybe count how many pages created or updated); feedback from teams that their documentation process sped up (e.g. less time spent updating images in Notion each design iteration); number of active team subscriptions if we go that route; and expanded usage (e.g. if those teams request new features like including metadata, indicating deep adoption). In the long run, if our tool became a standard for connecting design and documentation, that’s a win.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
