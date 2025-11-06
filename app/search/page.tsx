"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles, ExternalLink, BookOpen, Target, TrendingUp, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SearchResult {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  actions: Array<{
    type: string;
    label: string;
    description: string;
    actionUrl?: string;
  }>;
  relatedQueries: string[];
  confidence: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<"academic" | "career" | "personal" | "general">("general");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Sparkles className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white font-display">Mentark Search</h1>
          </motion.div>
          <p className="text-slate-300 text-lg">
            Don&apos;t just search. Get answers that lead to action.
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything... Get personalized, actionable answers"
              className="w-full h-16 pl-12 pr-4 bg-black/40 border-2 border-yellow-500/30 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            />
          </div>

          {/* Context Selector */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-gray-400">Context:</span>
            {["general", "academic", "career", "personal"].map((ctx) => (
              <button
                key={ctx}
                onClick={() => setContext(ctx as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  context === ctx
                    ? "bg-yellow-500 text-black"
                    : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                }`}
              >
                {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
              </button>
            ))}
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        {loading && (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
              <p className="text-white mt-4 text-lg">Thinking deeply...</p>
            </motion.div>
          </div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Main Answer */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-purple-500/10 border-yellow-500/30">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-4">
                  <Lightbulb className="h-6 w-6 text-yellow-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-white">Your Answer</h2>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {Math.round(results.confidence * 100)}% confident
                      </Badge>
                    </div>
                    <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-line">
                      {results.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actionable Steps */}
            {results.actions.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-400" />
                    What You Can Do Next
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.actions.map((action, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-cyan-500 transition-all cursor-pointer"
                        onClick={() => action.actionUrl && router.push(action.actionUrl)}
                      >
                        <div className="flex items-start gap-3">
                          {action.type === "learn" && <BookOpen className="h-5 w-5 text-blue-400 mt-0.5" />}
                          {action.type === "apply" && <Target className="h-5 w-5 text-green-400 mt-0.5" />}
                          {action.type === "connect" && <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5" />}
                          {action.type === "explore" && <Sparkles className="h-5 w-5 text-yellow-400 mt-0.5" />}
                          <div>
                            <h4 className="text-white font-semibold mb-1">{action.label}</h4>
                            <p className="text-gray-400 text-sm">{action.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sources */}
            {results.sources.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Verified Sources</h3>
                  <div className="space-y-3">
                    {results.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:border-cyan-500 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-2 group-hover:text-cyan-400 transition-colors">
                              {source.title}
                            </h4>
                            <p className="text-gray-400 text-sm line-clamp-2">{source.snippet}</p>
                            <p className="text-xs text-gray-500 mt-2 truncate">{source.url}</p>
                          </div>
                          <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Queries */}
            {results.relatedQueries.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Related Questions</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.relatedQueries.map((relatedQuery, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuery(relatedQuery);
                          handleSearch();
                        }}
                        className="px-4 py-2 bg-slate-700/30 border border-slate-600 rounded-lg text-gray-300 text-sm hover:border-cyan-500 hover:text-white transition-all flex items-center gap-2"
                      >
                        {relatedQuery}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !results && query === "" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto text-center py-20"
          >
            <Sparkles className="h-24 w-24 text-yellow-400 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Search Journey</h2>
            <p className="text-slate-400 text-lg mb-8">
              Ask anything. Get personalized, actionable answers powered by AI.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Best colleges for computer engineering",
                "How to improve focus while studying",
                "Career paths after JEE",
                "Python programming basics",
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(example);
                    handleSearch();
                  }}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 text-sm hover:border-yellow-500 hover:text-white transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

