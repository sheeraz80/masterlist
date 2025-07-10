'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  GitBranch, Plus, ExternalLink, RotateCcw, Settings,
  CheckCircle, Clock, AlertCircle, Code, Star,
  Download, Upload, RefreshCw, Archive, Eye
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
import type { RepositoryWithDetails, SyncResult } from '@/types/repository';

interface RepositorySectionProps {
  projectId: string;
  projectTitle: string;
  projectCategory: string;
}

export function RepositorySection({ projectId, projectTitle, projectCategory }: RepositorySectionProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [syncing, setSyncing] = useState(false);

  const queryClient = useQueryClient();

  // Fetch repository for this project
  const { data: repository, isLoading, error } = useQuery<RepositoryWithDetails>({
    queryKey: ['project-repository', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/repositories?projectId=${projectId}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch repository');
      const data = await response.json();
      return data.repositories?.[0] || null;
    }
  });

  // Link existing repository mutation
  const linkRepositoryMutation = useMutation({
    mutationFn: async ({ projectId, githubUrl }: { projectId: string; githubUrl: string }) => {
      const response = await fetch('/api/repositories/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, githubUrl })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to link repository');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-repository', projectId] });
      setShowLinkDialog(false);
      setGithubUrl('');
    }
  });

  // Create new repository mutation
  const createRepositoryMutation = useMutation({
    mutationFn: async ({ projectId, repoName, description }: { projectId: string; repoName?: string; description?: string }) => {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, repoName, description, isPrivate: true })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create repository');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-repository', projectId] });
      setShowCreateDialog(false);
      setRepoName('');
      setDescription('');
    }
  });

  // Sync repository mutation
  const syncRepositoryMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      const response = await fetch(`/api/repositories/${repositoryId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyzeCode: true, updateMetrics: true })
      });
      if (!response.ok) throw new Error('Failed to sync repository');
      return response.json() as Promise<SyncResult>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-repository', projectId] });
      setSyncing(false);
    },
    onError: () => {
      setSyncing(false);
    }
  });

  const handleLinkRepository = () => {
    if (!githubUrl.trim()) return;
    linkRepositoryMutation.mutate({ projectId, githubUrl: githubUrl.trim() });
  };

  const handleCreateRepository = () => {
    createRepositoryMutation.mutate({ 
      projectId, 
      repoName: repoName.trim() || undefined,
      description: description.trim() || undefined
    });
  };

  const handleSyncRepository = () => {
    if (!repository) return;
    setSyncing(true);
    syncRepositoryMutation.mutate(repository.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'NEEDS_SETUP': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ERROR': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'SYNCING': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <GitBranch className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'NEEDS_SETUP': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200';
      case 'SYNCING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!repository) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repository
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No repository linked to this project. Link an existing repository or create a new one to enable code analysis and version control.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button onClick={() => setShowLinkDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Link Existing
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                <GitBranch className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link Repository Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Existing Repository</DialogTitle>
              <DialogDescription>
                Connect an existing GitHub repository to this project for code analysis and management.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                <Input
                  id="githubUrl"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
              
              {linkRepositoryMutation.error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {linkRepositoryMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleLinkRepository}
                  disabled={!githubUrl.trim() || linkRepositoryMutation.isPending}
                >
                  {linkRepositoryMutation.isPending ? 'Linking...' : 'Link Repository'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Repository Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Repository</DialogTitle>
              <DialogDescription>
                Create a new GitHub repository for this project with automatic setup and templates.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="repoName">Repository Name</Label>
                <Input
                  id="repoName"
                  placeholder={`project-${projectId.slice(-8)}-${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder={`${projectTitle} - ${projectCategory} project`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              {createRepositoryMutation.error && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {createRepositoryMutation.error.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRepository}
                  disabled={createRepositoryMutation.isPending}
                >
                  {createRepositoryMutation.isPending ? 'Creating...' : 'Create Repository'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncRepository}
              disabled={syncing || syncRepositoryMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            {repository.githubUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={repository.githubUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Repository Status */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium">{repository.githubOwner}/{repository.githubName}</p>
            <p className="text-sm text-muted-foreground">
              {repository.repoPath}
            </p>
          </div>
          <Badge className={getStatusColor(repository.status)}>
            {getStatusIcon(repository.status)}
            <span className="ml-1">{repository.status.replace('_', ' ')}</span>
          </Badge>
        </div>

        {/* Repository Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{repository.commitCount}</div>
            <div className="text-xs text-muted-foreground">Commits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{repository.language || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Language</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{repository.healthScore || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Health Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {repository.lastCommit ? new Date(repository.lastCommit).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Last Commit</div>
          </div>
        </div>

        {/* Code Analysis Results */}
        {repository.codeAnalyses && repository.codeAnalyses.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Latest Code Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Code Quality</span>
                  <span>{repository.codeAnalyses[0].codeQuality?.toFixed(1) || 'N/A'}</span>
                </div>
                <Progress 
                  value={repository.codeAnalyses[0].codeQuality || 0} 
                  className="h-2 mt-1" 
                />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Test Coverage</span>
                  <span>{repository.codeAnalyses[0].testCoverage?.toFixed(1) || 'N/A'}%</span>
                </div>
                <Progress 
                  value={repository.codeAnalyses[0].testCoverage || 0} 
                  className="h-2 mt-1" 
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Last analyzed: {new Date(repository.codeAnalyses[0].analyzedAt).toLocaleString()}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm">
            <Code className="h-4 w-4 mr-1" />
            Analyze Code
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Clone Local
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>

        {/* Sync Status */}
        {syncing && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Synchronizing repository data and running analysis...
            </AlertDescription>
          </Alert>
        )}

        {syncRepositoryMutation.data && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Repository synchronized successfully. {syncRepositoryMutation.data.changes.length} changes detected.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}