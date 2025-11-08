'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  AlertCircle,
  Download,
  History,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  tier: string;
  type: string;
  college_courses?: Array<{
    id: string;
    name: string;
    degree: string;
  }>;
}

interface Prediction {
  college_id: string;
  course_id: string;
  predicted_cutoff_general: number;
  predicted_cutoff_obc: number;
  predicted_cutoff_sc: number;
  predicted_cutoff_st: number;
  predicted_cutoff_ews: number;
  prediction_confidence: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  pessimistic_cutoff: number;
  optimistic_cutoff: number;
  colleges?: { name: string };
  college_courses?: { name: string };
}

const STORAGE_KEY = 'mentark-cutoff-selected-colleges-v1';
const HISTORY_STORAGE_KEY = 'mentark-cutoff-history-v1';
const MAX_HISTORY = 5;

export default function CutoffPredictorPage() {
  const [loading, setLoading] = useState(false);
  const [searchingColleges, setSearchingColleges] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [targetYear, setTargetYear] = useState(String(new Date().getFullYear() + 1));
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [history, setHistory] = useState<Array<{ collegeIds: string[]; year: string; timestamp: string }>>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadColleges();
    if (typeof window !== 'undefined') {
      try {
        const storedSelection = localStorage.getItem(STORAGE_KEY);
        if (storedSelection) {
          const parsed = JSON.parse(storedSelection) as { selectedColleges: string[]; targetYear: string };
          if (Array.isArray(parsed.selectedColleges)) {
            setSelectedColleges(parsed.selectedColleges);
          }
          if (parsed.targetYear) {
            setTargetYear(parsed.targetYear);
          }
        }
        const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (err) {
        console.warn('Failed to restore cutoff predictor state', err);
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
  }, [selectedState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedColleges, targetYear })
    );
  }, [selectedColleges, targetYear]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }, [history]);

  const loadColleges = async () => {
    if (!isOnline) return;
    setSearchingColleges(true);
    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== 'all') params.append('state', selectedState);
      params.append('limit', '50');
      
      const response = await fetch(`/api/colleges/search?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setColleges(data.data.colleges || []);
      }
    } catch (error) {
      console.error('Error loading colleges:', error);
    } finally {
      setSearchingColleges(false);
    }
  };

  const handlePredict = async () => {
    if (selectedColleges.length === 0) {
      setError('Please select at least one college');
      return;
    }

    if (!isOnline) {
      setError('You are offline. Reconnect to generate predictions.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/agents/cutoff-predictor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_ids: selectedColleges,
          target_year: parseInt(targetYear),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const nextPredictions = data.data.predictions || [];
        setPredictions(nextPredictions);
        setHistory((prev) => [
          { collegeIds: [...selectedColleges], year: targetYear, timestamp: new Date().toISOString() },
          ...prev,
        ].slice(0, MAX_HISTORY));
        if (nextPredictions.length === 0) {
          toast('No fresh predictions returned. Try another college?');
        } else {
          toast.success('Cutoff predictions updated');
        }
      } else {
        setError(data.message || 'Failed to generate predictions');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setError('Failed to generate predictions. Please try again.');
      toast.error('Prediction request failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollege = (collegeId: string) => {
    setSelectedColleges(prev => 
      prev.includes(collegeId) 
        ? prev.filter(id => id !== collegeId)
        : [...prev, collegeId]
    );
  };

  const handleExport = () => {
    if (predictions.length === 0) {
      toast.info('No predictions yet', {
        description: 'Run the predictor to unlock exports.',
      });
      return;
    }
    setExporting(true);
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        targetYear,
        selectedColleges,
        predictions,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `cutoff-predictions-${targetYear}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Export ready', {
        description: 'Cutoff predictions saved to downloads as JSON.',
      });
    } catch (err) {
      console.error('Export predictions error', err);
      toast.error('Export failed', {
        description: 'Please retry after checking your connection.',
      });
    } finally {
      setExporting(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'decreasing': return <TrendingDown className="w-5 h-5 text-green-400" />;
      case 'stable': return <Minus className="w-5 h-5 text-yellow-400" />;
      default: return <TrendingUp className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'decreasing': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'stable': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500/20 text-green-400';
    if (confidence >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-orange-500/20 text-orange-400';
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Cutoff history is available, but new predictions need a connection."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Calculator className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Cutoff Predictor
                </h1>
                <p className="text-slate-400">AI-powered admission cutoff predictions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-400" />
                    <span className="text-red-300">Offline &mdash; using cached data</span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                onClick={handleExport}
                disabled={exporting || predictions.length === 0}
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-slate-900/50 border-yellow-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-yellow-400">Select Your Target Colleges</CardTitle>
              <CardDescription>Choose colleges to predict cutoffs for the upcoming academic year</CardDescription>
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
                        setSelectedColleges(item.collegeIds);
                        setTargetYear(item.year);
                      }}
                    >
                      {new Date(item.timestamp).toLocaleString()}
                    </Badge>
                  ))}
                </div>
              )}
 
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">Filter by State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Target Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* College Selection */}
              {searchingColleges ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {colleges.map((college) => (
                    <button
                      key={college.id}
                      onClick={() => toggleCollege(college.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedColleges.includes(college.id)
                          ? 'bg-yellow-500/20 border-yellow-500'
                          : 'bg-slate-800 border-slate-700 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{college.name}</h3>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                            <span>{college.city}, {college.state}</span>
                            <Badge variant="outline" className="text-xs">
                              {college.tier}
                            </Badge>
                          </div>
                        </div>
                        {selectedColleges.includes(college.id) && (
                          <div className="text-yellow-400 text-xl">✓</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <Button
                onClick={handlePredict}
                disabled={loading || selectedColleges.length === 0}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                    Generating Predictions...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Predict Cutoffs ({selectedColleges.length})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Predictions */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <Skeleton className="h-40 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && predictions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Predictions for {targetYear}
                </h2>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                  {predictions.length} Predictions
                </Badge>
              </div>

              {predictions.map((pred, idx) => (
                <Card key={idx} className="bg-slate-900/50 border-yellow-500/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-yellow-400">
                          {pred.colleges?.name || 'Unknown College'}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {pred.college_courses?.name || 'Course Information'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(pred.trend_direction)}
                        <Badge className={getTrendColor(pred.trend_direction)}>
                          {pred.trend_direction}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Confidence */}
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(pred.prediction_confidence)}>
                        {pred.prediction_confidence}% Confidence
                      </Badge>
                    </div>

                    {/* Cutoffs by Category */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">General</p>
                        <p className="text-lg font-bold text-white">
                          {Math.round(pred.predicted_cutoff_general)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">OBC</p>
                        <p className="text-lg font-bold text-white">
                          {Math.round(pred.predicted_cutoff_obc)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">SC</p>
                        <p className="text-lg font-bold text-white">
                          {Math.round(pred.predicted_cutoff_sc)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">ST</p>
                        <p className="text-lg font-bold text-white">
                          {Math.round(pred.predicted_cutoff_st)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">EWS</p>
                        <p className="text-lg font-bold text-white">
                          {Math.round(pred.predicted_cutoff_ews)}
                        </p>
                      </div>
                    </div>

                    {/* Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                        <p className="text-xs text-green-400 mb-1">Optimistic Range</p>
                        <p className="text-lg font-bold text-green-400">
                          {Math.round(pred.optimistic_cutoff)}
                        </p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                        <p className="text-xs text-red-400 mb-1">Pessimistic Range</p>
                        <p className="text-lg font-bold text-red-400">
                          {Math.round(pred.pessimistic_cutoff)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && predictions.length === 0 && selectedColleges.length === 0 && (
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardContent className="pt-12 pb-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                    <Target className="w-12 h-12 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Predict?</h3>
                    <p className="text-slate-400 text-sm">
                      Select colleges above to get AI-powered cutoff predictions
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

