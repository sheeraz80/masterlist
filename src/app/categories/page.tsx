'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  BarChart3,
  Layers,
  Hash,
  DollarSign,
  Star,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CATEGORY_DEFINITIONS, 
  CATEGORY_GROUPS,
  getCategoryDefinition,
  type CategoryGroup 
} from '@/lib/constants/categories';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface CategoryStats {
  categories: Record<string, number>;
  totalProjects: number;
  topCategories: Array<{ name: string; count: number; revenue: number }>;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | 'all'>('all');

  useEffect(() => {
    fetchCategoryStats();
  }, []);

  const fetchCategoryStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      // Transform the data for our needs
      const topCategories = Object.entries(data.categories)
        .map(([name, count]) => ({
          name,
          count: count as number,
          revenue: Math.floor(Math.random() * 500000) + 100000 // Simulated revenue
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        categories: data.categories,
        totalProjects: data.total_projects || data.totalProjects || 0,
        topCategories
      });
    } catch (error) {
      console.error('Failed to fetch category stats:', error);
      toast.error('Failed to load category statistics');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryMetrics = (categoryName: string) => {
    const count = stats?.categories[categoryName] || 0;
    const totalProjects = stats?.totalProjects || 1;
    const percentage = (count / totalProjects) * 100;
    
    return {
      count,
      percentage,
      avgRevenue: Math.floor(Math.random() * 50000) + 10000,
      avgQuality: (Math.random() * 2 + 7).toFixed(1),
      growth: Math.floor(Math.random() * 50) - 10
    };
  };

  const getFilteredCategories = () => {
    // Get all categories from both predefined and actual data
    const allCategoryNames = new Set([
      ...Object.keys(CATEGORY_DEFINITIONS),
      ...Object.keys(stats?.categories || {})
    ]);
    
    if (selectedGroup === 'all') {
      return Array.from(allCategoryNames);
    }
    
    // Filter by group, including uncategorized ones
    return Array.from(allCategoryNames).filter(name => {
      const definition = getCategoryDefinition(name);
      return definition?.group === selectedGroup;
    });
  };

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to projects page with category filter
    router.push(`/projects?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-pulse" />
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Project Categories
            </h1>
            <p className="text-muted-foreground mt-2">
              {new Set([
                ...Object.keys(stats?.categories || {}),
                ...Object.keys(CATEGORY_DEFINITIONS)
              ]).size} categories across {stats?.totalProjects || 0} projects
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set([
                  ...Object.keys(stats?.categories || {}),
                  ...Object.keys(CATEGORY_DEFINITIONS)
                ]).size}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {Object.keys(stats?.categories || {}).length} in use
                </p>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(CATEGORY_DEFINITIONS).length} predefined
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalProjects || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Category</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats?.totalProjects || 0) / Object.keys(stats?.categories || {}).length)}
              </div>
              <p className="text-xs text-muted-foreground">
                Projects per category
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.topCategories[0]?.name.split(' ').slice(0, 2).join(' ')}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.topCategories[0]?.count} projects
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="all" onClick={() => setSelectedGroup('all')}>
            All
          </TabsTrigger>
          {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              onClick={() => setSelectedGroup(key as CategoryGroup)}
            >
              {group.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedGroup} className="space-y-4">
          {/* Category Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getFilteredCategories().map((categoryName) => {
              const definition = getCategoryDefinition(categoryName);
              const metrics = getCategoryMetrics(categoryName);
              const gradient = definition?.gradient || 'from-gray-500 to-gray-600';

              return (
                <motion.div
                  key={categoryName}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleCategoryClick(categoryName)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{categoryName}</CardTitle>
                          {definition?.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {definition.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">{definition?.group}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Projects</p>
                          <p className="font-semibold">{metrics.count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Percentage</p>
                          <p className="font-semibold">{metrics.percentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Revenue</p>
                          <p className="font-semibold">${formatNumber(metrics.avgRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Quality</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {metrics.avgQuality}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Distribution</span>
                          <span className="font-medium">{metrics.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.percentage} className="h-2" />
                      </div>

                      {/* Growth Indicator */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={metrics.growth > 0 ? 'default' : 'secondary'}
                          className={metrics.growth > 0 ? 'bg-green-100 text-green-700' : ''}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {metrics.growth > 0 ? '+' : ''}{metrics.growth}%
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryClick(categoryName);
                          }}
                        >
                          View Projects
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {getFilteredCategories().length === 0 && (
            <Card className="p-12 text-center">
              <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No categories in this group</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating categories for this group
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Top Categories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Categories by Project Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.topCategories.map((category, index) => {
              const percentage = ((category.count / (stats?.totalProjects || 1)) * 100);
              const definition = getCategoryDefinition(category.name);
              const gradient = definition?.gradient || 'from-gray-500 to-gray-600';

              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                      <span 
                        className="font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleCategoryClick(category.name)}
                      >
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {category.count} projects
                      </span>
                      <span className="text-sm font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div 
                    className="relative h-8 bg-secondary rounded-full overflow-hidden cursor-pointer"
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}