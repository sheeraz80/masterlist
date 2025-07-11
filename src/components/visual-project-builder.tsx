/**
 * CoreVecta Visual Project Builder
 * Interactive UI for creating custom projects with feature modules
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Code2,
  Shield,
  TestTube,
  FileText,
  Rocket,
  DollarSign,
  Globe,
  Sparkles,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Settings
} from 'lucide-react';

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  category: 'quality' | 'security' | 'business' | 'operations' | 'ux' | 'deployment';
  estimatedHours: number;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  price: number;
  included: boolean;
}

interface ProjectConfig {
  name: string;
  description: string;
  platform: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  features: string[];
  estimatedHours: number;
  estimatedCost: number;
  qualityScore: number;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const AVAILABLE_FEATURES: FeatureModule[] = [
  {
    id: 'testing-suite',
    name: 'CoreVecta Testing Suite',
    description: 'Comprehensive testing with Jest, E2E tests, and 80%+ coverage',
    category: 'quality',
    estimatedHours: 8,
    complexity: 'intermediate',
    price: 0,
    included: false
  },
  {
    id: 'security-pack',
    name: 'CoreVecta Security Pack',
    description: 'Advanced security with encryption, auth, and vulnerability scanning',
    category: 'security',
    estimatedHours: 12,
    complexity: 'intermediate',
    price: 0,
    included: false
  },
  {
    id: 'multi-platform',
    name: 'CoreVecta Multi-Platform',
    description: 'Cross-browser and cross-platform compatibility',
    category: 'operations',
    estimatedHours: 16,
    complexity: 'advanced',
    price: 99,
    included: false
  },
  {
    id: 'monetization-pro',
    name: 'CoreVecta Monetization Pro',
    description: 'Complete payment processing and license management',
    category: 'business',
    estimatedHours: 20,
    complexity: 'advanced',
    price: 199,
    included: false
  },
  {
    id: 'analytics-dashboard',
    name: 'CoreVecta Analytics Dashboard',
    description: 'Real-time analytics and monitoring dashboards',
    category: 'operations',
    estimatedHours: 10,
    complexity: 'intermediate',
    price: 99,
    included: false
  },
  {
    id: 'i18n-system',
    name: 'CoreVecta i18n System',
    description: 'Full internationalization support with 10+ languages',
    category: 'ux',
    estimatedHours: 8,
    complexity: 'intermediate',
    price: 0,
    included: false
  },
  {
    id: 'ci-cd-pipeline',
    name: 'CoreVecta CI/CD Pipeline',
    description: 'Automated build, test, and deployment pipeline',
    category: 'deployment',
    estimatedHours: 6,
    complexity: 'advanced',
    price: 0,
    included: false
  },
  {
    id: 'docs-generator',
    name: 'CoreVecta Docs Generator',
    description: 'Automated documentation with API docs and guides',
    category: 'quality',
    estimatedHours: 4,
    complexity: 'basic',
    price: 0,
    included: false
  }
];

const PLATFORMS = [
  { value: 'chrome-extension', label: 'Chrome Extension', icon: Globe },
  { value: 'ios-app', label: 'iOS App', icon: Building2 },
  { value: 'android-app', label: 'Android App', icon: Building2 },
  { value: 'smart-contract', label: 'Smart Contract', icon: Shield },
  { value: 'web-app', label: 'Web Application', icon: Globe },
  { value: 'api-backend', label: 'API Backend', icon: Code2 }
];

const COMPLEXITY_LEVELS = [
  { 
    value: 'basic', 
    label: 'Basic', 
    description: 'Simple project with core features',
    baseHours: 40,
    qualityTarget: 70
  },
  { 
    value: 'intermediate', 
    label: 'Intermediate', 
    description: 'Professional project with testing and security',
    baseHours: 80,
    qualityTarget: 80
  },
  { 
    value: 'advanced', 
    label: 'Advanced', 
    description: 'Enterprise-ready with full feature set',
    baseHours: 160,
    qualityTarget: 90
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise', 
    description: 'Mission-critical with highest standards',
    baseHours: 320,
    qualityTarget: 95
  }
];

export function VisualProjectBuilder() {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    name: '',
    description: '',
    platform: 'chrome-extension',
    complexity: 'intermediate',
    features: [],
    estimatedHours: 80,
    estimatedCost: 0,
    qualityScore: 80,
    certificationLevel: 'silver'
  });

  const [features, setFeatures] = useState<FeatureModule[]>(AVAILABLE_FEATURES);
  const [activeTab, setActiveTab] = useState('platform');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update estimates when configuration changes
  useEffect(() => {
    updateEstimates();
  }, [projectConfig.platform, projectConfig.complexity, features]);

  const updateEstimates = () => {
    const complexityLevel = COMPLEXITY_LEVELS.find(c => c.value === projectConfig.complexity);
    const baseHours = complexityLevel?.baseHours || 80;
    
    const selectedFeatures = features.filter(f => f.included);
    const featureHours = selectedFeatures.reduce((sum, f) => sum + f.estimatedHours, 0);
    const featureCost = selectedFeatures.reduce((sum, f) => sum + f.price, 0);
    
    const totalHours = baseHours + featureHours;
    const qualityScore = calculateQualityScore(selectedFeatures, projectConfig.complexity);
    const certification = determineCertification(qualityScore);
    
    setProjectConfig(prev => ({
      ...prev,
      estimatedHours: totalHours,
      estimatedCost: featureCost,
      qualityScore,
      certificationLevel: certification,
      features: selectedFeatures.map(f => f.id)
    }));
  };

  const calculateQualityScore = (selectedFeatures: FeatureModule[], complexity: string): number => {
    const baseScore = COMPLEXITY_LEVELS.find(c => c.value === complexity)?.qualityTarget || 70;
    
    let bonus = 0;
    if (selectedFeatures.some(f => f.category === 'quality')) bonus += 5;
    if (selectedFeatures.some(f => f.category === 'security')) bonus += 5;
    if (selectedFeatures.some(f => f.category === 'operations')) bonus += 3;
    if (selectedFeatures.some(f => f.id === 'testing-suite')) bonus += 5;
    if (selectedFeatures.some(f => f.id === 'ci-cd-pipeline')) bonus += 3;
    
    return Math.min(100, baseScore + bonus);
  };

  const determineCertification = (score: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (score >= 95) return 'platinum';
    if (score >= 85) return 'gold';
    if (score >= 75) return 'silver';
    return 'bronze';
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, included: !f.included } : f
    ));
  };

  const generateProject = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectConfig)
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = `/projects/${result.projectId}`;
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getCertificationBadge = (level: string) => {
    const colors = {
      bronze: 'bg-orange-500',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500'
    };
    
    return (
      <Badge className={`${colors[level]} text-white`}>
        <Award className="w-3 h-3 mr-1" />
        CoreVecta {level.charAt(0).toUpperCase() + level.slice(1)} Certified
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CoreVecta Visual Project Builder</h1>
        <p className="text-gray-600">
          Create custom projects with enterprise-grade features and CoreVecta certification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Configuration</CardTitle>
              <CardDescription>
                Customize your project with platform-specific features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="platform">Platform</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="platform" className="space-y-6">
                  <div>
                    <Label>Project Name</Label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="My Awesome Project"
                      value={projectConfig.name}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Platform</Label>
                    <Select 
                      value={projectConfig.platform}
                      onValueChange={(value) => setProjectConfig(prev => ({ ...prev, platform: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORMS.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center">
                              <platform.icon className="w-4 h-4 mr-2" />
                              {platform.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Complexity Level</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {COMPLEXITY_LEVELS.map(level => (
                        <button
                          key={level.value}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            projectConfig.complexity === level.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setProjectConfig(prev => ({ ...prev, complexity: level.value as any }))}
                        >
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Base: {level.baseHours} hours
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <Alert>
                    <Sparkles className="w-4 h-4" />
                    <AlertDescription>
                      Select features to enhance your project. Free features are included with CoreVecta certification.
                    </AlertDescription>
                  </Alert>

                  {['quality', 'security', 'business', 'operations', 'ux', 'deployment'].map(category => (
                    <div key={category} className="space-y-2">
                      <h3 className="font-medium capitalize">{category}</h3>
                      {features
                        .filter(f => f.category === category)
                        .map(feature => (
                          <div
                            key={feature.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              feature.included ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => toggleFeature(feature.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Checkbox 
                                    checked={feature.included}
                                    onCheckedChange={() => toggleFeature(feature.id)}
                                  />
                                  <div className="font-medium">{feature.name}</div>
                                  {feature.price > 0 && (
                                    <Badge variant="secondary">${feature.price}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 ml-6">
                                  {feature.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 ml-6 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    +{feature.estimatedHours} hours
                                  </span>
                                  <span>Requires: {feature.complexity}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="review" className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Project Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Name:</span>
                        <span className="font-medium">{projectConfig.name || 'Untitled Project'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform:</span>
                        <span className="font-medium">
                          {PLATFORMS.find(p => p.value === projectConfig.platform)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Complexity:</span>
                        <span className="font-medium capitalize">{projectConfig.complexity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selected Features:</span>
                        <span className="font-medium">{projectConfig.features.length}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Included Features</h3>
                    <div className="space-y-1">
                      {features
                        .filter(f => f.included)
                        .map(feature => (
                          <div key={feature.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature.name}</span>
                            {feature.price > 0 && (
                              <Badge variant="secondary" className="text-xs">${feature.price}</Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Your project will be generated with production-ready code, comprehensive documentation, 
                      and CoreVecta quality certification.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Estimates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Development Time</span>
                  <span className="font-bold">{projectConfig.estimatedHours} hours</span>
                </div>
                <Progress value={Math.min(projectConfig.estimatedHours / 3.2, 100)} />
                <p className="text-xs text-gray-500 mt-1">
                  ~{Math.ceil(projectConfig.estimatedHours / 40)} weeks at full-time
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <span className="font-bold">{projectConfig.qualityScore}%</span>
                </div>
                <Progress value={projectConfig.qualityScore} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Premium Features Cost</span>
                  <span className="font-bold">${projectConfig.estimatedCost}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Certification Level</div>
                {getCertificationBadge(projectConfig.certificationLevel)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Production-ready source code</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Comprehensive documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Test suite with {projectConfig.qualityScore}%+ coverage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Security best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Deployment configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>CoreVecta certification</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={generateProject}
              disabled={!projectConfig.name || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Generating Project...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Generate Project
                </>
              )}
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Config
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}