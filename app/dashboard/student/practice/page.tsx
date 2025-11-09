'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileQuestion,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  AlertTriangle,
  History,
  Wifi,
  WifiOff,
  RefreshCcw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface Mistake {
  topic: string;
  question: string;
  attemptedAnswer: string;
  correctAnswer: string;
}

interface PracticeQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';

const MISTAKE_STORAGE_KEY = 'mentark-practice-mistakes-v1';
const LAST_RESULTS_KEY = 'mentark-practice-results-v1';

const QUICK_MISTAKE_TEMPLATES: Array<Mistake & { difficulty?: DifficultyLevel }> = [
  {
    topic: 'Quadratic Equations',
    question: 'Solve x^2 - 5x + 6 = 0',
    attemptedAnswer: 'x = 3 only',
    correctAnswer: 'x = 2 or x = 3',
    difficulty: 'easy',
  },
  {
    topic: 'Photosynthesis',
    question: 'Name the primary pigment responsible for photosynthesis.',
    attemptedAnswer: 'Chlorophyll-b',
    correctAnswer: 'Chlorophyll-a',
    difficulty: 'medium',
  },
  {
    topic: 'Dynamic Programming',
    question: 'Explain why memoization reduces time complexity for Fibonacci.',
    attemptedAnswer: 'Because we use recursion',
    correctAnswer: 'Memoization caches results to avoid recomputing overlapping subproblems',
    difficulty: 'hard',
  },
];

export default function PracticeQuestionsPage() {
  const [tab, setTab] = useState('mistakes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [isOnline, setIsOnline] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
   
  // Mistakes state
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [currentMistake, setCurrentMistake] = useState<Mistake>({
    topic: '',
    question: '',
    attemptedAnswer: '',
    correctAnswer: '',
  });
  
  // Questions state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [pastResults, setPastResults] = useState<PracticeQuestion[]>([]);
  const [recentSummary, setRecentSummary] = useState<{ correct: number; total: number; accuracy: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedMistakes = localStorage.getItem(MISTAKE_STORAGE_KEY);
      if (storedMistakes) {
        setMistakes(JSON.parse(storedMistakes) as Mistake[]);
      }

      const storedResults = localStorage.getItem(LAST_RESULTS_KEY);
      if (storedResults) {
        const parsed = JSON.parse(storedResults) as {
          questions: PracticeQuestion[];
          generatedAt: string;
          summary?: { correct: number; total: number; accuracy: number };
        };
        setPastResults(parsed.questions);
        setGeneratedAt(parsed.generatedAt);
        if (parsed.summary) {
          setRecentSummary(parsed.summary);
        }
      }
    } catch (err) {
      console.warn('Failed to restore practice state', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MISTAKE_STORAGE_KEY, JSON.stringify(mistakes));
    } catch (err) {
      console.warn('Failed to persist mistakes', err);
    }
  }, [mistakes]);

  const scoreSummary = useMemo(() => {
    if (!showResults || questions.length === 0) return null;
    const correct = questions.reduce((acc, q, idx) => {
      const answer = selectedAnswers[idx];
      return answer === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    const accuracy = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, accuracy };
  }, [questions, selectedAnswers, showResults]);

  useEffect(() => {
    if (typeof window === 'undefined' || questions.length === 0 || !showResults || !scoreSummary) return;
    try {
      localStorage.setItem(
        LAST_RESULTS_KEY,
        JSON.stringify({
          questions,
          generatedAt: generatedAt ?? new Date().toISOString(),
          summary: scoreSummary,
        })
      );
    } catch (err) {
      console.warn('Failed to persist results', err);
    }
  }, [questions, showResults, generatedAt, scoreSummary]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const displaySummary = scoreSummary ?? recentSummary;

  const handleAddMistake = () => {
    if (!currentMistake.topic || !currentMistake.question || !currentMistake.correctAnswer) {
      setError('Please fill in topic, question, and correct answer before adding.');
      return;
    }

    setError(null);
    setMistakes([...mistakes, currentMistake]);
    setCurrentMistake({ topic: '', question: '', attemptedAnswer: '', correctAnswer: '' });
  };

  const handleQuickTemplate = (template: Mistake) => {
    setCurrentMistake({
      topic: template.topic,
      question: template.question,
      attemptedAnswer: template.attemptedAnswer,
      correctAnswer: template.correctAnswer,
    });
  };

  const handleGenerateQuestions = async () => {
    if (mistakes.length === 0) {
      setError('Add a mistake so we know what to practise.');
      return;
    }
    if (!isOnline) {
      setError('You are offline. Reconnect to generate questions.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/study-analyzer/practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mistakes, count: questionCount }),
      });
      
      if (!response.ok) {
        throw new Error(`Practice service returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
        setTab('practice');
        setSelectedAnswers({});
        setShowResults(false);
        setGeneratedAt(new Date().toISOString());
        setPastResults(data.data.questions);
        setRecentSummary(null);
      }
    } catch (error) {
      console.error('Question generation error:', error);
      setError('We hit a snag generating practice. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = () => {
    if (questions.length === 0) return;
    const answered = Object.keys(selectedAnswers).length === questions.length;
    if (!answered) {
      setError('Answer all questions before submitting.');
      return;
    }
    setError(null);
    setShowResults(true);
    const correct = questions.reduce((acc, q, idx) => {
      const answer = selectedAnswers[idx];
      return answer === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    const summary = {
      correct,
      total: questions.length,
      accuracy: Math.round((correct / questions.length) * 100),
    };
    setRecentSummary(summary);
    setGeneratedAt((prev) => prev ?? new Date().toISOString());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Practice generation will resume when you reconnect."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <FileQuestion className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Practice Questions
                </h1>
                <p className="text-slate-400">AI-generated targeted practice from your mistakes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span>Connected for question generation</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline &mdash; drafting mode only</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Recorded mistakes</span>
                  <History className="h-4 w-4 text-yellow-300" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{mistakes.length}</p>
                <p className="text-xs text-slate-500 mt-1">Keep logging tricky questions to sharpen practice.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-yellow-200">
                  <span>Last session</span>
                  <Target className="h-4 w-4" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {displaySummary ? `${displaySummary.accuracy}%` : '—'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {generatedAt
                    ? `Generated ${new Date(generatedAt).toLocaleString()}`
                    : 'Generate a practice set to see progress.'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Question count</span>
                  <RefreshCcw className="h-4 w-4 text-slate-300" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Input
                    type="number"
                    min={3}
                    max={10}
                    value={questionCount}
                    onChange={(e) => {
                      const next = parseInt(e.target.value, 10);
                      if (!Number.isNaN(next)) {
                        setQuestionCount(Math.min(10, Math.max(3, next)));
                      }
                    }}
                    className="w-20 bg-slate-950 border-slate-700 text-white"
                  />
                  <span className="text-xs text-slate-500">Questions per set</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Ready to practise</span>
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">{questions.length > 0 ? 'Yes' : 'No'}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {questions.length > 0 ? 'Review and submit your answers.' : 'Add mistakes and generate fresh questions.'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-yellow-500/30">
              <TabsTrigger value="mistakes">📝 Record Mistakes</TabsTrigger>
              <TabsTrigger value="practice" disabled={questions.length === 0}>
                🎯 Practice {questions.length > 0 ? `(${questions.length})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mistakes" className="mt-6">
              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Step 1: Record Your Mistakes</CardTitle>
                  <CardDescription>Add questions you got wrong to generate targeted practice questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Quadratic Equations, Photosynthesis"
                      value={currentMistake.topic}
                      onChange={(e) => setCurrentMistake({ ...currentMistake, topic: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question">Question (What was the question?)</Label>
                    <Textarea
                      id="question"
                      placeholder="e.g., What is the derivative of x²?"
                      rows={2}
                      value={currentMistake.question}
                      onChange={(e) => setCurrentMistake({ ...currentMistake, question: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="attempted">Your Answer</Label>
                      <Input
                        id="attempted"
                        placeholder="What you wrote"
                        value={currentMistake.attemptedAnswer}
                        onChange={(e) => setCurrentMistake({ ...currentMistake, attemptedAnswer: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="correct">Correct Answer</Label>
                      <Input
                        id="correct"
                        placeholder="Right answer"
                        value={currentMistake.correctAnswer}
                        onChange={(e) => setCurrentMistake({ ...currentMistake, correctAnswer: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddMistake}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Mistake
                  </Button>

                  {mistakes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Recorded Mistakes ({mistakes.length})</Label>
                      {mistakes.map((mistake, idx) => (
                        <Card key={idx} className="bg-slate-800 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="mb-2">{mistake.topic}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMistakes(mistakes.filter((_, i) => i !== idx))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{mistake.question}</p>
                            <div className="flex gap-2 text-xs">
                              <span className="text-red-400">❌ You: {mistake.attemptedAnswer}</span>
                              <span className="text-green-400">✓ Correct: {mistake.correctAnswer}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={mistakes.length === 0 || loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? 'Generating Practice Questions...' : 'Generate Practice Questions'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="mt-6">
              {questions.length > 0 ? (
                <div className="space-y-6">
                  {questions.map((q, idx) => {
                    const userSelection = selectedAnswers[idx];
                    const gotItRight = showResults && userSelection === q.correctAnswer;

                    return (
                      <Card key={idx} className="bg-slate-900/50 border-yellow-500/30">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-yellow-400">Question {idx + 1}</CardTitle>
                            <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-white text-lg">{q.question}</p>

                          <div className="space-y-2">
                            {q.options.map((option, optIdx) => {
                              const isSelected = userSelection === optIdx;
                              const isCorrectOption = q.correctAnswer === optIdx;

                              const baseClasses = isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 text-white'
                                : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-yellow-400/60';

                              const resultClasses = showResults
                                ? isCorrectOption
                                  ? 'border-green-400/70 bg-green-500/10 text-green-100'
                                  : isSelected
                                  ? 'border-red-400/70 bg-red-500/10 text-red-100'
                                  : 'opacity-70'
                                : '';

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => {
                                    if (!showResults) {
                                      setSelectedAnswers({ ...selectedAnswers, [idx]: optIdx });
                                    }
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${baseClasses} ${resultClasses}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {showResults && (
                            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-300 space-y-2">
                              <p className={gotItRight ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                {gotItRight
                                  ? 'You nailed this one!'
                                  : `Correct answer: ${q.options[q.correctAnswer]}`}
                              </p>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    {!showResults && (
                      <Button
                        onClick={handleSubmitAnswers}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                      >
                        Submit answers
                      </Button>
                    )}
                    {showResults && (
                      <>
                        <Button
                          onClick={() => {
                            setShowResults(false);
                            setSelectedAnswers({});
                          }}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                        >
                          Retake this set
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setQuestions([]);
                            setSelectedAnswers({});
                            setShowResults(false);
                            setRecentSummary(null);
                            setTab('mistakes');
                          }}
                          className="border-slate-700 text-slate-200 hover:border-yellow-400/60"
                        >
                          Clear practice
                        </Button>
                      </>
                    )}
                  </div>

                  {showResults && scoreSummary && (
                    <Card className="bg-slate-900/40 border-green-500/30">
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-white">
                            Score: {scoreSummary.correct}/{scoreSummary.total} - Accuracy {scoreSummary.accuracy}%
                          </p>
                          {generatedAt && (
                            <p className="text-xs text-slate-400">
                              Generated {new Date(generatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleGenerateQuestions}
                          className="border-yellow-400/50 text-yellow-200 hover:border-yellow-400"
                        >
                          Generate new set
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-10 text-center text-slate-500">
                  Log a few mistakes first and tap "Generate Practice Questions" to get a tailored set.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}