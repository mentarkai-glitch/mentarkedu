'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Trophy,
  Award,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Users,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface XPData {
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  transactions: Array<{
    id: string;
    amount: number;
    source: string;
    description: string;
    created_at: string;
  }>;
}

interface BadgeData {
  earned: Array<{
    id: string;
    earned_at: string;
    achievements: {
      type: string;
      title: string;
      description: string;
      icon_url?: string;
    };
  }>;
  available: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    icon_url?: string;
  }>;
  totalEarned: number;
  totalAvailable: number;
}

interface LeaderboardEntry {
  rank: number;
  xp_total: number;
  level: number;
  students: {
    user_id: string;
    users: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
    if (typeof window !== 'undefined') {
      const updateStatus = () => setIsOnline(navigator.onLine);
      updateStatus();
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
      return () => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
      };
    }
  }, []);

  const loadAllData = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      toast('Offline — showing last loaded progress');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [xpRes, badgesRes, leaderRes] = await Promise.all([
        fetch('/api/gamification/xp'),
        fetch('/api/gamification/badges'),
        fetch('/api/gamification/leaderboard'),
      ]);

      const [xpJson, badgesJson, leaderJson] = await Promise.all([
        xpRes.json(),
        badgesRes.json(),
        leaderRes.json(),
      ]);

      if (xpJson.success) setXpData(xpJson.data);
      if (badgesJson.success) setBadgeData(badgesJson.data);
      if (leaderJson.success) {
        setLeaderboard(leaderJson.data.leaderboard || []);
        setUserPosition(leaderJson.data.userPosition);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      setError('Unable to load progress data. Please try again.');
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ark_milestone': return <Target className="w-4 h-4" />;
      case 'daily_checkin': return <Calendar className="w-4 h-4" />;
      case 'badge_earned': return <Award className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'ark_milestone': return 'text-blue-400';
      case 'daily_checkin': return 'text-green-400';
      case 'badge_earned': return 'text-yellow-400';
      default: return 'text-purple-400';
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const frequentSources = useMemo(() => {
    if (!xpData) return [] as Array<{ source: string; total: number }>;
    const map = new Map<string, number>();
    xpData.transactions.forEach((txn) => {
      map.set(txn.source, (map.get(txn.source) || 0) + txn.amount);
    });
    return Array.from(map.entries())
      .map(([source, total]) => ({ source, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [xpData]);

  const exportProgress = () => {
    if (!xpData && !badgeData && leaderboard.length === 0) {
      toast.info('No progress data yet', {
        description: 'Complete activities to build an exportable snapshot.',
      });
      return;
    }
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        xpData,
        badgeData,
        leaderboard,
        userPosition,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'progress-overview.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Export ready', {
        description: 'Progress overview saved as JSON in your downloads.',
      });
    } catch (err) {
      console.error('Progress export failed', err);
      toast.error('Export failed', {
        description: 'Please retry after checking your connection.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Progress data is shown from your last sync."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <BarChart3 className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Progress Tracking
                </h1>
                <p className="text-slate-400">Your learning journey analytics</p>
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
                onClick={exportProgress}
              >
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                onClick={loadAllData}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {error && (
              <Alert className="mb-4 bg-red-500/10 border-red-500/30">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-yellow-500/30">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">🥇 Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total XP</p>
                        <p className="text-3xl font-bold text-white">{xpData?.totalXp || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                        <Target className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Current Level</p>
                        <p className="text-3xl font-bold text-white">Level {xpData?.level || 1}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                        <Trophy className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Badges Earned</p>
                        <p className="text-3xl font-bold text-white">
                          {badgeData?.totalEarned || 0}/{badgeData?.totalAvailable || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Level Progress */}
              {xpData && (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Level Progress</CardTitle>
                    <CardDescription>
                      {xpData.xpToNextLevel} XP needed for Level {xpData.level + 1}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={(xpData.totalXp % 1000) / 10} 
                      className="h-3"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {xpData && xpData.transactions.length > 0 && (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {xpData.transactions.slice(0, 10).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`${getSourceColor(transaction.source)}`}>
                              {getSourceIcon(transaction.source)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {transaction.description || transaction.source}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              +{transaction.amount} XP
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {frequentSources.length > 0 && (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400">Top XP Sources</CardTitle>
                    <CardDescription>Where you earn the most XP</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {frequentSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <span className="text-sm text-slate-300 capitalize">{source.source.replace(/_/g, ' ')}</span>
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">+{source.total} XP</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="mt-6 space-y-6">
              {/* Earned Badges */}
              {badgeData && badgeData.earned.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Your Achievements</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badgeData.earned.map((badge) => (
                      <Card key={badge.id} className="bg-slate-900/50 border-yellow-500/30">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                              <Award className="w-10 h-10 text-yellow-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{badge.achievements.title}</h4>
                              <p className="text-xs text-slate-400 mt-1">{badge.achievements.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Earned {new Date(badge.earned_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Badges */}
              {badgeData && badgeData.available.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Available to Unlock</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badgeData.available.map((badge) => (
                      <Card key={badge.id} className="bg-slate-900/50 border-slate-700 opacity-60">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <Award className="w-10 h-10 text-slate-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-400">{badge.title}</h4>
                              <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              {userPosition && (
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-400 mb-1">Your Position</p>
                        <p className="text-3xl font-bold text-white">
                          {getMedalEmoji(userPosition.rank)}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {userPosition.xp_total} XP • Level {userPosition.level}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Keep Going!
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Institute Leaderboard</CardTitle>
                  <CardDescription>Top performers in your institute</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboard.map((entry, idx) => (
                      <div
                        key={entry.students.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          userPosition && entry.students.user_id === userPosition.user_id
                            ? 'bg-yellow-500/20 border-yellow-500'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold w-12 text-center">
                            {getMedalEmoji(entry.rank)}
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                            <Users className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {entry.students.users.full_name}
                              {userPosition && entry.students.user_id === userPosition.user_id && (
                                <Badge className="ml-2 bg-yellow-500 text-black">You</Badge>
                              )}
                            </p>
                            <p className="text-sm text-slate-400">
                              Level {entry.level} • {entry.xp_total} XP
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black">
                          Rank #{entry.rank}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

