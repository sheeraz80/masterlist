# CoreVecta Project Structure

## About CoreVecta LLC

CoreVecta is the parent company that manages and develops all projects within the Masterlist platform. All 650+ projects, as well as the Masterlist platform itself, operate under the CoreVecta umbrella.

## GitHub Organization Structure

### Current Setup (Temporary)
- **Personal Account**: All repositories will initially be created under your personal GitHub account
- **Organization**: `corevecta-projects` (under personal account)

### Future Setup (Production)
- **Main Organization**: `corevecta` - For CoreVecta LLC official repositories
- **Projects Organization**: `corevecta-projects` - For all 650+ project repositories
- **Platform Repository**: `corevecta/masterlist` - The main platform

## Branding Guidelines

### Repository Naming
- Format: `{category}-{subcategory}-{project-name}`
- Example: `chrome-extensions-productivity-tab-manager`

### Topics/Tags
All repositories should include:
- `corevecta` - Company identifier
- `masterlist` - Platform identifier
- Category-specific tags
- Technology-specific tags

### Documentation
All project READMEs should include:
```markdown
---

<p align="center">
  Built with ❤️ by <a href="https://github.com/corevecta">CoreVecta</a>
</p>
```

### License
- Default: MIT License
- Copyright: © 2024 CoreVecta LLC

## Migration Plan

1. **Phase 1**: Create repositories under personal account
2. **Phase 2**: Set up official CoreVecta GitHub organization
3. **Phase 3**: Transfer all repositories to CoreVecta organization
4. **Phase 4**: Update all references and documentation

## Environment Variables

```env
# Temporary (Personal Account)
GITHUB_PROJECTS_ORG=corevecta-projects
GITHUB_PROJECTS_TOKEN=your_personal_token

# Future (CoreVecta Organization)
GITHUB_PLATFORM_ORG=corevecta
GITHUB_PROJECTS_ORG=corevecta-projects
GITHUB_ORG_TOKEN=corevecta_org_token
```

## Legal Notice

All projects and intellectual property created within the Masterlist platform are owned by CoreVecta LLC. This includes:
- Source code
- Documentation
- Branding assets
- Project ideas and implementations

---

© 2024 CoreVecta LLC. All rights reserved.