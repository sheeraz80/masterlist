'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stats } from '@/types';
import { BarChart3, FolderOpen, Target, Tags, TrendingUp, DollarSign } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatsCardsProps {
  stats?: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Projects',
      value: formatNumber(stats.total_projects),
      icon: FolderOpen,
      description: 'Active projects in portfolio',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Average Quality',
      value: stats.average_quality.toFixed(1),
      icon: Target,
      description: 'Quality score average',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Revenue Potential',
      value: `$${formatNumber(Math.round(stats.total_revenue_potential / 1000))}k`,
      icon: DollarSign,
      description: 'Total revenue potential',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Unique Tags',
      value: stats.unique_tags?.toString() || '0',
      icon: Tags,
      description: 'Different tags used',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-all">
              <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} rounded-full -mr-16 -mt-16 opacity-20`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">{card.value}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}