'use client';

import { useEffect, useState } from 'react';
import { FileQuestion, TrendingUp, Target, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface PracticeWidgetData {
  recent_accuracy: number;
  total_sessions: number;
  total_questions: number;
  adaptive_difficulty: {
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  mistake_patterns: {
    type: string;
    frequency: number;
  }[];
  recommended_practice: string[];
}

export function PracticeQuestionsWidget() {
  const [data, setData] = useState<PracticeWidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPracticeData();
  }, []);

  const fetchPracticeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, patternsRes] = await Promise.all([
        fetch('/api/practice/analytics?days=7'),
        fetch('/api/practice/mistake-patterns'),
      ]);

      const analyticsData = await analyticsRes.json();
      const patternsData = await patternsRes.json();

      if (analyticsData.success) {
        const analytics = analyticsData.data.analytics;
        const patterns = patternsData.success ? patternsData.data.patterns : [];

        setData({
          recent_accuracy: analytics.average_accuracy || 0,
          total_sessions: analytics.total_sessions || 0,
          total_questions: analytics.total_questions || 0,
          adaptive_difficulty: analytics.topic_breakdown?.slice(0, 3) || [],
          mistake_patterns: patterns.slice(0, 3) || [],
          recommended_practice: analytics.weaknesses?.slice(0, 2).map((w: any) => w.topic) || [],
        });
      } else {
        setError('Failed to load practice data');
      }
    } catch (err) {
      console.error('Failed to fetch practice data:', err);
      setError('Failed to load practice data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/60 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Practice Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-slate-900/60 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400">Practice Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-400 mb-4">{error || 'No data available'}</p>
            <Link href="/dashboard/student/practice">
              <Button size="sm" variant="outline">
                Start Practicing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-yellow-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Practice Questions
            </CardTitle>
            <CardDescription>Your practice performance overview</CardDescription>
          </div>
          <Link href="/dashboard/student/practice">
            <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{Math.round(data.recent_accuracy)}%</p>
            <p className="text-xs text-slate-400">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{data.total_sessions}</p>
            <p className="text-xs text-slate-400">Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{data.total_questions}</p>
            <p className="text-xs text-slate-400">Questions</p>
          </div>
        </div>

        <Progress value={data.recent_accuracy} className="h-2 bg-slate-700" />

        {/* Adaptive Difficulty */}
        {data.adaptive_difficulty.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400">Current Difficulty Levels</p>
            <div className="space-y-2">
              {data.adaptive_difficulty.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-sm text-white">{item.topic}</span>
                  <Badge
                    className={
                      item.difficulty === 'hard'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : item.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                        : 'bg-green-500/20 text-green-400 border-green-500/50'
                    }
                  >
                    {item.difficulty}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Practice */}
        {data.recommended_practice.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
              <Target className="h-3 w-3" />
              Recommended Practice
            </p>
            <div className="space-y-1">
              {data.recommended_practice.map((topic, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-white">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action */}
        <Link href="/dashboard/student/practice">
          <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
            <FileQuestion className="h-4 w-4 mr-2" />
            Start Practice Session
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

