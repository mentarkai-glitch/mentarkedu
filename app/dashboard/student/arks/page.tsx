"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { generateARKReport, downloadDocumentAsFile } from "@/lib/services/document-generation";
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
  AlertTriangle,
  FileText,
  Award,
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

const isMissingColumnError = (error: any, column: string) => {
  const message = (error?.message || "").toLowerCase();
  return error?.code === "42703" || message.includes(`column "${column}"`) || message.includes(`column ${column}`);
};

export default function MyARKsPage() {
  const [arks, setARKs] = useState<ARK[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "paused">("all");
  const [view, setView] = useState<"grid" | "list" | "timeline">("grid");
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchARKs = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setARKs([]);
        return;
      }

      const { data: arksData, error } = await supabase
        .from("arks")
        .select("*")
        .order("created_at", { ascending: false });

      if (arksData) {
        setARKs(arksData as ARK[]);
      } else if (error) {
        const message =
          error.message ||
          error.hint ||
          "Unable to load your ARKs right now. Please try again in a moment.";
        console.error("Error fetching ARKs:", { message, details: error });
        setLoadError(message);
        toast.error(message);
      } else {
        setARKs([]);
      }
    } catch (error: any) {
      const message = error?.message || "Something went wrong while loading your ARKs.";
      console.error("Failed to fetch ARKs:", error);
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchARKs();
  }, [fetchARKs]);

  const handleGenerateARKReport = async (arkId: string, arkTitle: string) => {
    try {
      toast.loading("Generating ARK progress report...", { id: `ark-report-${arkId}` });
      const result = await generateARKReport({
        ark_id: arkId,
        format: "pdf",
        report_type: "progress",
      });
      toast.success("ARK report generated! Downloading...", { id: `ark-report-${arkId}` });
      await downloadDocumentAsFile(
        result.id,
        `ark-progress-report-${arkTitle.replace(/\s+/g, "-")}.pdf`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to generate ARK report", { id: `ark-report-${arkId}` });
    }
  };

  const filteredARKs = arks.filter((ark) => {
    const matchesSearch = ark.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || ark.status === filter;
    return matchesSearch && matchesFilter;
  });

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
        return "bg-card/20 text-muted-foreground border-border/30";
    }
  };

  if (loading) {
    return (
      <PageLayout containerWidth="wide" padding="desktop">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Spinner size="xl" color="gold" />
            <p className="text-foreground mt-4">Loading your ARKs...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {loadError && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/30">
            <AlertTriangle className="w-5 h-5" />
            <AlertDescription className="text-red-200">
              <p className="font-semibold">We couldn&apos;t load your ARKs.</p>
              <p className="text-sm">{loadError}</p>
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/60 text-red-200 hover:bg-red-500/20"
              onClick={fetchARKs}
            >
              Try again
            </Button>
          </Alert>
        )}

        <PageHeader
          title="My ARKs"
          description="Manage your learning journeys"
          icon={<BookOpen className="w-8 h-8 text-gold" />}
          actions={
            <Link href="/ark/create">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New ARK
              </Button>
            </Link>
          }
        />

        <PageContainer spacing="md">

          {/* Filters & Search */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                placeholder="Search ARKs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 bg-card border-border text-foreground text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2 flex-1">
                {(["all", "active", "completed", "paused"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "outline"}
                    onClick={() => setFilter(status)}
                    className={`text-xs sm:text-sm ${filter === status ? "bg-yellow-500 text-black" : "border-border"}`}
                    size="sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 sm:gap-2 border border-border rounded-lg p-1">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  onClick={() => setView("grid")}
                  size="sm"
                  className={view === "grid" ? "bg-card" : "text-muted-foreground p-2"}
                >
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  onClick={() => setView("list")}
                  size="sm"
                  className={view === "list" ? "bg-card" : "text-muted-foreground p-2"}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={view === "timeline" ? "default" : "ghost"}
                  onClick={() => setView("timeline")}
                  size="sm"
                  className={view === "timeline" ? "bg-card" : "text-muted-foreground p-2"}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ARKs Display */}
        {filteredARKs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-20"
          >
            <BookOpen className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">No ARKs Yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-4">
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
                <Card className="bg-card/50 border-border hover:border-yellow-500/30 transition-all h-full w-full overflow-hidden">
                  <CardHeader className="min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-foreground mb-1 line-clamp-2 break-words">{ark.title}</CardTitle>
                        <Badge className={`${getStatusColor(ark.status)} mt-1`}>{ark.status}</Badge>
                      </div>
                    </div>
                    {ark.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 break-words">{ark.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 min-w-0">
                    {/* Progress */}
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-semibold text-foreground flex-shrink-0 ml-2">{ark.progress}%</span>
                      </div>
                      <Progress value={ark.progress} className="h-2 w-full" />
                    </div>

                    {/* Next Milestone */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground min-w-0">
                      <Target className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span className="line-clamp-2 break-words min-w-0">{ark.nextMilestone}</span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-start gap-2 text-sm text-muted-foreground min-w-0">
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 flex-shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleGenerateARKReport(ark.id, ark.title);
                        }}
                        title="Generate Progress Report"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {ark.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 flex-shrink-0"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              toast.loading("Generating certificate...", { id: `ark-cert-${ark.id}` });
                              const result = await generateARKReport({
                                ark_id: ark.id,
                                format: "pdf",
                                report_type: "completion",
                              });
                              toast.success("Certificate generated! Downloading...", { id: `ark-cert-${ark.id}` });
                              await downloadDocumentAsFile(
                                result.id,
                                `ark-certificate-${ark.title.replace(/\s+/g, "-")}.pdf`
                              );
                            } catch (error: any) {
                              toast.error(error.message || "Failed to generate certificate", { id: `ark-cert-${ark.id}` });
                            }
                          }}
                          title="Generate Certificate"
                        >
                          <Award className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}

