'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Zap, Shield, Clock, Target, Lightbulb, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { DeploymentStatsResponse } from '@/types/deployment';

interface DeploymentInsightsProps {
  stats: DeploymentStatsResponse;
  deployments: any[];
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  category: 'performance' | 'reliability' | 'cost' | 'security' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metrics?: Record<string, string | number>;
  recommendations: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export function DeploymentInsights({ stats, deployments }: DeploymentInsightsProps) {
  const insights = useMemo<Insight[]>(() => {
    const results: Insight[] = [];

    // Uptime Analysis
    if (stats.healthMetrics.averageUptime < 99.5) {
      results.push({
        id: 'uptime-improvement',
        type: 'warning',
        category: 'reliability',
        title: 'Uptime Below Industry Standard',
        description: `Your average uptime of ${stats.healthMetrics.averageUptime.toFixed(2)}% is below the industry standard of 99.9%.`,
        impact: 'high',
        metrics: {
          'Current Uptime': `${stats.healthMetrics.averageUptime.toFixed(2)}%`,
          'Target Uptime': '99.9%',
          'Monthly Downtime': `${((100 - stats.healthMetrics.averageUptime) * 43.2).toFixed(0)} minutes`
        },
        recommendations: [
          'Implement health checks and auto-recovery mechanisms',
          'Use multi-region deployments for critical services',
          'Set up automated rollback on deployment failures',
          'Configure proper monitoring and alerting'
        ],
        icon: Shield
      });
    } else {
      results.push({
        id: 'uptime-excellent',
        type: 'success',
        category: 'reliability',
        title: 'Excellent Uptime Performance',
        description: `Your uptime of ${stats.healthMetrics.averageUptime.toFixed(2)}% exceeds industry standards.`,
        impact: 'low',
        metrics: {
          'Current Uptime': `${stats.healthMetrics.averageUptime.toFixed(2)}%`,
          'Industry Standard': '99.9%'
        },
        recommendations: [
          'Continue monitoring uptime metrics',
          'Document current best practices',
          'Consider sharing success strategies with team'
        ],
        icon: CheckCircle
      });
    }

    // Response Time Analysis
    if (stats.healthMetrics.averageResponseTime > 200) {
      results.push({
        id: 'response-time-high',
        type: 'warning',
        category: 'performance',
        title: 'High Average Response Time',
        description: `Average response time of ${Math.round(stats.healthMetrics.averageResponseTime)}ms may impact user experience.`,
        impact: 'high',
        metrics: {
          'Current Response': `${Math.round(stats.healthMetrics.averageResponseTime)}ms`,
          'Recommended': '<200ms',
          'Impact': 'User satisfaction decrease'
        },
        recommendations: [
          'Implement CDN for static assets',
          'Enable compression and caching',
          'Optimize database queries and API calls',
          'Consider edge deployments for global users'
        ],
        icon: Zap
      });
    }

    // Incident Management
    const unresolvedIncidents = stats.healthMetrics.totalIncidents - stats.healthMetrics.resolvedIncidents;
    if (unresolvedIncidents > 0) {
      results.push({
        id: 'unresolved-incidents',
        type: 'error',
        category: 'reliability',
        title: 'Unresolved Incidents Require Attention',
        description: `${unresolvedIncidents} incidents are currently unresolved and may be affecting service quality.`,
        impact: 'high',
        metrics: {
          'Unresolved': unresolvedIncidents,
          'Total Incidents': stats.healthMetrics.totalIncidents,
          'Resolution Rate': `${((stats.healthMetrics.resolvedIncidents / stats.healthMetrics.totalIncidents) * 100).toFixed(1)}%`
        },
        recommendations: [
          'Prioritize critical incidents for immediate resolution',
          'Implement automated incident response workflows',
          'Review incident patterns for root cause analysis',
          'Establish SLAs for incident resolution'
        ],
        icon: AlertCircle
      });
    }

    // Platform Diversification
    const platformCount = Object.keys(stats.platformDistribution).length;
    if (platformCount === 1) {
      results.push({
        id: 'single-platform-risk',
        type: 'warning',
        category: 'reliability',
        title: 'Single Platform Dependency Risk',
        description: 'Relying on a single deployment platform creates a single point of failure.',
        impact: 'medium',
        metrics: {
          'Platforms Used': platformCount,
          'Recommended': '2-3 platforms'
        },
        recommendations: [
          'Consider multi-platform deployment strategy',
          'Evaluate platform-specific risks and limitations',
          'Implement platform-agnostic deployment pipelines',
          'Test disaster recovery across platforms'
        ],
        icon: AlertCircle
      });
    }

    // Deployment Frequency
    const dailyDeployments = stats.totalDeployments / 30;
    if (dailyDeployments < 1) {
      results.push({
        id: 'low-deployment-frequency',
        type: 'info',
        category: 'optimization',
        title: 'Low Deployment Frequency',
        description: 'Infrequent deployments may lead to larger, riskier releases.',
        impact: 'medium',
        metrics: {
          'Daily Average': dailyDeployments.toFixed(1),
          'Recommended': '>1 per day'
        },
        recommendations: [
          'Implement continuous deployment practices',
          'Break down large features into smaller releases',
          'Automate deployment pipelines',
          'Use feature flags for gradual rollouts'
        ],
        icon: Clock
      });
    }

    // Environment Distribution
    const prodPercentage = (stats.environmentDistribution.production / stats.totalDeployments) * 100;
    if (prodPercentage > 50) {
      results.push({
        id: 'production-heavy',
        type: 'warning',
        category: 'optimization',
        title: 'High Production Deployment Ratio',
        description: 'Most deployments are going directly to production, which may increase risk.',
        impact: 'medium',
        metrics: {
          'Production %': `${prodPercentage.toFixed(1)}%`,
          'Non-prod %': `${(100 - prodPercentage).toFixed(1)}%`
        },
        recommendations: [
          'Increase use of staging environments',
          'Implement proper testing in lower environments',
          'Use preview deployments for feature validation',
          'Establish environment promotion workflows'
        ],
        icon: Target
      });
    }

    // Success Rate Analysis
    const recentDeployments = deployments.slice(0, 100);
    const successCount = recentDeployments.filter(d => d.status === 'READY').length;
    const successRate = recentDeployments.length > 0 ? (successCount / recentDeployments.length) * 100 : 0;
    
    if (successRate < 95) {
      results.push({
        id: 'low-success-rate',
        type: 'error',
        category: 'reliability',
        title: 'Deployment Success Rate Below Target',
        description: `Only ${successRate.toFixed(1)}% of recent deployments succeeded.`,
        impact: 'high',
        metrics: {
          'Success Rate': `${successRate.toFixed(1)}%`,
          'Failed Deployments': recentDeployments.length - successCount,
          'Target Rate': '95%'
        },
        recommendations: [
          'Analyze common failure patterns',
          'Improve pre-deployment testing',
          'Implement deployment validation checks',
          'Review and optimize build configurations'
        ],
        icon: TrendingDown
      });
    }

    return results.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }, [stats, deployments]);

  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getTypeIcon = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
    }
  };

  const getCategoryBadgeVariant = (category: Insight['category']) => {
    switch (category) {
      case 'performance':
        return 'default';
      case 'reliability':
        return 'destructive';
      case 'cost':
        return 'secondary';
      case 'security':
        return 'outline';
      case 'optimization':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Deployment Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <span>{insights.length} insights generated</span>
            <Badge variant="destructive">
              {insights.filter(i => i.impact === 'high').length} high priority
            </Badge>
            <Badge variant="secondary">
              {insights.filter(i => i.impact === 'medium').length} medium priority
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-2 ${getTypeColor(insight.type)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${getTypeIcon(insight.type)}`} />
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getCategoryBadgeVariant(insight.category)}>
                            {insight.category}
                          </Badge>
                          <Badge variant="outline">
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  
                  {insight.metrics && (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                      {Object.entries(insight.metrics).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-muted-foreground">{key}</p>
                          <p className="font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Recommendations:</p>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}