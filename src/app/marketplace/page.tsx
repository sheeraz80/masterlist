/**
 * CoreVecta Feature Module Marketplace
 * Browse and install premium features for your projects
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Star,
  Download,
  TrendingUp,
  Shield,
  Zap,
  Code2,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  Package,
  Sparkles,
  Award,
  ShoppingCart,
  Eye
} from 'lucide-react';

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  authorVerified: boolean;
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  price: number;
  complexity: string;
  estimatedHours: number;
  platforms: string[];
  tags: string[];
  screenshots: string[];
  lastUpdated: string;
  features: string[];
}

// Mock data - in production, this would come from API
const FEATURED_MODULES: FeatureModule[] = [
  {
    id: 'ai-chat-integration',
    name: 'AI Chat Integration Pro',
    description: 'Add GPT-4 powered chat to any application with advanced features like conversation history, custom prompts, and multi-language support.',
    category: 'AI & ML',
    author: 'CoreVecta Labs',
    authorVerified: true,
    version: '2.1.0',
    downloads: 15420,
    rating: 4.8,
    reviews: 342,
    price: 149,
    complexity: 'intermediate',
    estimatedHours: 12,
    platforms: ['web-app', 'mobile-app', 'api-backend'],
    tags: ['ai', 'chat', 'gpt-4', 'nlp'],
    screenshots: ['/marketplace/ai-chat-1.png', '/marketplace/ai-chat-2.png'],
    lastUpdated: '2024-01-15',
    features: [
      'GPT-4 integration',
      'Conversation history',
      'Custom system prompts',
      'Multi-language support',
      'Rate limiting',
      'Usage analytics'
    ]
  },
  {
    id: 'advanced-auth-system',
    name: 'Enterprise Auth System',
    description: 'Complete authentication and authorization system with SSO, MFA, role-based access control, and audit logging.',
    category: 'Security',
    author: 'SecureStack',
    authorVerified: true,
    version: '3.0.2',
    downloads: 28190,
    rating: 4.9,
    reviews: 567,
    price: 299,
    complexity: 'advanced',
    estimatedHours: 24,
    platforms: ['web-app', 'api-backend'],
    tags: ['auth', 'security', 'sso', 'mfa', 'rbac'],
    screenshots: ['/marketplace/auth-1.png', '/marketplace/auth-2.png'],
    lastUpdated: '2024-01-20',
    features: [
      'OAuth 2.0 / OIDC',
      'SAML support',
      'Multi-factor authentication',
      'Role-based access control',
      'Session management',
      'Audit logging'
    ]
  },
  {
    id: 'real-time-analytics',
    name: 'Real-Time Analytics Dashboard',
    description: 'Beautiful, performant analytics dashboard with real-time updates, custom metrics, and data export capabilities.',
    category: 'Analytics',
    author: 'DataViz Pro',
    authorVerified: false,
    version: '1.5.0',
    downloads: 9823,
    rating: 4.6,
    reviews: 198,
    price: 199,
    complexity: 'intermediate',
    estimatedHours: 16,
    platforms: ['web-app'],
    tags: ['analytics', 'dashboard', 'real-time', 'charts'],
    screenshots: ['/marketplace/analytics-1.png', '/marketplace/analytics-2.png'],
    lastUpdated: '2024-01-10',
    features: [
      'Real-time data updates',
      'Custom metrics',
      'Interactive charts',
      'Data export (CSV, JSON)',
      'Customizable themes',
      'Mobile responsive'
    ]
  }
];

const CATEGORIES = [
  'All',
  'AI & ML',
  'Security',
  'Analytics',
  'Payment',
  'UI Components',
  'DevOps',
  'Database',
  'Testing',
  'Performance'
];

export default function MarketplacePage() {
  const [modules, setModules] = useState<FeatureModule[]>(FEATURED_MODULES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedModule, setSelectedModule] = useState<FeatureModule | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  // Filter and sort modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || module.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedModules = [...filteredModules].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const addToCart = (moduleId: string) => {
    setCart(prev => [...prev, moduleId]);
    // Show toast notification
  };

  const removeFromCart = (moduleId: string) => {
    setCart(prev => prev.filter(id => id !== moduleId));
  };

  const isInCart = (moduleId: string) => cart.includes(moduleId);

  const getTotalPrice = () => {
    return cart.reduce((total, moduleId) => {
      const module = modules.find(m => m.id === moduleId);
      return total + (module?.price || 0);
    }, 0);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">CoreVecta Feature Marketplace</h1>
            <p className="text-lg text-gray-600">
              Premium features and modules to supercharge your projects
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart ({cart.length})
            {cart.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                ${getTotalPrice()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Modules</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified Authors</p>
                  <p className="text-2xl font-bold">342</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold">2.3M</p>
                </div>
                <Download className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">4.7</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Modules</TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="new">
            <Sparkles className="w-4 h-4 mr-2" />
            New Releases
          </TabsTrigger>
          <TabsTrigger value="free">
            <DollarSign className="w-4 h-4 mr-2" />
            Free
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedModules.map(module => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{module.category}</Badge>
                    {module.price === 0 ? (
                      <Badge variant="outline" className="text-green-600">Free</Badge>
                    ) : (
                      <span className="text-2xl font-bold">${module.price}</span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{module.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{module.author}</span>
                      {module.authorVerified && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                        <span>{module.rating}</span>
                        <span className="text-gray-500 ml-1">({module.reviews})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Download className="w-4 h-4 mr-1" />
                        <span>{module.downloads.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{module.estimatedHours}h setup</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {module.complexity}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {module.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {module.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{module.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedModule(module)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  {isInCart(module.id) ? (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => removeFromCart(module.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      In Cart
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => addToCart(module.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Module Preview Dialog */}
      {selectedModule && (
        <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl">{selectedModule.name}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {selectedModule.description}
                  </DialogDescription>
                </div>
                <div className="text-right">
                  {selectedModule.price === 0 ? (
                    <Badge variant="outline" className="text-green-600">Free</Badge>
                  ) : (
                    <span className="text-3xl font-bold">${selectedModule.price}</span>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            <div className="mt-6 space-y-6">
              {/* Author Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedModule.author}</span>
                      {selectedModule.authorVerified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Module Developer</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View Profile</Button>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedModule.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details */}
              <div>
                <h3 className="font-semibold mb-3">Technical Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-medium">{selectedModule.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedModule.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Complexity:</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {selectedModule.complexity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Setup Time:</span>
                    <span className="ml-2 font-medium">{selectedModule.estimatedHours} hours</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Supported Platforms:</span>
                    <div className="flex gap-2 mt-1">
                      {selectedModule.platforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <h3 className="font-semibold mb-3">Screenshots</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedModule.screenshots.map((screenshot, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Screenshot {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="font-semibold mb-3">Reviews</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="ml-1 font-bold text-lg">{selectedModule.rating}</span>
                  </div>
                  <span className="text-gray-600">
                    Based on {selectedModule.reviews} reviews
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Reviews coming soon...
                </p>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSelectedModule(null)}>
                Close
              </Button>
              {isInCart(selectedModule.id) ? (
                <Button variant="secondary" onClick={() => removeFromCart(selectedModule.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Remove from Cart
                </Button>
              ) : (
                <Button onClick={() => {
                  addToCart(selectedModule.id);
                  setSelectedModule(null);
                }}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart (${selectedModule.price})
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}