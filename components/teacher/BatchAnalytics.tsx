"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target, AlertTriangle, Award } from "lucide-react";

interface BatchAnalyticsProps {
  batch: string;
}

export function BatchAnalytics({ batch }: BatchAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [batch]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/teacher/batch-analytics?batch=${batch}&period=week`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-white">No analytics available</div>;
  }

  const riskData = [
    { name: 'High Risk', value: analytics.analytics.high_risk_count, color: '#EF4444' },
    { name: 'Medium Risk', value: analytics.analytics.medium_risk_count, color: '#F59E0B' },
    { name: 'Low Risk', value: analytics.analytics.low_risk_count, color: '#10B981' }
  ];

  const psychologyData = [
    { name: 'Motivation', score: analytics.analytics.avg_motivation },
    { name: 'Stress', score: analytics.analytics.avg_stress },
    { name: 'Confidence', score: analytics.analytics.avg_confidence }
  ];

  // Get practice data if available
  const practiceData = analytics.analytics.practice || {
    sessions: 0,
    questions: 0,
    avg_accuracy: 0,
    engagement: 0,
  };

  // Get trends if available
  const trends = analytics.analytics.trends || {
    engagement: [],
    arks: [],
    practice: [],
    risk: [],
  };

  // Get top performers and needs attention
  const topPerformers = analytics.analytics.top_performers || [];
  const needsAttention = analytics.analytics.needs_attention || [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Students</p>
                <p className="text-3xl font-bold text-white">{analytics.analytics.student_count}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active ARKs</p>
                <p className="text-3xl font-bold text-white">{analytics.analytics.active_arks_count}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold text-white">
                  {Math.round(analytics.analytics.avg_completion_rate)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Risk</p>
                <p className="text-3xl font-bold text-white">{analytics.analytics.high_risk_count}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Psychology Averages */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Average Psychology Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={psychologyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Practice Questions Metrics */}
      {practiceData.sessions > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Practice Sessions</p>
                  <p className="text-3xl font-bold text-white">{practiceData.sessions}</p>
                </div>
                <Target className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Questions Attempted</p>
                  <p className="text-3xl font-bold text-white">{practiceData.questions}</p>
                </div>
                <Target className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg Accuracy</p>
                  <p className="text-3xl font-bold text-white">{Math.round(practiceData.avg_accuracy)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Engagement</p>
                  <p className="text-3xl font-bold text-white">{practiceData.engagement.toFixed(1)}</p>
                </div>
                <Award className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Practice Trends */}
      {trends.practice && trends.practice.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Practice Accuracy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.practice.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="#EAB308" strokeWidth={2} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card className="bg-slate-800/50 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((performer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-white">Student #{performer.student_id.slice(0, 8)}</p>
                    <div className="flex gap-4 mt-1 text-xs text-slate-400">
                      <span>ARKs: {performer.metrics.ark_completion}</span>
                      <span>Practice: {performer.metrics.practice_accuracy}%</span>
                      <span>Engagement: {performer.metrics.engagement}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Top {idx + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="bg-slate-800/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.map((student: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-white">Student #{student.student_id.slice(0, 8)}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {student.issues.map((issue: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs border-red-500/50 text-red-300">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                    Needs Help
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Needing Attention */}
      {analytics.students_needing_attention && analytics.students_needing_attention.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span>Students Needing Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.students_needing_attention.map((student: any) => (
                <div key={student.user_id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {student.users.avatar_url ? (
                      <img
                        src={student.users.avatar_url}
                        alt={student.users.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {student.users.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{student.users.full_name}</p>
                      <p className="text-sm text-gray-400">Risk Score: {student.risk_score}</p>
                    </div>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    High Risk
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {analytics.top_performers && analytics.top_performers.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>Top Performers (by XP)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_performers.map((performer: any, index: number) => (
                <div key={performer.student_id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Student {performer.student_id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-400">{performer.total_xp} XP</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

