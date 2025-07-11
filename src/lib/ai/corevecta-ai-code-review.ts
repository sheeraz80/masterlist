/**
 * CoreVecta AI-Powered Code Review System
 * Automated code analysis and improvement suggestions
 */

import { Project } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface CodeReview {
  projectId: string;
  timestamp: Date;
  overallScore: number;
  issues: CodeIssue[];
  improvements: Improvement[];
  securityVulnerabilities: SecurityVulnerability[];
  performanceOptimizations: PerformanceOptimization[];
  bestPracticeViolations: BestPracticeViolation[];
  estimatedFixTime: number;
  autoFixAvailable: boolean;
}

export interface CodeIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'bug' | 'security' | 'performance' | 'style' | 'maintainability';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

export interface Improvement {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
  codeExample?: string;
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cwe: string;
  file: string;
  description: string;
  remediation: string;
  references: string[];
}

export interface PerformanceOptimization {
  type: string;
  impact: string;
  location: string;
  current: string;
  suggested: string;
  estimatedImprovement: string;
}

export interface BestPracticeViolation {
  practice: string;
  file: string;
  line: number;
  current: string;
  recommended: string;
  rationale: string;
}

export class CoreVectaAICodeReviewer {
  private static readonly AI_MODEL = 'claude-3-opus-20240229';
  
  /**
   * Perform comprehensive AI-powered code review
   */
  static async reviewProject(
    projectId: string,
    files: Record<string, string>
  ): Promise<CodeReview> {
    console.log(`🤖 Starting AI code review for project ${projectId}`);
    
    const startTime = Date.now();
    
    // Run all analysis in parallel
    const [
      codeIssues,
      improvements,
      securityVulns,
      performanceOpts,
      bestPracticeViolations
    ] = await Promise.all([
      this.analyzeCodeIssues(files),
      this.suggestImprovements(files),
      this.scanSecurity(files),
      this.analyzePerformance(files),
      this.checkBestPractices(files)
    ]);
    
    // Calculate overall score
    const overallScore = this.calculateScore(
      codeIssues,
      securityVulns,
      performanceOpts,
      bestPracticeViolations
    );
    
    // Estimate fix time
    const estimatedFixTime = this.estimateFixTime(
      codeIssues,
      improvements,
      securityVulns,
      performanceOpts,
      bestPracticeViolations
    );
    
    // Check if auto-fix is available
    const autoFixAvailable = codeIssues.some(issue => issue.autoFixable);
    
    const review: CodeReview = {
      projectId,
      timestamp: new Date(),
      overallScore,
      issues: codeIssues,
      improvements,
      securityVulnerabilities: securityVulns,
      performanceOptimizations: performanceOpts,
      bestPracticeViolations,
      estimatedFixTime,
      autoFixAvailable
    };
    
    // Save review results
    await this.saveReview(projectId, review, Date.now() - startTime);
    
    console.log(`✅ AI code review complete. Score: ${overallScore}/100`);
    
    return review;
  }

  /**
   * Analyze code for bugs and issues
   */
  private static async analyzeCodeIssues(
    files: Record<string, string>
  ): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
    
    for (const [filename, content] of Object.entries(files)) {
      // Skip non-code files
      if (!this.isCodeFile(filename)) continue;
      
      // Common bug patterns
      const bugPatterns = [
        {
          pattern: /console\.log/g,
          severity: 'low' as const,
          type: 'maintainability' as const,
          message: 'Remove console.log statements from production code',
          suggestion: 'Use a proper logging library with log levels',
          autoFixable: true
        },
        {
          pattern: /var\s+\w+\s*=/g,
          severity: 'medium' as const,
          type: 'maintainability' as const,
          message: 'Use const or let instead of var',
          suggestion: 'Replace var with const for immutable values or let for mutable ones',
          autoFixable: true
        },
        {
          pattern: /==(?!=)/g,
          severity: 'medium' as const,
          type: 'bug' as const,
          message: 'Use strict equality (===) instead of loose equality (==)',
          suggestion: 'Replace == with === to avoid type coercion issues',
          autoFixable: true
        },
        {
          pattern: /setTimeout\([^,]+,\s*0\)/g,
          severity: 'low' as const,
          type: 'performance' as const,
          message: 'setTimeout with 0 delay can be replaced with queueMicrotask',
          suggestion: 'Use queueMicrotask() for better performance',
          autoFixable: true
        },
        {
          pattern: /catch\s*\(\s*\w+\s*\)\s*{\s*}/g,
          severity: 'high' as const,
          type: 'bug' as const,
          message: 'Empty catch block swallows errors',
          suggestion: 'Log or handle the error appropriately',
          autoFixable: false
        }
      ];
      
      // Analyze with patterns
      for (const bugPattern of bugPatterns) {
        let match;
        while ((match = bugPattern.pattern.exec(content)) !== null) {
          const lines = content.substring(0, match.index).split('\n');
          const line = lines.length;
          const column = lines[lines.length - 1].length + 1;
          
          issues.push({
            id: `${filename}-${line}-${column}`,
            severity: bugPattern.severity,
            type: bugPattern.type,
            file: filename,
            line,
            column,
            message: bugPattern.message,
            suggestion: bugPattern.suggestion,
            autoFixable: bugPattern.autoFixable
          });
        }
      }
      
      // Advanced analysis using AI
      const aiIssues = await this.analyzeWithAI(filename, content);
      issues.push(...aiIssues);
    }
    
    return issues;
  }

  /**
   * Suggest code improvements
   */
  private static async suggestImprovements(
    files: Record<string, string>
  ): Promise<Improvement[]> {
    const improvements: Improvement[] = [];
    
    // Analyze code structure
    const hasTypeScript = Object.keys(files).some(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    if (!hasTypeScript) {
      improvements.push({
        title: 'Add TypeScript Support',
        description: 'TypeScript provides type safety and better IDE support',
        impact: 'high',
        effort: 'medium',
        category: 'type-safety',
        codeExample: `// Before (JavaScript)
function add(a, b) {
  return a + b;
}

// After (TypeScript)
function add(a: number, b: number): number {
  return a + b;
}`
      });
    }
    
    // Check for testing
    const hasTests = Object.keys(files).some(f => f.includes('.test.') || f.includes('.spec.'));
    if (!hasTests) {
      improvements.push({
        title: 'Add Unit Tests',
        description: 'Unit tests ensure code reliability and make refactoring safer',
        impact: 'high',
        effort: 'high',
        category: 'testing',
        codeExample: `// Example test file
describe('Calculator', () => {
  test('adds two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
});`
      });
    }
    
    // Check for error handling
    const hasErrorHandling = Object.values(files).some(content => 
      content.includes('try') && content.includes('catch')
    );
    if (!hasErrorHandling) {
      improvements.push({
        title: 'Implement Error Handling',
        description: 'Proper error handling improves user experience and debugging',
        impact: 'high',
        effort: 'medium',
        category: 'reliability',
        codeExample: `// Wrap async operations in try-catch
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new CustomError('Operation failed', { cause: error });
}`
      });
    }
    
    // Architecture improvements
    const fileCount = Object.keys(files).length;
    if (fileCount > 20) {
      const hasModularStructure = Object.keys(files).some(f => 
        f.includes('/services/') || f.includes('/components/') || f.includes('/utils/')
      );
      
      if (!hasModularStructure) {
        improvements.push({
          title: 'Improve Code Organization',
          description: 'Organize code into modules for better maintainability',
          impact: 'medium',
          effort: 'medium',
          category: 'architecture',
          codeExample: `// Suggested structure:
src/
  components/     # UI components
  services/       # Business logic
  utils/          # Utility functions
  types/          # TypeScript types
  tests/          # Test files`
        });
      }
    }
    
    return improvements;
  }

  /**
   * Scan for security vulnerabilities
   */
  private static async scanSecurity(
    files: Record<string, string>
  ): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Security patterns to check
    const securityPatterns = [
      {
        pattern: /innerHTML\s*=\s*[^"']/g,
        type: 'XSS',
        severity: 'high' as const,
        cwe: 'CWE-79',
        description: 'Direct innerHTML assignment can lead to XSS attacks',
        remediation: 'Use textContent or sanitize HTML before insertion'
      },
      {
        pattern: /eval\s*\(/g,
        type: 'Code Injection',
        severity: 'critical' as const,
        cwe: 'CWE-95',
        description: 'eval() can execute arbitrary code',
        remediation: 'Use JSON.parse() for JSON or Function constructor for dynamic code'
      },
      {
        pattern: /crypto\.createHash\(['"]md5['"]\)/g,
        type: 'Weak Cryptography',
        severity: 'high' as const,
        cwe: 'CWE-327',
        description: 'MD5 is cryptographically broken',
        remediation: 'Use SHA-256 or stronger hash algorithms'
      },
      {
        pattern: /password|api[_-]?key|secret|token/gi,
        type: 'Hardcoded Secrets',
        severity: 'critical' as const,
        cwe: 'CWE-798',
        description: 'Potential hardcoded sensitive information',
        remediation: 'Use environment variables or secure key management'
      }
    ];
    
    for (const [filename, content] of Object.entries(files)) {
      for (const secPattern of securityPatterns) {
        if (secPattern.pattern.test(content)) {
          vulnerabilities.push({
            type: secPattern.type,
            severity: secPattern.severity,
            cwe: secPattern.cwe,
            file: filename,
            description: secPattern.description,
            remediation: secPattern.remediation,
            references: [
              `https://cwe.mitre.org/data/definitions/${secPattern.cwe.split('-')[1]}.html`,
              'https://owasp.org/www-community/vulnerabilities/'
            ]
          });
        }
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Analyze performance optimizations
   */
  private static async analyzePerformance(
    files: Record<string, string>
  ): Promise<PerformanceOptimization[]> {
    const optimizations: PerformanceOptimization[] = [];
    
    for (const [filename, content] of Object.entries(files)) {
      // Check for inefficient patterns
      
      // Nested loops
      if (/for\s*\([^)]+\)\s*{[^}]*for\s*\([^)]+\)/.test(content)) {
        optimizations.push({
          type: 'Nested Loops',
          impact: 'O(n²) complexity can cause performance issues',
          location: filename,
          current: 'Nested for loops detected',
          suggested: 'Consider using Map/Set for lookups or optimizing algorithm',
          estimatedImprovement: '10-100x for large datasets'
        });
      }
      
      // Multiple array operations
      if (/\.filter\([^)]+\)\.map\([^)]+\)/.test(content)) {
        optimizations.push({
          type: 'Array Chain Optimization',
          impact: 'Multiple iterations over same array',
          location: filename,
          current: 'array.filter().map()',
          suggested: 'Use array.reduce() for single iteration',
          estimatedImprovement: '2x performance improvement'
        });
      }
      
      // Synchronous file operations
      if (/readFileSync|writeFileSync/.test(content)) {
        optimizations.push({
          type: 'Blocking I/O',
          impact: 'Synchronous operations block event loop',
          location: filename,
          current: 'readFileSync/writeFileSync',
          suggested: 'Use async versions with promises',
          estimatedImprovement: 'Non-blocking I/O'
        });
      }
    }
    
    return optimizations;
  }

  /**
   * Check best practices
   */
  private static async checkBestPractices(
    files: Record<string, string>
  ): Promise<BestPracticeViolation[]> {
    const violations: BestPracticeViolation[] = [];
    
    for (const [filename, content] of Object.entries(files)) {
      const lines = content.split('\n');
      
      // Check function length
      let functionStart = -1;
      let braceCount = 0;
      
      lines.forEach((line, index) => {
        if (/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(line)) {
          functionStart = index;
          braceCount = 0;
        }
        
        if (functionStart >= 0) {
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;
          
          if (braceCount === 0 && index - functionStart > 50) {
            violations.push({
              practice: 'Function Length',
              file: filename,
              line: functionStart + 1,
              current: `Function spans ${index - functionStart} lines`,
              recommended: 'Keep functions under 50 lines',
              rationale: 'Shorter functions are easier to understand and test'
            });
          }
        }
      });
      
      // Check file length
      if (lines.length > 300) {
        violations.push({
          practice: 'File Length',
          file: filename,
          line: 1,
          current: `File has ${lines.length} lines`,
          recommended: 'Keep files under 300 lines',
          rationale: 'Smaller files are easier to navigate and maintain'
        });
      }
    }
    
    return violations;
  }

  /**
   * Analyze code with AI
   */
  private static async analyzeWithAI(
    filename: string,
    content: string
  ): Promise<CodeIssue[]> {
    // In production, this would call an AI API
    // For now, return additional pattern-based checks
    const issues: CodeIssue[] = [];
    
    // Check for complex conditionals
    const complexConditional = /if\s*\([^)]{50,}\)/g;
    let match;
    while ((match = complexConditional.exec(content)) !== null) {
      const lines = content.substring(0, match.index).split('\n');
      issues.push({
        id: `ai-${filename}-${lines.length}`,
        severity: 'medium',
        type: 'maintainability',
        file: filename,
        line: lines.length,
        column: 1,
        message: 'Complex conditional detected',
        suggestion: 'Extract conditional logic into well-named functions',
        autoFixable: false
      });
    }
    
    return issues;
  }

  /**
   * Calculate overall score
   */
  private static calculateScore(
    issues: CodeIssue[],
    securityVulns: SecurityVulnerability[],
    performanceOpts: PerformanceOptimization[],
    bestPractices: BestPracticeViolation[]
  ): number {
    let score = 100;
    
    // Deduct for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 10; break;
        case 'high': score -= 5; break;
        case 'medium': score -= 2; break;
        case 'low': score -= 1; break;
      }
    });
    
    // Deduct for security vulnerabilities
    securityVulns.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': score -= 15; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });
    
    // Deduct for performance issues
    score -= performanceOpts.length * 3;
    
    // Deduct for best practice violations
    score -= bestPractices.length * 2;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate time to fix all issues
   */
  private static estimateFixTime(
    issues: CodeIssue[],
    improvements: Improvement[],
    securityVulns: SecurityVulnerability[],
    performanceOpts: PerformanceOptimization[],
    bestPractices: BestPracticeViolation[]
  ): number {
    let hours = 0;
    
    // Time for issues (in minutes)
    issues.forEach(issue => {
      if (issue.autoFixable) {
        hours += 5 / 60; // 5 minutes
      } else {
        switch (issue.severity) {
          case 'critical': hours += 60 / 60; break;
          case 'high': hours += 30 / 60; break;
          case 'medium': hours += 15 / 60; break;
          case 'low': hours += 5 / 60; break;
        }
      }
    });
    
    // Time for improvements
    improvements.forEach(imp => {
      const effortHours = {
        high: 8,
        medium: 4,
        low: 1
      };
      hours += effortHours[imp.effort];
    });
    
    // Time for security fixes
    securityVulns.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical': hours += 4; break;
        case 'high': hours += 2; break;
        case 'medium': hours += 1; break;
        case 'low': hours += 0.5; break;
      }
    });
    
    // Time for performance optimizations
    hours += performanceOpts.length * 2;
    
    // Time for best practice fixes
    hours += bestPractices.length * 0.5;
    
    return Math.ceil(hours);
  }

  /**
   * Check if file is a code file
   */
  private static isCodeFile(filename: string): boolean {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', 
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.sol'
    ];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * Save review results
   */
  private static async saveReview(
    projectId: string,
    review: CodeReview,
    durationMs: number
  ): Promise<void> {
    try {
      await prisma.quality_audit_logs.create({
        data: {
          project_id: projectId,
          audit_type: 'ai_review',
          auditor: 'CoreVecta AI Reviewer',
          findings: review as any,
          severity_counts: {
            critical: review.issues.filter(i => i.severity === 'critical').length +
                     review.securityVulnerabilities.filter(v => v.severity === 'critical').length,
            high: review.issues.filter(i => i.severity === 'high').length +
                  review.securityVulnerabilities.filter(v => v.severity === 'high').length,
            medium: review.issues.filter(i => i.severity === 'medium').length +
                    review.securityVulnerabilities.filter(v => v.severity === 'medium').length,
            low: review.issues.filter(i => i.severity === 'low').length +
                 review.securityVulnerabilities.filter(v => v.severity === 'low').length
          },
          recommendations: [
            ...review.improvements.map(i => i.title),
            ...review.performanceOptimizations.map(p => `Optimize: ${p.type}`),
            ...review.bestPracticeViolations.map(b => `Fix: ${b.practice}`)
          ],
          audit_duration_seconds: Math.round(durationMs / 1000),
          passed: review.overallScore >= 70
        }
      });
    } catch (error) {
      console.error('Failed to save AI review results:', error);
    }
  }
}

/**
 * Auto-fix service for common issues
 */
export class CoreVectaAutoFixer {
  /**
   * Automatically fix issues that can be fixed
   */
  static async autoFix(
    files: Record<string, string>,
    issues: CodeIssue[]
  ): Promise<Record<string, string>> {
    const fixedFiles = { ...files };
    const autoFixableIssues = issues.filter(issue => issue.autoFixable);
    
    for (const issue of autoFixableIssues) {
      const content = fixedFiles[issue.file];
      if (!content) continue;
      
      let fixedContent = content;
      
      // Apply fixes based on issue type
      switch (issue.message) {
        case 'Remove console.log statements from production code':
          fixedContent = fixedContent.replace(/console\.log\([^)]*\);?\n?/g, '');
          break;
          
        case 'Use const or let instead of var':
          fixedContent = fixedContent.replace(/\bvar\s+/g, 'let ');
          break;
          
        case 'Use strict equality (===) instead of loose equality (==)':
          fixedContent = fixedContent.replace(/([^=!])={2}([^=])/g, '$1===$2');
          break;
          
        case 'setTimeout with 0 delay can be replaced with queueMicrotask':
          fixedContent = fixedContent.replace(
            /setTimeout\(([^,]+),\s*0\)/g,
            'queueMicrotask($1)'
          );
          break;
      }
      
      fixedFiles[issue.file] = fixedContent;
    }
    
    return fixedFiles;
  }
}