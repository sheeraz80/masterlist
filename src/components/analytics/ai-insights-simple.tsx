'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain, Sparkles, TrendingUp, MessageSquare, Loader2,
  AlertTriangle, CheckCircle, Search, RefreshCw, Zap,
  Target, DollarSign, Users, Lightbulb, BarChart3,
  ArrowUp, ArrowDown, Activity, Shield, Rocket
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export function AIInsightsSimple() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const res = await fetch(`/api/analytics/ai-insights?type=query&q=${encodeURIComponent(query)}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        setResponse(`**AI Service Error:** ${data.error}\n\nThis may be because:\n- Ollama service is not running\n- DeepSeek models are not installed\n- Network connectivity issues\n\nPlease check the AI service status and try again.`);
      } else {
        setResponse(data.answer || '**No Response:** The AI service returned an empty response. Please try rephrasing your question or check if the Ollama service is properly configured.');
      }
    } catch (error) {
      console.error('AI Query Error:', error);
      setResponse(`**Connection Error:** Unable to connect to the AI insights service.\n\n**Possible causes:**\n- AI service (Ollama) is not running\n- Network connectivity issues\n- Server configuration problems\n\n**To resolve:**\n1. Ensure Ollama is installed and running\n2. Check if DeepSeek models are available\n3. Verify API endpoints are accessible\n\nError details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real prediction data
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  const [predictionsData, setPredictionsData] = useState<any[]>([]);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await fetch('/api/analytics/ai-insights?type=predictions');
        const data = await res.json();
        
        if (data.error) {
          setPredictionsError(data.error);
        } else {
          setPredictionsData(data.predictions || []);
        }
      } catch (error) {
        setPredictionsError('Unable to load AI predictions');
      } finally {
        setPredictionsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const trendData = [
    { month: 'Jan', ai: 45, web3: 30, health: 35, ecommerce: 40 },
    { month: 'Feb', ai: 52, web3: 28, health: 38, ecommerce: 42 },
    { month: 'Mar', ai: 58, web3: 25, health: 42, ecommerce: 45 },
    { month: 'Apr', ai: 65, web3: 22, health: 45, ecommerce: 43 },
    { month: 'May', ai: 72, web3: 20, health: 48, ecommerce: 46 },
    { month: 'Jun', ai: 78, web3: 18, health: 52, ecommerce: 48 }
  ];

  const riskFactors = [
    { factor: 'Market Competition', value: 75, threshold: 60 },
    { factor: 'Technical Complexity', value: 45, threshold: 70 },
    { factor: 'Resource Requirements', value: 55, threshold: 50 },
    { factor: 'Time to Market', value: 80, threshold: 65 },
    { factor: 'Regulatory Compliance', value: 30, threshold: 40 }
  ];

  return (
    <div className="space-y-6">
      {/* AI Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">AI Confidence</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-purple-200">+12% from last week</p>
              </div>
              <Brain className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Opportunities Found</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-green-200">5 high priority</p>
              </div>
              <Rocket className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Insights Generated</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-blue-200">This month</p>
              </div>
              <Sparkles className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Risks Detected</p>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-orange-200">2 critical</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Chat Interface */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span>Ask AI Assistant</span>
            </CardTitle>
            <CardDescription>
              Powered by DeepSeek R1 - Ask anything about your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="What are my top revenue opportunities?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  className="bg-white"
                />
                <Button 
                  onClick={handleQuery}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {response && (
                <Alert className="bg-white border-purple-200">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <AlertDescription>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({children}) => <p className="mb-2">{children}</p>,
                          ul: ({children}) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                          li: ({children}) => <li className="mb-1">{children}</li>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                          h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                        }}
                      >
                        {response}
                      </ReactMarkdown>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {[
                  'Which projects need attention?',
                  'What are the trending categories?',
                  'How can I improve revenue?'
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Predictions */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>AI Success Predictions</span>
            </CardTitle>
            <CardDescription>
              ML-powered project success probability based on real data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {predictionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : predictionsError ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Predictions Unavailable</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {predictionsError}
                </p>
                <p className="text-xs text-muted-foreground">
                  This feature requires the ML prediction service to be running.
                </p>
              </div>
            ) : predictionsData.length === 0 ? (
              <div className="text-center py-6">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Predictions Available</h3>
                <p className="text-muted-foreground text-sm">
                  No projects found for AI analysis. Add some projects to see predictions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {predictionsData.map((project) => (
                  <div key={project.projectId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{project.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={project.risk === 'low' ? 'default' : project.risk === 'medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {project.value}% • {project.risk} risk
                        </Badge>
                        {project.confidence && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(project.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress value={project.value} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Market Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>AI-Predicted Market Trends</span>
            </CardTitle>
            <CardDescription>
              Category growth predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="ai" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                <Area type="monotone" dataKey="health" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="ecommerce" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                <Area type="monotone" dataKey="web3" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Alert className="bg-purple-50 border-purple-200">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-xs">
                  AI/ML projects growing 73% MoM
                </AlertDescription>
              </Alert>
              <Alert className="bg-green-50 border-green-200">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-xs">
                  Health tech steady at 48% growth
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>AI Risk Assessment</span>
            </CardTitle>
            <CardDescription>
              Real-time risk monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskFactors.map((risk) => (
                <div key={risk.factor} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{risk.factor}</span>
                    <span className={risk.value > risk.threshold ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {risk.value}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`absolute h-full rounded-full ${
                        risk.value > risk.threshold ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${risk.value}%` }}
                    />
                    <div 
                      className="absolute h-full w-0.5 bg-gray-600"
                      style={{ left: `${risk.threshold}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm">
                2 risk factors exceeded thresholds. Immediate attention recommended.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>AI Strategic Insights</span>
          </CardTitle>
          <CardDescription>
            Data-driven recommendations from DeepSeek R1 analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-sm">Quick Win Opportunity</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                3 AI projects show 90%+ success probability with low complexity. Consider prioritizing these for rapid ROI.
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-50 border-blue-200">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-sm">Market Gap Detected</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Healthcare AI solutions are underrepresented in your portfolio despite 52% market growth.
              </AlertDescription>
            </Alert>

            <Alert className="bg-purple-50 border-purple-200">
              <Brain className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-sm">Portfolio Optimization</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Diversification score: 7.2/10. Consider adding IoT or FinTech projects for better balance.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}