"use client";

import { useState, useEffect } from "react";
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
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My ARKs</h1>
              <p className="text-slate-400">Manage your learning journeys</p>
            </div>
            <Link href="/ark/create">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Create New ARK
              </Button>
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search ARKs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "active", "completed", "paused"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  onClick={() => setFilter(status)}
                  className={filter === status ? "bg-yellow-500 text-black" : "border-slate-600"}
                  size="sm"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 border border-slate-700 rounded-lg p-1">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                onClick={() => setView("grid")}
                size="sm"
                className={view === "grid" ? "bg-slate-700" : "text-slate-400"}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                onClick={() => setView("list")}
                size="sm"
                className={view === "list" ? "bg-slate-700" : "text-slate-400"}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "timeline" ? "default" : "ghost"}
                onClick={() => setView("timeline")}
                size="sm"
                className={view === "timeline" ? "bg-slate-700" : "text-slate-400"}
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ARKs Display */}
      <div className="container mx-auto px-8 py-8">
        {filteredARKs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <BookOpen className="w-24 h-24 text-slate-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No ARKs Yet</h2>
            <p className="text-slate-400 mb-8">
              Start your personalized learning journey by creating your first ARK
            </p>
            <Link href="/ark/create">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First ARK
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredARKs.map((ark) => (
              <motion.div key={ark.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-all h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-white mb-1 line-clamp-2">{ark.title}</CardTitle>
                        <Badge className={getStatusColor(ark.status)}>{ark.status}</Badge>
                      </div>
                    </div>
                    {ark.description && (
                      <p className="text-slate-400 text-sm line-clamp-2">{ark.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Progress</span>
                        <span className="text-sm font-semibold text-white">{ark.progress}%</span>
                      </div>
                      <Progress value={ark.progress} className="h-2" />
                    </div>

                    {/* Next Milestone */}
                    <div className="flex items-start gap-2 text-sm text-slate-300">
                      <Target className="w-4 h-4 mt-0.5 text-yellow-400" />
                      <span className="line-clamp-1">{ark.nextMilestone}</span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-start gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4 mt-0.5" />
                      <span>Due: {new Date(ark.dueDate).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/ark/${ark.id}`} className="flex-1">
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" size="sm">
                          Continue <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="border-slate-600">
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

