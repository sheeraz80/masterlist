#!/usr/bin/env python3
"""
CLI tool to generate and view AI-powered insights
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from insights.ai_insights import AIInsightsEngine


def display_insights(insights: Dict[str, Any]):
    """Display insights in a formatted way"""
    
    print("\n" + "="*60)
    print("🤖 AI-POWERED INSIGHTS REPORT")
    print("="*60)
    print(f"Generated: {insights.get('generated_at', 'Unknown')}")
    
    # Market Opportunities
    if "market_opportunities" in insights:
        print("\n📊 TOP MARKET OPPORTUNITIES:")
        print("-" * 40)
        for i, opp in enumerate(insights["market_opportunities"][:5], 1):
            print(f"\n{i}. {opp.get('type', 'Unknown').replace('_', ' ').title()}")
            print(f"   Score: {opp.get('opportunity_score', 0)}/10")
            print(f"   {opp.get('recommendation', '')}")
    
    # Trending Technologies
    if "trending_technologies" in insights:
        print("\n\n🚀 TRENDING TECHNOLOGIES:")
        print("-" * 40)
        for i, trend in enumerate(insights["trending_technologies"][:5], 1):
            print(f"\n{i}. {trend.get('technology', '').replace('-', ' ').title()}")
            print(f"   Trend Score: {trend.get('trend_score', 0)}/10")
            print(f"   Projects: {trend.get('project_count', 0)}")
            print(f"   {trend.get('insight', '')}")
    
    # Development Recommendations
    if "development_recommendations" in insights:
        print("\n\n💡 STRATEGIC RECOMMENDATIONS:")
        print("-" * 40)
        for i, rec in enumerate(insights["development_recommendations"][:3], 1):
            print(f"\n{i}. {rec.get('recommendation', '')}")
            print(f"   Priority: {rec.get('priority', 'Unknown')}")
            print(f"   Category: {rec.get('category', '')}")
            print(f"   ROI: {rec.get('estimated_roi', '')}")
    
    # Risk Assessment
    if "risk_assessment" in insights:
        risk = insights["risk_assessment"]
        print("\n\n⚠️  RISK ASSESSMENT:")
        print("-" * 40)
        print(f"Overall Risk Level: {risk.get('risk_level', 'Unknown')} ({risk.get('overall_risk_score', 0)}/10)")
        
        if risk.get("platform_concentration"):
            print("\nPlatform Concentration Risks:")
            for conc in risk["platform_concentration"]:
                print(f"  - {conc['platform']}: {conc['concentration']} ({conc['risk_level']})")
    
    # Gap Analysis Summary
    if "gap_analysis" in insights:
        gaps = insights["gap_analysis"]
        print("\n\n🔍 GAP ANALYSIS:")
        print("-" * 40)
        
        if gaps.get("underserved_platforms"):
            print(f"Underserved Platforms: {len(gaps['underserved_platforms'])}")
        if gaps.get("missing_integrations"):
            print(f"Missing Integrations: {len(gaps['missing_integrations'])}")
        if gaps.get("quality_gaps"):
            print(f"Quality Gaps: {len(gaps['quality_gaps'])}")
    
    # Innovation Opportunities
    if "innovation_opportunities" in insights:
        print("\n\n🌟 INNOVATION OPPORTUNITIES:")
        print("-" * 40)
        for i, inn in enumerate(insights["innovation_opportunities"][:3], 1):
            print(f"\n{i}. {inn.get('opportunity', '')}")
            print(f"   Type: {inn.get('type', '')}")
            print(f"   Potential: {inn.get('potential', '')}")
            print(f"   Current Projects: {inn.get('current_projects', 0)}")
    
    print("\n" + "="*60)
    print("📁 Full report saved to: data/ai_insights_report.md")
    print("="*60 + "\n")


def view_specific_insight(insights: Dict[str, Any], category: str):
    """View specific insight category"""
    if category not in insights:
        print(f"❌ Insight category '{category}' not found")
        print(f"Available categories: {', '.join(insights.keys())}")
        return
    
    print(f"\n🔍 {category.upper().replace('_', ' ')}:")
    print("="*60)
    
    data = insights[category]
    if isinstance(data, list):
        for item in data:
            print(f"\n{json.dumps(item, indent=2)}")
    elif isinstance(data, dict):
        print(json.dumps(data, indent=2))
    else:
        print(data)


def interactive_mode(insights: Dict[str, Any]):
    """Interactive mode to explore insights"""
    while True:
        print("\n📋 INSIGHT CATEGORIES:")
        categories = [k for k in insights.keys() if k != "generated_at"]
        for i, cat in enumerate(categories, 1):
            print(f"{i}. {cat.replace('_', ' ').title()}")
        print("0. Exit")
        
        try:
            choice = input("\nSelect category (0-{}): ".format(len(categories)))
            if choice == "0":
                break
            
            idx = int(choice) - 1
            if 0 <= idx < len(categories):
                view_specific_insight(insights, categories[idx])
                input("\nPress Enter to continue...")
            else:
                print("❌ Invalid choice")
        except (ValueError, KeyboardInterrupt):
            break
    
    print("\n👋 Goodbye!")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Generate and view AI-powered insights',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate full insights
  python generate_insights.py
  
  # Generate quick insights
  python generate_insights.py --quick
  
  # View existing insights
  python generate_insights.py --view
  
  # Interactive mode
  python generate_insights.py --interactive
  
  # View specific category
  python generate_insights.py --view --category market_opportunities
        """
    )
    
    parser.add_argument('--data-dir', default='data', help='Data directory path')
    parser.add_argument('--output', help='Output file path')
    parser.add_argument('--quick', action='store_true', help='Generate quick insights only')
    parser.add_argument('--view', action='store_true', help='View existing insights')
    parser.add_argument('--category', help='View specific insight category')
    parser.add_argument('--interactive', action='store_true', help='Interactive exploration mode')
    parser.add_argument('--refresh', action='store_true', help='Force regenerate insights')
    
    args = parser.parse_args()
    
    insights_file = args.output or os.path.join(args.data_dir, "ai_insights.json")
    
    # Check if viewing existing insights
    if args.view or args.interactive:
        if not os.path.exists(insights_file):
            print(f"❌ No insights found at {insights_file}")
            print("💡 Run without --view to generate insights first")
            sys.exit(1)
        
        with open(insights_file, 'r') as f:
            insights = json.load(f)
        
        if args.interactive:
            interactive_mode(insights)
        elif args.category:
            view_specific_insight(insights, args.category)
        else:
            display_insights(insights)
        
        return
    
    # Check if insights exist and not forcing refresh
    if os.path.exists(insights_file) and not args.refresh:
        # Check if insights are recent (less than 24 hours old)
        with open(insights_file, 'r') as f:
            existing_insights = json.load(f)
        
        generated_time = datetime.fromisoformat(existing_insights.get("generated_at", "2000-01-01"))
        age_hours = (datetime.now() - generated_time).total_seconds() / 3600
        
        if age_hours < 24:
            print(f"ℹ️  Using existing insights (generated {age_hours:.1f} hours ago)")
            print("💡 Use --refresh to force regenerate")
            display_insights(existing_insights)
            return
    
    # Generate new insights
    print("🤖 Generating AI-powered insights...")
    print("⏳ This may take a moment...\n")
    
    engine = AIInsightsEngine(args.data_dir)
    
    if args.quick:
        print("🚀 Running quick analysis...")
        insights = {
            "market_opportunities": engine.analyze_market_opportunities()[:3],
            "trending_technologies": engine.identify_trending_technologies()[:3],
            "development_recommendations": engine.generate_development_recommendations()[:3],
            "risk_assessment": engine.assess_portfolio_risks(),
            "generated_at": datetime.now().isoformat()
        }
    else:
        print("🔬 Running comprehensive analysis...")
        insights = engine.generate_all_insights()
    
    # Save insights
    engine.save_insights(insights, insights_file)
    
    # Display insights
    display_insights(insights)
    
    if not args.quick:
        print("\n💡 Tip: Use --interactive to explore insights in detail")


if __name__ == "__main__":
    main()