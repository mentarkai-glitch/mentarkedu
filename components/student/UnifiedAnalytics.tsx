'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  FileQuestion,
  BookOpen,
  Calendar,
  Zap,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface UnifiedAnalyticsProps {
  period?: 'week' | 'month' | 'semester';
}

interface AnalyticsData {
  overview: {
    arks: { active: number; completed: number; total: number; avg_progress: number };
    practice: { accuracy: number; sessions: number; questions: number; correct: number };
    study: { hours: number; sessions: number; avg_session_hours: number };
    daily_assistant: { tasks_completed: number; tasks_total: number; completion_rate: number };
    xp: { total: number; this_period: number; level: number };
    streak: { current: number; longest: number };
  };
  trends: {
    arks: Array<{ date: string; completed: number }>;
    practice: Array<{ date: string; accuracy: number; questions: number }>;
    xp: Array<{ date: string; earned: number }>;
  };
  pending_items: {
    spaced_repetition: number;
    upcoming_deadlines: Array<{ ark_id: string; title: string; due_date: string }>;
    practice_sessions: number;
  };
}

export function UnifiedAnalytics({ period = 'week' }: UnifiedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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
      const response = await fetch(`/api/student/dashboard/analytics?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/60 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Unified Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="bg-slate-900/60 border-red-500/30">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Failed to load analytics'}</p>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { overview, trends, pending_items } = analytics;

  return (
    <Card className="bg-slate-900/60 border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Unified Analytics
            </CardTitle>
            <CardDescription>Your complete performance overview</CardDescription>
          </div>
          <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
              <TabsTrigger value="semester" className="text-xs">Semester</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ARKs */}
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-slate-400">ARKs</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  {overview.arks.active} active
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{overview.arks.completed}</span>
                  <span className="text-xs text-slate-400">completed</span>
                </div>
                <Progress value={overview.arks.avg_progress} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">Avg progress: {overview.arks.avg_progress}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Practice */}
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-slate-400">Practice</span>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  {overview.practice.sessions} sessions
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{Math.round(overview.practice.accuracy)}%</span>
                  <span className="text-xs text-slate-400">accuracy</span>
                </div>
                <Progress value={overview.practice.accuracy} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">{overview.practice.questions} questions</p>
              </div>
            </CardContent>
          </Card>

          {/* Study */}
          <Card className="bg-slate-800/50 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-slate-400">Study</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  {overview.study.sessions} sessions
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{overview.study.hours.toFixed(1)}h</span>
                  <span className="text-xs text-slate-400">total hours</span>
                </div>
                <Progress value={(overview.study.hours / 20) * 100} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">Avg: {overview.study.avg_session_hours.toFixed(1)}h/session</p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Assistant */}
          <Card className="bg-slate-800/50 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-slate-400">Daily Assistant</span>
                </div>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  {overview.daily_assistant.tasks_completed}/{overview.daily_assistant.tasks_total}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{Math.round(overview.daily_assistant.completion_rate)}%</span>
                  <span className="text-xs text-slate-400">completion</span>
                </div>
                <Progress value={overview.daily_assistant.completion_rate} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">Tasks completed</p>
              </div>
            </CardContent>
          </Card>

          {/* XP */}
          <Card className="bg-slate-800/50 border-orange-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-slate-400">XP</span>
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                  Level {overview.xp.level}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{overview.xp.total}</span>
                  <span className="text-xs text-slate-400">total</span>
                </div>
                <Progress value={(overview.xp.this_period / 500) * 100} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">+{overview.xp.this_period} this period</p>
              </div>
            </CardContent>
          </Card>

          {/* Streak */}
          <Card className="bg-slate-800/50 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-slate-400">Streak</span>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                  {overview.streak.current} days
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{overview.streak.current}</span>
                  <span className="text-xs text-slate-400">current</span>
                </div>
                <Progress value={(overview.streak.current / overview.streak.longest) * 100} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">Longest: {overview.streak.longest} days</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trends Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ARK Completion Trend */}
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                ARK Completion Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends.arks.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                  <Area type="monotone" dataKey="completed" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Practice Accuracy Trend */}
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Practice Accuracy Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trends.practice.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#EAB308" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Items */}
        {(pending_items.spaced_repetition > 0 || pending_items.upcoming_deadlines.length > 0) && (
          <Card className="bg-slate-800/50 border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending_items.spaced_repetition > 0 && (
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">Spaced Repetition Reviews</p>
                      <p className="text-xs text-slate-400">{pending_items.spaced_repetition} items due</p>
                    </div>
                  </div>
                  <Link href="/dashboard/student/study-analyzer">
                    <Button size="sm" variant="outline" className="border-orange-500/50 text-orange-400">
                      Review
                    </Button>
                  </Link>
                </div>
              )}
              
              {pending_items.upcoming_deadlines.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-semibold">Upcoming Deadlines</p>
                  {pending_items.upcoming_deadlines.slice(0, 3).map((deadline) => (
                    <div key={deadline.ark_id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                      <div className="flex-1">
                        <p className="text-sm text-white">{deadline.title}</p>
                        <p className="text-xs text-slate-400">
                          Due: {new Date(deadline.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/dashboard/student/arks`}>
                        <Button size="sm" variant="ghost" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/student/practice">
            <Button variant="outline" size="sm" className="border-yellow-500/50 text-yellow-400">
              <FileQuestion className="h-4 w-4 mr-2" />
              Practice Questions
            </Button>
          </Link>
          <Link href="/dashboard/student/daily-assistant">
            <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Assistant
            </Button>
          </Link>
          <Link href="/dashboard/student/arks">
            <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400">
              <Target className="h-4 w-4 mr-2" />
              My ARKs
            </Button>
          </Link>
          <Link href="/dashboard/student/progress">
            <Button variant="outline" size="sm" className="border-green-500/50 text-green-400">
              <Activity className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

