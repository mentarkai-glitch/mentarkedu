"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Target, 
  TrendingUp,
  BookOpen,
  ArrowLeft,
  Filter,
  Download
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Concept {
  id: string;
  name: string;
  subject: string;
  chapter: string;
  mastery: number; // 0-100
  attempts: number;
  lastPracticed: string;
  examWeightage: number; // percentage
  status: "mastered" | "learning" | "needs_focus";
}

interface SubjectData {
  subject: string;
  overallMastery: number;
  concepts: Concept[];
}

export default function ConceptHeatmapPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("Physics");
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [filter, setFilter] = useState<"all" | "mastered" | "learning" | "needs_focus">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/student/concept-heatmap");
        const data = await response.json();

        if (data.success && data.data?.subjects) {
          setSubjects(data.data.subjects);
        } else {
          // Fallback to mock data if API fails
          console.error("Failed to fetch heatmap data:", data.error);
          setSubjects([
            {
              subject: "Physics",
              overallMastery: 78,
              concepts: [
                {
                  id: "1",
                  name: "Reflection & Refraction",
                  subject: "Physics",
                  chapter: "Optics",
                  mastery: 95,
                  attempts: 12,
                  lastPracticed: "2024-01-15",
                  examWeightage: 8,
                  status: "mastered",
                },
                {
                  id: "2",
                  name: "Lens Maker Formula",
                  subject: "Physics",
                  chapter: "Optics",
                  mastery: 0,
                  attempts: 3,
                  lastPracticed: "2024-01-10",
                  examWeightage: 8,
                  status: "needs_focus",
                },
              ],
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching heatmap:", error);
        toast.error("Failed to load concept heatmap");
        // Set empty array on error
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, []);

  const currentSubject = subjects.find((s) => s.subject === selectedSubject);
  const filteredConcepts = currentSubject?.concepts.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-500";
      case "learning":
        return "bg-yellow-500";
      case "needs_focus":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "mastered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "learning":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "needs_focus":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "mastered":
        return "Mastered";
      case "learning":
        return "Learning";
      case "needs_focus":
        return "Needs Focus";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Concept Mastery Heatmap</h1>
            <p className="text-sm text-muted-foreground">
              Track your mastery across all concepts
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Subject Tabs */}
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
        <TabsList className="grid w-full grid-cols-3">
          {subjects.map((subject) => (
            <TabsTrigger key={subject.subject} value={subject.subject}>
              <div className="flex items-center gap-2">
                <span>{subject.subject}</span>
                <Badge variant="outline" className="text-xs">
                  {subject.overallMastery}%
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject) => (
          <TabsContent key={subject.subject} value={subject.subject} className="space-y-6">
            {/* Subject Overview */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    {subject.subject} Overview
                  </CardTitle>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {subject.overallMastery}% Mastery
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={subject.overallMastery} className="h-3" />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {subject.concepts.filter((c) => c.status === "mastered").length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Mastered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {subject.concepts.filter((c) => c.status === "learning").length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Learning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {subject.concepts.filter((c) => c.status === "needs_focus").length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Needs Focus</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2">
                {(["all", "mastered", "learning", "needs_focus"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "All" : f === "mastered" ? "Mastered" : f === "learning" ? "Learning" : "Needs Focus"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Concepts by Chapter */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading concepts...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(new Set(filteredConcepts.map((c) => c.chapter))).map((chapter) => {
                  const chapterConcepts = filteredConcepts.filter((c) => c.chapter === chapter);
                  return (
                    <Card key={chapter} className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-cyan-400" />
                          {chapter}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {chapterConcepts.map((concept) => (
                          <motion.div
                            key={concept.id}
                            whileHover={{ scale: 1.01 }}
                            className="p-4 bg-muted/30 rounded-lg border border-border hover:border-cyan-500/30 transition-all cursor-pointer"
                            onClick={() => {
                              window.location.href = `/dashboard/student/practice?concept=${concept.id}`;
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground">{concept.name}</h3>
                                  <Badge className={getStatusBadge(concept.status)}>
                                    {getStatusLabel(concept.status)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {concept.examWeightage}% weightage
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{concept.attempts} attempts</span>
                                  <span>Last: {concept.lastPracticed}</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Mastery</span>
                                <span className="font-semibold text-foreground">{concept.mastery}%</span>
                              </div>
                              <Progress value={concept.mastery} className="h-2" />
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  const filled = i < Math.floor(concept.mastery / 20);
                                  return (
                                    <div
                                      key={i}
                                      className={`h-2 flex-1 rounded ${
                                        filled ? getStatusColor(concept.status) : "bg-muted"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-3 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <Target className="w-3 h-3 mr-2" />
                              Practice Now
                            </Button>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

