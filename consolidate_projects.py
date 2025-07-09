#!/usr/bin/env python3
"""
Consolidate all generated projects into the main projects.json file
"""

import json
import os
from pathlib import Path

def load_existing_projects():
    """Load existing projects.json"""
    try:
        with open("projects.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "metadata": {
                "total_projects": 0,
                "last_updated": "2024-01-01",
                "version": "2.0.0"
            },
            "projects": {}
        }

def load_additional_projects():
    """Load all additional project files"""
    additional_files = [
        "high_revenue_projects.json",
        "marketplace_enterprise_projects.json"
    ]
    
    all_additional = {}
    
    for filename in additional_files:
        if os.path.exists(filename):
            print(f"Loading {filename}...")
            with open(filename, "r") as f:
                data = json.load(f)
                all_additional.update(data.get("projects", {}))
                print(f"  Added {len(data.get('projects', {}))} projects")
    
    return all_additional

def update_consolidated_projects():
    """Update consolidated_projects.json with new structure"""
    
    # Load all projects from the main projects.json
    try:
        with open("projects.json", "r") as f:
            main_data = json.load(f)
            main_projects = main_data.get("projects", {})
    except FileNotFoundError:
        main_projects = {}
    
    # Load additional projects
    additional_projects = load_additional_projects()
    
    # Create consolidated structure
    consolidated = {}
    
    # Process existing projects
    for project_id, project_data in main_projects.items():
        consolidated[project_id] = {
            "project_name": project_data.get("name", project_id),
            "platform": project_data.get("platforms", ["unknown"])[0] if project_data.get("platforms") else "unknown",
            "category": project_data.get("category", "other"),
            "problem_statement": project_data.get("problem_statement", ""),
            "solution_description": project_data.get("solution_description", ""),
            "target_users": project_data.get("target_users", ""),
            "revenue_model": project_data.get("revenue_model", ""),
            "revenue_potential": project_data.get("revenue_potential", ""),
            "development_time": project_data.get("development_time", ""),
            "competition_level": project_data.get("competition_level", ""),
            "technical_complexity": project_data.get("technical_complexity", ""),
            "key_features": project_data.get("key_features", []),
            "quality_score": project_data.get("quality_score", 5.0),
            "completeness_score": project_data.get("completeness_score", 10),
            "platform_specific_details": project_data.get("platform_specific_details", {})
        }
    
    # Process additional projects
    for project_id, project_data in additional_projects.items():
        consolidated[project_id] = {
            "project_name": project_data.get("name", project_id),
            "platform": project_data.get("platforms", ["unknown"])[0] if project_data.get("platforms") else "unknown",
            "category": project_data.get("category", "other"),
            "problem_statement": project_data.get("problem_statement", ""),
            "solution_description": project_data.get("solution_description", ""),
            "target_users": project_data.get("target_users", ""),
            "revenue_model": project_data.get("revenue_model", ""),
            "revenue_potential": project_data.get("revenue_potential", ""),
            "development_time": project_data.get("development_time", ""),
            "competition_level": project_data.get("competition_level", ""),
            "technical_complexity": project_data.get("technical_complexity", ""),
            "key_features": project_data.get("key_features", []),
            "quality_score": project_data.get("quality_score", 5.0),
            "completeness_score": project_data.get("completeness_score", 10),
            "platform_specific_details": project_data.get("platform_specific_details", {})
        }
    
    print(f"Total consolidated projects: {len(consolidated)}")
    
    # Save consolidated projects
    with open("consolidated_projects.json", "w") as f:
        json.dump(consolidated, f, indent=2, ensure_ascii=False)
    
    return consolidated

def update_main_projects_json():
    """Update main projects.json with all new projects"""
    
    # Load existing projects
    existing_data = load_existing_projects()
    
    # Load additional projects
    additional_projects = load_additional_projects()
    
    # Merge projects
    all_projects = existing_data["projects"].copy()
    all_projects.update(additional_projects)
    
    # Update metadata
    existing_data["metadata"]["total_projects"] = len(all_projects)
    existing_data["metadata"]["last_updated"] = "2024-01-01"
    existing_data["metadata"]["version"] = "2.0.0"
    existing_data["metadata"]["new_platforms_added"] = [
        "android-app", "ios-app", "react-native-app", "flutter-app",
        "web-app", "saas-platform", "progressive-web-app",
        "windows-app", "macos-app", "linux-app", "electron-app",
        "shopify-app", "wordpress-plugin", "woocommerce-plugin",
        "slack-bot", "discord-bot", "telegram-bot", "whatsapp-bot",
        "rest-api", "graphql-api", "microservice", "serverless-function",
        "aws-service", "google-cloud-service", "azure-service",
        "salesforce-app", "microsoft-teams-app", "office-365-addon"
    ]
    existing_data["metadata"]["new_categories_added"] = [
        "business-analytics", "e-commerce", "marketing-automation",
        "education", "health-fitness", "finance-accounting",
        "communication", "gaming-entertainment", "project-management",
        "social-networking"
    ]
    
    existing_data["projects"] = all_projects
    
    # Save updated projects.json
    with open("projects.json", "w") as f:
        json.dump(existing_data, f, indent=2, ensure_ascii=False)
    
    print(f"Updated projects.json with {len(all_projects)} total projects")
    
    return existing_data

def generate_platform_summary():
    """Generate summary of platforms and categories"""
    
    with open("projects.json", "r") as f:
        data = json.load(f)
    
    projects = data["projects"]
    
    # Count by platform
    platform_counts = {}
    category_counts = {}
    
    for project_data in projects.values():
        platforms = project_data.get("platforms", ["unknown"])
        category = project_data.get("category", "unknown")
        
        for platform in platforms:
            platform_counts[platform] = platform_counts.get(platform, 0) + 1
        
        category_counts[category] = category_counts.get(category, 0) + 1
    
    # Generate summary
    summary = {
        "total_projects": len(projects),
        "platforms": dict(sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)),
        "categories": dict(sorted(category_counts.items(), key=lambda x: x[1], reverse=True)),
        "platform_count": len(platform_counts),
        "category_count": len(category_counts)
    }
    
    with open("project_summary.json", "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"Generated summary: {summary['total_projects']} projects across {summary['platform_count']} platforms and {summary['category_count']} categories")
    
    return summary

def main():
    """Consolidate all projects and update structure"""
    print("Consolidating all projects...")
    
    # Update main projects.json
    main_data = update_main_projects_json()
    
    # Update consolidated projects
    consolidated = update_consolidated_projects()
    
    # Generate summary
    summary = generate_platform_summary()
    
    print("\nConsolidation complete!")
    print(f"Total projects: {len(main_data['projects'])}")
    print(f"New platforms: {len(main_data['metadata']['new_platforms_added'])}")
    print(f"New categories: {len(main_data['metadata']['new_categories_added'])}")
    
    print("\nTop platforms by project count:")
    for platform, count in list(summary['platforms'].items())[:10]:
        print(f"  {platform}: {count}")
    
    print("\nTop categories by project count:")
    for category, count in list(summary['categories'].items())[:10]:
        print(f"  {category}: {count}")

if __name__ == "__main__":
    main()