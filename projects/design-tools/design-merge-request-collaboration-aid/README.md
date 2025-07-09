# Design Merge Request (Collaboration Aid)

## Overview
**Problem Statement:** When multiple designers collaborate or iterate on the same file, changes can override each other. Figma’s branching feature (for org accounts) addresses this, but many teams on lower plans lack a structured review for design changes. They often communicate via Slack or comments which can be messy. There’s no simple way to see what changed between two states of a design and approve merges (except manual comparison).

**Solution:** A plugin that emulates a “merge request” workflow for Figma designs. It could work by allowing a designer to mark a frame or page as a new version and compare it to an older snapshot (leveraging our earlier version snapshot logic from Project 12). It highlights differences and then could notify another user for review (maybe by generating a shareable summary of changes). While it can’t truly restrict merges without Figma’s branching, it offers structure: you can pseudo-“fork” (duplicate) a frame, modify it, then use the plugin to compare with original and if “approved”, replace the original with the new one. This facilitates a lightweight design review process.

**Target Users:** Design teams without Figma Organization (which has native branching) or even those with it but wanting a simpler quick review for small changes. Also design leads who want to ensure changes are reviewed. It could also help in design handoff to devs by highlighting what changed since last version (so devs know what to update).

## Quality Score
**Overall Score:** 5.6/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 2/10
- **Technical Feasibility:** 4/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
This is more niche, probably a one-time or small subscription aimed at teams. Maybe charge per team usage (like $50 one-time for a team pack or $5/user). But given it’s essentially a process tool, adoption might be limited to serious collaborative teams. Let’s say one-time per user $10 and perhaps multi-user discounts.

## Revenue Potential
Conservative: $100/month; Realistic: $400/month; Optimistic: $1,500/month. This is niche because larger teams might have branching or other tools, and small teams might not formalize reviews. But there is a middle ground (like mid-size companies on Figma professional plan) that could use it. If we tap those, optimistic scenario maybe a couple hundred users.

## Development Time
~7 days. Use design snapshot diff logic (from Project 12: Design Versioner) to show differences. Possibly integrate with some notification (like generate a markdown of changes that can be posted or copied to Slack). Actually notifying via plugin is hard unless we integrate with email/Slack API which would require user-provided webhook or minimal server involvement (maybe output text and user manually shares). Main heavy lifting: diffing two frames (which we've partly covered earlier). Also interface for “Propose change” and “Merge it” which essentially could mean copying changes over. If the frames are in same file, merging is basically replacing original content with new (we could copy over the changed layers). Or more simply, user manually merges after reviewing diff. We may not fully automate merge (to avoid messing up file). Could assist by selecting changed layers to quickly copy.

## Technical Complexity
7/10 – Implementing a reliable diff for design layers is complex. Visual diff (like snapshot images pixel compare) could be easier but not precise for content changes. A simpler approach: traverse layer tree and find mismatches (text changed, layer moved by x px, color changed) and list them. That’s doable but needs careful recursion and tolerance for minor differences (like if a shadow changed or an auto-layout reflow slightly moved something). We can narrow to changes in properties we care about: position, size, fill, text content. It doesn’t have to catch every nuance (like if two icons swapped positions, though that would appear as two position changes). For merging, actually applying differences programmatically means we’d manipulate the original frame’s layers – possible but risk of messing up if structure diverged. Perhaps leave merge to user using our guidance. Focus on compare and summary.

## Competition Level
Low – Figma’s own branching is the competition, but behind expensive plan. Some teams use abstracted process, but nothing direct in plugin form. So it’s somewhat unique. Main competitor is status quo (designers eyeballing differences or just trusting each other).

## Key Features
- Snapshot and compare: Designer takes a "before" snapshot of a frame (or uses a baseline). After making changes (maybe on a copy of that frame or same frame – if same frame, we need an earlier snapshot; if on copy, we can diff copy vs original). The plugin generates a list of differences: e.g. “Text ‘Signup’ changed to ‘Sign Up’”, “Button color #0088FF -> #0077Ee”, “Image layer added”, “Icon moved +10px right”. Possibly also highlight these changes on the canvas (like drawing boxes around changed elements).
- Share changes: Provide a text summary or simple visual diff output (maybe snapshot images of before/after with highlights) that can be pasted into Slack or attached to an email for review. If we can’t directly integrate, we can at least copy text to clipboard or export a .png showing changes.
- Approval tracking: Not easy without a server, but we could allow adding a checkmark or comment in the file that someone approved. Perhaps just instruct to resolve by merging. Possibly integrate with Figma comments by adding a comment listing changes (but comments via plugin might not be allowed). Maybe simplest: after review, user clicks “Apply changes” and plugin replaces the original frame’s content with new one. Or if working on same frame with snapshots, just finalize that snapshot as new baseline. We can simulate an approval by marking in plugin that it's merged (for our reference) but that doesn’t persist globally.
- Merge assistance: If the design iteration was done on a separate frame, the plugin can automatically replace the old frame with the new one (or copy changed layers over) when approved, to avoid manual copy-paste errors. Essentially a one-click update original.

## Success Indicators
If small teams (like 5-10 designers) adopt it and say it improved their workflow (“we caught differences easily, fewer miscommunications”), that’s a win. If we get even a handful of case studies, we can leverage that. Also, if plugin usage shows repeated comparisons, it means it's being integrated into their routine (like every PR in code, they do a design MR often). Over time, if such practice becomes common, maybe bigger adoption or Figma replicates it (in which case we influenced the product, which is still a sign of success albeit hurting plugin eventually).

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
