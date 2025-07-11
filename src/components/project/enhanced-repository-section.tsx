'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, Plus, ExternalLink, RotateCcw, Settings, FileCode,
  CheckCircle, Clock, AlertCircle, Code, Star, GitPullRequest,
  Download, Upload, RefreshCw, Archive, Eye, Shield, Zap,
  Terminal, Package, Workflow, GitCommit, GitMerge, Users,
  Bug, Beaker, Rocket, Globe, Lock, Unlock, Copy, Check,
  FileText, FolderOpen, Database, Cloud, Cpu, Activity,
  Sparkles, Layers, Target, Github, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

// Types
import type { RepositoryWithDetails, SyncResult } from '@/types/repository';

// Custom components
import { TechStackBuilder, TECH_STACK_DB } from './tech-stack-builder';
import { analyzeMarketFit, generateMarketBasedContext } from '@/lib/market-intelligence';
import { 
  REPOSITORY_TEMPLATES, 
  getTemplate, 
  generateRepositoryFiles,
  getAllTemplates 
} from '@/lib/templates/repository-templates';

interface EnhancedRepositorySectionProps {
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectTags?: string[];
  projectComplexity?: number;
  project?: any; // Full project data for AI generation
}

// Map template IDs for backward compatibility
const TEMPLATE_ID_MAP: Record<string, string> = {
  'webapp': 'webapp-nextjs',
  'api': 'api-express',
  'mobile': 'mobile-react-native',
  'ai-ml': 'ai-ml-python',
  'microservice': 'microservice-go',
  'cli': 'cli-tool'
};

// Icon mapping for templates
const TEMPLATE_ICONS: Record<string, any> = {
  'Globe': Globe,
  'Database': Database,
  'Smartphone': Package,
  'Brain': Cpu,
  'Zap': Zap,
  'Terminal': Terminal
};

// Advanced setup options
const SETUP_OPTIONS = {
  ci_cd: {
    label: 'CI/CD Pipeline',
    description: 'GitHub Actions for automated testing and deployment',
    icon: Workflow
  },
  docker: {
    label: 'Docker Configuration',
    description: 'Dockerfile and docker-compose setup',
    icon: Package
  },
  testing: {
    label: 'Testing Framework',
    description: 'Unit and integration testing setup',
    icon: Beaker
  },
  linting: {
    label: 'Code Quality Tools',
    description: 'ESLint, Prettier, and Husky pre-commit hooks',
    icon: Shield
  },
  docs: {
    label: 'Documentation',
    description: 'API docs, JSDoc, and README templates',
    icon: FileText
  },
  monitoring: {
    label: 'Monitoring & Analytics',
    description: 'Error tracking and performance monitoring',
    icon: Activity
  }
};

// Helper function to suggest tech stack based on category and tags
function getSuggestedTechStack(category: string, tags: string[]): Record<string, string[]> {
  const stack: Record<string, string[]> = {};
  const lowerTags = tags.map(t => t.toLowerCase());
  const lowerCategory = category.toLowerCase();
  
  // Frontend suggestions
  if (lowerCategory.includes('web') || lowerCategory.includes('app')) {
    stack.frontend = ['nextjs', 'tailwind', 'shadcn'];
    if (lowerTags.includes('ai') || lowerTags.includes('ml')) {
      stack.frontend.push('tanstack-query');
    }
  } else if (lowerCategory.includes('mobile')) {
    stack.frontend = ['react-native', 'expo'];
  }
  
  // Backend suggestions
  if (lowerTags.includes('ai') || lowerTags.includes('ml')) {
    stack.backend = ['python', 'fastapi'];
    stack.ai = ['openai', 'langchain'];
  } else if (lowerCategory.includes('api')) {
    stack.backend = ['nodejs', 'express', 'typescript'];
  } else {
    stack.backend = ['nodejs', 'nestjs'];
  }
  
  // Database suggestions
  if (lowerTags.includes('ai') || lowerTags.includes('vector')) {
    stack.database = ['postgresql', 'pinecone'];
  } else if (lowerTags.includes('real-time') || lowerTags.includes('realtime')) {
    stack.database = ['postgresql', 'redis'];
  } else {
    stack.database = ['postgresql', 'prisma'];
  }
  
  // DevOps suggestions
  stack.devops = ['docker', 'github-actions'];
  if (lowerTags.includes('enterprise') || lowerTags.includes('scale')) {
    stack.devops.push('kubernetes', 'prometheus');
  }
  
  // Testing suggestions
  stack.testing = ['vitest', 'playwright'];
  
  return stack;
}

export function EnhancedRepositorySection({ 
  projectId, 
  projectTitle, 
  projectCategory,
  projectTags = [],
  projectComplexity = 5,
  project
}: EnhancedRepositorySectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  const [selectedTemplate, setSelectedTemplate] = useState('webapp-nextjs');
  const [setupOptions, setSetupOptions] = useState<string[]>(['ci_cd', 'testing', 'linting']);
  // Initialize with empty settings first
  const [repoSettings, setRepoSettings] = useState({
    name: '',
    description: '',
    isPrivate: true,
    autoInit: true,
    license: 'MIT',
    gitignore: 'Node',
    branch: 'main'
  });
  
  // GitHub status and error handling
  const [gitHubError, setGitHubError] = useState<string | null>(null);
  const [gitHubSetupInstructions, setGitHubSetupInstructions] = useState<any>(null);
  const [showGitHubSetup, setShowGitHubSetup] = useState(false);
  
  // Advanced custom setup state
  const [customTechStack, setCustomTechStack] = useState<Record<string, string[]>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [useAiGeneration, setUseAiGeneration] = useState(false);
  const [projectComplexityLevel, setProjectComplexityLevel] = useState([5]);
  const [additionalContext, setAdditionalContext] = useState({
    targetAudience: '',
    mainFeatures: '',
    scalabilityNeeds: '',
    performanceRequirements: '',
    securityRequirements: '',
    integrations: ''
  });

  // Generate repository name based on category-subcategory-project-name convention
  const generateRepoName = () => {
    const category = projectCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const template = getTemplate(selectedTemplate);
    const subcategory = template ? template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : selectedTemplate;
    const projectName = projectTitle.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30); // Leave room for category and subcategory
    
    return `${category}-${subcategory}-${projectName}`.substring(0, 100);
  };
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  // Set default repository name when dialog opens or template changes
  useEffect(() => {
    if (showCreateDialog) {
      setRepoSettings(prev => ({
        ...prev,
        name: generateRepoName()
      }));
      
      // For AI-powered setup, auto-populate from project details
      if (activeTab === 'advanced') {
        // Generate market-based context
        const projectDescription = `${project?.problem || ''} ${project?.solution || ''}`;
        const marketContext = generateMarketBasedContext(
          projectCategory, 
          projectTags, 
          projectDescription
        );
        
        // Analyze market fit
        const marketAnalysis = analyzeMarketFit(
          projectCategory,
          projectTags,
          projectDescription
        );
        
        // Generate enhanced AI prompt with market insights
        const autoPrompt = `Create a ${projectCategory} application: ${projectTitle}. 

Problem to solve: ${project?.problem || 'Not specified'}
Solution approach: ${project?.solution || 'Not specified'}

Market Analysis (2025 Trends):
- Market Demand Score: ${marketAnalysis.marketScore}/100
- ${marketContext.marketAnalysis.recommendation}
- Target Audiences: ${marketContext.targetAudience}
- Trending Features: ${marketAnalysis.recommendedFeatures.slice(0, 5).join(', ')}

Technical Requirements:
- Scalability: ${marketContext.scalabilityNeeds}
- Performance: ${Object.entries(marketAnalysis.performanceTargets).slice(0, 3).map(([k, v]) => `${k} ${v}`).join(', ')}
- Security Level: ${marketAnalysis.securityLevel}

Please create a repository that leverages these market insights and includes the trending features that align with current market demand.`;
        
        setAiPrompt(autoPrompt.trim());
        
        // Auto-populate context fields with market intelligence
        setAdditionalContext({
          targetAudience: marketContext.targetAudience,
          mainFeatures: marketContext.mainFeatures,
          scalabilityNeeds: marketContext.scalabilityNeeds,
          performanceRequirements: marketContext.performanceRequirements,
          securityRequirements: marketContext.securityRequirements,
          integrations: marketContext.integrations
        });
        
        // Set complexity from project
        setProjectComplexityLevel([projectComplexity || 5]);
        
        // Auto-select relevant tech stack based on category and tags
        const suggestedStack = getSuggestedTechStack(projectCategory, projectTags);
        setCustomTechStack(suggestedStack);
      }
    }
  }, [showCreateDialog, selectedTemplate, activeTab, projectTitle, projectCategory, projectTags, projectComplexity]);

  // Fetch repository for this project
  const { data: repository, isLoading } = useQuery<RepositoryWithDetails>({
    queryKey: ['project-repository', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/repositories?projectId=${projectId}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch repository');
      const data = await response.json();
      return data.repositories?.[0] || null;
    }
  });
  
  // Fetch GitHub status
  const { data: githubStatus, isLoading: isGithubStatusLoading } = useQuery({
    queryKey: ['github-status'],
    queryFn: async () => {
      const response = await fetch('/api/github/status?include_instructions=true');
      if (!response.ok) {
        throw new Error('Failed to check GitHub status');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Enhanced create repository mutation
  const createRepositoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/repositories/create-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (!response.ok) {
        // Enhanced error handling with GitHub status information
        const error = new Error(result.error || 'Failed to create repository');
        (error as any).details = result;
        throw error;
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-repository', projectId] });
      setShowCreateDialog(false);
      
      // Show success message with mode information
      if (data.mode === 'local') {
        setGitHubError('Repository created locally. GitHub is not configured - see setup instructions below.');
      } else {
        setGitHubError(null);
      }
      
      // Reset form
      setRepoSettings({
        name: '',
        description: '',
        isPrivate: true,
        autoInit: true,
        license: 'MIT',
        gitignore: 'Node',
        branch: 'main'
      });
      setSelectedTemplate('webapp'); // Reset to default template
    },
    onError: (error: any) => {
      console.error('Repository creation error:', error);
      if (error.details?.githubStatus) {
        setGitHubError(error.details.githubStatus.errorMessage || 'GitHub configuration error');
        setGitHubSetupInstructions(error.details.setupInstructions || null);
      } else {
        setGitHubError(error.message || 'Failed to create repository');
      }
    }
  });

  const handleCreateRepository = () => {
    if (activeTab === 'advanced') {
      // Advanced AI-powered creation
      const selectedTechIds = Object.values(customTechStack).flat();
      const techStackDetails = selectedTechIds.map(techId => {
        const tech = Object.values(TECH_STACK_DB)
          .flatMap(category => Object.values(category))
          .flat()
          .find((t: any) => t.id === techId);
        return tech;
      }).filter(Boolean);

      createRepositoryMutation.mutate({
        projectId,
        template: 'custom',
        settings: {
          ...repoSettings,
          name: repoSettings.name || generateRepoName(),
          description: repoSettings.description || `${projectTitle} - Advanced custom repository`
        },
        setupOptions,
        techStack: selectedTechIds,
        techStackDetails,
        aiConfig: useAiGeneration ? {
          prompt: aiPrompt,
          context: additionalContext,
          complexity: projectComplexityLevel[0]
        } : null,
        projectMetadata: {
          category: projectCategory,
          tags: projectTags,
          complexity: projectComplexityLevel[0]
        }
      });
    } else {
      // Quick or Custom setup
      const template = getTemplate(selectedTemplate);
      
      createRepositoryMutation.mutate({
        projectId,
        template: selectedTemplate,
        settings: {
          ...repoSettings,
          name: repoSettings.name || generateRepoName(),
          description: repoSettings.description || `${projectTitle} - ${template.description}`
        },
        setupOptions,
        techStack: template.techStack,
        projectMetadata: {
          category: projectCategory,
          tags: projectTags,
          complexity: projectComplexity
        }
      });
    }
  };

  const copyCloneCommand = () => {
    if (repository?.githubUrl) {
      navigator.clipboard.writeText(`git clone ${repository.githubUrl}.git`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!repository) {
    return (
      <>
        {/* GitHub Status Section */}
        {githubStatus && !githubStatus.githubStatus?.isConfigured && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>GitHub Not Configured</AlertTitle>
            <AlertDescription>
              GitHub integration is not set up. You can still create repositories locally, but they won't be backed up to GitHub.
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowGitHubSetup(true)}
              >
                View Setup Instructions
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* GitHub Error Display */}
        {gitHubError && (
          <Alert className="mb-4" variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Repository Creation Issue</AlertTitle>
            <AlertDescription>
              {gitHubError}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repository Management
              {githubStatus?.githubStatus?.isConfigured && (
                <Badge variant="outline" className="ml-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  GitHub Connected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Set up version control and development environment for your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Rocket className="h-4 w-4" />
              <AlertDescription>
                Create a repository to enable version control, automated workflows, and collaborative development.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                setActiveTab('quick');
                setShowCreateDialog(true);
              }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Quick Setup</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Instantly create a repository with smart defaults based on your project type
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                setActiveTab('custom');
                setShowCreateDialog(true);
              }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Custom Setup</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full control over repository configuration, templates, and integrations
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow border-gradient" onClick={() => {
                setActiveTab('advanced');
                setShowCreateDialog(true);
              }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">AI-Powered Setup</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Describe your vision and let AI create the perfect tech stack and structure
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Create Repository Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Repository</DialogTitle>
              <DialogDescription>
                Set up a new repository with automated configuration and best practices
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="quick">Quick Setup</TabsTrigger>
                <TabsTrigger value="custom">Custom Setup</TabsTrigger>
                <TabsTrigger value="advanced">Advanced AI Setup</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Select Template</Label>
                    <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate} className="mt-2">
                      <div className="grid gap-3">
                        {getAllTemplates().map((template) => {
                          const Icon = TEMPLATE_ICONS[template.icon] || Globe;
                          return (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Label
                                htmlFor={template.id}
                                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                  selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="h-4 w-4" />
                                    <span className="font-medium">{template.name}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {template.features.slice(0, 5).map((feature) => (
                                      <Badge key={feature} variant="secondary" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </Label>
                          </motion.div>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Repository Name</Label>
                    <Input
                      value={repoSettings.name}
                      onChange={(e) => setRepoSettings({ ...repoSettings, name: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: category-subcategory-project-name
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private"
                      checked={repoSettings.isPrivate}
                      onCheckedChange={(checked) => setRepoSettings({ ...repoSettings, isPrivate: checked })}
                    />
                    <Label htmlFor="private" className="flex items-center gap-2">
                      {repoSettings.isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      {repoSettings.isPrivate ? 'Private Repository' : 'Public Repository'}
                    </Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label>Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllTemplates().map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Repository Name</Label>
                    <Input
                      value={repoSettings.name}
                      onChange={(e) => setRepoSettings({ ...repoSettings, name: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: category-subcategory-project-name
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Branch</Label>
                    <Select
                      value={repoSettings.branch}
                      onValueChange={(value) => setRepoSettings({ ...repoSettings, branch: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">main</SelectItem>
                        <SelectItem value="master">master</SelectItem>
                        <SelectItem value="develop">develop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="A brief description of your project"
                    value={repoSettings.description}
                    onChange={(e) => setRepoSettings({ ...repoSettings, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>License</Label>
                    <Select
                      value={repoSettings.license}
                      onValueChange={(value) => setRepoSettings({ ...repoSettings, license: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MIT">MIT License</SelectItem>
                        <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                        <SelectItem value="GPL-3.0">GPL v3</SelectItem>
                        <SelectItem value="BSD-3">BSD 3-Clause</SelectItem>
                        <SelectItem value="none">No License</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>.gitignore Template</Label>
                    <Select
                      value={repoSettings.gitignore}
                      onValueChange={(value) => setRepoSettings({ ...repoSettings, gitignore: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Node">Node.js</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="Go">Go</SelectItem>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Setup Options</Label>
                  <div className="grid gap-3">
                    {Object.entries(SETUP_OPTIONS).map(([key, option]) => (
                      <div key={key} className="flex items-start space-x-3">
                        <Checkbox
                          id={key}
                          checked={setupOptions.includes(key)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSetupOptions([...setupOptions, key]);
                            } else {
                              setSetupOptions(setupOptions.filter(opt => opt !== key));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Advanced AI Setup Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-6">
                  {/* AI-Powered Generation Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="ai-generation" className="text-base font-semibold">
                          AI-Powered Repository Generation
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Use AI to generate a complete project structure based on your requirements
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="ai-generation"
                      checked={useAiGeneration}
                      onCheckedChange={setUseAiGeneration}
                      defaultChecked={true}
                    />
                  </div>
                  
                  {/* Auto-populated Notice */}
                  {project && (
                    <div className="space-y-4">
                      <Alert className="border-purple-200 bg-purple-50">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-purple-900">
                          Project details have been automatically loaded from your project configuration. 
                          The AI prompt, context fields, and suggested tech stack have been pre-filled based on your project's category, tags, and requirements.
                        </AlertDescription>
                      </Alert>
                      
                      {/* Market Analysis Card */}
                      <Card className="border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold">Market Intelligence Analysis</h4>
                          </div>
                          <div className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Market Demand Score</span>
                              <div className="flex items-center gap-2">
                                <Progress value={(() => {
                                  const analysis = analyzeMarketFit(projectCategory, projectTags, `${project?.problem || ''} ${project?.solution || ''}`);
                                  return analysis.marketScore;
                                })()} className="w-24" />
                                <Badge variant="secondary">
                                  {(() => {
                                    const analysis = analyzeMarketFit(projectCategory, projectTags, `${project?.problem || ''} ${project?.solution || ''}`);
                                    return `${analysis.marketScore}/100`;
                                  })()}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Recommended Target Audiences</p>
                                <p className="text-sm font-medium">
                                  {(() => {
                                    const analysis = analyzeMarketFit(projectCategory, projectTags, `${project?.problem || ''} ${project?.solution || ''}`);
                                    return analysis.targetAudiences.slice(0, 3).join(', ');
                                  })()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Trending Features for 2025</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(() => {
                                    const analysis = analyzeMarketFit(projectCategory, projectTags, `${project?.problem || ''} ${project?.solution || ''}`);
                                    return analysis.recommendedFeatures.slice(0, 4).map(feature => (
                                      <Badge key={feature} variant="outline" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ));
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* AI Prompt Section */}
                  {useAiGeneration && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>AI Project Prompt</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                // Fetch enhanced project data if available
                                const response = await fetch(`/api/projects/${projectId}/enhance`);
                                if (response.ok) {
                                  const enhanced = await response.json();
                                  if (enhanced.implementationPrompt) {
                                    setAiPrompt(enhanced.implementationPrompt);
                                  }
                                }
                              } catch (error) {
                                console.error('Failed to fetch enhanced prompt:', error);
                              }
                            }}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Get Enhanced Prompt
                          </Button>
                        </div>
                        <Textarea
                          placeholder="This will be auto-populated from your project details. You can also edit it to add more specific requirements."
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={6}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Auto-generated from your project details. Feel free to modify for more specific requirements.
                        </p>
                      </div>

                      {/* Additional Context Fields */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Target Audience</Label>
                          <Input
                            placeholder="e.g., Developers, Students, Enterprise teams"
                            value={additionalContext.targetAudience}
                            onChange={(e) => setAdditionalContext({
                              ...additionalContext,
                              targetAudience: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Main Features</Label>
                          <Input
                            placeholder="e.g., Real-time sync, Offline mode, Analytics"
                            value={additionalContext.mainFeatures}
                            onChange={(e) => setAdditionalContext({
                              ...additionalContext,
                              mainFeatures: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Scalability Needs</Label>
                          <Input
                            placeholder="e.g., 10K users/day, Global distribution"
                            value={additionalContext.scalabilityNeeds}
                            onChange={(e) => setAdditionalContext({
                              ...additionalContext,
                              scalabilityNeeds: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Performance Requirements</Label>
                          <Input
                            placeholder="e.g., <100ms response time, 60fps UI"
                            value={additionalContext.performanceRequirements}
                            onChange={(e) => setAdditionalContext({
                              ...additionalContext,
                              performanceRequirements: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Security Requirements</Label>
                          <Input
                            placeholder="e.g., SOC2, GDPR, End-to-end encryption"
                            value={additionalContext.securityRequirements}
                            onChange={(e) => setAdditionalContext({
                              ...additionalContext,
                              securityRequirements: e.target.value
                            })}
                          />
                        </div>
                        <div>
                          <Label>Third-party Integrations</Label>
                          <Input
                            placeholder="e.g., Stripe, SendGrid, Google Analytics"
                            value={additionalContext.integrations}
                            onChange={(e) => setAdditionalContext({
                              ...additionalContext,
                              integrations: e.target.value
                            })}
                          />
                        </div>
                      </div>

                      {/* Complexity Slider */}
                      <div>
                        <Label>Project Complexity Level</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground">Simple</span>
                          <Slider
                            value={projectComplexityLevel}
                            onValueChange={setProjectComplexityLevel}
                            min={1}
                            max={10}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">Complex</span>
                          <Badge variant="secondary">{projectComplexityLevel[0]}/10</Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Separator />

                  {/* Custom Tech Stack Builder */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Technology Stack Configuration
                    </h4>
                    <TechStackBuilder
                      selectedStack={customTechStack}
                      onStackChange={setCustomTechStack}
                    />
                  </div>

                  {/* Repository Settings */}
                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Repository Settings</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Repository Name</Label>
                        <Input
                          value={repoSettings.name}
                          onChange={(e) => setRepoSettings({ ...repoSettings, name: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Format: category-subcategory-project-name
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Visibility</Label>
                        <RadioGroup 
                          value={repoSettings.isPrivate ? 'private' : 'public'}
                          onValueChange={(value) => setRepoSettings({ 
                            ...repoSettings, 
                            isPrivate: value === 'private' 
                          })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="private-adv" />
                            <Label htmlFor="private-adv" className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Private Repository
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="public-adv" />
                            <Label htmlFor="public-adv" className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Public Repository
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Comprehensive description of your repository"
                        value={repoSettings.description}
                        onChange={(e) => setRepoSettings({ ...repoSettings, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Advanced Setup Options */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Advanced Setup Options</h4>
                    <div className="grid gap-3">
                      {Object.entries(SETUP_OPTIONS).map(([key, option]) => (
                        <div key={key} className="flex items-start space-x-3">
                          <Checkbox
                            id={`adv-${key}`}
                            checked={setupOptions.includes(key)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSetupOptions([...setupOptions, key]);
                              } else {
                                setSetupOptions(setupOptions.filter(opt => opt !== key));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`adv-${key}`} className="flex items-center gap-2 cursor-pointer">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateRepository}
                disabled={createRepositoryMutation.isPending}
                className="min-w-32"
              >
                {createRepositoryMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create Repository
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* GitHub Setup Instructions Dialog */}
        <Dialog open={showGitHubSetup} onOpenChange={setShowGitHubSetup}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Setup Instructions
              </DialogTitle>
              <DialogDescription>
                Follow these steps to configure GitHub integration for automatic repository creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {githubStatus?.setupInstructions && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-medium">Setup Steps:</h4>
                    <ol className="space-y-2 text-sm">
                      {githubStatus.setupInstructions.steps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {index + 1}
                          </Badge>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Environment Variables:</h4>
                    <div className="space-y-2">
                      {githubStatus.setupInstructions.envVariables.map((env: any) => (
                        <div key={env.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <code className="text-sm font-mono">{env.name}</code>
                            <p className="text-xs text-muted-foreground mt-1">{env.description}</p>
                          </div>
                          <Badge variant={env.required ? "destructive" : "secondary"}>
                            {env.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Troubleshooting:</h4>
                    <div className="space-y-2">
                      {githubStatus.setupInstructions.troubleshooting.map((item: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <p className="font-medium text-sm">{item.issue}</p>
                          <p className="text-sm text-muted-foreground mt-1">{item.solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGitHubSetup(false)}>
                Close
              </Button>
              <Button onClick={() => window.open('https://github.com/settings/tokens', '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Create GitHub Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Repository exists - show enhanced management interface
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Repository Overview
            </CardTitle>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync Repository</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {repository.githubUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={repository.githubUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Repository Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm">{repository.githubOwner}/{repository.githubName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {repository.description || 'No description provided'}
              </p>
            </div>
            <Badge variant={repository.isPrivate ? 'secondary' : 'default'}>
              {repository.isPrivate ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
              {repository.isPrivate ? 'Private' : 'Public'}
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <GitCommit className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{repository.commitCount || 0}</div>
              <div className="text-xs text-muted-foreground">Commits</div>
            </div>
            <div className="text-center">
              <GitBranch className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{repository.branchCount || 1}</div>
              <div className="text-xs text-muted-foreground">Branches</div>
            </div>
            <div className="text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{repository.stars || 0}</div>
              <div className="text-xs text-muted-foreground">Stars</div>
            </div>
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{repository.contributors || 1}</div>
              <div className="text-xs text-muted-foreground">Contributors</div>
            </div>
            <div className="text-center">
              <Activity className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-2xl font-bold">{repository.healthScore || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Health Score</div>
            </div>
          </div>

          {/* Clone Command */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Clone Repository</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCloneCommand}
                className="h-8"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <code className="text-xs font-mono block overflow-x-auto">
              git clone {repository.githubUrl}.git
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Repository Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="actions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button variant="outline" className="justify-start">
                  <GitPullRequest className="h-4 w-4 mr-2" />
                  Create Pull Request
                </Button>
                <Button variant="outline" className="justify-start">
                  <GitMerge className="h-4 w-4 mr-2" />
                  Merge Branches
                </Button>
                <Button variant="outline" className="justify-start">
                  <Bug className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                <Button variant="outline" className="justify-start">
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to Production
                </Button>
                <Button variant="outline" className="justify-start">
                  <Archive className="h-4 w-4 mr-2" />
                  Create Release
                </Button>
                <Button variant="outline" className="justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Scan
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Code Quality</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Code Coverage</span>
                        <span>87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Technical Debt</span>
                        <span>Low</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Documentation</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Dependencies</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Dependencies</span>
                      <span>45</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Outdated</span>
                      <Badge variant="warning">8</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Security Vulnerabilities</span>
                      <Badge variant="destructive">2</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Update Dependencies
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">CI/CD Pipeline</p>
                      <p className="text-sm text-muted-foreground">Last run: 2 hours ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Automated Testing</p>
                      <p className="text-sm text-muted-foreground">Running on PR #42</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Logs</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Code Quality Checks</p>
                      <p className="text-sm text-muted-foreground">Not configured</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Branch Protection</p>
                    <p className="text-sm text-muted-foreground">Require PR reviews before merging</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-merge</p>
                    <p className="text-sm text-muted-foreground">Automatically merge PRs that pass all checks</p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Deploy Previews</p>
                    <p className="text-sm text-muted-foreground">Create preview deployments for PRs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <Button variant="destructive" className="w-full">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Repository
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}