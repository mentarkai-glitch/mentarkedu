'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, GraduationCap, TrendingUp, Shield, Rocket, Star, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();

  useEffect(() => {
    loadRecommendations();
    checkPreferences();
  }, []);

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
        <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {rec.colleges.short_name || rec.colleges.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {rec.colleges.city}, {rec.colleges.state}
                    </p>
                  </div>
                  <Badge className={`bg-gradient-to-r ${colorClass} text-white border-0`}>
                    {Math.round(rec.admission_probability)}% chance
                  </Badge>
                </div>

                <div className="text-sm text-slate-300 mb-3">
                  <p className="font-medium mb-1">{rec.college_courses.name}</p>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>₹{rec.college_courses.fees_total?.toLocaleString()}/yr</span>
                    <span>₹{rec.college_courses.average_salary}L avg package</span>
                    <span>{rec.college_courses.placement_percentage}% placements</span>
                  </div>
                </div>

                {rec.strengths && rec.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {rec.strengths.map((strength, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-slate-700/50 rounded-md text-slate-300">
                        {strength}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                    <span>{rec.colleges.tier}</span>
                  </div>
                  {rec.colleges.nirf_rank && (
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <TrendingUp className="w-4 h-4" />
                      <span>NIRF #{rec.colleges.nirf_rank}</span>
                    </div>
                  )}
                  <div className="text-sm text-slate-400">
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
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
                College Matcher
              </h1>
              <p className="text-slate-400">Find your perfect college match based on your scores and preferences</p>
            </div>
          </div>
        </motion.div>

        {recommendations.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Find Your Perfect College</h3>
                  <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Recommendations</h2>
                <p className="text-slate-400">
                  {recommendations.length} colleges matched your profile
                </p>
              </div>
              <Button
                onClick={handleFindColleges}
                disabled={loading}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
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
            </div>

            {Object.entries(byCategory).map(([category, recs]) => {
              if (recs.length === 0) return null;
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const colorClass = categoryColors[category as keyof typeof categoryColors];

              return (
                <div key={category} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
                      <p className="text-sm text-slate-400">{recs.length} colleges</p>
                    </div>
                  </div>
                  <div>{recs.map(renderRecommendation)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
