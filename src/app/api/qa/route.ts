import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface QualityMetrics {
  project_id: string;
  title: string;
  category: string;
  quality_issues: QualityIssue[];
  quality_score: number;
  completeness_score: number;
  validation_results: ValidationResult[];
  recommendations: string[];
}

interface QualityIssue {
  type: 'missing_field' | 'invalid_data' | 'inconsistency' | 'quality_concern';
  field: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion?: string;
  project_id?: string;
}

interface ValidationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

interface QAReport {
  summary: {
    total_projects: number;
    projects_with_issues: number;
    average_quality_score: number;
    average_completeness: number;
    total_issues: number;
    issues_by_severity: Record<string, number>;
    issues_by_type: Record<string, number>;
  };
  top_issues: QualityIssue[];
  projects_needing_attention: QualityMetrics[];
  best_quality_projects: QualityMetrics[];
  category_quality_analysis: Record<string, {
    average_quality: number;
    common_issues: string[];
    project_count: number;
  }>;
  field_completeness: Record<string, {
    filled_count: number;
    missing_count: number;
    percentage: number;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const includeDetails = searchParams.get('details') === 'true';

    const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
    
    let projects: any[] = [];
    
    if (fs.existsSync(projectsPath)) {
      const data = fs.readFileSync(projectsPath, 'utf-8');
      projects = JSON.parse(data);
    }

    // Filter projects if category is specified
    if (category && category !== 'all') {
      projects = projects.filter(p => p.category === category);
    }

    const qaReport = generateQAReport(projects, includeDetails);

    // Filter by severity if specified
    if (severity && severity !== 'all') {
      qaReport.projects_needing_attention = qaReport.projects_needing_attention.filter(p => 
        p.quality_issues.some(issue => issue.severity === severity)
      );
    }

    return NextResponse.json(qaReport);
  } catch (error) {
    console.error('Error generating QA report:', error);
    return NextResponse.json(
      { error: 'Failed to generate QA report' },
      { status: 500 }
    );
  }
}

function generateQAReport(projects: any[], includeDetails: boolean): QAReport {
  const projectMetrics: QualityMetrics[] = [];
  let totalIssues = 0;
  const issuesBySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  const issuesByType: Record<string, number> = { missing_field: 0, invalid_data: 0, inconsistency: 0, quality_concern: 0 };
  const allIssues: QualityIssue[] = [];

  // Required fields for completeness check
  const requiredFields = [
    'title', 'problem', 'solution', 'target_users', 'revenue_model', 
    'revenue_potential', 'development_time', 'competition_level', 
    'technical_complexity', 'key_features'
  ];

  projects.forEach(project => {
    const issues: QualityIssue[] = [];
    const validationResults: ValidationResult[] = [];
    
    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!project[field] || (Array.isArray(project[field]) && project[field].length === 0)) {
        const issue: QualityIssue = {
          type: 'missing_field',
          field,
          severity: 'high',
          message: `Missing required field: ${field}`,
          suggestion: `Please provide a value for ${field}`
        };
        issues.push(issue);
        allIssues.push({ ...issue, project_id: project.id });
      }
    });

    // Validate data quality
    validateProjectData(project, issues, validationResults);

    // Calculate completeness score
    const filledFields = requiredFields.filter(field => 
      project[field] && 
      (typeof project[field] !== 'string' || project[field].trim().length > 0) &&
      (!Array.isArray(project[field]) || project[field].length > 0)
    );
    const completenessScore = (filledFields.length / requiredFields.length) * 100;

    // Calculate quality score based on various factors
    const qualityScore = calculateProjectQualityScore(project, issues);

    // Generate recommendations
    const recommendations = generateRecommendations(project, issues);

    issues.forEach(issue => {
      issuesBySeverity[issue.severity]++;
      issuesByType[issue.type]++;
      totalIssues++;
    });

    projectMetrics.push({
      project_id: project.id,
      title: project.title,
      category: project.category,
      quality_issues: issues,
      quality_score: qualityScore,
      completeness_score: completenessScore,
      validation_results: validationResults,
      recommendations
    });
  });

  // Calculate field completeness statistics
  const fieldCompleteness: Record<string, { filled_count: number; missing_count: number; percentage: number }> = {};
  requiredFields.forEach(field => {
    const filledCount = projects.filter(p => 
      p[field] && 
      (typeof p[field] !== 'string' || p[field].trim().length > 0) &&
      (!Array.isArray(p[field]) || p[field].length > 0)
    ).length;
    const missingCount = projects.length - filledCount;
    
    fieldCompleteness[field] = {
      filled_count: filledCount,
      missing_count: missingCount,
      percentage: (filledCount / projects.length) * 100
    };
  });

  // Category quality analysis
  const categoryQuality: Record<string, { average_quality: number; common_issues: string[]; project_count: number }> = {};
  const categories = Array.from(new Set(projects.map(p => p.category)));
  
  categories.forEach(category => {
    const categoryProjects = projectMetrics.filter(p => p.category === category);
    const avgQuality = categoryProjects.reduce((sum, p) => sum + p.quality_score, 0) / categoryProjects.length;
    
    const categoryIssues = categoryProjects.flatMap(p => p.quality_issues);
    const commonIssues = Array.from(new Set(categoryIssues.map(i => i.message)))
      .slice(0, 5); // Top 5 most common issues
    
    categoryQuality[category] = {
      average_quality: avgQuality,
      common_issues: commonIssues,
      project_count: categoryProjects.length
    };
  });

  // Sort and filter results
  const projectsWithIssues = projectMetrics.filter(p => p.quality_issues.length > 0);
  const projectsNeedingAttention = projectMetrics
    .filter(p => p.quality_score < 7 || p.completeness_score < 80)
    .sort((a, b) => a.quality_score - b.quality_score)
    .slice(0, 20);

  const bestQualityProjects = projectMetrics
    .filter(p => p.quality_score >= 8 && p.completeness_score >= 95)
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 10);

  // Get top issues by frequency
  const issueFrequency: Record<string, number> = {};
  allIssues.forEach(issue => {
    issueFrequency[issue.message] = (issueFrequency[issue.message] || 0) + 1;
  });

  const topIssues = Object.entries(issueFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([message, count]) => {
      const sampleIssue = allIssues.find(i => i.message === message);
      return {
        ...sampleIssue!,
        frequency: count
      };
    });

  return {
    summary: {
      total_projects: projects.length,
      projects_with_issues: projectsWithIssues.length,
      average_quality_score: projectMetrics.reduce((sum, p) => sum + p.quality_score, 0) / projectMetrics.length,
      average_completeness: projectMetrics.reduce((sum, p) => sum + p.completeness_score, 0) / projectMetrics.length,
      total_issues: totalIssues,
      issues_by_severity: issuesBySeverity,
      issues_by_type: issuesByType,
    },
    top_issues: topIssues,
    projects_needing_attention: projectsNeedingAttention,
    best_quality_projects: bestQualityProjects,
    category_quality_analysis: categoryQuality,
    field_completeness: fieldCompleteness,
  };
}

function validateProjectData(project: any, issues: QualityIssue[], validationResults: ValidationResult[]): void {
  // Validate revenue potential
  if (project.revenue_potential) {
    const { conservative, realistic, optimistic } = project.revenue_potential;
    
    if (conservative && realistic && optimistic) {
      if (conservative > realistic) {
        issues.push({
          type: 'inconsistency',
          field: 'revenue_potential',
          severity: 'medium',
          message: 'Conservative revenue higher than realistic',
          suggestion: 'Ensure conservative ≤ realistic ≤ optimistic'
        });
      }
      
      if (realistic > optimistic) {
        issues.push({
          type: 'inconsistency',
          field: 'revenue_potential',
          severity: 'medium',
          message: 'Realistic revenue higher than optimistic',
          suggestion: 'Ensure conservative ≤ realistic ≤ optimistic'
        });
      }
    }

    validationResults.push({
      check: 'Revenue Potential Consistency',
      status: conservative <= realistic && realistic <= optimistic ? 'pass' : 'fail',
      message: 'Revenue values should follow: conservative ≤ realistic ≤ optimistic'
    });
  }

  // Validate technical complexity
  if (project.technical_complexity !== undefined) {
    if (project.technical_complexity < 0 || project.technical_complexity > 10) {
      issues.push({
        type: 'invalid_data',
        field: 'technical_complexity',
        severity: 'medium',
        message: 'Technical complexity should be between 0-10',
        suggestion: 'Set complexity to a value between 0 and 10'
      });
    }

    validationResults.push({
      check: 'Technical Complexity Range',
      status: project.technical_complexity >= 0 && project.technical_complexity <= 10 ? 'pass' : 'fail',
      message: 'Technical complexity should be 0-10'
    });
  }

  // Validate quality score
  if (project.quality_score !== undefined) {
    if (project.quality_score < 0 || project.quality_score > 10) {
      issues.push({
        type: 'invalid_data',
        field: 'quality_score',
        severity: 'medium',
        message: 'Quality score should be between 0-10',
        suggestion: 'Recalculate quality score'
      });
    }
  }

  // Check content quality
  if (project.problem && project.problem.length < 50) {
    issues.push({
      type: 'quality_concern',
      field: 'problem',
      severity: 'low',
      message: 'Problem description is too short',
      suggestion: 'Provide a more detailed problem description (min 50 characters)'
    });
  }

  if (project.solution && project.solution.length < 50) {
    issues.push({
      type: 'quality_concern',
      field: 'solution',
      severity: 'low',
      message: 'Solution description is too short',
      suggestion: 'Provide a more detailed solution description (min 50 characters)'
    });
  }

  // Check key features
  if (project.key_features && Array.isArray(project.key_features)) {
    if (project.key_features.length < 3) {
      issues.push({
        type: 'quality_concern',
        field: 'key_features',
        severity: 'medium',
        message: 'Too few key features listed',
        suggestion: 'List at least 3-5 key features'
      });
    }

    validationResults.push({
      check: 'Key Features Count',
      status: project.key_features.length >= 3 ? 'pass' : 'warning',
      message: `Has ${project.key_features.length} key features (recommended: 3+)`
    });
  }
}

function calculateProjectQualityScore(project: any, issues: QualityIssue[]): number {
  let score = 10; // Start with perfect score

  // Deduct points for issues
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical': score -= 3; break;
      case 'high': score -= 2; break;
      case 'medium': score -= 1; break;
      case 'low': score -= 0.5; break;
    }
  });

  // Bonus points for completeness
  const hasAllRequired = [
    'title', 'problem', 'solution', 'target_users', 'revenue_model',
    'revenue_potential', 'development_time', 'competition_level'
  ].every(field => project[field]);

  if (hasAllRequired) score += 1;

  // Content quality bonus
  if (project.problem && project.problem.length > 100) score += 0.5;
  if (project.solution && project.solution.length > 100) score += 0.5;
  if (project.key_features && project.key_features.length >= 5) score += 0.5;

  return Math.max(0, Math.min(10, score));
}

function generateRecommendations(project: any, issues: QualityIssue[]): string[] {
  const recommendations: string[] = [];

  // Priority recommendations based on issues
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');

  if (criticalIssues.length > 0) {
    recommendations.push('🚨 Address critical issues immediately to improve project viability');
  }

  if (highIssues.length > 0) {
    recommendations.push('⚠️ Focus on resolving high-priority data quality issues');
  }

  // Missing field recommendations
  const missingFields = issues.filter(i => i.type === 'missing_field');
  if (missingFields.length > 0) {
    recommendations.push(`📝 Complete missing fields: ${missingFields.map(i => i.field).join(', ')}`);
  }

  // Quality improvements
  if (project.problem && project.problem.length < 100) {
    recommendations.push('📖 Expand problem description with more details and context');
  }

  if (project.solution && project.solution.length < 100) {
    recommendations.push('💡 Provide more comprehensive solution details');
  }

  if (!project.key_features || project.key_features.length < 3) {
    recommendations.push('⭐ Add more key features to better showcase the project value');
  }

  // Revenue model recommendations
  if (project.revenue_potential) {
    const realistic = project.revenue_potential.realistic || 0;
    if (realistic < 1000) {
      recommendations.push('💰 Consider strategies to increase revenue potential');
    }
  }

  // Competition analysis
  if (project.competition_level && project.competition_level.toLowerCase().includes('high')) {
    recommendations.push('🎯 Develop unique differentiators to stand out in competitive market');
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}