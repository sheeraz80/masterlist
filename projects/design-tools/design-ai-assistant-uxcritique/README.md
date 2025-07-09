# Design AI Assistant (UXCritique)

## Overview
**Problem Statement:** Designers (especially less experienced ones) may not see certain usability or design issues in their work. Design reviews often depend on expert feedback, which is not always available. Having an “extra pair of eyes” to critique a design could improve quality.

**Solution:** An AI-powered plugin that analyzes a Figma frame or flow and provides suggestions or critiques. For example, it might flag if a button’s call-to-action text is ambiguous, or if an important element is too low contrast (beyond pure color contrast, maybe hierarchy). It could also suggest improvements like “Consider making this text larger for readability” or “This screen has many elements; consider simplifying.” The AI uses design best practices learned from large datasets to give written feedback, almost like a junior UX consultant inside Figma.

**Target Users:** Solo designers, beginners looking for feedback, and any designer open to AI suggestions for improvement. Also product managers or developers who might run it on designs to ensure obvious issues are caught before implementation.

## Quality Score
**Overall Score:** 6.3/10

### Score Breakdown
- **Completeness:** 10/10
- **Revenue Potential:** 4/10
- **Technical Feasibility:** 5/10
- **Market Opportunity:** 8/10
- **Platform Coverage:** 2/10

## Platforms
This project can be implemented on the following platforms:
- [Figma Plugin](./platforms/figma-plugin/)

## Revenue Model
Freemium with usage limits. Perhaps free tier allows a certain number of analyses per day or per file, and Pro ($10/month) gives unlimited and maybe deeper analysis or a “chat” mode to ask the AI questions about the design. We’d have to cover AI API costs, so a subscription is suitable.

## Revenue Potential
Conservative: $400/month; Realistic: $1,500/month; Optimistic: $5,000/month. This is speculative as it depends on AI quality and user trust. If it consistently gives useful tips, it could spread widely (lots of designers might try it, conversion depends on how essential the advice becomes). With the AI trend, optimistic scenario could occur if it goes viral as a helpful tool.

## Development Time
~7 days initial (leveraging an existing large language model like GPT via API). Most time spent on engineering how to describe the design to the AI: possibly create a prompt by listing frame elements (like “Screen has a header with text ‘Welcome’, two buttons labeled X and Y, etc.”). AI assistance in coding would help format this prompt. Then parsing AI response and showing it nicely in plugin UI. The heavy lift (the “knowledge”) is on the AI’s side, so our job is prompt engineering and UI.

## Technical Complexity
6/10 – Summarizing a visual design into text for AI is challenging. We might use Figma node tree: read layer names, types, maybe relative positions (“button below header text”). The AI might need this context to give specific feedback. Ensuring prompts are concise but thorough is an iterative process. Also, cost: each analysis could hit OpenAI API and cost fractions of a cent; must manage usage and not go bankrupt on free users. Possibly require user to input their API key in free version, or limit to small frames. The actual plugin logic is moderate.

## Competition Level
Low – There are a couple of experimental plugins (e.g. Microsoft had a research project on AI design feedback, and there's “Magician” plugin for copy and small tasks). But a focused UX critique tool isn’t mainstream yet. Being early could capture interest. Competition is more designers’ skepticism (“can an AI critique design meaningfully?”).

## Key Features
- Automated critique: Click “Analyze Design” and the plugin outputs a list of observations/suggestions. E.g. “The primary button ‘Continue’ might be too small on mobile; ensure it meets touch size guidelines” or “There are two CTAs of equal weight, consider emphasizing one primary action”.
- Context selection: User can specify the type of app or user (like “This is a finance app for seniors”) to guide the AI’s critique focus. The plugin passes that context to the AI prompt for more tailored feedback (like accessibility for seniors, or security concerns for finance UI).
- AI chat Q&A (Pro): A mode where users can ask questions about their design: “What do you think about the navigation? Any suggestions?” and the AI, having the design context loaded, answers specifically. This two-way interaction is premium value.
- Issue highlighting: If possible, link feedback to elements (maybe by mentioning layer name or highlighting on canvas). For example, clicking a suggestion about a button could flash that button layer on the Figma canvas. This requires our plugin to map AI comment to a layer – we can attempt if we included layer name in prompt and AI references it.
- Learning improvements: Allow user to rate the suggestions so the system can learn what was useful. While not trivial to retrain the AI (since we rely on an external model), we could at least adjust prompt strategy based on feedback (or filter out obviously bad tips over time).

## Success Indicators
User engagement – e.g. how many analyses per user per design (if people repeatedly use it on new projects, it’s valuable). Conversion to paid for extended features. Qualitative: designers saying “it caught something I missed” or “It’s like a rubber duck debugging for design” – such testimonials prove value. Also, any improvement in design outcomes (maybe hard to measure, but case studies could be done if a team uses it thoroughly and finds their designs needed fewer UX iteration rounds). If the AI suggestions start appearing in design review meetings (“the plugin suggested this and it made sense”), that’s cultural adoption success.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
