# GitHub Integration Setup Guide

This guide explains how to configure GitHub integration for the Masterlist application to create repositories in the `corevecta-projects` organization.

## Overview

The Masterlist application can automatically create GitHub repositories for your projects following a consistent naming convention and organizational structure.

## Repository Naming Convention

Repositories are created with the following naming pattern:
```
{category-prefix}-{project-name}-{unique-id}
```

Examples:
- `chrome-tab-manager-a1b2c3`
- `web-analytics-dashboard-d4e5f6`
- `api-payment-gateway-g7h8i9`

Category prefixes:
- `chrome` - Chrome Extensions
- `vscode` - VSCode Extensions
- `figma` - Figma Plugins
- `web` - Web Applications
- `mobile` - Mobile Applications
- `desktop` - Desktop Applications
- `api` - API/Backend Services
- `lib` - Libraries/Packages
- `ai` - AI/ML Projects
- `blockchain` - Blockchain Projects
- `iot` - IoT Projects

## Quick Setup

Run the automated setup script:
```bash
./scripts/setup-github-org.sh
```

## Manual Setup

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Masterlist Integration")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `admin:org` (Full control of orgs and teams)
   - `admin:repo_hook` (Full control of repository hooks)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# GitHub Personal Access Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# GitHub Organization for project repositories
GITHUB_PROJECTS_ORG=corevecta-projects

# Optional: Override default organization
# GITHUB_ORG_NAME=your-org-name
```

### 3. Verify Organization Access

Ensure you have the following permissions in the `corevecta-projects` organization:
- **Member** access (minimum)
- **Admin** access (recommended for creating repositories)

To check your access:
1. Go to https://github.com/orgs/corevecta-projects/people
2. Find your username and check your role

### 4. Test Your Configuration

After setting up, restart your development server and try creating a repository from a project details page.

## Troubleshooting

### Common Issues

#### "Organization not found" error
- Verify the organization name is spelled correctly
- Ensure you have access to the organization
- Check if your token has the `admin:org` scope

#### "Insufficient permissions" error
- Ensure your token has all required scopes
- Verify you have at least member access to the organization
- For creating repositories, admin access may be required

#### "Repository already exists" error
- The repository name is already taken in the organization
- The system will append a unique ID to avoid conflicts

### Fallback Mode

If GitHub is not configured or unavailable, the system will:
1. Create a local repository record
2. Show a warning message
3. Allow you to link an existing GitHub repository later

### Debug Mode

To see detailed GitHub API logs, set:
```env
DEBUG=github:*
```

## Security Best Practices

1. **Never commit tokens**: Ensure `.env.local` is in your `.gitignore`
2. **Use minimal scopes**: Only grant the permissions you need
3. **Rotate tokens regularly**: Create new tokens periodically
4. **Use organization tokens**: Consider using GitHub Apps for production

## Organization Structure

The `corevecta-projects` organization uses a flat repository structure where the category is included in the repository name rather than using nested folders.

Benefits:
- Easy to find projects by category prefix
- Simple URL structure
- Better GitHub search functionality
- Consistent naming across all projects

## API Endpoints

### Create Repository
```
POST /api/repositories/create-enhanced
```

### Check GitHub Status
```
GET /api/repositories/create-enhanced?action=github-status
```

### Link Existing Repository
```
POST /api/repositories/link
```

## Next Steps

After setup:
1. Navigate to any project details page
2. Click "Create Repository"
3. Choose a template and configure settings
4. The repository will be created in the configured organization
5. Clone the repository and start developing!

For more information, see the [Enhanced Repository Service documentation](./REPOSITORY_SERVICE.md).