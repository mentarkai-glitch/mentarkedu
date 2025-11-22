'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, GraduationCap, TrendingUp, Shield, Rocket, Star, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface CollegeRecommendation {
  id: string;
  category: 'safe' | 'moderate' | 'reach' | 'dream';
  match_score: number;
  admission_probability: number;
  colleges: {
    id: string;
    name: string;
    short_name: string;
    state: string;
    city: string;
    type: string;
    tier: string;
    nirf_rank: number;
  };
  college_courses: {
    id: string;
    name: string;
    degree: string;
    fees_total: number;
    average_salary: number;
    placement_percentage: number;
  };
  recommendation_reasons?: string[];
  strengths?: string[];
}

interface ExamScore {
  exam_type: string;
  exam_year: number;
  rank: number;
  percentile?: number;
}

interface AdmissionPreferences {
  preferred_states?: string[];
  preferred_cities?: string[];
  budget_max?: number;
  interested_degrees?: string[];
  interested_fields?: string[];
}

const categoryColors = {
  safe: 'from-green-500 to-emerald-500',
  moderate: 'from-blue-500 to-cyan-500',
  reach: 'from-orange-500 to-amber-500',
  dream: 'from-purple-500 to-pink-500',
};

const categoryIcons = {
  safe: Shield,
  moderate: TrendingUp,
  reach: Rocket,
  dream: Star,
};

const categoryLabels = {
  safe: 'Safe Bets',
  moderate: 'Moderate Chances',
  reach: 'Reach Schools',
  dream: 'Dream Colleges',
};

const HISTORY_STORAGE_KEY = 'mentark-college-history-v1';
const MAX_HISTORY = 5;

export default function CollegeMatcherPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<CollegeRecommendation[]>([]);
  const [byCategory, setByCategory] = useState<{
    safe: CollegeRecommendation[];
    moderate: CollegeRecommendation[];
    reach: CollegeRecommendation[];
    dream: CollegeRecommendation[];
  }>({ safe: [], moderate: [], reach: [], dream: [] });
  const [hasPreferences, setHasPreferences] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [history, setHistory] = useState<Array<{ timestamp: string; total: number }>>([]);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const tierOptions = useMemo(() => {
    const tiers = new Set<string>();
    recommendations.forEach((rec) => {
      if (rec.colleges.tier) tiers.add(rec.colleges.tier);
    });
    return Array.from(tiers);
  }, [recommendations]);

  const matchesFilters = (rec: CollegeRecommendation) => {
    const matchesState = stateFilter
      ? `${rec.colleges.state} ${rec.colleges.city}`.toLowerCase().includes(stateFilter.toLowerCase())
      : true;
    const matchesTier = tierFilter ? rec.colleges.tier === tierFilter : true;
    return matchesState && matchesTier;
  };

  const filteredCounts = useMemo(() => {
    const counts = {
      total: 0,
      safe: 0,
      moderate: 0,
      reach: 0,
      dream: 0,
    };
    Object.entries(byCategory).forEach(([category, recs]) => {
      const matched = recs.filter(matchesFilters);
      counts[category as keyof typeof counts] = matched.length;
      counts.total += matched.length;
    });
    return counts;
  }, [byCategory, stateFilter, tierFilter]);

  useEffect(() => {
    loadRecommendations();
    checkPreferences();
    if (typeof window !== 'undefined') {
      try {
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (err) {
        console.warn('Failed to restore college matcher history', err);
      }
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (err) {
      console.warn('Failed to persist college matcher history', err);
    }
  }, [history]);

  const checkPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('admission_preferences')
      .select('*')
      .eq('student_id', user.id)
      .single();

    setHasPreferences(!!data);
  };

  const loadRecommendations = async () => {
     try {
       const response = await fetch('/api/colleges/recommendations');
       if (response.ok) {
         const data = await response.json();
         if (data.success && data.data) {
           setRecommendations(data.data.recommendations || []);
           setByCategory(data.data.by_category || { safe: [], moderate: [], reach: [], dream: [] });
           const timestamp = data.data.generated_at || new Date().toISOString();
           setLastRunAt(timestamp);
           setHistory((prev) => [{ timestamp, total: (data.data.recommendations || []).length }, ...prev.filter((item) => item.timestamp !== timestamp)].slice(0, MAX_HISTORY));
         }
       }
     } catch (error) {
       console.error('Failed to load recommendations:', error);
     }
   };

  const handleFindColleges = async () => {
     if (!hasPreferences) {
       toast.error('Please configure your admission preferences first');
       return;
     }
    if (!isOnline) {
      toast.error('You appear to be offline. Reconnect to fetch updated matches.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch('/api/agents/college-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          location: 'India',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Found colleges matching your profile!');
        await loadRecommendations();
      } else {
        toast.error(result.message || 'Failed to find colleges');
      }
    } catch (error: any) {
      console.error('Error finding colleges:', error);
      toast.error(error.message || 'Failed to find colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (recommendations.length === 0) {
      toast('No recommendations to export yet');
      return;
    }
    setExporting(true);
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        filters: {
          stateFilter,
          tierFilter,
        },
        recommendations,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'mentark-college-recommendations.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('College recommendations exported');
    } catch (err) {
      console.error('Export recommendations error', err);
      toast.error('Failed to export recommendations');
    } finally {
      setExporting(false);
    }
  };

  const renderRecommendation = (rec: CollegeRecommendation) => {
    const Icon = categoryIcons[rec.category];
    const colorClass = categoryColors[rec.category];

    return (
      <motion.div
        key={rec.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="bg-card/50 border-border hover:border-border transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {rec.colleges.short_name || rec.colleges.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {rec.colleges.city}, {rec.colleges.state}
                    </p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${colorClass} text-foreground border-0`}>
                    {Math.round(rec.admission_probability)}% chance
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  <p className="font-medium mb-1">{rec.college_courses.name}</p>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>₹{rec.college_courses.fees_total?.toLocaleString()}/yr</span>
                    <span>₹{rec.college_courses.average_salary}L avg package</span>
                    <span>{rec.college_courses.placement_percentage}% placements</span>
                  </div>
                </div>

                {rec.strengths && rec.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {rec.strengths.map((strength, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-card/50 rounded-md text-muted-foreground">
                        {strength}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4" />
                    <span>{rec.colleges.tier}</span>
                  </div>
                  {rec.colleges.nirf_rank && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>NIRF #{rec.colleges.nirf_rank}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {rec.colleges.type}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <OfflineBanner
          isOnline={isOnline}
          message="You are offline. College recommendations reflect your last sync."
          className="mb-4"
        />
        
        <PageHeader
          title="College Matcher"
          description="Find your perfect college match based on your scores and preferences"
          icon={<Building2 className="w-8 h-8 text-gold" />}
        />

        <PageContainer spacing="md">

        {recommendations.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-gold/40 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Find Your Perfect College</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Get personalized college recommendations based on your exam scores, preferences, and career goals.
                  </p>
                  <Button
                    onClick={handleFindColleges}
                    disabled={loading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finding Colleges...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Find My Colleges
                      </>
                    )}
                  </Button>
                  {!hasPreferences && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-yellow-400">
                      <Info className="w-4 h-4" />
                      <span>Configure admission preferences to get started</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-8">
            <Card className="bg-card/50 border-border">
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Your Recommendations</h2>
                    <p className="text-muted-foreground">
                      {filteredCounts.total} of {recommendations.length} colleges match the current filters
                    </p>
                    {lastRunAt && (
                      <p className="text-xs text-muted-foreground mt-1">Last updated {new Date(lastRunAt).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFindColleges}
                      disabled={loading || !isOnline}
                      variant="outline"
                      className="border-border text-muted-foreground hover:bg-card"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Refreshing...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Refresh Results
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={exporting || recommendations.length === 0}
                      variant="outline"
                      className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                    >
                      {exporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Export JSON
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground">Total matches</p>
                    <p className="text-2xl font-semibold text-foreground">{filteredCounts.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground">Safe bets</p>
                    <p className="text-2xl font-semibold text-foreground">{filteredCounts.safe}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground">Moderate chances</p>
                    <p className="text-2xl font-semibold text-foreground">{filteredCounts.moderate}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground">Reach/Dream</p>
                    <p className="text-2xl font-semibold text-foreground">{filteredCounts.reach + filteredCounts.dream}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Filter by state/city</Label>
                    <Input
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      placeholder="e.g., Maharashtra or Mumbai"
                      className="bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Tier</Label>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="bg-card border-border text-muted-foreground">
                        <SelectValue placeholder="All tiers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All tiers</SelectItem>
                        {tierOptions.map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {history.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Run history</Label>
                      <div className="flex flex-wrap gap-2">
                        {history.map((item) => (
                          <Button
                            key={item.timestamp}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-yellow-300"
                          >
                            {new Date(item.timestamp).toLocaleDateString()} ({item.total})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {Object.entries(byCategory).map(([category, recs]) => {
              const filtered = recs.filter(matchesFilters);
              if (filtered.length === 0) return null;
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const colorClass = categoryColors[category as keyof typeof categoryColors];

              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
                      <p className="text-sm text-muted-foreground">{filtered.length} colleges</p>
                    </div>
                  </div>
                  <div>{filtered.map(renderRecommendation)}</div>
                </div>
              );
            })}
          </div>
        )}
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}
