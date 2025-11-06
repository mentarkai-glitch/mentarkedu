'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Library, Search, ExternalLink, Users, Calendar, TrendingUp, FileText, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function AcademicPapersPage() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch('/api/academic/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          limit: 20,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPapers(data.data.papers || []);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error('Paper search error:', error);
      setPapers([]);
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

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
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
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

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
              </div>
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
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-500 transition-colors"
                        >
                          <span className="text-sm font-semibold">Read Paper</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
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
