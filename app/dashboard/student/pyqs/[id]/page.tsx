"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Calendar,
  BookOpen,
  Lightbulb,
  Play,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface PYQ {
  id: string;
  exam_type: string;
  year: number;
  paper_set?: string;
  subject: string | null;
  question_number: number;
  question_text: string;
  question_image_url?: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer: string;
  explanation: string;
  topic?: string;
  chapter?: string;
  difficulty?: string;
  marks: number;
  negative_marks: number;
  similar_questions?: any[];
}

export default function PYQDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pyqId = params.id as string;

  const [pyq, setPyq] = useState<PYQ | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPYQ();
  }, [pyqId]);

  const fetchPYQ = async () => {
    try {
      const response = await fetch(`/api/pyqs/${pyqId}`);
      const result = await response.json();

      if (result.success) {
        setPyq(result.data);
      } else {
        toast.error("Failed to load PYQ");
        router.push("/dashboard/student/pyqs");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading question...</p>
      </div>
    );
  }

  if (!pyq) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-foreground mb-1">Question not found</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/dashboard/student/pyqs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to PYQs
          </Link>
        </Button>
      </div>
    );
  }

  const isCorrect = selectedAnswer === pyq.correct_answer;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/student/pyqs">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge>{pyq.exam_type.replace("_", " ")}</Badge>
          <Badge variant="outline">
            <Calendar className="w-3 h-3 mr-1" />
            {pyq.year}
          </Badge>
          {pyq.paper_set && <Badge variant="outline">{pyq.paper_set}</Badge>}
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Question {pyq.question_number}
            </CardTitle>
            <div className="flex items-center gap-2">
              {pyq.subject && <Badge variant="outline">{pyq.subject}</Badge>}
              {pyq.difficulty && (
                <Badge variant="outline" className={
                  pyq.difficulty === "easy" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                  pyq.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                  "bg-red-500/10 text-red-400 border-red-500/30"
                }>
                  {pyq.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
              {pyq.question_text}
            </p>
            {pyq.question_image_url && (
              <div className="rounded-lg border border-border overflow-hidden">
                <img
                  src={pyq.question_image_url}
                  alt="Question"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {Object.entries(pyq.options).map(([option, text]) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === pyq.correct_answer;
              const showResult = showAnswer && (isSelected || isCorrectOption);

              return (
                <button
                  key={option}
                  onClick={() => !showAnswer && handleAnswerSelect(option)}
                  disabled={showAnswer}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${showResult
                      ? isCorrectOption
                        ? "border-green-500 bg-green-500/10"
                        : isSelected
                        ? "border-red-500 bg-red-500/10"
                        : "border-border bg-muted/30"
                      : isSelected
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-border bg-muted/30 hover:border-cyan-500/50 hover:bg-muted/50"
                    }
                    ${showAnswer ? "cursor-default" : "cursor-pointer"}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-semibold
                      ${showResult
                        ? isCorrectOption
                          ? "bg-green-500 text-white"
                          : isSelected
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                        : isSelected
                        ? "bg-cyan-500 text-white"
                        : "bg-muted text-muted-foreground"
                      }
                    `}>
                      {option}
                    </div>
                    <span className="flex-1">{text}</span>
                    {showResult && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showAnswer && pyq.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {pyq.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Marks Info */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Marks:</span>
              <span className="font-medium text-foreground ml-2">+{pyq.marks}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Negative:</span>
              <span className="font-medium text-red-400 ml-2">-{pyq.negative_marks}</span>
            </div>
            {showAnswer && (
              <div>
                <span className="text-muted-foreground">Your Answer:</span>
                <span className={`font-medium ml-2 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {selectedAnswer || "Not answered"}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                setSelectedAnswer(null);
                setShowAnswer(false);
              }}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              asChild
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
            >
              <Link href={`/dashboard/student/practice?pyq=${pyq.id}`}>
                <Play className="w-4 h-4 mr-2" />
                Practice Similar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Similar Questions */}
      {pyq.similar_questions && pyq.similar_questions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Similar Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pyq.similar_questions.map((sq) => (
                <Link
                  key={sq.id}
                  href={`/dashboard/student/pyqs/${sq.id}`}
                  className="block p-3 rounded-lg border border-border hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {sq.exam_type} {sq.year} - Q{sq.question_number}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {sq.question_text}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

