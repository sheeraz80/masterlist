#!/usr/bin/env python3
"""
QA Summary - Quick overview of project quality status
"""

import json
from pathlib import Path
from datetime import datetime

def get_quality_summary():
    """Get quick quality summary."""
    
    # Check if QA reports exist
    qa_results_path = Path('qa_reports/qa_results.json')
    
    if not qa_results_path.exists():
        print("❌ No QA results found. Run 'python qa/run_qa.py' first.")
        return
        
    with open(qa_results_path, 'r') as f:
        results = json.load(f)
        
    print("📊 MASTERLIST QA SUMMARY")
    print("=" * 50)
    
    # Timestamp
    timestamp = results.get('timestamp', 'Unknown')
    print(f"Last checked: {timestamp}")
    print()
    
    # Overall health
    summary = results.get('summary', {})
    health = summary.get('overall_health', 'Unknown')
    score = summary.get('health_score', 0)
    
    health_emoji = {
        'Excellent': '🟢',
        'Good': '🟡',
        'Fair': '🟠',
        'Poor': '🔴',
        'Critical': '🔴'
    }.get(health, '⚪')
    
    print(f"{health_emoji} Overall Health: {health} ({score}/100)")
    print()
    
    # Key metrics
    print("📈 Key Metrics:")
    
    if 'validation_summary' in results:
        val = results['validation_summary']
        print(f"   Projects validated: {val.get('projects_validated', 0)}")
        print(f"   Validation errors: {val.get('errors', 0)}")
        print(f"   Validation warnings: {val.get('warnings', 0)}")
        
    if 'quality_summary' in results:
        qual = results['quality_summary']
        print(f"   Average quality: {qual.get('average_score', 0)}/10")
        print(f"   Projects scored: {qual.get('projects_scored', 0)}")
        
    print()
    
    # Issues
    critical = summary.get('critical_issues', 0)
    warnings = summary.get('warnings', 0)
    
    if critical > 0 or warnings > 0:
        print("⚠️  Issues Found:")
        if critical > 0:
            print(f"   ❌ Critical issues: {critical}")
        if warnings > 0:
            print(f"   ⚠️  Warnings: {warnings}")
        print()
        
    # Recommendations
    recommendations = summary.get('recommendations', [])
    if recommendations:
        print("🎯 Top Recommendations:")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec}")
        print()
        
    # Reports
    print("📄 Detailed Reports:")
    print("   - Comprehensive: qa_reports/comprehensive_qa_report.md")
    print("   - Validation: qa_reports/validation_report.md")
    print("   - Quality: qa_reports/quality_report.md")
    print("   - Integrity: qa_reports/integrity_report.md")
    
    # Next steps
    print()
    print("🔄 Next Steps:")
    
    if health == 'Excellent':
        print("   ✅ System is in excellent condition!")
    elif health == 'Good':
        print("   ✅ Minor improvements recommended")
    elif health == 'Fair':
        print("   ⚠️  Review warnings and make improvements")
    elif health == 'Poor':
        print("   ❌ Address critical issues urgently")
    else:
        print("   🚨 Immediate attention required!")
        
    # Re-run suggestion
    try:
        qa_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        days_old = (datetime.now() - qa_time).days
        if days_old > 7:
            print(f"\n   ℹ️  QA results are {days_old} days old. Consider re-running.")
    except:
        pass

if __name__ == "__main__":
    get_quality_summary()