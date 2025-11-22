"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  TrendingDown,
  TrendingUp,
  Target,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  BookOpen
} from "lucide-react";
import Link from "next/link";

interface QuestionAnalysis {
  questionNumber: number;
  timeSpent: number; // minutes
  correct: boolean;
  skipped: boolean;
  difficulty: "easy" | "medium" | "hard";
  subject: string;
  topic: string;
}

interface StrategyAnalysis {
  testId: string;
  testName: string;
  score: number;
  totalMarks: number;
  rank: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  totalTime: number; // minutes
  questions: QuestionAnalysis[];
  insights: {
    timeManagement: string;
    skippingPattern: string;
    momentum: string;
    recommendations: string[];
  };
}

export default function PaperStrategyPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const [analysis, setAnalysis] = useState<StrategyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    // const fetchAnalysis = async () => {
    //   const response = await fetch(`/api/student/mock-tests/${testId}/strategy`);
    //   const data = await response.json();
    //   setAnalysis(data);
    //   setLoading(false);
    // };
    // fetchAnalysis();

    // Mock data
    setTimeout(() => {
      setAnalysis({
        testId: testId,
        testName: "JEE Main Mock Test #12",
        score: 185,
        totalMarks: 360,
        rank: 15000,
        totalQuestions: 90,
        correctAnswers: 62,
        wrongAnswers: 20,
        skippedQuestions: 8,
        totalTime: 180,
        questions: [
          { questionNumber: 1, timeSpent: 2, correct: true, skipped: false, difficulty: "easy", subject: "Physics", topic: "Mechanics" },
          { questionNumber: 2, timeSpent: 3, correct: true, skipped: false, difficulty: "easy", subject: "Physics", topic: "Optics" },
          { questionNumber: 3, timeSpent: 15, correct: false, skipped: false, difficulty: "hard", subject: "Physics", topic: "Optics" },
          { questionNumber: 4, timeSpent: 8, correct: true, skipped: false, difficulty: "medium", subject: "Chemistry", topic: "Organic" },
          { questionNumber: 5, timeSpent: 4, correct: true, skipped: false, difficulty: "easy", subject: "Math", topic: "Algebra" },
          { questionNumber: 6, timeSpent: 2, correct: true, skipped: false, difficulty: "easy", subject: "Math", topic: "Calculus" },
        ],
        insights: {
          timeManagement: "You spent 15 minutes on Question 3 and got it wrong. This killed your momentum for the next 5 questions.",
          skippingPattern: "You skipped 8 questions (Good!), but you should have skipped Q3 instead of Q12. Q3 was harder and took too long.",
          momentum: "Your confidence dropped after Q3, but recovered after Q10. Focus on maintaining momentum by skipping difficult questions early.",
          recommendations: [
            "If stuck > 5 minutes → Skip & mark for review",
            "Prioritize easy questions first to build confidence",
            "Don't spend more than 3 minutes on any single question initially",
            "Review skipped questions at the end if time permits",
          ],
        },
      });
      setLoading(false);
    }, 500);
  }, [testId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Analyzing your test strategy...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground mb-1">Analysis not found</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard/student/mock-tests">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mock Tests
          </Link>
        </Button>
      </div>
    );
  }

  const avgTimePerQuestion = analysis.totalTime / analysis.totalQuestions;
  const problemQuestions = analysis.questions.filter(
    (q) => q.timeSpent > 5 && !q.correct && !q.skipped
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/student/mock-tests/${testId}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Paper Attempt Strategy</h1>
            <p className="text-sm text-muted-foreground">{analysis.testName}</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retake Test
        </Button>
      </div>

      {/* Score Summary */}
      <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Score</p>
              <p className="text-2xl font-bold text-foreground">
                {analysis.score}/{analysis.totalMarks}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Rank</p>
              <p className="text-2xl font-bold text-foreground">~{analysis.rank.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round((analysis.correctAnswers / (analysis.correctAnswers + analysis.wrongAnswers)) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Time/Q</p>
              <p className="text-2xl font-bold text-foreground">{avgTimePerQuestion.toFixed(1)}m</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Allocation */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Time Allocation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {analysis.questions.slice(0, 10).map((q) => {
              const isProblem = q.timeSpent > 5 && !q.correct && !q.skipped;
              return (
                <div key={q.questionNumber} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-foreground">Q{q.questionNumber}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`h-2 rounded ${
                          q.timeSpent <= 2
                            ? "bg-green-500"
                            : q.timeSpent <= 5
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${(q.timeSpent / 15) * 100}%`, maxWidth: "100%" }}
                      />
                      <span className="text-xs text-muted-foreground">{q.timeSpent}min</span>
                      {isProblem && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                          Problem!
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{q.subject}</span>
                      <span>•</span>
                      <span>{q.topic}</span>
                      {q.correct && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓</Badge>}
                      {!q.correct && !q.skipped && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">✗</Badge>}
                      {q.skipped && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Skipped</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {problemQuestions.length > 0 && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Problem Questions</p>
                  <p className="text-sm text-muted-foreground">
                    {problemQuestions.length} questions took &gt;5 minutes and were answered incorrectly. These killed your momentum.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-400" />
              Time Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.insights.timeManagement}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Skipping Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.insights.skippingPattern}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600">
            <Target className="w-4 h-4 mr-2" />
            Practice Time Management
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

