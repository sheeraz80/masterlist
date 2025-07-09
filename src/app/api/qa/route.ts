import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Build where clause for filtering
    const where: any = {};
    if (category && category !== 'all') {
      where.category = category;
    }

    // Fetch projects from database
    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            comments: true,
            activities: true
          }
        }
      }
    });

    // Transform projects to match expected format
    const transformedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      problem: project.problem,
      solution: project.solution,
      category: project.category,
      target_users: project.targetUsers,
      revenue_model: project.revenueModel,
      revenue_potential: JSON.parse(project.revenuePotential || '{}'),
      development_time: project.developmentTime,
      competition_level: project.competitionLevel,
      technical_complexity: project.technicalComplexity,
      quality_score: project.qualityScore,
      key_features: JSON.parse(project.keyFeatures || '[]'),
      tags: JSON.parse(project.tags || '[]'),
      status: project.status,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      comments_count: project._count.comments,
      activities_count: project._count.activities
    }));

    const qaReport = generateQAReport(transformedProjects, includeDetails);

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
  const issuesByType: Record<string, number> = {
    missing_field: 0,
    invalid_data: 0,
    inconsistency: 0,
    quality_concern: 0
  };
  const categoryAnalysis: Record<string, any> = {};
  const fieldCompleteness: Record<string, any> = {};

  // Analyze each project
  projects.forEach(project => {
    const issues: QualityIssue[] = [];
    const validations: ValidationResult[] = [];
    
    // Check for missing or incomplete fields
    const requiredFields = ['title', 'problem', 'solution', 'category', 'target_users', 
                           'revenue_model', 'revenue_potential', 'development_time', 
                           'competition_level', 'technical_complexity', 'quality_score'];
    
    requiredFields.forEach(field => {
      if (!project[field] || (typeof project[field] === 'string' && project[field].trim() === '')) {
        issues.push({
          type: 'missing_field',
          field,
          severity: ['title', 'problem', 'solution'].includes(field) ? 'high' : 'medium',
          message: `${field.replace(/_/g, ' ')} is missing or empty`,
          suggestion: `Please provide a ${field.replace(/_/g, ' ')} for this project`
        });
      }
      
      // Track field completeness
      if (!fieldCompleteness[field]) {
        fieldCompleteness[field] = { filled_count: 0, missing_count: 0, percentage: 0 };
      }
      if (project[field] && (typeof project[field] !== 'string' || project[field].trim() !== '')) {
        fieldCompleteness[field].filled_count++;
      } else {
        fieldCompleteness[field].missing_count++;
      }
    });

    // Validate data quality
    if (project.quality_score !== undefined) {
      if (project.quality_score < 0 || project.quality_score > 10) {
        issues.push({
          type: 'invalid_data',
          field: 'quality_score',
          severity: 'high',
          message: `Quality score ${project.quality_score} is out of valid range (0-10)`,
          suggestion: 'Quality score should be between 0 and 10'
        });
      }
      
      if (project.quality_score < 5) {
        issues.push({
          type: 'quality_concern',
          field: 'quality_score',
          severity: 'medium',
          message: `Low quality score (${project.quality_score})`,
          suggestion: 'Consider improving project definition or features to increase quality'
        });
      }

      validations.push({
        check: 'Quality Score Range',
        status: project.quality_score >= 0 && project.quality_score <= 10 ? 'pass' : 'fail',
        message: `Quality score is ${project.quality_score}`
      });
    }

    // Check technical complexity
    if (project.technical_complexity !== undefined) {
      if (project.technical_complexity < 0 || project.technical_complexity > 10) {
        issues.push({
          type: 'invalid_data',
          field: 'technical_complexity',
          severity: 'medium',
          message: `Technical complexity ${project.technical_complexity} is out of valid range (0-10)`,
          suggestion: 'Technical complexity should be between 0 and 10'
        });
      }
    }

    // Check revenue potential
    if (project.revenue_potential) {
      const revenue = project.revenue_potential;
      if (revenue.conservative > revenue.realistic || revenue.realistic > revenue.optimistic) {
        issues.push({
          type: 'inconsistency',
          field: 'revenue_potential',
          severity: 'medium',
          message: 'Revenue potential values are inconsistent',
          suggestion: 'Conservative < Realistic < Optimistic revenue estimates'
        });
      }
    }

    // Check key features
    if (!project.key_features || !Array.isArray(project.key_features) || project.key_features.length === 0) {
      issues.push({
        type: 'missing_field',
        field: 'key_features',
        severity: 'medium',
        message: 'No key features defined',
        suggestion: 'Add at least 3-5 key features for the project'
      });
    }

    // Count issues
    issues.forEach(issue => {
      totalIssues++;
      issuesBySeverity[issue.severity]++;
      issuesByType[issue.type]++;
    });

    // Calculate completeness score
    const filledFields = requiredFields.filter(field => 
      project[field] && (typeof project[field] !== 'string' || project[field].trim() !== '')
    ).length;
    const completenessScore = (filledFields / requiredFields.length) * 100;

    const metrics: QualityMetrics = {
      project_id: project.id,
      title: project.title || 'Untitled Project',
      category: project.category || 'Uncategorized',
      quality_issues: issues,
      quality_score: project.quality_score || 0,
      completeness_score: completenessScore,
      validation_results: validations,
      recommendations: generateRecommendations(project, issues)
    };

    projectMetrics.push(metrics);

    // Update category analysis
    const cat = project.category || 'Uncategorized';
    if (!categoryAnalysis[cat]) {
      categoryAnalysis[cat] = {
        total_quality: 0,
        project_count: 0,
        issues: []
      };
    }
    categoryAnalysis[cat].total_quality += project.quality_score || 0;
    categoryAnalysis[cat].project_count++;
    categoryAnalysis[cat].issues.push(...issues.map(i => i.message));
  });

  // Calculate field completeness percentages
  Object.keys(fieldCompleteness).forEach(field => {
    const total = fieldCompleteness[field].filled_count + fieldCompleteness[field].missing_count;
    fieldCompleteness[field].percentage = total > 0 
      ? Math.round((fieldCompleteness[field].filled_count / total) * 100)
      : 0;
  });

  // Process category analysis
  const categoryQualityAnalysis: Record<string, any> = {};
  Object.keys(categoryAnalysis).forEach(cat => {
    const analysis = categoryAnalysis[cat];
    const commonIssues = [...new Set(analysis.issues)].slice(0, 5);
    categoryQualityAnalysis[cat] = {
      average_quality: analysis.project_count > 0 
        ? Math.round((analysis.total_quality / analysis.project_count) * 10) / 10
        : 0,
      common_issues: commonIssues,
      project_count: analysis.project_count
    };
  });

  // Sort projects by quality
  const sortedByQuality = [...projectMetrics].sort((a, b) => b.quality_score - a.quality_score);
  const projectsWithIssues = projectMetrics.filter(p => p.quality_issues.length > 0);

  // Get top issues
  const allIssues = projectMetrics.flatMap(p => p.quality_issues);
  const topIssues = allIssues
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 10);

  return {
    summary: {
      total_projects: projects.length,
      projects_with_issues: projectsWithIssues.length,
      average_quality_score: projects.length > 0
        ? Math.round((projects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / projects.length) * 10) / 10
        : 0,
      average_completeness: projectMetrics.length > 0
        ? Math.round((projectMetrics.reduce((sum, p) => sum + p.completeness_score, 0) / projectMetrics.length))
        : 0,
      total_issues: totalIssues,
      issues_by_severity: issuesBySeverity,
      issues_by_type: issuesByType
    },
    top_issues: topIssues,
    projects_needing_attention: projectsWithIssues
      .filter(p => p.quality_issues.some(i => i.severity === 'high' || i.severity === 'critical'))
      .slice(0, includeDetails ? 20 : 5),
    best_quality_projects: sortedByQuality
      .filter(p => p.quality_score >= 7 && p.quality_issues.length === 0)
      .slice(0, includeDetails ? 10 : 3),
    category_quality_analysis: categoryQualityAnalysis,
    field_completeness: fieldCompleteness
  };
}

function generateRecommendations(project: any, issues: QualityIssue[]): string[] {
  const recommendations: string[] = [];

  // High-level recommendations based on issues
  if (issues.some(i => i.type === 'missing_field' && i.severity === 'high')) {
    recommendations.push('Complete all required fields to improve project documentation');
  }

  if (project.quality_score < 6) {
    recommendations.push('Consider refining the problem statement and solution to improve quality score');
  }

  if (!project.key_features || project.key_features.length < 3) {
    recommendations.push('Add more key features to better showcase the project value proposition');
  }

  if (project.technical_complexity > 8) {
    recommendations.push('High technical complexity - consider breaking down into smaller phases');
  }

  if (!project.tags || project.tags.length === 0) {
    recommendations.push('Add relevant tags to improve project discoverability');
  }

  return recommendations;
}