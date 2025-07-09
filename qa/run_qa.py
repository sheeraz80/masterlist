#!/usr/bin/env python3
"""
QA Runner - Comprehensive quality assurance automation
Runs all validation, scoring, and integrity checks with reporting.
"""

import sys
import os
import json
from datetime import datetime
from pathlib import Path
import argparse
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from qa.validation_system import ValidationSystem
from qa.quality_scorer import QualityScorer
from qa.integrity_checker import IntegrityChecker

class QARunner:
    def __init__(self, output_dir: str = "qa_reports"):
        """Initialize QA runner."""
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Initialize systems
        self.validator = ValidationSystem()
        self.scorer = QualityScorer()
        self.integrity_checker = IntegrityChecker()
        
        # Track results
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'validation': None,
            'quality_scores': None,
            'integrity': None,
            'summary': {}
        }
        
    def run_validation(self, verbose: bool = False) -> Dict:
        """Run data validation checks."""
        print("🔍 Running data validation...")
        validation_results = self.validator.validate_all()
        
        if verbose:
            summary = validation_results['summary']
            print(f"   ✓ Projects validated: {summary['projects_validated']}")
            print(f"   ❌ Errors: {summary['errors']}")
            print(f"   ⚠️  Warnings: {summary['warnings']}")
            print(f"   ℹ️  Info: {summary['info']}")
            
        self.results['validation'] = validation_results
        return validation_results
        
    def run_quality_scoring(self, verbose: bool = False) -> Dict:
        """Run quality scoring."""
        print("📊 Running quality scoring...")
        scoring_results = self.scorer.score_all_projects()
        
        if verbose:
            print(f"   ✓ Projects scored: {scoring_results['projects_scored']}")
            print(f"   📈 Average score: {scoring_results.get('average_score', 0)}/10")
            print(f"   📊 Median score: {scoring_results.get('median_score', 0)}/10")
            
        self.results['quality_scores'] = scoring_results
        return scoring_results
        
    def run_integrity_checks(self, verbose: bool = False) -> Dict:
        """Run data integrity checks."""
        print("🔗 Running integrity checks...")
        integrity_results = self.integrity_checker.run_all_checks()
        
        if verbose:
            # Count total issues
            total_issues = 0
            for check_data in integrity_results.values():
                if isinstance(check_data, dict):
                    total_issues += len(check_data.get('issues', []))
                    total_issues += len(check_data.get('inconsistencies', []))
                    total_issues += len(check_data.get('orphaned_data', []))
                    total_issues += len(check_data.get('relationship_issues', []))
                    total_issues += len(check_data.get('sync_issues', []))
                    total_issues += len(check_data.get('structure_issues', []))
                    
            print(f"   {'❌' if total_issues > 0 else '✅'} Total issues: {total_issues}")
            
        self.results['integrity'] = integrity_results
        return integrity_results
        
    def generate_summary(self) -> Dict:
        """Generate QA summary."""
        summary = {
            'overall_health': 'Unknown',
            'health_score': 0,
            'critical_issues': 0,
            'warnings': 0,
            'recommendations': []
        }
        
        # Validation summary
        if self.results['validation']:
            val_summary = self.results['validation']['summary']
            summary['critical_issues'] += val_summary['errors']
            summary['warnings'] += val_summary['warnings']
            
            if val_summary['errors'] > 0:
                summary['recommendations'].append(
                    f"Fix {val_summary['errors']} validation errors"
                )
                
        # Quality score summary
        if self.results['quality_scores']:
            avg_score = self.results['quality_scores'].get('average_score', 0)
            if avg_score < 6:
                summary['recommendations'].append(
                    "Improve project quality - average score below 6/10"
                )
                
        # Integrity summary
        if self.results['integrity']:
            integrity_issues = 0
            for check_data in self.results['integrity'].values():
                if isinstance(check_data, dict):
                    integrity_issues += len(check_data.get('issues', []))
                    integrity_issues += len(check_data.get('inconsistencies', []))
                    integrity_issues += len(check_data.get('orphaned_data', []))
                    
            if integrity_issues > 0:
                summary['critical_issues'] += integrity_issues
                summary['recommendations'].append(
                    f"Resolve {integrity_issues} data integrity issues"
                )
                
        # Calculate health score
        health_score = 100
        health_score -= min(summary['critical_issues'] * 5, 40)
        health_score -= min(summary['warnings'] * 2, 30)
        
        if self.results['quality_scores']:
            avg_quality = self.results['quality_scores'].get('average_score', 5)
            quality_penalty = (10 - avg_quality) * 3
            health_score -= quality_penalty
            
        health_score = max(0, min(100, health_score))
        summary['health_score'] = round(health_score)
        
        # Determine overall health
        if health_score >= 90:
            summary['overall_health'] = 'Excellent'
        elif health_score >= 75:
            summary['overall_health'] = 'Good'
        elif health_score >= 60:
            summary['overall_health'] = 'Fair'
        elif health_score >= 40:
            summary['overall_health'] = 'Poor'
        else:
            summary['overall_health'] = 'Critical'
            
        self.results['summary'] = summary
        return summary
        
    def generate_comprehensive_report(self) -> str:
        """Generate comprehensive QA report."""
        lines = ["# Comprehensive QA Report\n"]
        
        lines.append(f"**Generated:** {self.results['timestamp']}")
        lines.append(f"**Report Directory:** {self.output_dir}\n")
        
        # Executive Summary
        summary = self.results['summary']
        lines.append("## Executive Summary\n")
        
        health_emoji = {
            'Excellent': '🟢',
            'Good': '🟡',
            'Fair': '🟠',
            'Poor': '🔴',
            'Critical': '🔴'
        }.get(summary['overall_health'], '⚪')
        
        lines.append(f"### {health_emoji} Overall Health: {summary['overall_health']} ({summary['health_score']}/100)\n")
        
        lines.append("**Key Metrics:**")
        lines.append(f"- Critical Issues: {summary['critical_issues']}")
        lines.append(f"- Warnings: {summary['warnings']}")
        
        if self.results['validation']:
            val_summary = self.results['validation']['summary']
            lines.append(f"- Projects Validated: {val_summary['projects_validated']}")
            
        if self.results['quality_scores']:
            lines.append(f"- Average Quality Score: {self.results['quality_scores'].get('average_score', 0)}/10")
            
        lines.append("")
        
        # Recommendations
        if summary['recommendations']:
            lines.append("### 🎯 Top Recommendations\n")
            for i, rec in enumerate(summary['recommendations'][:5], 1):
                lines.append(f"{i}. {rec}")
            lines.append("")
            
        # Validation Results
        if self.results['validation']:
            lines.append("## Data Validation Results\n")
            val_summary = self.results['validation']['summary']
            
            lines.append(f"- Total Issues: {val_summary['total_issues']}")
            lines.append(f"- Errors: {val_summary['errors']} ❌")
            lines.append(f"- Warnings: {val_summary['warnings']} ⚠️")
            lines.append(f"- Info: {val_summary['info']} ℹ️")
            
            # Top validation issues
            if val_summary['total_issues'] > 0:
                lines.append("\n**Top Issues:**")
                
                # Get first few projects with issues
                project_issues = self.results['validation'].get('project_issues', {})
                for project_key, issues in list(project_issues.items())[:5]:
                    project_name = self.validator.projects.get(project_key, {}).get('name', project_key)
                    lines.append(f"- {project_name}: {len(issues)} issues")
                    
            lines.append("")
            
        # Quality Scoring Results
        if self.results['quality_scores']:
            lines.append("## Quality Scoring Results\n")
            
            lines.append(f"- Projects Scored: {self.results['quality_scores']['projects_scored']}")
            lines.append(f"- Average Score: {self.results['quality_scores'].get('average_score', 0)}/10")
            lines.append(f"- Median Score: {self.results['quality_scores'].get('median_score', 0)}/10")
            lines.append(f"- Standard Deviation: {self.results['quality_scores'].get('score_std_dev', 0)}")
            
            # Grade distribution
            lines.append("\n**Grade Distribution:**")
            distribution = self.results['quality_scores'].get('score_distribution', {})
            for grade in ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D']:
                count = distribution.get(grade, 0)
                if count > 0:
                    lines.append(f"- {grade}: {count} projects")
                    
            lines.append("")
            
        # Integrity Check Results
        if self.results['integrity']:
            lines.append("## Data Integrity Results\n")
            
            # File integrity
            file_integrity = self.results['integrity'].get('file_integrity', {})
            if file_integrity:
                files_present = file_integrity.get('files_present', {})
                all_present = all(files_present.values()) if files_present else False
                
                lines.append(f"- File Integrity: {'✅ All files present' if all_present else '❌ Missing files'}")
                
            # Project consistency
            consistency = self.results['integrity'].get('project_consistency', {})
            if consistency:
                lines.append(f"- Consistent Projects: {consistency.get('consistent_projects', 0)}/{consistency.get('total_projects', 0)}")
                
            # Data relationships
            relationships = self.results['integrity'].get('data_relationships', {})
            if relationships:
                total_rel = relationships.get('valid_relationships', 0) + relationships.get('invalid_relationships', 0)
                if total_rel > 0:
                    validity_rate = (relationships.get('valid_relationships', 0) / total_rel) * 100
                    lines.append(f"- Relationship Validity: {validity_rate:.1f}%")
                    
            lines.append("")
            
        # Action Items
        lines.append("## Action Items\n")
        
        action_priority = []
        
        if summary['critical_issues'] > 0:
            action_priority.append(("High", "Resolve critical data issues", "qa_reports/validation_report.md"))
            
        if self.results['quality_scores'] and self.results['quality_scores'].get('average_score', 0) < 6:
            action_priority.append(("Medium", "Improve low-scoring projects", "qa_reports/quality_report.md"))
            
        if self.results['integrity']:
            integrity_issues = sum(
                len(check.get('issues', [])) + len(check.get('inconsistencies', [])) + len(check.get('orphaned_data', []))
                for check in self.results['integrity'].values()
                if isinstance(check, dict)
            )
            if integrity_issues > 10:
                action_priority.append(("Medium", "Fix data integrity issues", "qa_reports/integrity_report.md"))
                
        for priority, action, report in action_priority:
            lines.append(f"- **[{priority}]** {action} (see {report})")
            
        # Report locations
        lines.append("\n## Detailed Reports\n")
        lines.append("- **Validation Report:** `qa_reports/validation_report.md`")
        lines.append("- **Quality Report:** `qa_reports/quality_report.md`")
        lines.append("- **Integrity Report:** `qa_reports/integrity_report.md`")
        lines.append("- **Full Results:** `qa_reports/qa_results.json`")
        
        return '\n'.join(lines)
        
    def save_reports(self):
        """Save all QA reports."""
        # Save validation report
        if self.results['validation']:
            validation_report = self.validator.generate_validation_report(
                self.results['validation'], 
                format='markdown'
            )
            with open(self.output_dir / 'validation_report.md', 'w') as f:
                f.write(validation_report)
                
        # Save quality report
        if self.results['quality_scores']:
            quality_report = self.scorer.generate_quality_report(
                self.results['quality_scores']
            )
            with open(self.output_dir / 'quality_report.md', 'w') as f:
                f.write(quality_report)
                
        # Save integrity report
        if self.results['integrity']:
            integrity_report = self.integrity_checker.generate_integrity_report(
                self.results['integrity']
            )
            with open(self.output_dir / 'integrity_report.md', 'w') as f:
                f.write(integrity_report)
                
        # Save comprehensive report
        comprehensive_report = self.generate_comprehensive_report()
        with open(self.output_dir / 'comprehensive_qa_report.md', 'w') as f:
            f.write(comprehensive_report)
            
        # Save raw results
        with open(self.output_dir / 'qa_results.json', 'w') as f:
            # Create serializable results
            serializable_results = {
                'timestamp': self.results['timestamp'],
                'summary': self.results['summary']
            }
            
            # Add validation summary
            if self.results['validation']:
                serializable_results['validation_summary'] = self.results['validation']['summary']
                
            # Add quality summary
            if self.results['quality_scores']:
                serializable_results['quality_summary'] = {
                    'average_score': self.results['quality_scores'].get('average_score', 0),
                    'median_score': self.results['quality_scores'].get('median_score', 0),
                    'projects_scored': self.results['quality_scores'].get('projects_scored', 0)
                }
                
            json.dump(serializable_results, f, indent=2)
            
        print(f"\n📁 Reports saved to: {self.output_dir}/")
        
    def run_all(self, verbose: bool = False):
        """Run all QA checks."""
        print("🚀 Starting comprehensive QA process...\n")
        
        # Run checks
        self.run_validation(verbose)
        self.run_quality_scoring(verbose)
        self.run_integrity_checks(verbose)
        
        # Generate summary
        summary = self.generate_summary()
        
        # Save reports
        self.save_reports()
        
        # Display summary
        print("\n" + "="*50)
        print("📊 QA SUMMARY")
        print("="*50)
        
        health_emoji = {
            'Excellent': '🟢',
            'Good': '🟡', 
            'Fair': '🟠',
            'Poor': '🔴',
            'Critical': '🔴'
        }.get(summary['overall_health'], '⚪')
        
        print(f"\n{health_emoji} Overall Health: {summary['overall_health']} ({summary['health_score']}/100)")
        print(f"❌ Critical Issues: {summary['critical_issues']}")
        print(f"⚠️  Warnings: {summary['warnings']}")
        
        if summary['recommendations']:
            print("\n🎯 Top Recommendations:")
            for i, rec in enumerate(summary['recommendations'][:3], 1):
                print(f"   {i}. {rec}")
                
        print(f"\n✅ QA process complete! Check {self.output_dir}/ for detailed reports.")

def main():
    parser = argparse.ArgumentParser(description="Run comprehensive QA checks")
    parser.add_argument('--check', choices=['all', 'validation', 'quality', 'integrity'], 
                       default='all', help='Type of check to run')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--output-dir', default='qa_reports', help='Output directory for reports')
    parser.add_argument('--quick', action='store_true', help='Quick check without full reports')
    
    args = parser.parse_args()
    
    qa_runner = QARunner(args.output_dir)
    
    if args.check == 'all':
        qa_runner.run_all(args.verbose)
    elif args.check == 'validation':
        results = qa_runner.run_validation(args.verbose)
        if not args.quick:
            qa_runner.save_reports()
    elif args.check == 'quality':
        results = qa_runner.run_quality_scoring(args.verbose)
        if not args.quick:
            qa_runner.save_reports()
    elif args.check == 'integrity':
        results = qa_runner.run_integrity_checks(args.verbose)
        if not args.quick:
            qa_runner.save_reports()

if __name__ == "__main__":
    main()