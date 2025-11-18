"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles, ExternalLink, BookOpen, Target, TrendingUp, Lightbulb, ArrowRight, FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateStudyNotes, downloadDocumentAsFile } from "@/lib/services/document-generation";
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

type SearchContext = "academic" | "career" | "personal" | "general";

const HISTORY_STORAGE_KEY = "mentark-search-history-v1";

interface RecentQuery {
  query: string;
  context: SearchContext;
  timestamp: string;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialContextParam = (searchParams.get("ctx") as SearchContext) || "general";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<SearchContext>(initialContextParam);
  const [error, setError] = useState<string | null>(null);
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [generatingNotes, setGeneratingNotes] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentQuery[];
        setRecentQueries(parsed);
      }
    } catch (err) {
      console.warn("Failed to parse search history", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const handleSearch = async (overrideQuery?: string, overrideContext?: SearchContext) => {
    const searchText = (overrideQuery ?? query).trim();
    const searchContext = overrideContext ?? context;

    if (!searchText) return;
    if (!isOnline) {
      setError("You're offline. Reconnect to fetch fresh answers.");
      return;
    }

    setQuery(searchText);
    if (overrideContext && overrideContext !== context) {
      setContext(overrideContext);
    }

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      router.replace(`?q=${encodeURIComponent(searchText)}&ctx=${searchContext}`, { scroll: false });

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: searchText, context: searchContext }),
      });

      if (!response.ok) {
        throw new Error(`Search service returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResults(data.data);

        const newEntry: RecentQuery = {
          query: searchText,
          context: searchContext,
          timestamp: new Date().toISOString(),
        };

        setRecentQueries((prev) => {
          const filtered = prev.filter((item) => item.query !== searchText || item.context !== searchContext);
          const updated = [newEntry, ...filtered].slice(0, 6);
          try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
          } catch (storageError) {
            console.warn("Failed to persist search history", storageError);
          }
          return updated;
        });
      } else {
        throw new Error(data.error || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch(initialQuery, initialContextParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&ctx=${context}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && Array.isArray(data.data)) {
            setSuggestions(data.data);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, context]);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4"
          >
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-display">Mentark Search</h1>
          </motion.div>
          <p className="text-slate-300 text-base sm:text-lg px-4">
            Don&apos;t just search. Get answers that lead to action.
          </p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-6 sm:mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay to allow suggestion clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Ask anything..."
              className="w-full h-12 sm:h-16 pl-10 sm:pl-12 pr-3 sm:pr-4 bg-black/40 border-2 border-yellow-500/30 rounded-xl sm:rounded-2xl text-white text-base sm:text-lg placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            />
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-yellow-500/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(suggestion);
                      setShowSuggestions(false);
                      handleSearch(suggestion, context);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-yellow-500/10 text-white text-sm sm:text-base transition-colors border-b border-slate-700 last:border-b-0 flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Context Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">Context:</span>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {( ["general", "academic", "career", "personal"] as SearchContext[] ).map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => {
                    setContext(ctx);
                    if (query.trim()) {
                      handleSearch(query, ctx);
                    }
                  }}
                  aria-pressed={context === ctx}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500/40 ${
                    context === ctx
                      ? "bg-yellow-500 text-black"
                      : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  }`}
                >
                  {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                </button>
              ))}
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim() || !isOnline}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm sm:text-base w-full sm:w-auto"
            >
              {loading ? "Searching..." : isOnline ? "Search" : "Offline"}
            </Button>
          </div>
        </motion.div>

        {!isOnline && (
          <div className="max-w-4xl mx-auto mb-4 text-center text-xs sm:text-sm text-red-300">
            You&apos;re offline. Recent results are still visible, but new searches will resume once you reconnect.
          </div>
        )}

        {recentQueries.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span>Recent searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentQueries.map((item) => (
                <button
                  key={`${item.query}-${item.context}`}
                  onClick={() => handleSearch(item.query, item.context)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-xs sm:text-sm text-slate-300 hover:border-yellow-500 hover:text-white transition-all"
                >
                  {item.query}
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-yellow-400">{item.context}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

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
            {/* Generate Notes Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateNotes}
                disabled={generatingNotes || !results}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {generatingNotes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Study Notes
                  </>
                )}
              </Button>
            </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                        onClick={() => handleSearch(relatedQuery)}
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
                  onClick={() => handleSearch(example)}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-10 w-10 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white font-display">Mentark Search</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Don&apos;t just search. Get answers that lead to action.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent"></div>
              <p className="text-white mt-4 text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

