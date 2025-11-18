"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  Circle,
  Play,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Award,
  Brain,
  TrendingUp,
  AlertCircle,
  Star,
  Bookmark,
  Share2,
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Flame,
  Rocket,
  Zap,
  Users,
  Lightbulb,
  X,
  Check,
  HelpCircle,
  GripVertical,
  Moon,
  RefreshCw,
  FileText,
  Download
} from "lucide-react";
import { ARKHeroSection } from "@/components/arks/ark-hero-section";
import { TodayFocus } from "@/components/arks/today-focus";
import { QuickStatsSidebar } from "@/components/arks/quick-stats-sidebar";
import { AnalyticsDashboard } from "@/components/arks/analytics-dashboard";
import { RecommendationsSection } from "@/components/arks/recommendations-section";
import { CareerAnalysisCard } from "@/components/arks/career-analysis-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateARKReport, downloadDocumentAsFile } from "@/lib/services/document-generation";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  completed: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  progress_percentage: number;
  estimated_duration?: string;
  target_date?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  required_hours?: number;
  skills_to_gain?: string[];
  checkpoint_questions?: string[];
  celebration_message?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
  metadata?: {
    skills_to_gain?: string[];
    skillsGained?: string[];
    [key: string]: any;
  };
}

interface Resource {
  id: string;
  type: 'video' | 'article' | 'course' | 'book' | 'podcast' | 'tool';
  title: string;
  url: string;
  provider?: string;
  description?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  is_free?: boolean;
  quality_score?: number;
  metadata?: {
    viewed?: boolean;
    completed?: boolean;
    [key: string]: any;
  };
}

interface TimelineTask {
  id: string;
  task_date: string;
  task_title: string;
  task_description?: string;
  task_type: 'learning' | 'practice' | 'assessment' | 'review' | 'rest' | 'checkpoint' | 'celebration';
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  completed_at?: string;
  milestone_id?: string;
}

interface ARK {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'archived';
  exam_date?: string;
  start_date?: string;
  duration: string;
  created_at: string;
}

export default function ARKDetailPage() {
  const params = useParams();
  const router = useRouter();
  const arkId = params.id as string;

  const [ark, setARK] = useState<ARK | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [timeline, setTimeline] = useState<TimelineTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  useEffect(() => {
    if (arkId) {
      fetchARKData();
    }
  }, [arkId]);

  const fetchARKData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch ARK
      const { data: arkData, error: arkError } = await supabase
        .from('arks')
        .select('*')
        .eq('id', arkId)
        .single();

      if (arkError) throw arkError;
      setARK(arkData);

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('ark_milestones')
        .select('*')
        .eq('ark_id', arkId)
        .order('order_index', { ascending: true });

      if (!milestonesError && milestonesData) {
        setMilestones(milestonesData);
      }

      // Fetch resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('ark_resources')
        .select('*')
        .eq('ark_id', arkId);

      if (!resourcesError && resourcesData) {
        setResources(resourcesData);
      }

      // Fetch timeline
      const { data: timelineData, error: timelineError } = await supabase
        .from('ark_timeline')
        .select('*')
        .eq('ark_id', arkId)
        .order('task_date', { ascending: true });

      if (!timelineError && timelineData) {
        setTimeline(timelineData);
      }

      // Fetch student stats for streak
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: statsData } = await supabase
          .from('student_stats')
          .select('streak_days')
          .eq('user_id', user.id)
          .single();
        
        if (statsData) {
          setStreakDays(statsData.streak_days || 0);
          setStudentStats(statsData);
        }
      }
      
      // Store user for component use
      if (user) {
        (window as any).__currentUserId = user.id;
      }

    } catch (error) {
      console.error("Failed to fetch ARK data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestoneComplete = async (milestoneId: string, currentStatus: string) => {
    try {
      const supabase = createClient();
      
      const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
      
      const { error } = await supabase
        .from('ark_milestones')
        .update({ 
          completed: newStatus === 'completed',
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          status: newStatus
        })
        .eq('id', milestoneId);

      if (error) throw error;
      await fetchARKData();
    } catch (error) {
      console.error("Failed to update milestone:", error);
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    try {
      const supabase = createClient();
      const task = timeline.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = !task.is_completed;
      
      const { error } = await supabase
        .from('ark_timeline')
        .update({ 
          is_completed: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null
        })
        .eq('id', taskId);

      if (error) throw error;
      await fetchARKData();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleGenerateARKReport = async () => {
    if (!ark) {
      toast.error("ARK data not loaded");
      return;
    }

    try {
      toast.loading("Generating ARK progress report...", { id: "ark-report" });
      const result = await generateARKReport({
        ark_id: ark.id,
        format: "pdf",
        report_type: "progress",
      });
      toast.success("ARK report generated! Downloading...", { id: "ark-report" });
      await downloadDocumentAsFile(
        result.id,
        `ark-progress-report-${ark.title.replace(/\s+/g, "-")}.pdf`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to generate ARK report", { id: "ark-report" });
    }
  };

  const handleGenerateARKCertificate = async () => {
    if (!ark) {
      toast.error("ARK data not loaded");
      return;
    }

    if (ark.status !== "completed") {
      toast.error("ARK must be completed to generate certificate");
      return;
    }

    try {
      toast.loading("Generating ARK completion certificate...", { id: "ark-cert" });
      const result = await generateARKReport({
        ark_id: ark.id,
        format: "pdf",
        report_type: "completion",
      });
      toast.success("Certificate generated! Downloading...", { id: "ark-cert" });
      await downloadDocumentAsFile(
        result.id,
        `ark-certificate-${ark.title.replace(/\s+/g, "-")}.pdf`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to generate certificate", { id: "ark-cert" });
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length;
    const completedTasks = timeline.filter(t => t.is_completed).length;
    const totalTasks = timeline.length;
    
    // Get unique resources used (completed or viewed)
    const resourcesUsed = resources.filter(r => r.metadata?.viewed || r.metadata?.completed).length;
    const totalResources = resources.length;
    
    // Calculate hours invested from completed tasks
    const hoursInvested = timeline
      .filter(t => t.is_completed)
      .reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    
    // Estimate total hours from all tasks
    const estimatedHours = timeline.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    
    // Extract skills from milestones
    const skillsGained = milestones
      .filter(m => m.status === 'completed')
      .flatMap(m => {
        const skills = m.metadata?.skills_to_gain || m.metadata?.skillsGained || [];
        return Array.isArray(skills) ? skills : [];
      });

    return {
      milestonesCompleted: completedMilestones,
      totalMilestones,
      tasksCompleted: completedTasks,
      totalTasks,
      resourcesUsed,
      totalResources,
      hoursInvested,
      estimatedHours,
      skillsGained: [...new Set(skillsGained)] // Remove duplicates
    };
  };

  // Get today's tasks
  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return timeline.filter(t => t.task_date === today);
  };

  // Get upcoming deadline
  const getUpcomingDeadline = () => {
    const today = new Date();
    const upcomingTasks = timeline
      .filter(t => !t.is_completed && new Date(t.task_date) >= today)
      .sort((a, b) => new Date(a.task_date).getTime() - new Date(b.task_date).getTime());
    
    if (upcomingTasks.length === 0) return undefined;
    
    const nextTask = upcomingTasks[0];
    const deadlineDate = new Date(nextTask.task_date);
    const hoursRemaining = (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60);
    
    return {
      title: nextTask.task_title,
      date: nextTask.task_date,
      hoursRemaining
    };
  };

  // Get recent progress (simplified - can be enhanced with actual tracking)
  const getRecentProgress = () => {
    const recent: any[] = [];
    
    // Add recent milestone completions
    milestones
      .filter(m => m.completed && m.completed_at)
      .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
      .slice(0, 2)
      .forEach(m => {
        recent.push({
          type: 'milestone' as const,
          title: m.title,
          timestamp: m.completed_at || m.created_at
        });
      });
    
    // Add recent task completions
    timeline
      .filter(t => t.is_completed)
      .sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime())
      .slice(0, 2)
      .forEach(t => {
        recent.push({
          type: 'task' as const,
          title: t.task_title,
          timestamp: t.completed_at || t.task_date
        });
      });
    
    return recent.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'learning':
        return <BookOpen className="w-4 h-4" />;
      case 'practice':
        return <Target className="w-4 h-4" />;
      case 'assessment':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'review':
        return <RefreshCw className="w-4 h-4" />;
      case 'rest':
        return <Moon className="w-4 h-4" />;
      case 'celebration':
        return <Award className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'skipped':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading ARK details...</p>
        </div>
      </div>
    );
  }

  if (!ark) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-24 h-24 text-slate-700 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">ARK Not Found</h2>
          <p className="text-slate-400 mb-8">
            The ARK you&apos;re looking for doesn&apos;t exist or has been deleted
          </p>
          <Link href="/dashboard/student/arks">
            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My ARKs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const todayTasks = getTodayTasks();
  const upcomingDeadline = getUpcomingDeadline();
  const recentProgress = getRecentProgress();
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const todayCompletedHours = todayTasks
    .filter(t => t.is_completed)
    .reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const todayTotalHours = todayTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 overflow-x-hidden w-full">
      {/* Header Navigation */}
      <div className="border-b border-slate-700 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm w-full">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 w-full">
            <Link href="/dashboard/student/arks" className="flex-shrink-0">
              <Button variant="ghost" className="text-white hover:bg-slate-800 text-xs sm:text-sm">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to ARKs</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                className="border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs sm:text-sm p-2 sm:px-3"
                onClick={handleGenerateARKReport}
                disabled={!ark}
              >
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Report</span>
              </Button>
              {ark?.status === 'completed' && (
                <Button 
                  variant="outline" 
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-xs sm:text-sm p-2 sm:px-3"
                  onClick={handleGenerateARKCertificate}
                  disabled={!ark}
                >
                  <Award className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Certificate</span>
                </Button>
              )}
              <Button variant="outline" className="border-slate-600 text-xs sm:text-sm p-2 sm:px-3">
                <Share2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="outline" className="border-slate-600 p-2 sm:px-3">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 w-full max-w-full">
        <ARKHeroSection 
          ark={ark} 
          stats={{
            ...stats,
            streakDays
          }}
          upcomingDeadline={upcomingDeadline}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1">
            <QuickStatsSidebar
              arkId={arkId}
              todayTasksCount={todayTasks.length}
              upcomingMilestonesCount={milestones.filter(m => m.status === 'pending' || m.status === 'in_progress').length}
              recentProgress={recentProgress}
              onAddNote={() => setShowAddNote(true)}
              onReschedule={() => setShowReschedule(true)}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Today's Focus */}
            <TodayFocus
              tasks={todayTasks.map(t => ({
                id: t.id,
                title: t.task_title,
                description: t.task_description,
                task_type: t.task_type,
                priority: t.priority,
                estimated_hours: t.estimated_hours,
                task_date: t.task_date,
                is_completed: t.is_completed,
                milestone_order: milestones.findIndex(m => 
                  timeline.find(tl => tl.milestone_id === m.id)?.id === t.id
                ) + 1
              }))}
              totalEstimatedHours={todayTotalHours}
              completedHours={todayCompletedHours}
              onTaskComplete={toggleTaskComplete}
              onTaskClick={(taskId) => {
                // Scroll to task in timeline view
                setActiveTab('timeline');
                // Scroll to specific task after tab change
                setTimeout(() => {
                  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                  if (taskElement) {
                    taskElement.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                    // Highlight the task briefly
                    taskElement.classList.add('ring-2', 'ring-yellow-500', 'ring-offset-2', 'ring-offset-black');
                    setTimeout(() => {
                      taskElement.classList.remove('ring-2', 'ring-yellow-500', 'ring-offset-2', 'ring-offset-black');
                    }, 2000);
                  }
                }, 300); // Wait for tab transition
              }}
            />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="w-full overflow-x-auto">
                <TabsList className="inline-flex w-full min-w-max glass border border-yellow-500/30 bg-slate-900/50 text-xs sm:text-sm sm:grid sm:grid-cols-4">
                  <TabsTrigger value="overview" className="flex-shrink-0 px-2 sm:px-4 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Overview</span>
                    <span className="sm:hidden">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-shrink-0 px-2 sm:px-4 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Timeline</span>
                    <span className="sm:hidden">Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex-shrink-0 px-2 sm:px-4 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Resources</span>
                    <span className="sm:hidden">Resources</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex-shrink-0 px-2 sm:px-4 data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Analytics</span>
                    <span className="sm:hidden">Analytics</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-yellow-400" />
                    Milestones
                  </h2>
                  
                  {milestones.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400">No milestones yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    milestones.map((milestone, index) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-all">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-lg">
                                  {milestone.completed ? (
                                    <CheckCircle className="w-6 h-6" />
                                  ) : (
                                    <span>{milestone.order_index}</span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-white mb-2">{milestone.title}</CardTitle>
                                  {milestone.description && (
                                    <CardDescription className="text-slate-400 mb-3">
                                      {milestone.description}
                                    </CardDescription>
                                  )}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge className={getStatusColor(milestone.status)}>
                                      {milestone.status.replace('_', ' ')}
                                    </Badge>
                                    {milestone.difficulty && (
                                      <Badge className={getDifficultyColor(milestone.difficulty)}>
                                        {milestone.difficulty}
                                      </Badge>
                                    )}
                                    {milestone.estimated_duration && (
                                      <Badge className="bg-slate-700/50 text-slate-200 border-slate-600">
                                        {milestone.estimated_duration}
                                      </Badge>
                                    )}
                                  </div>
                                  {milestone.progress_percentage > 0 && milestone.progress_percentage < 100 && (
                                    <Progress value={milestone.progress_percentage} className="h-2 mb-3" />
                                  )}
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toggleMilestoneComplete(milestone.id, milestone.status)}>
                                    {milestone.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          
                          {milestone.skills_to_gain && milestone.skills_to_gain.length > 0 && (
                            <CardContent>
                              <p className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Skills You&apos;ll Gain:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {milestone.skills_to_gain.map((skill, i) => (
                                  <Badge key={i} className="bg-slate-700/50 text-slate-200 border-slate-600">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          )}

                          {milestone.checkpoint_questions && milestone.checkpoint_questions.length > 0 && (
                            <CardContent>
                              <p className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Checkpoint Questions:
                              </p>
                              <ul className="space-y-2">
                                {milestone.checkpoint_questions.map((question, i) => (
                                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                    <Circle className="w-3 h-3 mt-1 text-slate-500" />
                                    <span>{question}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-yellow-400" />
                      Daily Timeline
                    </h2>
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Calendar
                    </Button>
                  </div>

                  {timeline.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 mb-4">No timeline tasks yet</p>
                        <p className="text-slate-500 text-sm">
                          Timeline tasks will appear here once generated by AI or created manually
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {timeline.map((task) => (
                  <motion.div
                    key={task.id}
                    data-task-id={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            task.is_completed 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-slate-700 text-slate-400'
                          }`}>
                            {task.is_completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              getTaskTypeIcon(task.task_type)
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-white font-semibold">{task.task_title}</h4>
                                {task.task_description && (
                                  <p className="text-slate-400 text-sm mt-1">{task.task_description}</p>
                                )}
                              </div>
                              <Badge className={
                                task.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                task.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              }>
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(task.task_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
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
                            onClick={async () => {
                              try {
                                const supabase = createClient();
                                const { error } = await supabase
                                  .from('ark_timeline')
                                  .update({ 
                                    is_completed: !task.is_completed,
                                    completed_at: !task.is_completed ? new Date().toISOString() : null
                                  })
                                  .eq('id', task.id);
                                if (!error) fetchARKData();
                              } catch (error) {
                                console.error("Failed to update task:", error);
                              }
                            }}
                          >
                            {task.is_completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                      </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-yellow-400" />
                      Learning Resources
                    </h2>
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>

                  {resources.length === 0 ? (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="p-8 text-center">
                        <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400">No resources added yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {resources.map((resource) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-all h-full">
                            <CardContent className="p-4">
                              {resource.thumbnail_url && (
                                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-slate-900">
                                  <img 
                                    src={resource.thumbnail_url} 
                                    alt={resource.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <Badge className="mb-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
                                {resource.type}
                              </Badge>
                              <h4 className="text-white font-semibold mb-2 line-clamp-2">{resource.title}</h4>
                              {resource.description && (
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{resource.description}</p>
                              )}
                              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                                {resource.provider && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {resource.provider}
                                  </span>
                                )}
                                {resource.duration_minutes && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(resource.duration_minutes)}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex-1"
                                >
                                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open
                                  </Button>
                                </a>
                                <Button variant="outline" size="sm" className="border-slate-600">
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-6">
                <AnalyticsDashboard arkId={arkId} />
              </TabsContent>
            </Tabs>

            {/* Recommendations Section */}
            <div className="mt-8">
              <RecommendationsSection />
            </div>

            {/* Career Analysis Section */}
            <div className="mt-8">
              <CareerAnalysisCard />
            </div>

            {/* Reminder Preferences - Can be added to settings or as a collapsible section */}
          </div>
        </div>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Note</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add a note to this ARK for future reference
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white mb-2 block">Note Content</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddNote(false);
                setNoteContent("");
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!noteContent.trim()) {
                  toast.error("Please enter a note");
                  return;
                }
                try {
                  const response = await fetch(`/api/arks/${arkId}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: noteContent }),
                  });
                  const data = await response.json();
                  if (data.success) {
                    toast.success("Note added successfully");
                    setShowAddNote(false);
                    setNoteContent("");
                    fetchARKData();
                  } else {
                    toast.error(data.error || "Failed to add note");
                  }
                } catch (error: any) {
                  console.error('Failed to add note:', error);
                  toast.error(error.message || "Failed to add note");
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reschedule ARK</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the completion date for this ARK or a specific milestone
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-white mb-2 block">Target Completion Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Or Reschedule Milestone (Optional)</Label>
              <select
                value={selectedMilestoneId || ""}
                onChange={(e) => setSelectedMilestoneId(e.target.value || null)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white"
              >
                <option value="">Select a milestone...</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowReschedule(false);
                setRescheduleDate("");
                setSelectedMilestoneId(null);
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!rescheduleDate) {
                  toast.error("Please select a date");
                  return;
                }
                try {
                  const body: any = selectedMilestoneId
                    ? { milestone_id: selectedMilestoneId, milestone_target_date: rescheduleDate }
                    : { target_completion_date: rescheduleDate };

                  const response = await fetch(`/api/arks/${arkId}/reschedule`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  });
                  const data = await response.json();
                  if (data.success) {
                    toast.success(data.data.message || "Rescheduled successfully");
                    setShowReschedule(false);
                    setRescheduleDate("");
                    setSelectedMilestoneId(null);
                    fetchARKData();
                  } else {
                    toast.error(data.error || "Failed to reschedule");
                  }
                } catch (error: any) {
                  console.error('Failed to reschedule:', error);
                  toast.error(error.message || "Failed to reschedule");
                }
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

