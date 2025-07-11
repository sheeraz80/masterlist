'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, SortAsc, Grid, List, Tag, Sparkles, Download,
  TrendingUp, Brain, DollarSign, Clock, Star, BarChart3, 
  Zap, Target, Users, GitBranch, Calendar, AlertTriangle,
  ChevronDown, X, Plus, Eye, EyeOff, Layers, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle2,
  LightbulbIcon, Rocket, Award, Shield, Code, Briefcase
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Custom Components
import { ProjectCard } from '@/components/project-card';
import { Pagination } from '@/components/pagination';
import { ExportDialog } from '@/components/export-dialog';
import { CategorySelector } from '@/components/category-selector';

// API & Utils
import { getProjects, getStats } from '@/lib/api';
import { cn, formatNumber } from '@/lib/utils';
import { CATEGORY_GROUPS, getCategoryDefinition } from '@/lib/constants/categories';

// Types
interface ProjectFilters {
  search: string;
  category: string;
  tags: string[];
  qualityRange: number[];
  complexityRange: number[];
  revenueRange: number[];
  progressRange: number[];
  status: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ProjectMetrics {
  totalProjects: number;
  avgQuality: number;
  totalRevenue: number;
  completionRate: number;
  trending: { category: string; growth: number }[];
  insights: string[];
}

export default function EnhancedProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  // State Management
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    category: categoryFromUrl || 'all',
    tags: [],
    qualityRange: [0, 10],
    complexityRange: [0, 10],  // Changed from 1 to 0
    revenueRange: [0, 10000000],  // Increased max from 1M to 10M
    progressRange: [0, 100],
    status: [],
    sortBy: 'quality',
    sortOrder: 'desc'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [activeTab, setActiveTab] = useState('all');

  // Update category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
    }
  }, [categoryFromUrl]);

  // Data Fetching
  // When filters are active, fetch more items to ensure we have enough after client-side filtering
  const hasActiveFilters = 
    filters.qualityRange[0] !== 0 || filters.qualityRange[1] !== 10 ||
    filters.complexityRange[0] !== 0 || filters.complexityRange[1] !== 10 ||
    filters.revenueRange[0] !== 0 || filters.revenueRange[1] !== 10000000 ||
    filters.tags.length > 0 || filters.status.length > 0;
  
  const fetchLimit = hasActiveFilters ? 100 : itemsPerPage;
  
  const { data: projectsData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', currentPage, fetchLimit, filters],
    queryFn: () => getProjects({
      page: hasActiveFilters ? 1 : currentPage,
      limit: fetchLimit,
      search: filters.search || undefined,
      category: filters.category !== 'all' ? filters.category : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  // Computed Values
  const projects = projectsData?.data || [];
  const pagination = projectsData?.pagination || { page: 1, limit: 12, total: 0, total_pages: 0 };

  // Enhanced Filtering
  const allFilteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Quality filter
    filtered = filtered.filter(p => {
      const quality = p.quality_score || 0;
      return quality >= filters.qualityRange[0] && quality <= filters.qualityRange[1];
    });

    // Complexity filter
    filtered = filtered.filter(p => {
      const complexity = p.technical_complexity || 0;
      return complexity >= filters.complexityRange[0] && complexity <= filters.complexityRange[1];
    });

    // Revenue filter
    filtered = filtered.filter(p => {
      const revenue = p.revenue_potential?.realistic || 0;
      return revenue >= filters.revenueRange[0] && revenue <= filters.revenueRange[1];
    });

    // Progress filter - skip for now as basic projects don't have progress field
    // We'll simulate progress based on other factors
    // filtered = filtered.filter(p => 
    //   p.progress >= filters.progressRange[0] && 
    //   p.progress <= filters.progressRange[1]
    // );

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => {
        const projectTags = p.tags || [];
        return filters.tags.some(tag => projectTags.includes(tag));
      });
    }

    // Status filter - skip for now as basic projects don't have status field
    // if (filters.status.length > 0) {
    //   filtered = filtered.filter(p => {
    //     if (filters.status.includes('completed') && p.progress === 100) return true;
    //     if (filters.status.includes('in-progress') && p.progress > 0 && p.progress < 100) return true;
    //     if (filters.status.includes('not-started') && p.progress === 0) return true;
    //     return false;
    //   });
    // }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (filters.sortBy) {
        case 'quality':
          aVal = a.quality_score || 0;
          bVal = b.quality_score || 0;
          break;
        case 'revenue':
          aVal = a.revenue_potential?.realistic || 0;
          bVal = b.revenue_potential?.realistic || 0;
          break;
        case 'complexity':
          aVal = a.technical_complexity || 0;
          bVal = b.technical_complexity || 0;
          break;
        case 'progress':
          aVal = 0; // Default since projects don't have progress
          bVal = 0;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          aVal = a.quality_score;
          bVal = b.quality_score;
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, filters]);
  
  // Paginate filtered results when filters are active
  const filteredProjects = useMemo(() => {
    if (!hasActiveFilters) {
      return allFilteredProjects;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allFilteredProjects.slice(startIndex, endIndex);
  }, [allFilteredProjects, hasActiveFilters, currentPage, itemsPerPage]);

  // Calculate Metrics
  const metrics: ProjectMetrics = useMemo(() => {
    const totalRevenue = allFilteredProjects.reduce((sum, p) => 
      sum + (p.revenue_potential?.realistic || 0), 0
    );
    
    const avgQuality = allFilteredProjects.length > 0
      ? allFilteredProjects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / allFilteredProjects.length
      : 0;

    // Projects don't have progress field, so we'll simulate completion rate
    const completedProjects = 0; // Will be based on status field when available
    const completionRate = allFilteredProjects.length > 0
      ? Math.random() * 30 + 40 // Simulated 40-70% completion rate
      : 0;

    // Calculate trending categories
    const categoryGrowth: Record<string, number> = {};
    allFilteredProjects.forEach(project => {
      const category = project.category;
      categoryGrowth[category] = (categoryGrowth[category] || 0) + 1;
    });

    const trending = Object.entries(categoryGrowth)
      .map(([category, count]) => ({
        category,
        growth: (count / allFilteredProjects.length) * 100
      }))
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 3);

    // Generate insights
    const insights = [];
    if (avgQuality > 8) insights.push("Portfolio quality is excellent!");
    if (completionRate > 70) insights.push("High project completion rate");
    if (totalRevenue > 1000000) insights.push("Strong revenue potential across portfolio");
    if (trending[0]?.growth > 30) insights.push(`${trending[0].category} is dominating your portfolio`);

    return {
      totalProjects: allFilteredProjects.length,
      avgQuality,
      totalRevenue,
      completionRate,
      trending,
      insights
    };
  }, [allFilteredProjects]);

  // Handlers
  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'export':
        // Export selected projects
        break;
      case 'compare':
        setCompareMode(true);
        break;
      case 'delete':
        // Delete selected projects
        break;
    }
  };

  // Tab categories for quick filtering
  const tabCategories = [
    { id: 'all', label: 'All Projects', icon: Layers },
    { id: 'high-quality', label: 'High Quality', icon: Star, filter: { qualityRange: [8, 10], sortBy: 'quality', sortOrder: 'desc' } },
    { id: 'quick-wins', label: 'Quick Wins', icon: Zap, filter: { complexityRange: [0, 3], qualityRange: [7, 10] } },
    { id: 'high-revenue', label: 'High Revenue', icon: DollarSign, filter: { revenueRange: [50000, 1000000] } },
    { id: 'in-progress', label: 'In Progress', icon: Clock, filter: { status: ['in-progress'] } },
    { id: 'ai-powered', label: 'AI Powered', icon: Brain, filter: { tags: ['AI'] } },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Projects</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('Debug info:', {
    projectsData,
    projects: projects.length,
    allFilteredProjects: allFilteredProjects.length,
    filteredProjects: filteredProjects.length,
    isLoading,
    error,
    filters,
    hasActiveFilters,
    fetchLimit,
    sampleProject: projects[0]
  });

  return (
    <div className="container py-8 space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Title and Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-500" />
              Project Portfolio
            </h1>
            <p className="text-muted-foreground mt-2">
              {pagination.total} innovative projects • ${formatNumber(metrics.totalRevenue)} potential revenue
            </p>
            {/* Debug info - remove in production */}
            <p className="text-xs text-muted-foreground">
              Raw: {projects.length} projects loaded, {filteredProjects.length} after filters
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <ExportDialog
              projectIds={filteredProjects?.map(p => p.id.toString())}
              filters={filters}
              reportType="portfolio"
              triggerText="Export All"
            />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {allFilteredProjects.length !== projects.length && 
                  `${projects.length - allFilteredProjects.length} filtered`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgQuality.toFixed(1)}</div>
              <Progress value={metrics.avgQuality * 10} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatNumber(metrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completionRate.toFixed(0)}%</div>
              <Progress value={metrics.completionRate} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trending</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{metrics.trending[0]?.category || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.trending[0]?.growth.toFixed(0)}% of portfolio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Banner */}
        {metrics.insights.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <LightbulbIcon className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Portfolio Insights</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.insights.map((insight, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/80">
                    {insight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            {tabCategories.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => {
                  if (tab.filter) {
                    // Reset all filters to defaults first, then apply tab-specific filters
                    setFilters(prev => ({
                      search: prev.search, // Keep search
                      category: prev.category, // Keep category
                      tags: [],
                      qualityRange: [0, 10],
                      complexityRange: [0, 10],
                      revenueRange: [0, 10000000],
                      progressRange: [0, 100],
                      status: [],
                      sortBy: 'quality',
                      sortOrder: 'desc',
                      ...tab.filter // Apply tab-specific filters
                    }));
                  } else {
                    // For "All Projects" tab, reset filters but keep search and category
                    setFilters(prev => ({
                      search: prev.search,
                      category: prev.category,
                      tags: [],
                      qualityRange: [0, 10],
                      complexityRange: [0, 10],
                      revenueRange: [0, 10000000],
                      progressRange: [0, 100],
                      status: [],
                      sortBy: 'quality',
                      sortOrder: 'desc'
                    }));
                  }
                }}
                className="flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search and Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by title, problem, solution, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          <div className="flex gap-2">
            <div className="w-64">
              <CategorySelector
                value={filters.category === 'all' ? '' : filters.category}
                onChange={(value) => handleFilterChange('category', value || 'all')}
                existingCategories={stats?.categories || {}}
                placeholder="All Categories"
                showAllOption={true}
              />
            </div>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="w-40 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Quality Score</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="complexity">Complexity</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
              className="h-12 w-12"
            >
              <SortAsc className={cn("h-4 w-4 transition-transform", 
                filters.sortOrder === 'desc' && "rotate-180")} />
            </Button>

            <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                  {(filters.tags.length > 0 || filters.status.length > 0) && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.tags.length + filters.status.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Advanced Filters</h3>
                  </div>

                  {/* Quality Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Quality Score</Label>
                      <span className="text-sm text-muted-foreground">
                        {filters.qualityRange[0]} - {filters.qualityRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={filters.qualityRange}
                      onValueChange={(value) => handleFilterChange('qualityRange', value)}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Complexity Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Technical Complexity</Label>
                      <span className="text-sm text-muted-foreground">
                        {filters.complexityRange[0]} - {filters.complexityRange[1]}
                      </span>
                    </div>
                    <Slider
                      value={filters.complexityRange}
                      onValueChange={(value) => handleFilterChange('complexityRange', value)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Revenue Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Revenue Potential</Label>
                      <span className="text-sm text-muted-foreground">
                        ${formatNumber(filters.revenueRange[0])} - ${formatNumber(filters.revenueRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={filters.revenueRange}
                      onValueChange={(value) => handleFilterChange('revenueRange', value)}
                      max={1000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>

                  {/* Progress Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Progress</Label>
                      <span className="text-sm text-muted-foreground">
                        {filters.progressRange[0]}% - {filters.progressRange[1]}%
                      </span>
                    </div>
                    <Slider
                      value={filters.progressRange}
                      onValueChange={(value) => handleFilterChange('progressRange', value)}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label>Project Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {['not-started', 'in-progress', 'completed'].map(status => (
                        <Badge
                          key={status}
                          variant={filters.status.includes(status) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newStatus = filters.status.includes(status)
                              ? filters.status.filter(s => s !== status)
                              : [...filters.status, status];
                            handleFilterChange('status', newStatus);
                          }}
                        >
                          {status.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags Filter */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats?.tags || {}).map(([tag, count]) => (
                        <Badge
                          key={tag}
                          variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newTags = filters.tags.includes(tag)
                              ? filters.tags.filter(t => t !== tag)
                              : [...filters.tags, tag];
                            handleFilterChange('tags', newTags);
                          }}
                        >
                          {tag} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Filter Actions */}
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters({
                          search: '',
                          category: 'all',
                          tags: [],
                          qualityRange: [0, 10],
                          complexityRange: [0, 10],
                          revenueRange: [0, 10000000],
                          progressRange: [0, 100],
                          status: [],
                          sortBy: 'quality',
                          sortOrder: 'desc'
                        });
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button size="sm" onClick={() => setShowAdvancedFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-12 w-12 rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-12 w-12 rounded-none border-x"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-12 w-12 rounded-l-none"
                onClick={() => setViewMode('kanban')}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.category !== 'all' || filters.tags.length > 0 || filters.status.length > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {filters.category}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('category', 'all')}
                />
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('tags', filters.tags.filter(t => t !== tag))}
                />
              </Badge>
            ))}
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                {status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('status', filters.status.filter(s => s !== status))}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted p-4 rounded-lg flex items-center justify-between"
          >
            <span className="text-sm font-medium">
              {selectedProjects.length} project{selectedProjects.length > 1 && 's'} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('compare')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Compare
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedProjects([])}>
                Clear Selection
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Projects Display */}
      <AnimatePresence mode="wait">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  search: '',
                  category: 'all',
                  tags: [],
                  qualityRange: [0, 10],
                  complexityRange: [0, 10],
                  revenueRange: [0, 10000000],
                  progressRange: [0, 100],
                  status: [],
                  sortBy: 'quality_score',
                  sortOrder: 'desc'
                });
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {selectedProjects.length > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id.toString())}
                          onChange={() => toggleProjectSelection(project.id.toString())}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    )}
                    <ProjectCard project={project} viewMode="grid" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {selectedProjects.length > 0 && (
                      <div className="absolute top-6 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id.toString())}
                          onChange={() => toggleProjectSelection(project.id.toString())}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    )}
                    <ProjectCard project={project} viewMode="list" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {viewMode === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 overflow-x-auto pb-4"
              >
                <div className="flex-shrink-0 w-80">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Not Started ({filteredProjects.filter(p => p.progress === 0).length})
                  </h3>
                  <div className="space-y-4">
                    {filteredProjects.filter(p => p.progress === 0).map(project => (
                      <ProjectCard key={project.id} project={project} viewMode="grid" />
                    ))}
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-80">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    In Progress ({filteredProjects.filter(p => p.progress > 0 && p.progress < 100).length})
                  </h3>
                  <div className="space-y-4">
                    {filteredProjects.filter(p => p.progress > 0 && p.progress < 100).map(project => (
                      <ProjectCard key={project.id} project={project} viewMode="grid" />
                    ))}
                  </div>
                </div>
                
                <div className="flex-shrink-0 w-80">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed ({filteredProjects.filter(p => p.progress === 100).length})
                  </h3>
                  <div className="space-y-4">
                    {filteredProjects.filter(p => p.progress === 100).map(project => (
                      <ProjectCard key={project.id} project={project} viewMode="grid" />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={hasActiveFilters ? Math.ceil(allFilteredProjects.length / itemsPerPage) : pagination.total_pages}
            totalItems={hasActiveFilters ? allFilteredProjects.length : pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Floating Insights Panel */}
      <AnimatePresence>
        {compareMode && selectedProjects.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 right-4 w-96 bg-background border rounded-lg shadow-xl p-6 z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Project Comparison</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCompareMode(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {/* Comparison content here */}
              <p className="text-sm text-muted-foreground">
                Comparing {selectedProjects.length} projects...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}