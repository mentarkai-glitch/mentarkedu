'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Target, 
  Award, 
  Clock,
  BarChart3,
  AlertCircle,
  Loader2,
  Shield,
  ShieldCheck,
} from 'lucide-react';

interface PeerComparisonData {
  student: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
  };
  peers: {
    totalQuestions: number;
    totalStudents: number;
    averageAccuracy: number;
    averageTime: number;
  };
  comparison: {
    accuracyDelta: number;
    timeDelta: number;
    percentile: number;
    performanceStatus: 'above' | 'average' | 'below';
    rank: number;
    totalRanked: number;
  };
  topicPerformance: Array<{
    topic: string;
    studentAccuracy: number;
    peerAccuracy: number;
    accuracyDelta: number;
    studentQuestions: number;
    peerQuestions: number;
  }>;
  filters: {
    topic: string | null;
    subject: string | null;
    days: number;
    batch: string | null;
  };
}

interface PeerComparisonProps {
  topic?: string;
  subject?: string;
  days?: number;
  onPrivacyToggle?: (enabled: boolean) => void;
  privacyEnabled?: boolean;
}

export function PeerComparison({ 
  topic, 
  subject, 
  days = 30,
  onPrivacyToggle,
  privacyEnabled = false,
}: PeerComparisonProps) {
  const [data, setData] = useState<PeerComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeBatch, setIncludeBatch] = useState(false);

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        days: days.toString(),
      });

      if (topic) params.append('topic', topic);
      if (subject) params.append('subject', subject);
      if (includeBatch) params.append('batch', 'true');
      if (!privacyEnabled) params.append('include_anonymous', 'true');

      const response = await fetch(`/api/practice/peer-comparison?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }).catch((fetchError) => {
        // Handle network-level errors (connection refused, CORS, etc.)
        console.error('Fetch error:', fetchError);
        throw new Error('Unable to connect to server. Please check your internet connection.');
      });
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          throw new Error('Please log in to view peer comparisons');
        } else if (response.status === 404) {
          throw new Error('Student profile not found. Please complete your profile setup.');
        } else {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: `Server error (${response.status})` };
          }
          throw new Error(errorData.error || `Failed to fetch peer comparison data (${response.status})`);
        }
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load comparison data');
      }
    } catch (err: any) {
      console.error('Peer comparison error:', err);
      // Handle network errors specifically
      if (err.name === 'TypeError' && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to load peer comparison. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [topic, subject, days, includeBatch, privacyEnabled]);

  useEffect(() => {
    // Only fetch if we're in the browser
    if (typeof window !== 'undefined') {
      fetchComparison();
    }
  }, [fetchComparison]);

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case 'above': return 'text-green-400';
      case 'below': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getPerformanceBadgeColor = (status: string) => {
    switch (status) {
      case 'above': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'below': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-400';
    if (delta < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Peer Comparison</CardTitle>
          <CardDescription>Comparing your performance with peers</CardDescription>
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

  if (error) {
    return (
      <Card className="bg-slate-900/50 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-300">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <Button 
            onClick={fetchComparison} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="bg-slate-900/50 border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Peer Comparison
            </CardTitle>
            <CardDescription className="mt-1">
              {privacyEnabled ? (
                <span className="flex items-center gap-2 text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  Anonymous mode - Your data is private
                </span>
              ) : (
                <span className="flex items-center gap-2 text-slate-400">
                  <Shield className="w-4 h-4" />
                  Comparing with {data.peers.totalStudents} {includeBatch ? 'batch ' : ''}peers
                </span>
              )}
            </CardDescription>
          </div>
          {onPrivacyToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrivacyToggle(!privacyEnabled)}
              className="flex items-center gap-2"
            >
              {privacyEnabled ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Privacy On
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Privacy Off
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">By Topic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overall Performance Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Your Accuracy</span>
                    <Target className="w-4 h-4 text-yellow-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {data.student.accuracy.toFixed(1)}%
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${getDeltaColor(data.comparison.accuracyDelta)}`}>
                    {getDeltaIcon(data.comparison.accuracyDelta)}
                    <span>
                      {data.comparison.accuracyDelta > 0 ? '+' : ''}
                      {data.comparison.accuracyDelta.toFixed(1)}% vs peers
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Average Peer Accuracy</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {data.peers.averageAccuracy.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-400">
                    Based on {data.peers.totalQuestions} questions from {data.peers.totalStudents} students
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Status */}
            <Card className={`border-2 ${data.comparison.performanceStatus === 'above' ? 'border-green-500/50 bg-green-500/5' : data.comparison.performanceStatus === 'below' ? 'border-red-500/50 bg-red-500/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPerformanceBadgeColor(data.comparison.performanceStatus)}>
                        {data.comparison.performanceStatus === 'above' ? 'Above Average' : data.comparison.performanceStatus === 'below' ? 'Below Average' : 'Average'}
                      </Badge>
                      <span className={`text-lg font-semibold ${getPerformanceColor(data.comparison.performanceStatus)}`}>
                        {data.comparison.percentile.toFixed(1)}th Percentile
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Rank: {data.comparison.rank} of {data.comparison.totalRanked} students
                    </p>
                  </div>
                  <div className="text-right">
                    <Award className={`w-12 h-12 ${getPerformanceColor(data.comparison.performanceStatus)} opacity-50`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Questions Attempted</span>
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {data.student.totalQuestions}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.student.correctAnswers} correct
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Avg. Time per Question</span>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(data.student.averageTime)}s
                  </p>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${getDeltaColor(-data.comparison.timeDelta)}`}>
                    {getDeltaIcon(-data.comparison.timeDelta)}
                    <span>
                      {data.comparison.timeDelta > 0 ? '+' : ''}
                      {Math.round(data.comparison.timeDelta)}s vs peers
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Comparison Period</span>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {data.filters.days}d
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {data.filters.topic ? `Topic: ${data.filters.topic}` : 'All topics'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-4 mt-6">
            {data.topicPerformance.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No topic-specific data available</p>
              </div>
            ) : (
              data.topicPerformance.map((topic) => (
                <Card key={topic.topic} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white mb-1">{topic.topic}</h4>
                        <p className="text-xs text-slate-400">
                          You: {topic.studentQuestions} questions | 
                          Peers: {topic.peerQuestions} questions
                        </p>
                      </div>
                      <Badge className={getPerformanceBadgeColor(
                        topic.accuracyDelta > 5 ? 'above' : topic.accuracyDelta < -5 ? 'below' : 'average'
                      )}>
                        {topic.accuracyDelta > 0 ? '+' : ''}{topic.accuracyDelta.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Your Accuracy</span>
                          <span className="text-yellow-400 font-semibold">
                            {topic.studentAccuracy.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={topic.studentAccuracy} 
                          className="h-2 bg-slate-700"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Peer Average</span>
                          <span className="text-blue-400 font-semibold">
                            {topic.peerAccuracy.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={topic.peerAccuracy} 
                          className="h-2 bg-slate-700"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Filter Options */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={includeBatch}
                onChange={(e) => setIncludeBatch(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-yellow-500"
              />
              Compare with batch only
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchComparison}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




