"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Clock, 
  CheckCircle2,
  X,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  BookOpen,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_image_url?: string;
  options: { A: string; B: string; C: string; D: string };
  subject?: string;
  topic?: string;
  difficulty?: string;
  marks: number;
}

interface Test {
  id: string;
  title: string;
  exam_type: string;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
}

export default function MockTestInterfacePage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, {
    selected: string | null;
    isMarked: boolean;
    timeSpent: number;
  }>>({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isStarted, setIsStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
    }
  }, [testId]);

  useEffect(() => {
    if (isStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, timeRemaining]);

  const fetchTestDetails = async () => {
    try {
      const response = await fetch(`/api/mock-tests/${testId}`);
      const result = await response.json();

      if (result.success) {
        setTest(result.test || result);
        setQuestions(result.questions || []);
        
        // Check for existing attempt
        if (result.previous_attempts && result.previous_attempts.length > 0) {
          const inProgress = result.previous_attempts.find((a: any) => a.status === "in_progress");
          if (inProgress) {
            setAttemptId(inProgress.id);
            setIsStarted(true);
            // Calculate remaining time
            const elapsed = Math.floor((Date.now() - new Date(inProgress.started_at).getTime()) / 1000);
            const totalSeconds = (result.test?.duration_minutes || 180) * 60;
            setTimeRemaining(Math.max(0, totalSeconds - elapsed));
            // Load existing answers
            loadExistingAnswers(inProgress.id);
          }
        }
      } else {
        toast.error("Failed to load test");
        router.push("/dashboard/student/mock-tests");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAnswers = async (attemptId: string) => {
    try {
      const response = await fetch(`/api/mock-tests/${testId}/attempts/${attemptId}/answers`);
      const result = await response.json();

      if (result.success && result.data?.answers) {
        // Merge loaded answers with question structure
        const loadedAnswers: Record<string, any> = {};
        questions.forEach((q) => {
          const saved = result.data.answers[q.id];
          loadedAnswers[q.id] = {
            selected: saved?.selected || null,
            isMarked: saved?.isMarked || false,
            timeSpent: saved?.timeSpent || 0,
          };
        });
        setAnswers(loadedAnswers);
      } else {
        // Initialize empty answers if none found
        const initialAnswers: Record<string, any> = {};
        questions.forEach((q) => {
          initialAnswers[q.id] = {
            selected: null,
            isMarked: false,
            timeSpent: 0,
          };
        });
        setAnswers(initialAnswers);
      }
    } catch (error) {
      console.error("Error loading existing answers:", error);
      // Initialize empty answers on error
      const initialAnswers: Record<string, any> = {};
      questions.forEach((q) => {
        initialAnswers[q.id] = {
          selected: null,
          isMarked: false,
          timeSpent: 0,
        };
      });
      setAnswers(initialAnswers);
    }
  };

  // Debounced save function
  const saveAnswerDebounced = (() => {
    let timeout: NodeJS.Timeout | null = null;
    return (questionId: string, questionNumber: number, answerData: any) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (!attemptId) return;
        try {
          await fetch(`/api/mock-tests/${testId}/attempts/${attemptId}/answers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_id: questionId,
              question_number: questionNumber,
              selected_answer: answerData.selected || null,
              is_skipped: !answerData.selected,
              is_marked_for_review: answerData.isMarked || false,
              time_spent_seconds: answerData.timeSpent || 0,
            }),
          });
        } catch (error) {
          console.error("Error saving answer:", error);
        }
      }, 1000); // Save after 1 second of inactivity
    };
  })();

  const handleStartTest = async () => {
    try {
      const response = await fetch(`/api/mock-tests/${testId}/start`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setAttemptId(result.attempt_id);
        setIsStarted(true);
        setTimeRemaining((result.test?.duration_minutes || 180) * 60);
        
        // Load existing answers or initialize empty
        await loadExistingAnswers(result.attempt_id);
        toast.success("Test started!");
      } else {
        toast.error("Failed to start test");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => {
      const newAnswer = {
        ...prev[questionId],
        selected: prev[questionId]?.selected === answer ? null : answer,
      };
      
      // Save answer after update
      if (attemptId) {
        saveAnswerDebounced(questionId, question.question_number, newAnswer);
      }
      
      return {
        ...prev,
        [questionId]: newAnswer,
      };
    });
  };

  const handleMarkForReview = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => {
      const newAnswer = {
        ...prev[questionId],
        isMarked: !prev[questionId]?.isMarked,
      };
      
      // Save answer after update
      if (attemptId) {
        saveAnswerDebounced(questionId, question.question_number, newAnswer);
      }
      
      return {
        ...prev,
        [questionId]: newAnswer,
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answerArray = questions.map((q) => ({
        question_id: q.id,
        question_number: q.question_number,
        selected_answer: answers[q.id]?.selected || null,
        is_skipped: !answers[q.id]?.selected,
        is_marked_for_review: answers[q.id]?.isMarked || false,
        time_spent_seconds: answers[q.id]?.timeSpent || 0,
      }));

      const totalTimeSpent = (test?.duration_minutes || 180) * 60 - timeRemaining;

      const response = await fetch(`/api/mock-tests/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: answerArray,
          time_spent_seconds: totalTimeSpent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Test submitted successfully!");
        router.push(`/dashboard/student/mock-tests/${testId}/strategy`);
      } else {
        toast.error("Failed to submit test");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleAutoSubmit = () => {
    toast.info("Time's up! Submitting test...");
    handleSubmit();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((a) => a?.selected).length;
  };

  const getMarkedCount = () => {
    return Object.values(answers).filter((a) => a?.isMarked).length;
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading test...</p>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground mb-1">Test not found</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard/student/mock-tests">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tests
          </Link>
        </Button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{test.title}</h1>
                <Badge className="mt-2">{test.exam_type.replace("_", " ")}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Questions</p>
                  <p className="text-2xl font-bold text-foreground">{test.total_questions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="text-2xl font-bold text-foreground">{test.duration_minutes} min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                  <p className="text-2xl font-bold text-foreground">{test.total_marks}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-foreground mb-2">Instructions:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>You have {test.duration_minutes} minutes to complete the test</li>
                  <li>Each correct answer carries {test.total_marks / test.total_questions} marks</li>
                  <li>Negative marking applies for incorrect answers</li>
                  <li>You can mark questions for review and come back to them</li>
                  <li>Timer will start as soon as you click "Start Test"</li>
                </ul>
              </div>
              <Button
                onClick={handleStartTest}
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar - Timer & Progress */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/student/mock-tests">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-foreground truncate">{test.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <Clock className={`w-4 h-4 ${timeRemaining < 300 ? "text-red-400" : "text-cyan-400"}`} />
                <span className={`font-mono font-semibold ${timeRemaining < 300 ? "text-red-400" : "text-foreground"}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                onClick={() => setShowSubmitDialog(true)}
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
          <Progress
            value={((currentQuestion + 1) / questions.length) * 100}
            className="h-1 mt-2"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-card border-border sticky top-20">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Answered</span>
                    <span className="font-semibold text-foreground">{getAnsweredCount()}/{questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Marked</span>
                    <span className="font-semibold text-foreground">{getMarkedCount()}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                    {questions.map((q, idx) => {
                      const answer = answers[q.id];
                      const isAnswered = answer?.selected;
                      const isMarked = answer?.isMarked;
                      const isCurrent = idx === currentQuestion;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestion(idx)}
                          className={`
                            w-10 h-10 rounded-lg text-sm font-medium transition-all
                            ${isCurrent
                              ? "bg-cyan-500 text-white ring-2 ring-cyan-500/50"
                              : isAnswered
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : isMarked
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }
                          `}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
                      <span>Marked</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Question {currentQ.question_number}</Badge>
                    {currentQ.difficulty && (
                      <Badge variant="outline" className={
                        currentQ.difficulty === "easy" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                        currentQ.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                        "bg-red-500/10 text-red-400 border-red-500/30"
                      }>
                        {currentQ.difficulty}
                      </Badge>
                    )}
                    {currentQ.subject && (
                      <Badge variant="outline">{currentQ.subject}</Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkForReview(currentQ.id)}
                    className={currentAnswer?.isMarked ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : ""}
                  >
                    <Flag className={`w-4 h-4 ${currentAnswer?.isMarked ? "fill-yellow-400" : ""}`} />
                  </Button>
                </div>

                {/* Question Text */}
                <div className="space-y-4">
                  <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                    {currentQ.question_text}
                  </p>
                  {currentQ.question_image_url && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <img
                        src={currentQ.question_image_url}
                        alt="Question"
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {Object.entries(currentQ.options).map(([option, text]) => (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(currentQ.id, option)}
                      className={`
                        w-full p-4 rounded-lg border-2 text-left transition-all
                        ${currentAnswer?.selected === option
                          ? "border-cyan-500 bg-cyan-500/10 text-foreground"
                          : "border-border bg-muted/30 hover:border-cyan-500/50 hover:bg-muted/50 text-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-semibold
                          ${currentAnswer?.selected === option
                            ? "bg-cyan-500 text-white"
                            : "bg-muted text-muted-foreground"
                          }
                        `}>
                          {option}
                        </div>
                        <span className="flex-1">{text}</span>
                        {currentAnswer?.selected === option && (
                          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              You have answered {getAnsweredCount()} out of {questions.length} questions.
              {getMarkedCount() > 0 && ` ${getMarkedCount()} questions are marked for review.`}
              <br />
              <br />
              Are you sure you want to submit? You won't be able to change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            >
              {submitting ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

