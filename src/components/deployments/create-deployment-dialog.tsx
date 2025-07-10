'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { DeploymentPlatform } from '@prisma/client';

interface CreateDeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId?: string;
}

export function CreateDeploymentDialog({
  open,
  onOpenChange,
  onSuccess,
  projectId: initialProjectId
}: CreateDeploymentDialogProps) {
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [platform, setPlatform] = useState<DeploymentPlatform | ''>('');
  const [environmentName, setEnvironmentName] = useState('production');
  const [branch, setBranch] = useState('main');
  const [buildCommand, setBuildCommand] = useState('');
  const [installCommand, setInstallCommand] = useState('npm install');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [envVars, setEnvVars] = useState('');

  // Fetch projects for selection
  const { data: projects } = useQuery({
    queryKey: ['projects-select'],
    queryFn: async () => {
      const response = await fetch('/api/projects?limit=100');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.projects;
    },
    enabled: open && !initialProjectId
  });

  // Fetch repositories for the selected project
  const { data: repository } = useQuery({
    queryKey: ['project-repository', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await fetch(`/api/repositories?projectId=${projectId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.repositories[0] || null;
    },
    enabled: !!projectId
  });

  const createDeploymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deployment');
      }
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      resetForm();
    }
  });

  const resetForm = () => {
    if (!initialProjectId) setProjectId('');
    setPlatform('');
    setEnvironmentName('production');
    setBranch('main');
    setBuildCommand('');
    setInstallCommand('npm install');
    setOutputDirectory('');
    setEnvVars('');
  };

  const handleSubmit = () => {
    if (!projectId || !platform) return;

    // Parse environment variables
    const envVarsObject: Record<string, string> = {};
    if (envVars) {
      envVars.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVarsObject[key.trim()] = value.trim();
        }
      });
    }

    createDeploymentMutation.mutate({
      projectId,
      platform,
      repositoryId: repository?.id,
      environmentName,
      branch,
      buildCommand: buildCommand || undefined,
      installCommand: installCommand || undefined,
      outputDirectory: outputDirectory || undefined,
      envVars: Object.keys(envVarsObject).length > 0 ? envVarsObject : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deploy Project</DialogTitle>
          <DialogDescription>
            Create a new deployment for your project on your preferred platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Selection */}
          {!initialProjectId && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as DeploymentPlatform)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deployment platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERCEL">Vercel</SelectItem>
                <SelectItem value="NETLIFY">Netlify</SelectItem>
                <SelectItem value="AWS_AMPLIFY">AWS Amplify</SelectItem>
                <SelectItem value="CLOUDFLARE_PAGES">Cloudflare Pages</SelectItem>
                <SelectItem value="GITHUB_PAGES">GitHub Pages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Environment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environmentName} onValueChange={setEnvironmentName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
              />
            </div>
          </div>

          {/* Build Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Build Settings</h4>
            
            <div className="space-y-2">
              <Label htmlFor="installCommand">Install Command</Label>
              <Input
                id="installCommand"
                value={installCommand}
                onChange={(e) => setInstallCommand(e.target.value)}
                placeholder="npm install"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildCommand">Build Command</Label>
              <Input
                id="buildCommand"
                value={buildCommand}
                onChange={(e) => setBuildCommand(e.target.value)}
                placeholder="npm run build"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outputDirectory">Output Directory</Label>
              <Input
                id="outputDirectory"
                value={outputDirectory}
                onChange={(e) => setOutputDirectory(e.target.value)}
                placeholder="dist or .next"
              />
            </div>
          </div>

          {/* Environment Variables */}
          <div className="space-y-2">
            <Label htmlFor="envVars">Environment Variables</Label>
            <Textarea
              id="envVars"
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              placeholder="KEY=value&#10;ANOTHER_KEY=another_value"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Enter each variable on a new line in KEY=value format
            </p>
          </div>

          {createDeploymentMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createDeploymentMutation.error?.message || 'Failed to create deployment'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!projectId || !platform || createDeploymentMutation.isPending}
          >
            {createDeploymentMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}