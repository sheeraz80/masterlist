# FigTask (Integrated Task Lists)

## Overview
**Problem Statement:** Design teams often juggle external project management tools for tracking design to-dos, which means leaving Figma to check tasks or update statuses. Minor tasks (like “fix padding here” or “replace image”) may be noted in comments or separate tools and get lost. There’s no lightweight way in Figma to keep a checklist of design tweaks or tasks linked to the design itself.

**Solution:** A Figma plugin that adds a simple to-do or task list panel within the Figma canvas. Designers can create tasks linked to specific frames or elements (e.g. “Revise header color on Screen 3”) and check them off as they work. It’s like sticky note to-dos inside Figma, eliminating the need to switch to an external tracker for small iterative tasks. Optionally, it can sync with popular tools (Trello, Jira) via their APIs if desired, but primarily it’s zero-backend (storing tasks in the Figma file or local storage).

**Target Users:** In-house design teams and freelance designers collaborating with clients – anyone who wants to track design-specific tasks without heavy project management overhead. Especially useful for solo designers or small teams that find full Jira tickets overkill for minor design fixes.

## Quality Score
**Overall Score:** 6.4/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 2/10
- **Technical Feasibility:** 8/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium. Free for individual use with basic checklist features. A paid version (perhaps $5/month per user or a one-time $25) adds integrations (sync tasks to external PM tools) and team collaboration (shared task lists for a Figma file that multiple editors can check off). Another angle: monetize through the Figma Community as a paid plugin once that’s open (or via our website with license keys).

## Revenue Potential
Conservative: $200/month; Realistic: $800/month; Optimistic: $2,500/month. This is somewhat niche (many might just use existing PM tools), but given Figma’s large user base, even a fraction adopting for convenience can bring steady income. The optimistic case might involve a few teams adopting at scale for internal workflows.

## Development Time
~5 days. Basic checklist UI is straightforward with Figma plugin UI APIs (React could be used). Storing tasks can be done in the Figma document memory (plugin data saved with file) or localStorage. Integrations (like writing to Trello/Jira via their REST APIs) add a day or two if included. AI is not particularly needed here aside from maybe assisting code.

## Technical Complexity
3/10 – The UI and storage are simple. The main complexity is if we implement external sync (auth flows for APIs like Trello/Jira) – but that can be gated to Pro. A purely internal version is very simple. Ensuring tasks persist and possibly are shareable with team (Figma plugin data is per file and accessible to all editors of that file, so that’s doable). No server needed; integration calls go directly from client to external APIs if used.

## Competition Level
Low – There isn’t a well-known Figma plugin for task management; most teams use external tools. Some plugins exist to send frames to Jira or GitHub, but nothing that acts as a simple internal checklist to our knowledge. The novelty is integrating tasks into the design context. So competition is mainly the inertia of existing processes (some might say “just use Asana”). We’ll position it as complementary, not a full PM replacement.

## Key Features
- Inline task panel: A sidebar in Figma listing tasks; tasks can have a name, optional description, and a link to a specific frame or layer (clicking the task could select/highlight that element)
- Checkboxes and statuses: Mark tasks as done, which greys them out or hides them; maybe support simple status tags (to-do, in progress, done) for clarity
- File-based storage: Tasks are saved within the Figma file’s plugin data so anyone opening the file with the plugin sees the same task list (enabling collaboration without a server)
- Export/Sync (Pro): Option to export tasks to a JSON or sync with a Trello board or Jira (each task becoming a card/ticket). Could also import tasks from those sources to display in Figma.
- Notifications: (If feasible without a server) Possibly alert when a task assigned to you in Figma is checked off or updated – though without a backend, this might be limited to just visual cues when you open the file.

## Success Indicators
Number of active files using the task lists (we could count tasks created); qualitative feedback like “I never forget a feedback point now, it’s all in one place”; conversion rate to Pro for those who want integration; and potentially reduced context-switching as reported by users (harder to measure, but testimonials). Also, tracking if teams adopt it widely (e.g. multiple users on the same file using it, which we can see via task updates).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
