/**
 * CoreVecta Quality Assurance System
 * Automated quality checks and certification for all projects
 */

import { Project } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface QualityReport {
  projectId: string;
  timestamp: Date;
  overallScore: number;
  certification: CertificationLevel;
  categories: {
    codeQuality: CategoryScore;
    security: CategoryScore;
    testing: CategoryScore;
    documentation: CategoryScore;
    accessibility: CategoryScore;
    performance: CategoryScore;
    bestPractices: CategoryScore;
  };
  recommendations: string[];
  blockers: string[];
  warnings: string[];
}

export interface CategoryScore {
  score: number;
  maxScore: 100;
  details: string[];
  passed: boolean;
}

export enum CertificationLevel {
  NONE = 'none',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum'
}

export class CoreVectaQASystem {
  /**
   * Run comprehensive quality audit on a project
   */
  static async auditProject(
    projectId: string,
    projectFiles: Record<string, string>
  ): Promise<QualityReport> {
    console.log(`🔍 Starting CoreVecta QA audit for project ${projectId}`);
    
    const startTime = Date.now();
    
    // Run all quality checks in parallel
    const [
      codeQuality,
      security,
      testing,
      documentation,
      accessibility,
      performance,
      bestPractices
    ] = await Promise.all([
      this.checkCodeQuality(projectFiles),
      this.checkSecurity(projectFiles),
      this.checkTesting(projectFiles),
      this.checkDocumentation(projectFiles),
      this.checkAccessibility(projectFiles),
      this.checkPerformance(projectFiles),
      this.checkBestPractices(projectFiles)
    ]);
    
    // Calculate overall score
    const categories = {
      codeQuality,
      security,
      testing,
      documentation,
      accessibility,
      performance,
      bestPractices
    };
    
    const overallScore = this.calculateOverallScore(categories);
    const certification = this.determineCertification(overallScore, categories);
    const recommendations = this.generateRecommendations(categories);
    const { blockers, warnings } = this.identifyIssues(categories);
    
    const report: QualityReport = {
      projectId,
      timestamp: new Date(),
      overallScore,
      certification,
      categories,
      recommendations,
      blockers,
      warnings
    };
    
    // Save audit results
    await this.saveAuditResults(projectId, report, Date.now() - startTime);
    
    console.log(`✅ QA audit complete. Score: ${overallScore}/100, Certification: ${certification}`);
    
    return report;
  }

  /**
   * Check code quality metrics
   */
  private static async checkCodeQuality(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    // Check for TypeScript/type safety
    const hasTypeScript = Object.keys(files).some(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    if (!hasTypeScript) {
      score -= 10;
      details.push('❌ No TypeScript found - consider adding type safety');
    } else {
      details.push('✅ TypeScript enabled');
    }
    
    // Check for linting configuration
    const hasESLint = '.eslintrc.json' in files || '.eslintrc.js' in files;
    if (!hasESLint) {
      score -= 15;
      details.push('❌ No ESLint configuration found');
    } else {
      details.push('✅ ESLint configured');
    }
    
    // Check for code formatting
    const hasPrettier = '.prettierrc' in files || '.prettierrc.json' in files;
    if (!hasPrettier) {
      score -= 5;
      details.push('❌ No Prettier configuration found');
    } else {
      details.push('✅ Prettier configured');
    }
    
    // Check for clean code patterns
    const sourceFiles = Object.entries(files).filter(([name]) => 
      name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx')
    );
    
    for (const [filename, content] of sourceFiles) {
      // Check function length
      const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || [];
      const longFunctions = functionMatches.filter(f => {
        const functionContent = content.substring(content.indexOf(f));
        const lines = functionContent.split('\n').slice(0, 60);
        return lines.length >= 50;
      });
      
      if (longFunctions.length > 0) {
        score -= 2 * longFunctions.length;
        details.push(`⚠️ ${filename}: ${longFunctions.length} functions exceed 50 lines`);
      }
      
      // Check for console.log
      if (content.includes('console.log')) {
        score -= 5;
        details.push(`❌ ${filename}: Contains console.log statements`);
      }
      
      // Check for proper error handling
      if (content.includes('try') && !content.includes('catch')) {
        score -= 5;
        details.push(`❌ ${filename}: Try block without catch`);
      }
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 70
    };
  }

  /**
   * Check security implementation
   */
  private static async checkSecurity(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    // Check for CSP
    const hasCSP = Object.values(files).some(content => 
      content.includes('Content-Security-Policy') || 
      content.includes('content_security_policy')
    );
    
    if (!hasCSP) {
      score -= 20;
      details.push('❌ No Content Security Policy found');
    } else {
      details.push('✅ Content Security Policy configured');
    }
    
    // Check for input sanitization
    const hasSanitization = Object.values(files).some(content => 
      content.includes('sanitize') || 
      content.includes('DOMPurify') ||
      content.includes('escape')
    );
    
    if (!hasSanitization) {
      score -= 15;
      details.push('⚠️ No input sanitization found');
    } else {
      details.push('✅ Input sanitization implemented');
    }
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
      /secret\s*[:=]\s*["'][^"']+["']/i,
      /password\s*[:=]\s*["'][^"']+["']/i,
      /token\s*[:=]\s*["'][^"']+["']/i
    ];
    
    for (const [filename, content] of Object.entries(files)) {
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          score -= 25;
          details.push(`🚨 ${filename}: Potential hardcoded secret detected`);
        }
      }
    }
    
    // Check for HTTPS usage
    const hasHTTP = Object.values(files).some(content => 
      content.includes('http://') && !content.includes('http://localhost')
    );
    
    if (hasHTTP) {
      score -= 10;
      details.push('⚠️ Non-HTTPS URLs detected');
    }
    
    // Check for permission minimization
    const manifest = files['manifest.json'];
    if (manifest) {
      try {
        const parsed = JSON.parse(manifest);
        const permissions = parsed.permissions || [];
        const hostPermissions = parsed.host_permissions || [];
        
        if (permissions.includes('*') || hostPermissions.includes('*://*/*')) {
          score -= 15;
          details.push('❌ Overly broad permissions requested');
        } else {
          details.push('✅ Permissions appropriately scoped');
        }
      } catch (e) {
        details.push('⚠️ Could not parse manifest.json');
      }
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 70
    };
  }

  /**
   * Check testing coverage and quality
   */
  private static async checkTesting(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    // Check for test configuration
    const hasJestConfig = 'jest.config.js' in files || 'jest.config.ts' in files;
    if (!hasJestConfig) {
      score -= 20;
      details.push('❌ No Jest configuration found');
    } else {
      details.push('✅ Jest configured');
    }
    
    // Check for test files
    const testFiles = Object.keys(files).filter(f => 
      f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__')
    );
    
    if (testFiles.length === 0) {
      score -= 30;
      details.push('❌ No test files found');
    } else {
      details.push(`✅ ${testFiles.length} test files found`);
      
      // Check test quality
      let totalTests = 0;
      testFiles.forEach(file => {
        const content = files[file];
        const testCount = (content.match(/\b(test|it)\s*\(/g) || []).length;
        totalTests += testCount;
      });
      
      if (totalTests < 10) {
        score -= 15;
        details.push(`⚠️ Only ${totalTests} tests found - consider adding more`);
      } else {
        details.push(`✅ ${totalTests} tests found`);
      }
    }
    
    // Check for E2E tests
    const hasE2ETests = Object.keys(files).some(f => 
      f.includes('e2e') || f.includes('playwright') || f.includes('puppeteer')
    );
    
    if (!hasE2ETests) {
      score -= 10;
      details.push('⚠️ No E2E tests found');
    } else {
      details.push('✅ E2E tests configured');
    }
    
    // Check for mocks
    const hasMocks = Object.keys(files).some(f => 
      f.includes('mock') || f.includes('__mocks__')
    );
    
    if (!hasMocks) {
      score -= 5;
      details.push('⚠️ No mock files found');
    } else {
      details.push('✅ Mock files present');
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 60
    };
  }

  /**
   * Check documentation completeness
   */
  private static async checkDocumentation(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    // Check README
    if (!files['README.md']) {
      score -= 25;
      details.push('❌ No README.md found');
    } else {
      const readme = files['README.md'];
      const requiredSections = [
        'installation',
        'usage',
        'features',
        'contributing',
        'license'
      ];
      
      requiredSections.forEach(section => {
        if (!readme.toLowerCase().includes(section)) {
          score -= 5;
          details.push(`⚠️ README missing ${section} section`);
        }
      });
      
      if (readme.length < 1000) {
        score -= 10;
        details.push('⚠️ README seems too short');
      } else {
        details.push('✅ Comprehensive README found');
      }
    }
    
    // Check CLAUDE.md
    if (!files['CLAUDE.md']) {
      score -= 10;
      details.push('⚠️ No CLAUDE.md for AI assistance');
    } else {
      details.push('✅ CLAUDE.md present');
    }
    
    // Check API documentation
    const hasAPIDocs = files['docs/API.md'] || Object.values(files).some(content =>
      content.includes('@api') || content.includes('@param') || content.includes('@returns')
    );
    
    if (!hasAPIDocs) {
      score -= 10;
      details.push('⚠️ No API documentation found');
    } else {
      details.push('✅ API documentation present');
    }
    
    // Check inline documentation
    const sourceFiles = Object.entries(files).filter(([name]) => 
      name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx')
    );
    
    let undocumentedFunctions = 0;
    sourceFiles.forEach(([filename, content]) => {
      const functions = content.match(/(?:function|const)\s+(\w+)/g) || [];
      const jsdocs = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
      
      if (functions.length > jsdocs.length) {
        undocumentedFunctions += functions.length - jsdocs.length;
      }
    });
    
    if (undocumentedFunctions > 5) {
      score -= 15;
      details.push(`⚠️ ${undocumentedFunctions} functions lack documentation`);
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 60
    };
  }

  /**
   * Check accessibility compliance
   */
  private static async checkAccessibility(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    const htmlFiles = Object.entries(files).filter(([name]) => 
      name.endsWith('.html') || name.endsWith('.jsx') || name.endsWith('.tsx')
    );
    
    htmlFiles.forEach(([filename, content]) => {
      // Check for alt texts on images
      const images = content.match(/<img[^>]*>/g) || [];
      const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
      
      if (imagesWithoutAlt.length > 0) {
        score -= 5 * imagesWithoutAlt.length;
        details.push(`❌ ${filename}: ${imagesWithoutAlt.length} images without alt text`);
      }
      
      // Check for ARIA labels
      const interactiveElements = content.match(/<(button|a|input)[^>]*>/g) || [];
      const elementsWithoutLabel = interactiveElements.filter(elem => 
        !elem.includes('aria-label') && !elem.includes('title=')
      );
      
      if (elementsWithoutLabel.length > 3) {
        score -= 10;
        details.push(`⚠️ ${filename}: Interactive elements lack ARIA labels`);
      }
      
      // Check for semantic HTML
      if (!content.includes('<main') && !content.includes('<header') && !content.includes('<nav')) {
        score -= 5;
        details.push(`⚠️ ${filename}: Consider using semantic HTML elements`);
      }
    });
    
    // Check for keyboard navigation support
    const hasKeyboardSupport = Object.values(files).some(content => 
      content.includes('onKeyDown') || 
      content.includes('onKeyPress') ||
      content.includes('addEventListener("key')
    );
    
    if (!hasKeyboardSupport) {
      score -= 10;
      details.push('⚠️ No keyboard navigation support detected');
    } else {
      details.push('✅ Keyboard navigation supported');
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 70
    };
  }

  /**
   * Check performance optimization
   */
  private static async checkPerformance(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    // Check for lazy loading
    const hasLazyLoading = Object.values(files).some(content => 
      content.includes('lazy') || 
      content.includes('React.lazy') ||
      content.includes('import(')
    );
    
    if (!hasLazyLoading) {
      score -= 10;
      details.push('⚠️ Consider implementing lazy loading');
    } else {
      details.push('✅ Lazy loading implemented');
    }
    
    // Check for debouncing/throttling
    const hasOptimization = Object.values(files).some(content => 
      content.includes('debounce') || 
      content.includes('throttle')
    );
    
    if (!hasOptimization) {
      score -= 5;
      details.push('⚠️ Consider debouncing/throttling for performance');
    } else {
      details.push('✅ Performance optimizations found');
    }
    
    // Check bundle configuration
    const hasWebpackConfig = Object.keys(files).some(f => f.includes('webpack'));
    if (hasWebpackConfig) {
      const webpackFile = Object.entries(files).find(([name]) => name.includes('webpack'))?.[1];
      if (webpackFile) {
        if (!webpackFile.includes('optimization')) {
          score -= 10;
          details.push('⚠️ Webpack optimization not configured');
        } else {
          details.push('✅ Build optimization configured');
        }
      }
    }
    
    // Check for memory leak prevention
    const hasCleanup = Object.values(files).some(content => 
      content.includes('removeEventListener') || 
      content.includes('cleanup') ||
      content.includes('dispose')
    );
    
    if (!hasCleanup) {
      score -= 10;
      details.push('⚠️ Ensure proper cleanup to prevent memory leaks');
    } else {
      details.push('✅ Cleanup patterns found');
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 70
    };
  }

  /**
   * Check best practices implementation
   */
  private static async checkBestPractices(files: Record<string, string>): Promise<CategoryScore> {
    const details: string[] = [];
    let score = 100;
    
    // Check for version control files
    if (!files['.gitignore']) {
      score -= 10;
      details.push('❌ No .gitignore file');
    } else {
      details.push('✅ Git configured');
    }
    
    // Check for CI/CD
    const hasCI = Object.keys(files).some(f => 
      f.includes('.github/workflows') || 
      f.includes('.gitlab-ci') ||
      f.includes('jenkins')
    );
    
    if (!hasCI) {
      score -= 15;
      details.push('⚠️ No CI/CD configuration found');
    } else {
      details.push('✅ CI/CD configured');
    }
    
    // Check for environment configuration
    const hasEnvConfig = files['.env.example'] || files['.env.sample'];
    if (!hasEnvConfig) {
      score -= 5;
      details.push('⚠️ No environment configuration example');
    } else {
      details.push('✅ Environment configuration documented');
    }
    
    // Check for error boundaries (React)
    if (Object.keys(files).some(f => f.endsWith('.tsx') || f.endsWith('.jsx'))) {
      const hasErrorBoundary = Object.values(files).some(content => 
        content.includes('componentDidCatch') || 
        content.includes('ErrorBoundary')
      );
      
      if (!hasErrorBoundary) {
        score -= 10;
        details.push('⚠️ Consider adding error boundaries');
      } else {
        details.push('✅ Error boundaries implemented');
      }
    }
    
    // Check for proper package.json scripts
    if (files['package.json']) {
      try {
        const pkg = JSON.parse(files['package.json']);
        const requiredScripts = ['build', 'test', 'lint'];
        
        requiredScripts.forEach(script => {
          if (!pkg.scripts?.[script]) {
            score -= 5;
            details.push(`⚠️ Missing ${script} script`);
          }
        });
      } catch (e) {
        details.push('⚠️ Could not parse package.json');
      }
    }
    
    return {
      score: Math.max(0, score),
      maxScore: 100,
      details,
      passed: score >= 70
    };
  }

  /**
   * Calculate overall quality score
   */
  private static calculateOverallScore(categories: QualityReport['categories']): number {
    const weights = {
      codeQuality: 0.20,
      security: 0.25,
      testing: 0.20,
      documentation: 0.10,
      accessibility: 0.10,
      performance: 0.10,
      bestPractices: 0.05
    };
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(categories).forEach(([key, category]) => {
      const weight = weights[key as keyof typeof weights];
      weightedSum += category.score * weight;
      totalWeight += weight;
    });
    
    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Determine certification level based on scores
   */
  private static determineCertification(
    overallScore: number,
    categories: QualityReport['categories']
  ): CertificationLevel {
    // Check minimum requirements for each level
    const allPassed = Object.values(categories).every(cat => cat.passed);
    
    if (!allPassed || overallScore < 65) {
      return CertificationLevel.NONE;
    }
    
    if (overallScore >= 95 && categories.security.score >= 95) {
      return CertificationLevel.PLATINUM;
    }
    
    if (overallScore >= 85 && categories.security.score >= 85) {
      return CertificationLevel.GOLD;
    }
    
    if (overallScore >= 75) {
      return CertificationLevel.SILVER;
    }
    
    return CertificationLevel.BRONZE;
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(categories: QualityReport['categories']): string[] {
    const recommendations: string[] = [];
    
    // Sort categories by score to prioritize improvements
    const sortedCategories = Object.entries(categories)
      .sort(([, a], [, b]) => a.score - b.score)
      .slice(0, 3); // Top 3 areas for improvement
    
    sortedCategories.forEach(([category, data]) => {
      if (data.score < 80) {
        switch (category) {
          case 'codeQuality':
            recommendations.push('📝 Improve code quality by adding TypeScript and enforcing linting rules');
            break;
          case 'security':
            recommendations.push('🔒 Enhance security by implementing CSP and input sanitization');
            break;
          case 'testing':
            recommendations.push('🧪 Increase test coverage to at least 80% and add E2E tests');
            break;
          case 'documentation':
            recommendations.push('📚 Complete documentation including API docs and inline comments');
            break;
          case 'accessibility':
            recommendations.push('♿ Improve accessibility with ARIA labels and keyboard navigation');
            break;
          case 'performance':
            recommendations.push('⚡ Optimize performance with lazy loading and code splitting');
            break;
          case 'bestPractices':
            recommendations.push('✅ Implement CI/CD pipeline and follow industry best practices');
            break;
        }
      }
    });
    
    return recommendations;
  }

  /**
   * Identify blocking issues and warnings
   */
  private static identifyIssues(
    categories: QualityReport['categories']
  ): { blockers: string[]; warnings: string[] } {
    const blockers: string[] = [];
    const warnings: string[] = [];
    
    // Security blockers
    if (categories.security.score < 50) {
      blockers.push('🚨 Critical security issues must be addressed');
    }
    
    // Testing blockers
    if (categories.testing.score < 30) {
      blockers.push('🚨 Insufficient testing - add tests before release');
    }
    
    // Code quality warnings
    if (categories.codeQuality.score < 60) {
      warnings.push('⚠️ Code quality below standards');
    }
    
    // Documentation warnings
    if (categories.documentation.score < 50) {
      warnings.push('⚠️ Documentation is incomplete');
    }
    
    return { blockers, warnings };
  }

  /**
   * Save audit results to database
   */
  private static async saveAuditResults(
    projectId: string,
    report: QualityReport,
    durationMs: number
  ): Promise<void> {
    try {
      // Save quality metrics
      await prisma.quality_metrics.upsert({
        where: {
          project_id_metric_type: {
            project_id: projectId,
            metric_type: 'overall'
          }
        },
        update: {
          score: report.overallScore,
          details: report,
          measured_at: new Date()
        },
        create: {
          project_id: projectId,
          metric_type: 'overall',
          score: report.overallScore,
          details: report,
          recommendations: report.recommendations
        }
      });
      
      // Save individual category scores
      for (const [category, data] of Object.entries(report.categories)) {
        await prisma.quality_metrics.upsert({
          where: {
            project_id_metric_type: {
              project_id: projectId,
              metric_type: category
            }
          },
          update: {
            score: data.score,
            details: data,
            measured_at: new Date()
          },
          create: {
            project_id: projectId,
            metric_type: category,
            score: data.score,
            details: data
          }
        });
      }
      
      // Update project certification
      await prisma.projects.update({
        where: { id: projectId },
        data: {
          certification_level: report.certification,
          quality_audit_date: new Date(),
          security_score: report.categories.security.score,
          testing_coverage: report.categories.testing.score
        }
      });
      
      // Log audit
      await prisma.quality_audit_logs.create({
        data: {
          project_id: projectId,
          audit_type: 'automated',
          auditor: 'CoreVecta QA Bot',
          findings: {
            overall_score: report.overallScore,
            certification: report.certification,
            categories: report.categories
          },
          severity_counts: {
            critical: report.blockers.length,
            high: report.warnings.length,
            medium: report.recommendations.filter(r => r.includes('⚠️')).length,
            low: report.recommendations.filter(r => !r.includes('⚠️')).length
          },
          recommendations: report.recommendations,
          audit_duration_seconds: Math.round(durationMs / 1000),
          passed: report.certification !== CertificationLevel.NONE
        }
      });
      
      // Issue certification if passed
      if (report.certification !== CertificationLevel.NONE) {
        await this.issueCertification(projectId, report);
      }
    } catch (error) {
      console.error('Failed to save audit results:', error);
    }
  }

  /**
   * Issue CoreVecta certification
   */
  private static async issueCertification(
    projectId: string,
    report: QualityReport
  ): Promise<void> {
    const verificationCode = `CV-${projectId.substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
    
    await prisma.corevecta_certifications.create({
      data: {
        project_id: projectId,
        certification_level: report.certification,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        verification_code: verificationCode,
        requirements_met: {
          code_quality: report.categories.codeQuality.score,
          security: report.categories.security.score,
          testing: report.categories.testing.score,
          documentation: report.categories.documentation.score,
          accessibility: report.categories.accessibility.score,
          performance: report.categories.performance.score,
          best_practices: report.categories.bestPractices.score
        },
        overall_score: report.overallScore
      }
    });
    
    console.log(`🏆 CoreVecta ${report.certification} certification issued: ${verificationCode}`);
  }
}

/**
 * Automated quality monitoring service
 */
export class QualityMonitoringService {
  /**
   * Monitor project quality over time
   */
  static async monitorProjectQuality(projectId: string): Promise<void> {
    // Get historical metrics
    const metrics = await prisma.quality_metrics.findMany({
      where: { project_id: projectId },
      orderBy: { measured_at: 'desc' },
      take: 10
    });
    
    if (metrics.length < 2) return;
    
    // Check for quality degradation
    const latestScore = metrics[0].score;
    const previousScore = metrics[1].score;
    
    if (latestScore < previousScore - 10) {
      console.warn(`⚠️ Quality degradation detected for project ${projectId}: ${previousScore} → ${latestScore}`);
      
      // Send alert or notification
      await this.sendQualityAlert(projectId, latestScore, previousScore);
    }
  }
  
  private static async sendQualityAlert(
    projectId: string,
    currentScore: number,
    previousScore: number
  ): Promise<void> {
    // Implementation for sending alerts
    console.log(`📧 Quality alert sent for project ${projectId}`);
  }
}