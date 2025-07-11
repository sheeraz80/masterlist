/**
 * Enhanced CoreVecta Scoring System
 * Updated with Gold Standard compliance criteria
 */

import { prisma } from '@/lib/prisma';

export interface EnhancedQualityMetrics {
  // Basic Quality Metrics
  overallScore: number;
  
  // Core Categories (0-100 each)
  codeQuality: number;
  testCoverage: number;
  security: number;
  maintainability: number;
  performance: number;
  
  // Enhanced Categories (0-100 each)
  documentation: number;
  accessibility: number;
  internationalization: number;
  businessViability: number;
  technicalComplexity: number;
  
  // Gold Standard Criteria (0-100 each)
  crossBrowserCompatibility: number;
  advancedTesting: number;
  analyticsMonitoring: number;
  cicdPipeline: number;
  advancedSecurity: number;
  monetizationReadiness: number;
  storeOptimization: number;
  
  // Certification Level
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Metadata
  lastUpdated: Date;
  scoringVersion: string;
}

export interface ProjectAnalysis {
  projectId: string;
  metrics: EnhancedQualityMetrics;
  recommendations: QualityRecommendation[];
  issues: QualityIssue[];
  improvementPlan: ImprovementPlan;
}

export interface QualityRecommendation {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number; // 1-10 scale
  effort: number; // 1-10 scale
  actionItems: string[];
  estimatedHours: number;
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  solution: string;
  impactOnScore: number;
}

export interface ImprovementPlan {
  currentLevel: string;
  targetLevel: string;
  estimatedTimeToTarget: string;
  priorityActions: string[];
  quickWins: string[];
  longTermGoals: string[];
}

export class EnhancedCoreVectaScoring {
  private static readonly SCORING_VERSION = '2.0.0';
  private static readonly WEIGHTS = {
    // Core categories (60% total)
    codeQuality: 0.15,
    testCoverage: 0.10,
    security: 0.15,
    maintainability: 0.10,
    performance: 0.10,
    
    // Enhanced categories (25% total)
    documentation: 0.05,
    accessibility: 0.05,
    internationalization: 0.03,
    businessViability: 0.07,
    technicalComplexity: 0.05,
    
    // Gold Standard criteria (15% total)
    crossBrowserCompatibility: 0.02,
    advancedTesting: 0.03,
    analyticsMonitoring: 0.02,
    cicdPipeline: 0.02,
    advancedSecurity: 0.03,
    monetizationReadiness: 0.02,
    storeOptimization: 0.01
  };

  /**
   * Analyze project and calculate enhanced quality metrics
   */
  static async analyzeProject(projectId: string): Promise<ProjectAnalysis> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        repository: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const metrics = await this.calculateEnhancedMetrics(project);
    const recommendations = this.generateRecommendations(project, metrics);
    const issues = this.identifyIssues(project, metrics);
    const improvementPlan = this.createImprovementPlan(metrics, recommendations);

    return {
      projectId,
      metrics,
      recommendations,
      issues,
      improvementPlan
    };
  }

  /**
   * Calculate enhanced quality metrics for a project
   */
  private static async calculateEnhancedMetrics(project: any): Promise<EnhancedQualityMetrics> {
    // Core Quality Metrics
    const codeQuality = this.calculateCodeQuality(project);
    const testCoverage = this.calculateTestCoverage(project);
    const security = this.calculateSecurity(project);
    const maintainability = this.calculateMaintainability(project);
    const performance = this.calculatePerformance(project);
    
    // Enhanced Metrics
    const documentation = this.calculateDocumentation(project);
    const accessibility = this.calculateAccessibility(project);
    const internationalization = this.calculateInternationalization(project);
    const businessViability = this.calculateBusinessViability(project);
    const technicalComplexity = this.calculateTechnicalComplexity(project);
    
    // Gold Standard Criteria
    const crossBrowserCompatibility = this.calculateCrossBrowserCompatibility(project);
    const advancedTesting = this.calculateAdvancedTesting(project);
    const analyticsMonitoring = this.calculateAnalyticsMonitoring(project);
    const cicdPipeline = this.calculateCICDPipeline(project);
    const advancedSecurity = this.calculateAdvancedSecurity(project);
    const monetizationReadiness = this.calculateMonetizationReadiness(project);
    const storeOptimization = this.calculateStoreOptimization(project);
    
    // Calculate overall score
    const overallScore = Math.round(
      codeQuality * this.WEIGHTS.codeQuality +
      testCoverage * this.WEIGHTS.testCoverage +
      security * this.WEIGHTS.security +
      maintainability * this.WEIGHTS.maintainability +
      performance * this.WEIGHTS.performance +
      documentation * this.WEIGHTS.documentation +
      accessibility * this.WEIGHTS.accessibility +
      internationalization * this.WEIGHTS.internationalization +
      businessViability * this.WEIGHTS.businessViability +
      technicalComplexity * this.WEIGHTS.technicalComplexity +
      crossBrowserCompatibility * this.WEIGHTS.crossBrowserCompatibility +
      advancedTesting * this.WEIGHTS.advancedTesting +
      analyticsMonitoring * this.WEIGHTS.analyticsMonitoring +
      cicdPipeline * this.WEIGHTS.cicdPipeline +
      advancedSecurity * this.WEIGHTS.advancedSecurity +
      monetizationReadiness * this.WEIGHTS.monetizationReadiness +
      storeOptimization * this.WEIGHTS.storeOptimization
    );

    return {
      overallScore,
      codeQuality,
      testCoverage,
      security,
      maintainability,
      performance,
      documentation,
      accessibility,
      internationalization,
      businessViability,
      technicalComplexity,
      crossBrowserCompatibility,
      advancedTesting,
      analyticsMonitoring,
      cicdPipeline,
      advancedSecurity,
      monetizationReadiness,
      storeOptimization,
      certificationLevel: this.determineCertificationLevel(overallScore),
      lastUpdated: new Date(),
      scoringVersion: this.SCORING_VERSION
    };
  }

  // Core Quality Calculations
  private static calculateCodeQuality(project: any): number {
    let score = 50; // Base score
    
    // Check for quality indicators - safely parse features
    if (project.keyFeatures) {
      const features = this.safeParseFeatures(project.keyFeatures);
      if (features.length >= 5) score += 15;
    }
    if (project.solution && project.solution.length > 200) score += 10;
    if (project.problem && project.problem.length > 100) score += 10;
    if (project.targetUsers && project.targetUsers.length > 50) score += 10;
    
    // Repository-based scoring
    if (project.repository) {
      score += 5; // Has repository
      // Additional repository metrics would be calculated here
    }
    
    return Math.min(100, score);
  }

  /**
   * Safely parse features from either JSON or comma-separated string
   */
  private static safeParseFeatures(keyFeatures: string | null): string[] {
    if (!keyFeatures) return [];
    
    try {
      // Try JSON parsing first
      if (keyFeatures.startsWith('[') && keyFeatures.endsWith(']')) {
        return JSON.parse(keyFeatures);
      } else if (keyFeatures.startsWith('{')) {
        // Handle object format
        const parsed = JSON.parse(keyFeatures);
        return Array.isArray(parsed) ? parsed : [];
      } else {
        // Treat as comma-separated string
        return keyFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
    } catch {
      // Fallback to comma-separated parsing
      return keyFeatures.split(',').map(f => f.trim()).filter(f => f.length > 0);
    }
  }

  /**
   * Safely parse revenue potential from either JSON or string
   */
  private static safeParseRevenue(revenuePotential: string | null): { realistic: number; conservative: number; optimistic: number } {
    if (!revenuePotential) return { realistic: 0, conservative: 0, optimistic: 0 };
    
    try {
      if (revenuePotential.startsWith('{') && revenuePotential.endsWith('}')) {
        const parsed = JSON.parse(revenuePotential);
        return {
          realistic: parsed.realistic || 0,
          conservative: parsed.conservative || 0,
          optimistic: parsed.optimistic || 0
        };
      } else {
        // Try to extract number from string
        const match = revenuePotential.match(/\d+/);
        const value = match ? parseInt(match[0]) : 0;
        return { realistic: value, conservative: value * 0.6, optimistic: value * 2.5 };
      }
    } catch {
      // Fallback - try to extract any number
      const match = revenuePotential.match(/\d+/);
      const value = match ? parseInt(match[0]) : 0;
      return { realistic: value, conservative: value * 0.6, optimistic: value * 2.5 };
    }
  }

  private static calculateTestCoverage(project: any): number {
    let score = 0;
    
    // Base on complexity and category
    if (project.category === 'Web Apps' || project.category === 'Chrome Extension') {
      score += 40; // Higher expectation for web-based projects
    } else {
      score += 30;
    }
    
    // Repository testing indicators
    if (project.repository) {
      score += 30; // Assume testing setup exists
    }
    
    return Math.min(100, score);
  }

  private static calculateSecurity(project: any): number {
    let score = 60; // Base security score
    
    // Category-based security requirements
    if (project.category === 'Chrome Extension') score += 20;
    if (project.category === 'Smart Contracts') score += 30;
    if (project.category === 'E-commerce') score += 25;
    
    // Monetization adds security requirements
    if (project.revenueModel && project.revenueModel !== 'None') {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private static calculateMaintainability(project: any): number {
    let score = 50;
    
    // Technical complexity inverse relationship
    const complexity = project.technicalComplexity || 5;
    score += (10 - complexity) * 5;
    
    // Documentation improves maintainability
    if (project.solution && project.solution.length > 300) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  private static calculatePerformance(project: any): number {
    let score = 70; // Base performance assumption
    
    // Category-based performance expectations
    if (project.category === 'Gaming') score -= 10;
    if (project.category === 'AI/ML') score -= 15;
    if (project.category === 'IoT') score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  // Enhanced Quality Calculations
  private static calculateDocumentation(project: any): number {
    let score = 30; // Base score
    
    if (project.problem && project.problem.length > 100) score += 20;
    if (project.solution && project.solution.length > 200) score += 20;
    if (project.keyFeatures) {
      const features = this.safeParseFeatures(project.keyFeatures);
      if (features.length >= 3) score += 15;
    }
    if (project.targetUsers && project.targetUsers.length > 50) score += 15;
    
    return Math.min(100, score);
  }

  private static calculateAccessibility(project: any): number {
    let score = 50; // Base score
    
    // Higher expectations for consumer-facing apps
    if (project.category === 'Web Apps') score += 20;
    if (project.category === 'Mobile Apps') score += 15;
    if (project.targetUsers && project.targetUsers.toLowerCase().includes('consumer')) score += 15;
    
    return Math.min(100, score);
  }

  private static calculateInternationalization(project: any): number {
    let score = 30; // Base score
    
    // Global target market indicates i18n need
    if (project.targetUsers && project.targetUsers.toLowerCase().includes('global')) score += 40;
    if (project.revenueModel && project.revenueModel !== 'None') score += 20;
    if (project.category === 'E-commerce') score += 10;
    
    return Math.min(100, score);
  }

  private static calculateBusinessViability(project: any): number {
    let score = 40; // Base score
    
    // Revenue model scoring
    if (project.revenueModel === 'Subscription') score += 30;
    else if (project.revenueModel === 'One-time Purchase') score += 25;
    else if (project.revenueModel === 'Freemium') score += 20;
    else if (project.revenueModel === 'Usage-based') score += 15;
    
    // Revenue potential - safely parse
    if (project.revenuePotential) {
      const revenue = this.safeParseRevenue(project.revenuePotential);
      if (revenue.realistic > 10000) score += 20;
      else if (revenue.realistic > 5000) score += 15;
      else if (revenue.realistic > 1000) score += 10;
    }
    
    return Math.min(100, score);
  }

  private static calculateTechnicalComplexity(project: any): number {
    const complexity = project.technicalComplexity || 5;
    // Inverse scoring - lower complexity is better for this metric
    return Math.max(0, 100 - (complexity * 10));
  }

  // Gold Standard Criteria Calculations
  private static calculateCrossBrowserCompatibility(project: any): number {
    let score = 50; // Base score
    
    if (project.category === 'Chrome Extension') score += 30;
    if (project.category === 'Web Apps') score += 40;
    if (project.category === 'Browser Extension') score += 50;
    
    return Math.min(100, score);
  }

  private static calculateAdvancedTesting(project: any): number {
    let score = 30; // Base score
    
    // Higher complexity projects need more testing
    const complexity = project.technicalComplexity || 5;
    if (complexity >= 7) score += 30;
    else if (complexity >= 5) score += 20;
    else score += 10;
    
    // Critical categories need advanced testing
    if (project.category === 'Smart Contracts') score += 40;
    if (project.category === 'Finance') score += 30;
    if (project.category === 'Healthcare') score += 25;
    
    return Math.min(100, score);
  }

  private static calculateAnalyticsMonitoring(project: any): number {
    let score = 40; // Base score
    
    // Business projects need analytics
    if (project.revenueModel && project.revenueModel !== 'None') score += 30;
    if (project.category === 'E-commerce') score += 20;
    if (project.category === 'SaaS') score += 15;
    
    return Math.min(100, score);
  }

  private static calculateCICDPipeline(project: any): number {
    let score = 30; // Base score
    
    // Repository existence suggests CI/CD capability
    if (project.repository) score += 40;
    
    // Complex projects need CI/CD
    const complexity = project.technicalComplexity || 5;
    if (complexity >= 7) score += 30;
    
    return Math.min(100, score);
  }

  private static calculateAdvancedSecurity(project: any): number {
    let score = 50; // Base score
    
    // Security-critical categories
    if (project.category === 'Smart Contracts') score += 40;
    if (project.category === 'Finance') score += 35;
    if (project.category === 'Healthcare') score += 30;
    if (project.category === 'E-commerce') score += 25;
    
    // Monetization adds security needs
    if (project.revenueModel && project.revenueModel !== 'None') score += 15;
    
    return Math.min(100, score);
  }

  private static calculateMonetizationReadiness(project: any): number {
    let score = 20; // Base score
    
    if (project.revenueModel && project.revenueModel !== 'None') {
      score += 50;
      
      // Specific model bonuses
      if (project.revenueModel === 'Subscription') score += 20;
      else if (project.revenueModel === 'Freemium') score += 15;
      else if (project.revenueModel === 'One-time Purchase') score += 10;
    }
    
    // Revenue potential - safely parse
    if (project.revenuePotential) {
      const revenue = this.safeParseRevenue(project.revenuePotential);
      if (revenue.realistic > 5000) score += 10;
    }
    
    return Math.min(100, score);
  }

  private static calculateStoreOptimization(project: any): number {
    let score = 30; // Base score
    
    // Consumer-facing projects need store optimization
    if (project.category === 'Chrome Extension') score += 40;
    if (project.category === 'Mobile Apps') score += 35;
    if (project.category === 'Desktop Apps') score += 30;
    
    // Revenue model indicates store presence
    if (project.revenueModel && project.revenueModel !== 'None') score += 25;
    
    return Math.min(100, score);
  }

  private static determineCertificationLevel(overallScore: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (overallScore >= 90) return 'platinum';
    if (overallScore >= 80) return 'gold';
    if (overallScore >= 70) return 'silver';
    return 'bronze';
  }

  private static generateRecommendations(project: any, metrics: EnhancedQualityMetrics): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Code Quality Recommendations
    if (metrics.codeQuality < 70) {
      recommendations.push({
        category: 'Code Quality',
        priority: 'high',
        title: 'Improve Code Quality Standards',
        description: 'Implement comprehensive code quality measures including linting, formatting, and code review processes.',
        impact: 8,
        effort: 6,
        actionItems: [
          'Set up ESLint with CoreVecta standards',
          'Implement Prettier for consistent formatting',
          'Add pre-commit hooks for quality checks',
          'Establish code review process'
        ],
        estimatedHours: 16
      });
    }

    // Test Coverage Recommendations
    if (metrics.testCoverage < 80) {
      recommendations.push({
        category: 'Testing',
        priority: 'high',
        title: 'Increase Test Coverage',
        description: 'Implement comprehensive testing strategy to achieve 80%+ code coverage.',
        impact: 9,
        effort: 8,
        actionItems: [
          'Add unit tests for all business logic',
          'Implement integration tests for API endpoints',
          'Set up E2E tests for critical user flows',
          'Configure coverage reporting'
        ],
        estimatedHours: 32
      });
    }

    // Security Recommendations
    if (metrics.security < 80) {
      recommendations.push({
        category: 'Security',
        priority: 'critical',
        title: 'Enhance Security Measures',
        description: 'Implement advanced security features to protect against common vulnerabilities.',
        impact: 10,
        effort: 7,
        actionItems: [
          'Implement input validation and sanitization',
          'Add authentication and authorization',
          'Set up security scanning in CI/CD',
          'Configure Content Security Policy'
        ],
        estimatedHours: 24
      });
    }

    // Documentation Recommendations
    if (metrics.documentation < 70) {
      recommendations.push({
        category: 'Documentation',
        priority: 'medium',
        title: 'Improve Documentation',
        description: 'Create comprehensive documentation for users and developers.',
        impact: 6,
        effort: 4,
        actionItems: [
          'Write comprehensive README.md',
          'Create API documentation',
          'Add inline code comments',
          'Develop user guides'
        ],
        estimatedHours: 12
      });
    }

    return recommendations;
  }

  private static identifyIssues(project: any, metrics: EnhancedQualityMetrics): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Critical Issues
    if (metrics.security < 60) {
      issues.push({
        severity: 'critical',
        category: 'Security',
        title: 'Critical Security Vulnerabilities',
        description: 'Project has significant security issues that must be addressed immediately.',
        solution: 'Implement comprehensive security audit and fix all identified vulnerabilities.',
        impactOnScore: 20
      });
    }

    if (metrics.testCoverage < 50) {
      issues.push({
        severity: 'high',
        category: 'Testing',
        title: 'Insufficient Test Coverage',
        description: 'Test coverage is below acceptable threshold for production readiness.',
        solution: 'Implement comprehensive testing strategy with unit, integration, and E2E tests.',
        impactOnScore: 15
      });
    }

    if (metrics.codeQuality < 50) {
      issues.push({
        severity: 'high',
        category: 'Code Quality',
        title: 'Poor Code Quality',
        description: 'Code quality metrics indicate potential maintainability issues.',
        solution: 'Refactor code to follow best practices and implement quality standards.',
        impactOnScore: 12
      });
    }

    return issues;
  }

  private static createImprovementPlan(metrics: EnhancedQualityMetrics, recommendations: QualityRecommendation[]): ImprovementPlan {
    const currentLevel = metrics.certificationLevel;
    const targetLevel = this.getNextCertificationLevel(currentLevel);
    
    const priorityActions = recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .map(r => r.title);

    const quickWins = recommendations
      .filter(r => r.effort <= 4 && r.impact >= 6)
      .map(r => r.title);

    const longTermGoals = recommendations
      .filter(r => r.effort > 6)
      .map(r => r.title);

    return {
      currentLevel,
      targetLevel,
      estimatedTimeToTarget: this.calculateTimeToTarget(recommendations),
      priorityActions,
      quickWins,
      longTermGoals
    };
  }

  private static getNextCertificationLevel(current: string): string {
    const levels = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = levels.indexOf(current);
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }

  private static calculateTimeToTarget(recommendations: QualityRecommendation[]): string {
    const totalHours = recommendations.reduce((sum, r) => sum + r.estimatedHours, 0);
    const weeks = Math.ceil(totalHours / 40);
    
    if (weeks <= 2) return '1-2 weeks';
    if (weeks <= 4) return '2-4 weeks';
    if (weeks <= 8) return '1-2 months';
    if (weeks <= 12) return '2-3 months';
    return '3+ months';
  }

  /**
   * Batch re-score all projects with enhanced metrics
   */
  static async rescoreAllProjects(): Promise<void> {
    const projects = await prisma.project.findMany({
      select: { id: true }
    });

    console.log(`Starting enhanced rescoring of ${projects.length} projects...`);

    for (const project of projects) {
      try {
        const analysis = await this.analyzeProject(project.id);
        
        // Update project with new scores
        await prisma.project.update({
          where: { id: project.id },
          data: {
            qualityScore: analysis.metrics.overallScore / 10, // Convert to 0-10 scale
            // Store enhanced metrics in a new field if schema supports it
            // enhancedMetrics: JSON.stringify(analysis.metrics)
          }
        });

        console.log(`Updated project ${project.id} with score ${analysis.metrics.overallScore}`);
      } catch (error) {
        console.error(`Error rescoring project ${project.id}:`, error);
      }
    }

    console.log('Enhanced rescoring completed!');
  }
}