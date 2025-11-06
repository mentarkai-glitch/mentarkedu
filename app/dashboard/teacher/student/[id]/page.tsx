"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  User,
  Target,
  TrendingUp,
  Heart,
  BookOpen,
  Clock,
  Award,
  BarChart3,
  MessageCircle,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  grade: string;
  batch: string;
  risk_score: number;
  risk_level: string;
  interests: string[];
  goals: string[];
}

interface ARK {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
  created_at: string;
}

interface CheckIn {
  date: string;
  energy: number;
  focus: number;
  emotion: string;
  notes: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [arks, setArks] = useState<ARK[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const supabase = await createClient();

      // Fetch student data
      const { data: studentData } = await supabase
        .from("students")
        .select(`
          user_id,
          grade,
          batch,
          interests,
          goals,
          risk_score,
          users (
            id,
            email,
            profile_data
          )
        `)
        .eq("user_id", studentId)
        .single();

      if (studentData) {
        setStudent({
          id: studentData.user_id,
          full_name: `${(studentData.users as any)?.profile_data?.first_name || ""} ${
            (studentData.users as any)?.profile_data?.last_name || ""
          }`.trim() || "Unknown",
          email: (studentData.users as any)?.email || "",
          avatar_url: (studentData.users as any)?.profile_data?.avatar_url,
          grade: studentData.grade,
          batch: studentData.batch,
          risk_score: studentData.risk_score,
          risk_level: studentData.risk_score >= 70 ? "high" : studentData.risk_score >= 40 ? "medium" : "low",
          interests: studentData.interests || [],
          goals: studentData.goals || [],
        });
      }

      // Fetch ARKs
      const { data: arksData } = await supabase
        .from("arks")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(10);

      setArks((arksData as ARK[]) || []);

      // Fetch recent check-ins
      const { data: checkInsData } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("student_id", studentId)
        .order("date", { ascending: false })
        .limit(30);

      setCheckIns((checkInsData as CheckIn[]) || []);
    } catch (error) {
      console.error("Failed to fetch student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const emotionChartData = checkIns.slice(0, 14).reverse().map((ci) => ({
    date: new Date(ci.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    energy: ci.energy,
    focus: ci.focus,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading student details...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Student not found</p>
          <Link href="/dashboard/teacher">
            <Button>Back to Teacher Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-yellow-500/20 glass backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/teacher">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Button>
            </Link>
            <span className="font-display text-xl font-bold text-white">Student Details</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Student Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="glass border-yellow-500/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  {student.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.full_name}
                      className="w-24 h-24 rounded-full border-4 border-yellow-500/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{student.full_name}</h1>
                    <p className="text-gray-300 mb-2">{student.email}</p>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                        Grade {student.grade}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                        Batch {student.batch}
                      </Badge>
                      <Badge className={getRiskColor(student.risk_level)}>
                        {student.risk_level} risk
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Student
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass border border-yellow-500/20">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="arks">
              <Target className="h-4 w-4 mr-2" />
              ARKs ({arks.length})
            </TabsTrigger>
            <TabsTrigger value="emotion">
              <Heart className="h-4 w-4 mr-2" />
              Emotion Timeline
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Award className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-400" />
                    ARK Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Active ARKs</span>
                        <span className="text-white font-semibold">{arks.filter(a => a.status === "active").length}</span>
                      </div>
                      <Progress value={arks.filter(a => a.status === "active").length * 10} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Completed</span>
                        <span className="text-white font-semibold">{arks.filter(a => a.status === "completed").length}</span>
                      </div>
                      <Progress value={arks.filter(a => a.status === "completed").length * 10} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Completion</span>
                      <span className="text-white font-semibold">
                        {arks.length > 0
                          ? Math.round(arks.reduce((acc, a) => acc + a.progress, 0) / arks.length)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Check-ins (30d)</span>
                      <span className="text-white font-semibold">{checkIns.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Consistency</span>
                      <span className="text-white font-semibold">
                        {checkIns.length >= 20 ? "High" : checkIns.length >= 10 ? "Medium" : "Low"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-400" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Score</span>
                      <Badge className={getRiskColor(student.risk_level)}>
                        {student.risk_score}/100
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white font-semibold capitalize">{student.risk_level}</span>
                    </div>
                    {student.risk_score >= 70 && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center text-red-400">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-semibold">Needs Attention</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interests & Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.interests.length > 0 ? (
                      student.interests.map((interest, idx) => (
                        <Badge key={idx} variant="outline" className="border-cyan-500/30 text-cyan-400">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">No interests listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.goals.length > 0 ? (
                      student.goals.map((goal, idx) => (
                        <Badge key={idx} variant="outline" className="border-green-500/30 text-green-400">
                          {goal}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">No goals listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ARKs Tab */}
          <TabsContent value="arks" className="space-y-4">
            {arks.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No ARKs yet</p>
                </CardContent>
              </Card>
            ) : (
              arks.map((ark) => (
                <Card key={ark.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{ark.title}</h3>
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 capitalize">
                            {ark.category}
                          </Badge>
                          <Badge className={
                            ark.status === "completed"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : ark.status === "active"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }>
                            {ark.status}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white font-semibold">{ark.progress}%</span>
                          </div>
                          <Progress value={ark.progress} className="h-2" />
                        </div>
                        <p className="text-sm text-gray-400 mt-3">
                          Created: {new Date(ark.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/ark/view/${ark.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Emotion Timeline Tab */}
          <TabsContent value="emotion">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">14-Day Emotion Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {emotionChartData.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No check-in data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={emotionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[1, 5]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="energy" stroke="#FBBF24" strokeWidth={2} name="Energy" />
                      <Line type="monotone" dataKey="focus" stroke="#10B981" strokeWidth={2} name="Focus" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI-Generated Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">This Week&apos;s Highlights</h4>
                        <p className="text-gray-300 text-sm">
                          Student showing consistent engagement with {arks.filter(a => a.status === "active").length} active ARKs. 
                          {checkIns.length >= 20 && " Excellent check-in consistency!"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {student.risk_score >= 70 && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">Areas of Concern</h4>
                          <p className="text-gray-300 text-sm">
                            Risk score indicates student may need additional support. Consider scheduling a one-on-one session.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-white font-semibold mb-2">Recommended Actions</h4>
                        <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                          {arks.filter(a => a.status === "active").length > 0 && (
                            <li>Review progress on active ARKs with student</li>
                          )}
                          {checkIns.length < 10 && <li>Encourage daily check-ins for better tracking</li>}
                          {student.risk_score >= 70 && <li>Schedule intervention meeting</li>}
                          {student.interests.length === 0 && <li>Update student interests profile</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

