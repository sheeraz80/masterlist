#!/usr/bin/env python3
"""
Backup and Restore Utilities - Data protection for project management
"""

import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime
import tarfile
import os
import sys

class BackupRestore:
    def __init__(self, base_path: str = "."):
        """Initialize backup and restore utilities."""
        self.base_path = Path(base_path)
        self.backup_dir = self.base_path / "backups"
        self.backup_dir.mkdir(exist_ok=True)
        
        # Files to backup
        self.important_files = [
            "projects.json",
            "project_tags.json",
            "project_tracking.json",
            "masterlist_config.json",
            "consolidated_projects.json",
            "parsed_masterlist.json"
        ]
        
        # Directories to backup
        self.important_dirs = [
            "projects",
            "scripts",
            "tools",
            "utils",
            "views"
        ]
        
    def create_backup(self, name: str = None) -> str:
        """Create a comprehensive backup."""
        if not name:
            name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
        backup_path = self.backup_dir / f"{name}.tar.gz"
        
        with tarfile.open(backup_path, "w:gz") as tar:
            # Add important files
            for file_name in self.important_files:
                file_path = self.base_path / file_name
                if file_path.exists():
                    tar.add(file_path, arcname=file_name)
                    
            # Add important directories
            for dir_name in self.important_dirs:
                dir_path = self.base_path / dir_name
                if dir_path.exists():
                    tar.add(dir_path, arcname=dir_name)
                    
        return str(backup_path)
        
    def list_backups(self) -> list:
        """List all available backups."""
        backups = []
        
        for backup_file in self.backup_dir.glob("*.tar.gz"):
            stat = backup_file.stat()
            backups.append({
                'name': backup_file.stem,
                'file': backup_file.name,
                'size': stat.st_size,
                'created': datetime.fromtimestamp(stat.st_mtime)
            })
            
        return sorted(backups, key=lambda x: x['created'], reverse=True)
        
    def restore_backup(self, backup_name: str, confirm: bool = False) -> bool:
        """Restore from a backup."""
        backup_path = self.backup_dir / f"{backup_name}.tar.gz"
        
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup {backup_name} not found")
            
        if not confirm:
            print("⚠️  This will overwrite existing files. Use --confirm to proceed.")
            return False
            
        # Create restore point before restoring
        restore_point = self.create_backup("pre_restore")
        print(f"📋 Created restore point: {restore_point}")
        
        # Extract backup
        with tarfile.open(backup_path, "r:gz") as tar:
            tar.extractall(path=self.base_path)
            
        print(f"✅ Restored from backup: {backup_name}")
        return True
        
    def create_incremental_backup(self, base_backup: str = None) -> str:
        """Create an incremental backup."""
        if not base_backup:
            # Find latest backup
            backups = self.list_backups()
            if backups:
                base_backup = backups[0]['name']
            else:
                return self.create_backup()
                
        # For now, just create a full backup
        # In a real implementation, this would compare timestamps
        return self.create_backup(f"incremental_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
    def auto_backup(self, keep_days: int = 30) -> str:
        """Create automatic backup and cleanup old ones."""
        # Create backup
        backup_path = self.create_backup(f"auto_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        # Cleanup old backups
        cutoff_date = datetime.now().timestamp() - (keep_days * 24 * 60 * 60)
        
        for backup_file in self.backup_dir.glob("auto_*.tar.gz"):
            if backup_file.stat().st_mtime < cutoff_date:
                backup_file.unlink()
                print(f"🗑️  Removed old backup: {backup_file.name}")
                
        return backup_path
        
    def verify_backup(self, backup_name: str) -> dict:
        """Verify backup integrity."""
        backup_path = self.backup_dir / f"{backup_name}.tar.gz"
        
        if not backup_path.exists():
            raise FileNotFoundError(f"Backup {backup_name} not found")
            
        verification = {
            'valid': True,
            'files_found': [],
            'files_missing': [],
            'errors': []
        }
        
        try:
            with tarfile.open(backup_path, "r:gz") as tar:
                # Check if all important files are present
                tar_members = [m.name for m in tar.getmembers()]
                
                for file_name in self.important_files:
                    if file_name in tar_members:
                        verification['files_found'].append(file_name)
                    else:
                        verification['files_missing'].append(file_name)
                        
                # Try to extract to a temporary location for validation
                # (In a real implementation, you'd validate JSON files etc.)
                
        except Exception as e:
            verification['valid'] = False
            verification['errors'].append(str(e))
            
        return verification
        
    def export_data(self, format: str = "json", output_file: str = None) -> str:
        """Export project data in various formats."""
        if not output_file:
            output_file = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}"
            
        # Load all data
        data = {}
        
        for file_name in self.important_files:
            file_path = self.base_path / file_name
            if file_path.exists():
                try:
                    with open(file_path, 'r') as f:
                        data[file_name] = json.load(f)
                except:
                    data[file_name] = f"Error reading {file_name}"
                    
        # Export based on format
        if format == "json":
            with open(output_file, 'w') as f:
                json.dump(data, f, indent=2)
        elif format == "summary":
            # Create summary export
            with open(output_file, 'w') as f:
                f.write("# Project Data Summary\n\n")
                
                projects = data.get('projects.json', {}).get('projects', {})
                f.write(f"Total Projects: {len(projects)}\n")
                
                tags = data.get('project_tags.json', {}).get('project_tags', {})
                total_tags = sum(len(tag_list) for tag_list in tags.values())
                f.write(f"Total Tags: {total_tags}\n")
                
                tracking = data.get('project_tracking.json', {})
                f.write(f"Tracked Projects: {len(tracking)}\n")
                
        return output_file
        
    def generate_backup_report(self) -> str:
        """Generate backup status report."""
        backups = self.list_backups()
        
        report = f"# Backup Report\n\n"
        report += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        report += f"## Backup Status\n\n"
        report += f"- Total Backups: {len(backups)}\n"
        
        if backups:
            latest = backups[0]
            report += f"- Latest Backup: {latest['name']}\n"
            report += f"- Created: {latest['created']}\n"
            report += f"- Size: {latest['size']:,} bytes\n"
            
        report += f"\n## All Backups\n\n"
        
        for backup in backups:
            report += f"- **{backup['name']}**\n"
            report += f"  - Created: {backup['created']}\n"
            report += f"  - Size: {backup['size']:,} bytes\n"
            report += f"  - File: {backup['file']}\n\n"
            
        return report

def main():
    parser = argparse.ArgumentParser(description="Backup and restore utilities")
    
    # Backup operations
    parser.add_argument('--create-backup', help='Create backup with name')
    parser.add_argument('--auto-backup', action='store_true', help='Create automatic backup')
    parser.add_argument('--incremental', help='Create incremental backup from base')
    
    # Restore operations
    parser.add_argument('--restore', help='Restore from backup')
    parser.add_argument('--confirm', action='store_true', help='Confirm restore operation')
    
    # Management operations
    parser.add_argument('--list-backups', action='store_true', help='List all backups')
    parser.add_argument('--verify', help='Verify backup integrity')
    parser.add_argument('--cleanup', type=int, help='Cleanup backups older than N days')
    
    # Export operations
    parser.add_argument('--export', help='Export data to file')
    parser.add_argument('--format', choices=['json', 'summary'], default='json', help='Export format')
    
    # Reports
    parser.add_argument('--report', action='store_true', help='Generate backup report')
    
    args = parser.parse_args()
    
    backup_restore = BackupRestore()
    
    if args.create_backup:
        backup_path = backup_restore.create_backup(args.create_backup)
        print(f"✅ Backup created: {backup_path}")
        
    elif args.auto_backup:
        backup_path = backup_restore.auto_backup()
        print(f"✅ Auto backup created: {backup_path}")
        
    elif args.incremental:
        backup_path = backup_restore.create_incremental_backup(args.incremental)
        print(f"✅ Incremental backup created: {backup_path}")
        
    elif args.restore:
        try:
            success = backup_restore.restore_backup(args.restore, args.confirm)
            if success:
                print(f"✅ Restored from: {args.restore}")
        except FileNotFoundError as e:
            print(f"❌ {e}")
            
    elif args.list_backups:
        backups = backup_restore.list_backups()
        print("📋 Available Backups:")
        
        if not backups:
            print("   No backups found")
        else:
            for backup in backups:
                print(f"   📦 {backup['name']}")
                print(f"      Created: {backup['created']}")
                print(f"      Size: {backup['size']:,} bytes")
                print(f"      File: {backup['file']}")
                print()
                
    elif args.verify:
        try:
            verification = backup_restore.verify_backup(args.verify)
            print(f"🔍 Verification Results for {args.verify}:")
            print(f"   Valid: {'✅' if verification['valid'] else '❌'}")
            print(f"   Files found: {len(verification['files_found'])}")
            print(f"   Files missing: {len(verification['files_missing'])}")
            
            if verification['errors']:
                print("   Errors:")
                for error in verification['errors']:
                    print(f"     - {error}")
                    
        except FileNotFoundError as e:
            print(f"❌ {e}")
            
    elif args.export:
        output_file = backup_restore.export_data(args.format, args.export)
        print(f"📤 Data exported to: {output_file}")
        
    elif args.report:
        report = backup_restore.generate_backup_report()
        with open('backup_report.md', 'w') as f:
            f.write(report)
        print("📋 Backup report generated: backup_report.md")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()