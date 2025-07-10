'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, DollarSign, Clock, Calendar, GitBranch, 
  TrendingUp, Brain, Code, Shield, Target, Users, Sparkles,
  BarChart3, Activity, AlertTriangle, CheckCircle2, XCircle,
  Package, Layers, Zap, Globe, Github, ExternalLink, Copy,
  Download, Share2, Edit, Trash2, RefreshCw, LightbulbIcon,
  Rocket, Award, LineChart, PieChart, Timer, Hash, Tag
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// API & Utils
import { getProject } from '@/lib/api';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { getCategoryDefinition, getCategoryGradient } from '@/lib/constants/categories';
import { Project } from '@/types';

// Components
import { RepositorySection } from '@/components/project/repository-section';
import { DeploymentSection } from '@/components/project/deployment-section';

// Types
interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  impact: 'high' | 'medium' | 'low';
}

interface TechnicalDetail {
  framework: string[];
  languages: string[];
  apis: string[];
  deployment: string;
  scalability: string;
  security: string;
}

interface BusinessMetric {
  metric: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface AIInsight {
  type: 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [implementationPrompt, setImplementationPrompt] = useState('');
  const [showPromptCustomizer, setShowPromptCustomizer] = useState(false);
  const [promptConfig, setPromptConfig] = useState({
    includeAuth: true,
    includeDatabase: true,
    includePayments: true,
    includeAnalytics: false,
    includeTests: true,
    includeDocs: false,
    deploymentTarget: 'vercel',
    techStack: 'react-nextjs',
    complexity: 'production',
    additionalFeatures: '',
    customInstructions: '',
    specializedPrompts: [] as string[]
  });
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([]);
  const [promptCategories, setPromptCategories] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    problem: '',
    solution: '',
    category: '',
    targetUsers: '',
    revenueModel: '',
    keyFeatures: [] as string[],
    tags: [] as string[]
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch project data
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId
  });

  // Populate edit form when project loads
  useEffect(() => {
    if (project) {
      setEditForm({
        title: project.title || '',
        problem: project.problem || '',
        solution: project.solution || '',
        category: project.category || '',
        targetUsers: project.target_users || '',
        revenueModel: project.revenue_model || '',
        keyFeatures: project.key_features || [],
        tags: project.tags || []
      });
    }
  }, [project]);

  // Fetch specialized prompts
  useEffect(() => {
    const fetchSpecializedPrompts = async () => {
      try {
        const response = await fetch('/api/specialized-prompts');
        if (response.ok) {
          const data = await response.json();
          setAvailablePrompts(data.prompts || []);
          setPromptCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching specialized prompts:', error);
      }
    };

    fetchSpecializedPrompts();
  }, []);

  // Calculate additional metrics
  const projectMetrics = useMemo(() => {
    if (!project) return null;

    const revenue = project.revenue_potential?.realistic || 0;
    const cost = revenue * 0.3; // Simulated cost as 30% of revenue
    const createdAt = new Date(); // Using current date as projects don't have createdAt
    
    return {
      completionPercentage: Math.floor(Math.random() * 40 + 60), // Simulated progress
      daysInDevelopment: Math.floor(Math.random() * 90 + 30), // Simulated days
      roi: revenue > 0 ? ((revenue - cost) / cost * 100).toFixed(1) : '0',
      marketShare: (Math.random() * 15 + 5).toFixed(1), // Simulated
      userSatisfaction: (Math.random() * 1.5 + 8).toFixed(1), // Simulated
      performanceScore: (Math.random() * 20 + 80).toFixed(0) // Simulated
    };
  }, [project]);

  // Generate milestones
  const milestones: Milestone[] = useMemo(() => {
    if (!project) return [];

    return [
      {
        id: '1',
        title: 'Project Kickoff',
        description: 'Initial planning and requirements gathering',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        impact: 'high'
      },
      {
        id: '2',
        title: 'MVP Release',
        description: 'First working version with core features',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        impact: 'high'
      },
      {
        id: '3',
        title: 'User Testing Phase',
        description: 'Gathering feedback from beta users',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in-progress',
        impact: 'medium'
      },
      {
        id: '4',
        title: 'Production Launch',
        description: 'Full public release with marketing campaign',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        impact: 'high'
      }
    ];
  }, [project]);

  // Generate technical details
  const technicalDetails: TechnicalDetail = useMemo(() => ({
    framework: ['React', 'Next.js', 'TypeScript'],
    languages: ['TypeScript', 'JavaScript', 'CSS'],
    apis: ['REST API', 'GraphQL', 'WebSocket'],
    deployment: 'Vercel / AWS',
    scalability: 'Horizontal scaling with load balancing',
    security: 'OAuth 2.0, JWT, SSL/TLS encryption'
  }), []);

  // Generate business metrics
  const businessMetrics: BusinessMetric[] = useMemo(() => [
    { metric: 'Monthly Revenue', value: `$${formatNumber(project?.revenue_potential?.realistic || 0)}`, trend: 'up', change: 12.5 },
    { metric: 'Active Users', value: formatNumber(Math.floor(Math.random() * 10000 + 1000)), trend: 'up', change: 8.3 },
    { metric: 'Conversion Rate', value: '3.2%', trend: 'stable', change: 0.1 },
    { metric: 'Churn Rate', value: '5.1%', trend: 'down', change: -1.2 },
    { metric: 'Support Tickets', value: '24/week', trend: 'down', change: -15.0 },
    { metric: 'Feature Adoption', value: '67%', trend: 'up', change: 5.5 }
  ], [project]);

  // Generate AI insights
  const aiInsights: AIInsight[] = useMemo(() => [
    {
      type: 'opportunity',
      title: 'Mobile App Expansion',
      description: 'Based on user behavior patterns, developing a mobile app could increase engagement by 40%',
      priority: 'high',
      actionItems: [
        'Research mobile framework options',
        'Create mobile UI/UX designs',
        'Develop MVP for iOS/Android'
      ]
    },
    {
      type: 'risk',
      title: 'Scaling Infrastructure',
      description: 'Current growth rate suggests infrastructure limits will be reached in 2-3 months',
      priority: 'high',
      actionItems: [
        'Implement auto-scaling policies',
        'Optimize database queries',
        'Consider CDN implementation'
      ]
    },
    {
      type: 'recommendation',
      title: 'Feature Prioritization',
      description: 'User feedback indicates strong demand for collaboration features',
      priority: 'medium',
      actionItems: [
        'Survey users about specific needs',
        'Design collaboration workflows',
        'Plan implementation roadmap'
      ]
    }
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-1/3" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load project details. Please try again.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4"
          onClick={() => router.push('/projects')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const categoryDef = getCategoryDefinition(project.category);
  const categoryGradient = getCategoryGradient(project.category);

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  setIsEnhancing(true);
                  try {
                    const response = await fetch(`/api/projects/${projectId}/enhance`, {
                      method: 'POST'
                    });
                    if (response.ok) {
                      const enhanced = await response.json();
                      // Refresh the page to show updated data
                      router.refresh();
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Enhancement failed:', error);
                  } finally {
                    setIsEnhancing(false);
                  }
                }}
                disabled={isEnhancing}
              >
                {isEnhancing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPromptCustomizer(true)}
              >
                <Code className="h-4 w-4 mr-2" />
                Get Prompt
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url).then(() => {
                    alert('Project link copied to clipboard!');
                  }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Project link copied to clipboard!');
                  });
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Create and download JSON export of project
                  const projectData = {
                    ...project,
                    exportedAt: new Date().toISOString(),
                    exportedBy: 'Masterlist App'
                  };
                  
                  const dataStr = JSON.stringify(projectData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-export.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground text-lg">{project.solution}</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className={cn("bg-gradient-to-r", categoryGradient, "text-white")}>
                  {project.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{project.quality_score?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className="text-muted-foreground">
                  {project.development_time || 'Timeline TBD'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${formatNumber(project.revenue_potential?.realistic || 0)}</p>
              <p className="text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 md:grid-cols-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics?.completionPercentage}%</div>
              <Progress value={projectMetrics?.completionPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics?.roi}%</div>
              <p className="text-xs text-muted-foreground">Return on Investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Share</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics?.marketShare}%</div>
              <p className="text-xs text-muted-foreground">In category</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics?.userSatisfaction}</div>
              <p className="text-xs text-muted-foreground">Out of 10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics?.performanceScore}</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dev Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectMetrics?.daysInDevelopment}</div>
              <p className="text-xs text-muted-foreground">Since start</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{project.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="default">
                        Active
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(project.tags || []).map((tag) => (
                          <Badge key={tag} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Complexity</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(project.technical_complexity || 0) * 10} className="flex-1" />
                        <span className="text-sm font-medium">{project.technical_complexity || 0}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {businessMetrics.slice(0, 4).map((metric) => (
                        <div key={metric.metric} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{metric.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{metric.value}</span>
                            <Badge 
                              variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.change)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {milestones.filter(m => m.status === 'completed').map((milestone) => (
                      <div key={milestone.id} className="flex items-start gap-4">
                        <div className="mt-1">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(milestone.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Tech Stack */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Frameworks</p>
                      <div className="flex flex-wrap gap-2">
                        {technicalDetails.framework.map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {technicalDetails.languages.map((lang) => (
                          <Badge key={lang} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">APIs</p>
                      <div className="flex flex-wrap gap-2">
                        {technicalDetails.apis.map((api) => (
                          <Badge key={api} variant="secondary">{api}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Infrastructure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Infrastructure & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Deployment</p>
                      <p className="font-medium">{technicalDetails.deployment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Scalability</p>
                      <p className="font-medium">{technicalDetails.scalability}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Security</p>
                      <p className="font-medium">{technicalDetails.security}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Score</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={parseInt(projectMetrics?.performanceScore || '0')} className="flex-1" />
                        <span className="font-medium">{projectMetrics?.performanceScore}/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Code Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Code Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Test Coverage</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Code Complexity</p>
                      <p className="text-2xl font-bold">Low</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Technical Debt</p>
                      <p className="text-2xl font-bold">2.3%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Build Time</p>
                      <p className="text-2xl font-bold">1.2m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Repository Integration */}
              <RepositorySection 
                projectId={project.id}
                projectTitle={project.title}
                projectCategory={project.category}
              />

              {/* Deployment Management */}
              <DeploymentSection projectId={project.id} />
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Revenue Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Revenue Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                        <p className="text-2xl font-bold">${formatNumber(project.revenue_potential?.realistic || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="text-xl font-semibold">${formatNumber((project.revenue_potential?.realistic || 0) * 0.3)}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Net Profit</p>
                        <p className="text-xl font-semibold text-green-600">
                          ${formatNumber((project.revenue_potential?.realistic || 0) * 0.7)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-xl font-semibold">{projectMetrics?.roi}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Market Share</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={parseFloat(projectMetrics?.marketShare || '0')} className="flex-1" />
                          <span className="font-medium">{projectMetrics?.marketShare}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Competition Level</p>
                        <Badge variant="outline">Medium</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth Potential</p>
                        <Badge className="bg-green-100 text-green-700">High</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Market Maturity</p>
                        <Badge variant="secondary">Growing</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Business Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {businessMetrics.map((metric) => (
                      <div key={metric.metric} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{metric.metric}</p>
                          <Badge 
                            variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {Math.abs(metric.change)}%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{projectMetrics?.completionPercentage}% Complete</span>
                      <Badge variant="secondary">
                        {projectMetrics?.daysInDevelopment} days in development
                      </Badge>
                    </div>
                    <Progress value={projectMetrics?.completionPercentage} className="h-4" />
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Project Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {milestones.map((milestone, index) => (
                      <div key={milestone.id} className="relative">
                        {index < milestones.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
                        )}
                        <div className="flex items-start gap-4">
                          <div className="relative z-10 mt-1">
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="h-10 w-10 text-green-500 bg-background rounded-full" />
                            ) : milestone.status === 'in-progress' ? (
                              <div className="h-10 w-10 rounded-full border-4 border-blue-500 bg-background animate-pulse" />
                            ) : (
                              <div className="h-10 w-10 rounded-full border-4 border-muted bg-background" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{milestone.title}</h4>
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              </div>
                              <Badge 
                                variant={
                                  milestone.impact === 'high' ? 'destructive' : 
                                  milestone.impact === 'medium' ? 'default' : 
                                  'secondary'
                                }
                              >
                                {milestone.impact} impact
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {formatDate(milestone.date)}
                              </span>
                              <Badge 
                                variant={
                                  milestone.status === 'completed' ? 'secondary' :
                                  milestone.status === 'in-progress' ? 'default' :
                                  'outline'
                                }
                              >
                                {milestone.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Insights Overview */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
                    <LightbulbIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {aiInsights.filter(i => i.type === 'opportunity').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Growth opportunities identified</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risks</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {aiInsights.filter(i => i.type === 'risk').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Potential risks to address</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {aiInsights.filter(i => i.type === 'recommendation').length}
                    </div>
                    <p className="text-xs text-muted-foreground">AI-powered suggestions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Insights */}
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {insight.type === 'opportunity' ? (
                            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                          ) : insight.type === 'risk' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Brain className="h-5 w-5 text-blue-500" />
                          )}
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </div>
                        <Badge 
                          variant={
                            insight.priority === 'high' ? 'destructive' : 
                            insight.priority === 'medium' ? 'default' : 
                            'secondary'
                          }
                        >
                          {insight.priority} priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{insight.description}</p>
                      <div>
                        <p className="text-sm font-medium mb-2">Action Items:</p>
                        <ul className="space-y-1">
                          {insight.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.title} is performing well with a {projectMetrics?.roi}% ROI and {projectMetrics?.userSatisfaction}/10 user satisfaction score. 
                    The project has completed {projectMetrics?.completionPercentage}% of its roadmap in {projectMetrics?.daysInDevelopment} days. 
                    Key opportunities include mobile expansion and enhanced collaboration features, while infrastructure scaling needs attention. 
                    Overall market position is strong with {projectMetrics?.marketShare}% share in the {project.category} category.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Implementation Prompt Dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Implementation Prompt for {project.title}</DialogTitle>
            <DialogDescription>
              Copy this prompt to use with any AI coding assistant to implement this project.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(implementationPrompt);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">{implementationPrompt}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project: {project.title}</DialogTitle>
            <DialogDescription>
              Update project details and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VSCode Extension">VSCode Extension</SelectItem>
                    <SelectItem value="Chrome Extension">Chrome Extension</SelectItem>
                    <SelectItem value="Figma Plugin">Figma Plugin</SelectItem>
                    <SelectItem value="Notion Templates">Notion Templates</SelectItem>
                    <SelectItem value="Obsidian Plugin">Obsidian Plugin</SelectItem>
                    <SelectItem value="AI Browser Tools">AI Browser Tools</SelectItem>
                    <SelectItem value="Crypto Browser Tools">Crypto Browser Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem">Problem Statement</Label>
              <Textarea
                id="problem"
                value={editForm.problem}
                onChange={(e) => setEditForm(prev => ({ ...prev, problem: e.target.value }))}
                placeholder="Describe the problem this project solves"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution Description</Label>
              <Textarea
                id="solution"
                value={editForm.solution}
                onChange={(e) => setEditForm(prev => ({ ...prev, solution: e.target.value }))}
                placeholder="Describe how this project solves the problem"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetUsers">Target Users</Label>
              <Textarea
                id="targetUsers"
                value={editForm.targetUsers}
                onChange={(e) => setEditForm(prev => ({ ...prev, targetUsers: e.target.value }))}
                placeholder="Describe the target user base"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenueModel">Revenue Model</Label>
              <Textarea
                id="revenueModel"
                value={editForm.revenueModel}
                onChange={(e) => setEditForm(prev => ({ ...prev, revenueModel: e.target.value }))}
                placeholder="Describe the revenue model and pricing strategy"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyFeatures">Key Features (one per line)</Label>
              <Textarea
                id="keyFeatures"
                value={editForm.keyFeatures.join('\n')}
                onChange={(e) => setEditForm(prev => ({ 
                  ...prev, 
                  keyFeatures: e.target.value.split('\n').filter(f => f.trim()) 
                }))}
                placeholder="Enter key features, one per line"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editForm.tags.join(', ')}
                onChange={(e) => setEditForm(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                }))}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  setIsUpdating(true);
                  try {
                    const response = await fetch(`/api/projects/${projectId}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: editForm.title,
                        problem: editForm.problem,
                        solution: editForm.solution,
                        category: editForm.category,
                        targetUsers: editForm.targetUsers,
                        revenueModel: editForm.revenueModel,
                        keyFeatures: JSON.stringify(editForm.keyFeatures),
                        tags: JSON.stringify(editForm.tags)
                      }),
                    });

                    if (response.ok) {
                      setShowEditDialog(false);
                      router.refresh();
                      window.location.reload();
                    } else {
                      alert('Failed to update project');
                    }
                  } catch (error) {
                    console.error('Update failed:', error);
                    alert('Failed to update project');
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Project'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive Prompt Customizer */}
      <Dialog open={showPromptCustomizer} onOpenChange={setShowPromptCustomizer}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customize Implementation Prompt</DialogTitle>
            <DialogDescription>
              Configure your implementation requirements to generate a tailored prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-6">
            {/* Tech Stack Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Technology Stack</Label>
              <Select value={promptConfig.techStack} onValueChange={(value) => setPromptConfig(prev => ({ ...prev, techStack: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tech stack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react-nextjs">React + Next.js</SelectItem>
                  <SelectItem value="vue-nuxt">Vue + Nuxt.js</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="svelte">Svelte/SvelteKit</SelectItem>
                  <SelectItem value="vanilla-js">Vanilla JavaScript</SelectItem>
                  <SelectItem value="typescript-node">TypeScript + Node.js</SelectItem>
                  <SelectItem value="python-django">Python + Django</SelectItem>
                  <SelectItem value="python-fastapi">Python + FastAPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Complexity Level */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Implementation Complexity</Label>
              <Select value={promptConfig.complexity} onValueChange={(value) => setPromptConfig(prev => ({ ...prev, complexity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complexity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mvp">MVP - Basic functionality only</SelectItem>
                  <SelectItem value="standard">Standard - Core features with polish</SelectItem>
                  <SelectItem value="production">Production - Full-featured and scalable</SelectItem>
                  <SelectItem value="enterprise">Enterprise - Advanced features and security</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deployment Target */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Deployment Platform</Label>
              <Select value={promptConfig.deploymentTarget} onValueChange={(value) => setPromptConfig(prev => ({ ...prev, deploymentTarget: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select deployment target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vercel">Vercel</SelectItem>
                  <SelectItem value="netlify">Netlify</SelectItem>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="digital-ocean">DigitalOcean</SelectItem>
                  <SelectItem value="heroku">Heroku</SelectItem>
                  <SelectItem value="docker">Docker + Self-hosted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Include Features</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auth"
                    checked={promptConfig.includeAuth}
                    onCheckedChange={(checked) => setPromptConfig(prev => ({ ...prev, includeAuth: checked }))}
                  />
                  <Label htmlFor="auth" className="text-sm">User Authentication</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="database"
                    checked={promptConfig.includeDatabase}
                    onCheckedChange={(checked) => setPromptConfig(prev => ({ ...prev, includeDatabase: checked }))}
                  />
                  <Label htmlFor="database" className="text-sm">Database Integration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="payments"
                    checked={promptConfig.includePayments}
                    onCheckedChange={(checked) => setPromptConfig(prev => ({ ...prev, includePayments: checked }))}
                  />
                  <Label htmlFor="payments" className="text-sm">Payment Processing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="analytics"
                    checked={promptConfig.includeAnalytics}
                    onCheckedChange={(checked) => setPromptConfig(prev => ({ ...prev, includeAnalytics: checked }))}
                  />
                  <Label htmlFor="analytics" className="text-sm">Analytics & Tracking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tests"
                    checked={promptConfig.includeTests}
                    onCheckedChange={(checked) => setPromptConfig(prev => ({ ...prev, includeTests: checked }))}
                  />
                  <Label htmlFor="tests" className="text-sm">Unit Tests</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="docs"
                    checked={promptConfig.includeDocs}
                    onCheckedChange={(checked) => setPromptConfig(prev => ({ ...prev, includeDocs: checked }))}
                  />
                  <Label htmlFor="docs" className="text-sm">Documentation</Label>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="space-y-3">
              <Label htmlFor="additionalFeatures" className="text-base font-medium">Additional Features</Label>
              <Textarea
                id="additionalFeatures"
                value={promptConfig.additionalFeatures}
                onChange={(e) => setPromptConfig(prev => ({ ...prev, additionalFeatures: e.target.value }))}
                placeholder="List any additional features you want included (e.g., real-time notifications, file uploads, admin dashboard)"
                rows={3}
              />
            </div>

            {/* Custom Instructions */}
            <div className="space-y-3">
              <Label htmlFor="customInstructions" className="text-base font-medium">Custom Instructions</Label>
              <Textarea
                id="customInstructions"
                value={promptConfig.customInstructions}
                onChange={(e) => setPromptConfig(prev => ({ ...prev, customInstructions: e.target.value }))}
                placeholder="Add any specific requirements, constraints, or preferences for the implementation"
                rows={3}
              />
            </div>

            {/* Specialized Prompts */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Specialized Implementation Aspects</Label>
                <p className="text-sm text-muted-foreground">
                  Select specialized aspects to include comprehensive guidance for your implementation
                </p>
              </div>
              
              {promptCategories.length > 0 && (
                <div className="space-y-4">
                  {promptCategories.map(category => {
                    const categoryPrompts = availablePrompts.filter(p => p.category === category);
                    return (
                      <div key={category} className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {categoryPrompts.map(prompt => (
                            <div
                              key={prompt.id}
                              className={cn(
                                "p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                                promptConfig.specializedPrompts.includes(prompt.id)
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              )}
                              onClick={() => {
                                setPromptConfig(prev => ({
                                  ...prev,
                                  specializedPrompts: prev.specializedPrompts.includes(prompt.id)
                                    ? prev.specializedPrompts.filter(id => id !== prompt.id)
                                    : [...prev.specializedPrompts, prompt.id]
                                }));
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={promptConfig.specializedPrompts.includes(prompt.id)}
                                      onChange={() => {}} // Handled by div onClick
                                    />
                                    <h5 className="font-medium text-sm">{prompt.title}</h5>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {prompt.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {availablePrompts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <LightbulbIcon className="w-6 h-6" />
                  </div>
                  <p className="text-sm">Loading specialized prompts...</p>
                </div>
              )}
              
              {promptConfig.specializedPrompts.length > 0 && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    {promptConfig.specializedPrompts.length} specialized aspect{promptConfig.specializedPrompts.length === 1 ? '' : 's'} selected
                  </p>
                  <p className="text-xs text-primary/80 mt-1">
                    These will be integrated into your implementation prompt with detailed guidelines and best practices.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowPromptCustomizer(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    // Create query parameters from config
                    const params = new URLSearchParams();
                    Object.entries(promptConfig).forEach(([key, value]) => {
                      if (Array.isArray(value)) {
                        params.append(key, value.join(','));
                      } else {
                        params.append(key, String(value));
                      }
                    });
                    
                    const response = await fetch(`/api/projects/${projectId}/enhance?${params.toString()}`);
                    if (response.ok) {
                      const data = await response.json();
                      setImplementationPrompt(data.prompt);
                      setShowPromptCustomizer(false);
                      setShowPrompt(true);
                    }
                  } catch (error) {
                    console.error('Failed to generate prompt:', error);
                  }
                }}
              >
                Generate Custom Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}