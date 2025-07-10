# GitHub Organization Migration Plan

## Current Setup (Personal Ownership)
- Organizations created under your personal GitHub account (`sheeraz80`)
- You are the sole owner
- Billing tied to your personal account

## Future Migration Options

### Option 1: Transfer Organization Ownership
**When CoreVecta has a separate GitHub account**

1. Create a GitHub account for CoreVecta company
2. Transfer organization ownership:
   ```
   Organization Settings → Transfer ownership → New owner: corevecta-company
   ```
3. Benefits:
   - Clean separation of personal/company
   - Company controls billing
   - You remain as admin member

### Option 2: Add Company Account as Co-Owner
**Share ownership while maintaining control**

1. Create CoreVecta company GitHub account
2. Add as organization owner:
   ```
   Organization Settings → Members → Invite → Role: Owner
   ```
3. Benefits:
   - Dual control
   - Easier transition
   - Shared responsibility

### Option 3: Rename Organizations Later
**If names need to change**

- Current: `corevecta-projects`
- Future: `corevecta-labs` or any other name
- GitHub automatically handles redirects

## What Remains Unchanged

✅ **All 650+ repositories**
- URLs continue working (GitHub redirects)
- Git remotes auto-redirect
- No need to update clones

✅ **Repository Settings**
- Privacy settings
- Branch protections
- Webhooks
- Secrets

✅ **Access & Permissions**
- Team members
- Collaborators
- Deploy keys

## Recommended Approach

1. **Create organizations now** under your personal account
2. **Build all 650+ repositories**
3. **When ready**, create CoreVecta company account
4. **Transfer ownership** to company account
5. **Update billing** to company card

## Important Notes

- GitHub Free: Unlimited public/private repos
- GitHub Team: $4/user/month (advanced features)
- Migration can happen anytime without disruption
- All development work continues uninterrupted

## Timeline Example

- **Now**: Create orgs under personal account
- **1-3 months**: Develop and deploy projects
- **When incorporated**: Create company GitHub account
- **Transfer**: Move organizations to company account
- **No downtime**: Everything continues working

## Commands for Future Migration

```bash
# After creating company account
gh api -X PATCH /orgs/corevecta \
  --field owner='corevecta-company-account'

# Verify new ownership
gh api /orgs/corevecta --jq '.owner.login'
```

---

**Bottom Line**: Create the organizations now under your personal account. You can easily transfer them to a company account later with zero disruption to the repositories or development work.