#!/usr/bin/env python3
"""
Tag Manager - Utility for managing project tags
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Set

class TagManager:
    def __init__(self, projects_path: str = "projects.json", tags_path: str = "project_tags.json"):
        """Initialize the tag manager."""
        self.projects_path = Path(projects_path)
        self.tags_path = Path(tags_path)
        self.projects = self.load_projects()
        self.tags = self.load_tags()
        
    def load_projects(self) -> Dict[str, Dict[str, Any]]:
        """Load projects from JSON file."""
        try:
            with open(self.projects_path, 'r') as f:
                data = json.load(f)
                if isinstance(data, dict) and 'projects' in data:
                    return data['projects']
                return {}
        except FileNotFoundError:
            print(f"Error: {self.projects_path} not found")
            return {}
            
    def load_tags(self) -> Dict[str, Any]:
        """Load tags from JSON file."""
        try:
            with open(self.tags_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {'project_tags': {}}
            
    def save_tags(self):
        """Save tags to JSON file."""
        with open(self.tags_path, 'w') as f:
            json.dump(self.tags, f, indent=2)
            
    def add_tag(self, project_key: str, tag: str) -> bool:
        """Add a tag to a project."""
        if project_key not in self.projects:
            print(f"❌ Project '{project_key}' not found")
            return False
            
        if 'project_tags' not in self.tags:
            self.tags['project_tags'] = {}
            
        if project_key not in self.tags['project_tags']:
            self.tags['project_tags'][project_key] = []
            
        if tag not in self.tags['project_tags'][project_key]:
            self.tags['project_tags'][project_key].append(tag)
            self.save_tags()
            print(f"✅ Added tag '{tag}' to project '{project_key}'")
            return True
        else:
            print(f"⚠️  Tag '{tag}' already exists for project '{project_key}'")
            return False
            
    def remove_tag(self, project_key: str, tag: str) -> bool:
        """Remove a tag from a project."""
        if project_key not in self.tags.get('project_tags', {}):
            print(f"❌ Project '{project_key}' has no tags")
            return False
            
        if tag in self.tags['project_tags'][project_key]:
            self.tags['project_tags'][project_key].remove(tag)
            self.save_tags()
            print(f"✅ Removed tag '{tag}' from project '{project_key}'")
            return True
        else:
            print(f"❌ Tag '{tag}' not found for project '{project_key}'")
            return False
            
    def rename_tag(self, old_tag: str, new_tag: str) -> int:
        """Rename a tag across all projects."""
        count = 0
        for project_key, project_tags in self.tags.get('project_tags', {}).items():
            if old_tag in project_tags:
                project_tags.remove(old_tag)
                if new_tag not in project_tags:
                    project_tags.append(new_tag)
                count += 1
                
        if count > 0:
            self.save_tags()
            print(f"✅ Renamed tag '{old_tag}' to '{new_tag}' in {count} projects")
        else:
            print(f"❌ Tag '{old_tag}' not found in any projects")
            
        return count
        
    def delete_tag(self, tag: str) -> int:
        """Delete a tag from all projects."""
        count = 0
        for project_key, project_tags in self.tags.get('project_tags', {}).items():
            if tag in project_tags:
                project_tags.remove(tag)
                count += 1
                
        if count > 0:
            self.save_tags()
            print(f"✅ Deleted tag '{tag}' from {count} projects")
        else:
            print(f"❌ Tag '{tag}' not found in any projects")
            
        return count
        
    def list_project_tags(self, project_key: str):
        """List all tags for a project."""
        if project_key not in self.projects:
            print(f"❌ Project '{project_key}' not found")
            return
            
        project_name = self.projects[project_key].get('name', project_key)
        tags = self.tags.get('project_tags', {}).get(project_key, [])
        
        print(f"🏷️  Tags for '{project_name}':")
        if not tags:
            print("   (no tags)")
        else:
            for tag in sorted(tags):
                print(f"   - {tag}")
                
    def find_untagged_projects(self) -> List[str]:
        """Find projects without any tags."""
        untagged = []
        for project_key in self.projects.keys():
            if project_key not in self.tags.get('project_tags', {}) or not self.tags['project_tags'][project_key]:
                untagged.append(project_key)
        return untagged
        
    def find_duplicate_tags(self) -> Dict[str, List[str]]:
        """Find projects with duplicate tags."""
        duplicates = {}
        for project_key, tags in self.tags.get('project_tags', {}).items():
            seen = set()
            dupes = []
            for tag in tags:
                if tag in seen:
                    dupes.append(tag)
                seen.add(tag)
            if dupes:
                duplicates[project_key] = dupes
        return duplicates
        
    def clean_tags(self) -> Dict[str, int]:
        """Clean up tag data."""
        stats = {
            'duplicates_removed': 0,
            'empty_projects_removed': 0,
            'invalid_projects_removed': 0
        }
        
        # Remove duplicates
        for project_key, tags in self.tags.get('project_tags', {}).items():
            original_count = len(tags)
            self.tags['project_tags'][project_key] = list(set(tags))  # Remove duplicates
            stats['duplicates_removed'] += original_count - len(self.tags['project_tags'][project_key])
            
        # Remove empty tag lists
        empty_projects = [k for k, v in self.tags.get('project_tags', {}).items() if not v]
        for project_key in empty_projects:
            del self.tags['project_tags'][project_key]
            stats['empty_projects_removed'] += 1
            
        # Remove projects that don't exist
        invalid_projects = [k for k in self.tags.get('project_tags', {}).keys() if k not in self.projects]
        for project_key in invalid_projects:
            del self.tags['project_tags'][project_key]
            stats['invalid_projects_removed'] += 1
            
        if any(stats.values()):
            self.save_tags()
            
        return stats
        
    def validate_tags(self) -> Dict[str, Any]:
        """Validate tag data integrity."""
        validation = {
            'total_projects': len(self.projects),
            'tagged_projects': len(self.tags.get('project_tags', {})),
            'untagged_projects': [],
            'duplicate_tags': {},
            'invalid_projects': [],
            'tag_statistics': {}
        }
        
        # Find untagged projects
        validation['untagged_projects'] = self.find_untagged_projects()
        
        # Find duplicate tags
        validation['duplicate_tags'] = self.find_duplicate_tags()
        
        # Find invalid projects
        validation['invalid_projects'] = [
            k for k in self.tags.get('project_tags', {}).keys() 
            if k not in self.projects
        ]
        
        # Tag statistics
        all_tags = []
        for tags in self.tags.get('project_tags', {}).values():
            all_tags.extend(tags)
            
        validation['tag_statistics'] = {
            'total_tags': len(all_tags),
            'unique_tags': len(set(all_tags)),
            'average_tags_per_project': len(all_tags) / max(1, validation['tagged_projects'])
        }
        
        return validation
        
    def export_tag_matrix(self) -> str:
        """Export tag matrix for analysis."""
        all_tags = set()
        for tags in self.tags.get('project_tags', {}).values():
            all_tags.update(tags)
            
        all_tags = sorted(all_tags)
        
        lines = ['project_key,' + ','.join(all_tags)]
        
        for project_key, project_tags in self.tags.get('project_tags', {}).items():
            row = [project_key]
            for tag in all_tags:
                row.append('1' if tag in project_tags else '0')
            lines.append(','.join(row))
            
        return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description="Tag Manager - Utility for managing project tags")
    
    # Tag management commands
    parser.add_argument("--add-tag", nargs=2, metavar=('PROJECT', 'TAG'), help="Add tag to project")
    parser.add_argument("--remove-tag", nargs=2, metavar=('PROJECT', 'TAG'), help="Remove tag from project")
    parser.add_argument("--rename-tag", nargs=2, metavar=('OLD_TAG', 'NEW_TAG'), help="Rename tag across all projects")
    parser.add_argument("--delete-tag", help="Delete tag from all projects")
    
    # Query commands
    parser.add_argument("--list-tags", help="List all tags for a project")
    parser.add_argument("--untagged", action="store_true", help="Find untagged projects")
    parser.add_argument("--duplicates", action="store_true", help="Find projects with duplicate tags")
    parser.add_argument("--validate", action="store_true", help="Validate tag data integrity")
    
    # Maintenance commands
    parser.add_argument("--clean", action="store_true", help="Clean up tag data")
    parser.add_argument("--export-matrix", help="Export tag matrix to CSV file")
    
    args = parser.parse_args()
    
    manager = TagManager()
    
    if args.add_tag:
        project_key, tag = args.add_tag
        manager.add_tag(project_key, tag)
        
    elif args.remove_tag:
        project_key, tag = args.remove_tag
        manager.remove_tag(project_key, tag)
        
    elif args.rename_tag:
        old_tag, new_tag = args.rename_tag
        manager.rename_tag(old_tag, new_tag)
        
    elif args.delete_tag:
        manager.delete_tag(args.delete_tag)
        
    elif args.list_tags:
        manager.list_project_tags(args.list_tags)
        
    elif args.untagged:
        untagged = manager.find_untagged_projects()
        print(f"📋 Found {len(untagged)} untagged projects:")
        for project_key in untagged:
            project_name = manager.projects.get(project_key, {}).get('name', project_key)
            print(f"   - {project_name} ({project_key})")
            
    elif args.duplicates:
        duplicates = manager.find_duplicate_tags()
        if duplicates:
            print(f"⚠️  Found {len(duplicates)} projects with duplicate tags:")
            for project_key, dupes in duplicates.items():
                project_name = manager.projects.get(project_key, {}).get('name', project_key)
                print(f"   - {project_name}: {', '.join(dupes)}")
        else:
            print("✅ No duplicate tags found")
            
    elif args.validate:
        validation = manager.validate_tags()
        print("🔍 Tag Data Validation Report:")
        print(f"📊 Total projects: {validation['total_projects']}")
        print(f"🏷️  Tagged projects: {validation['tagged_projects']}")
        print(f"❌ Untagged projects: {len(validation['untagged_projects'])}")
        print(f"⚠️  Duplicate tags: {len(validation['duplicate_tags'])}")
        print(f"🚫 Invalid projects: {len(validation['invalid_projects'])}")
        print(f"📈 Total tags: {validation['tag_statistics']['total_tags']}")
        print(f"🔖 Unique tags: {validation['tag_statistics']['unique_tags']}")
        print(f"📊 Avg tags per project: {validation['tag_statistics']['average_tags_per_project']:.1f}")
        
    elif args.clean:
        stats = manager.clean_tags()
        print("🧹 Tag Data Cleanup Results:")
        print(f"🔄 Duplicates removed: {stats['duplicates_removed']}")
        print(f"🗑️  Empty projects removed: {stats['empty_projects_removed']}")
        print(f"❌ Invalid projects removed: {stats['invalid_projects_removed']}")
        
    elif args.export_matrix:
        matrix = manager.export_tag_matrix()
        with open(args.export_matrix, 'w') as f:
            f.write(matrix)
        print(f"📤 Tag matrix exported to {args.export_matrix}")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()