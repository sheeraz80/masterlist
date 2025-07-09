'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';
import { 
  TrendingUp, 
  Zap, 
  Trophy, 
  DollarSign,
  Brain,
  Rocket,
  Target,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

interface QuickActionsProps {
  projects: Project[];
}

export function QuickActions({ projects }: QuickActionsProps) {
  // Calculate quick win projects (low complexity, high quality)
  const quickWins = projects
    .filter(p => p.technical_complexity <= 3 && p.quality_score >= 7)
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 5);

  // High revenue AI projects
  const highRevenueAI = projects
    .filter(p => p.tags?.includes('AI') && p.revenue_potential.realistic >= 30000)
    .sort((a, b) => b.revenue_potential.realistic - a.revenue_potential.realistic)
    .slice(0, 5);

  // Top rated projects
  const topRated = projects
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 5);

  const actionCards = [
    {
      title: 'High Revenue AI Projects',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      count: highRevenueAI.length,
      value: `$${formatNumber(highRevenueAI.reduce((sum, p) => sum + p.revenue_potential.realistic, 0))}`,
      label: 'Total Revenue Potential',
      link: '/search?tags=AI&min_revenue=30000',
      projects: highRevenueAI
    },
    {
      title: 'Quick Win Projects',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      count: quickWins.length,
      value: `${quickWins[0]?.technical_complexity || 0}/10`,
      label: 'Avg Complexity',
      link: '/search?max_complexity=3&min_quality=7',
      projects: quickWins
    },
    {
      title: 'Top Rated Projects',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      count: topRated.length,
      value: `${topRated[0]?.quality_score || 0}/10`,
      label: 'Highest Score',
      link: '/search?sort_by=quality_score&sort_order=desc',
      projects: topRated
    },
    {
      title: 'Latest Opportunities',
      icon: Rocket,
      color: 'from-blue-500 to-cyan-500',
      count: projects.slice(0, 5).length,
      value: 'New',
      label: 'This Week',
      link: '/projects',
      projects: projects.slice(0, 5)
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Quick Actions</h2>
        <p className="text-muted-foreground">Jump to high-impact projects and opportunities</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actionCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={card.link}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{card.title}</span>
                      <Icon className={`h-5 w-5 bg-gradient-to-br ${card.color} bg-clip-text text-transparent`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold">{card.count}</span>
                        <span className="text-sm text-muted-foreground">projects</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-2xl font-semibold">{card.value}</div>
                        <div className="text-sm text-muted-foreground">{card.label}</div>
                      </div>
                      <div className="pt-2">
                        <div className="text-xs text-muted-foreground mb-2">Featured:</div>
                        <div className="space-y-1">
                          {card.projects.slice(0, 2).map(project => (
                            <div key={project.id} className="text-xs truncate">
                              • {project.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}