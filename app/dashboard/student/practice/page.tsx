'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  TrendingDown,
  Clock,
  Brain,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { OfflineBanner } from '@/components/ui/offline-banner';
import type {
  PracticeSession,
  PracticeQuestion as PracticeQuestionType,
  PracticeAnalytics,
  MistakePattern,
  AdaptiveDifficulty,
  DifficultyLevel,
  MistakeType,
} from '@/lib/types';

interface Mistake {
  topic: string;
  question: string;
  attemptedAnswer: string;
  correctAnswer: string;
}

interface PracticeQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: DifficultyLevel;
  topic?: string;
  subject?: string;
}

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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<PracticeAnalytics | null>(null);
  const [mistakePatterns, setMistakePatterns] = useState<MistakePattern[]>([]);
  const [adaptiveDifficulties, setAdaptiveDifficulties] = useState<AdaptiveDifficulty[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
   
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
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [pastResults, setPastResults] = useState<PracticeQuestion[]>([]);
  const [recentSummary, setRecentSummary] = useState<{ correct: number; total: number; accuracy: number } | null>(null);

  // Load analytics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAnalytics();
      fetchMistakePatterns();
      fetchAdaptiveDifficulties();
    }
  }, []);

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

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/practice/analytics?days=30');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data.analytics);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchMistakePatterns = async () => {
    try {
      const response = await fetch('/api/practice/mistake-patterns?analyze=true');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.analysis) {
          setMistakePatterns(data.data.analysis.patterns || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch mistake patterns:', error);
    }
  };

  const fetchAdaptiveDifficulties = async () => {
    try {
      // This would need a new endpoint - for now, we'll get it from analytics
      // We can extend analytics to include adaptive difficulties
    } catch (error) {
      console.error('Failed to fetch adaptive difficulties:', error);
    }
  };

  const scoreSummary = useMemo(() => {
    if (!showResults || questions.length === 0) return null;
    const correct = questions.reduce((acc, q, idx) => {
      const answer = selectedAnswers[idx];
      return answer === q.correctAnswer ? acc + 1 : acc;
    }, 0);
    const accuracy = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, accuracy };
  }, [questions, selectedAnswers, showResults]);

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
    setStartTime(Date.now());
    
    try {
      // Extract topic and subject from mistakes
      const primaryMistake = mistakes[0];
      const topic = primaryMistake.topic;
      const subject = ''; // Can be extracted from mistakes if needed

      // Create practice session with new API
      const sessionResponse = await fetch('/api/practice/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic,
          subject,
          count: questionCount,
          mistakes,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error(`Practice service returned ${sessionResponse.status}`);
      }

      const sessionData = await sessionResponse.json();
      
      if (sessionData.success) {
        const session = sessionData.data.session as PracticeSession;
        const questionsData = sessionData.data.questions as PracticeQuestionType[];
        
        setCurrentSessionId(session.id);
        
        // Convert to UI format
        const uiQuestions: PracticeQuestion[] = questionsData.map((q) => ({
          id: q.id,
          question: q.question_text,
          options: q.options,
          correctAnswer: q.correct_answer_index,
          explanation: q.explanation || '',
          difficulty: q.difficulty,
          topic: q.topic || topic,
          subject: q.subject || subject,
        }));

        setQuestionIds(questionsData.map((q) => q.id));
        setQuestions(uiQuestions);
        setTab('practice');
        setSelectedAnswers({});
        setShowResults(false);
        setGeneratedAt(new Date().toISOString());
        setPastResults(uiQuestions);
        setRecentSummary(null);
      }
    } catch (error) {
      console.error('Question generation error:', error);
      setError('We hit a snag generating practice. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = async () => {
    if (questions.length === 0 || !currentSessionId) return;
    const answered = Object.keys(selectedAnswers).length === questions.length;
    if (!answered) {
      setError('Answer all questions before submitting.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : undefined;

      // Record all attempts
      const attemptPromises = questions.map((q, idx) => {
        if (!questionIds[idx]) return null;
        
        const selectedIndex = selectedAnswers[idx];
        const isCorrect = selectedIndex === q.correctAnswer;

        return fetch('/api/practice/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            question_id: questionIds[idx],
            session_id: currentSessionId,
            selected_answer_index: selectedIndex,
            time_spent_seconds: timeSpent ? Math.round(timeSpent / questions.length) : undefined,
          }),
        });
      });

      await Promise.all(attemptPromises.filter(Boolean));

      // Update session as completed
      await fetch(`/api/practice/sessions?id=${currentSessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
        }),
      });

      // Refresh analytics
      await fetchAnalytics();
      await fetchMistakePatterns();

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

      // Persist results
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            LAST_RESULTS_KEY,
            JSON.stringify({
              questions,
              generatedAt: generatedAt ?? new Date().toISOString(),
              summary,
            })
          );
        } catch (err) {
          console.warn('Failed to persist results', err);
        }
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
      setError('Failed to save results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getMistakeTypeColor = (type: MistakeType) => {
    switch (type) {
      case 'conceptual': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'calculation': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'time_management': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'reading_comprehension': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      case 'application': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
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
                <p className="text-slate-400">AI-powered adaptive practice with analytics</p>
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
                  <span>Total sessions</span>
                  <Activity className="h-4 w-4 text-slate-300" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {analytics?.total_sessions || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Practice sessions completed</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Average accuracy</span>
                  <TrendingUp className="h-4 w-4 text-green-300" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {analytics?.average_accuracy ? `${Math.round(analytics.average_accuracy)}%` : '—'}
                </p>
                <p className="text-xs text-slate-500 mt-1">Across all practice sessions</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-yellow-500/30">
              <TabsTrigger value="mistakes">📝 Mistakes</TabsTrigger>
              <TabsTrigger value="practice" disabled={questions.length === 0}>
                🎯 Practice {questions.length > 0 ? `(${questions.length})` : ''}
              </TabsTrigger>
              <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
              <TabsTrigger value="patterns">🔍 Patterns</TabsTrigger>
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
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Practice Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Practice Questions
                      </>
                    )}
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
                            <div className="flex items-center gap-2">
                              {q.topic && (
                                <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                              )}
                              <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                            </div>
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
                              {q.explanation && <p>{q.explanation}</p>}
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
                        disabled={loading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit answers'
                        )}
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
                            setQuestionIds([]);
                            setSelectedAnswers({});
                            setShowResults(false);
                            setRecentSummary(null);
                            setCurrentSessionId(null);
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

            <TabsContent value="analytics" className="mt-6">
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Overall Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-900/60 border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>Total Sessions</span>
                          <Activity className="h-4 w-4" />
                        </div>
                        <p className="text-3xl font-bold text-white">{analytics.total_sessions}</p>
                        <p className="text-xs text-slate-500 mt-1">Practice sessions completed</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/60 border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>Total Questions</span>
                          <FileQuestion className="h-4 w-4" />
                        </div>
                        <p className="text-3xl font-bold text-white">{analytics.total_questions}</p>
                        <p className="text-xs text-slate-500 mt-1">Questions attempted</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-green-200 mb-2">
                          <span>Average Accuracy</span>
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {Math.round(analytics.average_accuracy)}%
                        </p>
                        <Progress
                          value={analytics.average_accuracy}
                          className="mt-2 h-2 bg-green-500/10"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Accuracy Trend */}
                  {analytics.accuracy_trend.length > 0 && (
                    <Card className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Accuracy Trend</CardTitle>
                        <CardDescription>Your performance over the last 30 days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.accuracy_trend.slice(-7).map((trend, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-24 text-xs text-slate-400">
                                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-white">{Math.round(trend.accuracy)}%</span>
                                  <span className="text-xs text-slate-500">{trend.questions} questions</span>
                                </div>
                                <Progress
                                  value={trend.accuracy}
                                  className="h-2 bg-slate-800"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-green-400 flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Strengths
                        </CardTitle>
                        <CardDescription>Topics you're excelling at</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics.strengths.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.strengths.map((strength, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-green-500/30">
                                <div>
                                  <p className="text-white font-semibold">{strength.topic}</p>
                                  {strength.subject && (
                                    <p className="text-xs text-slate-400">{strength.subject}</p>
                                  )}
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                  {Math.round(strength.accuracy)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">No strengths identified yet. Keep practicing!</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Weaknesses */}
                    <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Areas to Improve
                        </CardTitle>
                        <CardDescription>Topics needing more practice</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics.weaknesses.length > 0 ? (
                          <div className="space-y-3">
                            {analytics.weaknesses.map((weakness, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-red-500/30">
                                <div>
                                  <p className="text-white font-semibold">{weakness.topic}</p>
                                  {weakness.subject && (
                                    <p className="text-xs text-slate-400">{weakness.subject}</p>
                                  )}
                                  {weakness.common_mistakes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {weakness.common_mistakes.map((mistake, mIdx) => (
                                        <Badge key={mIdx} variant="outline" className="text-xs border-red-500/50 text-red-300">
                                          {mistake.replace('_', ' ')}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                                  {Math.round(weakness.accuracy)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">No weaknesses identified. Great job!</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Topic Breakdown */}
                  {analytics.topic_breakdown.length > 0 && (
                    <Card className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Topic Breakdown</CardTitle>
                        <CardDescription>Performance by topic</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analytics.topic_breakdown.slice(0, 10).map((topic, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-semibold">{topic.topic}</p>
                                  {topic.subject && (
                                    <p className="text-xs text-slate-400">{topic.subject}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={getDifficultyColor(topic.average_difficulty)}>
                                    {topic.average_difficulty}
                                  </Badge>
                                  <span className="text-sm text-white font-semibold">
                                    {Math.round(topic.accuracy)}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={topic.accuracy}
                                  className="flex-1 h-2 bg-slate-800"
                                />
                                <span className="text-xs text-slate-400 w-20 text-right">
                                  {topic.correct}/{topic.attempts}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="p-10 text-center text-slate-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p>No analytics data yet. Complete some practice sessions to see insights.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="patterns" className="mt-6">
              {mistakePatterns.length > 0 ? (
                <div className="space-y-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Mistake Patterns
                      </CardTitle>
                      <CardDescription>Common mistake types and their frequencies</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mistakePatterns.map((pattern, idx) => (
                          <Card key={idx} className="bg-slate-800 border-slate-700">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={getMistakeTypeColor(pattern.mistake_type)}>
                                      {pattern.mistake_type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-white font-semibold">{pattern.topic}</span>
                                  </div>
                                  {pattern.subject && (
                                    <p className="text-xs text-slate-400">{pattern.subject}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-yellow-400">{pattern.frequency}</p>
                                  <p className="text-xs text-slate-500">occurrences</p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-400">
                                Last occurred: {new Date(pattern.last_occurred_at).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="p-10 text-center text-slate-400">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                    <p>No mistake patterns detected yet. Start practicing to identify patterns.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
