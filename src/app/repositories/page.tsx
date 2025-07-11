'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  GitBranch, Plus, Search, Filter, Download, RotateCcw,
  FolderTree, Code, Star, Activity, AlertCircle,
  CheckCircle, Clock, Archive, Eye, Settings, RefreshCw
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types
import type { RepositoryWithDetails, RepositoryStatsResponse } from '@/types/repository';

interface RepositoriesResponse {
  repositories: RepositoryWithDetails[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function RepositoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRepo, setSelectedRepo] = useState<RepositoryWithDetails | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch repositories
  const { data: repositoriesData, isLoading: repositoriesLoading, refetch: refetchRepositories } = useQuery<RepositoriesResponse>({
    queryKey: ['repositories', selectedCategory, selectedStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/repositories?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      return response.json();
    }
  });

  // Fetch repository statistics
  const { data: stats, isLoading: statsLoading } = useQuery<RepositoryStatsResponse>({
    queryKey: ['repository-stats'],
    queryFn: async () => {
      const response = await fetch('/api/repositories/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  const repositories = repositoriesData?.repositories || [];
  const filteredRepositories = repositories.filter(repo =>
    repo.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.githubName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'NEEDS_SETUP': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ERROR': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'ARCHIVED': return <Archive className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'NEEDS_SETUP': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage GitHub repositories for all your projects with hierarchical organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchRepositories()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              setIsSyncing(true);
              try {
                const response = await fetch('/api/repositories/sync-github', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                if (result.success) {
                  alert(`Sync completed! ${result.message}`);
                  refetchRepositories();
                } else {
                  alert(`Sync failed: ${result.error}`);
                }
              } catch (error) {
                alert('Failed to sync with GitHub');
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync with GitHub'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Link Repository
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Repositories</p>
                  <p className="text-2xl font-bold">{stats.totalRepositories}</p>
                </div>
                <FolderTree className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeRepositories}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                  <p className="text-2xl font-bold">{stats.averageHealthScore.toFixed(1)}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Needs Setup</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.needsSetup}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="chrome-extensions">Chrome Extensions</SelectItem>
              <SelectItem value="vscode-extensions">VSCode Extensions</SelectItem>
              <SelectItem value="web-apps">Web Apps</SelectItem>
              <SelectItem value="mobile-apps">Mobile Apps</SelectItem>
              <SelectItem value="api-backend">API/Backend</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="NEEDS_SETUP">Needs Setup</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Repository List */}
      <div className="space-y-4">
        {repositoriesLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-48" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRepositories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No repositories found</p>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start by linking your first repository'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRepositories.map((repo) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <GitBranch className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-lg">{repo.project.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {repo.githubOwner}/{repo.githubName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={getStatusColor(repo.status)}>
                            {getStatusIcon(repo.status)}
                            <span className="ml-1">{repo.status.replace('_', ' ')}</span>
                          </Badge>
                          
                          <Badge variant="outline">
                            {repo.category.replace('-', ' ')}
                          </Badge>
                          
                          {repo.language && (
                            <Badge variant="outline">
                              <Code className="h-3 w-3 mr-1" />
                              {repo.language}
                            </Badge>
                          )}
                          
                          {repo.healthScore && (
                            <Badge variant="outline">
                              <Star className="h-3 w-3 mr-1" />
                              {repo.healthScore}/100
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Path: <code className="bg-muted px-1 rounded">{repo.repoPath}</code>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {repo.githubUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={repo.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRepo(repo)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Repository Details Dialog */}
      <Dialog open={!!selectedRepo} onOpenChange={() => setSelectedRepo(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRepo?.project.title}</DialogTitle>
            <DialogDescription>
              Repository management and analysis
            </DialogDescription>
          </DialogHeader>
          
          {selectedRepo && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Code Analysis</TabsTrigger>
                <TabsTrigger value="sync">Synchronization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Repository Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>URL: <a href={selectedRepo.githubUrl || '#'} className="text-blue-500 hover:underline">{selectedRepo.githubUrl}</a></div>
                      <div>Branch: {selectedRepo.defaultBranch}</div>
                      <div>Language: {selectedRepo.language || 'Unknown'}</div>
                      <div>Status: {selectedRepo.status}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Organization</h4>
                    <div className="space-y-2 text-sm">
                      <div>Category: {selectedRepo.category}</div>
                      <div>Subcategory: {selectedRepo.subcategory || 'None'}</div>
                      <div>Path: <code className="bg-muted px-1 rounded">{selectedRepo.repoPath}</code></div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                {selectedRepo.codeAnalyses.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Latest Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>Lines of Code: {selectedRepo.codeAnalyses[0].linesOfCode || 'N/A'}</div>
                        <div>Complexity: {selectedRepo.codeAnalyses[0].complexity || 'N/A'}</div>
                        <div>Quality Score: {selectedRepo.codeAnalyses[0].codeQuality || 'N/A'}</div>
                      </div>
                      <div className="space-y-2">
                        <div>Test Coverage: {selectedRepo.codeAnalyses[0].testCoverage || 'N/A'}%</div>
                        <div>Maintainability: {selectedRepo.codeAnalyses[0].maintainabilityIndex || 'N/A'}</div>
                        <div>Analyzed: {new Date(selectedRepo.codeAnalyses[0].analyzedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p>No code analysis available</p>
                    <Button className="mt-4">Run Analysis</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="sync" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Synchronization</h4>
                  <div className="space-y-2 text-sm">
                    <div>Last Sync: {selectedRepo.lastSync ? new Date(selectedRepo.lastSync).toLocaleString() : 'Never'}</div>
                    <div>Is Cloned: {selectedRepo.isCloned ? 'Yes' : 'No'}</div>
                    <div>Local Path: {selectedRepo.localPath || 'Not set'}</div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button>Sync Now</Button>
                    <Button variant="outline">Clone Locally</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}