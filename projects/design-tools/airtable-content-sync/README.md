# Airtable Content Sync

## Overview
**Problem Statement:** Design teams often use Airtable as a single source of truth for content like user testimonials, product features, or blog post data. Manually copying this content into Figma mockups is inefficient and leads to data becoming stale when the Airtable base is updated.

**Solution:** A plugin that creates a live, two-way sync between an Airtable base and Figma components, allowing designers to populate and update designs with real data effortlessly.

**Target Users:** Product design teams, marketing teams, and content strategists who use both Airtable and Figma.

## Quality Score
**Overall Score:** 7.3/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 8/10
- **Technical Feasibility:** 5/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Subscription.

## Revenue Potential
Conservative: $1,000/mo; Realistic: $9,000/mo; Optimistic: $40,000/mo.

## Development Time
6-7 days.

## Technical Complexity
6/10. Requires integration with the Airtable API for authentication (user provides their own API key) and data fetching. The core challenge is building an intuitive UI for mapping Airtable fields (e.g., "Name", "Profile Picture URL") to specific layers within a Figma component (e.g., a text layer named #Name, an image layer named #Avatar). All logic runs client-side.

## Competition Level
Low. While generic data plugins like Content Reel exist, a dedicated, deep integration with a popular platform like Airtable is a much stronger value proposition.

## Key Features
- Airtable Integration: Securely connect to a user's Airtable account using their API key (stored locally in clientStorage).
- Component Mapping: An intuitive interface to map Airtable base columns to layers within a selected Figma component.
- One-Click Populate: Select a component and an Airtable record to instantly populate the design with that record's data.
- Bulk Populate: Populate a grid of components from multiple Airtable records at once.
- Live Refresh: A "Sync with Airtable" button that updates all populated components with the latest data from the base.

## Success Indicators
MRR, number of active users, and the number of components synced daily.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
