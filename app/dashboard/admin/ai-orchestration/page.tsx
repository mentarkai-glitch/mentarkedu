'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';

interface AIStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  costSavings: number;
  costSavingsPercentage: number;
  recentDecisions: Array<{
    id: string;
    task: string;
    selected_model: string;
    selection_score: number;
    complexity_score: number;
    emotional_content_score: number;
    timestamp: string;
  }>;
  modelStats: Record<string, any>;
  modelHealth: Array<{
    model: string;
    status: string;
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
  healthSummary: {
    totalModels: number;
    healthyModels: number;
    degradedModels: number;
    downModels: number;
    avgResponseTime: number;
    overallUptime: number;
  };
  taskPerformance: Record<string, Array<{
    model: string;
    avgScore: number;
    requests: number;
  }>>;
  costAnalytics: {
    dailyCost: number;
    costByModel: Record<string, number>;
    costByTask: Record<string, number>;
    avgCostPerRequest: number;
  };
  dailyTrends: Record<string, {
    cost: number;
    requests: number;
    success: number;
  }>;
  lastUpdated: string;
}

export default function AIOrchestrationDashboard() {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/ai-stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError('Failed to fetch AI orchestration stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading AI Orchestration Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Error loading dashboard</p>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button onClick={fetchStats} className="bg-primary hover:bg-primary/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-white">AI Orchestration Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(stats?.lastUpdated || '').toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats?.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  AI model reliability
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">
                  Optimized for speed
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">${stats?.costSavings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.costSavingsPercentage.toFixed(1)}% savings today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Model Health Status */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Model Health Status
              </CardTitle>
              <CardDescription>
                Real-time monitoring of AI model availability and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats?.modelHealth.map((model) => (
                  <div key={model.model} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{model.model}</h3>
                      <div className={`flex items-center gap-1 ${getStatusColor(model.status)}`}>
                        {getStatusIcon(model.status)}
                        <span className="text-sm capitalize">{model.status}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Uptime: {model.uptime.toFixed(1)}%</div>
                      <div>Response: {model.avgResponseTime}ms</div>
                      <div>Error Rate: {model.errorRate.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Model Decisions */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Live Model Decisions (Last 20)
              </CardTitle>
              <CardDescription>
                Real-time view of AI model selection decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{decision.task}</Badge>
                      <span className="font-medium">{decision.selected_model}</span>
                      <span className="text-sm text-muted-foreground">
                        Score: {decision.selection_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Complexity: {decision.complexity_score}/10</span>
                      <span>Emotional: {decision.emotional_content_score}/10</span>
                      <span>{new Date(decision.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Performance Analysis */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Task Performance Analysis
              </CardTitle>
              <CardDescription>
                Which models perform best for different types of tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mentor_chat" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="mentor_chat">Mentor Chat</TabsTrigger>
                  <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                  <TabsTrigger value="emotion">Emotion</TabsTrigger>
                  <TabsTrigger value="research">Research</TabsTrigger>
                </TabsList>
                
                {Object.entries(stats?.taskPerformance || {}).map(([task, performances]) => (
                  <TabsContent key={task} value={task} className="mt-4">
                    <div className="space-y-3">
                      {performances.slice(0, 3).map((perf, index) => (
                        <div key={perf.model} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Badge variant={index === 0 ? "default" : "outline"}>
                              #{index + 1}
                            </Badge>
                            <span className="font-medium">{perf.model}</span>
                            <span className="text-sm text-muted-foreground">
                              {perf.requests} requests
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">
                              Score: {perf.avgScore.toFixed(1)}
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (perf.avgScore / 100) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Cost Analytics */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Cost Analytics
              </CardTitle>
              <CardDescription>
                Daily cost breakdown and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Cost by Model</h3>
                  <div className="space-y-2">
                    {Object.entries(stats?.costAnalytics?.costByModel || {}).map(([model, cost]) => (
                      <div key={model} className="flex items-center justify-between">
                        <span className="text-sm">{model}</span>
                        <span className="font-medium">${cost.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Cost by Task</h3>
                  <div className="space-y-2">
                    {Object.entries(stats?.costAnalytics?.costByTask || {}).map(([task, cost]) => (
                      <div key={task} className="flex items-center justify-between">
                        <span className="text-sm">{task}</span>
                        <span className="font-medium">${cost.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
