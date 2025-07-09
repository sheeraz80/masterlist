# Meeting Prep Assistant

## Overview
**Problem Statement:** Professionals have back-to-back meetings and often don't have time to prepare. They need a quick way to get context on the people they are about to meet.

**Solution:** An extension that integrates with Google Calendar. When viewing a calendar event, it adds a "Prep" button. Clicking it opens a sidebar that automatically pulls in the LinkedIn profiles, recent tweets, and company news for all external attendees.

**Target Users:** Salespeople, account managers, executives, and anyone who has frequent meetings with external parties.

## Quality Score
**Overall Score:** 7.4/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 10/10
- **Technical Feasibility:** 5/10
- **Market Opportunity:** 6/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Chrome Extension](./platforms/chrome-extension/)

## Revenue Model
Subscription.

## Revenue Potential
Conservative: $1,500/mo; Realistic: $12,000/mo; Optimistic: $45,000/mo.

## Development Time
6-7 days.

## Technical Complexity
6/10. Requires Google Calendar API access to read event details and attendee lists. It then needs to scrape or use APIs for LinkedIn, Twitter, and a news service (e.g., Google News) to find information about the attendees. Scraping LinkedIn is notoriously difficult and against their ToS, so using a legitimate data provider API is a safer but more expensive route.

## Competition Level
Medium. Some sales engagement platforms offer similar features, but a lightweight, calendar-focused tool has a strong niche.

## Key Features
- Google Calendar Integration: Adds a "Prep" button directly to Google Calendar events.
- Automated Attendee Research: Automatically identifies external attendees and finds their professional and social profiles.
- Contextual Sidebar: Displays a clean summary of each attendee's information without leaving the calendar.
- Company Insights: Pulls in recent news and funding announcements for the attendee's company.
- Customizable Data Sources: Users can choose which sources to pull information from.

## Success Indicators
MRR, number of active subscribers, and testimonials from users about improved meeting preparedness.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
