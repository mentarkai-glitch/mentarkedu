"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Calendar,
  Filter,
  Search,
  Play,
  Eye,
  FileText,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface PYQ {
  id: string;
  exam_type: string;
  year: number;
  paper_set?: string;
  subject: string | null;
  question_number: number;
  question_text: string;
  question_image_url?: string;
  topic?: string;
  chapter?: string;
  difficulty?: string;
}

export default function PYQsPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [filteredPyqs, setFilteredPyqs] = useState<PYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState<PYQ[]>([]);
  const [searching, setSearching] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchPYQs();
  }, [examType, year, subject, page]);

  useEffect(() => {
    filterPYQs();
  }, [pyqs, searchTerm]);

  const fetchPYQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (examType !== "all") params.append("exam_type", examType);
      if (year !== "all") params.append("year", year);
      if (subject !== "all") params.append("subject", subject);
      params.append("limit", limit.toString());
      params.append("offset", ((page - 1) * limit).toString());

      const response = await fetch(`/api/pyqs?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPyqs(result.data.pyqs || []);
        setTotal(result.data.total || 0);
      } else {
        toast.error("Failed to load PYQs");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPYQs = () => {
    let filtered = pyqs;

    if (searchTerm && !useSemanticSearch) {
      filtered = filtered.filter(
        (pyq) =>
          pyq.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pyq.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pyq.chapter?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPyqs(filtered);
  };

  const handleSemanticSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch("/api/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchTerm,
          limit: 20,
          filters: {
            ...(examType !== "all" && { exam_type: examType }),
            ...(subject !== "all" && { subject }),
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSemanticResults(result.data.results || []);
        toast.success(`Found ${result.data.total} relevant questions`);
      } else {
        toast.error(result.error || "Semantic search failed");
      }
    } catch (error) {
      console.error("Semantic search error:", error);
      toast.error("Semantic search failed");
    } finally {
      setSearching(false);
    }
  };

  const getExamBadge = (examType: string) => {
    const colors: Record<string, string> = {
      JEE_MAIN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      JEE_ADVANCED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      NEET: "bg-green-500/20 text-green-400 border-green-500/30",
      AIIMS: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[examType] || "bg-muted text-muted-foreground";
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 2010; i--) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Previous Year Papers</h1>
          <p className="text-sm text-muted-foreground">
            Practice with real exam questions from previous years
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/student/mock-tests">
            <FileText className="w-4 h-4 mr-2" />
            Mock Tests
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by topic, chapter, or question..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setUseSemanticSearch(false);
                  setSemanticResults([]);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && useSemanticSearch) {
                    handleSemanticSearch();
                  }
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={useSemanticSearch ? "default" : "outline"}
                onClick={() => {
                  setUseSemanticSearch(!useSemanticSearch);
                  if (!useSemanticSearch && searchTerm) {
                    handleSemanticSearch();
                  } else {
                    setSemanticResults([]);
                  }
                }}
                disabled={!searchTerm || searching}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {useSemanticSearch ? "AI Search" : "Regular"}
              </Button>
              {useSemanticSearch && searchTerm && (
                <Button onClick={handleSemanticSearch} disabled={searching}>
                  {searching ? "Searching..." : "Search"}
                </Button>
              )}
            </div>
            <Select value={examType} onValueChange={(v) => { setExamType(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Exam Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="JEE_MAIN">JEE Main</SelectItem>
                <SelectItem value="JEE_ADVANCED">JEE Advanced</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
                <SelectItem value="AIIMS">AIIMS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={year} onValueChange={(v) => { setYear(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getYears().map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subject} onValueChange={(v) => { setSubject(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `Found ${total} questions` : "No questions found"}
        </p>
        {total > limit && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Semantic Search Results */}
      {useSemanticSearch && semanticResults.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              AI-Powered Search Results ({semanticResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semanticResults.map((pyq, idx) => (
                <motion.div
                  key={pyq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/dashboard/student/pyqs/${pyq.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getExamBadge(pyq.exam_type)}
                              {pyq.year && (
                                <Badge variant="outline">{pyq.year}</Badge>
                              )}
                              {pyq.difficulty && (
                                <Badge variant="secondary">
                                  {pyq.difficulty}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {pyq.question_text}
                            </p>
                            {pyq.topic && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Topic: {pyq.topic}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PYQs List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading PYQs...</p>
        </div>
      ) : useSemanticSearch && semanticResults.length > 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Showing semantic search results above. Clear search to see all PYQs.
        </div>
      ) : filteredPyqs.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No PYQs found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPyqs.map((pyq, index) => (
            <motion.div
              key={pyq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:border-cyan-500/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getExamBadge(pyq.exam_type)}>
                          {pyq.exam_type.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          {pyq.year}
                        </Badge>
                        {pyq.paper_set && (
                          <Badge variant="outline">{pyq.paper_set}</Badge>
                        )}
                        {pyq.subject && (
                          <Badge variant="outline">{pyq.subject}</Badge>
                        )}
                        {pyq.topic && (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            {pyq.topic}
                          </Badge>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          Q{pyq.question_number}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pyq.question_text}
                        </p>
                        {pyq.question_image_url && (
                          <Badge variant="outline" className="mt-2">
                            <Eye className="w-3 h-3 mr-1" />
                            Contains Image
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link href={`/dashboard/student/pyqs/${pyq.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                      >
                        <Link href={`/dashboard/student/practice?pyq=${pyq.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Practice
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

