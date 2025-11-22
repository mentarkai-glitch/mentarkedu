"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  TrendingUp,
  Flame,
  Trophy,
  Target,
  BookOpen,
  Sparkles,
  Zap,
  Rocket,
  ArrowRight,
  Plus,
  ListChecks,
  Brain,
  Link2,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/services/analytics";
import { motion } from 'framer-motion';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/ui/card/card-variants';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface AgendaItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  start_at: string | null;
  end_at: string | null;
  energy_target: string | null;
  priority: number;
  status: string;
  source: string;
}

interface AgendaDependency {
  agenda_item_id: string;
  depends_on_item_id: string;
  dependency_type: string;
}

interface EnergyBand {
  band: string;
  score: number;
}

interface ProductivityRow {
  student_id: string;
  metric_date: string;
  agenda_items: number;
  planned_minutes_calc: number | null;
  planned_minutes: number | null;
  actual_minutes: number | null;
  deep_work_minutes: number | null;
  context_switches: number | null;
}

interface DailyStats {
  tasksCompleted: number;
  totalTasks: number;
  hoursSpent: number;
  hoursPlanned: number;
  streaks: number;
  energyByBand: Record<string, number>;
}

interface LearningPathNodeMini {
  topicId: string;
  topicName: string;
  masteryLevel: number;
  recommendedNext?: {
    nextResources?: string[];
    [key: string]: unknown;
  } | null;
}

interface RecommendationItem {
  id: string;
  resource_id?: string;
  resource_type?: string;
  source?: string;
  score?: number;
  presented_at: string;
  action?: string;
  feedback_notes?: string;
  metadata?: Record<string, unknown>;
}

interface QueueItem {
  id: string;
  card_identifier: string;
  origin: string;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  success_streak: number;
  last_reviewed_at?: string;
}

export default function DailyAssistantPage() {
  const [today] = useState(new Date());
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [dependencies, setDependencies] = useState<AgendaDependency[]>([]);
  const [energyBands, setEnergyBands] = useState<EnergyBand[]>([]);
  const [productivityRows, setProductivityRows] = useState<ProductivityRow[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPathNodeMini[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    hoursSpent: 0,
    hoursPlanned: 0,
    streaks: 0,
    energyByBand: {},
  });
  const [loading, setLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [productivityInsights, setProductivityInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [smartScheduleLoading, setSmartScheduleLoading] = useState(false);
  const [smartScheduleResult, setSmartScheduleResult] = useState<any>(null);
  const hasTrackedLoad = useRef(false);

  useEffect(() => {
    fetchDailyData();
    checkCalendarStatus();
    fetchProductivityInsights();

    // Check for OAuth callback parameters
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const calendarConnected = params.get("calendar_connected");
      const error = params.get("error");

      if (calendarConnected === "true") {
        // Calendar successfully connected
        setCalendarConnected(true);
        fetchCalendarEvents();
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      } else if (error) {
        console.error("Calendar connection error:", error);
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const response = await fetch("/api/calendar/google/status");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCalendarConnected(data.data.connected);
          if (data.data.connected) {
            fetchCalendarEvents();
          }
        }
      }
    } catch (error) {
      console.error("Failed to check calendar status:", error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

      const response = await fetch(
        `/api/calendar/google/events?timeMin=${startOfDay}&timeMax=${endOfDay}&maxResults=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCalendarEvents(data.data.events || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      setCalendarLoading(true);
      const response = await fetch("/api/calendar/google/connect");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.auth_url) {
          // Redirect to Google OAuth
          window.location.href = data.data.auth_url;
        }
      }
    } catch (error) {
      console.error("Failed to initiate calendar connection:", error);
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchProductivityInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await fetch("/api/daily-assistant/productivity-insights?days=7");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProductivityInsights(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch productivity insights:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleSmartSchedule = async () => {
    try {
      setSmartScheduleLoading(true);
      
      // Convert agenda items to tasks format
      const tasks = agendaItems
        .filter(item => item.status !== 'completed')
        .map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || undefined,
          estimatedMinutes: item.start_at && item.end_at
            ? Math.round((new Date(item.end_at).getTime() - new Date(item.start_at).getTime()) / (1000 * 60))
            : 60,
          priority: item.priority || 3,
          energyRequired: (item.energy_target || 'medium') as 'low' | 'medium' | 'high',
          category: item.category || 'general',
          dependencies: dependencies
            .filter(dep => dep.agenda_item_id === item.id)
            .map(dep => dep.depends_on_item_id),
          flexible: true
        }));

      const response = await fetch("/api/daily-assistant/smart-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          date: today.toISOString(),
          existingEvents: calendarEvents.map(evt => ({
            start: evt.start?.dateTime || evt.start?.date,
            end: evt.end?.dateTime || evt.end?.date
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSmartScheduleResult(data.data);
          trackEvent("smart_schedule_generated", {
            tasks_scheduled: data.data.timeBlocks.length,
            conflicts: data.data.conflicts.length
          });
        }
      }
    } catch (error) {
      console.error("Failed to generate smart schedule:", error);
    } finally {
      setSmartScheduleLoading(false);
    }
  };

  const fetchDailyData = async () => {
    try {
      setLoading(true);

      const [agendaRes, insightsRes, studyRes] = await Promise.all([
        fetch("/api/daily-assistant/agenda"),
        fetch("/api/daily-assistant/insights?days=14"),
        fetch("/api/study-analyzer/recommendations"),
      ]);

      let agendaJson: any = null;
      let insightsJson: any = null;
      let studyJson: any = null;

      if (agendaRes.ok) {
        agendaJson = await agendaRes.json();
        if (agendaJson.success) {
          setAgendaItems(agendaJson.data.items || []);
          setDependencies(agendaJson.data.dependencies || []);
        }
      }

      if (insightsRes.ok) {
        insightsJson = await insightsRes.json();
        if (insightsJson.success) {
          setEnergyBands(insightsJson.data.energy_bands || []);
          setProductivityRows(insightsJson.data.productivity || []);
        }
      }

      if (studyRes.ok) {
        studyJson = await studyRes.json();
        if (studyJson.success) {
          setLearningPath(studyJson.data.learning_path || []);
          setRecommendations(studyJson.data.recommendations || []);
          setQueueItems(studyJson.data.spaced_repetition_queue || []);
        }
      }

      if (!hasTrackedLoad.current && agendaJson?.success) {
        trackEvent("daily_assistant_loaded", {
          agenda_items: agendaJson?.data?.items?.length ?? 0,
          energy_bands: insightsJson?.data?.energy_bands?.length ?? 0,
          recommendations: studyJson?.data?.recommendations?.length ?? 0,
        });
        hasTrackedLoad.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch daily data:", error);
      trackEvent("daily_assistant_load_failed", {
        message: error instanceof Error ? error.message : "unknown_error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    computeStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendaItems, productivityRows, energyBands]);

  const computeStats = (
    items: AgendaItem[] = agendaItems,
    productivity: ProductivityRow[] = productivityRows,
    energy: EnergyBand[] = energyBands
  ) => {
    const completed = items.filter((item) => item.status === "completed").length;
    const total = items.length;

    const plannedMinutes =
      productivity.length > 0
        ? productivity[0].planned_minutes ??
          productivity[0].planned_minutes_calc ??
          (items.length * 30)
        : items.length * 30;

    const actualMinutes =
      productivity.length > 0
        ? productivity[0].actual_minutes ?? completed * 30
        : completed * 30;

    const bandScores: Record<string, number> = {};
    energy.forEach((band) => {
      bandScores[band.band] = Number(band.score.toFixed(2));
    });

    setStats({
      tasksCompleted: completed,
      totalTasks: total,
      hoursSpent: Number((actualMinutes / 60).toFixed(1)),
      hoursPlanned: Number((plannedMinutes / 60).toFixed(1)),
      streaks: 0,
      energyByBand: bandScores,
    });
  };

  const handleToggleStatus = async (item: AgendaItem) => {
    const nextStatus = item.status === "completed" ? "planned" : "completed";
    try {
      const response = await fetch("/api/daily-assistant/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: {
            ...item,
            status: nextStatus,
          },
        }),
      });

      if (response.ok) {
        const updatedItems = agendaItems.map((agenda) =>
          agenda.id === item.id ? { ...agenda, status: nextStatus } : agenda
        );
        setAgendaItems(updatedItems);
      }
    } catch (error) {
      console.error("Failed to update agenda item status:", error);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }
    if (priority === 2) {
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    }
    if (priority === 3) {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
    return "bg-card/20 text-muted-foreground border-border/30";
  };

  const sortedAgenda = [...agendaItems].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  const dependencyMap = dependencies.reduce<Record<string, AgendaDependency[]>>((acc, dep) => {
    acc[dep.agenda_item_id] = acc[dep.agenda_item_id] || [];
    acc[dep.agenda_item_id].push(dep);
    return acc;
  }, {});

  const completionRate = stats.totalTasks > 0 ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0;
  const energyBandEntries = Object.entries(stats.energyByBand);

  if (loading) {
    return (
      <PageLayout containerWidth="wide" padding="desktop">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="xl" color="gold" />
            <p className="text-foreground mt-4">Loading your daily tasks...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout containerWidth="wide" padding="desktop">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Daily Assistant"
          description={new Date(today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          icon={<Calendar className="w-8 h-8 text-yellow-400" />}
        />

        <PageContainer spacing="md">
        {/* Calendar Connection Card */}
        <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/30 border-blue-500/40 shadow-lg hover:shadow-blue-500/20 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl border border-blue-500/50 shadow-blue-500/20">
                  <Calendar className="w-7 h-7 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg">Google Calendar</h3>
                  <p className="text-muted-foreground text-sm">
                    {calendarConnected
                      ? "Connected - Your calendar events will sync here"
                      : "Connect your Google Calendar to sync events and tasks"}
                  </p>
                </div>
              </div>
              {calendarConnected ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCalendarEvents}
                    disabled={calendarLoading}
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  >
                    {calendarLoading ? (
                      <Spinner size="sm" color="default" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectCalendar}
                  disabled={calendarLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-foreground"
                >
                  {calendarLoading ? (
                    <>
                      <Spinner size="sm" color="default" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect Calendar
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calendar Events */}
        {calendarConnected && calendarEvents.length > 0 && (
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                Today&apos;s Calendar Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calendarEvents.map((event: any) => {
                  const start = event.start?.dateTime
                    ? new Date(event.start.dateTime)
                    : event.start?.date
                    ? new Date(event.start.date)
                    : null;
                  const end = event.end?.dateTime
                    ? new Date(event.end.dateTime)
                    : event.end?.date
                    ? new Date(event.end.date)
                    : null;

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-blue-500/30 hover:border-blue-500/50 transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground font-semibold mb-1">{event.summary || "No title"}</h4>
                        {event.description && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{event.description}</p>
                        )}
                        {start && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {start.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {end && ` - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                              </span>
                            </div>
                            {event.location && (
                              <span className="text-muted-foreground">📍 {event.location}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {event.htmlLink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Scheduling & Productivity Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Schedule */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                AI Smart Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Let AI optimize your schedule based on your energy levels, task priorities, and dependencies.
              </p>
              <Button
                onClick={handleSmartSchedule}
                disabled={smartScheduleLoading || agendaItems.filter(i => i.status !== 'completed').length === 0}
                className="w-full bg-purple-500 hover:bg-purple-600 text-foreground"
              >
                {smartScheduleLoading ? (
                  <>
                    <Spinner size="sm" color="default" />
                    Optimizing Schedule...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Smart Schedule
                  </>
                )}
              </Button>
              
              {smartScheduleResult && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-card/50 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Scheduled Tasks</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {smartScheduleResult.timeBlocks.length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Time Blocked: {Math.round(smartScheduleResult.totalScheduledMinutes / 60)}h</span>
                      <span>Available: {Math.round(smartScheduleResult.totalAvailableMinutes / 60)}h</span>
                    </div>
                  </div>
                  
                  {smartScheduleResult.conflicts.length > 0 && (
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <p className="text-sm text-orange-400 font-semibold mb-2">⚠️ Conflicts</p>
                      <ul className="text-xs text-orange-300 space-y-1">
                        {smartScheduleResult.conflicts.slice(0, 3).map((conflict: string, idx: number) => (
                          <li key={idx}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {smartScheduleResult.recommendations.length > 0 && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-sm text-blue-400 font-semibold mb-2">💡 Recommendations</p>
                      <ul className="text-xs text-blue-300 space-y-1">
                        {smartScheduleResult.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-card/50">
                      <p className="text-muted-foreground">Morning</p>
                      <p className="text-foreground font-semibold">{smartScheduleResult.energyOptimization.morningTasks} tasks</p>
                    </div>
                    <div className="p-2 rounded bg-card/50">
                      <p className="text-muted-foreground">Afternoon</p>
                      <p className="text-foreground font-semibold">{smartScheduleResult.energyOptimization.afternoonTasks} tasks</p>
                    </div>
                    <div className="p-2 rounded bg-card/50">
                      <p className="text-muted-foreground">Evening</p>
                      <p className="text-foreground font-semibold">{smartScheduleResult.energyOptimization.eveningTasks} tasks</p>
                    </div>
                    <div className="p-2 rounded bg-card/50">
                      <p className="text-muted-foreground">Night</p>
                      <p className="text-foreground font-semibold">{smartScheduleResult.energyOptimization.nightTasks} tasks</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productivity Insights */}
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
                Productivity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="lg" color="default" />
                </div>
              ) : productivityInsights ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-card/50 border border-cyan-500/30">
                      <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {(productivityInsights.insights.completionRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/50 border border-cyan-500/30">
                      <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {(productivityInsights.insights.efficiency * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-card/50 border border-cyan-500/30">
                    <p className="text-xs text-muted-foreground mb-2">Energy Trend</p>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        productivityInsights.insights.energyTrend === 'improving'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : productivityInsights.insights.energyTrend === 'declining'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }>
                        {productivityInsights.insights.energyTrend === 'improving' ? '📈' : 
                         productivityInsights.insights.energyTrend === 'declining' ? '📉' : '➡️'} 
                        {productivityInsights.insights.energyTrend}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Avg: {productivityInsights.insights.avgEnergy}/5
                      </span>
                    </div>
                  </div>
                  
                  {productivityInsights.aiRecommendations && productivityInsights.aiRecommendations.length > 0 && (
                    <div className="p-3 rounded-lg bg-card/50 border border-cyan-500/30">
                      <p className="text-xs text-cyan-400 font-semibold mb-2">AI Recommendations</p>
                      <ul className="space-y-1">
                        {productivityInsights.aiRecommendations.slice(0, 3).map((rec: string, idx: number) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchProductivityInsights}
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Insights
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Complete tasks to see productivity insights
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-foreground">{stats.tasksCompleted}/{stats.totalTasks}</span>
              </div>
              <p className="text-muted-foreground text-sm">Tasks Completed</p>
              <Progress value={completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-foreground">{stats.hoursSpent.toFixed(1)}h</span>
              </div>
              <p className="text-muted-foreground text-sm">Time Spent</p>
              <p className="text-muted-foreground text-xs mt-1">of {stats.hoursPlanned.toFixed(1)}h planned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold text-foreground">{stats.streaks}</span>
              </div>
              <p className="text-muted-foreground text-sm">Day Streak</p>
              <p className="text-muted-foreground text-xs mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-foreground">{Math.round(completionRate)}%</span>
              </div>
              <p className="text-muted-foreground text-sm">Completion Rate</p>
              <p className="text-muted-foreground text-xs mt-1">Today&apos;s progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Energy Insights */}
        {energyBandEntries.length > 0 && (
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-300" />
                Energy Insights (last 7 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {energyBandEntries.map(([band, score]) => (
                <div key={band} className="p-4 rounded-lg bg-card/60 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-foreground font-semibold capitalize">{band}</h4>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                      {Number(score).toFixed(1)}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, Math.max(0, Number(score) * 20))} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Today&apos;s Tasks */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-yellow-400" />
              Today&apos;s Tasks
              {sortedAgenda.filter((item) => item.status !== "completed").length > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-2">
                  {sortedAgenda.filter((item) => item.status !== "completed").length} remaining
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedAgenda.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No tasks scheduled for today!</p>
                <p className="text-muted-foreground text-sm">Check back later or explore your ARKs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAgenda.map((item) => {
                  const start = item.start_at ? new Date(item.start_at) : null;
                  const end = item.end_at ? new Date(item.end_at) : null;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                        item.status === "completed"
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-card/50 border-border hover:border-yellow-500/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        item.status === "completed"
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-card text-muted-foreground'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold ${
                              item.status === "completed" ? 'text-green-400 line-through' : 'text-foreground'
                            }`}>
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                            )}
                            {dependencyMap[item.id] && dependencyMap[item.id].length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Depends on {dependencyMap[item.id].length} task
                                {dependencyMap[item.id].length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <Badge className={getPriorityColor(item.priority ?? 0)}>
                            Priority {item.priority ?? 0}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {start && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {end ? ` - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                              </span>
                            </div>
                          )}
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 capitalize">
                            {item.energy_target ?? "unspecified"}
                          </Badge>
                          <Badge className="bg-card text-muted-foreground border-border capitalize">
                            {item.source}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(item)}
                        className={item.status === "completed" ? 'text-green-400' : 'text-muted-foreground'}
                      >
                        {item.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Path Progress */}
        {learningPath.length > 0 && (
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Rocket className="w-6 h-6 text-yellow-400" />
                Learning Path Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningPath.map((node) => (
                  <div key={node.topicId} className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border hover:border-yellow-500/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground font-semibold mb-1">{node.topicName}</h4>
                      <Progress value={node.masteryLevel} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{Math.round(node.masteryLevel)}% mastery</p>
                      {node.recommendedNext?.nextResources && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Next: {node.recommendedNext.nextResources.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations & Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Complete more study sessions to unlock tailored recommendations.
                </p>
              ) : (
                recommendations.slice(0, 3).map((rec) => {
                  const summaryText =
                    typeof rec.metadata?.summary === "string" ? rec.metadata.summary : undefined;
                  const recommendationCopy =
                    rec.feedback_notes || summaryText || "AI recommends reviewing this resource today.";

                  return (
                    <div key={rec.id} className="p-4 rounded-lg bg-card/50 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-foreground font-semibold capitalize">
                          {rec.resource_type || "Resource"}
                        </h4>
                        {rec.score !== undefined && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Score {(rec.score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendationCopy}</p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                Spaced Repetition Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {queueItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  You&apos;re all caught up. Reviewed cards will show up here when they are due again.
                </p>
              ) : (
                queueItems.slice(0, 4).map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-3 bg-card/40 border border-blue-500/30 rounded-lg">
                    <div>
                      <p className="text-sm text-foreground font-medium">{card.card_identifier}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(card.due_at).toLocaleString()} • Interval {card.interval_days}d
                      </p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      Streak {card.success_streak}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks Preview */}
        {sortedAgenda.filter((item) => item.status !== "completed").length > 0 && (
          <Card className="bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-yellow-400" />
                Next Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedAgenda
                  .filter((item) => item.status !== "completed")
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-semibold">{item.title}</p>
                        {item.description && (
                          <p className="text-muted-foreground text-xs">{item.description}</p>
                        )}
                      </div>
                      <Badge className={getPriorityColor(item.priority ?? 0)}>
                        Priority {item.priority ?? 0}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}
