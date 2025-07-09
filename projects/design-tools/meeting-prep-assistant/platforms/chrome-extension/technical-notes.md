# Meeting Prep Assistant - Chrome Extension Technical Notes

## Technical Complexity
**Rating:** 6/10. Requires Google Calendar API access to read event details and attendee lists. It then needs to scrape or use APIs for LinkedIn, Twitter, and a news service (e.g., Google News) to find information about the attendees. Scraping LinkedIn is notoriously difficult and against their ToS, so using a legitimate data provider API is a safer but more expensive route.

## Development Time
**Estimated:** 6-7 days.

## Platform-Specific Technical Details
An extension that integrates with Google Calendar. When viewing a calendar event, it adds a "Prep" button. Clicking it opens a sidebar that automatically pulls in the LinkedIn profiles, recent tweets, and company news for all external attendees.

## Technical Requirements

### Platform Constraints
- Must follow Chrome Extension Manifest V3
- Limited by Chrome security policies
- Content script limitations
- Background service worker constraints

### Platform Opportunities
- Rich ecosystem integration
- Large user base
- Established distribution channels
- Platform-specific APIs and capabilities

## Implementation Notes
- Follow platform best practices
- Optimize for platform performance
- Ensure compatibility with platform updates
- Implement proper error handling
