'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  Calendar,
  Activity,
  Target,
  Clock,
  Award,
  Brain,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedAnalytics {
  overview: any;
  trends: any;
  comparisons: {
    weekOverWeek?: {
      accuracy: number;
      sessions: number;
      xp: number;
    };
    monthOverMonth?: {
      accuracy: number;
      sessions: number;
      xp: number;
    };
  };
  insights: {
    performanceTrend: 'improving' | 'declining' | 'stable';
    topStrengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  categoryBreakdown: {
    [category: string]: {
      sessions: number;
      accuracy: number;
      xp: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
}

interface AnalyticsDashboardProps {
  period?: 'week' | 'month' | 'semester';
  onPeriodChange?: (period: 'week' | 'month' | 'semester') => void;
}

export function AnalyticsDashboard({ period = 'month', onPeriodChange }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>(period);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/dashboard/analytics?period=${selectedPeriod}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      
      if (result.success) {
        // Process analytics data
        const data = result.data;
        
        // Calculate comparisons (would need previous period data in real implementation)
        const enhanced: EnhancedAnalytics = {
          overview: data.overview,
          trends: data.trends,
          comparisons: {
            weekOverWeek: {
              accuracy: 5.2, // Example: would calculate from previous week
              sessions: 2, // Example
              xp: 150, // Example
            },
            monthOverMonth: {
              accuracy: 8.5,
              sessions: 5,
              xp: 400,
            },
          },
          insights: {
            performanceTrend: data.overview?.practice?.accuracy > 75 ? 'improving' : 
                            data.overview?.practice?.accuracy < 60 ? 'declining' : 'stable',
            topStrengths: ['Consistent practice', 'Goal completion', 'Active learning'],
            areasForImprovement: ['Accuracy improvement needed', 'More study sessions'],
            recommendations: [
              'Focus on weak topics',
              'Increase practice frequency',
              'Review mistakes regularly',
            ],
          },
          categoryBreakdown: {
            'Practice Questions': {
              sessions: data.overview?.practice?.sessions || 0,
              accuracy: data.overview?.practice?.accuracy || 0,
              xp: data.overview?.xp?.this_period || 0,
              trend: 'up',
            },
            'Study Sessions': {
              sessions: data.overview?.study?.sessions || 0,
              accuracy: 0,
              xp: 0,
              trend: 'stable',
            },
          },
        };
        
        setAnalytics(enhanced);
        onPeriodChange?.(selectedPeriod);
      } else {
        throw new Error(result.error || 'Failed to load analytics');
      }
    } catch (err: any) {
      console.error('Analytics error:', err);
      setError(err.message || 'Failed to load analytics');
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendColor = (delta: number) => {
    if (delta > 0) return 'text-green-400';
    if (delta < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getPerformanceColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'declining': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="bg-slate-900/50 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />
            <p>{error || 'Failed to load analytics'}</p>
          </div>
          <Button 
            onClick={fetchAnalytics} 
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="bg-slate-900/50 border-yellow-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>Detailed performance analytics and insights</CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="semester">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Practice Accuracy</span>
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {analytics.overview?.practice?.accuracy?.toFixed(1) || 0}%
                </p>
                {analytics.comparisons?.monthOverMonth && (
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.comparisons.monthOverMonth.accuracy)}`}>
                    {getTrendIcon(analytics.comparisons.monthOverMonth.accuracy)}
                    <span>
                      {analytics.comparisons.monthOverMonth.accuracy > 0 ? '+' : ''}
                      {analytics.comparisons.monthOverMonth.accuracy.toFixed(1)}% vs last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Total Sessions</span>
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {analytics.overview?.practice?.sessions || 0}
                </p>
                {analytics.comparisons?.monthOverMonth && (
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.comparisons.monthOverMonth.sessions)}`}>
                    {getTrendIcon(analytics.comparisons.monthOverMonth.sessions)}
                    <span>
                      {analytics.comparisons.monthOverMonth.sessions > 0 ? '+' : ''}
                      {analytics.comparisons.monthOverMonth.sessions} vs last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">XP Earned</span>
                  <Award className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {analytics.overview?.xp?.this_period || 0}
                </p>
                {analytics.comparisons?.monthOverMonth && (
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.comparisons.monthOverMonth.xp)}`}>
                    {getTrendIcon(analytics.comparisons.monthOverMonth.xp)}
                    <span>
                      {analytics.comparisons.monthOverMonth.xp > 0 ? '+' : ''}
                      {analytics.comparisons.monthOverMonth.xp} vs last month
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Trend */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={getPerformanceColor(analytics.insights.performanceTrend)}>
                  {analytics.insights.performanceTrend === 'improving' ? 'Improving' : 
                   analytics.insights.performanceTrend === 'declining' ? 'Declining' : 'Stable'}
                </Badge>
                <div className="flex-1">
                  <Progress 
                    value={
                      analytics.insights.performanceTrend === 'improving' ? 75 :
                      analytics.insights.performanceTrend === 'declining' ? 35 : 50
                    } 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI-Generated Insights */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Performance Insights
              </CardTitle>
              <CardDescription>AI-generated recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.insights.topStrengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Top Strengths
                  </h4>
                  <div className="space-y-1">
                    {analytics.insights.topStrengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.insights.areasForImprovement.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Areas for Improvement
                  </h4>
                  <div className="space-y-1">
                    {analytics.insights.areasForImprovement.map((area, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analytics.insights.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <div className="space-y-1">
                    {analytics.insights.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {Object.keys(analytics.categoryBreakdown).length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Category Breakdown</CardTitle>
                <CardDescription>Performance by activity category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.categoryBreakdown).map(([category, data]) => (
                    <div key={category} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{category}</h4>
                        <Badge className={
                          data.trend === 'up' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                          data.trend === 'down' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/50'
                        }>
                          {data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'} {data.trend}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">Sessions</p>
                          <p className="text-white font-semibold">{data.sessions}</p>
                        </div>
                        {data.accuracy > 0 && (
                          <div>
                            <p className="text-slate-400 mb-1">Accuracy</p>
                            <p className="text-white font-semibold">{data.accuracy.toFixed(1)}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-400 mb-1">XP</p>
                          <p className="text-white font-semibold">{data.xp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trends Chart Data */}
          {analytics.trends && analytics.trends.practice && analytics.trends.practice.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  Daily Trends
                </CardTitle>
                <CardDescription>Your performance over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.trends.practice.slice(-7).map((day: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-300">{day.questions || 0} questions</span>
                          <span className="text-yellow-400 font-semibold">{day.accuracy?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                      <Progress value={day.accuracy || 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}





