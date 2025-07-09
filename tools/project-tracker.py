#!/usr/bin/env python3
"""
Project Tracker - Development workflow and progress tracking
Provides project lifecycle management, milestone tracking, and progress monitoring.
"""

import json
import argparse
import sys
import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
import uuid

class ProjectStatus(Enum):
    """Project status enumeration"""
    IDEA = "idea"
    RESEARCH = "research"
    PLANNING = "planning"
    IN_DEVELOPMENT = "in_development"
    TESTING = "testing"
    DEPLOYED = "deployed"
    MAINTENANCE = "maintenance"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class Priority(Enum):
    """Priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ProjectTracker:
    def __init__(self, data_path: str = "projects.json", tracking_path: str = "project_tracking.json"):
        """Initialize the project tracker."""
        self.data_path = Path(data_path)
        self.tracking_path = Path(tracking_path)
        self.projects = self.load_projects()
        self.tracking_data = self.load_tracking_data()
        
    def load_projects(self) -> List[Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.data_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: {self.data_path} not found")
            return []
            
    def load_tracking_data(self) -> Dict[str, Any]:
        """Load tracking data from JSON file."""
        try:
            with open(self.tracking_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                'tracked_projects': {},
                'milestones': {},
                'team_assignments': {},
                'time_logs': {},
                'metadata': {
                    'created': datetime.now().isoformat(),
                    'last_updated': datetime.now().isoformat()
                }
            }
            
    def save_tracking_data(self):
        """Save tracking data to JSON file."""
        self.tracking_data['metadata']['last_updated'] = datetime.now().isoformat()
        with open(self.tracking_path, 'w') as f:
            json.dump(self.tracking_data, f, indent=2)
            
    def start_project(self, project_name: str, team_members: List[str] = None, 
                     priority: str = "medium", estimated_timeline: int = None) -> str:
        """Start tracking a new project."""
        # Find the project in the database
        project_data = None
        for project in self.projects:
            if project['name'].lower() == project_name.lower():
                project_data = project
                break
                
        if not project_data:
            print(f"Error: Project '{project_name}' not found in database")
            return None
            
        # Create tracking entry
        tracking_id = str(uuid.uuid4())
        
        self.tracking_data['tracked_projects'][tracking_id] = {
            'project_name': project_name,
            'project_data': project_data,
            'status': ProjectStatus.PLANNING.value,
            'priority': priority,
            'team_members': team_members or [],
            'estimated_timeline': estimated_timeline or project_data.get('development_time', 30),
            'actual_timeline': None,
            'start_date': datetime.now().isoformat(),
            'end_date': None,
            'progress_percentage': 0,
            'budget_allocated': 0,
            'budget_spent': 0,
            'notes': [],
            'risks': [],
            'dependencies': [],
            'created': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat()
        }
        
        # Initialize milestones
        self.tracking_data['milestones'][tracking_id] = self.create_default_milestones(project_data)
        
        # Initialize team assignments
        if team_members:
            self.tracking_data['team_assignments'][tracking_id] = {
                member: {'role': 'developer', 'allocation': 100} 
                for member in team_members
            }
        
        self.save_tracking_data()
        print(f"Started tracking project: {project_name} (ID: {tracking_id})")
        return tracking_id
        
    def create_default_milestones(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create default milestones for a project."""
        development_time = project_data.get('development_time', 30)
        complexity = project_data.get('technical_complexity', 5)
        
        # Adjust milestones based on complexity
        if complexity <= 3:
            milestones = [
                {'name': 'Requirements Analysis', 'percentage': 10},
                {'name': 'Design & Architecture', 'percentage': 20},
                {'name': 'Core Development', 'percentage': 60},
                {'name': 'Testing & QA', 'percentage': 85},
                {'name': 'Deployment', 'percentage': 95},
                {'name': 'Launch & Monitoring', 'percentage': 100}
            ]
        elif complexity <= 6:
            milestones = [
                {'name': 'Research & Analysis', 'percentage': 10},
                {'name': 'Technical Planning', 'percentage': 20},
                {'name': 'Prototype Development', 'percentage': 35},
                {'name': 'Core Feature Development', 'percentage': 60},
                {'name': 'Integration & Testing', 'percentage': 80},
                {'name': 'User Testing', 'percentage': 90},
                {'name': 'Deployment & Launch', 'percentage': 100}
            ]
        else:  # High complexity
            milestones = [
                {'name': 'Feasibility Study', 'percentage': 5},
                {'name': 'Technical Architecture', 'percentage': 15},
                {'name': 'Risk Assessment', 'percentage': 20},
                {'name': 'MVP Development', 'percentage': 40},
                {'name': 'Core Features', 'percentage': 65},
                {'name': 'Advanced Features', 'percentage': 80},
                {'name': 'Integration Testing', 'percentage': 90},
                {'name': 'Performance Optimization', 'percentage': 95},
                {'name': 'Production Deployment', 'percentage': 100}
            ]
            
        # Add dates to milestones
        start_date = datetime.now()
        for i, milestone in enumerate(milestones):
            days_offset = int((milestone['percentage'] / 100) * development_time)
            milestone_date = start_date + timedelta(days=days_offset)
            milestone.update({
                'id': str(uuid.uuid4()),
                'target_date': milestone_date.isoformat(),
                'actual_date': None,
                'status': 'pending',
                'notes': ''
            })
            
        return milestones
        
    def update_project_status(self, tracking_id: str, status: str, notes: str = None):
        """Update project status."""
        if tracking_id not in self.tracking_data['tracked_projects']:
            print(f"Error: Project with ID {tracking_id} not found")
            return
            
        try:
            status_enum = ProjectStatus(status)
        except ValueError:
            print(f"Error: Invalid status '{status}'. Valid statuses: {[s.value for s in ProjectStatus]}")
            return
            
        project = self.tracking_data['tracked_projects'][tracking_id]
        old_status = project['status']
        project['status'] = status
        project['last_updated'] = datetime.now().isoformat()
        
        if notes:
            project['notes'].append({
                'date': datetime.now().isoformat(),
                'type': 'status_update',
                'content': f"Status changed from {old_status} to {status}: {notes}"
            })
        
        # Auto-update progress based on status
        status_progress_mapping = {
            ProjectStatus.IDEA.value: 0,
            ProjectStatus.RESEARCH.value: 10,
            ProjectStatus.PLANNING.value: 20,
            ProjectStatus.IN_DEVELOPMENT.value: 50,
            ProjectStatus.TESTING.value: 80,
            ProjectStatus.DEPLOYED.value: 95,
            ProjectStatus.COMPLETED.value: 100
        }
        
        if status in status_progress_mapping:
            project['progress_percentage'] = status_progress_mapping[status]
            
        self.save_tracking_data()
        print(f"Updated project status to: {status}")
        
    def complete_milestone(self, tracking_id: str, milestone_id: str, notes: str = None):
        """Mark a milestone as completed."""
        if tracking_id not in self.tracking_data['milestones']:
            print(f"Error: No milestones found for project {tracking_id}")
            return
            
        milestones = self.tracking_data['milestones'][tracking_id]
        milestone = None
        
        for m in milestones:
            if m['id'] == milestone_id:
                milestone = m
                break
                
        if not milestone:
            print(f"Error: Milestone {milestone_id} not found")
            return
            
        milestone['status'] = 'completed'
        milestone['actual_date'] = datetime.now().isoformat()
        if notes:
            milestone['notes'] = notes
            
        # Update project progress
        project = self.tracking_data['tracked_projects'][tracking_id]
        project['progress_percentage'] = milestone['percentage']
        project['last_updated'] = datetime.now().isoformat()
        
        self.save_tracking_data()
        print(f"Completed milestone: {milestone['name']}")
        
    def log_time(self, tracking_id: str, team_member: str, hours: float, 
                task: str, date: str = None):
        """Log time spent on a project."""
        if tracking_id not in self.tracking_data['tracked_projects']:
            print(f"Error: Project with ID {tracking_id} not found")
            return
            
        if tracking_id not in self.tracking_data['time_logs']:
            self.tracking_data['time_logs'][tracking_id] = []
            
        log_entry = {
            'id': str(uuid.uuid4()),
            'team_member': team_member,
            'hours': hours,
            'task': task,
            'date': date or datetime.now().isoformat(),
            'logged_at': datetime.now().isoformat()
        }
        
        self.tracking_data['time_logs'][tracking_id].append(log_entry)
        self.save_tracking_data()
        print(f"Logged {hours} hours for {team_member} on task: {task}")
        
    def get_project_dashboard(self, tracking_id: str) -> Dict[str, Any]:
        """Get comprehensive project dashboard."""
        if tracking_id not in self.tracking_data['tracked_projects']:
            return {'error': 'Project not found'}
            
        project = self.tracking_data['tracked_projects'][tracking_id]
        milestones = self.tracking_data['milestones'].get(tracking_id, [])
        time_logs = self.tracking_data['time_logs'].get(tracking_id, [])
        
        # Calculate time statistics
        total_hours = sum(log['hours'] for log in time_logs)
        team_hours = {}
        for log in time_logs:
            team_hours[log['team_member']] = team_hours.get(log['team_member'], 0) + log['hours']
            
        # Calculate milestone progress
        completed_milestones = len([m for m in milestones if m['status'] == 'completed'])
        total_milestones = len(milestones)
        
        # Calculate timeline metrics
        start_date = datetime.fromisoformat(project['start_date'])
        days_elapsed = (datetime.now() - start_date).days
        estimated_days = project['estimated_timeline']
        
        dashboard = {
            'project_info': {
                'name': project['project_name'],
                'status': project['status'],
                'priority': project['priority'],
                'progress': project['progress_percentage'],
                'team_members': project['team_members']
            },
            'timeline': {
                'start_date': project['start_date'],
                'estimated_days': estimated_days,
                'days_elapsed': days_elapsed,
                'days_remaining': max(0, estimated_days - days_elapsed),
                'on_schedule': days_elapsed <= estimated_days * (project['progress_percentage'] / 100)
            },
            'milestones': {
                'completed': completed_milestones,
                'total': total_milestones,
                'percentage': (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0,
                'next_milestone': next((m for m in milestones if m['status'] == 'pending'), None)
            },
            'time_tracking': {
                'total_hours': total_hours,
                'team_hours': team_hours,
                'avg_hours_per_day': total_hours / max(1, days_elapsed)
            },
            'budget': {
                'allocated': project['budget_allocated'],
                'spent': project['budget_spent'],
                'remaining': project['budget_allocated'] - project['budget_spent']
            },
            'risks': project['risks'],
            'recent_notes': project['notes'][-5:] if project['notes'] else []
        }
        
        return dashboard
        
    def get_team_workload(self) -> Dict[str, Any]:
        """Get team workload across all projects."""
        team_workload = {}
        
        for tracking_id, project in self.tracking_data['tracked_projects'].items():
            if project['status'] in ['in_development', 'testing', 'planning']:
                for member in project['team_members']:
                    if member not in team_workload:
                        team_workload[member] = {
                            'active_projects': 0,
                            'total_hours_logged': 0,
                            'projects': []
                        }
                    
                    workload = team_workload[member]
                    workload['active_projects'] += 1
                    workload['projects'].append({
                        'name': project['project_name'],
                        'status': project['status'],
                        'progress': project['progress_percentage']
                    })
                    
                    # Add time logs
                    time_logs = self.tracking_data['time_logs'].get(tracking_id, [])
                    member_hours = sum(log['hours'] for log in time_logs if log['team_member'] == member)
                    workload['total_hours_logged'] += member_hours
                    
        return team_workload
        
    def generate_progress_report(self, tracking_id: str = None) -> str:
        """Generate progress report for a project or all projects."""
        if tracking_id:
            return self.generate_single_project_report(tracking_id)
        else:
            return self.generate_all_projects_report()
            
    def generate_single_project_report(self, tracking_id: str) -> str:
        """Generate detailed report for a single project."""
        dashboard = self.get_project_dashboard(tracking_id)
        
        if 'error' in dashboard:
            return f"Error: {dashboard['error']}"
            
        report = []
        report.append(f"# Project Progress Report: {dashboard['project_info']['name']}")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Project overview
        info = dashboard['project_info']
        report.append("## Project Overview")
        report.append(f"- **Status**: {info['status'].replace('_', ' ').title()}")
        report.append(f"- **Priority**: {info['priority'].title()}")
        report.append(f"- **Progress**: {info['progress']}%")
        report.append(f"- **Team**: {', '.join(info['team_members'])}")
        report.append("")
        
        # Timeline
        timeline = dashboard['timeline']
        report.append("## Timeline")
        report.append(f"- **Start Date**: {timeline['start_date'][:10]}")
        report.append(f"- **Estimated Duration**: {timeline['estimated_days']} days")
        report.append(f"- **Days Elapsed**: {timeline['days_elapsed']}")
        report.append(f"- **Days Remaining**: {timeline['days_remaining']}")
        report.append(f"- **On Schedule**: {'Yes' if timeline['on_schedule'] else 'No'}")
        report.append("")
        
        # Milestones
        milestones = dashboard['milestones']
        report.append("## Milestones")
        report.append(f"- **Completed**: {milestones['completed']}/{milestones['total']} ({milestones['percentage']:.1f}%)")
        
        if milestones['next_milestone']:
            next_milestone = milestones['next_milestone']
            report.append(f"- **Next Milestone**: {next_milestone['name']} (Target: {next_milestone['target_date'][:10]})")
        
        report.append("")
        
        # Time tracking
        time_data = dashboard['time_tracking']
        report.append("## Time Tracking")
        report.append(f"- **Total Hours**: {time_data['total_hours']:.1f}")
        report.append(f"- **Average Hours/Day**: {time_data['avg_hours_per_day']:.1f}")
        
        if time_data['team_hours']:
            report.append("- **Hours by Team Member**:")
            for member, hours in time_data['team_hours'].items():
                report.append(f"  - {member}: {hours:.1f} hours")
        
        report.append("")
        
        # Recent activity
        if dashboard['recent_notes']:
            report.append("## Recent Activity")
            for note in dashboard['recent_notes'][-3:]:
                report.append(f"- **{note['date'][:10]}**: {note['content']}")
        
        return "\n".join(report)
        
    def generate_all_projects_report(self) -> str:
        """Generate summary report for all tracked projects."""
        report = []
        report.append("# All Projects Progress Report")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Project statistics
        active_projects = 0
        completed_projects = 0
        on_hold_projects = 0
        
        for project in self.tracking_data['tracked_projects'].values():
            if project['status'] in ['in_development', 'testing', 'planning']:
                active_projects += 1
            elif project['status'] == 'completed':
                completed_projects += 1
            elif project['status'] == 'on_hold':
                on_hold_projects += 1
                
        report.append("## Project Statistics")
        report.append(f"- **Active Projects**: {active_projects}")
        report.append(f"- **Completed Projects**: {completed_projects}")
        report.append(f"- **On Hold Projects**: {on_hold_projects}")
        report.append(f"- **Total Tracked Projects**: {len(self.tracking_data['tracked_projects'])}")
        report.append("")
        
        # Active projects summary
        if active_projects > 0:
            report.append("## Active Projects")
            for tracking_id, project in self.tracking_data['tracked_projects'].items():
                if project['status'] in ['in_development', 'testing', 'planning']:
                    report.append(f"- **{project['project_name']}** ({project['status'].replace('_', ' ').title()})")
                    report.append(f"  - Progress: {project['progress_percentage']}%")
                    report.append(f"  - Team: {', '.join(project['team_members'])}")
                    report.append(f"  - Priority: {project['priority'].title()}")
                    report.append("")
        
        # Team workload
        team_workload = self.get_team_workload()
        if team_workload:
            report.append("## Team Workload")
            for member, workload in team_workload.items():
                report.append(f"- **{member}**: {workload['active_projects']} active projects, "
                            f"{workload['total_hours_logged']:.1f} hours logged")
        
        return "\n".join(report)

def main():
    parser = argparse.ArgumentParser(description="Project development tracking and management")
    parser.add_argument("--start", "-s", help="Start tracking a project")
    parser.add_argument("--status", help="Update project status")
    parser.add_argument("--milestone", help="Complete a milestone")
    parser.add_argument("--log-time", help="Log time spent on project")
    parser.add_argument("--dashboard", "-d", help="Show project dashboard")
    parser.add_argument("--report", "-r", help="Generate progress report")
    parser.add_argument("--team-workload", "-w", action="store_true", help="Show team workload")
    parser.add_argument("--list", "-l", action="store_true", help="List all tracked projects")
    
    # Additional parameters
    parser.add_argument("--tracking-id", help="Project tracking ID")
    parser.add_argument("--team-members", help="Team members (comma-separated)")
    parser.add_argument("--priority", choices=['low', 'medium', 'high', 'urgent'], 
                       default='medium', help="Project priority")
    parser.add_argument("--timeline", type=int, help="Estimated timeline in days")
    parser.add_argument("--hours", type=float, help="Hours to log")
    parser.add_argument("--task", help="Task description for time logging")
    parser.add_argument("--member", help="Team member name")
    parser.add_argument("--notes", help="Additional notes")
    
    args = parser.parse_args()
    
    tracker = ProjectTracker()
    
    if args.start:
        team_members = args.team_members.split(',') if args.team_members else []
        tracking_id = tracker.start_project(
            args.start, 
            team_members, 
            args.priority, 
            args.timeline
        )
        
    elif args.status:
        if not args.tracking_id:
            print("Error: --tracking-id required for status update")
            return
        tracker.update_project_status(args.tracking_id, args.status, args.notes)
        
    elif args.milestone:
        if not args.tracking_id:
            print("Error: --tracking-id required for milestone completion")
            return
        tracker.complete_milestone(args.tracking_id, args.milestone, args.notes)
        
    elif args.log_time:
        if not all([args.tracking_id, args.member, args.hours, args.task]):
            print("Error: --tracking-id, --member, --hours, and --task required for time logging")
            return
        tracker.log_time(args.tracking_id, args.member, args.hours, args.task)
        
    elif args.dashboard:
        dashboard = tracker.get_project_dashboard(args.dashboard)
        if 'error' in dashboard:
            print(f"Error: {dashboard['error']}")
        else:
            print(json.dumps(dashboard, indent=2))
            
    elif args.report:
        report = tracker.generate_progress_report(args.report)
        print(report)
        
    elif args.team_workload:
        workload = tracker.get_team_workload()
        print("Team Workload Summary:")
        print("=" * 50)
        for member, data in workload.items():
            print(f"{member}: {data['active_projects']} projects, {data['total_hours_logged']:.1f} hours")
            
    elif args.list:
        print("Tracked Projects:")
        print("=" * 50)
        for tracking_id, project in tracker.tracking_data['tracked_projects'].items():
            print(f"{tracking_id}: {project['project_name']} ({project['status']})")
            
    else:
        parser.print_help()

if __name__ == "__main__":
    main()