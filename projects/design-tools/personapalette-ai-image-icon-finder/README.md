# PersonaPalette (AI Image & Icon Finder)

## Overview
**Problem Statement:** Designers frequently need to insert placeholder images (like user avatars, product photos) or icons during design. Searching for these assets outside Figma (stock sites or Google) interrupts workflow. While some plugins provide stock photos (Unsplash) or icons, they may not cover all needs or use AI to generate unique images. There’s an opportunity for a comprehensive, smart asset inserter.

**Solution:** A plugin that combines an image finder/generator and an icon search in one. It lets you search a keyword (e.g. “smiling businesswoman” or “secure icon”) and either fetches a free stock image (from Unsplash/Pexels API) or generates one via an AI image API if something specific is needed. For icons, it can search icon libraries (like FontAwesome or iconify). The user can then insert the chosen asset directly into Figma in the selected shape or as a new layer. This saves time jumping between websites.

**Target Users:** UI and marketing designers who frequently need visual assets. Especially useful for wireframing (quickly grabbing placeholders) and early-stage design where final assets aren’t ready. Also for hackathon designers needing quick visuals.

## Quality Score
**Overall Score:** 5.9/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 5/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium. Free tier provides access to basic libraries (Unsplash, a limited icon set). Pro tier ($5-10/month) adds AI generation (which covers our API cost) and premium icon sets or the ability to auto-styling icons to match design (if we implement that). Alternatively, could monetize via affiliate or API deals, but subscription is cleaner if value is there.

## Revenue Potential
Conservative: $400/month; Realistic: $1,500/month; Optimistic: $5,000/month. Asset plugins can have broad appeal (lots of Figma users). The challenge is many free options exist (Unsplash plugin is free). Our unique offering is AI generation and convenience of one tool for multiple asset types. If executed well, a subset of users will pay for the convenience/AI features – optimistic scenario if maybe 500-1000 users pay monthly globally.

## Development Time
~7 days. Integrating with Unsplash API (straightforward), iconify API for icons (straightforward), and an AI image API like DALL-E or Stable Diffusion via a free tier or requiring user’s API key. Without running our server, we can call something like Stability AI’s endpoint (user would need their API key or use a limited free key we bundle). The plugin UI for search and results needs to be smooth (thumbnail gallery, etc.). With modern web tech and maybe some caching in plugin, doable.

## Technical Complexity
6/10 – The search and API calls are fine. The hardest part is dealing with the results display in plugin UI and inserting assets efficiently. Also, handling AI generation: dealing with latency (show a loading indicator while image generates), possibly errors if inappropriate or if it fails. Also ensuring we abide by usage rights – Unsplash is free for commercial, icons depend on source (we’d pick open license libraries). AI images – need to clarify they are AI generated (some policies might require it). So complexity lies partly in UX and partly in ethical considerations.

## Competition Level
Medium-High for stock photos (existing free plugins for Unsplash). For icons too (several icon plugins exist). AI generation in Figma is newer – a couple plugins do it (e.g. “Magician” plugin by diagram has AI image generation and text, but it’s a broader AI assistant). Our competition is stiff unless we differentiate on combining these and perhaps providing better search or slight editing (like choose color for icons). But being a one-stop “find any visual” could carve a niche. Many users currently juggle multiple plugins for this (one for photos, one for icons, etc.).

## Key Features
- Unified search bar: Enter a term, choose filter (Photos, Icons, or AI Generate).
- Stock photo integration: Fetch results from Unsplash/Pexels with thumbnails; clicking one inserts the image at either a preset size or into a selected shape’s fill.
- Icon search: Search across libraries (e.g. Material Icons, FontAwesome) and get SVG icons inserted as vector shapes (preserving editability). Possibly allow coloring the icon upon insert to match a selected color.
- AI image generation (Pro): Input a prompt, choose a style or aspect ratio, get an AI-generated image and insert. Provide a few variations if possible. Limit usage per day unless subscribed to manage cost.
- Favorites/History: Option to save frequently used assets or see recent searches for convenience.

## Success Indicators
Number of searches performed (active usage metric); conversion rate to Pro for those using the AI feature; retention of Pro subscribers (if they keep using monthly, means sustained value); user feedback like “this replaced three separate plugins for me” or how much time saved not switching out to browser for assets. If we see a strong community adoption (maybe trending on Figma community or recommended by educators), that’s a good sign.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
