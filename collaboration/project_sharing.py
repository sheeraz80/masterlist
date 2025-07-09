#!/usr/bin/env python3
"""
Project Sharing and Collaboration Hub
Enables sharing, forking, and collaborative development of project ideas
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from uuid import uuid4
import hashlib

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class ProjectSharingHub:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.shared_projects_file = os.path.join(data_dir, "shared_projects.json")
        self.project_forks_file = os.path.join(data_dir, "project_forks.json")
        self.collaborators_file = os.path.join(data_dir, "project_collaborators.json")
        self.share_links_file = os.path.join(data_dir, "share_links.json")
        self.project_versions_file = os.path.join(data_dir, "project_versions.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Load existing data
        self.shared_projects = self._load_json(self.shared_projects_file, {})
        self.project_forks = self._load_json(self.project_forks_file, {})
        self.collaborators = self._load_json(self.collaborators_file, {})
        self.share_links = self._load_json(self.share_links_file, {})
        self.project_versions = self._load_json(self.project_versions_file, {})
    
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
    
    def share_project(self, project_key: str, shared_by: str, 
                     visibility: str = "public", settings: Dict = None) -> str:
        """Share a project with the community"""
        share_id = str(uuid4())
        
        self.shared_projects[share_id] = {
            "id": share_id,
            "project_key": project_key,
            "shared_by": shared_by,
            "shared_at": datetime.now().isoformat(),
            "visibility": visibility,  # public, unlisted, private
            "settings": settings or {
                "allow_forks": True,
                "allow_comments": True,
                "require_attribution": True,
                "license": "CC-BY-4.0"
            },
            "stats": {
                "views": 0,
                "forks": 0,
                "stars": 0,
                "collaborators": 1
            },
            "tags": [],
            "featured": False
        }
        
        # Initialize collaborators
        self.collaborators[share_id] = {
            shared_by: {
                "role": "owner",
                "joined_at": datetime.now().isoformat(),
                "permissions": ["read", "write", "admin"]
            }
        }
        
        self._save_json(self.shared_projects, self.shared_projects_file)
        self._save_json(self.collaborators, self.collaborators_file)
        
        return share_id
    
    def create_share_link(self, share_id: str, created_by: str, 
                         expires_in_days: int = 30, max_uses: int = None) -> str:
        """Create a shareable link for a project"""
        if share_id not in self.shared_projects:
            raise ValueError(f"Shared project {share_id} not found")
        
        # Check permissions
        if not self._has_permission(share_id, created_by, "admin"):
            raise PermissionError("User doesn't have permission to create share links")
        
        # Generate unique link token
        link_data = f"{share_id}{created_by}{datetime.now().isoformat()}"
        link_token = hashlib.sha256(link_data.encode()).hexdigest()[:16]
        
        expiry = None
        if expires_in_days:
            expiry = (datetime.now() + 
                     datetime.timedelta(days=expires_in_days)).isoformat()
        
        self.share_links[link_token] = {
            "token": link_token,
            "share_id": share_id,
            "created_by": created_by,
            "created_at": datetime.now().isoformat(),
            "expires_at": expiry,
            "max_uses": max_uses,
            "uses": 0,
            "active": True
        }
        
        self._save_json(self.share_links, self.share_links_file)
        
        return f"https://masterlist.app/share/{link_token}"
    
    def fork_project(self, share_id: str, forked_by: str, 
                    fork_name: str = None) -> str:
        """Fork a shared project"""
        if share_id not in self.shared_projects:
            raise ValueError(f"Shared project {share_id} not found")
        
        original = self.shared_projects[share_id]
        
        # Check if forking is allowed
        if not original["settings"].get("allow_forks", True):
            raise PermissionError("This project doesn't allow forks")
        
        fork_id = str(uuid4())
        
        self.project_forks[fork_id] = {
            "id": fork_id,
            "original_share_id": share_id,
            "original_project_key": original["project_key"],
            "forked_by": forked_by,
            "forked_at": datetime.now().isoformat(),
            "fork_name": fork_name or f"{original['project_key']}-fork",
            "upstream_sync": True,
            "changes": [],
            "merge_requests": []
        }
        
        # Update original project stats
        original["stats"]["forks"] += 1
        self._save_json(self.shared_projects, self.shared_projects_file)
        self._save_json(self.project_forks, self.project_forks_file)
        
        # Create a new shared project for the fork
        fork_share_id = self.share_project(
            self.project_forks[fork_id]["fork_name"],
            forked_by,
            "public",
            {
                "allow_forks": True,
                "allow_comments": True,
                "require_attribution": True,
                "license": original["settings"].get("license", "CC-BY-4.0"),
                "forked_from": share_id
            }
        )
        
        self.project_forks[fork_id]["fork_share_id"] = fork_share_id
        self._save_json(self.project_forks, self.project_forks_file)
        
        return fork_id
    
    def add_collaborator(self, share_id: str, user_id: str, added_by: str,
                        role: str = "contributor") -> bool:
        """Add a collaborator to a shared project"""
        if share_id not in self.shared_projects:
            return False
        
        # Check permissions
        if not self._has_permission(share_id, added_by, "admin"):
            return False
        
        if share_id not in self.collaborators:
            self.collaborators[share_id] = {}
        
        if user_id not in self.collaborators[share_id]:
            permissions = {
                "viewer": ["read"],
                "contributor": ["read", "write"],
                "maintainer": ["read", "write", "admin"]
            }
            
            self.collaborators[share_id][user_id] = {
                "role": role,
                "joined_at": datetime.now().isoformat(),
                "permissions": permissions.get(role, ["read"]),
                "added_by": added_by
            }
            
            # Update stats
            self.shared_projects[share_id]["stats"]["collaborators"] += 1
            
            self._save_json(self.collaborators, self.collaborators_file)
            self._save_json(self.shared_projects, self.shared_projects_file)
            
            return True
        
        return False
    
    def create_version(self, share_id: str, user_id: str, 
                      version_name: str, changes: List[str], 
                      project_data: Dict) -> str:
        """Create a new version of a shared project"""
        if not self._has_permission(share_id, user_id, "write"):
            raise PermissionError("User doesn't have write permission")
        
        if share_id not in self.project_versions:
            self.project_versions[share_id] = []
        
        # Get current version number
        version_num = len(self.project_versions[share_id]) + 1
        
        version_id = str(uuid4())
        
        version = {
            "id": version_id,
            "version": f"v{version_num}.0",
            "name": version_name,
            "created_by": user_id,
            "created_at": datetime.now().isoformat(),
            "changes": changes,
            "data": project_data,
            "downloads": 0
        }
        
        self.project_versions[share_id].append(version)
        self._save_json(self.project_versions, self.project_versions_file)
        
        return version_id
    
    def star_project(self, share_id: str, user_id: str) -> bool:
        """Star/unstar a project"""
        if share_id not in self.shared_projects:
            return False
        
        project = self.shared_projects[share_id]
        
        if "starred_by" not in project:
            project["starred_by"] = []
        
        if user_id in project["starred_by"]:
            # Unstar
            project["starred_by"].remove(user_id)
            project["stats"]["stars"] -= 1
        else:
            # Star
            project["starred_by"].append(user_id)
            project["stats"]["stars"] += 1
        
        self._save_json(self.shared_projects, self.shared_projects_file)
        return True
    
    def create_merge_request(self, fork_id: str, title: str, 
                           description: str, created_by: str) -> str:
        """Create a merge request from fork to original"""
        if fork_id not in self.project_forks:
            raise ValueError(f"Fork {fork_id} not found")
        
        fork = self.project_forks[fork_id]
        
        if fork["forked_by"] != created_by:
            raise PermissionError("Only fork owner can create merge requests")
        
        mr_id = str(uuid4())
        
        merge_request = {
            "id": mr_id,
            "title": title,
            "description": description,
            "created_by": created_by,
            "created_at": datetime.now().isoformat(),
            "status": "open",  # open, merged, closed
            "reviews": [],
            "comments": []
        }
        
        fork["merge_requests"].append(merge_request)
        self._save_json(self.project_forks, self.project_forks_file)
        
        return mr_id
    
    def _has_permission(self, share_id: str, user_id: str, 
                       permission: str) -> bool:
        """Check if user has permission on shared project"""
        if share_id not in self.collaborators:
            return False
        
        if user_id not in self.collaborators[share_id]:
            return False
        
        user_perms = self.collaborators[share_id][user_id]["permissions"]
        return permission in user_perms
    
    def get_shared_projects(self, visibility: str = None, 
                           featured_only: bool = False) -> List[Dict]:
        """Get list of shared projects"""
        projects = []
        
        for share_id, project in self.shared_projects.items():
            if visibility and project["visibility"] != visibility:
                continue
            
            if featured_only and not project.get("featured", False):
                continue
            
            projects.append(project)
        
        # Sort by stars and recency
        projects.sort(
            key=lambda x: (x["stats"]["stars"], x["shared_at"]), 
            reverse=True
        )
        
        return projects
    
    def get_user_shared_projects(self, user_id: str) -> Dict[str, List[Dict]]:
        """Get all projects shared by or involving a user"""
        result = {
            "owned": [],
            "collaborating": [],
            "forked": [],
            "starred": []
        }
        
        # Owned projects
        for share_id, project in self.shared_projects.items():
            if project["shared_by"] == user_id:
                result["owned"].append(project)
            
            # Starred projects
            if user_id in project.get("starred_by", []):
                result["starred"].append(project)
        
        # Collaborating projects
        for share_id, collabs in self.collaborators.items():
            if user_id in collabs and share_id in self.shared_projects:
                if self.shared_projects[share_id]["shared_by"] != user_id:
                    result["collaborating"].append(self.shared_projects[share_id])
        
        # Forked projects
        for fork_id, fork in self.project_forks.items():
            if fork["forked_by"] == user_id:
                result["forked"].append(fork)
        
        return result
    
    def get_sharing_stats(self) -> Dict[str, Any]:
        """Get overall sharing statistics"""
        total_shared = len(self.shared_projects)
        total_forks = len(self.project_forks)
        total_stars = sum(p["stats"]["stars"] for p in self.shared_projects.values())
        total_collaborators = sum(
            len(collabs) for collabs in self.collaborators.values()
        )
        
        # Most forked projects
        most_forked = sorted(
            self.shared_projects.values(),
            key=lambda x: x["stats"]["forks"],
            reverse=True
        )[:5]
        
        # Most starred projects
        most_starred = sorted(
            self.shared_projects.values(),
            key=lambda x: x["stats"]["stars"],
            reverse=True
        )[:5]
        
        return {
            "total_shared_projects": total_shared,
            "total_forks": total_forks,
            "total_stars": total_stars,
            "total_collaborators": total_collaborators,
            "most_forked_projects": [
                {"project_key": p["project_key"], "forks": p["stats"]["forks"]}
                for p in most_forked
            ],
            "most_starred_projects": [
                {"project_key": p["project_key"], "stars": p["stats"]["stars"]}
                for p in most_starred
            ],
            "visibility_breakdown": {
                "public": sum(1 for p in self.shared_projects.values() 
                            if p["visibility"] == "public"),
                "unlisted": sum(1 for p in self.shared_projects.values() 
                              if p["visibility"] == "unlisted"),
                "private": sum(1 for p in self.shared_projects.values() 
                             if p["visibility"] == "private")
            }
        }


def main():
    """CLI for project sharing"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Project sharing and collaboration')
    parser.add_argument('action', choices=['share', 'fork', 'star', 'add-collaborator',
                                          'create-link', 'list-shared', 'my-projects',
                                          'stats'])
    parser.add_argument('--project', help='Project key')
    parser.add_argument('--share-id', help='Share ID')
    parser.add_argument('--user', default='test_user', help='User ID')
    parser.add_argument('--visibility', choices=['public', 'unlisted', 'private'],
                       default='public', help='Project visibility')
    parser.add_argument('--role', default='contributor', help='Collaborator role')
    parser.add_argument('--featured', action='store_true', help='Show only featured')
    
    args = parser.parse_args()
    
    sharing_hub = ProjectSharingHub()
    
    if args.action == 'share':
        if not args.project:
            print("Error: --project required")
            return
        
        share_id = sharing_hub.share_project(
            args.project, args.user, args.visibility
        )
        print(f"✅ Project shared: {share_id}")
        print(f"   Visibility: {args.visibility}")
        
    elif args.action == 'fork':
        if not args.share_id:
            print("Error: --share-id required")
            return
        
        fork_id = sharing_hub.fork_project(args.share_id, args.user)
        print(f"✅ Project forked: {fork_id}")
        
    elif args.action == 'star':
        if not args.share_id:
            print("Error: --share-id required")
            return
        
        sharing_hub.star_project(args.share_id, args.user)
        print(f"✅ Project starred/unstarred")
        
    elif args.action == 'add-collaborator':
        if not args.share_id:
            print("Error: --share-id required")
            return
        
        success = sharing_hub.add_collaborator(
            args.share_id, args.user, args.user, args.role
        )
        if success:
            print(f"✅ Collaborator added with role: {args.role}")
        else:
            print("❌ Failed to add collaborator")
            
    elif args.action == 'create-link':
        if not args.share_id:
            print("Error: --share-id required")
            return
        
        link = sharing_hub.create_share_link(args.share_id, args.user)
        print(f"✅ Share link created: {link}")
        
    elif args.action == 'list-shared':
        projects = sharing_hub.get_shared_projects(
            args.visibility, args.featured
        )
        print(f"\n📦 Shared Projects ({len(projects)}):")
        for project in projects[:10]:
            print(f"- {project['project_key']} by {project['shared_by']}")
            print(f"  ⭐ {project['stats']['stars']} | 🍴 {project['stats']['forks']}")
            
    elif args.action == 'my-projects':
        user_projects = sharing_hub.get_user_shared_projects(args.user)
        
        print(f"\n👤 Your Projects:")
        print(f"Owned: {len(user_projects['owned'])}")
        print(f"Collaborating: {len(user_projects['collaborating'])}")
        print(f"Forked: {len(user_projects['forked'])}")
        print(f"Starred: {len(user_projects['starred'])}")
        
    elif args.action == 'stats':
        stats = sharing_hub.get_sharing_stats()
        print("\n📊 Sharing Statistics:")
        for key, value in stats.items():
            if isinstance(value, dict) or isinstance(value, list):
                print(f"{key}:")
                if isinstance(value, dict):
                    for k, v in value.items():
                        print(f"  {k}: {v}")
                else:
                    for item in value[:3]:
                        print(f"  - {item}")
            else:
                print(f"{key}: {value}")


if __name__ == "__main__":
    main()