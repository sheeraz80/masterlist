'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjects, getStats } from '@/lib/api';
import { ProjectCard } from '@/components/project-card';
import { Pagination } from '@/components/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, SortAsc, Grid, List, Tag, Sparkles, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ExportDialog } from '@/components/export-dialog';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('quality_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [qualityRange, setQualityRange] = useState([0, 10]);
  const [complexityRange, setComplexityRange] = useState([1, 10]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', currentPage, itemsPerPage, search, selectedCategory],
    queryFn: () => getProjects({
      page: currentPage,
      limit: itemsPerPage,
      search: search || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });

  // Get projects and pagination info
  const projects = projectsData?.projects || [];
  const pagination = projectsData?.pagination || {
    total: 0,
    page: 1,
    total_pages: 1,
    has_more: false,
    has_previous: false,
    limit: 12,
    offset: 0,
  };

  // Client-side filter for tags and quality/complexity ranges
  const filteredProjects = projects.filter((project) => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => project.tags?.includes(tag));
    
    const matchesQuality = project.quality_score >= qualityRange[0] && 
      project.quality_score <= qualityRange[1];
    
    const matchesComplexity = project.technical_complexity >= complexityRange[0] && 
      project.technical_complexity <= complexityRange[1];

    return matchesTags && matchesQuality && matchesComplexity;
  });

  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const order = sortOrder === 'desc' ? -1 : 1;
    switch (sortBy) {
      case 'quality_score':
        return (b.quality_score - a.quality_score) * order;
      case 'revenue':
        return (b.revenue_potential.realistic - a.revenue_potential.realistic) * order;
      case 'complexity':
        return (b.technical_complexity - a.technical_complexity) * order;
      case 'title':
        return a.title.localeCompare(b.title) * order;
      default:
        return 0;
    }
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

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

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-500" />
              Project Portfolio
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover and explore {pagination.total} innovative AI and software projects
            </p>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by title, problem, or solution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {stats && Object.keys(stats.categories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({stats.categories[category]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality_score">Quality Score</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="complexity">Complexity</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="h-12 w-12"
              >
                <SortAsc className={cn("h-4 w-4 transition-transform", 
                  sortOrder === 'desc' && "rotate-180")} />
              </Button>

              <ExportDialog
                projectIds={filteredProjects?.map(p => p.id.toString())}
                filters={{
                  category: selectedCategory !== 'all' ? selectedCategory : undefined,
                  tags: selectedTags.length > 0 ? selectedTags : undefined,
                  minQuality: qualityRange[0],
                  maxQuality: qualityRange[1],
                  minComplexity: complexityRange[0],
                  maxComplexity: complexityRange[1],
                  search
                }}
                reportType="export"
                triggerText="Export"
              />

              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Quality Score</h4>
                      <Slider
                        value={qualityRange}
                        onValueChange={setQualityRange}
                        min={0}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{qualityRange[0]}</span>
                        <span>{qualityRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Technical Complexity</h4>
                      <Slider
                        value={complexityRange}
                        onValueChange={setComplexityRange}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{complexityRange[0]}</span>
                        <span>{complexityRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {stats && Object.entries(stats.tags || {})
                          .sort(([, a], [, b]) => b - a)
                          .map(([tag, count]) => (
                            <Badge
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleTag(tag)}
                            >
                              {tag} ({count})
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex border rounded-lg h-12">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedTags.length > 0 || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTags([]);
                  setSelectedCategory('all');
                  setQualityRange([0, 10]);
                  setComplexityRange([1, 10]);
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedProjects.length} of {pagination.total} projects
          </p>
        </div>

        {/* Projects Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "grid gap-6",
              viewMode === 'grid' 
                ? "md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}
          >
            {sortedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProjectCard project={project} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {sortedProjects.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              No projects found matching your criteria. Try adjusting your filters.
            </p>
          </Card>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </motion.div>
    </div>
  );
}