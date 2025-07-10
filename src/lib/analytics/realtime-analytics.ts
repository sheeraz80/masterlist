import { EventEmitter } from 'events';

interface MetricUpdate {
  metric: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  type: 'anomaly' | 'threshold' | 'trend';
  severity: 'low' | 'medium' | 'high';
  metric: string;
  message: string;
  value: number;
  threshold?: number;
  timestamp: Date;
}

// Local real-time analytics engine
export class RealtimeAnalyticsEngine extends EventEmitter {
  private metrics: Map<string, number[]> = new Map();
  private alerts: Alert[] = [];
  private thresholds: Map<string, { min?: number; max?: number }> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupDefaultThresholds();
  }

  private setupDefaultThresholds() {
    this.thresholds.set('project_quality', { min: 4, max: 10 });
    this.thresholds.set('revenue_per_project', { min: 10000 });
    this.thresholds.set('user_activity', { min: 5 });
    this.thresholds.set('project_completion_rate', { min: 0.6, max: 1 });
  }

  // Update metric and check for anomalies/thresholds
  updateMetric(update: MetricUpdate) {
    const { metric, value } = update;
    
    // Store metric history
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    
    const history = this.metrics.get(metric)!;
    history.push(value);
    
    // Keep only last 100 values
    if (history.length > 100) {
      history.shift();
    }

    // Check thresholds
    this.checkThresholds(metric, value);
    
    // Check for anomalies if enough history
    if (history.length > 10) {
      this.checkAnomalies(metric, value, history);
    }

    // Check for trends
    if (history.length > 20) {
      this.checkTrends(metric, history);
    }

    // Emit update event
    this.emit('metric-update', update);
  }

  private checkThresholds(metric: string, value: number) {
    const threshold = this.thresholds.get(metric);
    if (!threshold) return;

    if (threshold.min !== undefined && value < threshold.min) {
      this.createAlert({
        type: 'threshold',
        severity: 'high',
        metric,
        message: `${metric} is below minimum threshold`,
        value,
        threshold: threshold.min
      });
    }

    if (threshold.max !== undefined && value > threshold.max) {
      this.createAlert({
        type: 'threshold',
        severity: 'medium',
        metric,
        message: `${metric} exceeded maximum threshold`,
        value,
        threshold: threshold.max
      });
    }
  }

  private checkAnomalies(metric: string, value: number, history: number[]) {
    const mean = history.reduce((a, b) => a + b) / history.length;
    const variance = history.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / history.length;
    const std = Math.sqrt(variance);

    const zScore = Math.abs((value - mean) / std);

    if (zScore > 3) {
      this.createAlert({
        type: 'anomaly',
        severity: 'high',
        metric,
        message: `Anomaly detected in ${metric}`,
        value
      });
    } else if (zScore > 2) {
      this.createAlert({
        type: 'anomaly',
        severity: 'medium',
        metric,
        message: `Potential anomaly in ${metric}`,
        value
      });
    }
  }

  private checkTrends(metric: string, history: number[]) {
    // Simple trend detection using linear regression
    const n = history.length;
    const xSum = (n * (n - 1)) / 2;
    const xSqSum = (n * (n - 1) * (2 * n - 1)) / 6;
    const ySum = history.reduce((a, b) => a + b);
    const xySum = history.reduce((sum, y, x) => sum + x * y, 0);

    const slope = (n * xySum - xSum * ySum) / (n * xSqSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    // Check if trend is significant
    const avgValue = ySum / n;
    const trendMagnitude = Math.abs(slope * n) / avgValue;

    if (trendMagnitude > 0.2) {
      this.createAlert({
        type: 'trend',
        severity: slope > 0 ? 'low' : 'medium',
        metric,
        message: `${slope > 0 ? 'Upward' : 'Downward'} trend detected in ${metric}`,
        value: history[history.length - 1]
      });
    }
  }

  private createAlert(alertData: Omit<Alert, 'id' | 'timestamp'>) {
    const alert: Alert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }

    this.emit('alert', alert);
  }

  getAlerts(since?: Date): Alert[] {
    if (!since) return this.alerts;
    return this.alerts.filter(alert => alert.timestamp > since);
  }

  getMetricHistory(metric: string): number[] {
    return this.metrics.get(metric) || [];
  }

  setThreshold(metric: string, min?: number, max?: number) {
    this.thresholds.set(metric, { min, max });
  }

  // Start monitoring with periodic updates
  startMonitoring(updateFn: () => Promise<MetricUpdate[]>, intervalMs: number = 60000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    const runUpdate = async () => {
      try {
        const updates = await updateFn();
        updates.forEach(update => this.updateMetric(update));
      } catch (error) {
        console.error('Error updating metrics:', error);
      }
    };

    // Run immediately
    runUpdate();

    // Then run periodically
    this.updateInterval = setInterval(runUpdate, intervalMs);
  }

  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Comparative Analytics Engine
export class ComparativeAnalytics {
  compareProjects(projects: any[]): {
    bestPerformers: any[];
    underperformers: any[];
    recommendations: string[];
  } {
    // Sort by composite score
    const scored = projects.map(project => ({
      ...project,
      score: this.calculateCompositeScore(project)
    })).sort((a, b) => b.score - a.score);

    const avgScore = scored.reduce((sum, p) => sum + p.score, 0) / scored.length;

    return {
      bestPerformers: scored.filter(p => p.score > avgScore * 1.2).slice(0, 10),
      underperformers: scored.filter(p => p.score < avgScore * 0.8).slice(0, 10),
      recommendations: this.generateRecommendations(scored, avgScore)
    };
  }

  private calculateCompositeScore(project: any): number {
    const qualityWeight = 0.3;
    const revenueWeight = 0.25;
    const activityWeight = 0.2;
    const complexityWeight = -0.15;
    const competitionWeight = -0.1;

    const normalizedRevenue = Math.min(project.revenue_potential / 1000000, 1);
    const normalizedActivity = Math.min(project.activities_count / 100, 1);
    const normalizedQuality = (project.quality_score || 0) / 10;
    const normalizedComplexity = (project.technical_complexity || 5) / 10;
    const normalizedCompetition = (project.competition_level || 2) / 4;

    return (
      normalizedQuality * qualityWeight +
      normalizedRevenue * revenueWeight +
      normalizedActivity * activityWeight +
      normalizedComplexity * complexityWeight +
      normalizedCompetition * competitionWeight
    );
  }

  private generateRecommendations(scoredProjects: any[], avgScore: number): string[] {
    const recommendations: string[] = [];

    // Category analysis
    const categoryScores = new Map<string, number[]>();
    scoredProjects.forEach(p => {
      if (!categoryScores.has(p.category)) {
        categoryScores.set(p.category, []);
      }
      categoryScores.get(p.category)!.push(p.score);
    });

    // Find best performing categories
    const categoryAvgs = Array.from(categoryScores.entries())
      .map(([category, scores]) => ({
        category,
        avg: scores.reduce((a, b) => a + b) / scores.length
      }))
      .sort((a, b) => b.avg - a.avg);

    if (categoryAvgs.length > 0) {
      recommendations.push(
        `Focus on ${categoryAvgs[0].category} projects - they show ${Math.round((categoryAvgs[0].avg / avgScore - 1) * 100)}% better performance`
      );
    }

    // Quality vs Revenue analysis
    const highQualityLowRevenue = scoredProjects.filter(p => 
      p.quality_score > 7 && p.revenue_potential < 50000
    );

    if (highQualityLowRevenue.length > 5) {
      recommendations.push(
        `${highQualityLowRevenue.length} high-quality projects have low revenue potential - consider repricing or repositioning`
      );
    }

    // Complexity analysis
    const complexProjects = scoredProjects.filter(p => p.technical_complexity > 7);
    const avgComplexScore = complexProjects.reduce((sum, p) => sum + p.score, 0) / complexProjects.length;

    if (avgComplexScore < avgScore * 0.9) {
      recommendations.push(
        'Complex projects underperform by 10%+ - consider simplifying or increasing revenue targets'
      );
    }

    return recommendations;
  }

  generateBenchmarks(projects: any[]): Map<string, { min: number; avg: number; max: number; target: number }> {
    const benchmarks = new Map();
    
    const metrics = ['quality_score', 'revenue_potential', 'technical_complexity', 'activities_count'];
    
    metrics.forEach(metric => {
      const values = projects.map(p => p[metric] || 0).filter(v => v > 0);
      if (values.length === 0) return;
      
      values.sort((a, b) => a - b);
      
      benchmarks.set(metric, {
        min: values[0],
        avg: values.reduce((a, b) => a + b) / values.length,
        max: values[values.length - 1],
        target: values[Math.floor(values.length * 0.75)] // 75th percentile
      });
    });
    
    return benchmarks;
  }
}