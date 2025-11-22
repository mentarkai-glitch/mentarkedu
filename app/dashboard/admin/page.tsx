"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  BarChart3, 
  CreditCard, 
  BookOpen,
  TrendingUp,
  Target,
  AlertTriangle,
  Award,
  UserPlus,
  Plus,
  FileText,
  Home,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import components
import { KPICard } from "@/components/admin/KPICard";
import { TeacherList } from "@/components/admin/TeacherList";
import { BillingCard } from "@/components/admin/BillingCard";
import { PlanComparison } from "@/components/admin/PlanComparison";
import { BatchHealthHeatmap } from "@/components/admin/BatchHealthHeatmap";
import { BatchRadar } from "@/components/dashboard/admin/BatchRadar";
import { InterventionWarRoom } from "@/components/dashboard/admin/InterventionWarRoom";

interface Analytics {
  overview: {
    total_students: number;
    total_teachers: number;
    active_arks: number;
    completed_arks: number;
    completion_rate: number;
    engagement_rate: number;
    growth_rate: number;
    avg_students_per_teacher: number;
  };
  risk_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  student_distribution: {
    by_grade: Record<string, number>;
    by_batch: Record<string, number>;
  };
}

interface RiskInsights {
  level_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  risk_trend: Array<{ date: string; average_dropout_risk: number }>;
  top_high_risk: Array<{
    student_id: string;
    name: string;
    risk_level: string;
    dropout_risk_score: number;
    burnout_risk_score: number;
    disengagement_risk_score: number;
    prediction_date: string;
    primary_risk_factors: string[];
    early_warning_flags: string[];
  }>;
  alerts: {
    recent: Array<{
      id: string;
      student_id: string;
      name: string;
      severity: string;
      status: string;
      risk_score: number;
      alert_type: string;
      message: string;
      created_at: string;
    }>;
    by_severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    open_count: number;
  };
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [riskInsights, setRiskInsights] = useState<RiskInsights | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [showAssignBatch, setShowAssignBatch] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    fetchAnalytics();
    fetchRiskInsights();
    fetchTeachers();
    fetchBilling();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
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

  const fetchRiskInsights = async () => {
    try {
      const response = await fetch('/api/admin/risk-insights');
      const data = await response.json();
      if (data.success) {
        setRiskInsights(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch risk insights:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');
      const data = await response.json();
      if (data.success) {
        setTeachers(data.data.teachers || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const fetchAvailableBatches = async () => {
    try {
      const response = await fetch('/api/teacher/students');
      const data = await response.json();
      if (data.success && data.data?.students) {
        // Get unique batches from students
        const batches = new Set<string>();
        data.data.students.forEach((student: any) => {
          if (student.batch) {
            batches.add(student.batch);
          }
        });
        setAvailableBatches(Array.from(batches).sort());
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  useEffect(() => {
    if (showAssignBatch) {
      fetchAvailableBatches();
    }
  }, [showAssignBatch]);

  const handleAssignBatch = async () => {
    if (!selectedTeacherId || !selectedBatch) {
      toast.error('Please select a batch');
      return;
    }

    try {
      const response = await fetch(`/api/teachers/${selectedTeacherId}/assign-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: selectedBatch }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.data.message || 'Batch assigned successfully');
        fetchTeachers();
        setShowAssignBatch(false);
        setSelectedTeacherId(null);
        setSelectedBatch("");
      } else {
        toast.error(data.error || 'Failed to assign batch');
      }
    } catch (error: any) {
      console.error('Failed to assign batch:', error);
      toast.error(error.message || 'Failed to assign batch');
    }
  };

  const fetchBilling = async () => {
    try {
      const response = await fetch('/api/admin/billing');
      const data = await response.json();
      if (data.success) {
        setBilling(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch billing:', error);
    }
  };

  const handleAddTeacher = async (formData: any) => {
    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchTeachers();
        setShowAddTeacher(false);
      }
    } catch (error) {
      console.error('Failed to add teacher:', error);
    }
  };

  const handlePlanChange = async (newPlan: 'neuro' | 'quantum') => {
    try {
      const response = await fetch('/api/admin/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: newPlan })
      });
      
      if (response.ok) {
        fetchBilling();
        setShowPlanChange(false);
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const gradeChartData = analytics?.student_distribution.by_grade 
    ? Object.entries(analytics.student_distribution.by_grade).map(([grade, count]) => ({
        grade: `Grade ${grade}`,
        students: count
      }))
    : [];

  const riskChartData = [
    { name: 'High Risk', value: riskInsights?.level_counts.high || analytics?.risk_distribution.high || 0, color: '#EF4444' },
    { name: 'Medium Risk', value: riskInsights?.level_counts.medium || analytics?.risk_distribution.medium || 0, color: '#F59E0B' },
    { name: 'Low Risk', value: riskInsights?.level_counts.low || analytics?.risk_distribution.low || 0, color: '#10B981' }
  ];

  const riskTrendData = (riskInsights?.risk_trend || []).map((trend) => ({
    date: new Date(trend.date).toLocaleDateString(),
    average_dropout_risk: Math.round(trend.average_dropout_risk),
  }));

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };
  

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src="/logo.png" alt="Mentark" className="h-8 w-8 rounded-lg" />
            </Link>
            <span className="font-display text-xl font-bold text-white">
              Admin Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
            
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl text-white mb-2">
                Institute Analytics & Management
              </CardTitle>
              <p className="text-lg text-slate-300">
                Monitor your institute&apos;s performance and manage resources effectively.
              </p>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teachers">
              <Users className="h-4 w-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="templates">
              <BookOpen className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <KPICard
                title="Total Students"
                value={analytics?.overview.total_students || 0}
                subtitle="Active learners"
                icon={Users}
                trend={{ value: analytics?.overview.growth_rate || 0, label: 'growth' }}
                gradient="from-blue-500 to-cyan-500"
                iconColor="text-white"
              />
              
              <KPICard
                title="Total Teachers"
                value={analytics?.overview.total_teachers || 0}
                subtitle={`${analytics?.overview.avg_students_per_teacher.toFixed(1)} students/teacher`}
                icon={Users}
                gradient="from-purple-500 to-pink-500"
                iconColor="text-white"
              />
              
              <KPICard
                title="Active ARKs"
                value={analytics?.overview.active_arks || 0}
                subtitle={`${analytics?.overview.completed_arks || 0} completed`}
                icon={Target}
                gradient="from-green-500 to-emerald-500"
                iconColor="text-white"
              />
              
              <KPICard
                title="Engagement Rate"
                value={`${analytics?.overview.engagement_rate || 0}%`}
                subtitle="Last 30 days"
                icon={TrendingUp}
                gradient="from-orange-500 to-yellow-500"
                iconColor="text-white"
              />
            </div>

            {/* Batch Health */}
            <BatchHealthHeatmap />

            {/* Air Traffic Control - Batch Radar */}
            <BatchRadar />

            {/* Intervention War Room */}
            <InterventionWarRoom />

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Distribution by Grade */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Students by Grade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={gradeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="grade" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="students" fill="#06B6D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Student Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{analytics?.overview.completion_rate || 0}%</p>
                    <p className="text-sm text-gray-400 mt-1">ARK Completion</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{riskInsights?.level_counts.high || analytics?.risk_distribution.high || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">High Risk Students</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{analytics?.overview.total_teachers || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">Active Teachers</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">
                      {riskInsights?.alerts.open_count ?? (analytics?.overview.growth_rate != null
                        ? analytics.overview.growth_rate.toFixed(1)
                        : 0)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Open Risk Alerts</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{analytics?.overview.growth_rate.toFixed(1) || 0}%</p>
                    <p className="text-sm text-gray-400 mt-1">Monthly Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {riskInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Dropout Risk Trend (Last 14 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskTrendData.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">Insufficient data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={riskTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="average_dropout_risk" stroke="#f59e0b" strokeWidth={2} dot />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Top High-Risk Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {riskInsights.top_high_risk.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">No high-risk students yet</div>
                    ) : (
                      <div className="space-y-3">
                        {riskInsights.top_high_risk.map((student) => (
                          <div key={student.student_id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-semibold">{student.name}</p>
                                <p className="text-xs text-slate-400">Updated {new Date(student.prediction_date).toLocaleString()}</p>
                              </div>
                              <Badge className={getSeverityBadge(student.risk_level)}>{student.risk_level.toUpperCase()}</Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-300">
                              <div>
                                <p className="text-slate-400">Dropout</p>
                                <p className="text-white font-semibold">{Math.round(student.dropout_risk_score)}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Burnout</p>
                                <p className="text-white font-semibold">{Math.round(student.burnout_risk_score)}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Disengagement</p>
                                <p className="text-white font-semibold">{Math.round(student.disengagement_risk_score)}</p>
                              </div>
                            </div>
                            {student.primary_risk_factors?.length > 0 && (
                              <div className="mt-2 text-xs text-slate-400">
                                Key factors: {student.primary_risk_factors.slice(0, 2).join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {riskInsights && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Recent Risk Alerts</CardTitle>
                    <Badge className={getSeverityBadge('high')}>
                      {riskInsights.alerts.open_count} open
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {riskInsights.alerts.recent.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">No open alerts 🎉</div>
                  ) : (
                    <div className="space-y-3">
                      {riskInsights.alerts.recent.map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between bg-slate-700/30 border border-slate-600/30 rounded-lg p-3">
                          <div>
                            <p className="text-white font-semibold">{alert.name}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {alert.alert_type.replace('_', ' ')} · {new Date(alert.created_at).toLocaleString()}
                            </p>
                            {alert.message && (
                              <p className="text-xs text-slate-300 mt-2 line-clamp-2">{alert.message}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className={getSeverityBadge(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                            <p className="text-xs text-slate-400 mt-2">Score: {Math.round(alert.risk_score)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            {showAddTeacher ? (
              <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Add New Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAddTeacher({
                        email: formData.get('email'),
                        full_name: formData.get('full_name'),
                        specialization: (formData.get('specialization') as string)?.split(',').map(s => s.trim()) || [],
                        assigned_batches: (formData.get('assigned_batches') as string)?.split(',').map(s => s.trim()) || []
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label className="text-white">Full Name</Label>
                      <Input
                        name="full_name"
                        placeholder="John Doe"
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Email</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="teacher@example.com"
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Specialization (comma-separated)</Label>
                      <Input
                        name="specialization"
                        placeholder="Mathematics, Physics"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Assigned Batches (comma-separated)</Label>
                      <Input
                        name="assigned_batches"
                        placeholder="2024, 2025"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">
                        Add Teacher
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setShowAddTeacher(false)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}
            
            <TeacherList 
              teachers={teachers}
              onAddTeacher={() => setShowAddTeacher(true)}
              onAssignBatch={(teacherId) => {
                setSelectedTeacherId(teacherId);
                setShowAssignBatch(true);
              }}
            />

            {/* Assign Batch Dialog */}
            <Dialog open={showAssignBatch} onOpenChange={setShowAssignBatch}>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Assign Batch to Teacher</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Select a batch to assign to this teacher
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-white mb-2 block">Select Batch</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose a batch..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {availableBatches.length > 0 ? (
                          availableBatches.map((batch) => (
                            <SelectItem key={batch} value={batch} className="text-white focus:bg-slate-600">
                              {batch}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled className="text-slate-400">
                            No batches available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAssignBatch(false);
                      setSelectedTeacherId(null);
                      setSelectedBatch("");
                    }}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignBatch}
                    disabled={!selectedBatch}
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    Assign Batch
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">ARK Templates</CardTitle>
                  <Link href="/dashboard/admin/templates/create">
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Template Management</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Create reusable ARK templates for your students.
                  </p>
                  <Link href="/dashboard/admin/templates/create">
                    <Button className="mt-4 bg-cyan-500 hover:bg-cyan-600">
                      Create Your First Template
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            {billing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BillingCard
                  billing={billing.billing}
                  actualStudentCount={billing.actual_student_count}
                  pricing={billing.pricing}
                  onUpgrade={() => setShowPlanChange(true)}
                  onDowngrade={() => setShowPlanChange(true)}
                />
                
                {/* Payment History */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {billing.payment_history.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No payment history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {billing.payment_history.map((payment: any) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div>
                              <p className="text-white font-medium">₹{payment.amount.toLocaleString()}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={
                              payment.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border-red-500/30'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Plan Comparison */}
            {showPlanChange && billing && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-4">Change Plan</h3>
                <PlanComparison
                  currentPlan={billing.billing.plan_type}
                  onSelectPlan={handlePlanChange}
                />
              </div>
            )}

            {!showPlanChange && billing && (
              <div className="text-center">
                <Button
                  onClick={() => setShowPlanChange(true)}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Compare Plans & Upgrade
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

