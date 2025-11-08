'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Flame,
  Clock,
  Download,
  Filter,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface BadgeRecord {
  id: string;
  earned_at?: string;
  achievements?: {
    type: string;
    title: string;
    description: string;
    icon_url?: string;
    xp_reward?: number;
  };
  title?: string;
  description?: string;
  icon_url?: string;
  type?: string;
  difficulty?: string;
}

interface BadgePayload {
  earned: BadgeRecord[];
  available: BadgeRecord[];
  totalEarned: number;
  totalAvailable: number;
}

export default function AchievementsPage() {
  const [badgeData, setBadgeData] = useState<BadgePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');
  const [sort, setSort] = useState<'recent' | 'xp' | 'alpha'>('recent');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    fetchBadges();
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

  const fetchBadges = async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      toast.info('Offline mode', {
        description: 'You are viewing the last synced achievements.',
      });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gamification/badges', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setBadgeData(data.data);
      } else {
        setError(data.message || 'Unable to load achievements.');
      }
    } catch (err) {
      console.error('Achievements load failed', err);
      setError('An unexpected error occurred while loading achievements.');
    } finally {
      setLoading(false);
    }
  };

  const combinedBadges = useMemo(() => {
    if (!badgeData) return [] as Array<{ record: BadgeRecord; earned: boolean }>;
    const earned = (badgeData.earned || []).map((record) => ({ record, earned: true }));
    const available = (badgeData.available || []).map((record) => ({ record, earned: false }));
    return [...earned, ...available];
  }, [badgeData]);

  const filteredBadges = useMemo(() => {
    return combinedBadges
      .filter(({ earned }) => {
        if (filter === 'all') return true;
        if (filter === 'earned') return earned;
        return !earned;
      })
      .sort((a, b) => {
        if (sort === 'recent') {
          const dateA = a.record.earned_at ? new Date(a.record.earned_at).getTime() : 0;
          const dateB = b.record.earned_at ? new Date(b.record.earned_at).getTime() : 0;
          return dateB - dateA;
        }
        if (sort === 'xp') {
          const xpA = a.record.achievements?.xp_reward || 0;
          const xpB = b.record.achievements?.xp_reward || 0;
          return xpB - xpA;
        }
        const titleA = (a.record.achievements?.title || a.record.title || '').toLowerCase();
        const titleB = (b.record.achievements?.title || b.record.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });
  }, [combinedBadges, filter, sort]);

  const exportBadges = () => {
    if (!badgeData) {
      toast.info('No achievements yet', {
        description: 'Unlock badges to export your collection.',
      });
      return;
    }
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        badgeData,
        filter,
        sort,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'achievements.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Export ready', {
        description: 'Achievements saved as JSON in your downloads.',
      });
    } catch (err) {
      console.error('Achievements export failed', err);
      toast.error('Export failed', {
        description: 'Please retry after checking your connection.',
      });
    }
  };

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'streak':
        return <Flame className="h-6 w-6 text-orange-400" />;
      case 'speed':
        return <Clock className="h-6 w-6 text-cyan-400" />;
      case 'mastery':
        return <Star className="h-6 w-6 text-amber-400" />;
      default:
        return <Medal className="h-6 w-6 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Viewing cached achievements."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Achievements
                </h1>
                <p className="text-slate-400">Celebrate milestones and see what&apos;s next to unlock.</p>
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
                onClick={exportBadges}
                disabled={!badgeData}
              >
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/30">
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400">Badges Earned</p>
                <p className="text-3xl font-bold text-white">
                  {badgeData?.totalEarned || 0}
                  <span className="text-sm text-slate-500"> / {badgeData?.totalAvailable || 0}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400">Latest Badge</p>
                <p className="text-lg font-semibold text-white">
                  {badgeData?.earned?.[0]?.achievements?.title || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  {badgeData?.earned?.[0]?.earned_at
                    ? new Date(badgeData.earned[0].earned_at!).toLocaleDateString()
                    : 'No badges yet'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400">Focus Badge</p>
                <p className="text-lg font-semibold text-white">
                  {badgeData?.available?.[0]?.title || 'Complete more ARKs'}
                </p>
                <p className="text-xs text-slate-500">Next unlock waiting for you</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/50 border-yellow-500/30">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Filter className="h-5 w-5" /> Badge Library
                </CardTitle>
                <CardDescription>Filter and explore your collection.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={filter} onValueChange={(value: 'all' | 'earned' | 'available') => setFilter(value)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Badges</SelectItem>
                    <SelectItem value="earned">Earned</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={(value: 'recent' | 'xp' | 'alpha') => setSort(value)}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="xp">Highest XP</SelectItem>
                    <SelectItem value="alpha">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 bg-slate-900/80 border border-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredBadges.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  No badges to show yet. Keep exploring to unlock more.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBadges.map(({ record, earned }) => {
                    const title = record.achievements?.title || record.title || 'Unnamed Badge';
                    const description = record.achievements?.description || record.description || '';
                    const xpReward = record.achievements?.xp_reward || 0;
                    return (
                      <div
                        key={record.id}
                        className={`p-4 rounded-xl border transition-all ${
                          earned
                            ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                            : 'bg-slate-900/60 border-slate-700 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                            {renderIcon(record.achievements?.type || record.type)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{title}</p>
                            <p className="text-xs text-slate-400">
                              {earned && record.earned_at
                                ? `Earned ${new Date(record.earned_at).toLocaleDateString()}`
                                : 'Locked'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{description}</p>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>XP Reward</span>
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40">
                            +{xpReward} XP
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

