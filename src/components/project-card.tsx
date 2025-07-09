'use client';

import { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  DollarSign, 
  Clock, 
  Users, 
  Brain,
  Zap,
  Target,
  TrendingUp,
  Code,
  BarChart3,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  viewMode?: 'grid' | 'list';
}

export function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
  const getCategoryGradient = (category: string) => {
    const gradients = {
      'AI Browser Tools': 'from-purple-500 to-pink-500',
      'AI Productivity Tools': 'from-blue-500 to-cyan-500',
      'Crypto Browser Tools': 'from-orange-500 to-red-500',
      'Chrome Extension': 'from-green-500 to-emerald-500',
      'Figma Plugin': 'from-indigo-500 to-purple-500',
      'VSCode Extension': 'from-yellow-500 to-orange-500',
      'Obsidian Plugin': 'from-teal-500 to-green-500',
      'Notion Templates': 'from-pink-500 to-rose-500',
    };
    return gradients[category] || 'from-gray-500 to-gray-600';
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const gradient = getCategoryGradient(project.category);
  const qualityColor = getQualityColor(project.quality_score);
  const hasAI = project.tags?.includes('AI');
  const isQuickWin = project.technical_complexity <= 3 && project.quality_score >= 7;
  const isHighRevenue = project.revenue_potential.realistic >= 30000;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-xl transition-all duration-300 group overflow-hidden">
        <div className="flex">
          <div className={`w-2 bg-gradient-to-b ${gradient}`} />
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <h3 className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex gap-2 flex-shrink-0">
                    {hasAI && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        <Brain className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                    {isQuickWin && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Zap className="h-3 w-3 mr-1" />
                        Quick Win
                      </Badge>
                    )}
                    {isHighRevenue && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        High Revenue
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground line-clamp-2 mb-4">{project.problem}</p>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{project.quality_score}/10</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="font-medium">${formatNumber(project.revenue_potential.realistic)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Code className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{project.technical_complexity}/10</span>
                  </div>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className={cn("px-3 py-1 rounded-full text-sm font-medium", qualityColor)}>
                  Quality: {project.quality_score}
                </div>
                <Button asChild>
                  <Link href={`/projects/${project.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
            
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                {project.tags.slice(0, 6).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.tags.length - 6} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
        {/* Gradient Header */}
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />
        
        {/* Special Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {hasAI && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-purple-500 text-white p-2 rounded-lg shadow-lg"
            >
              <Brain className="h-4 w-4" />
            </motion.div>
          )}
          {isQuickWin && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-green-500 text-white p-2 rounded-lg shadow-lg"
            >
              <Zap className="h-4 w-4" />
            </motion.div>
          )}
          {isHighRevenue && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-500 text-white p-2 rounded-lg shadow-lg"
            >
              <TrendingUp className="h-4 w-4" />
            </motion.div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="pr-12">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {project.category}
              </Badge>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", qualityColor)}>
                Quality: {project.quality_score}
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-3">
            {project.problem}
          </CardDescription>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <DollarSign className="h-3 w-3" />
                Revenue
              </div>
              <div className="font-semibold text-sm">
                ${formatNumber(project.revenue_potential.realistic)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Code className="h-3 w-3" />
                Complexity
              </div>
              <div className="font-semibold text-sm">
                {project.technical_complexity}/10
              </div>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <Button asChild className="w-full group">
            <Link href={`/projects/${project.id}`}>
              View Details
              <Sparkles className="ml-2 h-4 w-4 group-hover:animate-pulse" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}