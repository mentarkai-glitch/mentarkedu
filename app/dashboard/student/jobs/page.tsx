'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, DollarSign, Building, ExternalLink, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface ARK {
  id: string;
  title: string;
  category_id: string;
}

export default function JobMatcherPage() {
  const [loading, setLoading] = useState(false);
  const [arks, setArks] = useState<ARK[]>([]);
  const [selectedArk, setSelectedArk] = useState<string>('');
  const [location, setLocation] = useState('India');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillsMatched, setSkillsMatched] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserArks();
  }, []);

  const loadUserArks = async () => {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get user's ARKs
      const { data: arksData, error } = await supabase
        .from("arks")
        .select("*")
        .eq("student_id", user.id);
      
      if (!error && arksData) {
        setArks(arksData as any);
      }
    } catch (error) {
      console.error('Error loading ARKs:', error);
    }
  };

  const handleSearchJobs = async () => {
    if (!selectedArk) {
      setError('Please select an ARK first');
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
        setSearchQuery(data.data.search_query || '');
        setSkillsMatched(data.data.skills_matched || []);
      } else {
        setError(data.message || 'No jobs found. Try adjusting your filters.');
      }
    } catch (error) {
      console.error('Job search error:', error);
      setError('Failed to search jobs. Please try again.');
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

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
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

          {/* Search Form */}
          <Card className="bg-slate-900/50 border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Find Your Perfect Job</CardTitle>
              <CardDescription>Select an ARK to match jobs aligned with your learning goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
          {searchQuery && skillsMatched.length > 0 && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 mb-6">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-400 mb-1">Search Query</p>
                    <p className="text-sm font-medium text-white">{searchQuery}</p>
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
                  Recommended Jobs ({jobs.length})
                </h2>
              </div>
              {jobs.map((job) => (
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
                    </div>
                  </CardContent>
                </Card>
              ))}
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
        </motion.div>
      </div>
    </div>
  );
}

