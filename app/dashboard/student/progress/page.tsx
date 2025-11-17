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
  Plus,
  CheckCircle2,
  AlertCircle,
  Edit,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';
import type { SMARTGoal } from '@/lib/services/smart-goals';

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
  const [smartGoals, setSmartGoals] = useState<SMARTGoal[]>([]);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [parsedGoal, setParsedGoal] = useState<Partial<SMARTGoal> | null>(null);

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
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-yellow-500/30">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">🥇 Leaderboard</TabsTrigger>
              <TabsTrigger value="goals">🎯 SMART Goals</TabsTrigger>
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

            <TabsContent value="goals" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">SMART Goals</h2>
                <Button
                  onClick={() => setShowCreateGoal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>

              {smartGoals.length > 0 ? (
                <div className="space-y-4">
                  {smartGoals.map((goal) => (
                    <Card key={goal.id} className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white">{goal.title}</CardTitle>
                          <Badge className={`${
                            goal.currentProgress >= 100 ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            goal.currentProgress >= 50 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          }`}>
                            {goal.currentProgress}% Complete
                          </Badge>
                        </div>
                        <CardDescription>{goal.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Progress value={goal.currentProgress} className="h-2" />
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-slate-400 mb-1 block">Target Date</Label>
                              <p className="text-white">{new Date(goal.targetDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-slate-400 mb-1 block">Milestones</Label>
                              <p className="text-white">
                                {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length} completed
                              </p>
                            </div>
                          </div>
                          {goal.milestones.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-400">Milestones</Label>
                              {goal.milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700">
                                  {milestone.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                                  )}
                                  <span className={`text-sm flex-1 ${milestone.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                                    {milestone.title}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {new Date(milestone.targetDate).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-12 pb-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <Target className="w-16 h-16 text-yellow-400 opacity-50" />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">No SMART Goals Yet</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Set specific, measurable goals to track your progress
                        </p>
                        <Button
                          onClick={() => setShowCreateGoal(true)}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Goal
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Create SMART Goal Dialog */}
          <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-yellow-400">Create SMART Goal</DialogTitle>
                <DialogDescription>
                  Set a Specific, Measurable, Achievable, Relevant, Time-bound goal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-title" className="text-slate-300 mb-2 block">Goal Title *</Label>
                  <Input
                    id="goal-title"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Complete Data Science Course"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-text" className="text-slate-300 mb-2 block">Goal Description (Natural Language)</Label>
                  <Textarea
                    id="goal-text"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    placeholder="Describe your goal in natural language. AI will help break it down into SMART components..."
                    rows={4}
                    className="bg-slate-800 border-slate-700"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                    onClick={async () => {
                      if (!goalText) {
                        toast.error('Please enter a goal description');
                        return;
                      }
                      try {
                        const response = await fetch('/api/smart-goals/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ text: goalText })
                        });

                        if (response.ok) {
                          const data = await response.json();
                          if (data.success) {
                            setParsedGoal(data.data.goal);
                            toast.success('Goal parsed! Review the SMART components below.');
                          }
                        }
                      } catch (error) {
                        console.error('Failed to parse goal:', error);
                        toast.error('Failed to parse goal');
                      }
                    }}
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    Parse with AI
                  </Button>
                </div>
                <div>
                  <Label htmlFor="goal-date" className="text-slate-300 mb-2 block">Target Date *</Label>
                  <Input
                    id="goal-date"
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                {parsedGoal && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <Label className="text-blue-400 font-semibold">AI-Parsed SMART Components</Label>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <Label className="text-slate-400 mb-1 block">Specific</Label>
                        <p className="text-slate-300">{parsedGoal.specific || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400 mb-1 block">Measurable</Label>
                        <p className="text-slate-300">{parsedGoal.measurable || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400 mb-1 block">Achievable</Label>
                        <p className="text-slate-300">{parsedGoal.achievable || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-400 mb-1 block">Relevant</Label>
                        <p className="text-slate-300">{parsedGoal.relevant || 'Not specified'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-slate-400 mb-1 block">Time-bound</Label>
                        <p className="text-slate-300">{parsedGoal.timebound || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (!goalTitle || !goalTargetDate) {
                        toast.error('Title and target date are required');
                        return;
                      }
                      const newGoal: SMARTGoal = {
                        id: `goal-${Date.now()}`,
                        title: goalTitle,
                        description: goalText,
                        specific: parsedGoal?.specific || '',
                        measurable: parsedGoal?.measurable || '',
                        achievable: parsedGoal?.achievable || '',
                        relevant: parsedGoal?.relevant || '',
                        timebound: parsedGoal?.timebound || `By ${goalTargetDate}`,
                        targetDate: new Date(goalTargetDate),
                        currentProgress: 0,
                        milestones: [],
                        metrics: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                      };
                      setSmartGoals(prev => [newGoal, ...prev]);
                      setShowCreateGoal(false);
                      setGoalTitle('');
                      setGoalText('');
                      setGoalTargetDate('');
                      setParsedGoal(null);
                      toast.success('SMART goal created!');
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    Create Goal
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-400"
                    onClick={() => {
                      setShowCreateGoal(false);
                      setGoalTitle('');
                      setGoalText('');
                      setGoalTargetDate('');
                      setParsedGoal(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}

