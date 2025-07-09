# GitHub Push Guide

## Steps to Push to GitHub

### 1. Create GitHub Repository
First, create a new repository on GitHub:
1. Go to https://github.com/new
2. Name it `masterlist`
3. Keep it public or private as preferred
4. Don't initialize with README (we already have one)
5. Click "Create repository"

### 2. Update Remote URL
Replace the placeholder URL with your actual repository:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/masterlist.git
```

Or if using SSH:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/masterlist.git
```

### 3. Push to GitHub
```bash
git push -u origin master
```

### 4. If Using Private Repository
You may need to authenticate:
- **HTTPS**: Use your GitHub username and a Personal Access Token (not password)
- **SSH**: Make sure your SSH key is added to GitHub

### Creating a Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Give it a name and select "repo" scope
4. Copy the token and use it as your password when pushing

## Current Status
✅ Repository initialized
✅ All files added and committed
✅ Remote origin added (needs URL update)
⏳ Ready to push after updating remote URL

## Quick Commands
```bash
# Check current remote
git remote -v

# Update remote URL (replace YOUR_USERNAME)
git remote set-url origin https://github.com/YOUR_USERNAME/masterlist.git

# Push to GitHub
git push -u origin master
```

## After Pushing
1. Visit your repository at https://github.com/YOUR_USERNAME/masterlist
2. Update the repository URL in package.json if needed
3. Set up GitHub Actions secrets if using CI/CD
4. Configure Dependabot for security updates

## Troubleshooting
- If push is rejected, make sure the repository is empty on GitHub
- For authentication issues, use a Personal Access Token instead of password
- For large files issues, consider using Git LFS