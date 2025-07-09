# Collaboration System

A comprehensive collaboration framework for the Masterlist project, enabling teams to work together on project ideas.

## Features

### 1. Feedback System (`feedback_system.py`)
- **User Feedback**: Submit bug reports, feature requests, improvements, and praise
- **Ratings**: Rate projects on multiple criteria (quality, innovation, feasibility)
- **Comments**: Threaded discussions on projects
- **Voting**: Upvote/downvote feedback and comments
- **Status Tracking**: Track feedback resolution (open, in_progress, resolved, closed)

### 2. Team Workspace (`team_workspace.py`)
- **Team Management**: Create teams, add members, assign roles
- **Workspaces**: Dedicated spaces for project development
- **Project Assignments**: Assign projects to teams with tracking
- **Task Management**: Create and track tasks within assignments
- **Kanban Boards**: Visual project management
- **Document Sharing**: Share notes, requirements, designs, and code
- **Activity Tracking**: Monitor team activities

### 3. Project Sharing Hub (`project_sharing.py`)
- **Public Sharing**: Share projects with the community
- **Forking**: Create personal copies of shared projects
- **Collaboration**: Add collaborators with different permission levels
- **Version Control**: Track project versions and changes
- **Merge Requests**: Propose changes from forks
- **Star System**: Bookmark favorite projects
- **Share Links**: Generate shareable links with expiration

## Usage

### Feedback System

```bash
# Add feedback
python collaboration/feedback_system.py add-feedback \
  --project "ai-code-reviewer" \
  --type feature \
  --content "Add support for Python type hints"

# Add rating
python collaboration/feedback_system.py add-rating \
  --project "ai-code-reviewer" \
  --rating 8.5

# Add comment
python collaboration/feedback_system.py add-comment \
  --project "ai-code-reviewer" \
  --content "Great idea! Would love to see TypeScript support too"

# View project feedback
python collaboration/feedback_system.py view \
  --project "ai-code-reviewer"

# View statistics
python collaboration/feedback_system.py stats

# Export report
python collaboration/feedback_system.py export
```

### Team Workspace

```bash
# Create team
python collaboration/team_workspace.py create-team \
  --name "AI Innovators" \
  --description "Building next-gen AI tools"

# Add team member
python collaboration/team_workspace.py add-member \
  --team-id <team-id> \
  --user-id "jane_doe" \
  --role "admin"

# Create workspace
python collaboration/team_workspace.py create-workspace \
  --name "Q1 Projects" \
  --team-id <team-id>

# Assign project
python collaboration/team_workspace.py assign-project \
  --project "ai-code-reviewer" \
  --team-id <team-id> \
  --workspace-id <workspace-id>

# View team dashboard
python collaboration/team_workspace.py view-team \
  --team-id <team-id>
```

### Project Sharing

```bash
# Share project
python collaboration/project_sharing.py share \
  --project "ai-code-reviewer" \
  --visibility public

# Fork project
python collaboration/project_sharing.py fork \
  --share-id <share-id>

# Star project
python collaboration/project_sharing.py star \
  --share-id <share-id>

# Add collaborator
python collaboration/project_sharing.py add-collaborator \
  --share-id <share-id> \
  --user "contributor_123" \
  --role "contributor"

# Create share link
python collaboration/project_sharing.py create-link \
  --share-id <share-id>

# List shared projects
python collaboration/project_sharing.py list-shared \
  --visibility public

# View your projects
python collaboration/project_sharing.py my-projects
```

## Data Structure

### Feedback Data
```json
{
  "project_key": {
    "feedback": [...],
    "ratings": {...},
    "comments": [...]
  }
}
```

### Team Structure
```json
{
  "team_id": {
    "name": "Team Name",
    "members": ["user1", "user2"],
    "roles": {"user1": "owner", "user2": "member"},
    "workspaces": [...],
    "assignments": [...]
  }
}
```

### Shared Project
```json
{
  "share_id": {
    "project_key": "project-name",
    "shared_by": "user_id",
    "visibility": "public",
    "stats": {
      "views": 0,
      "forks": 0,
      "stars": 0
    }
  }
}
```

## Permissions

### Feedback System
- Anyone can submit feedback and comments
- Project owners can update feedback status
- Users can vote on feedback/comments

### Team Workspace
- **Owner**: Full control over team
- **Admin**: Can manage members and workspaces
- **Member**: Can view and contribute
- **Guest**: Read-only access

### Project Sharing
- **Owner**: Full control, can delete
- **Maintainer**: Can edit, manage collaborators
- **Contributor**: Can submit changes
- **Viewer**: Read-only access

## Integration

The collaboration system integrates with:
- Main project database
- User authentication (when implemented)
- Web interface for visual collaboration
- CLI tools for command-line workflows
- Export functionality for reports

## Best Practices

1. **Feedback Management**
   - Regularly review and respond to feedback
   - Update status to keep users informed
   - Use voting to prioritize issues

2. **Team Collaboration**
   - Create clear workspace organization
   - Assign specific team members to projects
   - Use task tracking for accountability
   - Regular team activity reviews

3. **Project Sharing**
   - Choose appropriate visibility settings
   - Add clear documentation before sharing
   - Respond to collaboration requests
   - Keep versions updated
   - Credit original authors when forking

## Future Enhancements

- Real-time collaboration
- WebSocket notifications
- Integration with Git
- Mobile app support
- Advanced permission models
- Automated merge conflict resolution
- Team chat integration
- Project templates