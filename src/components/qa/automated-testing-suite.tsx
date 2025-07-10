'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Play, Pause, RefreshCw, Code, FileText, 
  CheckCircle, XCircle, AlertTriangle, Loader2,
  Sparkles, Brain, Zap, Target, Clock, TrendingUp
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TestCase {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  code: string;
  aiGenerated: boolean;
  executionTime?: number;
  error?: string;
  coverage?: number;
}

interface TestSuite {
  id: string;
  name: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  lastRun: Date;
  testCases: TestCase[];
}

export function AutomatedTestingSuite() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testDescription, setTestDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: '1',
      name: 'Authentication Tests',
      totalTests: 12,
      passedTests: 11,
      failedTests: 1,
      coverage: 89,
      lastRun: new Date(Date.now() - 3600000),
      testCases: [
        {
          id: '1-1',
          name: 'User login with valid credentials',
          description: 'Test successful login flow',
          type: 'integration',
          status: 'passed',
          aiGenerated: true,
          executionTime: 234,
          coverage: 92,
          code: `describe('User Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
});`
        },
        {
          id: '1-2',
          name: 'User login with invalid credentials',
          description: 'Test failed login attempts',
          type: 'integration',
          status: 'failed',
          aiGenerated: true,
          executionTime: 156,
          error: 'Expected status 401 but received 500',
          code: `describe('User Authentication', () => {
  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });
});`
        }
      ]
    },
    {
      id: '2',
      name: 'Project Management Tests',
      totalTests: 8,
      passedTests: 8,
      failedTests: 0,
      coverage: 94,
      lastRun: new Date(Date.now() - 7200000),
      testCases: []
    }
  ]);

  const [generatedTests, setGeneratedTests] = useState<TestCase[]>([]);
  const [testMetrics, setTestMetrics] = useState({
    totalExecuted: 245,
    avgExecutionTime: 178,
    flakyTests: 3,
    newTestsGenerated: 12
  });

  // Simulate AI test generation
  const generateTests = async () => {
    setIsGenerating(true);
    
    // Simulate API call to AI service
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newTests: TestCase[] = [
      {
        id: `gen-${Date.now()}-1`,
        name: 'Test project creation with AI-generated data',
        description: testDescription || 'Verify project creation flow with various input combinations',
        type: 'integration',
        status: 'pending',
        aiGenerated: true,
        code: `describe('Project Creation', () => {
  it('should create project with valid data', async () => {
    const projectData = {
      title: 'AI Test Project',
      description: 'Generated test project',
      qualityScore: 8.5,
      category: 'Technology'
    };
    
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', \`Bearer \${authToken}\`)
      .send(projectData);
    
    expect(response.status).toBe(201);
    expect(response.body.title).toBe(projectData.title);
    expect(response.body.id).toBeDefined();
  });
});`
      },
      {
        id: `gen-${Date.now()}-2`,
        name: 'Test edge cases for project validation',
        description: 'AI-generated edge case tests',
        type: 'unit',
        status: 'pending',
        aiGenerated: true,
        code: `describe('Project Validation Edge Cases', () => {
  const edgeCases = [
    { title: '', expected: 'Title is required' },
    { title: 'a'.repeat(256), expected: 'Title too long' },
    { qualityScore: -1, expected: 'Invalid quality score' },
    { qualityScore: 11, expected: 'Invalid quality score' }
  ];
  
  edgeCases.forEach(({ title, qualityScore, expected }) => {
    it(\`should reject: \${expected}\`, async () => {
      const data = { title, qualityScore };
      const response = await validateProject(data);
      
      expect(response.isValid).toBe(false);
      expect(response.error).toContain(expected);
    });
  });
});`
      },
      {
        id: `gen-${Date.now()}-3`,
        name: 'Performance test for bulk operations',
        description: 'Test system performance under load',
        type: 'performance',
        status: 'pending',
        aiGenerated: true,
        code: `describe('Performance Tests', () => {
  it('should handle 1000 concurrent requests', async () => {
    const startTime = Date.now();
    const promises = Array(1000).fill(null).map(() => 
      request(app).get('/api/projects')
    );
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    const failedRequests = responses.filter(r => r.status !== 200);
    const avgResponseTime = (endTime - startTime) / 1000;
    
    expect(failedRequests.length).toBeLessThan(10); // <1% failure rate
    expect(avgResponseTime).toBeLessThan(100); // <100ms avg
  });
});`
      }
    ];
    
    setGeneratedTests(newTests);
    setIsGenerating(false);
  };

  // Simulate test execution
  const runTests = async (tests: TestCase[]) => {
    setIsRunning(true);
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Update test status to running
      setGeneratedTests(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' as const } : t
      ));
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Randomly determine test result
      const passed = Math.random() > 0.15;
      const executionTime = Math.floor(100 + Math.random() * 500);
      
      setGeneratedTests(prev => prev.map(t => 
        t.id === test.id ? {
          ...t,
          status: passed ? 'passed' as const : 'failed' as const,
          executionTime,
          error: passed ? undefined : 'Assertion failed: Expected value did not match',
          coverage: passed ? Math.floor(80 + Math.random() * 20) : undefined
        } : t
      ));
    }
    
    setIsRunning(false);
  };

  // Calculate overall metrics
  const overallMetrics = {
    totalTests: testSuites.reduce((sum, suite) => sum + suite.totalTests, 0) + generatedTests.length,
    passedTests: testSuites.reduce((sum, suite) => sum + suite.passedTests, 0) + 
                 generatedTests.filter(t => t.status === 'passed').length,
    failedTests: testSuites.reduce((sum, suite) => sum + suite.failedTests, 0) + 
                 generatedTests.filter(t => t.status === 'failed').length,
    avgCoverage: testSuites.length > 0 ? 
                 testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length : 0
  };

  return (
    <div className="space-y-6">
      {/* AI Test Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Test Generation
          </CardTitle>
          <CardDescription>
            Describe what you want to test and let AI generate comprehensive test cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Description</label>
            <Textarea
              placeholder="e.g., Test user authentication flow including login, logout, and session management..."
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="projects">Project Management</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={generateTests} 
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Tests
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{overallMetrics.totalTests}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {overallMetrics.totalTests > 0 
                    ? Math.round((overallMetrics.passedTests / overallMetrics.totalTests) * 100)
                    : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Coverage</p>
                <p className="text-2xl font-bold">{Math.round(overallMetrics.avgCoverage)}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Generated</p>
                <p className="text-2xl font-bold">{testMetrics.newTestsGenerated}</p>
              </div>
              <Sparkles className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Tests */}
      {generatedTests.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Test Cases</CardTitle>
              <Button 
                onClick={() => runTests(generatedTests)} 
                disabled={isRunning}
                size="sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {test.name}
                        {test.aiGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        test.type === 'unit' ? 'default' :
                        test.type === 'integration' ? 'secondary' :
                        test.type === 'e2e' ? 'outline' : 'destructive'
                      }>
                        {test.type}
                      </Badge>
                      {test.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                      {test.status === 'running' && (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Running
                        </Badge>
                      )}
                      {test.status === 'passed' && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Passed
                        </Badge>
                      )}
                      {test.status === 'failed' && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {test.executionTime && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.executionTime}ms
                      </span>
                      {test.coverage && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {test.coverage}% coverage
                        </span>
                      )}
                    </div>
                  )}
                  
                  {test.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{test.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="relative">
                    <div className="absolute top-2 right-2">
                      <Button variant="ghost" size="sm">
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        maxHeight: '300px'
                      }}
                    >
                      {test.code}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Test Suites */}
      <Card>
        <CardHeader>
          <CardTitle>Test Suites</CardTitle>
          <CardDescription>
            Manage and monitor your existing test suites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="failing">Failing</TabsTrigger>
              <TabsTrigger value="flaky">Flaky</TabsTrigger>
              <TabsTrigger value="slow">Slow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {testSuites.map((suite) => (
                <div key={suite.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{suite.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Last run: {suite.lastRun.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {suite.passedTests}/{suite.totalTests} passing
                        </p>
                        <Progress 
                          value={(suite.passedTests / suite.totalTests) * 100} 
                          className="w-24 h-2"
                        />
                      </div>
                      <Badge variant="outline">{suite.coverage}% coverage</Badge>
                    </div>
                  </div>
                  
                  {suite.testCases.length > 0 && (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {suite.testCases.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <span className="text-sm">{test.name}</span>
                            <div className="flex items-center gap-2">
                              {test.status === 'passed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {test.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                              {test.executionTime && (
                                <span className="text-xs text-muted-foreground">{test.executionTime}ms</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}