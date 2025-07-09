# Email Template Manager for Gmail

## Overview
**Problem Statement:** Salespeople, customer support agents, and managers send a lot of repetitive emails. Using Gmail's native template feature is clunky, and constantly copying and pasting from a separate document is inefficient.

**Solution:** A lightweight extension that integrates seamlessly into the Gmail compose window, providing a quick-access menu to insert pre-written templates, complete with dynamic placeholders.

**Target Users:** Sales teams, customer support, recruiters, and anyone who sends repetitive emails.

## Quality Score
**Overall Score:** 7.2/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 10/10
- **Technical Feasibility:** 6/10
- **Market Opportunity:** 4/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Chrome Extension](./platforms/chrome-extension/)

## Revenue Model
Freemium (Team-based subscription).

## Revenue Potential
Conservative: $1,200/mo; Realistic: $10,000/mo; Optimistic: $40,000/mo.

## Development Time
5-6 days.

## Technical Complexity
5/10. Uses content scripts to inject a new button and menu into the Gmail UI. Templates are stored locally or synced via a minimal backend for teams. The core logic involves inserting HTML into the Gmail compose body.

## Competition Level
High. This is a very competitive space with many CRM-lite extensions. The key to success is simplicity, a focus on doing one thing well (templates), and an affordable, team-friendly price.

## Key Features
- Quick-Access Menu: A button in the compose window opens a searchable list of your saved templates.
- Dynamic Placeholders: Use placeholders like {firstName} or {companyName} that prompt you to fill in the details when a template is inserted.
- Shared Team Library (Pro): Teams can create and share a central library of templates to ensure brand consistency and share best practices.
- Usage Analytics (Pro): Track which templates are used most often and (optionally) track open/reply rates.
- Simple Template Editor: A clean interface for creating and organizing templates without leaving Gmail.

## Success Indicators
MRR, number of active teams, and testimonials from teams about time saved and improved email consistency.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
