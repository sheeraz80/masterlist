# Repository Privacy Configuration

## Current Setting
All repositories are set to **PRIVATE**

## To Change Privacy Settings

### Option 1: Make ALL repositories PUBLIC
Edit `/src/lib/services/repository-automation-service.ts` line 221:
```typescript
isPrivate: false,  // Change from true to false
```

### Option 2: Make it configurable per project
Add logic to determine privacy based on project category:
```typescript
isPrivate: this.shouldBePrivate(project),
```

With a method like:
```typescript
private shouldBePrivate(project: ProjectDefinition): boolean {
  // Make sensitive projects private
  const privateCategories = ['api-backend', 'blockchain-web3', 'fintech'];
  return privateCategories.includes(project.category);
}
```

### Option 3: Add privacy field to projects
Update the database to include a privacy preference per project.

## Recommendations

For CoreVecta starting out:
- **PUBLIC** repositories might be better for:
  - Building reputation
  - Attracting contributors
  - Showing portfolio to clients
  - Free unlimited GitHub features

- **PRIVATE** repositories better for:
  - Client work
  - Proprietary algorithms
  - Projects under development
  - Security-sensitive code

## GitHub Plan Comparison

### Free Plan
- ✅ Unlimited public/private repos
- ✅ 2,000 Actions minutes/month
- ⚠️ Limited features for private repos
- ⚠️ 3 collaborators max for private repos

### Team Plan ($4/user/month)
- ✅ Everything in Free
- ✅ 3,000 Actions minutes/month  
- ✅ Unlimited collaborators
- ✅ Advanced security features
- ✅ Protected branches
- ✅ Code owners

For 650+ repositories, you might eventually need Team plan anyway.