import { prisma } from '@/lib/prisma';
import { RepositoryService } from './repository-service';
import { analyticsOptimizer } from '@/lib/performance/analytics-optimizer';
import type { RepositoryStatsResponse } from '@/types/repository';

export interface EnhancedAnalyticsData {
  // Project metrics (existing)
  totalProjects: number;
  activeProjects: number;
  averageQualityScore: number;
  categoryDistribution: Record<string, number>;
  
  // Repository metrics (new)
  repositoryStats: RepositoryStatsResponse;
  repositoryLinkageRate: number;
  codebaseMetrics: {
    totalLinesOfCode: number;
    averageComplexity: number;
    averageTestCoverage: number;
    totalVulnerabilities: number;
    languageDistribution: Record<string, number>;
    frameworkDistribution: Record<string, number>;
  };
  
  // Development metrics
  developmentActivity: {
    totalCommits: number;
    activeRepositories: number;
    averageCommitsPerDay: number;
    contributorCount: number;
  };
  
  // Quality trends
  qualityTrends: {
    qualityScoreProgression: Array<{ date: string; score: number }>;
    codeQualityProgression: Array<{ date: string; quality: number }>;
    testCoverageProgression: Array<{ date: string; coverage: number }>;
    vulnerabilityTrends: Array<{ date: string; count: number }>;
  };
  
  // Health indicators
  healthIndicators: {
    overallHealthScore: number;
    repositoryHealthDistribution: Record<string, number>;
    criticalIssuesCount: number;
    improvingProjectsCount: number;
    decliningProjectsCount: number;
  };
}

export interface ProjectAnalyticsInsight {
  type: 'opportunity' | 'risk' | 'achievement' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metrics: Record<string, number>;
  actionItems: string[];
  impact: string;
}

export class EnhancedAnalyticsService {
  private repositoryService: RepositoryService;

  constructor() {
    this.repositoryService = new RepositoryService();
  }

  async getEnhancedAnalytics(options: {
    useCache?: boolean;
    forceRefresh?: boolean;
    includeDetailedMetrics?: boolean;
  } = {}): Promise<EnhancedAnalyticsData> {
    try {
      // Use performance optimizer for optimized analytics generation
      const optimizedAnalytics = await analyticsOptimizer.getOptimizedProjectAnalytics({
        ...options,
        timeRange: '30d',
        includeDetailedMetrics: options.includeDetailedMetrics || false
      });

      // Fetch additional data in parallel
      const [
        repositoryStats,
        codeAnalyses,
        repositories
      ] = await Promise.all([
        this.getRepositoryStats(),
        this.getCodeAnalysisData(),
        this.getRepositoryData()
      ]);

      // Calculate repository linkage rate
      const repositoryLinkageRate = optimizedAnalytics.projectStats.totalProjects > 0 
        ? (repositories.length / optimizedAnalytics.projectStats.totalProjects) * 100 
        : 0;

      // Calculate codebase metrics
      const codebaseMetrics = this.calculateCodebaseMetrics(codeAnalyses, repositories);

      // Calculate development activity
      const developmentActivity = this.calculateDevelopmentActivity(repositories);

      // Generate quality trends (use cached data if available)
      const qualityTrends = optimizedAnalytics.qualityMetrics || await this.generateQualityTrends();

      // Calculate health indicators
      const healthIndicators = this.calculateHealthIndicators(repositories, codeAnalyses);

      return {
        totalProjects: optimizedAnalytics.projectStats.totalProjects,
        activeProjects: optimizedAnalytics.projectStats.activeProjects || 0,
        averageQualityScore: optimizedAnalytics.projectStats.avgQualityScore,
        categoryDistribution: optimizedAnalytics.categoryStats.reduce((acc, cat) => {
          acc[cat.category] = cat.projectCount;
          return acc;
        }, {} as Record<string, number>),
        repositoryStats,
        repositoryLinkageRate,
        codebaseMetrics,
        developmentActivity,
        qualityTrends,
        healthIndicators
      };
    } catch (error) {
      throw new Error(`Failed to get enhanced analytics: ${error.message}`);
    }
  }

  async generateInsights(): Promise<ProjectAnalyticsInsight[]> {
    const analytics = await this.getEnhancedAnalytics();
    const insights: ProjectAnalyticsInsight[] = [];

    // Repository linkage insight
    if (analytics.repositoryLinkageRate < 50) {
      insights.push({
        type: 'opportunity',
        priority: 'high',
        title: 'Low Repository Linkage Rate',
        description: `Only ${analytics.repositoryLinkageRate.toFixed(1)}% of projects have linked repositories`,
        metrics: {
          'Linked Projects': analytics.repositoryStats.activeRepositories,
          'Total Projects': analytics.totalProjects,
          'Linkage Rate': analytics.repositoryLinkageRate
        },
        actionItems: [
          'Link existing repositories to projects',
          'Create repositories for new projects',
          'Automate repository creation process'
        ],
        impact: 'Linking repositories enables detailed code analysis and quality monitoring'
      });
    }

    // Code quality insight
    if (analytics.codebaseMetrics.averageComplexity > 7) {
      insights.push({
        type: 'risk',
        priority: 'medium',
        title: 'High Code Complexity',
        description: `Average code complexity is ${analytics.codebaseMetrics.averageComplexity.toFixed(1)}/10`,
        metrics: {
          'Average Complexity': analytics.codebaseMetrics.averageComplexity,
          'Recommended Maximum': 7
        },
        actionItems: [
          'Implement code complexity monitoring',
          'Refactor high-complexity modules',
          'Establish complexity guidelines'
        ],
        impact: 'High complexity increases maintenance costs and bug likelihood'
      });
    }

    // Test coverage insight
    if (analytics.codebaseMetrics.averageTestCoverage < 70) {
      insights.push({
        type: 'risk',
        priority: 'high',
        title: 'Low Test Coverage',
        description: `Average test coverage is ${analytics.codebaseMetrics.averageTestCoverage.toFixed(1)}%`,
        metrics: {
          'Average Coverage': analytics.codebaseMetrics.averageTestCoverage,
          'Recommended Minimum': 80
        },
        actionItems: [
          'Implement comprehensive testing strategy',
          'Add unit and integration tests',
          'Set up coverage monitoring'
        ],
        impact: 'Low test coverage increases risk of production bugs'
      });
    }

    // Security insight
    if (analytics.codebaseMetrics.totalVulnerabilities > 0) {
      insights.push({
        type: 'risk',
        priority: 'high',
        title: 'Security Vulnerabilities Detected',
        description: `Found ${analytics.codebaseMetrics.totalVulnerabilities} security vulnerabilities`,
        metrics: {
          'Total Vulnerabilities': analytics.codebaseMetrics.totalVulnerabilities,
          'Affected Repositories': analytics.repositoryStats.activeRepositories
        },
        actionItems: [
          'Audit and fix security vulnerabilities',
          'Update vulnerable dependencies',
          'Implement automated security scanning'
        ],
        impact: 'Security vulnerabilities can lead to data breaches and system compromise'
      });
    }

    // Development activity insight
    if (analytics.developmentActivity.averageCommitsPerDay < 1) {
      insights.push({
        type: 'opportunity',
        priority: 'medium',
        title: 'Low Development Activity',
        description: `Average ${analytics.developmentActivity.averageCommitsPerDay.toFixed(1)} commits per day`,
        metrics: {
          'Daily Commits': analytics.developmentActivity.averageCommitsPerDay,
          'Active Repositories': analytics.developmentActivity.activeRepositories
        },
        actionItems: [
          'Encourage more frequent commits',
          'Implement feature branch workflows',
          'Set up automated deployment pipelines'
        ],
        impact: 'More frequent commits enable better tracking and faster iterations'
      });
    }

    // Health score insight
    if (analytics.healthIndicators.overallHealthScore > 85) {
      insights.push({
        type: 'achievement',
        priority: 'low',
        title: 'Excellent Overall Health Score',
        description: `Overall health score is ${analytics.healthIndicators.overallHealthScore.toFixed(1)}/100`,
        metrics: {
          'Health Score': analytics.healthIndicators.overallHealthScore,
          'Improving Projects': analytics.healthIndicators.improvingProjectsCount
        },
        actionItems: [
          'Maintain current quality standards',
          'Share best practices across teams',
          'Continue monitoring and improvement'
        ],
        impact: 'High health scores indicate well-maintained, sustainable projects'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods
  private async getProjectStats() {
    const [
      totalProjects,
      activeProjects,
      averageQuality,
      categoryDistribution
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'active' } }),
      prisma.project.aggregate({ _avg: { qualityScore: true } }),
      prisma.project.groupBy({
        by: ['category'],
        _count: { _all: true }
      })
    ]);

    return {
      totalProjects,
      activeProjects,
      averageQualityScore: averageQuality._avg.qualityScore || 0,
      categoryDistribution: categoryDistribution.reduce((acc, item) => {
        acc[item.category] = item._count._all;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private async getRepositoryStats(): Promise<RepositoryStatsResponse> {
    try {
      // Use the repository service to get comprehensive stats
      const response = await fetch('/api/repositories/stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch repository stats: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch repository stats, using fallback:', error);
      // Return fallback stats if API call fails
      return {
        totalRepositories: 0,
        activeRepositories: 0,
        needsSetup: 0,
        healthyRepositories: 0,
        averageHealthScore: 0,
        languageDistribution: {},
        frameworkDistribution: {},
        categoryDistribution: {}
      };
    }
  }

  private async getCodeAnalysisData() {
    return await prisma.codeAnalysis.findMany({
      orderBy: { analyzedAt: 'desc' },
      take: 1000 // Get recent analyses
    });
  }

  private async getRepositoryData() {
    return await prisma.repository.findMany({
      include: {
        project: {
          select: { id: true, category: true }
        },
        codeAnalyses: {
          orderBy: { analyzedAt: 'desc' },
          take: 1
        }
      }
    });
  }

  private calculateCodebaseMetrics(codeAnalyses: any[], repositories: any[]) {
    const validAnalyses = codeAnalyses.filter(a => a.linesOfCode);
    
    return {
      totalLinesOfCode: validAnalyses.reduce((sum, a) => sum + (a.linesOfCode || 0), 0),
      averageComplexity: validAnalyses.reduce((sum, a) => sum + (a.complexity || 0), 0) / (validAnalyses.length || 1),
      averageTestCoverage: validAnalyses.reduce((sum, a) => sum + (a.testCoverage || 0), 0) / (validAnalyses.length || 1),
      totalVulnerabilities: codeAnalyses.reduce((sum, a) => {
        const vulns = a.vulnerabilities as any;
        return sum + (Array.isArray(vulns) ? vulns.length : 0);
      }, 0),
      languageDistribution: repositories.reduce((acc, repo) => {
        if (repo.language) {
          acc[repo.language] = (acc[repo.language] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      frameworkDistribution: repositories.reduce((acc, repo) => {
        if (repo.framework) {
          acc[repo.framework] = (acc[repo.framework] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private calculateDevelopmentActivity(repositories: any[]) {
    const activeRepos = repositories.filter(r => r.status === 'ACTIVE');
    const totalCommits = repositories.reduce((sum, r) => sum + (r.commitCount || 0), 0);
    const averageCommitsPerDay = totalCommits / Math.max(activeRepos.length * 30, 1); // Rough estimate

    return {
      totalCommits,
      activeRepositories: activeRepos.length,
      averageCommitsPerDay,
      contributorCount: repositories.length // Simplified - would need actual contributor data
    };
  }

  private async generateQualityTrends() {
    // Simplified trend generation - in real implementation would use historical data
    const now = new Date();
    const days = 30;
    
    const qualityScoreProgression = Array.from({ length: days }, (_, i) => ({
      date: new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: 7.5 + Math.random() * 1.5 // Simulated trend
    }));

    const codeQualityProgression = Array.from({ length: days }, (_, i) => ({
      date: new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quality: 75 + Math.random() * 15 // Simulated trend
    }));

    const testCoverageProgression = Array.from({ length: days }, (_, i) => ({
      date: new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      coverage: 65 + Math.random() * 20 // Simulated trend
    }));

    const vulnerabilityTrends = Array.from({ length: days }, (_, i) => ({
      date: new Date(now.getTime() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5) // Simulated trend
    }));

    return {
      qualityScoreProgression,
      codeQualityProgression,
      testCoverageProgression,
      vulnerabilityTrends
    };
  }

  private calculateHealthIndicators(repositories: any[], codeAnalyses: any[]) {
    const healthScores = repositories
      .filter(r => r.healthScore)
      .map(r => r.healthScore);
    
    const overallHealthScore = healthScores.reduce((sum, score) => sum + score, 0) / (healthScores.length || 1);
    
    const repositoryHealthDistribution = repositories.reduce((acc, repo) => {
      const status = repo.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const criticalIssues = codeAnalyses.reduce((count, analysis) => {
      const vulns = analysis.vulnerabilities as any;
      return count + (Array.isArray(vulns) ? vulns.filter((v: any) => v.severity === 'critical').length : 0);
    }, 0);

    return {
      overallHealthScore,
      repositoryHealthDistribution,
      criticalIssuesCount: criticalIssues,
      improvingProjectsCount: Math.floor(repositories.length * 0.6), // Simulated
      decliningProjectsCount: Math.floor(repositories.length * 0.1)   // Simulated
    };
  }
}