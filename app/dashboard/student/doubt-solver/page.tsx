'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, CheckCircle, Lightbulb, Clipboard, Clock, Play, ExternalLink, BookOpen, GraduationCap, ChevronDown, ChevronRight, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HISTORY_KEY = 'mentark-doubt-history-v1';

type DoubtCategory = 'math' | 'science' | 'programming' | 'exam' | 'general';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  duration: string;
  view_count: number;
  url: string;
  embed_url: string;
}

interface KhanAcademyResult {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  type: 'course' | 'video' | 'exercise' | 'article';
  source: 'khan_academy';
}

interface SolvedDoubt {
  question: string;
  answer: string;
  category: DoubtCategory;
  timestamp: string;
  videos?: YouTubeVideo[];
  khanAcademyResults?: KhanAcademyResult[];
  stepByStepSolution?: {
    steps: Array<{
      stepNumber: number;
      description: string;
      explanation: string;
      formula?: string;
      intermediateResult?: string;
    }>;
    finalAnswer: string;
    alternativeMethods?: Array<{
      name: string;
      description: string;
      steps: Array<any>;
      whenToUse: string;
    }>;
    verification?: string;
    conceptTags: string[];
  };
  relatedConcepts?: Array<{
    concept: string;
    relation: string;
    description: string;
    resources?: {
      videos?: string[];
    };
  }>;
  relatedDoubts?: Array<{
    question: string;
    similarity: number;
    category: string;
    answer?: string;
    tags: string[];
  }>;
}

const EXAMPLE_DOUBTS: Array<{ prompt: string; category: DoubtCategory }> = [
  { prompt: 'Explain quantum entanglement like I am 15.', category: 'science' },
  { prompt: 'Solve 2x^2 + 5x - 3 = 0 step by step.', category: 'math' },
  { prompt: 'Help me debug a JavaScript function that returns NaN.', category: 'programming' },
  { prompt: 'How should I revise for the board exams in 30 days?', category: 'exam' },
  { prompt: 'Difference between mentorship and coaching?', category: 'general' },
];

export default function DoubtSolverPage() {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<DoubtCategory>('general');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [khanAcademyResults, setKhanAcademyResults] = useState<KhanAcademyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SolvedDoubt[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [stepByStepSolution, setStepByStepSolution] = useState<any>(null);
  const [relatedConcepts, setRelatedConcepts] = useState<any[]>([]);
  const [relatedDoubts, setRelatedDoubts] = useState<any[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [showEnhancedView, setShowEnhancedView] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored) as SolvedDoubt[]);
      }
    } catch (err) {
      console.warn('Failed to parse doubt history', err);
    }
  }, []);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (err) {
      console.warn('Failed to persist doubt history', err);
    }
  }, [history]);

  const recentNotes = useMemo(() => history.slice(0, 3), [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!isOnline) {
      setError('You are offline. Reconnect to get a verified answer.');
      return;
    }

    setLoading(true);
    setAnswer('');
    setVideos([]);
    setKhanAcademyResults([]);
    setError(null);

    try {
      // Fetch enhanced solution, basic answer, and Khan Academy results in parallel
      const [enhancedResponse, doubtResponse, khanAcademyResponse] = await Promise.allSettled([
        // Enhanced step-by-step solution
        fetch('/api/doubt-solver/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question, category }),
        }),
        // Basic answer (fallback)
        fetch('/api/doubt-solver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ question, category }),
        }),
        // Fetch Khan Academy results in parallel
        fetch(`/api/resources/khan-academy?q=${encodeURIComponent(question)}`),
      ]);

      // Process enhanced solution response
      let resolvedAnswer = '';
      let resolvedVideos: YouTubeVideo[] = [];
      let resolvedStepByStep: any = null;
      let resolvedRelatedConcepts: any[] = [];
      let resolvedRelatedDoubts: any[] = [];

      if (enhancedResponse.status === 'fulfilled' && enhancedResponse.value.ok) {
        const enhancedData = await enhancedResponse.value.json();
        if (enhancedData.success && enhancedData.data) {
          resolvedStepByStep = enhancedData.data.solution;
          resolvedAnswer = enhancedData.data.solution?.finalAnswer || '';
          resolvedRelatedConcepts = enhancedData.data.relatedConcepts || [];
          resolvedRelatedDoubts = enhancedData.data.relatedDoubts || [];
          resolvedVideos = enhancedData.data.videos || [];
        }
      }

      // Fallback to basic answer if enhanced solution failed
      if (!resolvedAnswer && doubtResponse.status === 'fulfilled' && doubtResponse.value.ok) {
        const data = await doubtResponse.value.json();
        const solution = data.data || data;
        
        if (!data.error && !solution.error) {
          resolvedAnswer = solution.answer || solution.explanation || '';
          if (!resolvedVideos.length) {
            resolvedVideos = solution.videos || [];
          }
        }
      }

      // Process Khan Academy response
      let resolvedKhanAcademyResults: KhanAcademyResult[] = [];
      if (khanAcademyResponse.status === 'fulfilled' && khanAcademyResponse.value.ok) {
        const khanData = await khanAcademyResponse.value.json();
        if (khanData.success && khanData.data?.results) {
          resolvedKhanAcademyResults = khanData.data.results.slice(0, 5); // Limit to top 5
        }
      }

      if (!resolvedAnswer) {
        throw new Error('The doubt solver could not generate an answer. Please try rephrasing your question.');
      }
      
      setAnswer(resolvedAnswer);
      setVideos(resolvedVideos);
      setKhanAcademyResults(resolvedKhanAcademyResults);
      setStepByStepSolution(resolvedStepByStep);
      setRelatedConcepts(resolvedRelatedConcepts);
      setRelatedDoubts(resolvedRelatedDoubts);
      
      // Expand first step by default
      if (resolvedStepByStep?.steps?.length > 0) {
        setExpandedSteps(new Set([0]));
      }
      
      setHistory((prev) => [
        {
          question: question.trim(),
          answer: resolvedAnswer,
          category,
          timestamp: new Date().toISOString(),
          videos: resolvedVideos,
          khanAcademyResults: resolvedKhanAcademyResults,
          stepByStepSolution: resolvedStepByStep,
          relatedConcepts: resolvedRelatedConcepts,
          relatedDoubts: resolvedRelatedDoubts,
        },
        ...prev,
      ].slice(0, 10));
      setQuestion('');
    } catch (error: any) {
      console.error('Doubt solver error:', error);
      const errorMessage = error?.message || 'Error solving your doubt. Please try again.';
      setError(errorMessage);
      setAnswer(`Error: ${errorMessage}`);
      setVideos([]);
      setKhanAcademyResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!answer || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(answer);
      setError(null);
    } catch (err) {
      console.warn('Failed to copy answer', err);
      setError('Copy failed. Select and copy manually.');
    }
  };

  const handleExampleClick = (example: { prompt: string; category: DoubtCategory }) => {
    setQuestion(example.prompt);
    setCategory(example.category);
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Doubt Solver
          </h1>
          <p className="text-slate-400">Get verified answers powered by AI + Wolfram Alpha</p>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Draft your question now and send it once you reconnect."
            className="mt-3"
          />
        </motion.div>

        <Card className="bg-slate-800/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Sparkles className="w-5 h-5" />
              Ask Anything
            </CardTitle>
            <CardDescription>
              I combine AI reasoning with verified computational data to give you accurate answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {EXAMPLE_DOUBTS.map((example) => (
                <Badge
                  key={`${example.prompt}-${example.category}`}
                  onClick={() => handleExampleClick(example)}
                  className="cursor-pointer border border-yellow-500/40 bg-slate-900/60 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <Lightbulb className="mr-1 h-3 w-3" /> {example.prompt}
                </Badge>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Describe your doubt in detail..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={category} onValueChange={(value: DoubtCategory) => setCategory(value)}>
                  <SelectTrigger className="sm:max-w-xs bg-slate-900 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="exam">Exam Prep</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={loading || !question.trim() || !isOnline}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Solving...
                    </>
                  ) : isOnline ? (
                    'Solve My Doubt'
                  ) : (
                    'Waiting for connection'
                  )}
                </Button>
              </div>
            </form>

            {answer && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Tabs defaultValue={stepByStepSolution ? "step-by-step" : "answer"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-700">
                      <TabsTrigger value="answer" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
                        Answer
                      </TabsTrigger>
                      {stepByStepSolution && (
                        <TabsTrigger value="step-by-step" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
                          Step-by-Step
                        </TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="answer" className="mt-4">
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="font-semibold text-green-400">Verified Answer</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={handleCopyAnswer}
                            className="ml-auto text-xs text-slate-300 hover:text-white"
                          >
                            <Clipboard className="w-4 h-4 mr-1" /> Copy
                          </Button>
                        </div>
                        <p className="text-slate-200 whitespace-pre-wrap">{answer}</p>
                      </div>
                    </TabsContent>
                    
                    {stepByStepSolution && (
                      <TabsContent value="step-by-step" className="mt-4 space-y-4">
                        {/* Step-by-Step Solution */}
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/30">
                          <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            <span className="font-semibold text-purple-400">Step-by-Step Solution</span>
                          </div>
                          
                          <div className="space-y-3">
                            {stepByStepSolution.steps?.map((step: any, idx: number) => {
                              const isExpanded = expandedSteps.has(idx);
                              return (
                                <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedSteps);
                                      if (isExpanded) {
                                        newExpanded.delete(idx);
                                      } else {
                                        newExpanded.add(idx);
                                      }
                                      setExpandedSteps(newExpanded);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                      {step.stepNumber || idx + 1}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <p className="text-white font-medium">{step.description || `Step ${idx + 1}`}</p>
                                      {step.formula && (
                                        <p className="text-xs text-slate-400 mt-1 font-mono">{step.formula}</p>
                                      )}
                                    </div>
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    )}
                                  </button>
                                  {isExpanded && (
                                    <div className="p-4 bg-slate-800/30 border-t border-slate-700">
                                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{step.explanation}</p>
                                      {step.intermediateResult && (
                                        <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/30">
                                          <p className="text-xs text-purple-300 font-semibold mb-1">Intermediate Result:</p>
                                          <p className="text-purple-200 text-sm font-mono">{step.intermediateResult}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Final Answer */}
                          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                            <p className="text-xs text-green-400 font-semibold mb-2">Final Answer:</p>
                            <p className="text-green-300 font-semibold text-lg">{stepByStepSolution.finalAnswer || answer}</p>
                          </div>
                          
                          {/* Verification */}
                          {stepByStepSolution.verification && (
                            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-blue-400 font-semibold">Verification</p>
                              </div>
                              <p className="text-blue-300 text-sm">{stepByStepSolution.verification}</p>
                            </div>
                          )}
                          
                          {/* Alternative Methods */}
                          {stepByStepSolution.alternativeMethods && stepByStepSolution.alternativeMethods.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-slate-300 mb-3">Alternative Methods</p>
                              <div className="space-y-2">
                                {stepByStepSolution.alternativeMethods.map((method: any, idx: number) => {
                                  const methodId = `method-${idx}`;
                                  const isOpen = expandedSteps.has(-idx - 100); // Use negative indices for methods
                                  return (
                                    <div key={idx} className="border border-slate-700 rounded-lg overflow-hidden">
                                      <button
                                        onClick={() => {
                                          const newExpanded = new Set(expandedSteps);
                                          if (isOpen) {
                                            newExpanded.delete(-idx - 100);
                                          } else {
                                            newExpanded.add(-idx - 100);
                                          }
                                          setExpandedSteps(newExpanded);
                                        }}
                                        className="w-full p-3 bg-slate-800/50 hover:bg-slate-800/70 transition-colors text-left"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-white font-medium">{method.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{method.whenToUse}</p>
                                          </div>
                                          {isOpen ? (
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                          )}
                                        </div>
                                      </button>
                                      {isOpen && (
                                        <div className="p-4 bg-slate-800/30 border-t border-slate-700">
                                          <p className="text-slate-300 text-sm mb-3">{method.description}</p>
                                          <div className="space-y-2">
                                            {method.steps?.map((step: any, stepIdx: number) => (
                                              <div key={stepIdx} className="p-2 rounded bg-slate-900/50">
                                                <p className="text-xs text-slate-400 mb-1">Step {stepIdx + 1}</p>
                                                <p className="text-slate-300 text-sm">{step.description || step.explanation}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Concept Tags */}
                          {stepByStepSolution.conceptTags && stepByStepSolution.conceptTags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {stepByStepSolution.conceptTags.map((tag: string, idx: number) => (
                                <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Related Concepts */}
                        {relatedConcepts.length > 0 && (
                          <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <LinkIcon className="w-5 h-5 text-cyan-400" />
                              <span className="font-semibold text-cyan-400">Related Concepts</span>
                            </div>
                            <div className="space-y-2">
                              {relatedConcepts.slice(0, 5).map((concept: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium text-sm">{concept.concept}</span>
                                    <Badge className={`${
                                      concept.relation === 'prerequisite' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                      concept.relation === 'advanced' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                      concept.relation === 'application' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                      'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    } capitalize`}>
                                      {concept.relation}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-xs">{concept.description}</p>
                                  {concept.resources?.videos && concept.resources.videos.length > 0 && (
                                    <div className="mt-2">
                                      <a
                                        href={concept.resources.videos[0]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                      >
                                        <Play className="w-3 h-3" />
                                        Watch video explanation
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Related Doubts */}
                        {relatedDoubts.length > 0 && (
                          <div className="p-4 bg-slate-900/50 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-3">
                              <Lightbulb className="w-5 h-5 text-yellow-400" />
                              <span className="font-semibold text-yellow-400">Related Doubts</span>
                            </div>
                            <div className="space-y-2">
                              {relatedDoubts.slice(0, 3).map((doubt: any, idx: number) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setQuestion(doubt.question);
                                    setCategory(doubt.category as DoubtCategory);
                                    handleSubmit(new Event('submit') as any);
                                  }}
                                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-sm font-medium">{doubt.question}</span>
                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                      {(doubt.similarity * 100).toFixed(0)}% similar
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {doubt.tags.slice(0, 3).map((tag: string, tagIdx: number) => (
                                      <Badge key={tagIdx} variant="outline" className="text-xs border-slate-700 text-slate-400">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    )}
                  </Tabs>
                </motion.div>

                {videos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Play className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-yellow-400">Video Explanations</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((video) => (
                        <motion.a
                          key={video.id}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-yellow-500/50 transition-all bg-slate-800/50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative aspect-video bg-slate-900">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                <Play className="w-6 h-6 text-white ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                              {video.duration}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-yellow-400 transition-colors">
                              {video.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="line-clamp-1">{video.channel_title}</span>
                              <div className="flex items-center gap-2">
                                <span>{video.view_count.toLocaleString()} views</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {khanAcademyResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-blue-500/30"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-blue-400">Khan Academy Resources</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {khanAcademyResults.map((result, idx) => {
                        const typeIcon = result.type === 'video' ? Play : result.type === 'course' ? BookOpen : result.type === 'exercise' ? CheckCircle : BookOpen;
                        const typeColor = result.type === 'video' ? 'text-red-400' : result.type === 'course' ? 'text-blue-400' : result.type === 'exercise' ? 'text-green-400' : 'text-purple-400';
                        return (
                          <motion.a
                            key={idx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all bg-slate-800/50 p-4"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start gap-3">
                              {result.thumbnail && (
                                <img
                                  src={result.thumbnail}
                                  alt={result.title}
                                  className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                                />
                              )}
                              {!result.thumbnail && (
                                <div className={`w-16 h-16 rounded-lg border border-slate-700 flex-shrink-0 flex items-center justify-center bg-slate-900`}>
                                  <span className={`text-2xl`}>
                                    {result.type === 'video' ? '▶️' : result.type === 'course' ? '📚' : result.type === 'exercise' ? '✏️' : '📄'}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {React.createElement(typeIcon, { className: `w-4 h-4 ${typeColor}` })}
                                  <Badge className={`bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs capitalize`}>
                                    {result.type}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                                  {result.title}
                                </h4>
                                {result.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                                    {result.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>Khan Academy</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                          </motion.a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {recentNotes.length > 0 && (
          <Card className="mt-8 bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100 text-lg">
                <Clock className="w-4 h-4 text-yellow-400" /> Recent solutions
              </CardTitle>
              <CardDescription>Your last answered questions are stored locally so you can revisit them quickly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentNotes.map((item, index) => (
                <div key={index} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 capitalize">
                      {item.category}
                    </Badge>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200 font-semibold mb-2">{item.question}</p>
                  <p className="text-sm text-slate-300 line-clamp-3">{item.answer}</p>
                </div>
              ))}
              {history.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:text-white"
                  onClick={() => setHistory([])}
                >
                  Clear history
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

