"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, TrendingUp, Users, Target, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Analytics {
  batch: string;
  student_count: number;
  active_arks_count: number;
  completed_arks_count: number;
  avg_completion_rate: number;
  avg_progress: number;
  avg_motivation: number;
  avg_stress: number;
  avg_confidence: number;
  practice: {
    sessions: number;
    questions: number;
    avg_accuracy: number;
    engagement: number;
  };
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  trends: {
    engagement: Array<{ date: string; value: number }>;
    arks: Array<{ date: string; completion_rate: number }>;
    practice: Array<{ date: string; accuracy: number }>;
    risk: Array<{ date: string; high: number; medium: number; low: number }>;
  };
  top_performers: Array<{ student_id: string; metrics: any }>;
  needs_attention: Array<{ student_id: string; issues: string[] }>;
  period: string;
}

export default function TeacherAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>("week");

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchAnalytics();
    }
  }, [selectedBatch, period]);

  const fetchBatches = async () => {
    try {
      const response = await fetch("/api/teacher/dashboard");
      const data = await response.json();
      if (data.success) {
        setAvailableBatches(data.data.assigned_batches || []);
        if (data.data.assigned_batches && data.data.assigned_batches.length > 0) {
          setSelectedBatch(data.data.assigned_batches[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/teacher/batch-analytics?batch=${selectedBatch}&period=${period}`
      );
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data.analytics);
      } else {
        toast.error(data.error || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBatch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/teacher"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Batch Analytics</h1>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No batches assigned</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Batch Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Performance insights for your batches
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableBatches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="semester">Last Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      ) : analytics ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-2xl font-bold">{analytics.student_count}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{analytics.avg_completion_rate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Practice Accuracy</p>
                    <p className="text-2xl font-bold">{analytics.practice.avg_accuracy}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold text-red-500">
                      {analytics.high_risk_count}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.engagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="Engagement %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Accuracy Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.practice}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#82ca9d"
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers & Needs Attention */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.top_performers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No data available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.top_performers.map((performer, idx) => (
                      <div
                        key={performer.student_id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="font-medium">#{idx + 1}</span>
                        <span className="text-sm text-muted-foreground">
                          ARKs: {performer.metrics.ark_completion} | Accuracy:{" "}
                          {performer.metrics.practice_accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Needs Attention</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.needs_attention.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    All students performing well!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {analytics.needs_attention.map((student) => (
                      <div
                        key={student.student_id}
                        className="p-2 bg-red-500/10 border border-red-500/20 rounded"
                      >
                        <p className="text-sm font-medium mb-1">Student ID: {student.student_id}</p>
                        <div className="flex flex-wrap gap-1">
                          {student.issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

