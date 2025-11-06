"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  TrendingUp,
  Flame,
  Trophy,
  Target,
  BookOpen,
  Brain,
  Award,
  AlertCircle,
  Sparkles,
  Coffee,
  Moon,
  Sun,
  Zap,
  Rocket,
  ArrowRight,
  ChevronRight,
  Bell,
  BellOff,
  Check,
  RefreshCw
} from "lucide-react";

interface DailyTask {
  id: string;
  task_title: string;
  task_description?: string;
  task_type: string;
  task_date: string;
  is_completed: boolean;
  estimated_hours: number;
  priority: string;
  ark_title?: string;
  milestone_title?: string;
}

interface ARKProgress {
  ark_id: string;
  title: string;
  progress: number;
  next_milestone?: string;
}

interface DailyStats {
  tasksCompleted: number;
  totalTasks: number;
  hoursSpent: number;
  hoursPlanned: number;
  streaks: number;
  motivation_level?: number;
  energy_level?: number;
}

export default function DailyAssistantPage() {
  const [today, setToday] = useState(new Date());
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activeARKs, setActiveARKs] = useState<ARKProgress[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    hoursSpent: 0,
    hoursPlanned: 0,
    streaks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyData();
  }, [today]);

  const fetchDailyData = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch today's tasks
      const todayStr = today.toISOString().split('T')[0];
      const { data: tasksData } = await supabase
        .from('ark_timeline')
        .select(`
          *,
          arks!inner(id, title),
          ark_milestones(id, title)
        `)
        .eq('task_date', todayStr)
        .order('priority', { ascending: false });

      if (tasksData) {
        const formattedTasks = tasksData.map((task: any) => ({
          id: task.id,
          task_title: task.task_title,
          task_description: task.task_description,
          task_type: task.task_type,
          task_date: task.task_date,
          is_completed: task.is_completed,
          estimated_hours: task.estimated_hours,
          priority: task.priority,
          ark_title: task.arks.title,
          milestone_title: task.ark_milestones?.title
        }));
        setTasks(formattedTasks);
        
        // Calculate stats
        const completed = formattedTasks.filter((t: any) => t.is_completed).length;
        const planned = formattedTasks.reduce((sum: number, t: any) => sum + t.estimated_hours, 0);
        setStats({
          tasksCompleted: completed,
          totalTasks: formattedTasks.length,
          hoursSpent: completed * planned / formattedTasks.length,
          hoursPlanned: planned,
          streaks: 0
        });
      }

      // Fetch active ARKs
      const { data: arksData } = await supabase
        .from('arks')
        .select('id, title, progress')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .limit(3);

      if (arksData) {
        setActiveARKs(arksData.map(ark => ({
          ark_id: ark.id,
          title: ark.title,
          progress: ark.progress || 0
        })));
      }

    } catch (error) {
      console.error("Failed to fetch daily data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('ark_timeline')
        .update({ 
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      await fetchDailyData();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const getTaskTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      learning: BookOpen,
      practice: Target,
      assessment: CheckCircle2,
      review: RefreshCw,
      rest: Moon,
      checkpoint: Award,
      celebration: Trophy
    };
    return icons[type] || Circle;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const completionRate = stats.totalTasks > 0 ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading your daily tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">Daily Assistant</h1>
          <p className="text-slate-400">
            {new Date(today).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.tasksCompleted}/{stats.totalTasks}</span>
              </div>
              <p className="text-slate-400 text-sm">Tasks Completed</p>
              <Progress value={completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.hoursSpent.toFixed(1)}h</span>
              </div>
              <p className="text-slate-400 text-sm">Time Spent</p>
              <p className="text-slate-500 text-xs mt-1">of {stats.hoursPlanned.toFixed(1)}h planned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-orange-400" />
                <span className="text-2xl font-bold text-white">{stats.streaks}</span>
              </div>
              <p className="text-slate-400 text-sm">Day Streak</p>
              <p className="text-slate-500 text-xs mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{Math.round(completionRate)}%</span>
              </div>
              <p className="text-slate-400 text-sm">Completion Rate</p>
              <p className="text-slate-500 text-xs mt-1">Today&apos;s progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-yellow-400" />
              Today&apos;s Tasks
              {incompleteTasks.length > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 ml-2">
                  {incompleteTasks.length} remaining
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No tasks scheduled for today!</p>
                <p className="text-slate-500 text-sm">Check back later or explore your ARKs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const Icon = getTaskTypeIcon(task.task_type);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                        task.is_completed
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-slate-900/50 border-slate-700 hover:border-yellow-500/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        task.is_completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold ${
                              task.is_completed ? 'text-green-400 line-through' : 'text-white'
                            }`}>
                              {task.task_title}
                            </h4>
                            {task.ark_title && (
                              <p className="text-slate-400 text-sm mt-1">{task.ark_title}</p>
                            )}
                            {task.task_description && (
                              <p className="text-slate-400 text-sm mt-1">{task.task_description}</p>
                            )}
                          </div>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimated_hours}h</span>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {task.task_type}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskComplete(task.id, task.is_completed)}
                        className={task.is_completed ? 'text-green-400' : 'text-slate-400'}
                      >
                        {task.is_completed ? (
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

        {/* Active ARKs Progress */}
        {activeARKs.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Rocket className="w-6 h-6 text-yellow-400" />
                Your Active ARKs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeARKs.map((ark) => (
                  <div key={ark.ark_id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700 hover:border-yellow-500/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{ark.title}</h4>
                      <Progress value={ark.progress} className="h-2" />
                      <p className="text-xs text-slate-400 mt-1">{ark.progress}% complete</p>
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

        {/* Motivation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Daily Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                &quot;Every expert was once a beginner. Keep pushing forward!&quot;
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Brain className="w-4 h-4 mr-2" />
                Get Personalized Motivation
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-cyan-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-slate-600 hover:bg-slate-700">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-600 hover:bg-slate-700">
                  <Award className="w-4 h-4 mr-2" />
                  View Achievements
                </Button>
                <Button variant="outline" className="w-full justify-start border-slate-600 hover:bg-slate-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Ask AI Mentor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks Preview */}
        {incompleteTasks.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-yellow-400" />
                Next Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incompleteTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                    <Circle className="w-4 h-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{task.task_title}</p>
                      <p className="text-slate-400 text-xs">{task.ark_title}</p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

