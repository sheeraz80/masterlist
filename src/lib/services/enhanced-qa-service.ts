import { prisma } from '@/lib/prisma';
import { RepositoryService } from './repository-service';
import { GitHubClient } from '@/lib/github/github-client';
import type { 
  Repository, 
  CodeAnalysis, 
  AnalysisType,
  RepositoryWithDetails 
} from '@/types/repository';

// Enhanced QA metrics that include repository data
export interface EnhancedQAMetrics {
  projectId: string;
  repositoryId?: string;
  
  // Basic project metrics (existing)
  qualityScore: number;
  technicalComplexity: number;
  
  // Repository-based metrics (new)
  codeQuality?: number;
  testCoverage?: number;
  maintainabilityIndex?: number;
  technicalDebt?: number;
  securityScore?: number;
  
  // Git metrics
  commitFrequency?: number;
  contributorCount?: number;
  branchCount?: number;
  
  // Advanced analysis
  duplicateCodePercentage?: number;
  codeSmellCount?: number;
  vulnerabilityCount?: number;
  
  // Trend data
  qualityTrend: 'improving' | 'declining' | 'stable';
  lastAnalyzed?: Date;
}

export interface QAAnalysisResult {
  overallScore: number;
  categories: {
    codeQuality: number;
    testCoverage: number;
    security: number;
    maintainability: number;
    performance: number;
  };
  issues: QAIssue[];
  recommendations: QARecommendation[];
  trends: QATrend[];
}

export interface QAIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'maintainability' | 'testing' | 'style';
  title: string;
  description: string;
  file?: string;
  line?: number;
  solution?: string;
  impact: string;
}

export interface QARecommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface QATrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
  period: string;
}

export class EnhancedQAService {
  private repositoryService: RepositoryService;
  private githubClient: GitHubClient | null = null;

  constructor() {
    this.repositoryService = new RepositoryService();
    
    // Only initialize GitHub client if credentials are available
    if (process.env.GITHUB_ACCESS_TOKEN && process.env.GITHUB_ORG_NAME) {
      this.githubClient = new GitHubClient(
        process.env.GITHUB_ACCESS_TOKEN,
        process.env.GITHUB_ORG_NAME
      );
    }
  }

  // Enhanced project analysis that includes repository data
  async analyzeProject(projectId: string): Promise<QAAnalysisResult> {
    try {
      // Get project and repository data
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      let repository = null;
      try {
        repository = await this.repositoryService.getRepositoryByProject(projectId);
      } catch (error) {
        console.warn(`Could not get repository for project ${projectId}:`, error.message);
      }

      if (!project) {
        throw new Error('Project not found');
      }

      // Base analysis from project data
      const baseAnalysis = await this.analyzeProjectData(project);

      // Enhanced analysis from repository if available
      let repositoryAnalysis = null;
      if (repository) {
        repositoryAnalysis = await this.analyzeRepositoryCode(repository);
      }

      // Combine analyses
      return this.combineAnalyses(baseAnalysis, repositoryAnalysis);
    } catch (error) {
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  }

  // Analyze project based on existing data (non-repository)
  private async analyzeProjectData(project: any): Promise<Partial<QAAnalysisResult>> {
    const issues: QAIssue[] = [];
    const recommendations: QARecommendation[] = [];
    
    // Quality score analysis
    if (project.qualityScore < 6) {
      issues.push({
        severity: 'high',
        category: 'maintainability',
        title: 'Low Quality Score',
        description: `Project quality score is ${project.qualityScore}/10, below recommended threshold`,
        impact: 'May indicate fundamental issues with project design or implementation',
        solution: 'Review and enhance project problem definition, solution clarity, and feature set'
      });
    }

    // Technical complexity analysis
    if (project.technicalComplexity > 8) {
      issues.push({
        severity: 'medium',
        category: 'maintainability',
        title: 'High Technical Complexity',
        description: `Technical complexity score is ${project.technicalComplexity}/10`,
        impact: 'High complexity may lead to maintenance challenges and increased development time',
        solution: 'Consider breaking down into smaller modules or simplifying architecture'
      });
    }

    // Feature analysis
    const features = JSON.parse(project.keyFeatures || '[]');
    if (features.length < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'product',
        title: 'Expand Feature Set',
        description: 'Project has limited features which may impact market competitiveness',
        effort: 'medium',
        impact: 'medium',
        actionItems: [
          'Research competitor features',
          'Survey target users for feature requests',
          'Prioritize high-impact features'
        ]
      });
    }

    return {
      overallScore: project.qualityScore * 10,
      categories: {
        codeQuality: 0, // Will be filled by repository analysis
        testCoverage: 0,
        security: 0,
        maintainability: Math.max(0, 100 - (project.technicalComplexity * 10)),
        performance: 75 // Default assumption
      },
      issues,
      recommendations
    };
  }

  // Analyze repository code quality
  private async analyzeRepositoryCode(repository: Repository): Promise<Partial<QAAnalysisResult>> {
    try {
      // Get latest code analysis
      const latestAnalysis = await prisma.codeAnalysis.findFirst({
        where: { repositoryId: repository.id },
        orderBy: { analyzedAt: 'desc' }
      });

      if (!latestAnalysis) {
        // Run new analysis if none exists
        await this.repositoryService.analyzeRepository(repository.id);
        return this.analyzeRepositoryCode(repository); // Recursive call with new analysis
      }

      const issues: QAIssue[] = [];
      const recommendations: QARecommendation[] = [];

      // Code quality analysis
      if (latestAnalysis.codeQuality && latestAnalysis.codeQuality < 7) {
        issues.push({
          severity: latestAnalysis.codeQuality < 5 ? 'critical' : 'high',
          category: 'maintainability',
          title: 'Low Code Quality',
          description: `Code quality score is ${latestAnalysis.codeQuality}/10`,
          impact: 'Poor code quality increases technical debt and maintenance costs',
          solution: 'Implement code quality standards, add linting rules, and conduct code reviews'
        });
      }

      // Test coverage analysis
      if (latestAnalysis.testCoverage && latestAnalysis.testCoverage < 80) {
        issues.push({
          severity: latestAnalysis.testCoverage < 50 ? 'high' : 'medium',
          category: 'testing',
          title: 'Insufficient Test Coverage',
          description: `Test coverage is ${latestAnalysis.testCoverage}%, below recommended 80%`,
          impact: 'Low test coverage increases risk of bugs in production',
          solution: 'Add unit tests, integration tests, and establish coverage requirements'
        });
      }

      // Security vulnerabilities
      if (latestAnalysis.vulnerabilities) {
        const vulns = latestAnalysis.vulnerabilities as any;
        if (vulns.length > 0) {
          issues.push({
            severity: 'critical',
            category: 'security',
            title: 'Security Vulnerabilities Found',
            description: `Found ${vulns.length} security vulnerabilities`,
            impact: 'Security vulnerabilities can lead to data breaches and system compromise',
            solution: 'Update dependencies, fix vulnerable code, and implement security scanning'
          });
        }
      }

      // Technical debt analysis
      if (latestAnalysis.technicalDebt && latestAnalysis.technicalDebt > 50) {
        recommendations.push({
          priority: 'high',
          category: 'maintainability',
          title: 'Address Technical Debt',
          description: `Estimated ${latestAnalysis.technicalDebt} hours of technical debt`,
          effort: 'high',
          impact: 'high',
          actionItems: [
            'Prioritize debt by impact and effort',
            'Allocate dedicated time for debt reduction',
            'Implement prevention strategies'
          ]
        });
      }

      return {
        overallScore: this.calculateOverallScore(latestAnalysis),
        categories: {
          codeQuality: (latestAnalysis.codeQuality || 5) * 10,
          testCoverage: latestAnalysis.testCoverage || 0,
          security: this.calculateSecurityScore(latestAnalysis),
          maintainability: (latestAnalysis.maintainabilityIndex || 5) * 10,
          performance: 75 // Placeholder, would need performance analysis
        },
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing repository code:', error);
      return {
        overallScore: 50,
        categories: {
          codeQuality: 50,
          testCoverage: 0,
          security: 50,
          maintainability: 50,
          performance: 50
        },
        issues: [{
          severity: 'medium',
          category: 'maintainability',
          title: 'Repository Analysis Error',
          description: 'Unable to analyze repository code',
          impact: 'Cannot determine code quality metrics',
          solution: 'Check repository access and re-run analysis'
        }],
        recommendations: []
      };
    }
  }

  // Combine project and repository analyses
  private combineAnalyses(
    baseAnalysis: Partial<QAAnalysisResult>,
    repositoryAnalysis: Partial<QAAnalysisResult> | null
  ): QAAnalysisResult {
    if (!repositoryAnalysis) {
      return {
        overallScore: baseAnalysis.overallScore || 50,
        categories: baseAnalysis.categories || {
          codeQuality: 0,
          testCoverage: 0,
          security: 50,
          maintainability: 50,
          performance: 50
        },
        issues: baseAnalysis.issues || [],
        recommendations: [...(baseAnalysis.recommendations || []), {
          priority: 'high' as const,
          category: 'development',
          title: 'Link Repository for Enhanced Analysis',
          description: 'Connect a GitHub repository to enable detailed code quality analysis',
          effort: 'low' as const,
          impact: 'high' as const,
          actionItems: [
            'Link existing repository or create new one',
            'Enable automated code analysis',
            'Set up quality gates and monitoring'
          ]
        }],
        trends: []
      };
    }

    // Calculate weighted overall score
    const projectWeight = 0.3;
    const repositoryWeight = 0.7;
    const overallScore = Math.round(
      (baseAnalysis.overallScore || 0) * projectWeight +
      (repositoryAnalysis.overallScore || 0) * repositoryWeight
    );

    return {
      overallScore,
      categories: {
        codeQuality: repositoryAnalysis.categories?.codeQuality || 0,
        testCoverage: repositoryAnalysis.categories?.testCoverage || 0,
        security: repositoryAnalysis.categories?.security || 50,
        maintainability: Math.round(
          ((baseAnalysis.categories?.maintainability || 0) * projectWeight) +
          ((repositoryAnalysis.categories?.maintainability || 0) * repositoryWeight)
        ),
        performance: repositoryAnalysis.categories?.performance || 50
      },
      issues: [
        ...(baseAnalysis.issues || []),
        ...(repositoryAnalysis.issues || [])
      ],
      recommendations: [
        ...(baseAnalysis.recommendations || []),
        ...(repositoryAnalysis.recommendations || [])
      ],
      trends: repositoryAnalysis.trends || []
    };
  }

  // Get enhanced metrics for multiple projects
  async getEnhancedMetrics(projectIds: string[]): Promise<EnhancedQAMetrics[]> {
    const metrics: EnhancedQAMetrics[] = [];

    for (const projectId of projectIds) {
      try {
        const analysis = await this.analyzeProject(projectId);
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        
        let repository = null;
        try {
          repository = await this.repositoryService.getRepositoryByProject(projectId);
        } catch (error) {
          // Repository may not exist for this project - this is normal
          console.warn(`No repository found for project ${projectId}:`, error.message);
        }

        if (project) {
          metrics.push({
            projectId,
            repositoryId: repository?.id,
            qualityScore: project.qualityScore,
            technicalComplexity: project.technicalComplexity,
            codeQuality: analysis.categories.codeQuality / 10,
            testCoverage: analysis.categories.testCoverage,
            maintainabilityIndex: analysis.categories.maintainability / 10,
            securityScore: analysis.categories.security / 10,
            qualityTrend: this.determineQualityTrend(analysis),
            lastAnalyzed: new Date()
          });
        }
      } catch (error) {
        console.error(`Error getting metrics for project ${projectId}:`, error);
      }
    }

    return metrics;
  }

  // Helper methods
  private calculateOverallScore(analysis: CodeAnalysis): number {
    const weights = {
      codeQuality: 0.3,
      testCoverage: 0.25,
      maintainability: 0.25,
      security: 0.2
    };

    const scores = {
      codeQuality: (analysis.codeQuality || 5) * 10,
      testCoverage: analysis.testCoverage || 0,
      maintainability: (analysis.maintainabilityIndex || 5) * 10,
      security: this.calculateSecurityScore(analysis)
    };

    return Math.round(
      scores.codeQuality * weights.codeQuality +
      scores.testCoverage * weights.testCoverage +
      scores.maintainability * weights.maintainability +
      scores.security * weights.security
    );
  }

  private calculateSecurityScore(analysis: CodeAnalysis): number {
    // Calculate security score based on vulnerabilities
    const vulns = analysis.vulnerabilities as any;
    if (!vulns || vulns.length === 0) return 90;

    // Reduce score based on vulnerability count and severity
    const severityWeights = { critical: 20, high: 10, medium: 5, low: 2 };
    const deduction = vulns.reduce((total: number, vuln: any) => {
      return total + (severityWeights[vuln.severity] || 2);
    }, 0);

    return Math.max(0, 90 - deduction);
  }

  private determineQualityTrend(analysis: QAAnalysisResult): 'improving' | 'declining' | 'stable' {
    // Simplified trend analysis - in real implementation, would compare with historical data
    if (analysis.overallScore >= 80) return 'improving';
    if (analysis.overallScore < 60) return 'declining';
    return 'stable';
  }
}