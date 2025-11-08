'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, MessageCircle, Sparkles, Star, Filter, Download, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface PeerMatch {
  student_id: string;
  name: string;
  avatar?: string;
  grade?: string;
  interests: string[];
  goals: string[];
  compatibility_score: number;
  match_type: 'similar_interests' | 'complementary' | 'study_buddy';
  factors: string[];
}

interface CurrentProfile {
  interests: string[];
  goals: string[];
  top_career_categories: string[];
}

export default function PeerMatchesPage() {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<PeerMatch[]>([]);
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [error, setError] = useState('');
  const [matchTypeFilter, setMatchTypeFilter] = useState<'all' | 'study_buddy' | 'similar_interests' | 'complementary'>('all');
  const [isOnline, setIsOnline] = useState(true);
  const [history, setHistory] = useState<Array<{ timestamp: string; matches: number }>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedMatches = localStorage.getItem('mentark-peer-matches-latest');
      if (storedMatches) {
        const parsed = JSON.parse(storedMatches);
        setMatches(parsed.matches || []);
        setProfile(parsed.profile || null);
      }
      const storedHistory = localStorage.getItem('mentark-peer-matches-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.warn('Failed to restore peer matches state', err);
    }
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
    localStorage.setItem('mentark-peer-matches-history', JSON.stringify(history.slice(0, 5)));
  }, [history]);

  const handleFindMatches = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setError('You are offline. Reconnect to refresh matches.');
      toast.error('Offline — cannot fetch matches');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/peer-matching/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: {} }),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setMatches(data.data.matches || []);
        setProfile(data.data.current_profile || null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'mentark-peer-matches-latest',
            JSON.stringify({ matches: data.data.matches || [], profile: data.data.current_profile || null })
          );
        }
        setHistory((prev) => [
          { timestamp: new Date().toISOString(), matches: (data.data.matches || []).length },
          ...prev,
        ]);
        toast.success('Peer matches updated');
      } else {
        setError(data.message || 'Failed to find peer matches');
      }
    } catch (error) {
      console.error('Peer matching error:', error);
      setError('Failed to find peer matches. Please try again.');
      toast.error('Peer matching failed');
    } finally {
      setLoading(false);
    }
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case 'study_buddy': return <Users className="w-4 h-4" />;
      case 'complementary': return <Star className="w-4 h-4" />;
      case 'similar_interests': return <Sparkles className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'study_buddy': return 'Study Buddy';
      case 'complementary': return 'Complementary';
      case 'similar_interests': return 'Similar Interests';
      default: return 'Match';
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'study_buddy': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'complementary': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'similar_interests': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const filteredMatches = useMemo(() => {
    if (matchTypeFilter === 'all') return matches;
    return matches.filter((match) => match.match_type === matchTypeFilter);
  }, [matches, matchTypeFilter]);

  const exportMatches = () => {
    if (matches.length === 0) {
      toast.info('No matches yet', {
        description: 'Run a search to export peer recommendations.',
      });
      return;
    }
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        matches,
        profile,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'peer-matches.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Export ready', {
        description: 'Peer recommendations saved as JSON in your downloads.',
      });
    } catch (err) {
      console.error('Export matches failed', err);
      toast.error('Export failed', {
        description: 'Please retry after checking your connection.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Peer recommendations are based on your last successful search."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Peer Matches
                </h1>
                <p className="text-slate-400">Connect with compatible study partners</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <span className="inline-flex items-center gap-1"><Wifi className="h-4 w-4 text-green-400" /> Online</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-300"><WifiOff className="h-4 w-4 text-red-400" /> Offline</span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                onClick={exportMatches}
                disabled={matches.length === 0}
              >
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <Alert className="mb-4 bg-slate-900/60 border-yellow-500/20">
              <AlertDescription className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                Recent runs:
                {history.slice(0, 5).map((entry) => (
                  <Badge key={entry.timestamp} variant="outline" className="border-yellow-500/40 text-yellow-300">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {entry.matches} matches
                  </Badge>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Display */}
          {profile && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-yellow-400">Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-amber-400 mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests?.slice(0, 5).map((interest, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-800">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-amber-400 mb-2">Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.goals?.slice(0, 3).map((goal, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-800">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-amber-400 mb-2">Career Interest</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.top_career_categories?.map((cat, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-800">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          {!loading && matches.length === 0 && (
            <Card className="bg-slate-900/50 border-yellow-500/30 mb-6">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <Users className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Find Your Study Partners</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Connect with students who share your interests and goals
                    </p>
                    <Button
                      onClick={handleFindMatches}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Find Matches
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="bg-red-500/10 border-red-500/30 mb-6">
              <CardContent className="pt-6">
                <p className="text-red-400 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Matches */}
          {!loading && matches.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Your Matches ({filteredMatches.length})
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={matchTypeFilter} onValueChange={(value: any) => setMatchTypeFilter(value)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                      <SelectValue placeholder="Match Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="study_buddy">Study Buddy</SelectItem>
                      <SelectItem value="similar_interests">Similar Interests</SelectItem>
                      <SelectItem value="complementary">Complementary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleFindMatches}
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Refresh Matches
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredMatches.map((match) => (
                  <Card key={match.student_id} className="bg-slate-900/50 border-yellow-500/30 hover:border-yellow-500/70 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                            {match.avatar ? (
                              <img src={match.avatar} alt={match.name} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                              <Users className="w-8 h-8 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-white">{match.name}</CardTitle>
                            {match.grade && (
                              <CardDescription className="text-slate-400">
                                {match.grade}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <Badge className={getMatchTypeColor(match.match_type)}>
                          {getMatchTypeIcon(match.match_type)}
                          <span className="ml-1">{getMatchTypeLabel(match.match_type)}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Compatibility Score */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Compatibility:</span>
                        <span className={`text-2xl font-bold ${getCompatibilityColor(match.compatibility_score)}`}>
                          {Math.round(match.compatibility_score * 100)}%
                        </span>
                      </div>

                      {/* Interests */}
                      {match.interests && match.interests.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {match.interests.slice(0, 4).map((interest, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-slate-800 border-slate-700">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goals */}
                      {match.goals && match.goals.length > 0 && (
                        <div>
                          <p className="text-sm text-slate-500 mb-2">Goals</p>
                          <div className="flex flex-wrap gap-2">
                            {match.goals.slice(0, 3).map((goal, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-slate-800 border-slate-700">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Match Factors */}
                      {match.factors && match.factors.length > 0 && (
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <p className="text-xs text-yellow-400 font-semibold mb-2">Why you match</p>
                          <ul className="space-y-1">
                            {match.factors.map((factor, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                                <span className="text-yellow-400">•</span>
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredMatches.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  No matches for this filter right now. Try refreshing or switching types.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

