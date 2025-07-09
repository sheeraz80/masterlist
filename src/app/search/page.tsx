'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConnectionStatus } from '@/components/connection-status';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Project } from '@/types';
import { 
  Search, 
  Filter, 
  Star, 
  DollarSign, 
  Clock, 
  Users, 
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchFilters {
  q: string;
  category: string;
  platform: string;
  min_quality: number;
  max_quality: number;
  min_revenue: number;
  max_revenue: number;
  min_complexity: number;
  max_complexity: number;
  competition_level: string;
  development_time: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

async function searchProjects(filters: SearchFilters, offset: number = 0, limit: number = 20) {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== 'all' && value !== undefined) {
      searchParams.set(key, value.toString());
    }
  });
  
  searchParams.set('offset', offset.toString());
  searchParams.set('limit', limit.toString());

  const response = await fetch(`/api/search?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to search projects');
  return response.json();
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    category: 'all',
    platform: 'all',
    min_quality: 0,
    max_quality: 10,
    min_revenue: 0,
    max_revenue: 50000,
    min_complexity: 1,
    max_complexity: 10,
    competition_level: 'all',
    development_time: 'all',
    sort_by: 'quality_score',
    sort_order: 'desc',
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const limit = 12;

  const debouncedFilters = useDebounce(filters, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', debouncedFilters, currentPage],
    queryFn: () => searchProjects(debouncedFilters, currentPage * limit, limit),
  });

  const projects = data?.projects || [];
  const total = data?.total || 0;
  const hasMore = data?.has_more || false;
  const searchStats = data?.search_stats;

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page when filters change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      q: '',
      category: 'all',
      platform: 'all',
      min_quality: 0,
      max_quality: 10,
      min_revenue: 0,
      max_revenue: 50000,
      min_complexity: 1,
      max_complexity: 10,
      competition_level: 'all',
      development_time: 'all',
      sort_by: 'quality_score',
      sort_order: 'desc',
    });
    setCurrentPage(0);
  }, []);

  const categories = useMemo(() => [
    'all',
    'Figma Plugin',
    'Chrome Browser Extensions',
    'VSCode Extension',
    'AI-Powered Browser Tools',
    'Notion Templates & Widgets',
    'Obsidian Plugin',
    'Crypto/Blockchain Browser Tools',
    'AI-Powered Productivity Automation Tools',
    'Zapier AI Automation Apps',
    'Jasper Canvas & AI Studio'
  ], []);

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Advanced Search</h1>
            <p className="text-muted-foreground">
              Find the perfect project ideas with powerful filtering and search capabilities
            </p>
          </div>
          <ConnectionStatus />
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search projects..."
                      value={filters.q}
                      onChange={(e) => updateFilter('q', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={filters.sort_by} onValueChange={(value) => updateFilter('sort_by', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quality_score">Quality Score</SelectItem>
                      <SelectItem value="revenue_potential">Revenue Potential</SelectItem>
                      <SelectItem value="technical_complexity">Technical Complexity</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.sort_order} onValueChange={(value) => updateFilter('sort_order', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full"
                >
                  {showAdvancedFilters ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Advanced
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Show Advanced
                    </>
                  )}
                </Button>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <>
                    <Separator />
                    
                    {/* Quality Score Range */}
                    <div className="space-y-2">
                      <Label>Quality Score: {filters.min_quality} - {filters.max_quality}</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[filters.min_quality]}
                          onValueChange={([value]) => updateFilter('min_quality', value)}
                          min={0}
                          max={10}
                          step={0.1}
                          className="w-full"
                        />
                        <Slider
                          value={[filters.max_quality]}
                          onValueChange={([value]) => updateFilter('max_quality', value)}
                          min={0}
                          max={10}
                          step={0.1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Revenue Range */}
                    <div className="space-y-2">
                      <Label>Revenue Potential: ${filters.min_revenue} - ${filters.max_revenue}</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[filters.min_revenue]}
                          onValueChange={([value]) => updateFilter('min_revenue', value)}
                          min={0}
                          max={50000}
                          step={500}
                          className="w-full"
                        />
                        <Slider
                          value={[filters.max_revenue]}
                          onValueChange={([value]) => updateFilter('max_revenue', value)}
                          min={0}
                          max={50000}
                          step={500}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Technical Complexity */}
                    <div className="space-y-2">
                      <Label>Technical Complexity: {filters.min_complexity} - {filters.max_complexity}</Label>
                      <div className="space-y-2">
                        <Slider
                          value={[filters.min_complexity]}
                          onValueChange={([value]) => updateFilter('min_complexity', value)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                        <Slider
                          value={[filters.max_complexity]}
                          onValueChange={([value]) => updateFilter('max_complexity', value)}
                          min={1}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Competition Level */}
                    <div className="space-y-2">
                      <Label>Competition Level</Label>
                      <Select value={filters.competition_level} onValueChange={(value) => updateFilter('competition_level', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="low">Low Competition</SelectItem>
                          <SelectItem value="medium">Medium Competition</SelectItem>
                          <SelectItem value="high">High Competition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Development Time */}
                    <div className="space-y-2">
                      <Label>Development Time</Label>
                      <Select value={filters.development_time} onValueChange={(value) => updateFilter('development_time', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Duration</SelectItem>
                          <SelectItem value="fast">Fast (Days/Weeks)</SelectItem>
                          <SelectItem value="medium">Medium (Months)</SelectItem>
                          <SelectItem value="slow">Slow (6+ Months)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Reset Filters */}
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Reset Filters
                </Button>
              </CardContent>
            </Card>

            {/* Search Stats */}
            {searchStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Search Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-2xl font-bold">{searchStats.total_results}</div>
                  <div className="text-sm text-muted-foreground">
                    projects found
                  </div>
                  
                  {searchStats.revenue_stats && (
                    <div className="space-y-2">
                      <Label>Revenue Range</Label>
                      <div className="text-sm">
                        ${searchStats.revenue_stats.min?.toLocaleString()} - ${searchStats.revenue_stats.max?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg: ${Math.round(searchStats.revenue_stats.average)?.toLocaleString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Search Results</h2>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Searching...' : `${total} projects found`}
                </p>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full mb-4" />
                      <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Failed to search projects</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria</p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project: Project) => (
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-2 text-sm">{project.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">{project.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-semibold">{project.quality_score}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="line-clamp-3 text-xs">
                        {project.problem}
                      </CardDescription>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-green-500" />
                          <span>${project.revenue_potential?.realistic?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-blue-500" />
                          <span>{project.technical_complexity}/10</span>
                        </div>
                      </div>

                      <Button asChild size="sm" className="w-full">
                        <Link href={`/projects/${project.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && projects.length > 0 && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 py-2">
                  Page {currentPage + 1} of {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}