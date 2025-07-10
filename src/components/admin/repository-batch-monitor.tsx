'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';

interface BatchJob {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  metadata: {
    totalProjects?: number;
    processedProjects?: number;
    progress?: number;
    created?: number;
    failed?: number;
    skipped?: number;
    dryRun?: boolean;
    errors?: Array<{ project: string; error: string }>;
  };
  createdAt: string;
  updatedAt: string;
}

interface RepositoryLog {
  id: string;
  projectTitle: string;
  status: string;
  message?: string;
  error?: string;
  createdAt: string;
}

export function RepositoryBatchMonitor() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null);
  const [logs, setLogs] = useState<RepositoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/repositories/batch-create');
      const data = await response.json();
      setJobs(data.jobs || []);
      
      // Auto-select the most recent running job
      const runningJob = data.jobs?.find((job: BatchJob) => job.status === 'RUNNING');
      if (runningJob && !selectedJob) {
        setSelectedJob(runningJob);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  // Fetch job details
  const fetchJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/repositories/batch-create/${jobId}`);
      const data = await response.json();
      
      if (data.job) {
        setSelectedJob(data.job);
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    }
  };

  // Create new batch job
  const createBatchJob = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/repositories/batch-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun })
      });
      
      const data = await response.json();
      if (data.jobId) {
        await fetchJobs();
        setSelectedJob(jobs.find(j => j.id === data.jobId) || null);
      }
    } catch (error) {
      console.error('Failed to create batch job:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Cancel job
  const cancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/admin/repositories/batch-create/${jobId}`, {
        method: 'DELETE'
      });
      await fetchJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  // Export logs
  const exportLogs = () => {
    if (!logs.length) return;
    
    const csv = [
      ['Project', 'Status', 'Message', 'Error', 'Timestamp'].join(','),
      ...logs.map(log => [
        log.projectTitle,
        log.status,
        log.message || '',
        log.error || '',
        new Date(log.createdAt).toISOString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repository-creation-${selectedJob?.id}.csv`;
    a.click();
  };

  // Auto-refresh
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchJobs();
        if (selectedJob && selectedJob.status === 'RUNNING') {
          fetchJobDetails(selectedJob.id);
        }
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedJob]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'SKIPPED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'COMPLETED': 'default',
      'RUNNING': 'secondary',
      'FAILED': 'destructive',
      'CANCELLED': 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Repository Batch Creation</CardTitle>
              <CardDescription>
                Create and manage batch repository creation jobs
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
                <Label htmlFor="auto-refresh">Auto-refresh</Label>
              </div>
              <Button
                onClick={() => fetchJobs()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Create new job */}
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="dry-run"
                    checked={dryRun}
                    onCheckedChange={setDryRun}
                  />
                  <Label htmlFor="dry-run">
                    Dry Run Mode (simulate without creating repositories)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dryRun 
                    ? 'Will simulate the creation process without making actual changes'
                    : 'Will create actual repositories on GitHub'
                  }
                </p>
              </div>
              <Button
                onClick={createBatchJob}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Batch Creation
                  </>
                )}
              </Button>
            </div>

            {/* Jobs list */}
            <Tabs defaultValue="recent" className="w-full">
              <TabsList>
                <TabsTrigger value="recent">Recent Jobs</TabsTrigger>
                <TabsTrigger value="details">Job Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recent" className="space-y-2">
                {jobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No batch jobs found
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedJob?.id === job.id ? 'border-primary bg-muted/50' : ''
                      }`}
                      onClick={() => {
                        setSelectedJob(job);
                        fetchJobDetails(job.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(job.status)}
                            {job.metadata.dryRun && (
                              <Badge variant="outline">Dry Run</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Started {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {job.status === 'RUNNING' && job.metadata.progress ? (
                            <div className="space-y-1">
                              <Progress value={job.metadata.progress} className="w-32" />
                              <p className="text-xs text-muted-foreground">
                                {job.metadata.processedProjects}/{job.metadata.totalProjects}
                              </p>
                            </div>
                          ) : (
                            <div className="text-sm">
                              {job.metadata.created && (
                                <p className="text-green-600">✓ {job.metadata.created} created</p>
                              )}
                              {job.metadata.failed && job.metadata.failed > 0 && (
                                <p className="text-red-600">✗ {job.metadata.failed} failed</p>
                              )}
                              {job.metadata.skipped && job.metadata.skipped > 0 && (
                                <p className="text-yellow-600">⚠ {job.metadata.skipped} skipped</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="details">
                {selectedJob ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Job #{selectedJob.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedJob.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedJob.status === 'RUNNING' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => cancelJob(selectedJob.id)}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportLogs}
                          disabled={logs.length === 0}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export Logs
                        </Button>
                      </div>
                    </div>

                    {selectedJob.metadata.errors && selectedJob.metadata.errors.length > 0 && (
                      <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-red-900 mb-2">Errors</h4>
                        <ScrollArea className="h-32">
                          {selectedJob.metadata.errors.map((error, idx) => (
                            <div key={idx} className="text-sm mb-2">
                              <span className="font-medium">{error.project}:</span>
                              <span className="text-red-700 ml-2">{error.error}</span>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Repository Creation Logs</h4>
                      <ScrollArea className="h-96 border rounded-lg">
                        <div className="p-4 space-y-2">
                          {logs.length === 0 ? (
                            <p className="text-center text-muted-foreground">
                              No logs available
                            </p>
                          ) : (
                            logs.map((log) => (
                              <div
                                key={log.id}
                                className="flex items-start gap-2 text-sm"
                              >
                                {getStatusIcon(log.status)}
                                <div className="flex-1">
                                  <span className="font-medium">{log.projectTitle}</span>
                                  {log.message && (
                                    <span className="text-muted-foreground ml-2">
                                      - {log.message}
                                    </span>
                                  )}
                                  {log.error && (
                                    <span className="text-red-600 ml-2">
                                      - {log.error}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a job to view details
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}