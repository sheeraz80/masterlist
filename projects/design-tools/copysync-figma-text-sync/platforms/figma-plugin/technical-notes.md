# CopySync (Figma Text Sync) - Figma Plugin Technical Notes

## Technical Complexity
**Rating:** 5/10 – Handling external API from within Figma (Google Sheets API or others) and ensuring no server needed (users may have to provide an API key or use public share links). Google’s API usage might need OAuth – which is tricky without a backend, but we can use the simpler approach: require the sheet to be published or use an API key restricted to that sheet. Alternatively, let users upload a CSV. The two-way sync (export text) involves iterating Figma nodes and generating CSV. All doable in plugin environment.

## Development Time
**Estimated:** ~7 days. Google Sheets API integration is straightforward (HTTP calls from the plugin context; user will input a share link or API key). The challenging part is mapping text nodes to sheet cells – we can use unique identifiers in layer names to link to keys. AI assistance can help expedite parsing and mapping logic.

## Platform-Specific Technical Details
A plugin that links text nodes in Figma to an external content source (like a Google Sheet, CSV, or JSON file). With one click, a designer can import or refresh all the copy in their designs from the source, ensuring the latest content is reflected. It also allows exporting text from Figma to a sheet for copywriters to edit, enabling a round-trip workflow without any server (using Google’s API directly from the plugin or manual file import/export).

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
