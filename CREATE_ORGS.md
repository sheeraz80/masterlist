# Create GitHub Organizations

## Step 1: Create "corevecta" Organization

1. Go to: https://github.com/organizations/new
2. Fill in:
   - **Organization account name**: `corevecta`
   - **Contact email**: Your email
   - **This organization belongs to**: My personal account
3. Click "Next"
4. Select **Free** plan
5. Skip adding members for now
6. Complete setup

## Step 2: Create "corevecta-projects" Organization  

1. Go to: https://github.com/organizations/new
2. Fill in:
   - **Organization account name**: `corevecta-projects`
   - **Contact email**: Your email
   - **This organization belongs to**: My personal account
3. Click "Next"
4. Select **Free** plan
5. Skip adding members for now
6. Complete setup

## Step 3: After Creation

Run this command to verify and update configuration:

```bash
./verify-orgs.sh
```

This will:
- Verify both organizations exist
- Update your .env file
- Grant necessary permissions
- Prepare for repository creation

## Important Notes

- Both organizations should be on the **Free** plan
- You'll be the owner of both organizations
- Repositories will be created as **private** (within Free plan limits)
- You can upgrade to paid plans later if needed

## Free Plan Limits

GitHub Free for organizations includes:
- Unlimited public repositories
- Unlimited private repositories
- 2,000 Actions minutes/month
- 500MB of Packages storage

For 650+ private repositories, you may need to upgrade to GitHub Team ($4/user/month) later.