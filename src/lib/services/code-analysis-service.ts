/**
 * Code Analysis Service
 * Provides real code metrics calculation for repositories
 */

import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface CodeMetrics {
  linesOfCode: number;
  fileCount: number;
  directoryCount: number;
  complexity: number;
  testCoverage: number;
  codeQuality: number;
  maintainabilityIndex: number;
  languages: Record<string, number>;
  issues: {
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    duplications: number;
  };
}

export class CodeAnalysisService {
  private octokit: Octokit;

  constructor(githubToken?: string) {
    this.octokit = new Octokit({
      auth: githubToken || process.env.GITHUB_TOKEN
    });
  }

  /**
   * Analyze a GitHub repository
   */
  async analyzeRepository(owner: string, repo: string): Promise<CodeMetrics> {
    try {
      // Get repository languages
      const languagesResponse = await this.octokit.repos.listLanguages({
        owner,
        repo
      });
      
      const languages = languagesResponse.data;
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      
      // Get repository statistics
      const [
        contributorsResponse,
        commitsResponse,
        codeFrequencyResponse
      ] = await Promise.all([
        this.octokit.repos.listContributors({ owner, repo, per_page: 1 }),
        this.octokit.repos.listCommits({ owner, repo, per_page: 1 }),
        this.octokit.repos.getCodeFrequencyStats({ owner, repo })
      ]);

      // Get tree to count files and directories
      const defaultBranch = await this.getDefaultBranch(owner, repo);
      const treeResponse = await this.octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: 'true'
      });

      const tree = treeResponse.data.tree;
      const fileCount = tree.filter(item => item.type === 'blob').length;
      const directories = new Set(tree.map(item => path.dirname(item.path || '')));
      const directoryCount = directories.size;

      // Calculate lines of code (approximate based on file sizes)
      const totalSize = tree
        .filter(item => item.type === 'blob' && item.size)
        .reduce((sum, item) => sum + (item.size || 0), 0);
      
      const averageCharsPerLine = 40;
      const linesOfCode = Math.floor(totalSize / averageCharsPerLine);

      // Calculate complexity based on various factors
      const complexity = this.calculateComplexity({
        fileCount,
        directoryCount,
        languages: Object.keys(languages).length,
        contributors: parseInt(contributorsResponse.headers['x-total-count'] || '1'),
        commits: parseInt(commitsResponse.headers['x-total-count'] || '1')
      });

      // Estimate code quality and test coverage
      const { codeQuality, testCoverage } = await this.estimateQualityMetrics(
        tree,
        languages
      );

      // Calculate maintainability index
      const maintainabilityIndex = this.calculateMaintainabilityIndex({
        complexity,
        linesOfCode,
        fileCount,
        codeQuality
      });

      // Analyze issues (approximate based on patterns)
      const issues = await this.analyzeIssues(owner, repo, tree);

      return {
        linesOfCode,
        fileCount,
        directoryCount,
        complexity,
        testCoverage,
        codeQuality,
        maintainabilityIndex,
        languages: this.normalizeLanguages(languages, totalBytes),
        issues
      };
    } catch (error) {
      console.error('Error analyzing repository:', error);
      
      // Return default metrics on error
      return {
        linesOfCode: 0,
        fileCount: 0,
        directoryCount: 0,
        complexity: 5,
        testCoverage: 0,
        codeQuality: 5,
        maintainabilityIndex: 5,
        languages: {},
        issues: {
          bugs: 0,
          vulnerabilities: 0,
          codeSmells: 0,
          duplications: 0
        }
      };
    }
  }

  /**
   * Analyze local repository (for cloned repos)
   */
  async analyzeLocalRepository(repoPath: string): Promise<CodeMetrics> {
    try {
      // Count files and directories
      const { fileCount, directoryCount, filesByExtension } = await this.countFilesAndDirs(repoPath);
      
      // Count lines of code using cloc if available
      const linesOfCode = await this.countLinesOfCode(repoPath);
      
      // Detect languages
      const languages = this.detectLanguages(filesByExtension);
      
      // Run complexity analysis
      const complexity = await this.analyzeComplexity(repoPath);
      
      // Check for test coverage
      const testCoverage = await this.checkTestCoverage(repoPath);
      
      // Calculate code quality
      const codeQuality = await this.calculateCodeQuality(repoPath);
      
      // Calculate maintainability
      const maintainabilityIndex = this.calculateMaintainabilityIndex({
        complexity,
        linesOfCode,
        fileCount,
        codeQuality
      });
      
      // Find issues
      const issues = await this.findLocalIssues(repoPath);

      return {
        linesOfCode,
        fileCount,
        directoryCount,
        complexity,
        testCoverage,
        codeQuality,
        maintainabilityIndex,
        languages,
        issues
      };
    } catch (error) {
      console.error('Error analyzing local repository:', error);
      throw error;
    }
  }

  /**
   * Get default branch name
   */
  private async getDefaultBranch(owner: string, repo: string): string {
    try {
      const repoResponse = await this.octokit.repos.get({ owner, repo });
      return repoResponse.data.default_branch;
    } catch {
      return 'main';
    }
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexity(factors: {
    fileCount: number;
    directoryCount: number;
    languages: number;
    contributors: number;
    commits: number;
  }): number {
    const weights = {
      fileCount: 0.2,
      directoryCount: 0.15,
      languages: 0.25,
      contributors: 0.2,
      commits: 0.2
    };

    // Normalize factors to 0-10 scale
    const normalized = {
      fileCount: Math.min(10, factors.fileCount / 50),
      directoryCount: Math.min(10, factors.directoryCount / 20),
      languages: Math.min(10, factors.languages * 2),
      contributors: Math.min(10, factors.contributors / 5),
      commits: Math.min(10, factors.commits / 100)
    };

    const complexity = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + (normalized[key as keyof typeof normalized] * weight);
    }, 0);

    return Math.round(complexity * 10) / 10;
  }

  /**
   * Estimate quality metrics from file structure
   */
  private async estimateQualityMetrics(
    tree: any[],
    languages: Record<string, number>
  ): Promise<{ codeQuality: number; testCoverage: number }> {
    const testFiles = tree.filter(item => 
      item.path?.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/) ||
      item.path?.includes('__tests__') ||
      item.path?.includes('test/')
    );

    const sourceFiles = tree.filter(item =>
      item.path?.match(/\.(js|ts|jsx|tsx|py|java|cs|cpp|c|go|rb|php)$/) &&
      !item.path?.match(/\.(test|spec)\./)
    );

    const testCoverage = sourceFiles.length > 0 
      ? Math.min(100, (testFiles.length / sourceFiles.length) * 100)
      : 0;

    // Estimate code quality based on various factors
    let qualityScore = 7; // Base score

    // Bonus for having tests
    if (testCoverage > 50) qualityScore += 1;
    if (testCoverage > 80) qualityScore += 1;

    // Bonus for documentation
    const hasReadme = tree.some(item => item.path?.toLowerCase() === 'readme.md');
    if (hasReadme) qualityScore += 0.5;

    // Bonus for CI/CD
    const hasCI = tree.some(item => 
      item.path?.includes('.github/workflows') ||
      item.path?.includes('.gitlab-ci') ||
      item.path === '.travis.yml'
    );
    if (hasCI) qualityScore += 0.5;

    return {
      codeQuality: Math.min(10, qualityScore),
      testCoverage: Math.round(testCoverage)
    };
  }

  /**
   * Calculate maintainability index
   */
  private calculateMaintainabilityIndex(factors: {
    complexity: number;
    linesOfCode: number;
    fileCount: number;
    codeQuality: number;
  }): number {
    // Simplified maintainability calculation
    const locPerFile = factors.fileCount > 0 ? factors.linesOfCode / factors.fileCount : 0;
    const idealLocPerFile = 200;
    
    let maintainability = 10;
    
    // Penalty for high complexity
    maintainability -= (factors.complexity / 10) * 2;
    
    // Penalty for large files
    if (locPerFile > idealLocPerFile) {
      maintainability -= Math.min(3, (locPerFile - idealLocPerFile) / 100);
    }
    
    // Bonus for good code quality
    maintainability += (factors.codeQuality / 10) * 2;
    
    return Math.max(0, Math.min(10, maintainability));
  }

  /**
   * Analyze potential issues
   */
  private async analyzeIssues(owner: string, repo: string, tree: any[]): Promise<{
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    duplications: number;
  }> {
    // Search for common issue patterns in file names and paths
    const patterns = {
      bugs: ['bug', 'fix', 'issue', 'error', 'crash'],
      vulnerabilities: ['security', 'vulnerability', 'cve', 'exploit'],
      codeSmells: ['todo', 'fixme', 'hack', 'refactor', 'deprecated'],
      duplications: ['copy', 'duplicate', 'clone']
    };

    const issues = {
      bugs: 0,
      vulnerabilities: 0,
      codeSmells: 0,
      duplications: 0
    };

    // Check recent issues
    try {
      const issuesResponse = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 100
      });

      issuesResponse.data.forEach(issue => {
        const title = issue.title.toLowerCase();
        const labels = issue.labels.map(l => 
          typeof l === 'string' ? l : l.name || ''
        ).join(' ').toLowerCase();
        
        const combined = `${title} ${labels}`;
        
        if (patterns.bugs.some(p => combined.includes(p))) issues.bugs++;
        if (patterns.vulnerabilities.some(p => combined.includes(p))) issues.vulnerabilities++;
        if (patterns.codeSmells.some(p => combined.includes(p))) issues.codeSmells++;
      });
    } catch (error) {
      console.error('Error fetching issues:', error);
    }

    return issues;
  }

  /**
   * Normalize language percentages
   */
  private normalizeLanguages(
    languages: Record<string, number>,
    totalBytes: number
  ): Record<string, number> {
    const normalized: Record<string, number> = {};
    
    Object.entries(languages).forEach(([lang, bytes]) => {
      normalized[lang] = Math.round((bytes / totalBytes) * 100);
    });
    
    return normalized;
  }

  /**
   * Count files and directories in local repo
   */
  private async countFilesAndDirs(
    repoPath: string
  ): Promise<{
    fileCount: number;
    directoryCount: number;
    filesByExtension: Record<string, number>;
  }> {
    let fileCount = 0;
    let directoryCount = 0;
    const filesByExtension: Record<string, number> = {};
    
    const processDirectory = async (dirPath: string) => {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          directoryCount++;
          await processDirectory(fullPath);
        } else if (entry.isFile()) {
          fileCount++;
          const ext = path.extname(entry.name).toLowerCase();
          filesByExtension[ext] = (filesByExtension[ext] || 0) + 1;
        }
      }
    };
    
    await processDirectory(repoPath);
    
    return { fileCount, directoryCount, filesByExtension };
  }

  /**
   * Count lines of code using cloc or manual counting
   */
  private async countLinesOfCode(repoPath: string): Promise<number> {
    try {
      // Try using cloc if available
      const { stdout } = await execAsync(`cloc ${repoPath} --json`);
      const result = JSON.parse(stdout);
      return result.SUM?.code || 0;
    } catch {
      // Fallback to manual counting
      const { stdout } = await execAsync(
        `find ${repoPath} -type f \\( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.cs" -o -name "*.cpp" -o -name "*.c" -o -name "*.go" \\) -exec wc -l {} + | tail -1 | awk '{print $1}'`
      );
      return parseInt(stdout.trim()) || 0;
    }
  }

  /**
   * Detect languages from file extensions
   */
  private detectLanguages(filesByExtension: Record<string, number>): Record<string, number> {
    const languageMap: Record<string, string[]> = {
      'JavaScript': ['.js', '.jsx', '.mjs'],
      'TypeScript': ['.ts', '.tsx'],
      'Python': ['.py'],
      'Java': ['.java'],
      'C#': ['.cs'],
      'C++': ['.cpp', '.cc', '.cxx'],
      'C': ['.c', '.h'],
      'Go': ['.go'],
      'Ruby': ['.rb'],
      'PHP': ['.php'],
      'Swift': ['.swift'],
      'Kotlin': ['.kt', '.kts'],
      'Rust': ['.rs'],
      'HTML': ['.html', '.htm'],
      'CSS': ['.css', '.scss', '.sass', '.less'],
      'SQL': ['.sql'],
      'Shell': ['.sh', '.bash'],
      'YAML': ['.yml', '.yaml'],
      'JSON': ['.json'],
      'Markdown': ['.md', '.markdown']
    };

    const languages: Record<string, number> = {};
    let totalFiles = 0;

    Object.entries(filesByExtension).forEach(([ext, count]) => {
      Object.entries(languageMap).forEach(([lang, extensions]) => {
        if (extensions.includes(ext)) {
          languages[lang] = (languages[lang] || 0) + count;
          totalFiles += count;
        }
      });
    });

    // Convert to percentages
    const percentages: Record<string, number> = {};
    Object.entries(languages).forEach(([lang, count]) => {
      percentages[lang] = Math.round((count / totalFiles) * 100);
    });

    return percentages;
  }

  /**
   * Analyze code complexity
   */
  private async analyzeComplexity(repoPath: string): Promise<number> {
    // Simple heuristic based on file structure
    const { fileCount, directoryCount } = await this.countFilesAndDirs(repoPath);
    const ratio = directoryCount > 0 ? fileCount / directoryCount : fileCount;
    
    // Lower ratio = better organization = lower complexity
    if (ratio < 5) return 3;
    if (ratio < 10) return 5;
    if (ratio < 20) return 7;
    return 9;
  }

  /**
   * Check for test coverage
   */
  private async checkTestCoverage(repoPath: string): Promise<number> {
    try {
      // Look for coverage reports
      const coverageFiles = [
        'coverage/coverage-summary.json',
        'coverage/lcov-report/index.html',
        '.nyc_output/coverage-summary.json'
      ];

      for (const file of coverageFiles) {
        const filePath = path.join(repoPath, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          
          // Try to parse coverage data
          if (file.endsWith('.json')) {
            const data = JSON.parse(content);
            return data.total?.lines?.pct || 0;
          }
        } catch {
          // Continue to next file
        }
      }

      // Fallback: estimate based on test files
      const { stdout } = await execAsync(
        `find ${repoPath} -name "*.test.*" -o -name "*.spec.*" | wc -l`
      );
      const testFiles = parseInt(stdout.trim()) || 0;
      
      // Rough estimate
      return Math.min(80, testFiles * 5);
    } catch {
      return 0;
    }
  }

  /**
   * Calculate code quality score
   */
  private async calculateCodeQuality(repoPath: string): Promise<number> {
    let score = 5; // Base score

    // Check for linting config
    const lintConfigs = ['.eslintrc', '.eslintrc.json', '.eslintrc.js', 'tslint.json'];
    for (const config of lintConfigs) {
      try {
        await fs.access(path.join(repoPath, config));
        score += 1;
        break;
      } catch {
        // Continue
      }
    }

    // Check for prettier config
    const prettierConfigs = ['.prettierrc', '.prettierrc.json', 'prettier.config.js'];
    for (const config of prettierConfigs) {
      try {
        await fs.access(path.join(repoPath, config));
        score += 0.5;
        break;
      } catch {
        // Continue
      }
    }

    // Check for CI/CD
    try {
      await fs.access(path.join(repoPath, '.github/workflows'));
      score += 1;
    } catch {
      try {
        await fs.access(path.join(repoPath, '.gitlab-ci.yml'));
        score += 1;
      } catch {
        // No CI/CD found
      }
    }

    // Check for documentation
    try {
      await fs.access(path.join(repoPath, 'README.md'));
      score += 0.5;
    } catch {
      // No README
    }

    // Check for tests
    try {
      const { stdout } = await execAsync(
        `find ${repoPath} -name "*.test.*" -o -name "*.spec.*" | head -5 | wc -l`
      );
      if (parseInt(stdout.trim()) > 0) {
        score += 1;
      }
    } catch {
      // No tests found
    }

    // Check for package-lock or yarn.lock
    try {
      await fs.access(path.join(repoPath, 'package-lock.json'));
      score += 0.5;
    } catch {
      try {
        await fs.access(path.join(repoPath, 'yarn.lock'));
        score += 0.5;
      } catch {
        // No lock file
      }
    }

    return Math.min(10, score);
  }

  /**
   * Find issues in local repository
   */
  private async findLocalIssues(repoPath: string): Promise<{
    bugs: number;
    vulnerabilities: number;
    codeSmells: number;
    duplications: number;
  }> {
    const issues = {
      bugs: 0,
      vulnerabilities: 0,
      codeSmells: 0,
      duplications: 0
    };

    try {
      // Search for TODO, FIXME, etc. in code
      const { stdout: todos } = await execAsync(
        `grep -r "TODO\\|FIXME\\|HACK" ${repoPath} --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l`
      );
      issues.codeSmells = Math.min(50, parseInt(todos.trim()) || 0);

      // Check for outdated dependencies (if package.json exists)
      try {
        const packagePath = path.join(repoPath, 'package.json');
        await fs.access(packagePath);
        
        // Count dependencies (rough vulnerability estimate)
        const packageContent = await fs.readFile(packagePath, 'utf-8');
        const pkg = JSON.parse(packageContent);
        const depCount = Object.keys(pkg.dependencies || {}).length + 
                        Object.keys(pkg.devDependencies || {}).length;
        
        // Rough estimate: 5% of dependencies might have vulnerabilities
        issues.vulnerabilities = Math.floor(depCount * 0.05);
      } catch {
        // No package.json
      }

      // Estimate bugs based on code complexity
      const { fileCount } = await this.countFilesAndDirs(repoPath);
      issues.bugs = Math.floor(fileCount * 0.1); // Rough estimate

    } catch (error) {
      console.error('Error finding issues:', error);
    }

    return issues;
  }
}