# Figma2Notion (Design-to-Docs) - Market Analysis

## Market Overview

### Problem Size
Teams often document their designs in Notion or Confluence – including screenshots of designs with descriptions. Currently, designers manually export images and paste them into docs, then write descriptions. This is laborious and keeping the documentation updated as designs change is difficult (often docs become stale).

### Target Market
Product teams and UX designers who maintain design documentation or style guides in Notion/Confluence. Also developers or stakeholders who prefer reading specs in Notion – this helps designers get content there easily.

## Competition Analysis

### Competition Level
**Rating:** Low – There’s not much in terms of direct Figma-to-Notion integration. Some manual or third-party scripts exist, and Notion has Figma embed, but that’s static (or live embed that always shows current frame but not suitable for documentation context with multiple images). We’d be pretty unique in automating documentation. A similar concept is “Zoo for Confluence” which exports from design to docs, but for Figma specifically it’s rare.

### Competitive Landscape
Low – There’s not much in terms of direct Figma-to-Notion integration. Some manual or third-party scripts exist, and Notion has Figma embed, but that’s static (or live embed that always shows current frame but not suitable for documentation context with multiple images). We’d be pretty unique in automating documentation. A similar concept is “Zoo for Confluence” which exports from design to docs, but for Figma specifically it’s rare.

## Revenue Analysis

### Revenue Model
Subscription or one-time (depending on complexity). Possibly subscription for teams (since this ties into workflow) – e.g. $10/month for a team license to use the plugin, especially if they use it continuously. Alternatively, a one-time $20 if it’s simpler. Given it might need maintenance to adapt to Notion API changes, a subscription could make sense. We can start with one-time and shift if usage is heavy.

### Revenue Potential
Conservative: $300/month; Realistic: $1,000/month; Optimistic: $3,000/month. Many teams document in Notion nowadays; if even a small fraction adopt this to streamline their process, it’s viable. Optimistic if we attract some larger org teams who buy multiple licenses or encourage it org-wide.

### Revenue Breakdown
- **Conservative:** 300/month
- **Realistic:** 1,000/month
- **Optimistic:** 3,000/month

### Monetization Strategy
Pitch to product teams as a way to ensure design documentation is always up-to-date with minimal effort – bridging designers and knowledge base. Perhaps target design ops or managers on LinkedIn with a demonstration (they love efficiency tools). Provide excellent support/documentation for setting up the Notion integration (since non-technical designers might need guidance to get an API token and page ID). The plugin could have a free trial that maybe limits number of frames or only text export, to show value before purchase. Once integrated in a team’s workflow, likely to stick (high retention if initial adoption).

## Risk Assessment

### Overall Risk
Integration risk: Notion API or Confluence API might change or have limitations (like rate limits, or not allowing direct image embedding easily). We mitigate by thorough testing and maybe creative solutions (like uploading images to a free cloud storage – perhaps using GitHub or Imgur via their open API – careful with terms though). The absence of a server is a constraint; we might eventually need a lightweight backend to host images if absolutely required, but that violates the zero-server rule. Possibly acceptable if using a third-party like Imgur which is not our server. Security: Handling tokens – ensure we never send them externally except to the target API. If a breach, user’s Notion data could be at risk – highlight that tokens are stored only locally and used only for API calls. Adoption: Some teams might be okay with manual docs or not trust an automated tool – need to educate on benefits and reliability. Show that it reduces stale info issues, which have real costs. Platform: Figma and Notion are separate; a risk is if Notion’s API doesn’t support something essential (like images), which we have to work around.

### Key Risks
- Platform dependency risk
- Competition risk
- Technical implementation risk
- Market adoption risk
- Revenue sustainability risk

### Mitigation Strategies
- Diversify across multiple platforms
- Focus on unique value proposition
- Maintain technical excellence
- Build strong user community
- Develop sustainable revenue streams

## Market Opportunity

### Total Addressable Market (TAM)
- Platform user base size
- Market segment size
- Growth potential

### Serviceable Addressable Market (SAM)
- Targetable user subset
- Geographic limitations
- Platform-specific constraints

### Serviceable Obtainable Market (SOM)
- Realistic market capture
- Competitive positioning
- Resource limitations

## Success Indicators
Successful creation of docs (maybe count how many pages created or updated); feedback from teams that their documentation process sped up (e.g. less time spent updating images in Notion each design iteration); number of active team subscriptions if we go that route; and expanded usage (e.g. if those teams request new features like including metadata, indicating deep adoption). In the long run, if our tool became a standard for connecting design and documentation, that’s a win.
