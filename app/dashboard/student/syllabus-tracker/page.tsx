"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface SyllabusData {
  exam_type: string;
  overall_progress: number;
  total_topics: number;
  completed_topics: number;
  subject_progress: Record<string, number>;
  syllabus: Record<string, Record<string, any[]>>;
}

export default function SyllabusTrackerPage() {
  const [data, setData] = useState<SyllabusData | null>(null);
  const [examType, setExamType] = useState<string>("JEE_MAIN");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyllabus();
  }, [examType]);

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/student/syllabus-tracker?exam_type=${examType}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        if (!selectedSubject && result.data.syllabus) {
          setSelectedSubject(Object.keys(result.data.syllabus)[0] || null);
        }
      } else {
        toast.error("Failed to load syllabus tracker");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getMasteryIcon = (mastery: string) => {
    switch (mastery) {
      case "mastered":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "practicing":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case "learning":
        return <Circle className="w-4 h-4 text-blue-400" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMasteryBadge = (mastery: string) => {
    switch (mastery) {
      case "mastered":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "practicing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "learning":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading syllabus tracker...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-foreground mb-1">No syllabus data found</p>
        <p className="text-xs text-muted-foreground">
          Start practicing to track your syllabus progress
        </p>
      </div>
    );
  }

  const subjects = Object.keys(data.syllabus || {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Syllabus Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress across all topics and chapters
          </p>
        </div>
        <Select value={examType} onValueChange={setExamType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Exam Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
            <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
            <SelectItem value="NEET">NEET</SelectItem>
            <SelectItem value="AIIMS">AIIMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
              <p className="text-3xl font-bold text-foreground">{data.overall_progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Topics Completed</p>
              <p className="text-2xl font-bold text-foreground">
                {data.completed_topics}/{data.total_topics}
              </p>
            </div>
          </div>
          <Progress value={data.overall_progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Subject Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(data.subject_progress).map(([subject, progress]) => (
          <Card
            key={subject}
            className="bg-card border-border cursor-pointer hover:border-cyan-500/30 transition-all"
            onClick={() => setSelectedSubject(subject)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">{subject}</span>
                <Badge variant="outline">{Math.round(progress)}%</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subject-wise Syllabus */}
      {subjects.length > 0 && (
        <Tabs value={selectedSubject || subjects[0]} onValueChange={setSelectedSubject}>
          <TabsList className="grid w-full grid-cols-3">
            {subjects.map((subject) => (
              <TabsTrigger key={subject} value={subject}>
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map((subject) => {
            const chapters = data.syllabus[subject] || {};
            const subjectProgress = data.subject_progress[subject] || 0;

            return (
              <TabsContent key={subject} value={subject} className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                        {subject}
                      </CardTitle>
                      <Badge variant="outline" className="text-lg font-semibold">
                        {Math.round(subjectProgress)}% Complete
                      </Badge>
                    </div>
                    <Progress value={subjectProgress} className="h-2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(chapters).map(([chapter, topics]) => {
                      const chapterTopics = topics.length;
                      const completedTopics = topics.filter((t) => t.mastery_level === "mastered").length;
                      const chapterProgress = chapterTopics > 0
                        ? (completedTopics / chapterTopics) * 100
                        : 0;

                      return (
                        <div key={chapter} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">{chapter}</h3>
                            <Badge variant="outline" className="text-xs">
                              {completedTopics}/{chapterTopics} topics
                            </Badge>
                          </div>
                          <Progress value={chapterProgress} className="h-1.5" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="p-3 rounded-lg border border-border bg-muted/30 hover:border-cyan-500/30 transition-all"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getMasteryIcon(topic.mastery_level)}
                                    <span className="text-sm font-medium text-foreground">
                                      {topic.topic || "General"}
                                    </span>
                                  </div>
                                  <Badge className={getMasteryBadge(topic.mastery_level)}>
                                    {topic.mastery_level.replace("_", " ")}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{Math.round(topic.completion_percentage)}% complete</span>
                                  {topic.questions_attempted > 0 && (
                                    <span>{topic.questions_correct}/{topic.questions_attempted} correct</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Empty State */}
      {subjects.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No syllabus data yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Start practicing questions to track your syllabus progress
            </p>
            <Button asChild>
              <Link href="/dashboard/student/practice">
                <Play className="w-4 h-4 mr-2" />
                Start Practicing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

