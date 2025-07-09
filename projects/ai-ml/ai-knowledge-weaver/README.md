# AI Knowledge Weaver

## Overview
**Problem Statement:** As an Obsidian vault grows, discovering non-obvious connections between notes becomes increasingly difficult. The graph view shows explicit links, but conceptual or thematic relationships remain hidden, limiting the potential for serendipitous discovery and creative insight.

**Solution:** An AI-powered plugin that periodically scans the vault, creating vector embeddings for each note and identifying the top 5 "unlinked but related" notes in the sidebar for any active note, sparking new connections.

**Target Users:** Long-term Obsidian users, researchers, writers, and Zettelkasten enthusiasts.

## Quality Score
**Overall Score:** 6.9/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 8/10
- **Technical Feasibility:** 5/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Obsidian Plugin](./platforms/obsidian-plugin/)

## Revenue Model
Freemium Subscription.

## Revenue Potential
Conservative: $800/mo; Realistic: $7,000/mo; Optimistic: $25,000/mo.

## Development Time
6-7 days.

## Technical Complexity
6/10. The core logic involves using a JavaScript library to generate text embeddings. For the free tier, this could use a small, local model. For the pro tier, it would call an external API like OpenAI or Cohere (with the user's own API key) for higher-quality embeddings. The results are stored locally.

## Competition Level
Medium. Plugins like Smart Connections and Copilot offer AI chat and linking features. The unique value here is a passive, always-on "serendipity panel" that requires no active querying, and a focus on local-first processing where possible.

## Key Features
- Automatic Note Scanning: Scans and creates embeddings for notes in the background.
- Related Notes Panel: A sidebar panel that dynamically updates to show conceptually related notes for the currently active note.
- Connection Strength Indicator: A visual score (e.g., 1-5 stars) indicating how closely related the suggested notes are.
- Graph View Integration (Pro): A premium feature to overlay these "conceptual links" as dotted lines on the main graph view, revealing a hidden layer of connections.
- Local-First AI Option: Ability to use a less powerful but completely private, on-device model for generating embeddings.

## Success Indicators
MRR, number of Pro subscribers, and user testimonials about the novel insights the plugin helped them discover.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
