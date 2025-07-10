'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Filter, Search, SlidersHorizontal, X, Download, 
  Calendar, DollarSign, Star, Zap, Target, Users,
  BarChart3, TrendingUp, AlertTriangle, BookOpen
} from 'lucide-react';

interface FilterState {
  search: string;
  categories: string[];
  qualityRange: [number, number];
  revenueRange: [number, number];
  complexityRange: [number, number];
  developmentTime: string[];
  competitionLevel: string[];
  status: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  dateRange: {
    start: string;
    end: string;
  };
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  projects: any[];
  initialFilters?: Partial<FilterState>;
}

export function AdvancedFilters({ onFiltersChange, projects, initialFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    qualityRange: [0, 10],
    revenueRange: [0, 1000000],
    complexityRange: [0, 10],
    developmentTime: [],
    competitionLevel: [],
    status: [],
    sortBy: 'qualityScore',
    sortOrder: 'desc',
    dateRange: {
      start: '',
      end: ''
    },
    ...initialFilters
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Extract unique values from projects for filter options
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];
  const developmentTimes = [...new Set(projects.map(p => p.developmentTime).filter(Boolean))];
  const competitionLevels = [...new Set(projects.map(p => p.competitionLevel).filter(Boolean))];
  const statuses = [...new Set(projects.map(p => p.status).filter(Boolean))];

  // Calculate ranges from actual data
  const maxRevenue = Math.max(...projects.map(p => p.revenuePotential || 0));
  const minRevenue = Math.min(...projects.map(p => p.revenuePotential || 0));

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.qualityRange[0] > 0 || filters.qualityRange[1] < 10) count++;
    if (filters.revenueRange[0] > minRevenue || filters.revenueRange[1] < maxRevenue) count++;
    if (filters.complexityRange[0] > 0 || filters.complexityRange[1] < 10) count++;
    if (filters.developmentTime.length > 0) count++;
    if (filters.competitionLevel.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    
    setActiveFiltersCount(count);
    onFiltersChange(filters);
  }, [filters, onFiltersChange, minRevenue, maxRevenue]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      categories: [],
      qualityRange: [0, 10],
      revenueRange: [minRevenue, maxRevenue],
      complexityRange: [0, 10],
      developmentTime: [],
      competitionLevel: [],
      status: [],
      sortBy: 'qualityScore',
      sortOrder: 'desc',
      dateRange: { start: '', end: '' }
    });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilter('categories', newCategories);
  };

  const toggleArrayFilter = (key: 'developmentTime' | 'competitionLevel' | 'status', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            <CardTitle>Advanced Filters & Search</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'} Filters
            </Button>
          </div>
        </div>
        <CardDescription>
          Filter and search through your {projects.length} projects with advanced criteria
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Quick Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by title, description, or tags..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Sort */}
          <div className="flex items-center gap-4">
            <Label>Sort by:</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualityScore">Quality Score</SelectItem>
                <SelectItem value="revenuePotential">Revenue Potential</SelectItem>
                <SelectItem value="technicalComplexity">Technical Complexity</SelectItem>
                <SelectItem value="activitiesCount">Activity Level</SelectItem>
                <SelectItem value="title">Project Name</SelectItem>
                <SelectItem value="createdAt">Creation Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {filters.sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <Tabs defaultValue="categories" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4" />
                  Project Categories
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={filters.categories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                      {filters.categories.includes(category) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              {/* Quality Score Range */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4" />
                  Quality Score: {filters.qualityRange[0]} - {filters.qualityRange[1]}
                </Label>
                <Slider
                  value={filters.qualityRange}
                  onValueChange={(value) => updateFilter('qualityRange', value)}
                  max={10}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Revenue Range */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4" />
                  Revenue Potential: {formatCurrency(filters.revenueRange[0])} - {formatCurrency(filters.revenueRange[1])}
                </Label>
                <Slider
                  value={filters.revenueRange}
                  onValueChange={(value) => updateFilter('revenueRange', value)}
                  max={maxRevenue}
                  min={minRevenue}
                  step={1000}
                  className="w-full"
                />
              </div>

              {/* Complexity Range */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4" />
                  Technical Complexity: {filters.complexityRange[0]} - {filters.complexityRange[1]}
                </Label>
                <Slider
                  value={filters.complexityRange}
                  onValueChange={(value) => updateFilter('complexityRange', value)}
                  max={10}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              {/* Development Time */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  Development Time
                </Label>
                <div className="flex flex-wrap gap-2">
                  {developmentTimes.map(time => (
                    <Badge
                      key={time}
                      variant={filters.developmentTime.includes(time) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter('developmentTime', time)}
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Competition Level */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4" />
                  Competition Level
                </Label>
                <div className="flex flex-wrap gap-2">
                  {competitionLevels.map(level => (
                    <Badge
                      key={level}
                      variant={filters.competitionLevel.includes(level) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayFilter('competitionLevel', level)}
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Status */}
              {statuses.length > 0 && (
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Project Status
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <Badge
                        key={status}
                        variant={filters.status.includes(status) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleArrayFilter('status', status)}
                      >
                        {status}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created After</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Created Before</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}