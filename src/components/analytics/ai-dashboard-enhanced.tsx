'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain, Sparkles, TrendingUp, MessageSquare, Loader2,
  AlertTriangle, CheckCircle, Search, RefreshCw, Zap,
  Target, DollarSign, Users, Lightbulb, BarChart3,
  ArrowUp, ArrowDown, Activity, Shield, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Link from 'next/link';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

// Animated number component
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 50;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-bold">
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// AI Chat Interface
function AIChat() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch(`/api/analytics/ai-insights?type=query&q=${encodeURIComponent(question)}`);
      if (!response.ok) throw new Error('Failed to process query');
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, 
        { role: 'user', content: query },
        { role: 'assistant', content: data.answer }
      ]);
      setQuery('');
    }
  });

  const suggestions = [
    'What are my top performing projects?',
    'Which categories show the most growth potential?',
    'What projects need immediate attention?',
    'How can I improve portfolio performance?'
  ];

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <span>AI Analytics Assistant</span>
        </CardTitle>
        <CardDescription>
          Powered by local DeepSeek R1 models - Ask anything about your projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chat messages */}
          <div className="h-64 overflow-y-auto space-y-3 p-4 bg-white/50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-2 text-purple-300" />
                <p>Ask me anything about your project analytics!</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-purple-100 ml-8' 
                        : 'bg-white mr-8 border border-purple-200'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about trends, opportunities, or specific projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !queryMutation.isPending && queryMutation.mutate(query)}
              disabled={queryMutation.isPending}
              className="bg-white"
            />
            <Button 
              onClick={() => queryMutation.mutate(query)}
              disabled={queryMutation.isPending || !query.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {queryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                className="text-xs bg-white/50 hover:bg-white"
                onClick={() => {
                  setQuery(suggestion);
                  queryMutation.mutate(suggestion);
                }}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Success Predictor Component
function SuccessPredictor() {
  const { data: predictions, isLoading } = useQuery({
    queryKey: ['ai-predictions'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/ai-insights?type=project-predictions');
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />;
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-600" />
          <span>AI Success Predictions</span>
        </CardTitle>
        <CardDescription>
          Machine learning predictions for project success
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Success rate gauge */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={377}
                  strokeDashoffset={377 * (1 - 0.73)}
                  className="text-green-500 transform -rotate-90 origin-center"
                  initial={{ strokeDashoffset: 377 }}
                  animate={{ strokeDashoffset: 377 * (1 - 0.73) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute">
                <AnimatedNumber value={73} suffix="%" />
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>

          {/* Top opportunities */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">High Potential Projects</h4>
            {[
              { name: 'AI Code Assistant', score: 92, trend: 'up' },
              { name: 'Smart Home Hub', score: 87, trend: 'up' },
              { name: 'Fitness Tracker Pro', score: 84, trend: 'stable' }
            ].map((project, idx) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    project.score > 85 ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium">{project.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {project.score}%
                  </Badge>
                  {project.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Market Trends Analyzer
function MarketTrends() {
  const { data: trends } = useQuery({
    queryKey: ['market-trends'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/ai-insights?type=trends');
      if (!response.ok) throw new Error('Failed to fetch trends');
      return response.json();
    }
  });

  const trendData = [
    { month: 'Jan', ai: 45, web3: 30, iot: 25, health: 35 },
    { month: 'Feb', ai: 52, web3: 28, iot: 28, health: 38 },
    { month: 'Mar', ai: 58, web3: 25, iot: 32, health: 42 },
    { month: 'Apr', ai: 65, web3: 22, iot: 35, health: 45 },
    { month: 'May', ai: 72, web3: 20, iot: 38, health: 48 },
    { month: 'Jun', ai: 78, web3: 18, iot: 42, health: 52 }
  ];

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>AI-Powered Market Trends</span>
        </CardTitle>
        <CardDescription>
          Predictive analysis of category trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWeb3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="ai" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAI)" />
            <Area type="monotone" dataKey="health" stroke="#10b981" fillOpacity={0.6} fill="#10b981" />
            <Area type="monotone" dataKey="iot" stroke="#f59e0b" fillOpacity={0.6} fill="#f59e0b" />
            <Area type="monotone" dataKey="web3" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWeb3)" />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI/ML Projects</span>
              <Badge className="bg-purple-600">+73%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Highest growth category</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Tech</span>
              <Badge className="bg-green-600">+48%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Steady growth trend</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Risk Analysis Component
function RiskAnalysis() {
  const riskData = [
    { factor: 'Market Competition', current: 75, threshold: 60 },
    { factor: 'Technical Complexity', current: 45, threshold: 70 },
    { factor: 'Resource Requirements', current: 55, threshold: 50 },
    { factor: 'Time to Market', current: 80, threshold: 65 },
    { factor: 'Regulatory Compliance', current: 30, threshold: 40 }
  ];

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-red-600" />
          <span>AI Risk Assessment</span>
        </CardTitle>
        <CardDescription>
          Real-time risk monitoring across projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {riskData.map((risk, idx) => (
            <motion.div
              key={risk.factor}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{risk.factor}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs ${
                    risk.current > risk.threshold ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {risk.current}%
                  </span>
                  {risk.current > risk.threshold && (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute h-full ${
                    risk.current > risk.threshold ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${risk.current}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
                <div
                  className="absolute h-full w-0.5 bg-gray-600"
                  style={{ left: `${risk.threshold}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <Alert className="mt-4 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-sm">
            2 risk factors exceeding thresholds. AI recommends immediate attention to market competition and time-to-market concerns.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function EnhancedAIDashboard() {
  return (
    <div className="space-y-6">
      {/* AI Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">AI Confidence</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={94} suffix="%" />
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Opportunities</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={23} />
                  </p>
                </div>
                <Rocket className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Insights Generated</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={156} />
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Risks Detected</p>
                  <p className="text-2xl font-bold">
                    <AnimatedNumber value={7} />
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main AI Components */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AIChat />
        <SuccessPredictor />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MarketTrends />
        <RiskAnalysis />
      </div>
    </div>
  );
}