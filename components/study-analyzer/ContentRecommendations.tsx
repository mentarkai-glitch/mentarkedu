'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Video, 
  FileText, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck,
  Loader2,
  Search,
  AlertCircle,
  Sparkles,
  Filter,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentRecommendation {
  id: string;
  title: string;
  type: 'video' | 'article';
  url: string;
  source: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  thumbnailUrl?: string;
  language: string;
  createdAt: string;
  bookmarked?: boolean;
}

interface ContentRecommendationsProps {
  topic?: string;
  subject?: string;
  difficulty?: string;
  autoLoad?: boolean;
}

export function ContentRecommendations({ 
  topic, 
  subject, 
  difficulty: initialDifficulty = 'medium',
  autoLoad = false,
}: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTopic, setSearchTopic] = useState(topic || '');
  const [searchSubject, setSearchSubject] = useState(subject || '');
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'video' | 'article'>('all');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  useEffect(() => {
    if (autoLoad && (topic || subject)) {
      fetchRecommendations();
    }
  }, [autoLoad, topic, subject]);

  const fetchRecommendations = async () => {
    if (!searchTopic && !searchSubject) {
      setError('Please enter a topic or subject');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '10',
        difficulty,
      });

      if (searchTopic) params.append('topic', searchTopic);
      if (searchSubject) params.append('subject', searchSubject);

      const response = await fetch(`/api/study-analyzer/content-recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const result = await response.json();
      
      if (result.success) {
        setRecommendations(result.data.recommendations || []);
        if (result.data.recommendations.length === 0) {
          toast.info('No recommendations found. Try different search terms.');
        }
      } else {
        throw new Error(result.error || 'Failed to load recommendations');
      }
    } catch (err: any) {
      console.error('Content recommendations error:', err);
      setError(err.message || 'Failed to load recommendations');
      toast.error(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (recommendation: ContentRecommendation) => {
    const isBookmarked = bookmarkedIds.has(recommendation.id);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(
          `/api/study-analyzer/content-recommendations/bookmark?url=${encodeURIComponent(recommendation.url)}`,
          { method: 'DELETE', credentials: 'include' }
        );

        if (response.ok) {
          setBookmarkedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(recommendation.id);
            return newSet;
          });
          toast.success('Bookmark removed');
        }
      } else {
        // Add bookmark
        const response = await fetch(
          '/api/study-analyzer/content-recommendations/bookmark',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ recommendation }),
          }
        );

        if (response.ok) {
          setBookmarkedIds((prev) => new Set(prev).add(recommendation.id));
          toast.success('Bookmarked for later');
        }
      }
    } catch (err: any) {
      console.error('Bookmark error:', err);
      toast.error('Failed to update bookmark');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (showBookmarksOnly && !bookmarkedIds.has(rec.id)) return false;
    if (filterType !== 'all' && rec.type !== filterType) return false;
    return true;
  });

  return (
    <Card className="bg-slate-900/50 border-emerald-500/30">
      <CardHeader>
        <CardTitle className="text-emerald-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Content Recommendations
        </CardTitle>
        <CardDescription>
          AI-powered video and article recommendations based on your study topics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Topic</label>
              <Input
                placeholder="e.g., Quadratic Equations, Photosynthesis..."
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && fetchRecommendations()}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Subject</label>
              <Input
                placeholder="e.g., Mathematics, Biology..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && fetchRecommendations()}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">Type</label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchRecommendations}
                disabled={loading || (!searchTopic && !searchSubject)}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={showBookmarksOnly ? 'bg-emerald-500/20 text-emerald-400' : ''}
              >
                <BookmarkCheck className="w-4 h-4 mr-2" />
                Bookmarks Only
              </Button>
              <span className="text-xs text-slate-400">
                {filteredRecommendations.length} of {recommendations.length} shown
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <Button 
              onClick={fetchRecommendations} 
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {!loading && !error && filteredRecommendations.length === 0 && recommendations.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter a topic or subject to get AI-powered content recommendations</p>
          </div>
        )}

        {!loading && !error && filteredRecommendations.length === 0 && recommendations.length > 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>No recommendations match your filters. Try adjusting them.</p>
          </div>
        )}

        {/* Recommendations List */}
        {!loading && !error && filteredRecommendations.length > 0 && (
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <Card 
                key={rec.id} 
                className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail/Icon */}
                    <div className="flex-shrink-0">
                      {rec.type === 'video' ? (
                        rec.thumbnailUrl ? (
                          <img
                            src={rec.thumbnailUrl}
                            alt={rec.title}
                            className="w-32 h-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-red-500/30 flex items-center justify-center">
                            <Video className="w-8 h-8 text-red-400" />
                          </div>
                        )
                      ) : (
                        <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-blue-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 line-clamp-2">
                            {rec.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {rec.source}
                            </Badge>
                            <Badge className={getDifficultyColor(rec.difficulty)}>
                              {rec.difficulty}
                            </Badge>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              {rec.type === 'video' ? (
                                <Video className="w-3 h-3" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              {rec.duration}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(rec)}
                          className="flex-shrink-0"
                        >
                          {bookmarkedIds.has(rec.id) ? (
                            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Bookmark className="w-5 h-5 text-slate-400" />
                          )}
                        </Button>
                      </div>

                      <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                        {rec.description}
                      </p>

                      {rec.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          {rec.tags.slice(0, 4).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-slate-700/50"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(rec.url, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open {rec.type === 'video' ? 'Video' : 'Article'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && filteredRecommendations.length > 0 && (
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              Showing {filteredRecommendations.length} recommendation{filteredRecommendations.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





