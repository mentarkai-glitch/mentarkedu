'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  FileQuestion, 
  BookOpen,
  AlertCircle,
  Loader2,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RelatedDoubt {
  id: string;
  question: string;
  topic?: string;
  subject?: string;
  solution?: string;
  similarityScore?: number;
  reason?: string;
  createdAt?: string;
  hasSolution?: boolean;
}

interface RelatedDoubtsProps {
  question?: string;
  topic?: string;
  subject?: string;
  limit?: number;
  autoLoad?: boolean;
  onSelectDoubt?: (doubt: RelatedDoubt) => void;
  compact?: boolean;
}

export function RelatedDoubts({ 
  question, 
  topic, 
  subject, 
  limit = 5,
  autoLoad = false,
  onSelectDoubt,
  compact = false,
}: RelatedDoubtsProps) {
  const [relatedDoubts, setRelatedDoubts] = useState<RelatedDoubt[]>([]);
  const [groupedByTopic, setGroupedByTopic] = useState<Record<string, RelatedDoubt[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDoubt, setExpandedDoubt] = useState<string | null>(null);

  useEffect(() => {
    if (autoLoad && (question || topic)) {
      fetchRelatedDoubts();
    }
  }, [autoLoad, question, topic, subject]);

  const fetchRelatedDoubts = async () => {
    if (!question && !topic) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (question) params.append('question', question);
      if (topic) params.append('topic', topic);
      if (subject) params.append('subject', subject);

      const response = await fetch(`/api/doubt-solver/related?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related doubts');
      }

      const result = await response.json();
      
      if (result.success) {
        setRelatedDoubts(result.data.relatedDoubts || []);
        setGroupedByTopic(result.data.groupedByTopic || {});
      } else {
        throw new Error(result.error || 'Failed to load related doubts');
      }
    } catch (err: any) {
      console.error('Related doubts error:', err);
      setError(err.message || 'Failed to load related doubts');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (score >= 0.6) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Very Similar';
    if (score >= 0.6) return 'Similar';
    return 'Related';
  };

  if (compact && relatedDoubts.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className={`bg-slate-900/50 border-blue-500/30 ${compact ? '' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Related Doubts
            </CardTitle>
            <CardDescription>
              {loading ? 'Finding similar questions...' : 
               relatedDoubts.length > 0 
                ? `${relatedDoubts.length} related question${relatedDoubts.length !== 1 ? 's' : ''} found`
                : 'Find similar or related questions'}
            </CardDescription>
          </div>
          {!autoLoad && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRelatedDoubts}
              disabled={loading || (!question && !topic)}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Related
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
            <Button 
              onClick={fetchRelatedDoubts} 
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && relatedDoubts.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {question || topic 
                ? 'No related doubts found. Try a different question or topic.' 
                : 'Enter a question or topic to find related doubts'}
            </p>
          </div>
        )}

        {!loading && !error && relatedDoubts.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {relatedDoubts.map((doubt, idx) => (
                <motion.div
                  key={doubt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className={`bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer ${
                      expandedDoubt === doubt.id ? 'border-blue-500/70' : ''
                    }`}
                    onClick={() => {
                      if (onSelectDoubt) {
                        onSelectDoubt(doubt);
                      } else {
                        setExpandedDoubt(expandedDoubt === doubt.id ? null : doubt.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white font-medium line-clamp-2 mb-1">
                                {doubt.question}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {doubt.topic && (
                                  <Badge variant="outline" className="text-xs bg-slate-700/50">
                                    {doubt.topic}
                                  </Badge>
                                )}
                                {doubt.subject && (
                                  <Badge variant="outline" className="text-xs bg-slate-700/50">
                                    {doubt.subject}
                                  </Badge>
                                )}
                                {doubt.similarityScore !== undefined && (
                                  <Badge className={`${getSimilarityColor(doubt.similarityScore)} text-xs`}>
                                    {getSimilarityLabel(doubt.similarityScore)}
                                  </Badge>
                                )}
                                {doubt.hasSolution && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    Solved
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight 
                              className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                                expandedDoubt === doubt.id ? 'transform rotate-90' : ''
                              }`}
                            />
                          </div>

                          {doubt.reason && (
                            <p className="text-xs text-slate-400 mb-2">
                              💡 {doubt.reason}
                            </p>
                          )}

                          <AnimatePresence>
                            {expandedDoubt === doubt.id && doubt.solution && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-slate-700"
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-yellow-400 font-semibold">Solution:</p>
                                </div>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                  {doubt.solution}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {doubt.createdAt && (
                            <p className="text-xs text-slate-500 mt-2">
                              Asked {new Date(doubt.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Grouped by Topic View (optional) */}
        {!loading && !error && Object.keys(groupedByTopic).length > 1 && (
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-3">Grouped by Topic:</p>
            <div className="space-y-3">
              {Object.entries(groupedByTopic).map(([topicName, doubts]) => (
                <div key={topicName} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <p className="text-sm font-semibold text-white">{topicName}</p>
                    <Badge variant="outline" className="text-xs bg-slate-700/50">
                      {doubts.length} question{doubts.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {doubts.slice(0, 3).map((doubt) => (
                      <p 
                        key={doubt.id} 
                        className="text-xs text-slate-300 line-clamp-1 pl-6 hover:text-white cursor-pointer"
                        onClick={() => onSelectDoubt ? onSelectDoubt(doubt) : setExpandedDoubt(doubt.id)}
                      >
                        • {doubt.question}
                      </p>
                    ))}
                    {doubts.length > 3 && (
                      <p className="text-xs text-slate-500 pl-6">
                        + {doubts.length - 3} more...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && relatedDoubts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-400">
              Click on a question to view solution or {onSelectDoubt ? 'select it' : 'expand details'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





