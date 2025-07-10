#!/bin/bash

# Setup script for GitHub environment configuration

echo "Setting up GitHub environment for CoreVecta repository creation..."
echo ""

# Get GitHub token
GITHUB_TOKEN=$(gh auth token)
echo "✓ Retrieved GitHub token from gh CLI"

# Get user email from git config
USER_EMAIL=$(git config user.email)
if [ -z "$USER_EMAIL" ]; then
    echo "Enter your email address for admin access:"
    read USER_EMAIL
fi
echo "✓ Using email: $USER_EMAIL"

# Update .env file
cp .env .env.backup
echo "✓ Created backup of .env file"

# Update GitHub token
sed -i "s/GITHUB_PROJECTS_TOKEN=.*/GITHUB_PROJECTS_TOKEN=$GITHUB_TOKEN/" .env

# Update admin email
sed -i "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$USER_EMAIL/" .env

echo ""
echo "✅ Environment configuration updated!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Visit http://localhost:3000/admin/repositories"
echo "3. Start with a dry run to test the batch creation"
echo ""
echo "Current configuration:"
echo "- GitHub User: sheeraz80"
echo "- Projects will be created under: sheeraz80 (personal account)"
echo "- Admin Email: $USER_EMAIL"
echo ""
echo "Note: When you create the 'corevecta-projects' organization later,"
echo "      update GITHUB_PROJECTS_ORG in .env file."