'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Code, 
  Layers, 
  Shield, 
  TestTube, 
  Globe, 
  BarChart3, 
  Settings, 
  Rocket,
  Download,
  Eye,
  Zap,
  Target,
  Users,
  DollarSign,
  Star
} from 'lucide-react';

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  estimatedHours: number;
  dependencies: string[];
  enabled: boolean;
  required: boolean;
}

interface ProjectConfig {
  basic: {
    title: string;
    description: string;
    category: string;
    complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
    targetUsers: string;
    revenueModel: string;
  };
  features: FeatureModule[];
  advanced: {
    testing: boolean;
    security: boolean;
    analytics: boolean;
    i18n: boolean;
    cicd: boolean;
    crossBrowser: boolean;
    storeOptimization: boolean;
  };
  customization: {
    branding: boolean;
    customColors: string;
    customDomain: string;
    enterpriseFeatures: boolean;
  };
}

const FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'core-extension',
    name: 'Core Extension Framework',
    description: 'Manifest V3, popup, content scripts, background service worker',
    category: 'Core',
    complexity: 'basic',
    estimatedHours: 8,
    dependencies: [],
    enabled: true,
    required: true
  },
  {
    id: 'advanced-testing',
    name: 'Advanced Testing Suite',
    description: 'Jest, E2E testing, Chrome API mocking, performance tests',
    category: 'Quality',
    complexity: 'intermediate',
    estimatedHours: 16,
    dependencies: ['core-extension'],
    enabled: false,
    required: false
  },
  {
    id: 'security-framework',
    name: 'Security Framework',
    description: 'CSP, encryption, API security, vulnerability scanning',
    category: 'Security',
    complexity: 'advanced',
    estimatedHours: 12,
    dependencies: ['core-extension'],
    enabled: false,
    required: false
  },
  {
    id: 'analytics-monitoring',
    name: 'Analytics & Monitoring',
    description: 'Google Analytics, error tracking, performance monitoring',
    category: 'Monitoring',
    complexity: 'intermediate',
    estimatedHours: 10,
    dependencies: ['core-extension'],
    enabled: false,
    required: false
  },
  {
    id: 'i18n-framework',
    name: 'Internationalization',
    description: 'Multi-language support, RTL, localization workflows',
    category: 'Localization',
    complexity: 'advanced',
    estimatedHours: 14,
    dependencies: ['core-extension'],
    enabled: false,
    required: false
  },
  {
    id: 'cross-browser',
    name: 'Cross-Browser Support',
    description: 'Firefox, Edge, Safari compatibility layers',
    category: 'Compatibility',
    complexity: 'advanced',
    estimatedHours: 20,
    dependencies: ['core-extension'],
    enabled: false,
    required: false
  },
  {
    id: 'store-optimization',
    name: 'Store Optimization',
    description: 'A/B testing, screenshots, marketing assets',
    category: 'Marketing',
    complexity: 'intermediate',
    estimatedHours: 8,
    dependencies: ['core-extension'],
    enabled: false,
    required: false
  },
  {
    id: 'enterprise-features',
    name: 'Enterprise Features',
    description: 'Team collaboration, permissions, deployment automation',
    category: 'Enterprise',
    complexity: 'enterprise',
    estimatedHours: 24,
    dependencies: ['core-extension', 'security-framework'],
    enabled: false,
    required: false
  }
];

export default function VisualProjectBuilder() {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    basic: {
      title: '',
      description: '',
      category: 'Chrome Extension',
      complexity: 'basic',
      targetUsers: '',
      revenueModel: 'Freemium'
    },
    features: FEATURE_MODULES,
    advanced: {
      testing: false,
      security: false,
      analytics: false,
      i18n: false,
      cicd: false,
      crossBrowser: false,
      storeOptimization: false
    },
    customization: {
      branding: true,
      customColors: '#3b82f6',
      customDomain: '',
      enterpriseFeatures: false
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateEstimatedHours = useCallback(() => {
    return projectConfig.features
      .filter(f => f.enabled)
      .reduce((total, feature) => total + feature.estimatedHours, 0);
  }, [projectConfig.features]);

  const calculateComplexityScore = useCallback(() => {
    const enabledFeatures = projectConfig.features.filter(f => f.enabled);
    const complexityWeights = { basic: 1, intermediate: 2, advanced: 3, enterprise: 4 };
    
    const totalComplexity = enabledFeatures.reduce((sum, feature) => {
      return sum + complexityWeights[feature.complexity];
    }, 0);
    
    return Math.min(100, (totalComplexity / 20) * 100);
  }, [projectConfig.features]);

  const handleFeatureToggle = (featureId: string, enabled: boolean) => {
    setProjectConfig(prev => ({
      ...prev,
      features: prev.features.map(f => 
        f.id === featureId ? { ...f, enabled } : f
      )
    }));
  };

  const handleAdvancedToggle = (feature: keyof ProjectConfig['advanced'], enabled: boolean) => {
    setProjectConfig(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [feature]: enabled
      }
    }));

    // Auto-enable corresponding feature modules
    const featureMapping = {
      testing: 'advanced-testing',
      security: 'security-framework',
      analytics: 'analytics-monitoring',
      i18n: 'i18n-framework',
      crossBrowser: 'cross-browser',
      storeOptimization: 'store-optimization'
    };

    const moduleId = featureMapping[feature];
    if (moduleId) {
      handleFeatureToggle(moduleId, enabled);
    }
  };

  const generateProject = async () => {
    setIsGenerating(true);
    
    try {
      // Here we would call the actual project generation API
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
      
      // In a real implementation, this would:
      // 1. Send projectConfig to backend
      // 2. Generate project files based on selected features
      // 3. Return download link or redirect to project page
      
      alert('Project generated successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error generating project:', error);
      alert('Error generating project. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: Target },
    { id: 'features', title: 'Features', icon: Layers },
    { id: 'advanced', title: 'Advanced', icon: Settings },
    { id: 'customization', title: 'Customization', icon: Star },
    { id: 'review', title: 'Review', icon: Eye }
  ];

  const ComplexityBadge = ({ complexity }: { complexity: string }) => {
    const colors = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      enterprise: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[complexity as keyof typeof colors]}>
        {complexity}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CoreVecta Visual Project Builder
          </h1>
          <p className="text-lg text-gray-600">
            Build enterprise-grade Chrome extensions with our visual drag-and-drop builder
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Project Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={steps[currentStep].id} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    {steps.map((step, index) => (
                      <TabsTrigger
                        key={step.id}
                        value={step.id}
                        onClick={() => setCurrentStep(index)}
                        disabled={index > currentStep + 1}
                      >
                        {step.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                          id="title"
                          value={projectConfig.basic.title}
                          onChange={(e) => setProjectConfig(prev => ({
                            ...prev,
                            basic: { ...prev.basic, title: e.target.value }
                          }))}
                          placeholder="My Amazing Extension"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={projectConfig.basic.category}
                          onValueChange={(value) => setProjectConfig(prev => ({
                            ...prev,
                            basic: { ...prev.basic, category: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Chrome Extension">Chrome Extension</SelectItem>
                            <SelectItem value="Firefox Extension">Firefox Extension</SelectItem>
                            <SelectItem value="Cross-Browser Extension">Cross-Browser Extension</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={projectConfig.basic.description}
                        onChange={(e) => setProjectConfig(prev => ({
                          ...prev,
                          basic: { ...prev.basic, description: e.target.value }
                        }))}
                        placeholder="Describe what your extension does..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="complexity">Complexity Level</Label>
                        <Select
                          value={projectConfig.basic.complexity}
                          onValueChange={(value: any) => setProjectConfig(prev => ({
                            ...prev,
                            basic: { ...prev.basic, complexity: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="revenue">Revenue Model</Label>
                        <Select
                          value={projectConfig.basic.revenueModel}
                          onValueChange={(value) => setProjectConfig(prev => ({
                            ...prev,
                            basic: { ...prev.basic, revenueModel: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Free">Free</SelectItem>
                            <SelectItem value="Freemium">Freemium</SelectItem>
                            <SelectItem value="One-time Purchase">One-time Purchase</SelectItem>
                            <SelectItem value="Subscription">Subscription</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Features Tab */}
                  <TabsContent value="features" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectConfig.features.map((feature) => (
                        <Card key={feature.id} className={`cursor-pointer transition-all ${
                          feature.enabled ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={feature.enabled}
                                  onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked as boolean)}
                                  disabled={feature.required}
                                />
                                <h3 className="font-medium">{feature.name}</h3>
                              </div>
                              <ComplexityBadge complexity={feature.complexity} />
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Category: {feature.category}</span>
                              <span>{feature.estimatedHours}h</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TestTube className="w-5 h-5" />
                            Testing & Quality
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="testing">Advanced Testing Suite</Label>
                            <Switch
                              id="testing"
                              checked={projectConfig.advanced.testing}
                              onCheckedChange={(checked) => handleAdvancedToggle('testing', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="security">Security Framework</Label>
                            <Switch
                              id="security"
                              checked={projectConfig.advanced.security}
                              onCheckedChange={(checked) => handleAdvancedToggle('security', checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Analytics & Monitoring
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="analytics">Analytics Integration</Label>
                            <Switch
                              id="analytics"
                              checked={projectConfig.advanced.analytics}
                              onCheckedChange={(checked) => handleAdvancedToggle('analytics', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cicd">CI/CD Pipeline</Label>
                            <Switch
                              id="cicd"
                              checked={projectConfig.advanced.cicd}
                              onCheckedChange={(checked) => handleAdvancedToggle('cicd', checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Internationalization
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="i18n">Multi-language Support</Label>
                            <Switch
                              id="i18n"
                              checked={projectConfig.advanced.i18n}
                              onCheckedChange={(checked) => handleAdvancedToggle('i18n', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="crossBrowser">Cross-browser Support</Label>
                            <Switch
                              id="crossBrowser"
                              checked={projectConfig.advanced.crossBrowser}
                              onCheckedChange={(checked) => handleAdvancedToggle('crossBrowser', checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Rocket className="w-5 h-5" />
                            Store & Marketing
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="storeOptimization">Store Optimization</Label>
                            <Switch
                              id="storeOptimization"
                              checked={projectConfig.advanced.storeOptimization}
                              onCheckedChange={(checked) => handleAdvancedToggle('storeOptimization', checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Customization Tab */}
                  <TabsContent value="customization" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Branding & Appearance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="branding">CoreVecta Branding</Label>
                          <Switch
                            id="branding"
                            checked={projectConfig.customization.branding}
                            onCheckedChange={(checked) => setProjectConfig(prev => ({
                              ...prev,
                              customization: { ...prev.customization, branding: checked }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customColors">Primary Color</Label>
                          <Input
                            id="customColors"
                            type="color"
                            value={projectConfig.customization.customColors}
                            onChange={(e) => setProjectConfig(prev => ({
                              ...prev,
                              customization: { ...prev.customization, customColors: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                          <Input
                            id="customDomain"
                            value={projectConfig.customization.customDomain}
                            onChange={(e) => setProjectConfig(prev => ({
                              ...prev,
                              customization: { ...prev.customization, customDomain: e.target.value }
                            }))}
                            placeholder="myextension.com"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Review Tab */}
                  <TabsContent value="review" className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">Ready to Generate Your Project!</h2>
                      <p className="text-gray-600 mb-6">
                        Review your configuration and click generate to create your enterprise-grade Chrome extension.
                      </p>
                      <Button
                        onClick={generateProject}
                        disabled={isGenerating || !projectConfig.basic.title}
                        className="px-8 py-3 text-lg"
                      >
                        {isGenerating ? (
                          <>
                            <Zap className="w-5 h-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            Generate Project
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Project Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Estimated Hours:</span>
                    <span className="text-sm">{calculateEstimatedHours()}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Complexity Score:</span>
                    <span className="text-sm">{calculateComplexityScore().toFixed(0)}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Features Enabled:</span>
                    <span className="text-sm">{projectConfig.features.filter(f => f.enabled).length}</span>
                  </div>
                </div>
                <Progress value={calculateComplexityScore()} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Enabled Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projectConfig.features.filter(f => f.enabled).map((feature) => (
                    <div key={feature.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{feature.name}</span>
                      <ComplexityBadge complexity={feature.complexity} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Business Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Revenue Model:</span>
                    <span className="text-sm">{projectConfig.basic.revenueModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Complexity:</span>
                    <ComplexityBadge complexity={projectConfig.basic.complexity} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}