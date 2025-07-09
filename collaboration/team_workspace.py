#!/usr/bin/env python3
"""
Team Workspace and Collaboration System
Enables teams to work together on project ideas
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from uuid import uuid4

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TeamWorkspace:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.teams_file = os.path.join(data_dir, "teams.json")
        self.workspaces_file = os.path.join(data_dir, "workspaces.json")
        self.assignments_file = os.path.join(data_dir, "project_assignments.json")
        self.activities_file = os.path.join(data_dir, "team_activities.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Load existing data
        self.teams = self._load_json(self.teams_file, {})
        self.workspaces = self._load_json(self.workspaces_file, {})
        self.assignments = self._load_json(self.assignments_file, {})
        self.activities = self._load_json(self.activities_file, [])
    
    def _load_json(self, filepath: str, default: Any) -> Any:
        """Load JSON file or return default"""
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    return json.load(f)
            except:
                return default
        return default
    
    def _save_json(self, data: Any, filepath: str):
        """Save data to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    def create_team(self, team_name: str, owner_id: str, description: str = "") -> str:
        """Create a new team"""
        team_id = str(uuid4())
        
        self.teams[team_id] = {
            "id": team_id,
            "name": team_name,
            "description": description,
            "owner_id": owner_id,
            "members": [owner_id],
            "created_at": datetime.now().isoformat(),
            "settings": {
                "allow_guest_view": False,
                "require_approval": True,
                "default_role": "member"
            },
            "roles": {
                owner_id: "owner"
            }
        }
        
        self._save_json(self.teams, self.teams_file)
        self._log_activity("team_created", {"team_id": team_id, "team_name": team_name}, owner_id)
        
        return team_id
    
    def add_team_member(self, team_id: str, user_id: str, added_by: str, 
                       role: str = "member") -> bool:
        """Add member to team"""
        if team_id not in self.teams:
            return False
        
        team = self.teams[team_id]
        
        # Check permissions
        if added_by not in team["members"] or team["roles"].get(added_by) not in ["owner", "admin"]:
            return False
        
        if user_id not in team["members"]:
            team["members"].append(user_id)
            team["roles"][user_id] = role
            
            self._save_json(self.teams, self.teams_file)
            self._log_activity("member_added", {
                "team_id": team_id,
                "user_id": user_id,
                "role": role
            }, added_by)
            
            return True
        
        return False
    
    def create_workspace(self, name: str, team_id: str, created_by: str, 
                        workspace_type: str = "project_development") -> str:
        """Create a team workspace"""
        if team_id not in self.teams:
            raise ValueError(f"Team {team_id} not found")
        
        if created_by not in self.teams[team_id]["members"]:
            raise PermissionError("User not a member of the team")
        
        workspace_id = str(uuid4())
        
        self.workspaces[workspace_id] = {
            "id": workspace_id,
            "name": name,
            "team_id": team_id,
            "type": workspace_type,  # project_development, brainstorming, planning
            "created_by": created_by,
            "created_at": datetime.now().isoformat(),
            "status": "active",
            "projects": [],  # Associated project keys
            "boards": {},    # Kanban boards
            "documents": [], # Shared documents
            "settings": {
                "visibility": "team",  # team, public
                "allow_comments": True,
                "track_changes": True
            }
        }
        
        self._save_json(self.workspaces, self.workspaces_file)
        self._log_activity("workspace_created", {
            "workspace_id": workspace_id,
            "workspace_name": name,
            "team_id": team_id
        }, created_by)
        
        return workspace_id
    
    def assign_project(self, project_key: str, team_id: str, workspace_id: str,
                      assigned_by: str, assignees: List[str] = None) -> str:
        """Assign a project to a team/workspace"""
        assignment_id = str(uuid4())
        
        # Validate team and workspace
        if team_id not in self.teams:
            raise ValueError(f"Team {team_id} not found")
        
        if workspace_id and workspace_id not in self.workspaces:
            raise ValueError(f"Workspace {workspace_id} not found")
        
        # If no specific assignees, assign to all team members
        if not assignees:
            assignees = self.teams[team_id]["members"]
        
        self.assignments[assignment_id] = {
            "id": assignment_id,
            "project_key": project_key,
            "team_id": team_id,
            "workspace_id": workspace_id,
            "assigned_by": assigned_by,
            "assignees": assignees,
            "created_at": datetime.now().isoformat(),
            "status": "assigned",  # assigned, in_progress, review, completed
            "priority": "medium",  # low, medium, high, critical
            "due_date": None,
            "progress": 0,
            "tasks": [],
            "notes": []
        }
        
        # Add to workspace
        if workspace_id and workspace_id in self.workspaces:
            self.workspaces[workspace_id]["projects"].append(project_key)
            self._save_json(self.workspaces, self.workspaces_file)
        
        self._save_json(self.assignments, self.assignments_file)
        self._log_activity("project_assigned", {
            "assignment_id": assignment_id,
            "project_key": project_key,
            "team_id": team_id,
            "assignees": assignees
        }, assigned_by)
        
        return assignment_id
    
    def create_task(self, assignment_id: str, title: str, description: str,
                   created_by: str, assigned_to: str = None) -> str:
        """Create a task within an assignment"""
        if assignment_id not in self.assignments:
            raise ValueError(f"Assignment {assignment_id} not found")
        
        task_id = str(uuid4())
        
        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "created_by": created_by,
            "assigned_to": assigned_to or created_by,
            "created_at": datetime.now().isoformat(),
            "status": "todo",  # todo, in_progress, done, blocked
            "priority": "medium",
            "completed_at": None,
            "checklist": []
        }
        
        self.assignments[assignment_id]["tasks"].append(task)
        self._save_json(self.assignments, self.assignments_file)
        
        self._log_activity("task_created", {
            "task_id": task_id,
            "assignment_id": assignment_id,
            "title": title,
            "assigned_to": assigned_to
        }, created_by)
        
        return task_id
    
    def update_task_status(self, assignment_id: str, task_id: str, 
                          status: str, updated_by: str) -> bool:
        """Update task status"""
        if assignment_id not in self.assignments:
            return False
        
        assignment = self.assignments[assignment_id]
        
        for task in assignment["tasks"]:
            if task["id"] == task_id:
                task["status"] = status
                task["updated_at"] = datetime.now().isoformat()
                
                if status == "done":
                    task["completed_at"] = datetime.now().isoformat()
                
                # Update assignment progress
                self._update_assignment_progress(assignment_id)
                
                self._save_json(self.assignments, self.assignments_file)
                self._log_activity("task_updated", {
                    "task_id": task_id,
                    "assignment_id": assignment_id,
                    "status": status
                }, updated_by)
                
                return True
        
        return False
    
    def _update_assignment_progress(self, assignment_id: str):
        """Update assignment progress based on task completion"""
        assignment = self.assignments[assignment_id]
        tasks = assignment["tasks"]
        
        if not tasks:
            assignment["progress"] = 0
        else:
            completed = sum(1 for t in tasks if t["status"] == "done")
            assignment["progress"] = int((completed / len(tasks)) * 100)
        
        # Update status based on progress
        if assignment["progress"] == 0:
            assignment["status"] = "assigned"
        elif assignment["progress"] == 100:
            assignment["status"] = "completed"
        elif assignment["progress"] > 0:
            assignment["status"] = "in_progress"
    
    def add_workspace_board(self, workspace_id: str, board_name: str, 
                           created_by: str, columns: List[str] = None) -> str:
        """Add a Kanban board to workspace"""
        if workspace_id not in self.workspaces:
            raise ValueError(f"Workspace {workspace_id} not found")
        
        board_id = str(uuid4())
        
        if not columns:
            columns = ["To Do", "In Progress", "Review", "Done"]
        
        board = {
            "id": board_id,
            "name": board_name,
            "created_by": created_by,
            "created_at": datetime.now().isoformat(),
            "columns": {col: [] for col in columns},
            "labels": [],
            "archived_cards": []
        }
        
        self.workspaces[workspace_id]["boards"][board_id] = board
        self._save_json(self.workspaces, self.workspaces_file)
        
        return board_id
    
    def add_board_card(self, workspace_id: str, board_id: str, column: str,
                      title: str, description: str, created_by: str) -> str:
        """Add a card to a board column"""
        if workspace_id not in self.workspaces:
            raise ValueError(f"Workspace {workspace_id} not found")
        
        workspace = self.workspaces[workspace_id]
        if board_id not in workspace["boards"]:
            raise ValueError(f"Board {board_id} not found")
        
        board = workspace["boards"][board_id]
        if column not in board["columns"]:
            raise ValueError(f"Column {column} not found")
        
        card_id = str(uuid4())
        
        card = {
            "id": card_id,
            "title": title,
            "description": description,
            "created_by": created_by,
            "created_at": datetime.now().isoformat(),
            "labels": [],
            "assignees": [],
            "due_date": None,
            "attachments": [],
            "comments": []
        }
        
        board["columns"][column].append(card)
        self._save_json(self.workspaces, self.workspaces_file)
        
        self._log_activity("card_created", {
            "card_id": card_id,
            "board_id": board_id,
            "workspace_id": workspace_id,
            "column": column,
            "title": title
        }, created_by)
        
        return card_id
    
    def share_document(self, workspace_id: str, title: str, content: str,
                      doc_type: str, shared_by: str) -> str:
        """Share a document in workspace"""
        if workspace_id not in self.workspaces:
            raise ValueError(f"Workspace {workspace_id} not found")
        
        doc_id = str(uuid4())
        
        document = {
            "id": doc_id,
            "title": title,
            "content": content,
            "type": doc_type,  # notes, requirements, design, code
            "shared_by": shared_by,
            "created_at": datetime.now().isoformat(),
            "last_modified": datetime.now().isoformat(),
            "version": 1,
            "editors": [shared_by],
            "viewers": []
        }
        
        self.workspaces[workspace_id]["documents"].append(document)
        self._save_json(self.workspaces, self.workspaces_file)
        
        self._log_activity("document_shared", {
            "doc_id": doc_id,
            "workspace_id": workspace_id,
            "title": title,
            "type": doc_type
        }, shared_by)
        
        return doc_id
    
    def _log_activity(self, activity_type: str, data: Dict, user_id: str):
        """Log team activity"""
        activity = {
            "id": str(uuid4()),
            "type": activity_type,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        
        self.activities.append(activity)
        
        # Keep only last 1000 activities
        if len(self.activities) > 1000:
            self.activities = self.activities[-1000:]
        
        self._save_json(self.activities, self.activities_file)
    
    def get_team_dashboard(self, team_id: str) -> Dict[str, Any]:
        """Get team dashboard data"""
        if team_id not in self.teams:
            return {}
        
        team = self.teams[team_id]
        
        # Get team workspaces
        team_workspaces = [
            ws for ws in self.workspaces.values() 
            if ws["team_id"] == team_id
        ]
        
        # Get team assignments
        team_assignments = [
            assign for assign in self.assignments.values()
            if assign["team_id"] == team_id
        ]
        
        # Calculate stats
        stats = {
            "member_count": len(team["members"]),
            "workspace_count": len(team_workspaces),
            "active_projects": len(team_assignments),
            "completed_projects": sum(1 for a in team_assignments if a["status"] == "completed"),
            "in_progress_projects": sum(1 for a in team_assignments if a["status"] == "in_progress"),
            "total_tasks": sum(len(a["tasks"]) for a in team_assignments),
            "completed_tasks": sum(
                sum(1 for t in a["tasks"] if t["status"] == "done")
                for a in team_assignments
            )
        }
        
        # Get recent activities
        recent_activities = [
            a for a in self.activities[-100:]
            if a.get("data", {}).get("team_id") == team_id
        ][-10:]
        
        return {
            "team": team,
            "workspaces": team_workspaces,
            "assignments": team_assignments,
            "stats": stats,
            "recent_activities": recent_activities
        }
    
    def get_user_teams(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all teams a user belongs to"""
        user_teams = []
        
        for team_id, team in self.teams.items():
            if user_id in team["members"]:
                user_teams.append({
                    "team": team,
                    "role": team["roles"].get(user_id, "member"),
                    "joined_at": team.get("created_at")  # TODO: Track join dates
                })
        
        return user_teams
    
    def export_team_report(self, team_id: str) -> str:
        """Export team activity report"""
        dashboard = self.get_team_dashboard(team_id)
        
        if not dashboard:
            return "Team not found"
        
        report = []
        report.append(f"# Team Report: {dashboard['team']['name']}")
        report.append(f"\nGenerated: {datetime.now().isoformat()}")
        report.append(f"\n## Overview")
        report.append(f"- Members: {dashboard['stats']['member_count']}")
        report.append(f"- Workspaces: {dashboard['stats']['workspace_count']}")
        report.append(f"- Active Projects: {dashboard['stats']['active_projects']}")
        report.append(f"- Completed Projects: {dashboard['stats']['completed_projects']}")
        report.append(f"- Task Completion: {dashboard['stats']['completed_tasks']}/{dashboard['stats']['total_tasks']}")
        
        report.append(f"\n## Active Assignments")
        for assignment in dashboard['assignments']:
            if assignment['status'] != 'completed':
                report.append(f"\n### {assignment['project_key']}")
                report.append(f"- Status: {assignment['status']}")
                report.append(f"- Progress: {assignment['progress']}%")
                report.append(f"- Tasks: {len(assignment['tasks'])}")
                report.append(f"- Assignees: {', '.join(assignment['assignees'])}")
        
        report.append(f"\n## Recent Activities")
        for activity in dashboard['recent_activities'][-10:]:
            report.append(f"- {activity['type']}: {activity['timestamp']}")
        
        return "\n".join(report)


def main():
    """CLI for team workspace management"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage team workspaces')
    parser.add_argument('action', choices=['create-team', 'add-member', 'create-workspace',
                                          'assign-project', 'create-task', 'view-team',
                                          'my-teams', 'export'])
    parser.add_argument('--name', help='Team/workspace name')
    parser.add_argument('--team-id', help='Team ID')
    parser.add_argument('--workspace-id', help='Workspace ID')
    parser.add_argument('--user-id', default='test_user', help='User ID')
    parser.add_argument('--project', help='Project key')
    parser.add_argument('--title', help='Task/document title')
    parser.add_argument('--description', help='Description')
    parser.add_argument('--role', default='member', help='Member role')
    
    args = parser.parse_args()
    
    workspace_system = TeamWorkspace()
    
    if args.action == 'create-team':
        if not args.name:
            print("Error: --name required")
            return
        
        team_id = workspace_system.create_team(
            args.name, args.user_id, args.description or ""
        )
        print(f"✅ Team created: {team_id}")
        print(f"   Name: {args.name}")
        
    elif args.action == 'add-member':
        if not args.team_id or not args.user_id:
            print("Error: --team-id and --user-id required")
            return
        
        success = workspace_system.add_team_member(
            args.team_id, args.user_id, args.user_id, args.role
        )
        if success:
            print(f"✅ Member added to team")
        else:
            print("❌ Failed to add member")
            
    elif args.action == 'create-workspace':
        if not args.name or not args.team_id:
            print("Error: --name and --team-id required")
            return
        
        ws_id = workspace_system.create_workspace(
            args.name, args.team_id, args.user_id
        )
        print(f"✅ Workspace created: {ws_id}")
        print(f"   Name: {args.name}")
        
    elif args.action == 'assign-project':
        if not args.project or not args.team_id:
            print("Error: --project and --team-id required")
            return
        
        assignment_id = workspace_system.assign_project(
            args.project, args.team_id, args.workspace_id or "",
            args.user_id
        )
        print(f"✅ Project assigned: {assignment_id}")
        
    elif args.action == 'create-task':
        # Would need assignment ID - simplified for demo
        print("Task creation requires assignment ID")
        
    elif args.action == 'view-team':
        if not args.team_id:
            print("Error: --team-id required")
            return
        
        dashboard = workspace_system.get_team_dashboard(args.team_id)
        if dashboard:
            print(f"\n👥 Team: {dashboard['team']['name']}")
            print(f"📊 Stats:")
            for key, value in dashboard['stats'].items():
                print(f"  {key}: {value}")
                
    elif args.action == 'my-teams':
        teams = workspace_system.get_user_teams(args.user_id)
        print(f"\n👥 Your Teams ({len(teams)}):")
        for team_info in teams:
            print(f"- {team_info['team']['name']} (Role: {team_info['role']})")
            
    elif args.action == 'export':
        if not args.team_id:
            print("Error: --team-id required")
            return
        
        report = workspace_system.export_team_report(args.team_id)
        filename = f"team_report_{args.team_id}.md"
        with open(filename, 'w') as f:
            f.write(report)
        print(f"✅ Report exported to: {filename}")


if __name__ == "__main__":
    main()