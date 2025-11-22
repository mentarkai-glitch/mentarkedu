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
  Loader2, // Keep for compatibility, but use Spinner component instead
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { generateFlashcards, downloadDocumentAsFile } from '@/lib/services/document-generation';
import { PeerComparison } from '@/components/practice/PeerComparison';
import { toast } from 'sonner';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { TabNav } from '@/components/ui/tab-nav';
import { StatCard } from '@/components/ui/card/card-variants';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
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
  
  // Custom topic generation state
  const [customTopic, setCustomTopic] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [customMode, setCustomMode] = useState<'grade_exam' | 'general'>('general');
  const [customGrade, setCustomGrade] = useState('');
  const [customExam, setCustomExam] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<DifficultyLevel>('medium');
  const [customQuestionCount, setCustomQuestionCount] = useState(5);
  const [customLoading, setCustomLoading] = useState(false);
   
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
  const [recentSummary, setRecentSummary] = useState<{ correct: number; total: number; accuracy: number; nextDifficulty?: DifficultyLevel } | null>(null);
  const [mistakesDueForReview, setMistakesDueForReview] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  
  // Peer comparison state
  const [peerPrivacyEnabled, setPeerPrivacyEnabled] = useState(true);

  // Load analytics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAnalytics();
      fetchMistakePatterns();
      fetchAdaptiveDifficulties();
      fetchMistakesDueForReview();
      fetchPerformanceMetrics();
    }
  }, []);
  
  const fetchMistakesDueForReview = async () => {
    try {
      const response = await fetch('/api/practice/adaptive?action=due-review');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMistakesDueForReview(data.data.mistakes || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch mistakes due for review:', error);
    }
  };
  
  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/practice/adaptive?action=metrics');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPerformanceMetrics(data.data.metrics);
        }
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  };

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
      const response = await fetch('/api/practice/adaptive?action=metrics');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.metrics) {
          // Store metrics for adaptive difficulty calculation
          // This will be used when generating new questions
        }
      }
    } catch (error) {
      console.error('Failed to fetch adaptive difficulties:', error);
    }
  };
  
  const calculateNextDifficulty = async (recentAttempts: any[], currentDifficulty: DifficultyLevel) => {
    try {
      const response = await fetch('/api/practice/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'calculate-difficulty',
          attempts: recentAttempts,
          currentDifficulty
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data.difficulty;
        }
      }
    } catch (error) {
      console.error('Failed to calculate adaptive difficulty:', error);
    }
    return currentDifficulty;
  };
  
  const trackMistakeForSpacedRepetition = async (question: PracticeQuestion, selectedAnswer: number) => {
    if (selectedAnswer === question.correctAnswer) return;
    
    try {
      await fetch('/api/practice/adaptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'track-mistake',
          questionId: question.id,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          topic: question.topic
        })
      });
    } catch (error) {
      console.error('Failed to track mistake:', error);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (questions.length === 0) {
      toast.error('No questions to export');
      return;
    }

    try {
      toast.loading('Generating flashcards...', { id: 'flashcards-gen' });
      
      // Convert practice questions to flashcard format
      const flashcardQuestions = questions.map((q) => ({
        question: q.question,
        answer: q.options[q.correctAnswer] || q.explanation || 'See explanation',
        topic: q.topic || 'Practice',
        difficulty: q.difficulty,
      }));

      const result = await generateFlashcards({
        source: 'custom',
        questions: flashcardQuestions,
        format: 'xlsx', // Excel format for flashcards
      });

      toast.success('Flashcards generated! Downloading...', { id: 'flashcards-gen' });
      await downloadDocumentAsFile(
        result.id,
        `practice-flashcards-${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate flashcards', { id: 'flashcards-gen' });
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

  const handleGenerateCustomQuestions = async () => {
    if (!customTopic.trim()) {
      setError('Please enter a topic to generate questions.');
      return;
    }
    if (!isOnline) {
      setError('You are offline. Reconnect to generate questions.');
      return;
    }

    setCustomLoading(true);
    setError(null);
    setStartTime(Date.now());

    try {
      // Generate questions from custom topic
      const response = await fetch('/api/practice/generate-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: customTopic.trim(),
          context: customContext.trim() || undefined,
          count: customQuestionCount,
          mode: customMode,
          grade: customMode === 'grade_exam' ? customGrade : undefined,
          exam: customMode === 'grade_exam' ? customExam : undefined,
          subject: customMode === 'grade_exam' ? customSubject : undefined,
          difficulty: customDifficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      
      if (data.success) {
        const generatedQuestions = data.data.questions;
        
        // Convert to UI format
        const uiQuestions: PracticeQuestion[] = generatedQuestions.map((q: any, idx: number) => ({
          id: `custom-${Date.now()}-${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          difficulty: q.difficulty || customDifficulty,
          topic: q.topic || customTopic,
          subject: q.subject || customSubject || 'General',
        }));

        // Create a practice session for these questions
        const sessionResponse = await fetch('/api/practice/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            topic: customTopic,
            subject: customSubject || 'General',
            count: uiQuestions.length,
            difficulty_level: customDifficulty,
          }),
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.success) {
            setCurrentSessionId(sessionData.data.session.id);
            setQuestionIds(uiQuestions.map((q) => q.id || ''));
          }
        }

        setQuestions(uiQuestions);
        setTab('practice');
        setSelectedAnswers({});
        setShowResults(false);
        setGeneratedAt(new Date().toISOString());
        setPastResults(uiQuestions);
        setRecentSummary(null);
        
        toast.success(`Generated ${uiQuestions.length} questions on "${customTopic}"`);
      }
    } catch (error: any) {
      console.error('Custom question generation error:', error);
      setError(error.message || 'Failed to generate questions. Please try again.');
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setCustomLoading(false);
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

      // Track all mistakes for spaced repetition
      questions.forEach((q, idx) => {
        const selectedAnswer = selectedAnswers[idx];
        if (selectedAnswer !== undefined && selectedAnswer !== q.correctAnswer) {
          trackMistakeForSpacedRepetition(q, selectedAnswer);
        }
      });
      
      // Calculate adaptive difficulty for next session
      const recentAttempts = questions.map((q, idx) => ({
        questionId: q.id,
        selectedAnswer: selectedAnswers[idx],
        correctAnswer: q.correctAnswer,
        timeSpent: timeSpent ? Math.round(timeSpent / questions.length) : 30,
        timestamp: new Date(),
        difficulty: q.difficulty,
        wasCorrect: selectedAnswers[idx] === q.correctAnswer
      }));
      
      // Calculate next difficulty
      const avgDifficulty = questions.reduce((sum, q) => {
        const difficultyValue = { easy: 1, medium: 2, hard: 3, advanced: 4 }[q.difficulty] || 2;
        return sum + difficultyValue;
      }, 0) / questions.length;
      
      const currentDifficulty = avgDifficulty < 1.5 ? 'easy' : 
                                avgDifficulty < 2.5 ? 'medium' : 
                                avgDifficulty < 3.5 ? 'hard' : 'advanced';
      
      const nextDifficulty = await calculateNextDifficulty(recentAttempts, currentDifficulty as DifficultyLevel);
      
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
        nextDifficulty // Store for next session
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
      default: return 'bg-card/20 text-muted-foreground border-border/50';
    }
  };

  const getMistakeTypeColor = (type: MistakeType) => {
    switch (type) {
      case 'conceptual': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'calculation': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'time_management': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'reading_comprehension': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      case 'application': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      default: return 'bg-card/20 text-muted-foreground border-border/50';
    }
  };

  // Tab navigation items
  const tabItems = [
    { value: 'mistakes', label: 'Mistakes', icon: '📝' },
    { value: 'custom', label: 'Custom Topic', icon: '✨' },
    { 
      value: 'practice', 
      label: `Practice${questions.length > 0 ? ` (${questions.length})` : ''}`, 
      icon: '🎯',
      disabled: questions.length === 0,
      badge: questions.length > 0 ? questions.length : undefined,
    },
    { value: 'peer-comparison', label: 'Peer Compare', icon: '👥' },
    { value: 'analytics', label: 'Analytics', icon: '📊' },
    { value: 'patterns', label: 'Patterns', icon: '🔍' },
  ];

  return (
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <OfflineBanner
          isOnline={isOnline}
          message="You are offline. Practice generation will resume when you reconnect."
          className="mb-4"
        />
        
        <PageHeader
          title="Practice Questions"
          description="AI-powered adaptive practice with analytics"
          icon={<FileQuestion className="w-8 h-8 text-yellow-400" />}
          actions={
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline</span>
                </>
              )}
            </div>
          }
        />

        <PageContainer spacing="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Recorded mistakes"
              value={mistakes.length}
              icon={<History className="h-4 w-4 text-yellow-400" />}
              description="Keep logging tricky questions to sharpen practice."
            />

            <StatCard
              label="Last session"
              value={displaySummary ? `${displaySummary.accuracy}%` : '—'}
              icon={<Target className="h-4 w-4 text-yellow-400" />}
              description={
                generatedAt
                  ? `Generated ${new Date(generatedAt).toLocaleString()}`
                  : 'Generate a practice set to see progress.'
              }
              variant="highlight"
            />

            <StatCard
              label="Total sessions"
              value={analytics?.total_sessions || 0}
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              description="Practice sessions completed"
            />

            <StatCard
              label="Average accuracy"
              value={analytics?.average_accuracy ? `${Math.round(analytics.average_accuracy)}%` : '—'}
              icon={<TrendingUp className="h-4 w-4 text-green-400" />}
              description="Across all practice sessions"
            />
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabNav
              items={tabItems}
              value={tab}
              onValueChange={setTab}
              fullWidth
              variant="default"
              size="md"
            />

            <TabsContent value="custom" className="mt-6">
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-gold/30 shadow-gold-sm">
                <CardHeader>
                  <CardTitle className="text-gold flex items-center gap-2 text-2xl">
                    <Sparkles className="w-6 h-6" />
                    Generate Questions from Any Topic
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base">
                    Enter any topic with context and generate practice questions instantly. Works for any field in the world!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Common Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="custom-topic" className="text-muted-foreground font-semibold">
                        Topic * <span className="text-muted-foreground font-normal">(Required)</span>
                      </Label>
                      <Input
                        id="custom-topic"
                        placeholder="e.g., Quantum Physics, Machine Learning, Ancient History, Marketing Strategies, Cooking, Photography..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="bg-card border-border text-foreground text-lg h-12 mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Any topic from any field in the world - academic, professional, technical, creative, or anything!
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="custom-context" className="text-muted-foreground font-semibold">
                        Additional Context <span className="text-muted-foreground font-normal">(Optional but recommended)</span>
                      </Label>
                      <Textarea
                        id="custom-context"
                        placeholder="Provide more details: specific concepts to focus on, difficulty level preferences, particular aspects you want to practice, etc."
                        rows={3}
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                        className="bg-card border-border text-foreground mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 More context = better, more targeted questions
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="custom-count" className="text-muted-foreground font-semibold">
                        Number of Questions
                      </Label>
                      <Input
                        id="custom-count"
                        type="number"
                        min={1}
                        max={50}
                        value={customQuestionCount}
                        onChange={(e) => setCustomQuestionCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 5)))}
                        className="bg-card border-border text-foreground h-12 mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Between 1-50 questions</p>
                    </div>

                    <div>
                      <Label htmlFor="custom-difficulty" className="text-muted-foreground font-semibold">
                        Difficulty Level
                      </Label>
                      <select
                        id="custom-difficulty"
                        value={customDifficulty}
                        onChange={(e) => setCustomDifficulty(e.target.value as DifficultyLevel)}
                        className="w-full mt-2 px-3 py-3 bg-card border border-border rounded-md text-foreground h-12"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-card/50 text-muted-foreground font-semibold">
                        Choose Generation Mode
                      </span>
                    </div>
                  </div>

                  {/* Two Separate Generation Modes */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grade/Exam Specific Section */}
                    <Card className="bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-purple-500/10 border-2 border-blue-500/40 hover:border-blue-500/60 transition-all">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Target className="w-6 h-6 text-blue-400" />
                          </div>
                          <CardTitle className="text-blue-300 text-xl">Grade & Exam Specific</CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground text-sm">
                          Questions aligned with specific grade levels, exams (JEE, NEET, CBSE, ICSE, etc.), and subjects.
                          Perfect for exam preparation!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="custom-grade" className="text-muted-foreground text-sm">Grade (Optional)</Label>
                            <Input
                              id="custom-grade"
                              placeholder="e.g., 10, 11, 12"
                              value={customGrade}
                              onChange={(e) => setCustomGrade(e.target.value)}
                              className="bg-card/70 border-border text-foreground mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="custom-exam" className="text-muted-foreground text-sm">Exam (Optional)</Label>
                            <Input
                              id="custom-exam"
                              placeholder="e.g., JEE, NEET, CBSE, ICSE, Board Exams"
                              value={customExam}
                              onChange={(e) => setCustomExam(e.target.value)}
                              className="bg-card/70 border-border text-foreground mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="custom-subject-grade" className="text-muted-foreground text-sm">Subject (Optional)</Label>
                            <Input
                              id="custom-subject-grade"
                              placeholder="e.g., Physics, Math, Chemistry, Biology"
                              value={customSubject}
                              onChange={(e) => setCustomSubject(e.target.value)}
                              className="bg-card/70 border-border text-foreground mt-1"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={() => {
                            setCustomMode('grade_exam');
                            handleGenerateCustomQuestions();
                          }}
                          disabled={!customTopic.trim() || customLoading}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-foreground font-bold h-14 text-base shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {customLoading && customMode === 'grade_exam' ? (
                            <>
                              <Spinner size="sm" color="gold" />
                              <span>Generating {customQuestionCount} Question{customQuestionCount !== 1 ? 's' : ''}...</span>
                            </>
                          ) : (
                            <>
                              <Target className="w-5 h-5 mr-2" />
                              Generate {customQuestionCount} Grade/Exam Question{customQuestionCount !== 1 ? 's' : ''}
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Questions will be tailored to {customGrade ? `Grade ${customGrade}` : 'your grade'} {customExam ? `and ${customExam} exam` : ''} standards
                        </p>
                      </CardContent>
                    </Card>

                    {/* General Mode Section */}
                    <Card className="bg-gradient-to-br from-green-500/10 via-green-600/5 to-teal-500/10 border-2 border-green-500/40 hover:border-green-500/60 transition-all">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Brain className="w-6 h-6 text-green-400" />
                          </div>
                          <CardTitle className="text-green-300 text-xl">General (Any Field)</CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground text-sm">
                          Questions from ANY field in the world - academic, professional, technical, creative, hobbies, or literally any topic you can imagine!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-card/40 rounded-lg border border-green-500/30">
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong className="text-green-400">✨ Examples:</strong>
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>• Machine Learning</div>
                            <div>• Photography</div>
                            <div>• Cooking</div>
                            <div>• Philosophy</div>
                            <div>• Music Theory</div>
                            <div>• Business Strategy</div>
                            <div>• Art History</div>
                            <div>• Programming</div>
                          </div>
                          <p className="text-xs text-green-400 mt-2 font-semibold">
                            Or literally anything you want to practice!
                          </p>
                        </div>

                        <Button
                          onClick={() => {
                            setCustomMode('general');
                            handleGenerateCustomQuestions();
                          }}
                          disabled={!customTopic.trim() || customLoading}
                          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-foreground font-bold h-14 text-base shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {customLoading && customMode === 'general' ? (
                            <>
                              <Spinner size="sm" color="gold" />
                              <span>Generating {customQuestionCount} Question{customQuestionCount !== 1 ? 's' : ''}...</span>
                            </>
                          ) : (
                            <>
                              <Brain className="w-5 h-5 mr-2" />
                              Generate {customQuestionCount} General Question{customQuestionCount !== 1 ? 's' : ''}
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Questions will cover any field or domain you specify
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {error && (
                    <Alert className="bg-red-500/10 border-red-500/50">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mistakes" className="mt-6">
              <Card className="bg-card/50 border-yellow-500/30">
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
                      className="bg-card border-border"
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
                      className="bg-card border-border"
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
                        className="bg-card border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="correct">Correct Answer</Label>
                      <Input
                        id="correct"
                        placeholder="Right answer"
                        value={currentMistake.correctAnswer}
                        onChange={(e) => setCurrentMistake({ ...currentMistake, correctAnswer: e.target.value })}
                        className="bg-card border-border"
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
                        <Card key={idx} className="bg-card border-border">
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
                            <p className="text-sm text-muted-foreground mb-2">{mistake.question}</p>
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
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" color="gold" />
                        <span>Generating Practice Questions...</span>
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
                      <Card key={idx} className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 border-gold/40 shadow-lg hover:shadow-gold-sm transition-all">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-gold text-xl">Question {idx + 1}</CardTitle>
                            <div className="flex items-center gap-2">
                              {q.topic && (
                                <Badge variant="outline" className="text-xs">{q.topic}</Badge>
                              )}
                              <Badge className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-foreground text-lg">{q.question}</p>

                          <div className="space-y-2">
                            {q.options.map((option, optIdx) => {
                              const isSelected = userSelection === optIdx;
                              const isCorrectOption = q.correctAnswer === optIdx;

                              const baseClasses = isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 text-foreground'
                                : 'border-border bg-card/40 text-muted-foreground hover:border-yellow-400/60';

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
                                  onClick={async () => {
                                    if (!showResults) {
                                      setSelectedAnswers({ ...selectedAnswers, [idx]: optIdx });
                                      // Track mistake for spaced repetition if wrong
                                      if (optIdx !== q.correctAnswer) {
                                        await trackMistakeForSpacedRepetition(q, optIdx);
                                      }
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
                            <div className="rounded-lg border border-border bg-card/40 p-3 text-sm text-muted-foreground space-y-2">
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
                            <Spinner size="sm" color="gold" />
                            <span>Submitting...</span>
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
                          onClick={handleGenerateFlashcards}
                          disabled={questions.length === 0}
                          className="border-green-400/50 text-green-200 hover:border-green-400"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export Flashcards
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
                          className="border-border text-muted-foreground hover:border-yellow-400/60"
                        >
                          Clear practice
                        </Button>
                      </>
                    )}
                  </div>

                  {showResults && scoreSummary && (
                    <Card className="bg-card/40 border-green-500/30">
                      <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-foreground">
                            Score: {scoreSummary.correct}/{scoreSummary.total} - Accuracy {scoreSummary.accuracy}%
                          </p>
                          {generatedAt && (
                            <p className="text-xs text-muted-foreground">
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
                <div className="rounded-xl border border-border bg-card/60 p-10 text-center text-muted-foreground">
                  Log a few mistakes first and tap "Generate Practice Questions" to get a tailored set.
                </div>
              )}
            </TabsContent>

            <TabsContent value="peer-comparison" className="mt-6">
              <PeerComparison 
                topic={questions[0]?.topic}
                subject={questions[0]?.subject}
                days={30}
                privacyEnabled={peerPrivacyEnabled}
                onPrivacyToggle={setPeerPrivacyEnabled}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              {analyticsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <CardSkeleton key={i} lines={3} showHeader />
                  ))}
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Adaptive Difficulty & Performance */}
                  {performanceMetrics && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                        <CardHeader>
                          <CardTitle className="text-purple-400 flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            Adaptive Difficulty
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-card/50 border border-purple-500/30">
                              <p className="text-xs text-muted-foreground mb-1">Current Performance</p>
                              <p className="text-2xl font-bold text-purple-400">
                                {Math.round(performanceMetrics.accuracy * 100)}%
                              </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              {(['easy', 'medium', 'hard', 'advanced'] as DifficultyLevel[]).map((diff) => (
                                <div key={diff} className="p-2 rounded bg-card/50 text-center">
                                  <p className="text-muted-foreground capitalize">{diff}</p>
                                  <p className="text-foreground font-semibold">
                                    {performanceMetrics.difficultyDistribution?.[diff] || 0}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {recentSummary?.nextDifficulty && (
                              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <p className="text-xs text-blue-400 font-semibold mb-1">Recommended Next</p>
                                <Badge className={getDifficultyColor(recentSummary.nextDifficulty)}>
                                  {recentSummary.nextDifficulty}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
                        <CardHeader>
                          <CardTitle className="text-cyan-400 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Performance Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-card/50 border border-cyan-500/30">
                              <p className="text-xs text-muted-foreground mb-1">Average Time per Question</p>
                              <p className="text-2xl font-bold text-cyan-400">
                                {performanceMetrics.averageTime ? Math.round(performanceMetrics.averageTime) : 0}s
                              </p>
                            </div>
                            {performanceMetrics.topicPerformance && Object.keys(performanceMetrics.topicPerformance).length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground font-semibold">Topic Performance</p>
                                {Object.entries(performanceMetrics.topicPerformance).slice(0, 3).map(([topic, data]: [string, any]) => (
                                  <div key={topic} className="p-2 rounded bg-card/50">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-foreground text-sm">{topic}</span>
                                      <span className="text-cyan-400 text-sm font-semibold">
                                        {Math.round(data.accuracy * 100)}%
                                      </span>
                                    </div>
                                    <Progress value={data.accuracy * 100} className="h-1.5" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  {/* Mistakes Due for Review (Spaced Repetition) */}
                  {mistakesDueForReview.length > 0 && (
                    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                      <CardHeader>
                        <CardTitle className="text-orange-400 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Mistakes Due for Review
                        </CardTitle>
                        <CardDescription>
                          {mistakesDueForReview.length} mistake{mistakesDueForReview.length !== 1 ? 's' : ''} ready for spaced repetition review
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {mistakesDueForReview.slice(0, 5).map((mistake: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg bg-card/50 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                  {mistake.topic}
                                </Badge>
                                <Badge className={`${
                                  mistake.masteryLevel >= 80 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                  mistake.masteryLevel >= 50 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-red-500/20 text-red-300 border-red-500/30'
                                }`}>
                                  {Math.round(mistake.masteryLevel)}% mastery
                                </Badge>
                              </div>
                              <p className="text-foreground text-sm mb-1">{mistake.question || 'Review this concept'}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span>Occurrences: {mistake.occurrences}</span>
                                <span>•</span>
                                <span>Next review: {new Date(mistake.nextReview).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Overall Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card/60 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Total Sessions</span>
                          <Activity className="h-4 w-4" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">{analytics.total_sessions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Practice sessions completed</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/60 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Total Questions</span>
                          <FileQuestion className="h-4 w-4" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">{analytics.total_questions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Questions attempted</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between text-xs text-green-200 mb-2">
                          <span>Average Accuracy</span>
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">
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
                    <Card className="bg-card/50 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Accuracy Trend</CardTitle>
                        <CardDescription>Your performance over the last 30 days</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.accuracy_trend.slice(-7).map((trend, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-24 text-xs text-muted-foreground">
                                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-foreground">{Math.round(trend.accuracy)}%</span>
                                  <span className="text-xs text-muted-foreground">{trend.questions} questions</span>
                                </div>
                                <Progress
                                  value={trend.accuracy}
                                  className="h-2 bg-card"
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
                              <div key={idx} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-green-500/30">
                                <div>
                                  <p className="text-foreground font-semibold">{strength.topic}</p>
                                  {strength.subject && (
                                    <p className="text-xs text-muted-foreground">{strength.subject}</p>
                                  )}
                                </div>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                  {Math.round(strength.accuracy)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No strengths identified yet. Keep practicing!</p>
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
                              <div key={idx} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-red-500/30">
                                <div>
                                  <p className="text-foreground font-semibold">{weakness.topic}</p>
                                  {weakness.subject && (
                                    <p className="text-xs text-muted-foreground">{weakness.subject}</p>
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
                          <p className="text-muted-foreground text-sm">No weaknesses identified. Great job!</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Topic Breakdown */}
                  {analytics.topic_breakdown.length > 0 && (
                    <Card className="bg-card/50 border-yellow-500/30">
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
                                  <p className="text-foreground font-semibold">{topic.topic}</p>
                                  {topic.subject && (
                                    <p className="text-xs text-muted-foreground">{topic.subject}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={getDifficultyColor(topic.average_difficulty)}>
                                    {topic.average_difficulty}
                                  </Badge>
                                  <span className="text-sm text-foreground font-semibold">
                                    {Math.round(topic.accuracy)}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={topic.accuracy}
                                  className="flex-1 h-2 bg-card"
                                />
                                <span className="text-xs text-muted-foreground w-20 text-right">
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
                <EmptyState
                  variant="no-data"
                  title="No analytics data yet"
                  description="Complete some practice sessions to see insights."
                  icon={<BarChart3 className="w-12 h-12" />}
                />
              )}
            </TabsContent>

            <TabsContent value="patterns" className="mt-6">
              {mistakePatterns.length > 0 ? (
                <div className="space-y-6">
                  <Card className="bg-card/50 border-yellow-500/30">
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
                          <Card key={idx} className="bg-card border-border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={getMistakeTypeColor(pattern.mistake_type)}>
                                      {pattern.mistake_type.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-foreground font-semibold">{pattern.topic}</span>
                                  </div>
                                  {pattern.subject && (
                                    <p className="text-xs text-muted-foreground">{pattern.subject}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-yellow-400">{pattern.frequency}</p>
                                  <p className="text-xs text-muted-foreground">occurrences</p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
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
                <EmptyState
                  variant="no-data"
                  title="No mistake patterns yet"
                  description="Start practicing to identify patterns."
                  icon={<Brain className="w-12 h-12" />}
                />
              )}
            </TabsContent>
          </Tabs>
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}
