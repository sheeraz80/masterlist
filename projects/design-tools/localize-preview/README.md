# Localize Preview

## Overview
**Problem Statement:** Designing with localization in mind is challenging. Text that fits in English might overflow in German or French, and right-to-left languages or different scripts (Chinese, Arabic) can break layouts. Designers often don’t see these issues until late. Currently, one might manually replace text with longer versions or different languages, which is tedious.

**Solution:** A plugin that allows designers to simulate their UI in different languages and content lengths easily. It could have features like: select a language and it auto-translates (via a translation API) all text to that language (or inserts pseudo-localization where text is expanded by a certain percentage with extra characters). Also handle right-to-left flip if Arabic/Hebrew selected (maybe mirror the layout if needed). This helps reveal overflow, misalignment, or UI breakage due to localization early in design.

**Target Users:** Product designers working on global products, localization teams reviewing design, and developers in international companies who want to ensure design accommodates all languages. Even designers in single-language context might use pseudo-expansion to ensure future-proofing.

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
Freemium. Free tier could allow pseudo-translation (like gibberish expansion) and maybe one target language (like Spanish). Pro tier ($8/month or so) unlocks multiple languages, actual machine translation integration (so meaningful phrases), and RTL support. Maybe team license if localization is a big focus (some companies might get multiple seats for all designers).

## Revenue Potential
Conservative: $300/month; Realistic: $1,200/month; Optimistic: $4,000/month. Many companies localize (I18n is a standard need). But not all designers actively test multiple locales at design time. This is more likely adopted in mature product orgs that ship in many countries. Optimistic if it becomes a standard practice for such orgs (some might integrate it into their design QA). If each of several big companies buys a few licenses, could add up.

## Development Time
~6 days. Using a translation API (like Google Translate or DeepL) requires calling out – we can either require user to supply an API key (if we want to avoid paying for their usage) or limit free usage. Pseudo-localization (e.g. adding accent marks to every vowel and lengthening by 30%) we can do offline. Replacing text nodes in Figma is straightforward. For RTL, we can apply a transform (Figma doesn’t have a global direction switch, but we can reverse order of text characters and perhaps align right). Mirroring layout is tricky – we might simply highlight that RTL would need rethinking; fully mirroring frame content might be beyond scope (maybe duplicate frame and swap positions of certain common patterns manually or via heuristic like reverse order of items in auto-layout frames if direction is horizontal). Could partially support if frame uses auto-layout (we can set its direction property to reverse if plugin sees fit). Might limit initial RTL support to text alignment and reversing text only.

## Technical Complexity
6/10 – Replacing text across many nodes with foreign characters could break some text formatting (e.g., if the designer manually bolded part of a string, a naive replace loses that styling). We might ignore those edge cases or replace whole text nodes at once. Also, ensuring we revert back to original easily (we should store original strings to restore). So we need a good undo/restore strategy (maybe one-click restore all text to original, saved in plugin memory or attached data). Using external translation API is straightforward but dealing with API keys or cost is a consideration. Perhaps just use a free tier with limited characters (DeepL or Google have some free limit). If high usage, a cost issue – pass that to user by requiring their key if heavy.

## Competition Level
Low – There’s at least one plugin “Pseudo Localization” free plugin that does expansion. And some custom scripts people use. But a comprehensive localization preview tool in Figma is not widely known. Ours combining multiple languages and script directions would stand out.

## Key Features
- Language selection: Choose from common target locales (French, German, Spanish, Chinese, Arabic, etc.). On selection, plugin replaces all visible text with translated text in that language (via API or pre-stored common translations for certain words if not using API).
- Pseudo-expand: Option to use pseudo-localization (e.g. “Login” -> “Łőğīņņ [!!!!!!]”) which both makes it longer and adds odd characters to reveal encoding issues. This usually expands by ~30%. Useful for any language expansion test without actual translation.
- RTL mode: If Arabic/Hebrew selected, plugin can set text alignment in those text nodes to right (to simulate RTL reading) and maybe reverse their order in container frames if applicable. At least highlight that this is an RTL layout scenario for designer to consider adjustments.
- Per-frame vs global: Option to localize the whole page or just selected frame(s), so the designer can e.g. duplicate a screen and localize the copy for comparison side-by-side.
- Restore text: A “Reset to original language” button that puts everything back exactly as it was (we’ll store original text content mapping when first run so it can revert). Undo stack might also handle it, but better to explicitly offer restore in case multiple operations done.

## Success Indicators
The number of localization issues caught in design (maybe via user feedback: “We caught a dozen overflow issues before handing to dev, huge save!”). Also interest from localization professionals (maybe they recommend the tool to design teams, an external validation). If we see usage across many locales, that’s good (we could track which languages are tested to see patterns). Financially, if companies with multi-locale products adopt it widely (e.g. one big software company could bring dozens of users), that’s a big success marker.

## Additional Information
- **Cross-platform Project:** Yes
- **Completeness Score:** 10/10
