'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LearningPathNode,
  ContentRecommendation,
  SpacedRepetitionQueueItem,
  StudyPathProgressEntry,
} from '@/lib/types';
import { Loader2, TrendingUp, Brain, Clock, ArrowRight, ChevronLeft, ChevronRight, Sparkles, BookOpen, Video, FileText, ExternalLink } from 'lucide-react';
import { trackEvent } from '@/lib/services/analytics';
import { ContentRecommendations } from '@/components/study-analyzer/ContentRecommendations';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/ui/card/card-variants';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';

export default function StudyAnalyzerPage() {
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<LearningPathNode[]>([]);
  const [studyRecommendations, setStudyRecommendations] = useState<ContentRecommendation[]>([]);
  const [queueItems, setQueueItems] = useState<SpacedRepetitionQueueItem[]>([]);
  const [masterySummary, setMasterySummary] = useState<StudyPathProgressEntry[]>([]);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
  const [adaptivePath, setAdaptivePath] = useState<any>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState<any>(null);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    sessionType: 'solo',
    materialType: 'notes',
    startedAt: '',
    durationMinutes: 45,
    notes: '',
    tags: '',
  });

  const fetchStudySignals = useCallback(async () => {
    try {
      setSignalsLoading(true);
      const response = await fetch('/api/study-analyzer/recommendations', { credentials: 'include' });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.success) {
        setLearningPath(payload.data.learning_path || []);
        setStudyRecommendations(payload.data.recommendations || []);
        setQueueItems(payload.data.spaced_repetition_queue || []);
        setMasterySummary(payload.data.mastery_summary || []);
      }
    } catch (error) {
      console.error('Failed to load study signals:', error);
    } finally {
      setSignalsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudySignals();
    fetchAdaptivePath();
    fetchFlashcards();
  }, [fetchStudySignals]);

  const fetchAdaptivePath = async () => {
    try {
      setPathLoading(true);
      const response = await fetch('/api/study-analyzer/adaptive-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goal: 'Master current subjects',
          currentKnowledge: learningPath.map(node => node.topic_name || node.topic_id || ''),
          learningStyle: undefined // Auto-detect
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdaptivePath(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch adaptive path:', error);
    } finally {
      setPathLoading(false);
    }
  };

  const fetchFlashcards = async () => {
    try {
      setFlashcardLoading(true);
      const response = await fetch('/api/study-analyzer/flashcards?dueOnly=true', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.cards.length > 0) {
          setFlashcards(data.data.cards);
          setCurrentFlashcard(data.data.cards[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    } finally {
      setFlashcardLoading(false);
    }
  };

  const handleFlashcardReview = async (quality: number) => {
    if (!currentFlashcard) return;
    
    try {
      const response = await fetch('/api/study-analyzer/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'review',
          cardId: currentFlashcard.id,
          quality
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Move to next card
          const currentIndex = flashcards.findIndex(c => c.id === currentFlashcard.id);
          if (currentIndex < flashcards.length - 1) {
            setCurrentFlashcard(flashcards[currentIndex + 1]);
          } else {
            // All cards reviewed, fetch new ones
            await fetchFlashcards();
          }
          setShowFlashcardAnswer(false);
        }
      }
    } catch (error) {
      console.error('Failed to review flashcard:', error);
    }
  };

  const handleLogSession = async () => {
    if (!sessionForm.startedAt) return;
    const start = new Date(sessionForm.startedAt);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + sessionForm.durationMinutes * 60 * 1000);

    setSessionSaving(true);
    try {
      const response = await fetch('/api/study-analyzer/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          session: {
            session_type: sessionForm.sessionType,
            material_type: sessionForm.materialType,
            started_at: start.toISOString(),
            ended_at: end.toISOString(),
            notes: sessionForm.notes || null,
            tags: sessionForm.tags
              ? sessionForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
              : null,
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.success) {
        await fetchStudySignals();
        setSessionForm((prev) => ({ ...prev, startedAt: '', notes: '', tags: '' }));
        trackEvent('study_session_logged', {
          session_type: sessionForm.sessionType,
          material_type: sessionForm.materialType,
          duration_minutes: sessionForm.durationMinutes,
        });
      } else {
        trackEvent('study_session_log_failed', {
          session_type: sessionForm.sessionType,
          reason: payload?.error || `status_${response.status}`,
        });
      }
    } catch (error) {
      console.error('Failed to log study session:', error);
      trackEvent('study_session_log_failed', {
        session_type: sessionForm.sessionType,
        reason: 'network_error',
      });
    } finally {
      setSessionSaving(false);
    }
  };

  const masteryAverage = useMemo(() => {
    if (masterySummary.length === 0) return 0;
    const total = masterySummary.reduce((sum, entry) => sum + entry.masteryLevel, 0);
    return total / masterySummary.length;
  }, [masterySummary]);

  const masteryLeader = useMemo(() => {
    if (masterySummary.length === 0) return null;
    return [...masterySummary].sort((a, b) => b.masteryLevel - a.masteryLevel)[0];
  }, [masterySummary]);

  const masteryNextFocus = useMemo(() => {
    if (masterySummary.length === 0) return null;
    return masterySummary.find(
      (entry) =>
        entry.recommendedNext &&
        Array.isArray(entry.recommendedNext.nextResources) &&
        entry.recommendedNext.nextResources.length > 0
    );
  }, [masterySummary]);

  const nextFocusResources = useMemo(() => {
    if (!masteryNextFocus?.recommendedNext?.nextResources) {
      return null;
    }
    if (!Array.isArray(masteryNextFocus.recommendedNext.nextResources)) {
      return null;
    }
    return masteryNextFocus.recommendedNext.nextResources as string[];
  }, [masteryNextFocus]);

  const masterySparkline = useMemo(() => {
    if (masterySummary.length === 0) return null;
    const sorted = [...masterySummary].sort((a, b) => {
      const aTime = a.lastAssessedAt ? new Date(a.lastAssessedAt).getTime() : 0;
      const bTime = b.lastAssessedAt ? new Date(b.lastAssessedAt).getTime() : 0;
      return aTime - bTime;
    });
    const recent = sorted.slice(-10);
    if (recent.length < 2) return null;
    const scores = recent.map((entry) => entry.masteryLevel);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min || 1;
    const points = recent
      .map((entry, index) => {
        const x = (index / (recent.length - 1)) * 100;
        const normalized = (entry.masteryLevel - min) / range;
        const y = 100 - normalized * 100;
        return `${x},${y}`;
      })
      .join(" ");
    return {
      points,
      min,
      max,
      firstLabel: recent[0]?.lastAssessedAt || null,
      lastLabel: recent[recent.length - 1]?.lastAssessedAt || null,
    };
  }, [masterySummary]);

  return (
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Study Analyzer"
          description={
            <>
              Monitor momentum, surface weak spots, and log sessions in seconds. For material uploads and plan generation,
              head over to{' '}
              <Link href="/dashboard/student/study" className="text-emerald-300 underline-offset-4 hover:underline">
                Study Workspace
              </Link>.
            </>
          }
          icon={<Brain className="w-8 h-8 text-emerald-400" />}
        />

        <PageContainer spacing="md">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1 bg-gradient-to-br from-emerald-900/40 to-cyan-900/30 border-emerald-500/40 shadow-lg hover:shadow-emerald-500/20 transition-all">
            <CardHeader>
              <CardTitle className="text-emerald-300 text-xl">Quick Session Logger</CardTitle>
              <CardDescription className="text-muted-foreground">Capture deep-work blocks so the analyzer stays accurate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Session Type</Label>
                  <Select
                    value={sessionForm.sessionType}
                    onValueChange={(value) => setSessionForm((prev) => ({ ...prev, sessionType: value }))}
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material Type</Label>
                  <Select
                    value={sessionForm.materialType}
                    onValueChange={(value) => setSessionForm((prev) => ({ ...prev, materialType: value }))}
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="lecture">Lecture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Started At</Label>
                  <Input
                    type="datetime-local"
                    value={sessionForm.startedAt}
                    onChange={(event) => setSessionForm((prev) => ({ ...prev, startedAt: event.target.value }))}
                    className="bg-card border-border"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={480}
                    value={sessionForm.durationMinutes}
                    onChange={(event) =>
                      setSessionForm((prev) => ({ ...prev, durationMinutes: parseInt(event.target.value, 10) || 0 }))
                    }
                    className="bg-card border-border"
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={sessionForm.notes}
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="bg-card border-border"
                  placeholder="Focus area, blockers, breakthroughs..."
                />
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={sessionForm.tags}
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, tags: event.target.value }))}
                  className="bg-card border-border"
                  placeholder="calculus, deep-work, exam"
                />
              </div>

              <Button
                onClick={handleLogSession}
                disabled={sessionSaving}
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:from-emerald-300 hover:to-cyan-300"
              >
                {sessionSaving ? (
                  <>
                    <Spinner size="sm" color="default" />
                    <span>Logging Session...</span>
                  </>
                ) : (
                  'Log Session'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-emerald-500/40 shadow-lg">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-emerald-300 text-xl">Live Study Signals</CardTitle>
                <CardDescription>These metrics refresh whenever you log a session or finish an ARK milestone.</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={fetchStudySignals} className="bg-card border-border">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </Button>
            </CardHeader>
            <CardContent>
              {signalsLoading ? (
                <div className="py-10 flex justify-center">
                  <Spinner size="lg" color="default" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Average Mastery</p>
                      <div className="flex items-end gap-2 mt-3">
                        <span className="text-3xl font-bold text-emerald-300">{masteryAverage.toFixed(0)}%</span>
                        <span className="text-xs text-muted-foreground mb-1">across tracked topics</span>
                      </div>
                      <Progress
                        value={masteryAverage}
                        className="mt-3 h-2 bg-emerald-500/10"
                        indicatorClassName="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                      />
                      {masterySparkline && (
                        <div className="mt-4">
                          <svg
                            className="h-16 w-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <defs>
                              <linearGradient id="masterySparkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                              </linearGradient>
                            </defs>
                            <polyline
                              fill="none"
                              stroke="url(#masterySparkGradient)"
                              strokeWidth="2"
                              points={masterySparkline.points}
                            />
                            <polyline
                              points={`0,100 ${masterySparkline.points} 100,100`}
                              fill="url(#masterySparkGradient)"
                              opacity="0.2"
                            />
                          </svg>
                          <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wide">
                            <span>{masterySparkline.firstLabel ? new Date(masterySparkline.firstLabel).toLocaleDateString() : "Start"}</span>
                            <span>{masterySparkline.lastLabel ? new Date(masterySparkline.lastLabel).toLocaleDateString() : "Latest"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Top Mastery</p>
                      {masteryLeader ? (
                        <>
                          <p className="text-sm text-foreground font-semibold mt-2 break-words">
                            {masteryLeader.topicName || masteryLeader.topicId}
                          </p>
                          <p className="text-lg text-emerald-300 font-bold mt-1">
                            {Math.round(masteryLeader.masteryLevel)}%
                          </p>
                          {masteryLeader.lastAssessedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last assessed {new Date(masteryLeader.lastAssessedAt).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-3">Log sessions to unlock mastery insights.</p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Next Focus</p>
                      {masteryNextFocus ? (
                        <>
                          <p className="text-sm text-foreground font-semibold mt-2 break-words">
                            {masteryNextFocus.topicName || masteryNextFocus.topicId}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">Suggested next steps:</p>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                            {Array.isArray(nextFocusResources) && nextFocusResources.length > 0 ? (
                              nextFocusResources.slice(0, 3).map((resource, idx) => (
                                <li key={`${resource}-${idx}`}>• {resource}</li>
                              ))
                            ) : (
                              <li>• Review related resources</li>
                            )}
                          </ul>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-3">Complete ARK checkpoints to unlock AI guidance.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        Learning Path Highlights
                      </h3>
                      {learningPath.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No learning nodes yet—complete Study Workspace to seed your path.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {/* Learning Path Timeline */}
                          <div className="relative pl-6 space-y-4">
                            {learningPath.slice(0, 6).map((node, idx) => (
                              <div key={node.id} className="relative">
                                {/* Timeline connector */}
                                {idx < learningPath.slice(0, 6).length - 1 && (
                                  <div className="absolute left-[9px] top-8 bottom-[-16px] w-0.5 bg-gradient-to-b from-emerald-400/50 to-transparent" />
                                )}
                                
                                {/* Timeline dot */}
                                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-2 border-border" />
                                
                                {/* Node card */}
                                <div className="p-4 rounded-lg bg-card border border-border hover:border-emerald-500/30 transition-all">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-foreground text-sm font-semibold break-words">
                                      {node.topic_name || node.topic_id}
                                    </span>
                                    <Badge className={`${
                                      node.mastery_level >= 80 ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' :
                                      node.mastery_level >= 50 ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40' :
                                      'bg-blue-500/20 text-blue-200 border-blue-500/40'
                                    }`}>
                                      {Math.round(node.mastery_level)}% mastery
                                    </Badge>
                                  </div>
                                  <Progress
                                    value={node.mastery_level}
                                    className="h-2 bg-card mb-2"
                                    indicatorClassName={`${
                                      node.mastery_level >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                      node.mastery_level >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                      'bg-gradient-to-r from-blue-400 to-cyan-400'
                                    }`}
                                  />
                                  {node.recommended_next?.nextResources && (
                                    <div className="mt-2">
                                      <p className="text-xs text-muted-foreground mb-1">Recommended next steps:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {Array.isArray(node.recommended_next.nextResources) && node.recommended_next.nextResources.slice(0, 3).map((resource: string, rIdx: number) => (
                                          <Badge key={rIdx} variant="outline" className="text-xs border-border text-muted-foreground">
                                            {resource}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {learningPath.length > 6 && (
                            <p className="text-xs text-muted-foreground text-center">
                              + {learningPath.length - 6} more topics in your learning path
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          AI Content Recommendations
                        </h3>
                        {studyRecommendations.length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            You&apos;re caught up. New resources will appear once more data comes in.
                          </p>
                        ) : (
                          <div className="relative">
                            {/* Carousel */}
                            <div className="relative overflow-hidden rounded-lg bg-card border border-emerald-500/30">
                              {studyRecommendations.slice(recommendationIndex, recommendationIndex + 1).map((rec) => {
                                const getResourceIcon = () => {
                                  const type = (rec.resource_type || '').toLowerCase();
                                  if (type.includes('video') || type.includes('youtube')) return <Video className="w-5 h-5" />;
                                  if (type.includes('article') || type.includes('paper')) return <FileText className="w-5 h-5" />;
                                  if (type.includes('book') || type.includes('course')) return <BookOpen className="w-5 h-5" />;
                                  return <Sparkles className="w-5 h-5" />;
                                };

                                const getResourceColor = () => {
                                  const type = (rec.resource_type || '').toLowerCase();
                                  if (type.includes('video')) return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
                                  if (type.includes('article')) return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
                                  if (type.includes('book')) return 'from-orange-500/20 to-amber-500/20 border-orange-500/30';
                                  return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
                                };

                                return (
                                  <div key={rec.id} className={`p-4 bg-gradient-to-br ${getResourceColor()}`}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-card/50 text-emerald-300">
                                          {getResourceIcon()}
                                        </div>
                                        <div>
                                          <span className="text-foreground text-sm font-semibold capitalize">
                                            {rec.resource_type || 'Resource'}
                                          </span>
                                          {rec.source && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                              {rec.source === 'semantic_scholar' ? 'Academic Paper' : rec.source === 'youtube' ? 'Video' : rec.source}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {rec.score !== undefined && (
                                        <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40">
                                          {(rec.score * 100).toFixed(0)}% match
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                      {rec.feedback_notes || rec.metadata?.summary || 'AI recommends this resource based on your learning path.'}
                                    </p>
                                    {rec.metadata?.url && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                                      >
                                        <a href={rec.metadata.url} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="w-3 h-3 mr-2" />
                                          Open Resource
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Carousel Navigation */}
                            {studyRecommendations.length > 1 && (
                              <div className="flex items-center justify-between mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRecommendationIndex((prev) => (prev > 0 ? prev - 1 : studyRecommendations.length - 1))}
                                  className="border-border text-muted-foreground hover:text-foreground"
                                >
                                  <ChevronLeft className="w-4 h-4 mr-1" />
                                  Previous
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  {recommendationIndex + 1} / {studyRecommendations.length}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRecommendationIndex((prev) => (prev < studyRecommendations.length - 1 ? prev + 1 : 0))}
                                  className="border-border text-muted-foreground hover:text-foreground"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-300" />
                          Spaced Repetition Queue
                        </h3>
                        {queueItems.length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            No cards due. Keep practicing to build your memory streaks.
                          </p>
                        ) : (
                          queueItems.slice(0, 4).map((card) => (
                            <div key={card.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                              <div>
                                <p className="text-sm text-foreground font-medium break-words">{card.card_identifier}</p>
                                <p className="text-xs text-muted-foreground">
                                  Due {new Date(card.due_at).toLocaleString()} • Interval {card.interval_days}d
                                </p>
                              </div>
                              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                                Streak {card.success_streak}
                              </Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adaptive Learning Path */}
          {adaptivePath && (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-400" />
                  Adaptive Learning Path
                </CardTitle>
                <CardDescription>
                  Personalized path based on your learning style: {adaptivePath.learningStyle || 'mixed'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pathLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" color="default" />
                  </div>
                ) : adaptivePath.path ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-card/50 border border-purple-500/30">
                        <p className="text-muted-foreground text-xs mb-1">Nodes</p>
                        <p className="text-foreground font-semibold">{adaptivePath.path.nodes.length}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-card/50 border border-purple-500/30">
                        <p className="text-muted-foreground text-xs mb-1">Est. Completion</p>
                        <p className="text-foreground font-semibold text-xs">
                          {new Date(adaptivePath.path.estimatedCompletion).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {adaptivePath.path.nodes.slice(0, 5).map((node: any, idx: number) => (
                        <div key={node.id} className="p-3 rounded-lg bg-card/50 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-foreground text-sm font-semibold">{node.topic}</span>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 capitalize">
                              {node.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{node.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{node.estimatedTime} min</span>
                            {node.prerequisites.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{node.prerequisites.length} prerequisites</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {adaptivePath.path.recommendedNext.length > 0 && (
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs text-blue-400 font-semibold mb-2">Recommended Next</p>
                        <div className="flex flex-wrap gap-2">
                          {adaptivePath.path.recommendedNext.slice(0, 3).map((nodeId: string) => {
                            const node = adaptivePath.path.nodes.find((n: any) => n.id === nodeId);
                            return node ? (
                              <Badge key={nodeId} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                {node.topic}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Generate an adaptive learning path to get started
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Flashcard Review */}
          {currentFlashcard && (
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  Flashcard Review
                </CardTitle>
                <CardDescription>
                  {flashcards.length} cards due for review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-6 rounded-lg bg-card/50 border border-cyan-500/30 min-h-[200px] flex flex-col justify-center">
                    <div className="text-center mb-4">
                      <p className="text-muted-foreground text-sm mb-2">Question</p>
                      <p className="text-foreground text-lg font-semibold">{currentFlashcard.front}</p>
                    </div>
                    
                    {showFlashcardAnswer && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-muted-foreground text-sm mb-2">Answer</p>
                        <p className="text-cyan-300 text-base">{currentFlashcard.back}</p>
                      </div>
                    )}
                  </div>
                  
                  {!showFlashcardAnswer ? (
                    <Button
                      onClick={() => setShowFlashcardAnswer(true)}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-foreground"
                    >
                      Show Answer
                    </Button>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4, 5].map(quality => (
                        <Button
                          key={quality}
                          onClick={() => handleFlashcardReview(quality)}
                          variant="outline"
                          size="sm"
                          className={
                            quality === 0 ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' :
                            quality <= 2 ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10' :
                            quality === 3 ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10' :
                            quality === 4 ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' :
                            'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                          }
                        >
                          {quality}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-center text-xs text-muted-foreground">
                    <p>Quality: 0=Blackout, 1-2=Incorrect, 3=Hard, 4=Good, 5=Perfect</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Content Recommendations */}
          <div className="xl:col-span-3">
            <ContentRecommendations 
              autoLoad={false}
            />
          </div>
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}
