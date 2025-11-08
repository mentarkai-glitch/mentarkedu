"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  Pause,
  Archive,
  ArrowRight,
  Grid,
  List,
  Calendar,
} from "lucide-react";

interface ARK {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  nextMilestone: string;
  dueDate: string;
  status: "active" | "completed" | "paused";
  created_at: string;
}

export default function MyARKsPage() {
  const [arks, setARKs] = useState<ARK[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "paused">("all");
  const [view, setView] = useState<"grid" | "list" | "timeline">("grid");

  useEffect(() => {
    fetchARKs();
  }, []);

  const fetchARKs = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: arksData, error } = await supabase.from("arks").select("*").eq("student_id", user.id);

        if (error) {
          console.error("Error fetching ARKs:", error);
        } else if (arksData) {
          setARKs(arksData as any);
        }
      }
    } catch (error) {
      console.error("Failed to fetch ARKs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredARKs = arks.filter((ark) => {
    const matchesSearch = ark.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || ark.status === filter;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = useMemo(() => {
    return {
      all: arks.length,
      active: arks.filter((ark) => ark.status === "active").length,
      completed: arks.filter((ark) => ark.status === "completed").length,
      paused: arks.filter((ark) => ark.status === "paused").length,
    } as Record<typeof filter, number> & { all: number };
  }, [arks]);

  const timelineARKs = useMemo(
    () =>
      [...filteredARKs].sort((a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }),
    [filteredARKs]
  );

  const formatDueDate = (date?: string) => {
    if (!date) return "No due date";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return "No due date";
    }
    return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading your ARKs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Page Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 w-full">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 w-full">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 break-words">My ARKs</h1>
              <p className="text-sm sm:text-base text-slate-400 break-words">Manage your learning journeys</p>
            </div>
            <Link href="/ark/create" className="w-full sm:w-auto flex-shrink-0">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-sm sm:text-base">
                <Plus className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">Create New ARK</span>
              </Button>
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <Input
                placeholder="Search ARKs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 bg-slate-800 border-slate-700 text-white text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2 flex-1">
                {(["all", "active", "completed", "paused"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    onClick={() => setFilter(status)}
                    className={`text-xs sm:text-sm ${filter === status ? "bg-yellow-500 text-black" : "border-slate-600"}`}
                    size="sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 sm:gap-2 border border-slate-700 rounded-lg p-1">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  onClick={() => setView("grid")}
                  size="sm"
                  className={view === "grid" ? "bg-slate-700" : "text-slate-400 p-2"}
                >
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  onClick={() => setView("list")}
                  size="sm"
                  className={view === "list" ? "bg-slate-700" : "text-slate-400 p-2"}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={view === "timeline" ? "default" : "ghost"}
                  onClick={() => setView("timeline")}
                  size="sm"
                  className={view === "timeline" ? "bg-slate-700" : "text-slate-400 p-2"}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARKs Display */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 w-full max-w-full">
        {filteredARKs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-20"
          >
            <BookOpen className="w-16 h-16 sm:w-24 sm:h-24 text-slate-700 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No ARKs Yet</h2>
            <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 px-4">
              Start your personalized learning journey by creating your first ARK
            </p>
            <Link href="/ark/create" className="inline-block">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black text-sm sm:text-base">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Your First ARK
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            {filteredARKs.map((ark) => (
              <motion.div key={ark.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
                <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-all h-full w-full overflow-hidden">
                  <CardHeader className="min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white mb-1 line-clamp-2 break-words">{ark.title}</CardTitle>
                        <Badge className={`${getStatusColor(ark.status)} mt-1`}>{ark.status}</Badge>
                      </div>
                    </div>
                    {ark.description && (
                      <p className="text-slate-400 text-sm line-clamp-2 break-words">{ark.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 min-w-0">
                    {/* Progress */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Progress</span>
                        <span className="text-sm font-semibold text-white flex-shrink-0 ml-2">{ark.progress}%</span>
                      </div>
                      <Progress value={ark.progress} className="h-2 w-full" />
                    </div>

                    {/* Next Milestone */}
                    <div className="flex items-start gap-2 text-sm text-slate-300 min-w-0">
                      <Target className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span className="line-clamp-2 break-words min-w-0">{ark.nextMilestone}</span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-start gap-2 text-sm text-slate-400 min-w-0">
                      <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">Due: {new Date(ark.dueDate).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/ark/${ark.id}`} className="flex-1 min-w-0">
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black text-xs sm:text-sm" size="sm">
                          <span className="truncate">Continue</span> <ArrowRight className="w-4 h-4 ml-1 flex-shrink-0" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="border-slate-600 flex-shrink-0">
                        <Filter className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

