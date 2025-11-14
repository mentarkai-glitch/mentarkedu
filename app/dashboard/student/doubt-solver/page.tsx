'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, CheckCircle, Lightbulb, Clipboard, Clock, Play, ExternalLink } from 'lucide-react';
import { OfflineBanner } from '@/components/ui/offline-banner';

const HISTORY_KEY = 'mentark-doubt-history-v1';

type DoubtCategory = 'math' | 'science' | 'programming' | 'exam' | 'general';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  duration: string;
  view_count: number;
  url: string;
  embed_url: string;
}

interface SolvedDoubt {
  question: string;
  answer: string;
  category: DoubtCategory;
  timestamp: string;
  videos?: YouTubeVideo[];
}

const EXAMPLE_DOUBTS: Array<{ prompt: string; category: DoubtCategory }> = [
  { prompt: 'Explain quantum entanglement like I am 15.', category: 'science' },
  { prompt: 'Solve 2x^2 + 5x - 3 = 0 step by step.', category: 'math' },
  { prompt: 'Help me debug a JavaScript function that returns NaN.', category: 'programming' },
  { prompt: 'How should I revise for the board exams in 30 days?', category: 'exam' },
  { prompt: 'Difference between mentorship and coaching?', category: 'general' },
];

export default function DoubtSolverPage() {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<DoubtCategory>('general');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SolvedDoubt[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored) as SolvedDoubt[]);
      }
    } catch (err) {
      console.warn('Failed to parse doubt history', err);
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
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
    } catch (err) {
      console.warn('Failed to persist doubt history', err);
    }
  }, [history]);

  const recentNotes = useMemo(() => history.slice(0, 3), [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!isOnline) {
      setError('You are offline. Reconnect to get a verified answer.');
      return;
    }

    setLoading(true);
    setAnswer('');
    setVideos([]);
    setError(null);

    try {
      const response = await fetch('/api/doubt-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ question, category }),
      });

      if (!response.ok) {
        throw new Error(`Solver returned ${response.status}`);
      }

      const data = await response.json();
      const solution = data.data || data;
      const resolvedAnswer = solution.answer || solution.explanation || solution.error || 'No answer generated';
      const resolvedVideos = solution.videos || [];
      
      setAnswer(resolvedAnswer);
      setVideos(resolvedVideos);
      
      setHistory((prev) => [
        {
          question: question.trim(),
          answer: resolvedAnswer,
          category,
          timestamp: new Date().toISOString(),
          videos: resolvedVideos,
        },
        ...prev,
      ].slice(0, 10));
      setQuestion('');
    } catch (error) {
      console.error(error);
      setError('Error solving your doubt. Please try again.');
      setAnswer('Error solving your doubt. Please try again.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = async () => {
    if (!answer || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(answer);
      setError(null);
    } catch (err) {
      console.warn('Failed to copy answer', err);
      setError('Copy failed. Select and copy manually.');
    }
  };

  const handleExampleClick = (example: { prompt: string; category: DoubtCategory }) => {
    setQuestion(example.prompt);
    setCategory(example.category);
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Doubt Solver
          </h1>
          <p className="text-slate-400">Get verified answers powered by AI + Wolfram Alpha</p>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Draft your question now and send it once you reconnect."
            className="mt-3"
          />
        </motion.div>

        <Card className="bg-slate-800/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Sparkles className="w-5 h-5" />
              Ask Anything
            </CardTitle>
            <CardDescription>
              I combine AI reasoning with verified computational data to give you accurate answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
              {EXAMPLE_DOUBTS.map((example) => (
                <Badge
                  key={`${example.prompt}-${example.category}`}
                  onClick={() => handleExampleClick(example)}
                  className="cursor-pointer border border-yellow-500/40 bg-slate-900/60 text-yellow-300 hover:bg-yellow-500/10"
                >
                  <Lightbulb className="mr-1 h-3 w-3" /> {example.prompt}
                </Badge>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Describe your doubt in detail..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={category} onValueChange={(value: DoubtCategory) => setCategory(value)}>
                  <SelectTrigger className="sm:max-w-xs bg-slate-900 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="math">Math</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="exam">Exam Prep</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={loading || !question.trim() || !isOnline}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Solving...
                    </>
                  ) : isOnline ? (
                    'Solve My Doubt'
                  ) : (
                    'Waiting for connection'
                  )}
                </Button>
              </div>
            </form>

            {answer && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-green-500/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-400">Verified Answer</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={handleCopyAnswer}
                      className="ml-auto text-xs text-slate-300 hover:text-white"
                    >
                      <Clipboard className="w-4 h-4 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-slate-200 whitespace-pre-wrap">{answer}</p>
                </motion.div>

                {videos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-yellow-500/30"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Play className="w-5 h-5 text-yellow-400" />
                      <span className="font-semibold text-yellow-400">Video Explanations</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((video) => (
                        <motion.a
                          key={video.id}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative rounded-lg overflow-hidden border border-slate-700 hover:border-yellow-500/50 transition-all bg-slate-800/50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative aspect-video bg-slate-900">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                <Play className="w-6 h-6 text-white ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white">
                              {video.duration}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-yellow-400 transition-colors">
                              {video.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span className="line-clamp-1">{video.channel_title}</span>
                              <div className="flex items-center gap-2">
                                <span>{video.view_count.toLocaleString()} views</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {recentNotes.length > 0 && (
          <Card className="mt-8 bg-slate-900/60 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-100 text-lg">
                <Clock className="w-4 h-4 text-yellow-400" /> Recent solutions
              </CardTitle>
              <CardDescription>Your last answered questions are stored locally so you can revisit them quickly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentNotes.map((item, index) => (
                <div key={index} className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 capitalize">
                      {item.category}
                    </Badge>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200 font-semibold mb-2">{item.question}</p>
                  <p className="text-sm text-slate-300 line-clamp-3">{item.answer}</p>
                </div>
              ))}
              {history.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:text-white"
                  onClick={() => setHistory([])}
                >
                  Clear history
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

