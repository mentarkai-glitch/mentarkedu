"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  FileText, 
  Search, 
  Filter,
  MessageCircle,
  User,
  BookOpen,
  AlertCircle
} from "lucide-react";

// Import our components
import { StudentCard } from "@/components/teacher/StudentCard";
import { InterventionForm } from "@/components/teacher/InterventionForm";
import { BatchAnalytics } from "@/components/teacher/BatchAnalytics";
import { RiskPredictorCard } from "@/components/ml/RiskPredictorCard";
import { SentimentTimeline } from "@/components/ml/SentimentTimeline";

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  grade: string;
  batch: string;
  risk_score: number;
  risk_level: 'high' | 'medium' | 'low';
  active_arks: number;
  completed_arks: number;
  subject?: string;
}

interface Intervention {
  id: string;
  student_id: string;
  type: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  created_at: string;
  students: {
    users: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchInterventions();
  }, [selectedBatch, riskFilter, searchTerm]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBatch !== "all") params.append('batch', selectedBatch);
      if (riskFilter !== "all") params.append('risk_level', riskFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/teacher/students?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterventions = async () => {
    try {
      const response = await fetch('/api/teacher/interventions');
      const data = await response.json();
      
      if (data.success) {
        setInterventions(data.data.interventions || []);
      }
    } catch (error) {
      console.error('Failed to fetch interventions:', error);
    }
  };

  const uniqueBatches = Array.from(new Set(students.map(s => s.batch)));

  const handleAddTeacher = async (formData: any) => {
    // Placeholder - not used in teacher dashboard
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-yellow-500/20 glass backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src="/logo.png" alt="Mentark" className="h-8 w-8 rounded-lg" />
            </Link>
            <span className="font-display text-xl font-bold text-white">
              Teacher Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
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
          <Card className="glass border-yellow-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
            
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl text-white mb-2">
                Welcome, Teacher! 👋
              </CardTitle>
              <p className="text-lg text-slate-300">
                Monitor your students&apos; progress and provide personalized support.
              </p>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass border border-yellow-500/20">
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Batch Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="risk-alerts" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>Risk Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="interventions" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Interventions</span>
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            {/* Filters */}
            <Card className="glass border-yellow-500/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by batch" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Batches</SelectItem>
                      {uniqueBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center text-white">
                    <Filter className="h-4 w-4 mr-2 text-cyan-400" />
                    <span>{students.length} students</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Grid */}
            {loading ? (
              <div className="text-center text-white py-12">Loading students...</div>
            ) : students.length === 0 ? (
              <Card className="glass border-yellow-500/20">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No students found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try adjusting your filters or contact your admin to assign students.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/dashboard/teacher/student/${student.id}`}>
                      <StudentCard
                        student={student}
                        onViewDetails={() => {}}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {selectedBatch === "all" ? (
              <Card className="glass border-yellow-500/20">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select a Batch</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Choose a specific batch from the Students tab to view analytics.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <BatchAnalytics batch={selectedBatch} />
            )}
          </TabsContent>

          {/* Risk Alerts Tab */}
          <TabsContent value="risk-alerts" className="space-y-6">
            <Card className="glass border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">At-Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {students
                    .filter(s => s.risk_level === 'high' || s.risk_score >= 60)
                    .map(student => (
                      <div key={student.id}>
                        <RiskPredictorCard studentId={student.id} />
                      </div>
                    ))}
                  {students.filter(s => s.risk_level === 'high' || s.risk_score >= 60).length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No high-risk students detected</p>
                      <p className="text-gray-500 text-sm mt-2">
                        All students are performing well!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="space-y-6">
            {selectedStudent && (
              <InterventionForm
                studentId={selectedStudent.id}
                studentName={selectedStudent.full_name}
                onSuccess={() => {
                  fetchInterventions();
                  setSelectedStudent(null);
                }}
              />
            )}

            <Card className="glass border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Interventions</CardTitle>
              </CardHeader>
              <CardContent>
                {interventions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No interventions yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Create your first intervention from the Students tab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interventions.map((intervention) => (
                      <Card key={intervention.id} className="bg-slate-700/30 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="text-white font-semibold mb-1">{intervention.title}</h4>
                              <p className="text-gray-300 text-sm mb-2">{intervention.content}</p>
                              <p className="text-gray-400 text-xs">
                                Student: {intervention.students.users.full_name}
                              </p>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Badge className={getPriorityColor(intervention.priority)}>
                                {intervention.priority}
                              </Badge>
                              <Badge className={getStatusColor(intervention.status)}>
                                {intervention.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Created: {new Date(intervention.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

