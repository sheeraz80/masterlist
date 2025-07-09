# GitLens Lite - Vscode Extension Technical Notes

## Technical Complexity
**Rating:** 3/10. The core logic involves shelling out to the git blame command for the current file and line, parsing the output, and displaying it as an editor decoration.

## Development Time
**Estimated:** 2-3 days.

## Platform-Specific Technical Details
A "lite" version of GitLens that does one thing and one thing only: it provides the inline "blame" annotation on the current line, showing who last changed it and when. No extra sidebars, no complex views.

## Technical Requirements

### Platform Constraints
- Must use VS Code Extension API
- Node.js runtime environment
- Limited UI customization options
- Extension host process limitations

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
