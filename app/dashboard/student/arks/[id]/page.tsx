"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  phase: string;
  due_date: string;
  difficulty?: string;
  status: string;
  tasks: Task[];
}

interface Task {
  id: string;
  task_type: string;
  linked_resource?: string;
  estimated_time_minutes?: number;
  completion_status: string;
  completed_at?: string;
  title?: string;
}

interface ARK {
  id: string;
  student_id: string;
  goal_id?: string;
  category: string;
  summary?: string;
  status: string;
  progress: number;
  calculated_progress: number;
  created_at: string;
  updated_at: string;
}

export default function ARKDetailPage() {
  const params = useParams();
  const router = useRouter();
  const arkId = params.id as string;

  const [ark, setARK] = useState<ARK | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchARKDetail();
  }, [arkId]);

  const fetchARKDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ark/${arkId}`);
      const data = await response.json();

      if (data.success) {
        setARK(data.data.ark);
        setMilestones(data.data.milestones || []);
        setStats(data.data.stats);
      } else {
        toast.error(data.error || "Failed to load ARK");
        router.push("/dashboard/student/arks");
      }
    } catch (error) {
      console.error("Error fetching ARK:", error);
      toast.error("Failed to load ARK");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = async (milestoneId: string, taskId: string, completed: boolean) => {
    try {
      // Update task completion status
      const response = await fetch(`/api/ark/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completion_status: completed ? "completed" : "pending",
          completed_at: completed ? new Date().toISOString() : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setMilestones((prev) =>
          prev.map((milestone) => {
            if (milestone.id === milestoneId) {
              return {
                ...milestone,
                tasks: milestone.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        completion_status: completed ? "completed" : "pending",
                        completed_at: completed ? new Date().toISOString() : undefined,
                      }
                    : task
                ),
              };
            }
            return milestone;
          })
        );
        
        // Refresh ARK to update progress
        fetchARKDetail();
        toast.success(completed ? "Task completed!" : "Task marked as pending");
      } else {
        toast.error(data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleRecalibrate = async () => {
    if (!confirm("Recalibrate this ARK? This will adjust deadlines based on your current progress.")) {
      return;
    }

    try {
      toast.info("Recalibrating ARK...");
      // TODO: Implement recalibration API
      toast.success("ARK recalibrated successfully");
      fetchARKDetail();
    } catch (error) {
      console.error("Error recalibrating ARK:", error);
      toast.error("Failed to recalibrate ARK");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "study":
        return <BookOpen className="h-4 w-4" />;
      case "test":
        return <Target className="h-4 w-4" />;
      case "revision":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading ARK details...</p>
        </div>
      </div>
    );
  }

  if (!ark) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">ARK not found</p>
            <Link href="/dashboard/student/arks">
              <Button className="mt-4">Back to ARKs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ark.calculated_progress || ark.progress || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <Link
            href="/dashboard/student/arks"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Back to ARKs
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold break-words">{ark.summary || "ARK Details"}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Category: {ark.category} • Status: {ark.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalibrate} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            Recalibrate
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Progress Overview</CardTitle>
            <Badge className={getStatusColor(ark.status)}>{ark.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-2xl font-bold">
                  {stats.completed_milestones}/{stats.total_milestones}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks</p>
                <p className="text-2xl font-bold">
                  {stats.completed_tasks}/{stats.total_tasks}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium">
                  {new Date(ark.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(ark.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Milestones</h2>
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No milestones yet</p>
            </CardContent>
          </Card>
        ) : (
          milestones.map((milestone, idx) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{milestone.title}</CardTitle>
                        <Badge variant="outline">{milestone.phase}</Badge>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(milestone.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {milestone.tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks in this milestone</p>
                  ) : (
                    <div className="space-y-2">
                      {milestone.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={task.completion_status === "completed"}
                            onCheckedChange={(checked) =>
                              handleTaskToggle(
                                milestone.id,
                                task.id,
                                checked as boolean
                              )
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getTaskTypeIcon(task.task_type)}
                              <span className="font-medium">
                                {task.title || `${task.task_type} task`}
                              </span>
                              {task.estimated_time_minutes && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.estimated_time_minutes} min
                                </span>
                              )}
                            </div>
                            {task.linked_resource && (
                              <a
                                href={task.linked_resource}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View Resource →
                              </a>
                            )}
                          </div>
                          {task.completed_at && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.completed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

