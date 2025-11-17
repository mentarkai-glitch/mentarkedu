'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building,
  ExternalLink,
  TrendingUp,
  Star,
  Save,
  History,
  Wifi,
  WifiOff,
  Eye,
  CheckCircle,
  X,
  Filter,
  RefreshCw,
  Target,
  Search,
  FileText,
  MessageSquare,
  AlertTriangle,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/services/analytics';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface Job {
  job_id: string;
  job_title: string;
  job_description: string;
  company_name: string;
  company_logo?: string;
  job_apply_link: string;
  job_country: string;
  job_city?: string;
  job_state?: string;
  job_posted_at_datetime_utc: string;
  job_max_salary?: number;
  job_min_salary?: number;
  job_salary_currency?: string;
  job_is_remote?: boolean;
  job_employment_type: string;
  required_skills?: string[];
  experience_level?: string;
}

interface JobRecommendation {
  id: string;
  student_id: string;
  ark_id?: string;
  job_title: string;
  job_description?: string;
  job_apply_link: string;
  job_location: string;
  job_is_remote: boolean;
  job_posted_at_datetime_utc?: string;
  company_name: string;
  company_logo?: string;
  company_url?: string;
  employment_type: string;
  relevance_score: number;
  skills_match_count: number;
  skills_matched?: string[];
  job_data?: any;
  status: 'recommended' | 'viewed' | 'applied' | 'ignored' | 'saved';
  recommended_at: string;
  viewed_at?: string;
  applied_at?: string;
  updated_at: string;
}

interface ARK {
  id: string;
  title: string;
  category_id: string;
}

const PREFERENCES_STORAGE_KEY = 'mentark-job-matcher-preferences-v1';
const HISTORY_STORAGE_KEY = 'mentark-job-matcher-history-v1';
const MAX_HISTORY = 5;

export default function JobMatcherPage() {
  const [activeTab, setActiveTab] = useState<'recommended' | 'search'>('recommended');
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [arks, setArks] = useState<ARK[]>([]);
  const [selectedArk, setSelectedArk] = useState<string>('');
  const [location, setLocation] = useState('India');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'recommended' | 'viewed' | 'applied' | 'ignored' | 'saved'>('all');
  const [searchSummary, setSearchSummary] = useState('');
  const [skillsMatched, setSkillsMatched] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [history, setHistory] = useState<Array<{ arkId: string; location: string; timestamp: string }>>([]);
  const [savedJobs, setSavedJobs] = useState<Record<string, Job>>({});
  const [clientFilter, setClientFilter] = useState('');
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [showInterviewPrep, setShowInterviewPrep] = useState<string | null>(null);
  const [showSkillGapAnalysis, setShowSkillGapAnalysis] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [skillGapAnalysis, setSkillGapAnalysis] = useState<any>(null);
  const [loadingSkillGap, setLoadingSkillGap] = useState(false);

  useEffect(() => {
    loadUserArks();
    loadRecommendations();
    if (typeof window !== 'undefined') {
      try {
        const storedPrefs = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (storedPrefs) {
          const parsed = JSON.parse(storedPrefs) as { selectedArk?: string; location?: string };
          if (parsed.selectedArk) setSelectedArk(parsed.selectedArk);
          if (parsed.location) setLocation(parsed.location);
        }
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
        const storedSaved = localStorage.getItem('mentark-job-matcher-saved-jobs');
        if (storedSaved) {
          setSavedJobs(JSON.parse(storedSaved));
        }
      } catch (err) {
        console.warn('Failed to restore job matcher state', err);
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
    if (statusFilter !== 'all') {
      loadRecommendations(statusFilter);
    } else {
      loadRecommendations();
    }
  }, [statusFilter]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ selectedArk, location })
    );
  }, [selectedArk, location]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }, [history]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mentark-job-matcher-saved-jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const isMissingColumnError = (error: any, column: string) => {
    const message = (error?.message || '').toLowerCase();
    return error?.code === '42703' || message.includes(`column "${column}"`) || message.includes(`column ${column}`);
  };

  const loadUserArks = async () => {
    try {
      const supabase = createClient();
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get user's ARKs
      const { data: arksData, error } = await supabase
        .from("arks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (arksData) {
        setArks(arksData as any);
      } else if (error) {
        console.error('Error loading ARKs:', error);
        toast.error(error.message || 'Unable to load your ARKs right now.');
      }
    } catch (error) {
      console.error('Error loading ARKs:', error);
    }
  };

  const loadRecommendations = async (status?: string) => {
    setLoadingRecommendations(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      if (selectedArk) {
        params.append('ark_id', selectedArk);
      }

      const response = await fetch(`/api/job-recommendations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data.recommendations || []);
      } else {
        console.error('Error loading recommendations:', data.error);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load job recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const updateRecommendationStatus = async (recommendationId: string, newStatus: JobRecommendation['status']) => {
    try {
      const response = await fetch('/api/job-recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendationId
              ? { ...rec, status: newStatus, ...data.data.recommendation }
              : rec
          )
        );
        toast.success(`Job marked as ${newStatus}`);
        trackEvent('job_recommendation_status_updated', {
          recommendation_id: recommendationId,
          status: newStatus,
        });
      } else {
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleSearchJobs = async () => {
    if (!selectedArk) {
      setError('Please select an ARK first');
      return;
    }
    if (!isOnline) {
      setError('You are offline. Reconnect to fetch job matches.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Get student ID from session
      const profileResponse = await fetch('/api/students/profile');
      const profileData = await profileResponse.json();
      
      if (!profileData.success || !profileData.data) {
        setError('Please complete your profile first');
        setLoading(false);
        return;
      }

      const studentId = profileData.data.user_id;

      const response = await fetch('/api/agents/job-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ark_id: selectedArk,
          student_id: studentId,
          location: location,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setJobs(data.data.recommended_jobs || []);
        setSearchSummary(data.data.search_query || '');
        setSkillsMatched(data.data.skills_matched || []);
        setHistory((prev) => [
          { arkId: selectedArk, location, timestamp: new Date().toISOString() },
          ...prev.filter((item) => !(item.arkId === selectedArk && item.location === location)),
        ].slice(0, MAX_HISTORY));
        toast.success('Latest matches ready');
        // Reload recommendations after new search
        setTimeout(() => loadRecommendations(), 2000);
        trackEvent("job_matcher_search_success", {
          ark_id: selectedArk,
          location,
          result_count: data.data.recommended_jobs?.length ?? 0,
        });
      } else {
        setError(data.message || 'No jobs found. Try adjusting your filters.');
        trackEvent("job_matcher_search_failed", {
          ark_id: selectedArk,
          location,
          reason: data.message || 'no_results',
        });
      }
    } catch (error) {
      console.error('Job search error:', error);
      setError('Failed to search jobs. Please try again.');
      toast.error('Job search failed');
      trackEvent("job_matcher_search_failed", {
        ark_id: selectedArk,
        location,
        reason: 'network_error',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const curr = currency || 'INR';
    const symbol = curr === 'INR' ? '₹' : '$';
    
    if (min && max) {
      return `${symbol}${(min / 100000).toFixed(1)}L - ${symbol}${(max / 100000).toFixed(1)}L`;
    }
    if (min) return `${symbol}${(min / 100000).toFixed(1)}L+`;
    if (max) return `Up to ${symbol}${(max / 100000).toFixed(1)}L`;
    return 'Not specified';
  };

  const toggleSaveJob = (job: Job) => {
    setSavedJobs((prev) => {
      const updated = { ...prev };
      if (updated[job.job_id]) {
        delete updated[job.job_id];
      } else {
        updated[job.job_id] = job;
      }
      toast.success(updated[job.job_id] ? 'Job saved' : 'Job removed from saved');
      return updated;
    });
  };

  const handleInterviewPrep = async (job: Job | JobRecommendation) => {
    const jobId = 'job_id' in job ? job.job_id : (job as any).id || (job as any).job_id;
    setShowInterviewPrep(jobId);
    setLoadingQuestions(true);
    try {
      const response = await fetch('/api/interview-prep/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'generate',
          jobTitle: job.job_title,
          company: job.company_name,
          jobDescription: job.job_description,
          skills: (job as any).skills_matched || (job as Job).required_skills || []
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInterviewQuestions(data.data.questions || []);
        }
      }
    } catch (error) {
      console.error('Failed to load interview questions:', error);
      toast.error('Failed to load interview questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSkillGapAnalysis = async (job: Job | JobRecommendation) => {
    const jobId = 'job_id' in job ? job.job_id : (job as any).id || (job as any).job_id;
    setShowSkillGapAnalysis(jobId);
    setLoadingSkillGap(true);
    try {
      // Get user's resume/skills data
      const profileResponse = await fetch('/api/students/profile');
      const profileData = await profileResponse.json();
      
      if (!profileData.success) {
        toast.error('Please complete your profile first');
        return;
      }

      const response = await fetch('/api/resume/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resumeData: {
            skills: {
              technical: profileData.data.skills || [],
              soft: []
            }
          },
          jobDescription: job.job_description
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSkillGapAnalysis(data.data.analysis);
        }
      }
    } catch (error) {
      console.error('Failed to analyze skill gaps:', error);
      toast.error('Failed to analyze skill gaps');
    } finally {
      setLoadingSkillGap(false);
    }
  };

  const savedJobsList = useMemo(() => Object.values(savedJobs), [savedJobs]);
  const filteredJobs = useMemo(() => {
    if (!clientFilter.trim()) return jobs;
    const q = clientFilter.toLowerCase();
    return jobs.filter((job) =>
      [job.job_title, job.company_name, job.job_description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [jobs, clientFilter]);

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Client-side search filter
    if (clientFilter.trim()) {
      const q = clientFilter.toLowerCase();
      filtered = filtered.filter((rec) =>
        [rec.job_title, rec.company_name, rec.job_description || '']
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [recommendations, statusFilter, clientFilter]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Showing your last saved job matches."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Briefcase className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Job Matcher
                </h1>
                <p className="text-slate-400">AI-powered job recommendations based on your ARKs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline &mdash; showing last saved results</span>
                </>
              )}
              <Badge variant="outline" className="bg-slate-800 border-slate-700 text-xs">
                Saved: {savedJobsList.length}
              </Badge>
              {recommendations.length > 0 && (
                <Badge variant="outline" className="bg-slate-800 border-slate-700 text-xs">
                  Recommendations: {recommendations.length}
                </Badge>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'recommended' | 'search')} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-900/50 border-yellow-500/30">
              <TabsTrigger value="recommended" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                <Target className="w-4 h-4 mr-2" />
                Recommended ({recommendations.filter(r => r.status === 'recommended' || statusFilter === 'all' || r.status === statusFilter).length})
              </TabsTrigger>
              <TabsTrigger value="search" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
                <Search className="w-4 h-4 mr-2" />
                Search New
              </TabsTrigger>
            </TabsList>

            {/* Recommended Tab */}
            <TabsContent value="recommended" className="mt-6">
              {/* Filter and Refresh */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 max-w-xs">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Recommendations</SelectItem>
                    <SelectItem value="recommended">New (Recommended)</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => loadRecommendations(statusFilter !== 'all' ? statusFilter : undefined)}
                  variant="outline"
                  className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Recommendations List */}
              {loadingRecommendations ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                      <CardContent className="pt-6">
                        <Skeleton className="h-32 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {filteredRecommendations.map((rec) => (
                    <Card key={rec.id} className="bg-slate-900/50 border-yellow-500/30 hover:border-yellow-500/70 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              {rec.company_logo && (
                                <img 
                                  src={rec.company_logo} 
                                  alt={rec.company_name}
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-white">{rec.job_title}</h3>
                                  <Badge className={`${
                                    rec.status === 'applied' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                    rec.status === 'viewed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                                    rec.status === 'saved' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                                    rec.status === 'ignored' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                    'bg-purple-500/20 text-purple-400 border-purple-500/50'
                                  }`}>
                                    {rec.status}
                                  </Badge>
                                  <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/50">
                                    {rec.relevance_score}% Match
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                  <Building className="w-4 h-4" />
                                  <span>{rec.company_name}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {rec.job_is_remote && (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                      Remote
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="bg-slate-800">
                                    {rec.employment_type}
                                  </Badge>
                                  {rec.skills_matched && rec.skills_matched.length > 0 && (
                                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/50">
                                      {rec.skills_match_count} Skills Matched
                                    </Badge>
                                  )}
                                </div>

                                {rec.job_description && (
                                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                                    {rec.job_description.substring(0, 200)}...
                                  </p>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-xs">{rec.job_location}</span>
                                  </div>
                                  {rec.job_posted_at_datetime_utc && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                      <Clock className="w-4 h-4" />
                                      <span className="text-xs">
                                        {formatDate(rec.job_posted_at_datetime_utc)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-slate-400">
                                    <Star className="w-4 h-4" />
                                    <span className="text-xs">Recommended {formatDate(rec.recommended_at)}</span>
                                  </div>
                                </div>

                                {rec.skills_matched && rec.skills_matched.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-xs text-slate-500 mb-2">Matched Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                      {rec.skills_matched.slice(0, 5).map((skill, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs bg-slate-800 border-blue-500/50">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <a
                              href={rec.job_apply_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                if (rec.status === 'recommended') {
                                  updateRecommendationStatus(rec.id, 'viewed');
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-lg transition-colors whitespace-nowrap"
                            >
                              Apply Now
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                                onClick={() => handleInterviewPrep(rec)}
                                title="Interview Prep"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Prep
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                                onClick={() => handleSkillGapAnalysis(rec)}
                                title="Skill Gap Analysis"
                              >
                                <Brain className="w-3 h-3 mr-1" />
                                Skills
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              {rec.status !== 'viewed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 flex-1"
                                  onClick={() => updateRecommendationStatus(rec.id, 'viewed')}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Viewed
                                </Button>
                              )}
                              {rec.status !== 'applied' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/40 text-green-400 hover:bg-green-500/10 flex-1"
                                  onClick={() => updateRecommendationStatus(rec.id, 'applied')}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Applied
                                </Button>
                              )}
                              {rec.status !== 'saved' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                                  onClick={() => updateRecommendationStatus(rec.id, 'saved')}
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                              )}
                              {rec.status !== 'ignored' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                  onClick={() => updateRecommendationStatus(rec.id, 'ignored')}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-12 pb-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                        <Target className="w-12 h-12 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
                        <p className="text-slate-400 text-sm mb-4">
                          {statusFilter !== 'all' 
                            ? `No ${statusFilter} recommendations found.`
                            : 'Search for jobs to get personalized recommendations based on your ARKs'}
                        </p>
                        <Button
                          onClick={() => setActiveTab('search')}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Search for Jobs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Search New Tab */}
            <TabsContent value="search" className="mt-6">
              {/* Search Form */}
              <Card className="bg-slate-900/50 border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Find Your Perfect Job</CardTitle>
              <CardDescription>Select an ARK to match jobs aligned with your learning goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <History className="h-3 w-3" />
                  <span>Recent runs:</span>
                  {history.map((item) => (
                    <Badge
                      key={item.timestamp}
                      variant="outline"
                      className="cursor-pointer hover:border-yellow-500/60"
                      onClick={() => {
                        setSelectedArk(item.arkId);
                        setLocation(item.location);
                      }}
                    >
                      {new Date(item.timestamp).toLocaleString()}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">Select ARK</label>
                  <Select value={selectedArk} onValueChange={setSelectedArk}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Choose an ARK...">
                        {arks.find(a => a.id === selectedArk)?.title || 'Choose an ARK...'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {arks.map((ark) => (
                        <SelectItem key={ark.id} value={ark.id}>
                          {ark.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-slate-300">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="Pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Input
                placeholder="Filter jobs by keyword (client-side)"
                className="bg-slate-800 border-slate-700 text-slate-200"
                value={clientFilter}
                onChange={(event) => setClientFilter(event.target.value)}
              />

              {error && (
                <Alert className="bg-red-500/10 border-red-500/30">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSearchJobs}
                disabled={loading || !selectedArk}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                    Finding Jobs...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Find Matching Jobs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Search Context */}
          {searchSummary && skillsMatched.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 mb-6">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-400 mb-1">Search Query</p>
                    <p className="text-sm font-medium text-white">{searchSummary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-400 mb-2">Skills Matched</p>
                    <div className="flex flex-wrap gap-2">
                      {skillsMatched.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-800 border-amber-500/50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Results */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && jobs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Recommended Jobs ({filteredJobs.length})
                </h2>
              </div>
              {filteredJobs.map((job) => (
                <Card key={job.job_id} className="bg-slate-900/50 border-yellow-500/30 hover:border-yellow-500/70 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {job.company_logo && (
                            <img 
                              src={job.company_logo} 
                              alt={job.company_name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{job.job_title}</h3>
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                              <Building className="w-4 h-4" />
                              <span>{job.company_name}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.job_is_remote && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                  Remote
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-slate-800">
                                {job.job_employment_type}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                          {job.job_description.substring(0, 200)}...
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">
                              {job.job_city || job.job_state || job.job_country}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">
                              {formatDate(job.job_posted_at_datetime_utc)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs">
                              {formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency)}
                            </span>
                          </div>
                          {job.experience_level && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Star className="w-4 h-4" />
                              <span className="text-xs capitalize">{job.experience_level.replace('_', ' ')}</span>
                            </div>
                          )}
                        </div>

                        {job.required_skills && job.required_skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {job.required_skills.slice(0, 5).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-slate-800 border-slate-700">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <a
                        href={job.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Button
                        variant={savedJobs[job.job_id] ? 'default' : 'outline'}
                        size="sm"
                        className={`${savedJobs[job.job_id] ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10'} mt-3`}
                        onClick={() => toggleSaveJob(job)}
                      >
                        <Save className="w-3 h-3 mr-2" />
                        {savedJobs[job.job_id] ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredJobs.length === 0 && (
                <div className="p-6 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg">
                  No jobs match your filter right now.
                </div>
              )}
            </div>
          )}

          {!loading && jobs.length === 0 && !error && (
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Start Your Job Search</h3>
                    <p className="text-slate-400 text-sm">
                      Select an ARK above to find jobs that match your career goals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {savedJobsList.length > 0 && (
            <Card className="bg-slate-900/60 border-yellow-500/20 mt-8">
              <CardHeader>
                <CardTitle className="text-yellow-400">Saved Jobs ({savedJobsList.length})</CardTitle>
                <CardDescription>Quick access to roles you bookmarked</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedJobsList.map((job) => (
                  <div key={`saved-${job.job_id}`} className="flex flex-wrap items-center justify-between gap-2 border border-slate-800 rounded-lg p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{job.job_title}</p>
                      <p className="text-xs text-slate-400 truncate">{job.company_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        className="bg-yellow-500 text-black hover:bg-yellow-600"
                      >
                        <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                          Apply
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={() => toggleSaveJob(job)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

