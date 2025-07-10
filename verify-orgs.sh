#!/bin/bash

echo "=== Verifying GitHub Organizations ==="
echo ""

# Check if organizations exist
check_org() {
    local org=$1
    echo -n "Checking $org: "
    if gh api /orgs/$org >/dev/null 2>&1; then
        echo "✅ Found!"
        return 0
    else
        echo "❌ Not found"
        return 1
    fi
}

# Check both organizations
ORG1_EXISTS=false
ORG2_EXISTS=false

if check_org "corevecta"; then
    ORG1_EXISTS=true
fi

if check_org "corevecta-projects"; then
    ORG2_EXISTS=true
fi

echo ""

# If both exist, update configuration
if [ "$ORG1_EXISTS" = true ] && [ "$ORG2_EXISTS" = true ]; then
    echo "✅ Both organizations found!"
    echo ""
    echo "Updating configuration..."
    
    # Update .env file
    sed -i.backup 's/GITHUB_PROJECTS_ORG=.*/GITHUB_PROJECTS_ORG=corevecta-projects/' .env
    echo "✅ Updated .env file to use corevecta-projects"
    
    # Verify user is member
    echo ""
    echo "Verifying your membership:"
    
    USER=$(gh api /user --jq .login)
    echo "Current user: $USER"
    
    echo -n "Member of corevecta: "
    gh api /orgs/corevecta/members/$USER >/dev/null 2>&1 && echo "✅ Yes" || echo "❌ No"
    
    echo -n "Member of corevecta-projects: "
    gh api /orgs/corevecta-projects/members/$USER >/dev/null 2>&1 && echo "✅ Yes" || echo "❌ No"
    
    echo ""
    echo "🎉 Configuration complete!"
    echo ""
    echo "Next steps:"
    echo "1. Return to the admin panel"
    echo "2. Start a new batch creation (not dry run)"
    echo "3. Repositories will be created under corevecta-projects"
    
else
    echo "❌ One or both organizations not found."
    echo ""
    echo "Please create them at:"
    echo "https://github.com/organizations/new"
    echo ""
    echo "Organization names needed:"
    echo "- corevecta"
    echo "- corevecta-projects"
fi