'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, Camera, AlertTriangle, CheckCircle, XCircle,
  Loader2, Brain, Maximize2, Monitor, Smartphone,
  Tablet, RefreshCw, Download, Settings, Layers,
  Zap, Target, TrendingUp
} from 'lucide-react';

interface Screenshot {
  id: string;
  url: string;
  timestamp: Date;
  device: 'desktop' | 'tablet' | 'mobile';
  page: string;
  resolution: string;
}

interface VisualDiff {
  id: string;
  baseline: Screenshot;
  current: Screenshot;
  diffPercentage: number;
  status: 'pass' | 'fail' | 'review';
  aiAnalysis: {
    isIntentional: boolean;
    confidence: number;
    description: string;
    affectedElements: string[];
  };
  regions?: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'added' | 'removed' | 'changed';
  }[];
}

export function VisualRegressionTesting() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPage, setSelectedPage] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [diffThreshold, setDiffThreshold] = useState([5]);
  const [aiEnabled, setAiEnabled] = useState(true);
  
  const [visualDiffs, setVisualDiffs] = useState<VisualDiff[]>([
    {
      id: '1',
      baseline: {
        id: 'base-1',
        url: '/api/placeholder/800/600',
        timestamp: new Date(Date.now() - 86400000),
        device: 'desktop',
        page: 'Dashboard',
        resolution: '1920x1080'
      },
      current: {
        id: 'curr-1',
        url: '/api/placeholder/800/600',
        timestamp: new Date(),
        device: 'desktop',
        page: 'Dashboard',
        resolution: '1920x1080'
      },
      diffPercentage: 2.3,
      status: 'pass',
      aiAnalysis: {
        isIntentional: true,
        confidence: 0.95,
        description: 'Text content update detected - appears to be intentional data refresh',
        affectedElements: ['Dashboard metrics', 'Activity feed']
      }
    },
    {
      id: '2',
      baseline: {
        id: 'base-2',
        url: '/api/placeholder/400/800',
        timestamp: new Date(Date.now() - 86400000),
        device: 'mobile',
        page: 'Login',
        resolution: '375x812'
      },
      current: {
        id: 'curr-2',
        url: '/api/placeholder/400/800',
        timestamp: new Date(),
        device: 'mobile',
        page: 'Login',
        resolution: '375x812'
      },
      diffPercentage: 15.7,
      status: 'fail',
      aiAnalysis: {
        isIntentional: false,
        confidence: 0.88,
        description: 'Layout shift detected - login button misaligned on mobile',
        affectedElements: ['Login button', 'Form container']
      },
      regions: [
        { x: 100, y: 500, width: 200, height: 50, type: 'changed' }
      ]
    }
  ]);

  const [captureProgress, setCaptureProgress] = useState(0);
  const [testSummary, setTestSummary] = useState({
    totalTests: 24,
    passed: 20,
    failed: 3,
    needsReview: 1,
    avgDiffPercentage: 3.2
  });

  const pages = [
    { value: 'all', label: 'All Pages' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'projects', label: 'Projects' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'login', label: 'Login' },
    { value: 'profile', label: 'Profile' }
  ];

  const devices = [
    { value: 'all', label: 'All Devices' },
    { value: 'desktop', label: 'Desktop (1920x1080)' },
    { value: 'tablet', label: 'Tablet (768x1024)' },
    { value: 'mobile', label: 'Mobile (375x812)' }
  ];

  // Simulate screenshot capture
  const captureScreenshots = async () => {
    setIsCapturing(true);
    setCaptureProgress(0);
    
    const totalSteps = pages.length * devices.length;
    let completed = 0;
    
    for (const page of pages) {
      if (page.value === 'all') continue;
      
      for (const device of devices) {
        if (device.value === 'all') continue;
        
        // Simulate capture delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        completed++;
        setCaptureProgress((completed / totalSteps) * 100);
      }
    }
    
    // Simulate AI analysis
    setIsCapturing(false);
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add new visual diffs
    const newDiff: VisualDiff = {
      id: `diff-${Date.now()}`,
      baseline: {
        id: `base-${Date.now()}`,
        url: '/api/placeholder/800/600',
        timestamp: new Date(Date.now() - 86400000),
        device: 'desktop',
        page: 'Analytics',
        resolution: '1920x1080'
      },
      current: {
        id: `curr-${Date.now()}`,
        url: '/api/placeholder/800/600',
        timestamp: new Date(),
        device: 'desktop',
        page: 'Analytics',
        resolution: '1920x1080'
      },
      diffPercentage: 8.4,
      status: 'review',
      aiAnalysis: {
        isIntentional: false,
        confidence: 0.72,
        description: 'Chart rendering differences detected - may be due to data updates',
        affectedElements: ['Line chart', 'Legend', 'Axis labels']
      },
      regions: [
        { x: 200, y: 300, width: 400, height: 200, type: 'changed' }
      ]
    };
    
    setVisualDiffs(prev => [...prev, newDiff]);
    setIsAnalyzing(false);
  };

  // AI-powered diff analysis
  const analyzeWithAI = async (diffId: string) => {
    const diff = visualDiffs.find(d => d.id === diffId);
    if (!diff) return;
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setVisualDiffs(prev => prev.map(d => {
      if (d.id === diffId) {
        return {
          ...d,
          aiAnalysis: {
            ...d.aiAnalysis,
            confidence: 0.92,
            description: 'After deeper analysis: Changes appear to be CSS animation states',
            isIntentional: true
          },
          status: 'pass'
        };
      }
      return d;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'review': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Visual Regression Testing
          </CardTitle>
          <CardDescription>
            AI-powered visual testing to catch UI regressions automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map(page => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {devices.map(device => (
                  <SelectItem key={device.value} value={device.value}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={captureScreenshots}
              disabled={isCapturing || isAnalyzing}
            >
              {isCapturing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Capturing...
                </>
              ) : isAnalyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Screenshots
                </>
              )}
            </Button>
          </div>
          
          {(isCapturing || isAnalyzing) && (
            <div className="space-y-2">
              <Progress value={isCapturing ? captureProgress : 100} />
              <p className="text-sm text-muted-foreground text-center">
                {isCapturing 
                  ? `Capturing screenshots... ${Math.round(captureProgress)}%`
                  : 'AI analyzing visual differences...'}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>AI-Powered Analysis</Label>
              <p className="text-sm text-muted-foreground">
                Use AI to intelligently detect intentional vs unintentional changes
              </p>
            </div>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Difference Threshold</Label>
              <span className="text-sm text-muted-foreground">{diffThreshold[0]}%</span>
            </div>
            <Slider
              value={diffThreshold}
              onValueChange={setDiffThreshold}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{testSummary.totalTests}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{testSummary.passed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{testSummary.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Review</p>
                <p className="text-2xl font-bold text-yellow-600">{testSummary.needsReview}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Diffs */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Differences</CardTitle>
          <CardDescription>
            Screenshots with detected changes requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="review">Needs Review</TabsTrigger>
              <TabsTrigger value="passed">Passed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {visualDiffs.map((diff) => (
                <div key={diff.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{diff.current.page}</h4>
                        {getStatusIcon(diff.status)}
                        <Badge variant="outline">
                          {getDeviceIcon(diff.current.device)}
                          <span className="ml-1">{diff.current.device}</span>
                        </Badge>
                        <Badge variant={diff.diffPercentage > 10 ? 'destructive' : 'secondary'}>
                          {diff.diffPercentage}% diff
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {diff.current.resolution} • {diff.current.timestamp.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {diff.status === 'review' && aiEnabled && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => analyzeWithAI(diff.id)}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          Re-analyze
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {aiEnabled && diff.aiAnalysis && (
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">
                            AI Analysis (Confidence: {Math.round(diff.aiAnalysis.confidence * 100)}%)
                          </p>
                          <p>{diff.aiAnalysis.description}</p>
                          {diff.aiAnalysis.affectedElements.length > 0 && (
                            <p className="text-sm">
                              Affected: {diff.aiAnalysis.affectedElements.join(', ')}
                            </p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Baseline</p>
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={diff.baseline.url} 
                          alt="Baseline"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Current</p>
                      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={diff.current.url} 
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                        {diff.regions && diff.regions.map((region, idx) => (
                          <div
                            key={idx}
                            className={`absolute border-2 ${
                              region.type === 'added' ? 'border-green-500' :
                              region.type === 'removed' ? 'border-red-500' :
                              'border-yellow-500'
                            }`}
                            style={{
                              left: `${region.x}px`,
                              top: `${region.y}px`,
                              width: `${region.width}px`,
                              height: `${region.height}px`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Difference</p>
                      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <div className="text-center">
                            <Layers className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">{diff.diffPercentage}%</p>
                            <p className="text-sm">difference</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={diff.status === 'fail' ? 'default' : 'outline'}>
                        {diff.status === 'fail' ? 'Mark as Baseline' : 'Approve'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    
                    {diff.status === 'fail' && (
                      <Button size="sm" variant="destructive">
                        Create Issue
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}