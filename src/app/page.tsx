'use client';

import { useState } from 'react';
import { StatsCards } from '@/components/stats-cards';
import { QuickActions } from '@/components/quick-actions';
import { PopularTags } from '@/components/popular-tags';
import { SystemStatus } from '@/components/system-status';
import { ProjectsChart } from '@/components/projects-chart';
import { QualityChart } from '@/components/quality-chart';
import { RecentProjects } from '@/components/recent-projects';
import { useQuery } from '@tanstack/react-query';
import { getStats, getProjects } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/connection-status';

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects({ limit: 10 }),
  });

  if (statsLoading || projectsLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-10 w-80" />
            <Skeleton className="mt-2 h-6 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-bold tracking-tight">
                AI Project Portfolio Dashboard
              </h1>
              <ConnectionStatus variant="default" />
            </div>
            <p className="text-xl opacity-90 mb-6">
              Discover high-impact AI opportunities and track portfolio performance
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/projects">
                  Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white/10 text-white border border-white/50 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                <Link href="/analytics">
                  View Analytics <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400">
                <Link href="/admin/repositories">
                  Admin: Repository Management
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Quick Actions */}
        <QuickActions projects={projectsData?.projects || []} />

        {/* Stats Cards */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Portfolio Overview
          </h2>
          <StatsCards stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ProjectsChart data={stats?.categories} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <QualityChart data={stats?.quality_distribution} />
            </motion.div>
          </div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PopularTags tags={stats?.tags || {}} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <SystemStatus />
            </motion.div>
          </div>
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RecentProjects projects={projectsData?.projects || []} />
        </motion.div>
      </motion.div>
    </div>
  );
}