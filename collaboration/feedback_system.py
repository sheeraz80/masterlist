#!/usr/bin/env python3
"""
Feedback and Comments System for Masterlist Projects
Allows users to add feedback, ratings, and comments on projects
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from uuid import uuid4

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class FeedbackSystem:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.feedback_file = os.path.join(data_dir, "project_feedback.json")
        self.user_ratings_file = os.path.join(data_dir, "user_ratings.json")
        self.comments_file = os.path.join(data_dir, "project_comments.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Load existing data
        self.feedback_data = self._load_json(self.feedback_file, {})
        self.ratings_data = self._load_json(self.user_ratings_file, {})
        self.comments_data = self._load_json(self.comments_file, {})
    
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
    
    def add_feedback(self, project_key: str, user_id: str, feedback_type: str, 
                    content: str, metadata: Dict = None) -> str:
        """Add feedback for a project"""
        feedback_id = str(uuid4())
        
        if project_key not in self.feedback_data:
            self.feedback_data[project_key] = []
        
        feedback_entry = {
            "id": feedback_id,
            "user_id": user_id,
            "type": feedback_type,  # bug, feature, improvement, praise
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "status": "open",  # open, in_progress, resolved, closed
            "metadata": metadata or {},
            "votes": 0,
            "replies": []
        }
        
        self.feedback_data[project_key].append(feedback_entry)
        self._save_json(self.feedback_data, self.feedback_file)
        
        return feedback_id
    
    def add_rating(self, project_key: str, user_id: str, rating: float, 
                   criteria: Dict[str, float] = None) -> bool:
        """Add or update user rating for a project"""
        if not 0 <= rating <= 10:
            raise ValueError("Rating must be between 0 and 10")
        
        if project_key not in self.ratings_data:
            self.ratings_data[project_key] = {}
        
        rating_entry = {
            "overall": rating,
            "timestamp": datetime.now().isoformat(),
            "criteria": criteria or {}  # quality, innovation, feasibility, etc.
        }
        
        self.ratings_data[project_key][user_id] = rating_entry
        self._save_json(self.ratings_data, self.user_ratings_file)
        
        return True
    
    def add_comment(self, project_key: str, user_id: str, comment: str, 
                   parent_id: str = None) -> str:
        """Add comment or reply to a project"""
        comment_id = str(uuid4())
        
        if project_key not in self.comments_data:
            self.comments_data[project_key] = []
        
        comment_entry = {
            "id": comment_id,
            "user_id": user_id,
            "content": comment,
            "timestamp": datetime.now().isoformat(),
            "parent_id": parent_id,  # For threaded discussions
            "votes": 0,
            "edited": False,
            "deleted": False
        }
        
        self.comments_data[project_key].append(comment_entry)
        self._save_json(self.comments_data, self.comments_file)
        
        return comment_id
    
    def update_feedback_status(self, project_key: str, feedback_id: str, 
                             status: str, resolver_id: str = None) -> bool:
        """Update feedback status"""
        if project_key not in self.feedback_data:
            return False
        
        for feedback in self.feedback_data[project_key]:
            if feedback["id"] == feedback_id:
                feedback["status"] = status
                feedback["updated_at"] = datetime.now().isoformat()
                if resolver_id:
                    feedback["resolved_by"] = resolver_id
                
                self._save_json(self.feedback_data, self.feedback_file)
                return True
        
        return False
    
    def vote_on_item(self, item_type: str, project_key: str, item_id: str, 
                    user_id: str, vote: int) -> bool:
        """Vote on feedback or comment (+1 or -1)"""
        if vote not in [1, -1]:
            raise ValueError("Vote must be 1 or -1")
        
        if item_type == "feedback":
            data = self.feedback_data
            file_path = self.feedback_file
        elif item_type == "comment":
            data = self.comments_data
            file_path = self.comments_file
        else:
            return False
        
        if project_key not in data:
            return False
        
        for item in data[project_key]:
            if item["id"] == item_id:
                # Track votes by user to prevent duplicates
                if "voters" not in item:
                    item["voters"] = {}
                
                # Update vote
                if user_id in item["voters"]:
                    # Remove previous vote
                    item["votes"] -= item["voters"][user_id]
                
                item["voters"][user_id] = vote
                item["votes"] += vote
                
                self._save_json(data, file_path)
                return True
        
        return False
    
    def get_project_feedback(self, project_key: str, status_filter: str = None) -> List[Dict]:
        """Get all feedback for a project"""
        if project_key not in self.feedback_data:
            return []
        
        feedback = self.feedback_data[project_key]
        
        if status_filter:
            feedback = [f for f in feedback if f["status"] == status_filter]
        
        # Sort by votes and timestamp
        return sorted(feedback, key=lambda x: (x["votes"], x["timestamp"]), reverse=True)
    
    def get_project_rating(self, project_key: str) -> Dict[str, Any]:
        """Get aggregated rating for a project"""
        if project_key not in self.ratings_data:
            return {
                "average": 0,
                "count": 0,
                "distribution": {},
                "criteria_averages": {}
            }
        
        ratings = self.ratings_data[project_key]
        if not ratings:
            return {
                "average": 0,
                "count": 0,
                "distribution": {},
                "criteria_averages": {}
            }
        
        # Calculate average
        total = sum(r["overall"] for r in ratings.values())
        count = len(ratings)
        average = total / count
        
        # Calculate distribution
        distribution = {str(i): 0 for i in range(0, 11)}
        for rating in ratings.values():
            distribution[str(int(rating["overall"]))] += 1
        
        # Calculate criteria averages
        criteria_totals = {}
        criteria_counts = {}
        
        for rating in ratings.values():
            for criterion, value in rating.get("criteria", {}).items():
                if criterion not in criteria_totals:
                    criteria_totals[criterion] = 0
                    criteria_counts[criterion] = 0
                criteria_totals[criterion] += value
                criteria_counts[criterion] += 1
        
        criteria_averages = {
            criterion: criteria_totals[criterion] / criteria_counts[criterion]
            for criterion in criteria_totals
        }
        
        return {
            "average": round(average, 2),
            "count": count,
            "distribution": distribution,
            "criteria_averages": {k: round(v, 2) for k, v in criteria_averages.items()}
        }
    
    def get_project_comments(self, project_key: str, parent_id: str = None) -> List[Dict]:
        """Get comments for a project (optionally filtered by parent)"""
        if project_key not in self.comments_data:
            return []
        
        comments = self.comments_data[project_key]
        
        # Filter by parent if specified
        if parent_id is not None:
            comments = [c for c in comments if c.get("parent_id") == parent_id]
        
        # Filter out deleted comments
        comments = [c for c in comments if not c.get("deleted", False)]
        
        # Sort by timestamp
        return sorted(comments, key=lambda x: x["timestamp"])
    
    def get_user_activity(self, user_id: str) -> Dict[str, Any]:
        """Get all activity for a user"""
        activity = {
            "feedback_submitted": [],
            "ratings_given": {},
            "comments_made": [],
            "votes_cast": []
        }
        
        # Feedback submitted
        for project_key, feedbacks in self.feedback_data.items():
            for feedback in feedbacks:
                if feedback["user_id"] == user_id:
                    activity["feedback_submitted"].append({
                        "project_key": project_key,
                        "feedback": feedback
                    })
        
        # Ratings given
        for project_key, ratings in self.ratings_data.items():
            if user_id in ratings:
                activity["ratings_given"][project_key] = ratings[user_id]
        
        # Comments made
        for project_key, comments in self.comments_data.items():
            for comment in comments:
                if comment["user_id"] == user_id:
                    activity["comments_made"].append({
                        "project_key": project_key,
                        "comment": comment
                    })
        
        return activity
    
    def export_feedback_report(self, project_key: str = None) -> str:
        """Export feedback report in markdown format"""
        report = []
        report.append("# Project Feedback Report")
        report.append(f"\nGenerated: {datetime.now().isoformat()}\n")
        
        project_keys = [project_key] if project_key else sorted(self.feedback_data.keys())
        
        for key in project_keys:
            if key not in self.feedback_data:
                continue
                
            feedback_list = self.get_project_feedback(key)
            rating_info = self.get_project_rating(key)
            comments = self.get_project_comments(key)
            
            report.append(f"## Project: {key}")
            report.append(f"\n### Rating: {rating_info['average']}/10 ({rating_info['count']} ratings)")
            
            if feedback_list:
                report.append("\n### Feedback")
                
                # Group by status
                by_status = {}
                for f in feedback_list:
                    status = f["status"]
                    if status not in by_status:
                        by_status[status] = []
                    by_status[status].append(f)
                
                for status, items in by_status.items():
                    report.append(f"\n#### {status.title()} ({len(items)})")
                    for item in items:
                        report.append(f"- **{item['type']}**: {item['content']}")
                        report.append(f"  - User: {item['user_id']}, Votes: {item['votes']}")
            
            if comments:
                report.append(f"\n### Comments ({len(comments)})")
                for comment in comments[:5]:  # Show first 5
                    report.append(f"- {comment['content'][:100]}...")
                    report.append(f"  - User: {comment['user_id']}, Time: {comment['timestamp']}")
            
            report.append("\n---\n")
        
        return "\n".join(report)
    
    def get_trending_feedback(self, limit: int = 10) -> List[Dict]:
        """Get trending feedback across all projects"""
        all_feedback = []
        
        for project_key, feedbacks in self.feedback_data.items():
            for feedback in feedbacks:
                all_feedback.append({
                    "project_key": project_key,
                    "feedback": feedback
                })
        
        # Sort by votes and recency
        all_feedback.sort(
            key=lambda x: (x["feedback"]["votes"], x["feedback"]["timestamp"]), 
            reverse=True
        )
        
        return all_feedback[:limit]
    
    def get_collaboration_stats(self) -> Dict[str, Any]:
        """Get overall collaboration statistics"""
        stats = {
            "total_feedback": 0,
            "total_ratings": 0,
            "total_comments": 0,
            "active_users": set(),
            "feedback_by_type": {},
            "feedback_by_status": {},
            "average_rating": 0,
            "most_discussed_projects": [],
            "most_rated_projects": []
        }
        
        # Count feedback
        for project_feedbacks in self.feedback_data.values():
            stats["total_feedback"] += len(project_feedbacks)
            for feedback in project_feedbacks:
                # Count by type
                f_type = feedback["type"]
                stats["feedback_by_type"][f_type] = stats["feedback_by_type"].get(f_type, 0) + 1
                
                # Count by status
                status = feedback["status"]
                stats["feedback_by_status"][status] = stats["feedback_by_status"].get(status, 0) + 1
                
                # Track users
                stats["active_users"].add(feedback["user_id"])
        
        # Count ratings
        all_ratings = []
        for project_key, ratings in self.ratings_data.items():
            stats["total_ratings"] += len(ratings)
            for user_id, rating in ratings.items():
                stats["active_users"].add(user_id)
                all_ratings.append(rating["overall"])
        
        if all_ratings:
            stats["average_rating"] = round(sum(all_ratings) / len(all_ratings), 2)
        
        # Count comments
        comment_counts = {}
        for project_key, comments in self.comments_data.items():
            stats["total_comments"] += len(comments)
            comment_counts[project_key] = len(comments)
            for comment in comments:
                stats["active_users"].add(comment["user_id"])
        
        # Most discussed projects
        stats["most_discussed_projects"] = sorted(
            comment_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        # Most rated projects
        rating_counts = {k: len(v) for k, v in self.ratings_data.items()}
        stats["most_rated_projects"] = sorted(
            rating_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        stats["active_users"] = len(stats["active_users"])
        
        return stats


def main():
    """Test feedback system"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Manage project feedback and collaboration')
    parser.add_argument('action', choices=['add-feedback', 'add-rating', 'add-comment', 
                                          'view', 'stats', 'export'])
    parser.add_argument('--project', help='Project key')
    parser.add_argument('--user', default='test_user', help='User ID')
    parser.add_argument('--type', choices=['bug', 'feature', 'improvement', 'praise'], 
                       default='improvement', help='Feedback type')
    parser.add_argument('--content', help='Feedback/comment content')
    parser.add_argument('--rating', type=float, help='Rating (0-10)')
    parser.add_argument('--status', help='Filter by status')
    
    args = parser.parse_args()
    
    feedback_system = FeedbackSystem()
    
    if args.action == 'add-feedback':
        if not args.project or not args.content:
            print("Error: --project and --content required")
            return
        
        feedback_id = feedback_system.add_feedback(
            args.project, args.user, args.type, args.content
        )
        print(f"✅ Feedback added: {feedback_id}")
        
    elif args.action == 'add-rating':
        if not args.project or args.rating is None:
            print("Error: --project and --rating required")
            return
        
        feedback_system.add_rating(args.project, args.user, args.rating)
        print(f"✅ Rating added: {args.rating}/10")
        
    elif args.action == 'add-comment':
        if not args.project or not args.content:
            print("Error: --project and --content required")
            return
        
        comment_id = feedback_system.add_comment(args.project, args.user, args.content)
        print(f"✅ Comment added: {comment_id}")
        
    elif args.action == 'view':
        if args.project:
            # View project feedback
            feedback = feedback_system.get_project_feedback(args.project, args.status)
            rating = feedback_system.get_project_rating(args.project)
            comments = feedback_system.get_project_comments(args.project)
            
            print(f"\n📊 Project: {args.project}")
            print(f"⭐ Rating: {rating['average']}/10 ({rating['count']} ratings)")
            print(f"💬 Feedback: {len(feedback)} items")
            print(f"💭 Comments: {len(comments)} items")
            
            if feedback:
                print("\nRecent Feedback:")
                for f in feedback[:5]:
                    print(f"- [{f['type']}] {f['content'][:80]}...")
                    print(f"  Status: {f['status']}, Votes: {f['votes']}")
        else:
            # View trending
            trending = feedback_system.get_trending_feedback(10)
            print("\n🔥 Trending Feedback:")
            for item in trending:
                print(f"- {item['project_key']}: {item['feedback']['content'][:60]}...")
                print(f"  Votes: {item['feedback']['votes']}")
                
    elif args.action == 'stats':
        stats = feedback_system.get_collaboration_stats()
        print("\n📈 Collaboration Statistics:")
        print(f"Total Feedback: {stats['total_feedback']}")
        print(f"Total Ratings: {stats['total_ratings']}")
        print(f"Total Comments: {stats['total_comments']}")
        print(f"Active Users: {stats['active_users']}")
        print(f"Average Rating: {stats['average_rating']}/10")
        
        print("\nFeedback by Type:")
        for type_name, count in stats['feedback_by_type'].items():
            print(f"  {type_name}: {count}")
            
        print("\nMost Discussed Projects:")
        for project, count in stats['most_discussed_projects'][:5]:
            print(f"  {project}: {count} comments")
            
    elif args.action == 'export':
        report = feedback_system.export_feedback_report(args.project)
        filename = f"feedback_report_{args.project or 'all'}.md"
        with open(filename, 'w') as f:
            f.write(report)
        print(f"✅ Report exported to: {filename}")


if __name__ == "__main__":
    main()