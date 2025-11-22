'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { neetQuestions, type NEETQuestion, type Language } from '@/lib/data/neet-questions';
import { type NEETAnswer } from '@/lib/utils/neet-scoring';
import { toast } from 'sonner';

type PageState = 'name' | 'quiz' | 'results';

export default function NEETQuizPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('name');
  const [studentName, setStudentName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<NEETAnswer[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [timeStarted, setTimeStarted] = useState<number | null>(null);

  const currentQ = neetQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / neetQuestions.length) * 100;
  const timeElapsed = timeStarted ? Math.floor((Date.now() - timeStarted) / 1000 / 60) : 0;

  // Get current section
  const currentSection = currentQ?.section || '';

  useEffect(() => {
    if (pageState === 'quiz' && !timeStarted) {
      setTimeStarted(Date.now());
    }
  }, [pageState, timeStarted]);

  const handleNameSubmit = (name: string) => {
    setStudentName(name);
    setPageState('quiz');
  };

  const handleAnswerSelect = (optionText: string) => {
    const newAnswer: NEETAnswer = {
      question_id: currentQ.id,
      answer: optionText,
      timestamp: Date.now()
    };

    // Update or add answer
    const existingIndex = answers.findIndex(a => a.question_id === currentQ.id);
    const updatedAnswers = existingIndex >= 0
      ? [...answers.slice(0, existingIndex), newAnswer, ...answers.slice(existingIndex + 1)]
      : [...answers, newAnswer];

    setAnswers(updatedAnswers);

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQuestion < neetQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleQuizComplete(updatedAnswers);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    const currentAnswer = answers.find(a => a.question_id === currentQ.id);
    if (!currentAnswer) {
      toast.error('Please select an answer before continuing');
      return;
    }

    if (currentQuestion < neetQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete(answers);
    }
  };

  const handleQuizComplete = (finalAnswers: NEETAnswer[]) => {
    // Check if all questions are answered
    if (finalAnswers.length < neetQuestions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    // Save answers to sessionStorage for results page
    sessionStorage.setItem('neet-answers', JSON.stringify(finalAnswers));
    sessionStorage.setItem('neet-student-name', studentName);

    // Navigate to results page
    router.push('/path-finder/neet/results');
  };

  const currentAnswer = answers.find(a => a.question_id === currentQ?.id);
  const selectedOption = currentAnswer?.answer;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-teal-400" />
            <h1 className="text-xl font-bold">NEET Diagnostic Test</h1>
          </div>
          <div className="flex items-center gap-4">
              {timeStarted && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{Math.max(0, 18 - timeElapsed)} min left</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Name Input Screen */}
          {pageState === 'name' && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mt-12"
            >
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Hi! What's your name?</CardTitle>
                  <CardDescription>We'll personalize your results (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Enter your name</Label>
                    <Input
                      id="name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Your name"
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleNameSubmit(studentName.trim() || '');
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleNameSubmit('')}
                      className="flex-1"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={() => handleNameSubmit(studentName.trim() || '')}
                      className="flex-1 bg-primary text-primary-foreground"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quiz Screen */}
          {pageState === 'quiz' && currentQ && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-teal-500/30 text-teal-400">
                      {currentSection}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestion + 1} of {neetQuestions.length}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question Card */}
              <Card className="border-border bg-card mb-6">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">
                    {currentQ.question[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQ.options.map((option, index) => {
                    const optionText = option.text[language];
                    const isSelected = selectedOption === optionText;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(optionText)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/10 text-foreground'
                            : 'border-border bg-muted/50 hover:border-teal-500/50 hover:bg-muted'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? 'border-teal-500 bg-teal-500'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm sm:text-base">{optionText}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {answers.length} of {neetQuestions.length} answered
                </div>

                {currentQuestion === neetQuestions.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                  >
                    See Results
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className="bg-primary text-primary-foreground flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


