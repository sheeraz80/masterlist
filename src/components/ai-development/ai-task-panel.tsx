'use client';

import { useState } from 'react';
import { Loader2, Wand2, GitBranch, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AITaskPanelProps {
  projectIds: string[];
  onComplete?: () => void;
}

export function AITaskPanel({ projectIds, onComplete }: AITaskPanelProps) {
  const [taskType, setTaskType] = useState<string>('bug-fix');
  const [description, setDescription] = useState('');
  const [aiProvider, setAIProvider] = useState('claude');
  const [autoCommit, setAutoCommit] = useState(true);
  const [autoPR, setAutoPR] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const executeAITask = async () => {
    setIsExecuting(true);
    setProgress(0);
    
    try {
      const response = await fetch('/api/ai-development/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds,
          taskType,
          description,
          aiProvider,
          autoCommit,
          autoPR
        })
      });

      const data = await response.json();
      setResults(data);
      setProgress(100);
      onComplete?.();
    } catch (error) {
      console.error('Failed to execute AI task:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Development Assistant
        </CardTitle>
        <CardDescription>
          Execute AI-powered development tasks across {projectIds.length} project{projectIds.length > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Task Type</Label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug-fix">Bug Fix</SelectItem>
              <SelectItem value="feature">New Feature</SelectItem>
              <SelectItem value="refactor">Refactor Code</SelectItem>
              <SelectItem value="update-deps">Update Dependencies</SelectItem>
              <SelectItem value="security-fix">Security Fix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            placeholder="Describe what you want the AI to do..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label>AI Provider</Label>
          <Select value={aiProvider} onValueChange={setAIProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude">Claude (Recommended)</SelectItem>
              <SelectItem value="openai">OpenAI GPT-4</SelectItem>
              <SelectItem value="github-copilot">GitHub Copilot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoCommit"
              checked={autoCommit}
              onCheckedChange={(checked) => setAutoCommit(!!checked)}
            />
            <Label htmlFor="autoCommit">Auto-commit changes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoPR"
              checked={autoPR}
              onCheckedChange={(checked) => setAutoPR(!!checked)}
            />
            <Label htmlFor="autoPR">Create pull requests</Label>
          </div>
        </div>

        {isExecuting && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">
              Processing {projectIds.length} projects...
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Results</span>
              <div className="flex gap-2">
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {results.summary.successful} succeeded
                </Badge>
                {results.summary.failed > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {results.summary.failed} failed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={executeAITask}
          disabled={!description || isExecuting}
          className="w-full"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executing AI Tasks...
            </>
          ) : (
            <>
              <GitBranch className="h-4 w-4 mr-2" />
              Execute on {projectIds.length} Projects
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}