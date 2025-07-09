# Localize Preview - Figma Plugin Technical Notes

## Technical Complexity
**Rating:** 6/10 – Replacing text across many nodes with foreign characters could break some text formatting (e.g., if the designer manually bolded part of a string, a naive replace loses that styling). We might ignore those edge cases or replace whole text nodes at once. Also, ensuring we revert back to original easily (we should store original strings to restore). So we need a good undo/restore strategy (maybe one-click restore all text to original, saved in plugin memory or attached data). Using external translation API is straightforward but dealing with API keys or cost is a consideration. Perhaps just use a free tier with limited characters (DeepL or Google have some free limit). If high usage, a cost issue – pass that to user by requiring their key if heavy.

## Development Time
**Estimated:** ~6 days. Using a translation API (like Google Translate or DeepL) requires calling out – we can either require user to supply an API key (if we want to avoid paying for their usage) or limit free usage. Pseudo-localization (e.g. adding accent marks to every vowel and lengthening by 30%) we can do offline. Replacing text nodes in Figma is straightforward. For RTL, we can apply a transform (Figma doesn’t have a global direction switch, but we can reverse order of text characters and perhaps align right). Mirroring layout is tricky – we might simply highlight that RTL would need rethinking; fully mirroring frame content might be beyond scope (maybe duplicate frame and swap positions of certain common patterns manually or via heuristic like reverse order of items in auto-layout frames if direction is horizontal). Could partially support if frame uses auto-layout (we can set its direction property to reverse if plugin sees fit). Might limit initial RTL support to text alignment and reversing text only.

## Platform-Specific Technical Details
A plugin that allows designers to simulate their UI in different languages and content lengths easily. It could have features like: select a language and it auto-translates (via a translation API) all text to that language (or inserts pseudo-localization where text is expanded by a certain percentage with extra characters). Also handle right-to-left flip if Arabic/Hebrew selected (maybe mirror the layout if needed). This helps reveal overflow, misalignment, or UI breakage due to localization early in design.

## Technical Requirements

### Platform Constraints
- Must use Figma Plugin API
- Limited to Figma runtime environment
- No direct file system access
- Sandboxed execution environment

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
