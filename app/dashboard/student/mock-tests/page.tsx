"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileQuestion, 
  Clock, 
  Target,
  TrendingUp,
  Play,
  History,
  Filter,
  Search,
  Award,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

interface MockTest {
  id: string;
  exam_type: string;
  subject: string | null;
  title: string;
  description: string | null;
  year: number | null;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  is_pyq: boolean;
  attempts_count?: number;
  completed_count?: number;
  best_score?: number | null;
  created_at: string;
}

export default function MockTestsPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [isPyq, setIsPyq] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTests();
  }, [examType, subject, isPyq]);

  useEffect(() => {
    filterTests();
  }, [tests, searchTerm]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (examType !== "all") params.append("exam_type", examType);
      if (subject !== "all") params.append("subject", subject);
      if (isPyq !== "all") params.append("is_pyq", isPyq === "true" ? "true" : "false");

      const response = await fetch(`/api/mock-tests?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setTests(result.data || []);
      } else {
        toast.error("Failed to load tests");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = tests;

    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTests(filtered);
  };

  const getExamBadge = (examType: string) => {
    const colors: Record<string, string> = {
      JEE_MAIN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      JEE_ADVANCED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      NEET: "bg-green-500/20 text-green-400 border-green-500/30",
      AIIMS: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[examType] || "bg-muted text-muted-foreground";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mock Tests</h1>
          <p className="text-sm text-muted-foreground">
            Practice with real exam questions and track your progress
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/student/pyqs">
            <BookOpen className="w-4 h-4 mr-2" />
            Previous Year Papers
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
                <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="AIIMS">AIIMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
              </SelectContent>
            </Select>
            <Select value={isPyq} onValueChange={setIsPyq}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">PYQ Based</SelectItem>
                <SelectItem value="false">Mock Tests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading tests...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No tests found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-cyan-500/30 transition-all cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getExamBadge(test.exam_type)}>
                      {test.exam_type.replace("_", " ")}
                    </Badge>
                    {test.is_pyq && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                        PYQ
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {test.title}
                  </CardTitle>
                  {test.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {test.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileQuestion className="w-4 h-4" />
                      <span>{test.total_questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(test.duration_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{test.total_marks} Marks</span>
                    </div>
                    {test.year && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Year: {test.year}</span>
                      </div>
                    )}
                  </div>

                  {test.attempts_count !== undefined && test.attempts_count > 0 && (
                    <div className="mb-4 p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Attempts:</span>
                        <span className="font-medium text-foreground">{test.attempts_count}</span>
                      </div>
                      {test.best_score !== null && test.best_score !== undefined && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-muted-foreground">Best Score:</span>
                          <span className="font-medium text-foreground">{test.best_score}/{test.total_marks}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    {test.completed_count && test.completed_count > 0 ? (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          className="flex-1"
                        >
                          <Link href={`/dashboard/student/mock-tests/${test.id}/strategy`}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Results
                          </Link>
                        </Button>
                        <Button
                          asChild
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                        >
                          <Link href={`/dashboard/student/mock-tests/${test.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Retake
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                      >
                        <Link href={`/dashboard/student/mock-tests/${test.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Start Test
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

