# SpellCheck+ (Content Proofreader)

## Overview
**Problem Statement:** Figma currently doesn’t have a built-in spell check or grammar check across all text, meaning typos can slip through in designs (embarrassing in client presentations or when copying text to production). Designers manually find/replace or rely on copy reviews, which isn’t always reliable. Also, checking consistency of terminology (e.g. “Login” vs “Log in”) is manual.

**Solution:** A plugin that runs a spell check on all text layers in a Figma file (or selected frames) and flags potential spelling errors, grammar issues, or inconsistencies. It could use an offline word list for spell-check (for privacy) or call an API for advanced grammar suggestions. It highlights the words and offers suggestions to correct them (possibly auto-replacing the text in the layer if user confirms). Additionally, it can check for common design terminology consistency (maybe using a custom dictionary feature).

**Target Users:** UI/UX designers, content designers, anyone working on text-heavy designs (dashboards, editorial content layouts, etc.) – especially those preparing deliverables for stakeholders where typos would undermine credibility. Also non-native English designers might find it useful to catch mistakes.

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
Freemium. Spell check basic functionality could be free (to gain wide adoption, as basic spell-check might be seen as a must-have utility). A Pro tier ($5/month or $30/year) could add grammar checking, custom dictionaries (company names, product terms), and multi-language support or auto-translate checks. The value-add features would entice companies or power users.

## Revenue Potential
Conservative: $250/month; Realistic: $1,000/month; Optimistic: $3,500/month. Many might grab the free version just for spellcheck. Converting to paid depends on how much they value advanced checks – possibly content design teams or agencies would pay to avoid mistakes. If we tapped even a small percentage of Figma’s millions of users for a few bucks, optimistic is possible. But realistically, maybe a few hundred paying users for the pro features.

## Development Time
~6 days. For basic spell-check, we can use a dictionary approach: include a list of common words (maybe ~100k words dictionary which might be heavy to embed but possible) to check each text node. For suggestions, we might need an API (like some spellcheck API or use an open-source spellchecker lib). Grammar check likely requires an external service (like LanguageTool API) – possible if user consents. Ensuring privacy: perhaps do it offline where possible or allow opting in to online. UI to list found issues and apply fixes is needed. AI assistance could help integrate an open-source solution or with checking complexities.

## Technical Complexity
6/10 – Checking large amounts of text can be slow in JS, but maybe okay unless the file is huge. An external API might be needed for robust suggestions, which raises complexity about network and API costs. Perhaps as MVP just identify likely misspellings (flag words not in dictionary) which covers most use cases. Multi-language detection is another complexity if we support non-English; maybe out of scope for now, or require user to pick language. The actual replacing of text is easy via Figma API. UI to review each issue is moderate complexity (like a little panel “Word X not found, suggestions:... [Replace] [Ignore]”).

## Competition Level
Low – Surprising gap: I haven’t seen a popular spellcheck plugin for Figma; might be one but not well-known, and Figma itself doesn’t have it. So it’s mostly a greenfield. People have definitely complained about lack of spellcheck, so demand exists. We’d likely become quite popular if executed well (which could drive lots of free users, and some convert).

## Key Features
- Spell check all text: Scans every text node in selection or page, highlights unknown words.
- Review interface: Step through each flagged word with context (show the text in a snippet). Suggest common corrections (maybe using an algorithm like Levenshtein distance to nearest words in dictionary). User can click to replace the text in the layer or ignore it.
- Custom dictionary: Allow adding words to ignore (like brand names, jargon) so they aren’t flagged. Save this per file or globally for user.
- Grammar/punctuation (Pro): Highlight potential grammar issues like double spaces, mixed “...” vs “…”, or basic grammar patterns (like “an user” vs “a user”). Possibly integrate with an API for deeper grammar suggestions for Pro users.
- Language support: Option to check in different languages if the design is non-English (maybe through different dictionaries or an API call).

## Success Indicators
Number of documents checked and issues fixed (impact delivered – could maybe internally count how many replacements done); user feedback like “caught a typo I’d overlooked” (priceless anecdotal evidence); adoption rate – this plugin could realistically get tens of thousands of downloads if free, which is a success even if only a small fraction pay. Another indicator: reduction of typo errors in final products for those teams (though hard to measure directly, we might infer if users keep using it and renew sub). Also being featured in Figma Community or by evangelists as a must-have plugin would be a big success sign.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
