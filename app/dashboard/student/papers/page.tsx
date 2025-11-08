'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Library,
  Search,
  ExternalLink,
  Users,
  Calendar,
  TrendingUp,
  FileText,
  BookOpen,
  Sparkles,
  AlertCircle,
  Download,
  BookmarkCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface Paper {
  paperId: string;
  title: string;
  abstract: string;
  year?: number;
  authors: Array<{
    authorId: string;
    name: string;
  }>;
  url: string;
  citationCount: number;
  influence: number;
  venue?: string;
}

const HISTORY_STORAGE_KEY = 'mentark-papers-history-v1';
const BOOKMARKS_STORAGE_KEY = 'mentark-papers-bookmarks-v1';
const MAX_HISTORY = 6;

const QUERY_TEMPLATES: string[] = [
  'Explainable AI for medical imaging 2023',
  'Impact of climate change on crop yield',
  'Graph neural networks survey',
  'Educational technology for personalized learning',
  'Large language models in chemistry research',
];

export default function AcademicPapersPage() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [history, setHistory] = useState<Array<{ query: string; timestamp: string }>>([]);
  const [bookmarks, setBookmarks] = useState<Paper[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (err) {
      console.warn('Failed to restore papers state', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (err) {
      console.warn('Failed to persist papers history', err);
    }
  }, [history]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      console.warn('Failed to persist paper bookmarks', err);
    }
  }, [bookmarks]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchQuery(query);
  };

  const handleSearchQuery = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    if (!isOnline) {
      setError('You appear to be offline. Reconnect to search Semantic Scholar.');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);
    setQuery(searchQuery);
    
    try {
      const params = new URLSearchParams({ query: searchQuery, limit: '20' });
      const response = await fetch(`/api/academic/papers?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Search service returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPapers(data.data.papers || []);
        setHistory((prev) => [{ query: searchQuery, timestamp: new Date().toISOString() }, ...prev.filter((item) => item.query !== searchQuery)]);
      } else {
        setPapers([]);
        setError(data.message || 'No papers found for this query.');
      }
    } catch (error) {
      console.error('Paper search error:', error);
      setPapers([]);
      setError('Unable to fetch papers right now. Try again in a moment.');
      toast.error('Paper search failed');
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: Paper['authors']) => {
    if (!authors || authors.length === 0) return 'Unknown authors';
    if (authors.length <= 2) return authors.map(a => a.name).join(' & ');
    return `${authors[0].name} et al.`;
  };

  const getCitationBadgeColor = (count: number) => {
    if (count > 1000) return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (count > 500) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    if (count > 100) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
  };

  const toggleBookmark = (paper: Paper) => {
    setBookmarks((prev) => {
      const exists = prev.some((item) => item.paperId === paper.paperId);
      if (exists) {
        toast('Removed bookmark');
        return prev.filter((item) => item.paperId !== paper.paperId);
      }
      toast.success('Paper saved');
      return [paper, ...prev];
    });
  };

  const exportBookmarks = async () => {
    if (bookmarks.length === 0) {
      toast('No bookmarks to export');
      return;
    }
    setExporting(true);
    try {
      const blob = new Blob([JSON.stringify(bookmarks, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'mentark-bookmarked-papers.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Bookmarks exported');
    } catch (err) {
      console.error('Export bookmarks error', err);
      toast.error('Failed to export bookmarks');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Results shown are from your saved searches."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Library className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Academic Papers
                </h1>
                <p className="text-slate-400">Search research papers from Semantic Scholar</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span>Connected to Semantic Scholar</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline &mdash; saved history will still be available</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <Card className="mb-4 bg-red-500/10 border-red-500/30">
              <CardContent className="py-3 text-sm text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </CardContent>
            </Card>
          )}

          {/* Search Form */}
          <Card className="bg-slate-900/50 border-yellow-500/30 mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search for research papers, topics, authors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    {QUERY_TEMPLATES.map((template) => (
                      <Button
                        key={template}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                        onClick={() => handleSearchQuery(template)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> {template}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || !isOnline}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Searching...
                    </>
                  ) : isOnline ? (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  ) : (
                    'Reconnect to search'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <BookmarkCheck className="h-4 w-4 text-yellow-300" />
              <span>Recent searches:</span>
              {history.map((item) => (
                <Button
                  key={`${item.query}-${item.timestamp}`}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-yellow-300 hover:text-yellow-400"
                  onClick={() => handleSearchQuery(item.query)}
                >
                  {item.query}
                </Button>
              ))}
            </div>
          )}

          {bookmarks.length > 0 && (
            <div className="mb-6 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-300"
                onClick={exportBookmarks}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2" />
                    Preparing bookmarks...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" /> Export Bookmarks ({bookmarks.length})
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && papers.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Search Results ({papers.length})
                </h2>
                <span className="text-xs text-slate-400">Showing top {papers.length} matches</span>
              </div>

              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardContent className="py-4">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                      <span>Highest citations: {Math.max(...papers.map((p) => p.citationCount))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>Newest year: {Math.max(...papers.map((p) => p.year || 0))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-yellow-400" />
                      <span>Top author: {formatAuthors(papers[0].authors)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {papers.map((paper) => (
                <Card key={paper.paperId} className="bg-slate-900/50 border-yellow-500/30 hover:border-yellow-500/70 transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-yellow-400 transition-colors"
                          >
                            {paper.title}
                          </a>
                        </h3>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {paper.year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{paper.year}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{formatAuthors(paper.authors)}</span>
                        </div>
                        {paper.venue && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{paper.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Citations */}
                      <div className="flex items-center gap-2">
                        <Badge className={getCitationBadgeColor(paper.citationCount)}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {paper.citationCount} citations
                        </Badge>
                        <Badge variant="outline" className="bg-slate-800">
                          Influence: {paper.influence.toFixed(2)}
                        </Badge>
                      </div>

                      {/* Abstract */}
                      {paper.abstract && (
                        <div>
                          <p className="text-sm text-slate-400 line-clamp-3">
                            {paper.abstract}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                       <div className="pt-2">
                        <div className="flex items-center gap-3">
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-500 transition-colors"
                          >
                            <span className="text-sm font-semibold">Read Paper</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-400 hover:text-yellow-300"
                            onClick={() => toggleBookmark(paper)}
                          >
                            <BookmarkCheck className="w-4 h-4 mr-1" />
                            {bookmarks.some((item) => item.paperId === paper.paperId) ? 'Saved' : 'Save'}
                          </Button>
                        </div>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {bookmarks.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-yellow-300" /> Saved papers ({bookmarks.length})
              </h2>
              {bookmarks.map((paper) => (
                <Card key={`bookmark-${paper.paperId}`} className="bg-slate-900/40 border-slate-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-yellow-300 hover:text-yellow-200">
                          {paper.title}
                        </a>
                        <p className="text-xs text-slate-500 mt-1">{formatAuthors(paper.authors)} • {paper.year ?? 'Unknown'}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-red-300"
                        onClick={() => toggleBookmark(paper)}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && hasSearched && papers.length === 0 && (
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <Library className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Papers Found</h3>
                    <p className="text-slate-400 text-sm">
                      Try a different search query or check your spelling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !hasSearched && (
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <Library className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Discover Research Papers</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Search millions of academic papers from Semantic Scholar
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-300">Latest Research</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-300">Author Search</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                        <FileText className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-300">Topic Discovery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
