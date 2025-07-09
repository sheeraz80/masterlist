#!/usr/bin/env python3
"""
AI-Powered Insights Generator
Analyzes project data to generate actionable insights and recommendations
"""

import json
import os
import sys
from typing import Dict, List, Any, Tuple
from datetime import datetime
from collections import defaultdict, Counter
import statistics

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tag_search import TagSearch
from qa.quality_scorer import QualityScorer

class AIInsightsEngine:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.search_engine = TagSearch()
        self.quality_scorer = QualityScorer()
        self.projects = self._load_projects()
        
    def _load_projects(self) -> Dict[str, Any]:
        """Load all project data"""
        # Try data directory first, then root directory
        projects_file = os.path.join(self.data_dir, "projects.json")
        if not os.path.exists(projects_file):
            projects_file = "projects.json"
        
        if os.path.exists(projects_file):
            with open(projects_file, 'r') as f:
                data = json.load(f)
                # Handle both formats
                if isinstance(data, dict) and "projects" in data:
                    return data["projects"]
                return data
        return {}
    
    def _get_numeric_value(self, value) -> float:
        """Convert various formats to numeric value"""
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            # Extract first numeric value from string
            import re
            match = re.search(r'(\d+(?:\.\d+)?)', value)
            if match:
                return float(match.group(1))
            return 0
        return 0
    
    def generate_all_insights(self) -> Dict[str, Any]:
        """Generate comprehensive AI-powered insights"""
        print("Generating AI-powered insights...")
        
        insights = {
            "market_opportunities": self.analyze_market_opportunities(),
            "trending_technologies": self.identify_trending_technologies(),
            "gap_analysis": self.perform_gap_analysis(),
            "success_patterns": self.analyze_success_patterns(),
            "revenue_predictions": self.predict_revenue_potential(),
            "development_recommendations": self.generate_development_recommendations(),
            "competitive_landscape": self.analyze_competitive_landscape(),
            "innovation_opportunities": self.identify_innovation_opportunities(),
            "risk_assessment": self.assess_portfolio_risks(),
            "personalized_recommendations": self.generate_personalized_recommendations(),
            "generated_at": datetime.now().isoformat()
        }
        
        return insights
    
    def analyze_market_opportunities(self) -> List[Dict[str, Any]]:
        """Identify high-potential market opportunities"""
        opportunities = []
        
        # Analyze category-platform combinations
        category_platform_stats = defaultdict(lambda: {"count": 0, "avg_quality": 0, "qualities": []})
        
        for project in self.projects.values():
            for platform in project.get("platforms", []):
                key = f"{project['category']}:{platform}"
                stats = category_platform_stats[key]
                stats["count"] += 1
                stats["qualities"].append(project.get("quality_score", 0))
        
        # Calculate averages and identify gaps
        for key, stats in category_platform_stats.items():
            if stats["qualities"]:
                stats["avg_quality"] = statistics.mean(stats["qualities"])
        
        # Find underserved niches (low project count, high quality)
        for key, stats in category_platform_stats.items():
            category, platform = key.split(":")
            if stats["count"] < 5 and stats["avg_quality"] > 7:
                opportunities.append({
                    "type": "underserved_niche",
                    "category": category,
                    "platform": platform,
                    "project_count": stats["count"],
                    "avg_quality": round(stats["avg_quality"], 2),
                    "opportunity_score": round((10 - stats["count"]) * stats["avg_quality"] / 10, 2),
                    "recommendation": f"High potential in {category} for {platform} - only {stats['count']} projects with {stats['avg_quality']:.1f}/10 quality"
                })
        
        # Identify high-growth categories
        ai_projects = [p for p in self.projects.values() if "ai-powered" in p.get("tags", [])]
        blockchain_projects = [p for p in self.projects.values() if "blockchain" in p.get("tags", [])]
        
        if len(ai_projects) > 20:
            ai_quality = statistics.mean([p.get("quality_score", 0) for p in ai_projects])
            opportunities.append({
                "type": "high_growth",
                "area": "AI/ML Integration",
                "project_count": len(ai_projects),
                "avg_quality": round(ai_quality, 2),
                "opportunity_score": 9.5,
                "recommendation": "AI-powered tools show strong market demand with consistent quality"
            })
        
        # Sort by opportunity score
        opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)
        
        return opportunities[:10]  # Top 10 opportunities
    
    def identify_trending_technologies(self) -> List[Dict[str, Any]]:
        """Identify trending technologies and approaches"""
        tech_trends = []
        
        # Analyze technology tags
        tech_tags = ["ai-powered", "blockchain", "web3", "no-code", "automation", 
                     "real-time", "cloud-native", "api-first", "mobile-first", "voice-enabled"]
        
        tag_stats = {}
        for tag in tech_tags:
            projects = [p for p in self.projects.values() if tag in p.get("tags", [])]
            if projects:
                avg_quality = statistics.mean([p.get("quality_score", 0) for p in projects])
                avg_complexity = statistics.mean([self._get_numeric_value(p.get("technical_complexity", 5)) for p in projects])
                
                tag_stats[tag] = {
                    "count": len(projects),
                    "avg_quality": avg_quality,
                    "avg_complexity": avg_complexity,
                    "growth_potential": (avg_quality * len(projects)) / avg_complexity
                }
        
        # Create trend insights
        for tag, stats in sorted(tag_stats.items(), key=lambda x: x[1]["growth_potential"], reverse=True):
            trend_score = min(10, stats["growth_potential"] / 10)
            
            tech_trends.append({
                "technology": tag,
                "project_count": stats["count"],
                "avg_quality": round(stats["avg_quality"], 2),
                "avg_complexity": round(stats["avg_complexity"], 1),
                "trend_score": round(trend_score, 2),
                "insight": self._generate_tech_insight(tag, stats)
            })
        
        return tech_trends[:8]
    
    def _generate_tech_insight(self, tech: str, stats: Dict) -> str:
        """Generate insight for a technology trend"""
        insights = {
            "ai-powered": "AI integration shows exceptional ROI with moderate complexity",
            "blockchain": "Blockchain projects attract early adopters and premium pricing",
            "web3": "Web3 integration opens new monetization models",
            "no-code": "No-code solutions have fastest time-to-market",
            "automation": "Automation tools show consistent demand across industries",
            "real-time": "Real-time features command premium pricing",
            "cloud-native": "Cloud-native architecture ensures scalability",
            "api-first": "API-first design enables ecosystem growth",
            "mobile-first": "Mobile-first approach captures growing market segment",
            "voice-enabled": "Voice interfaces represent emerging opportunity"
        }
        
        base_insight = insights.get(tech, "Technology shows promising potential")
        
        if stats["count"] > 15:
            base_insight += f" (Strong adoption with {stats['count']} projects)"
        elif stats["avg_quality"] > 8:
            base_insight += f" (High quality implementations at {stats['avg_quality']:.1f}/10)"
        
        return base_insight
    
    def perform_gap_analysis(self) -> Dict[str, Any]:
        """Analyze gaps in current project portfolio"""
        gaps = {
            "missing_integrations": [],
            "underserved_platforms": [],
            "quality_gaps": [],
            "feature_gaps": []
        }
        
        # Platform coverage analysis
        all_platforms = set()
        platform_counts = Counter()
        
        for project in self.projects.values():
            for platform in project.get("platforms", []):
                all_platforms.add(platform)
                platform_counts[platform] += 1
        
        # Identify underserved platforms
        avg_projects_per_platform = statistics.mean(platform_counts.values())
        for platform, count in platform_counts.items():
            if count < avg_projects_per_platform * 0.5:
                gaps["underserved_platforms"].append({
                    "platform": platform,
                    "current_projects": count,
                    "recommended_projects": int(avg_projects_per_platform),
                    "gap": int(avg_projects_per_platform - count)
                })
        
        # Integration opportunities
        integration_pairs = [
            ("ai-browser-tools", "chrome-extension"),
            ("figma-plugin", "design-system"),
            ("vscode-extension", "ai-powered"),
            ("notion-templates", "automation")
        ]
        
        for tag1, tag2 in integration_pairs:
            projects_with_both = [
                p for p in self.projects.values() 
                if tag1 in p.get("tags", []) and tag2 in p.get("tags", [])
            ]
            if len(projects_with_both) < 3:
                gaps["missing_integrations"].append({
                    "integration": f"{tag1} + {tag2}",
                    "current_projects": len(projects_with_both),
                    "potential": "High",
                    "recommendation": f"Combine {tag1} with {tag2} for unique value proposition"
                })
        
        # Quality gaps by category
        category_qualities = defaultdict(list)
        for project in self.projects.values():
            category_qualities[project["category"]].append(project.get("quality_score", 0))
        
        overall_avg_quality = statistics.mean([p.get("quality_score", 0) for p in self.projects.values()])
        
        for category, qualities in category_qualities.items():
            avg_quality = statistics.mean(qualities)
            if avg_quality < overall_avg_quality - 1:
                gaps["quality_gaps"].append({
                    "category": category,
                    "current_avg_quality": round(avg_quality, 2),
                    "target_quality": round(overall_avg_quality, 2),
                    "improvement_needed": round(overall_avg_quality - avg_quality, 2)
                })
        
        return gaps
    
    def analyze_success_patterns(self) -> List[Dict[str, Any]]:
        """Identify patterns in successful projects"""
        patterns = []
        
        # Define success as quality score >= 8
        successful_projects = [p for p in self.projects.values() if p.get("quality_score", 0) >= 8]
        
        if not successful_projects:
            return patterns
        
        # Analyze common tags
        tag_counter = Counter()
        for project in successful_projects:
            tag_counter.update(project.get("tags", []))
        
        # Most common tag combinations
        tag_combinations = Counter()
        for project in successful_projects:
            tags = sorted(project.get("tags", []))
            for i in range(len(tags)):
                for j in range(i + 1, len(tags)):
                    tag_combinations[(tags[i], tags[j])] += 1
        
        # Success patterns
        patterns.append({
            "pattern": "High-Quality Tag Indicators",
            "description": "Tags most associated with successful projects",
            "data": [
                {"tag": tag, "frequency": count, "success_rate": f"{(count/len(successful_projects)*100):.1f}%"}
                for tag, count in tag_counter.most_common(5)
            ]
        })
        
        patterns.append({
            "pattern": "Winning Combinations",
            "description": "Tag combinations that lead to success",
            "data": [
                {
                    "combination": f"{combo[0]} + {combo[1]}", 
                    "frequency": count,
                    "projects": count
                }
                for combo, count in tag_combinations.most_common(5)
            ]
        })
        
        # Platform success rates
        platform_success = defaultdict(lambda: {"total": 0, "successful": 0})
        for project in self.projects.values():
            for platform in project.get("platforms", []):
                platform_success[platform]["total"] += 1
                if project.get("quality_score", 0) >= 8:
                    platform_success[platform]["successful"] += 1
        
        platform_rates = []
        for platform, stats in platform_success.items():
            if stats["total"] >= 5:  # Minimum sample size
                success_rate = stats["successful"] / stats["total"] * 100
                platform_rates.append({
                    "platform": platform,
                    "success_rate": f"{success_rate:.1f}%",
                    "sample_size": stats["total"]
                })
        
        platform_rates.sort(key=lambda x: float(x["success_rate"].rstrip('%')), reverse=True)
        
        patterns.append({
            "pattern": "Platform Success Rates",
            "description": "Platforms with highest success rates",
            "data": platform_rates[:5]
        })
        
        return patterns
    
    def predict_revenue_potential(self) -> List[Dict[str, Any]]:
        """Predict revenue potential for different project types"""
        predictions = []
        
        # Revenue indicators
        revenue_tags = {
            "high-revenue": 3,
            "moderate-revenue": 2,
            "low-revenue": 1,
            "subscription-model": 2.5,
            "freemium": 2,
            "one-time-purchase": 1.5,
            "enterprise": 3,
            "b2b": 2.5,
            "b2c": 2
        }
        
        # Calculate revenue scores by category
        category_revenues = defaultdict(lambda: {"scores": [], "projects": []})
        
        for project in self.projects.values():
            revenue_score = 0
            tag_count = 0
            
            for tag in project.get("tags", []):
                if tag in revenue_tags:
                    revenue_score += revenue_tags[tag]
                    tag_count += 1
            
            if tag_count > 0:
                normalized_score = revenue_score / tag_count
                category_revenues[project["category"]]["scores"].append(normalized_score)
                category_revenues[project["category"]]["projects"].append(project["name"])
        
        # Generate predictions
        for category, data in category_revenues.items():
            if data["scores"]:
                avg_score = statistics.mean(data["scores"])
                
                # Estimate revenue range
                if avg_score >= 2.5:
                    revenue_range = "$50K-$500K/year"
                    potential = "High"
                elif avg_score >= 2:
                    revenue_range = "$10K-$50K/year"
                    potential = "Medium"
                else:
                    revenue_range = "$1K-$10K/year"
                    potential = "Low"
                
                predictions.append({
                    "category": category,
                    "revenue_potential": potential,
                    "estimated_range": revenue_range,
                    "confidence": f"{min(95, 60 + len(data['scores']) * 2)}%",
                    "sample_size": len(data["scores"]),
                    "top_projects": data["projects"][:3]
                })
        
        predictions.sort(key=lambda x: {"High": 3, "Medium": 2, "Low": 1}[x["revenue_potential"]], reverse=True)
        
        return predictions[:10]
    
    def generate_development_recommendations(self) -> List[Dict[str, Any]]:
        """Generate strategic development recommendations"""
        recommendations = []
        
        # Quick win analysis
        quick_wins = [
            p for p in self.projects.values() 
            if "quick-win" in p.get("tags", []) and p.get("quality_score", 0) >= 7
        ]
        
        if quick_wins:
            recommendations.append({
                "priority": "High",
                "category": "Quick Wins",
                "recommendation": "Start with high-quality quick-win projects",
                "reasoning": f"Found {len(quick_wins)} projects that can be developed in ≤7 days with quality ≥7/10",
                "examples": [p["name"] for p in quick_wins[:3]],
                "estimated_roi": "2-3 weeks to positive ROI"
            })
        
        # High revenue opportunities
        high_revenue = [
            p for p in self.projects.values()
            if "high-revenue" in p.get("tags", []) and self._get_numeric_value(p.get("technical_complexity", 10)) <= 7
        ]
        
        if high_revenue:
            recommendations.append({
                "priority": "High",
                "category": "Revenue Maximization",
                "recommendation": "Focus on high-revenue projects with manageable complexity",
                "reasoning": f"Identified {len(high_revenue)} high-revenue projects with complexity ≤7/10",
                "examples": [p["name"] for p in high_revenue[:3]],
                "estimated_roi": "3-6 months to significant revenue"
            })
        
        # Platform diversification
        platform_counts = Counter()
        for project in self.projects.values():
            platform_counts.update(project.get("platforms", []))
        
        if len(platform_counts) > 1:
            top_platform = platform_counts.most_common(1)[0][0]
            other_platforms = [p for p, _ in platform_counts.most_common()[1:4]]
            
            recommendations.append({
                "priority": "Medium",
                "category": "Platform Diversification",
                "recommendation": f"Expand beyond {top_platform} to reduce platform risk",
                "reasoning": f"Currently {platform_counts[top_platform]} projects on {top_platform}",
                "examples": other_platforms,
                "estimated_roi": "Reduced platform dependency risk"
            })
        
        # Innovation focus
        innovative_tags = ["ai-powered", "blockchain", "ar-vr", "voice-enabled", "iot"]
        innovative_projects = [
            p for p in self.projects.values()
            if any(tag in p.get("tags", []) for tag in innovative_tags)
        ]
        
        if innovative_projects:
            recommendations.append({
                "priority": "Medium",
                "category": "Innovation Leadership",
                "recommendation": "Invest in emerging technology projects",
                "reasoning": f"Found {len(innovative_projects)} projects using cutting-edge tech",
                "examples": [p["name"] for p in innovative_projects[:3]],
                "estimated_roi": "Long-term competitive advantage"
            })
        
        return recommendations
    
    def analyze_competitive_landscape(self) -> Dict[str, Any]:
        """Analyze competitive landscape"""
        landscape = {
            "market_saturation": {},
            "blue_oceans": [],
            "red_oceans": [],
            "competitive_advantages": []
        }
        
        # Analyze competition levels
        competition_stats = defaultdict(lambda: {"low": 0, "medium": 0, "high": 0, "total": 0})
        
        for project in self.projects.values():
            category = project["category"]
            competition = project.get("competition_level", "").lower()
            if competition in ["low", "medium", "high"]:
                competition_stats[category][competition] += 1
                competition_stats[category]["total"] += 1
        
        # Calculate saturation scores
        for category, stats in competition_stats.items():
            if stats["total"] > 0:
                saturation_score = (
                    stats["low"] * 1 + 
                    stats["medium"] * 2 + 
                    stats["high"] * 3
                ) / (stats["total"] * 3) * 100
                
                landscape["market_saturation"][category] = {
                    "score": round(saturation_score, 1),
                    "level": "High" if saturation_score > 66 else "Medium" if saturation_score > 33 else "Low",
                    "distribution": stats
                }
                
                # Identify blue and red oceans
                if saturation_score < 30 and stats["total"] >= 5:
                    landscape["blue_oceans"].append({
                        "category": category,
                        "saturation": f"{saturation_score:.1f}%",
                        "opportunity": "High",
                        "projects": stats["total"]
                    })
                elif saturation_score > 70:
                    landscape["red_oceans"].append({
                        "category": category,
                        "saturation": f"{saturation_score:.1f}%",
                        "challenge": "High competition",
                        "projects": stats["total"]
                    })
        
        # Identify competitive advantages
        unique_combinations = []
        tag_combinations = defaultdict(int)
        
        for project in self.projects.values():
            tags = sorted(project.get("tags", []))
            if len(tags) >= 3:
                for i in range(len(tags) - 2):
                    combo = tuple(tags[i:i+3])
                    tag_combinations[combo] += 1
        
        # Find unique combinations (appearing in only 1-2 projects)
        for combo, count in tag_combinations.items():
            if 1 <= count <= 2:
                unique_combinations.append({
                    "combination": " + ".join(combo),
                    "uniqueness": "Very High" if count == 1 else "High",
                    "projects": count
                })
        
        landscape["competitive_advantages"] = unique_combinations[:10]
        
        return landscape
    
    def identify_innovation_opportunities(self) -> List[Dict[str, Any]]:
        """Identify opportunities for innovation"""
        opportunities = []
        
        # Cross-category innovation
        category_pairs = [
            ("ai-ml", "design-tools"),
            ("blockchain", "productivity"),
            ("gaming", "education"),
            ("health-fitness", "ai-ml"),
            ("e-commerce", "ar-vr")
        ]
        
        for cat1, cat2 in category_pairs:
            # Check if combination exists
            combo_projects = [
                p for p in self.projects.values()
                if p["category"] == cat1 and any(cat2 in tag for tag in p.get("tags", []))
            ]
            
            if len(combo_projects) < 2:
                opportunities.append({
                    "type": "Cross-Category Innovation",
                    "opportunity": f"{cat1} × {cat2}",
                    "current_projects": len(combo_projects),
                    "potential": "High",
                    "example": f"Combine {cat1} expertise with {cat2} capabilities",
                    "innovation_score": 9 - len(combo_projects) * 2
                })
        
        # Emerging technology integration
        emerging_tech = {
            "gpt-4": "Advanced language models",
            "web3": "Decentralized applications",
            "ar-vr": "Immersive experiences",
            "edge-computing": "Local processing power",
            "quantum": "Quantum computing readiness"
        }
        
        for tech, description in emerging_tech.items():
            tech_projects = [
                p for p in self.projects.values()
                if tech in " ".join(p.get("tags", [])).lower()
            ]
            
            if len(tech_projects) < 5:
                opportunities.append({
                    "type": "Emerging Technology",
                    "opportunity": tech,
                    "description": description,
                    "current_projects": len(tech_projects),
                    "potential": "Very High" if len(tech_projects) == 0 else "High",
                    "innovation_score": 10 - len(tech_projects)
                })
        
        # Sort by innovation score
        opportunities.sort(key=lambda x: x["innovation_score"], reverse=True)
        
        return opportunities[:10]
    
    def assess_portfolio_risks(self) -> Dict[str, Any]:
        """Assess risks in the project portfolio"""
        risks = {
            "platform_concentration": [],
            "technology_risks": [],
            "market_risks": [],
            "complexity_risks": [],
            "overall_risk_score": 0
        }
        
        # Platform concentration risk
        platform_counts = Counter()
        total_projects = len(self.projects)
        
        for project in self.projects.values():
            platform_counts.update(project.get("platforms", []))
        
        for platform, count in platform_counts.most_common(3):
            concentration = count / total_projects * 100
            if concentration > 30:
                risks["platform_concentration"].append({
                    "platform": platform,
                    "concentration": f"{concentration:.1f}%",
                    "risk_level": "High" if concentration > 50 else "Medium",
                    "mitigation": f"Diversify beyond {platform} to reduce dependency"
                })
        
        # Technology obsolescence risk
        legacy_indicators = ["jquery", "php", "flash", "silverlight"]
        for indicator in legacy_indicators:
            legacy_projects = [
                p for p in self.projects.values()
                if indicator in " ".join(p.get("tags", [])).lower()
            ]
            if legacy_projects:
                risks["technology_risks"].append({
                    "technology": indicator,
                    "affected_projects": len(legacy_projects),
                    "risk_level": "Medium",
                    "mitigation": "Consider modernizing technology stack"
                })
        
        # Market saturation risk
        high_competition_categories = []
        for project in self.projects.values():
            if project.get("competition_level", "").lower() == "high":
                high_competition_categories.append(project["category"])
        
        category_competition = Counter(high_competition_categories)
        for category, count in category_competition.most_common(3):
            risks["market_risks"].append({
                "category": category,
                "high_competition_projects": count,
                "risk_level": "Medium" if count > 10 else "Low",
                "mitigation": "Focus on differentiation and unique value propositions"
            })
        
        # Complexity risk
        high_complexity_projects = [
            p for p in self.projects.values()
            if self._get_numeric_value(p.get("technical_complexity", 0)) >= 8
        ]
        
        if len(high_complexity_projects) > total_projects * 0.2:
            risks["complexity_risks"].append({
                "issue": "Portfolio complexity",
                "high_complexity_ratio": f"{len(high_complexity_projects)/total_projects*100:.1f}%",
                "risk_level": "Medium",
                "mitigation": "Balance with simpler projects for steady revenue"
            })
        
        # Calculate overall risk score
        risk_factors = (
            len(risks["platform_concentration"]) * 2 +
            len(risks["technology_risks"]) +
            len(risks["market_risks"]) +
            len(risks["complexity_risks"])
        )
        risks["overall_risk_score"] = min(10, risk_factors)
        risks["risk_level"] = "High" if risk_factors > 7 else "Medium" if risk_factors > 4 else "Low"
        
        return risks
    
    def generate_personalized_recommendations(self) -> List[Dict[str, Any]]:
        """Generate personalized project recommendations based on patterns"""
        recommendations = []
        
        # Beginner-friendly path
        beginner_projects = [
            p for p in self.projects.values()
            if "beginner-friendly" in p.get("tags", []) and 
            p.get("quality_score", 0) >= 7 and
            self._get_numeric_value(p.get("technical_complexity", 10)) <= 5
        ]
        
        if beginner_projects:
            beginner_projects.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
            recommendations.append({
                "persona": "Beginner Developer",
                "focus": "Learning and Quick Wins",
                "recommended_projects": [p["name"] for p in beginner_projects[:5]],
                "path": "Start with simple, high-quality projects to build confidence",
                "estimated_timeline": "2-4 weeks to first launch",
                "key_tags": ["beginner-friendly", "quick-win", "well-documented"]
            })
        
        # Revenue-focused path
        revenue_projects = [
            p for p in self.projects.values()
            if "high-revenue" in p.get("tags", []) and
            "quick-win" in p.get("tags", [])
        ]
        
        if revenue_projects:
            revenue_projects.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
            recommendations.append({
                "persona": "Revenue-Focused Developer",
                "focus": "Fast Monetization",
                "recommended_projects": [p["name"] for p in revenue_projects[:5]],
                "path": "Quick-to-market projects with proven revenue models",
                "estimated_timeline": "1-2 months to first revenue",
                "key_tags": ["high-revenue", "quick-win", "subscription-model"]
            })
        
        # Innovation-focused path
        innovation_projects = [
            p for p in self.projects.values()
            if any(tag in p.get("tags", []) for tag in ["ai-powered", "blockchain", "ar-vr"]) and
            p.get("quality_score", 0) >= 8
        ]
        
        if innovation_projects:
            innovation_projects.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
            recommendations.append({
                "persona": "Innovation Pioneer",
                "focus": "Cutting-Edge Technology",
                "recommended_projects": [p["name"] for p in innovation_projects[:5]],
                "path": "Build expertise in emerging technologies",
                "estimated_timeline": "3-6 months to market leadership",
                "key_tags": ["ai-powered", "innovative", "first-mover"]
            })
        
        # Platform specialist paths
        platform_specialists = {
            "figma-plugin": "Design Tool Specialist",
            "chrome-extension": "Browser Extension Expert",
            "vscode-extension": "Developer Tool Creator"
        }
        
        for platform, persona in platform_specialists.items():
            platform_projects = [
                p for p in self.projects.values()
                if platform in p.get("platforms", []) and
                p.get("quality_score", 0) >= 7
            ]
            
            if len(platform_projects) >= 5:
                platform_projects.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
                recommendations.append({
                    "persona": persona,
                    "focus": f"Mastery of {platform.replace('-', ' ').title()}",
                    "recommended_projects": [p["name"] for p in platform_projects[:5]],
                    "path": f"Become a recognized expert in {platform} development",
                    "estimated_timeline": "2-3 months to platform expertise",
                    "key_tags": [f"platform-{platform}", "high-quality", "best-practices"]
                })
        
        return recommendations
    
    def save_insights(self, insights: Dict[str, Any], output_file: str = None):
        """Save insights to file"""
        if not output_file:
            output_file = os.path.join(self.data_dir, "ai_insights.json")
        
        with open(output_file, 'w') as f:
            json.dump(insights, f, indent=2)
        
        print(f"\nInsights saved to: {output_file}")
        
        # Also save a markdown report
        report_file = output_file.replace('.json', '_report.md')
        self._generate_markdown_report(insights, report_file)
    
    def _generate_markdown_report(self, insights: Dict[str, Any], output_file: str):
        """Generate a markdown report from insights"""
        report = []
        report.append("# AI-Powered Insights Report")
        report.append(f"\nGenerated: {insights['generated_at']}")
        report.append("\n---\n")
        
        # Market Opportunities
        report.append("## 🎯 Market Opportunities\n")
        for opp in insights["market_opportunities"][:5]:
            report.append(f"### {opp['type'].replace('_', ' ').title()}")
            report.append(f"- **Opportunity Score**: {opp['opportunity_score']}/10")
            report.append(f"- **Recommendation**: {opp['recommendation']}")
            if "category" in opp:
                report.append(f"- **Category**: {opp['category']}")
            if "platform" in opp:
                report.append(f"- **Platform**: {opp['platform']}")
            report.append("")
        
        # Trending Technologies
        report.append("## 📈 Trending Technologies\n")
        for trend in insights["trending_technologies"][:5]:
            report.append(f"### {trend['technology'].replace('-', ' ').title()}")
            report.append(f"- **Trend Score**: {trend['trend_score']}/10")
            report.append(f"- **Projects**: {trend['project_count']}")
            report.append(f"- **Insight**: {trend['insight']}")
            report.append("")
        
        # Success Patterns
        if "success_patterns" in insights:
            report.append("## 🏆 Success Patterns\n")
            for pattern in insights["success_patterns"]:
                report.append(f"### {pattern['pattern']}")
                report.append(f"{pattern['description']}\n")
                if "data" in pattern and pattern["data"]:
                    for item in pattern["data"][:3]:
                        if isinstance(item, dict):
                            report.append(f"- {item}")
                report.append("")
        
        # Development Recommendations
        report.append("## 💡 Development Recommendations\n")
        for rec in insights["development_recommendations"]:
            report.append(f"### {rec['category']} (Priority: {rec['priority']})")
            report.append(f"**{rec['recommendation']}**")
            report.append(f"- Reasoning: {rec['reasoning']}")
            report.append(f"- ROI: {rec['estimated_roi']}")
            if "examples" in rec and rec["examples"]:
                report.append(f"- Examples: {', '.join(rec['examples'][:3])}")
            report.append("")
        
        # Risk Assessment
        risks = insights["risk_assessment"]
        report.append("## ⚠️ Risk Assessment\n")
        report.append(f"**Overall Risk Level**: {risks['risk_level']} ({risks['overall_risk_score']}/10)\n")
        
        if risks["platform_concentration"]:
            report.append("### Platform Concentration Risks")
            for risk in risks["platform_concentration"]:
                report.append(f"- {risk['platform']}: {risk['concentration']} concentration ({risk['risk_level']} risk)")
        
        # Save report
        with open(output_file, 'w') as f:
            f.write("\n".join(report))
        
        print(f"Markdown report saved to: {output_file}")


def main():
    """Generate AI insights"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate AI-powered insights')
    parser.add_argument('--data-dir', default='data', help='Data directory path')
    parser.add_argument('--output', help='Output file path')
    parser.add_argument('--category', help='Focus on specific category')
    parser.add_argument('--quick', action='store_true', help='Generate quick insights only')
    
    args = parser.parse_args()
    
    # Create insights engine
    engine = AIInsightsEngine(args.data_dir)
    
    # Generate insights
    if args.quick:
        insights = {
            "market_opportunities": engine.analyze_market_opportunities()[:3],
            "trending_technologies": engine.identify_trending_technologies()[:3],
            "development_recommendations": engine.generate_development_recommendations()[:3],
            "generated_at": datetime.now().isoformat()
        }
    else:
        insights = engine.generate_all_insights()
    
    # Save insights
    engine.save_insights(insights, args.output)
    
    # Print summary
    print("\n=== AI Insights Summary ===")
    print(f"Market Opportunities: {len(insights.get('market_opportunities', []))}")
    print(f"Trending Technologies: {len(insights.get('trending_technologies', []))}")
    print(f"Development Recommendations: {len(insights.get('development_recommendations', []))}")
    
    if insights.get('risk_assessment'):
        print(f"\nRisk Level: {insights['risk_assessment']['risk_level']}")
    
    print("\n✅ AI insights generation complete!")


if __name__ == "__main__":
    main()