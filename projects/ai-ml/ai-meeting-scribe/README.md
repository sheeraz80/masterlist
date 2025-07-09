# AI Meeting Scribe

## Overview
**Problem Statement:** Professionals in back-to-back online meetings struggle to pay attention, take detailed notes, and identify action items simultaneously. Post-meeting, it's time-consuming to review recordings to create summaries and follow-ups.

**Solution:** A browser extension that joins your Google Meet or Zoom calls, provides real-time transcription, and automatically generates a concise summary, a list of action items, and key decisions after the meeting ends.

**Target Users:** Project managers, consultants, sales teams, and anyone who spends a significant amount of time in virtual meetings.

## Quality Score
**Overall Score:** 6.8/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 10/10
- **Technical Feasibility:** 4/10
- **Market Opportunity:** 4/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Ai Browser Tools](./platforms/ai-browser-tools/)

## Revenue Model
Subscription.

## Revenue Potential
Conservative: $1,000/mo; Realistic: $15,000/mo; Optimistic: $60,000/mo.

## Development Time
6-7 days.

## Technical Complexity
7/10. This is complex. It requires using browser APIs to capture audio from the meeting tab. This audio stream is then sent to a real-time speech-to-text API. The resulting transcript is then processed by an LLM to generate the summary and action items. This requires a robust, low-latency architecture.

## Competition Level
High. Tools like Fathom, , and Fireflies are well-established in this space. The niche is to offer a more privacy-focused solution (e.g., with options for on-device processing where possible) or a more affordable plan for individuals and small teams.

## Key Features
- Real-Time Transcription: See a live transcript of the conversation as it happens.
- AI-Generated Summaries: After the meeting, receive a concise summary of the discussion.
- Action Item Detection: AI automatically identifies and lists tasks and action items assigned during the call.
- Speaker Identification: The transcript and notes identify who said what.
- Integration with Project Management Tools: A premium feature to automatically send action items to tools like Asana or Todoist.

## Success Indicators
MRR, number of paid users, and accuracy of the generated summaries and action items.

## Additional Information
- **Cross-platform Project:** No
- **Completeness Score:** 10/10
