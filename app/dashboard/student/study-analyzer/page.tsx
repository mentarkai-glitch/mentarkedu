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

export default function StudyAnalyzerPage() {
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<LearningPathNode[]>([]);
  const [studyRecommendations, setStudyRecommendations] = useState<ContentRecommendation[]>([]);
  const [queueItems, setQueueItems] = useState<SpacedRepetitionQueueItem[]>([]);
  const [masterySummary, setMasterySummary] = useState<StudyPathProgressEntry[]>([]);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [recommendationIndex, setRecommendationIndex] = useState(0);
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
  }, [fetchStudySignals]);

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
    <div className="min-h-screen bg-black p-3 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30">
            <Brain className="w-7 h-7 sm:w-9 sm:h-9 text-emerald-300" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Study Analyzer
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Monitor momentum, surface weak spots, and log sessions in seconds. For material uploads and plan generation,
              head over to{' '}
              <Link href="/dashboard/student/study" className="text-emerald-300 underline-offset-4 hover:underline">
                Study Workspace
              </Link>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1 bg-slate-900/70 border border-emerald-500/20">
            <CardHeader>
              <CardTitle>Quick Session Logger</CardTitle>
              <CardDescription>Capture deep-work blocks so the analyzer stays accurate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Session Type</Label>
                  <Select
                    value={sessionForm.sessionType}
                    onValueChange={(value) => setSessionForm((prev) => ({ ...prev, sessionType: value }))}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
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
                    <SelectTrigger className="bg-slate-900 border-slate-700">
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
                    className="bg-slate-900 border-slate-700"
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
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={sessionForm.notes}
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="bg-slate-900 border-slate-700"
                  placeholder="Focus area, blockers, breakthroughs..."
                />
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={sessionForm.tags}
                  onChange={(event) => setSessionForm((prev) => ({ ...prev, tags: event.target.value }))}
                  className="bg-slate-900 border-slate-700"
                  placeholder="calculus, deep-work, exam"
                />
              </div>

              <Button
                onClick={handleLogSession}
                disabled={sessionSaving}
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold hover:from-emerald-300 hover:to-cyan-300"
              >
                {sessionSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Log Session
              </Button>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2 bg-slate-900/70 border border-emerald-500/20">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Live Study Signals</CardTitle>
                <CardDescription>These metrics refresh whenever you log a session or finish an ARK milestone.</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={fetchStudySignals} className="bg-slate-900 border-slate-700">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </Button>
            </CardHeader>
            <CardContent>
              {signalsLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-300" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Average Mastery</p>
                      <div className="flex items-end gap-2 mt-3">
                        <span className="text-3xl font-bold text-emerald-300">{masteryAverage.toFixed(0)}%</span>
                        <span className="text-xs text-slate-500 mb-1">across tracked topics</span>
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
                          <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide">
                            <span>{masterySparkline.firstLabel ? new Date(masterySparkline.firstLabel).toLocaleDateString() : "Start"}</span>
                            <span>{masterySparkline.lastLabel ? new Date(masterySparkline.lastLabel).toLocaleDateString() : "Latest"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Top Mastery</p>
                      {masteryLeader ? (
                        <>
                          <p className="text-sm text-white font-semibold mt-2 break-words">
                            {masteryLeader.topicName || masteryLeader.topicId}
                          </p>
                          <p className="text-lg text-emerald-300 font-bold mt-1">
                            {Math.round(masteryLeader.masteryLevel)}%
                          </p>
                          {masteryLeader.lastAssessedAt && (
                            <p className="text-xs text-slate-500 mt-1">
                              Last assessed {new Date(masteryLeader.lastAssessedAt).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-slate-500 mt-3">Log sessions to unlock mastery insights.</p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Next Focus</p>
                      {masteryNextFocus ? (
                        <>
                          <p className="text-sm text-white font-semibold mt-2 break-words">
                            {masteryNextFocus.topicName || masteryNextFocus.topicId}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">Suggested next steps:</p>
                          <ul className="text-xs text-slate-300 mt-1 space-y-1">
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
                        <p className="text-sm text-slate-500 mt-3">Complete ARK checkpoints to unlock AI guidance.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-300" />
                        Learning Path Highlights
                      </h3>
                      {learningPath.length === 0 ? (
                        <p className="text-slate-500 text-sm">
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
                                <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-2 border-slate-900" />
                                
                                {/* Node card */}
                                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-white text-sm font-semibold break-words">
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
                                    className="h-2 bg-slate-800 mb-2"
                                    indicatorClassName={`${
                                      node.mastery_level >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                      node.mastery_level >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                      'bg-gradient-to-r from-blue-400 to-cyan-400'
                                    }`}
                                  />
                                  {node.recommended_next?.nextResources && (
                                    <div className="mt-2">
                                      <p className="text-xs text-slate-400 mb-1">Recommended next steps:</p>
                                      <div className="flex flex-wrap gap-1">
                                        {Array.isArray(node.recommended_next.nextResources) && node.recommended_next.nextResources.slice(0, 3).map((resource: string, rIdx: number) => (
                                          <Badge key={rIdx} variant="outline" className="text-xs border-slate-700 text-slate-300">
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
                            <p className="text-xs text-slate-500 text-center">
                              + {learningPath.length - 6} more topics in your learning path
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          AI Content Recommendations
                        </h3>
                        {studyRecommendations.length === 0 ? (
                          <p className="text-slate-500 text-sm">
                            You&apos;re caught up. New resources will appear once more data comes in.
                          </p>
                        ) : (
                          <div className="relative">
                            {/* Carousel */}
                            <div className="relative overflow-hidden rounded-lg bg-slate-900 border border-emerald-500/30">
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
                                        <div className="p-2 rounded-lg bg-slate-900/50 text-emerald-300">
                                          {getResourceIcon()}
                                        </div>
                                        <div>
                                          <span className="text-white text-sm font-semibold capitalize">
                                            {rec.resource_type || 'Resource'}
                                          </span>
                                          {rec.source && (
                                            <p className="text-xs text-slate-400 mt-0.5">
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
                                    <p className="text-sm text-slate-200 mb-3 line-clamp-2">
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
                                  className="border-slate-700 text-slate-400 hover:text-white"
                                >
                                  <ChevronLeft className="w-4 h-4 mr-1" />
                                  Previous
                                </Button>
                                <span className="text-xs text-slate-500">
                                  {recommendationIndex + 1} / {studyRecommendations.length}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setRecommendationIndex((prev) => (prev < studyRecommendations.length - 1 ? prev + 1 : 0))}
                                  className="border-slate-700 text-slate-400 hover:text-white"
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
                        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-300" />
                          Spaced Repetition Queue
                        </h3>
                        {queueItems.length === 0 ? (
                          <p className="text-slate-500 text-sm">
                            No cards due. Keep practicing to build your memory streaks.
                          </p>
                        ) : (
                          queueItems.slice(0, 4).map((card) => (
                            <div key={card.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg">
                              <div>
                                <p className="text-sm text-white font-medium break-words">{card.card_identifier}</p>
                                <p className="text-xs text-slate-400">
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
        </div>
      </div>
    </div>
  );
}
