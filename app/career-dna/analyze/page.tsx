"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Target, TrendingUp, Users, Zap, Download, History, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function CareerDNAAnalyzePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [cachedReport, setCachedReport] = useState<any>(null);
  const [history, setHistory] = useState<Array<{ timestamp: string; summary: string }>>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedReport = localStorage.getItem('mentark-career-dna-report');
      if (storedReport) {
        const parsed = JSON.parse(storedReport);
        setCachedReport(parsed);
        setAnalysisComplete(true);
      }
      const storedHistory = localStorage.getItem('mentark-career-dna-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.warn('Failed to restore Career DNA state', err);
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
    localStorage.setItem('mentark-career-dna-history', JSON.stringify(history.slice(0, 5)));
  }, [history]);

  const analyzeCareerDNA = async () => {
    if (!isOnline) {
      setError('You are offline. Reconnect to run a fresh analysis.');
      toast.error('Offline — using saved report if available');
      return;
    }
    try {
      setAnalyzing(true);
      setProgress(0);
      setAnalysisComplete(false);
      setError(null);
      
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      // Get student profile for analysis
      const profileResponse = await fetch('/api/onboarding/profile', { credentials: 'include' });
      const profileData = await profileResponse.json();
      
      if (!profileData.success) {
        throw new Error('Failed to get student profile');
      }

      // Perform career DNA analysis
      const analysisResponse = await fetch('/api/career-dna/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          student_profile: profileData.data,
          interests: profileData.data.interests || [],
          goals: profileData.data.goals || [],
          chat_history: []
        })
      });

      const analysisData = await analysisResponse.json();
      
      if (analysisData.success) {
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          setAnalysisComplete(true);
          setCachedReport(analysisData.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('mentark-career-dna-report', JSON.stringify(analysisData.data));
          }
          setHistory(prev => [
            {
              timestamp: new Date().toISOString(),
              summary: analysisData.data?.analysis?.recommended_focus || 'Career DNA snapshot',
            },
            ...prev,
          ]);
          toast.success('Career DNA analysis complete');
        }, 1000);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Career DNA analysis failed:', error);
      setAnalyzing(false);
      setProgress(0);
      setError('We could not complete the analysis. Please try again later.');
      toast.error('Career DNA analysis failed');
    }
  };

  const viewResults = () => {
    router.push('/dashboard/student?tab=career-dna');
  };

  const exportReport = () => {
    if (!cachedReport) {
      toast('Run an analysis to export a report');
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(cachedReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'career-dna-report.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Career DNA report exported');
    } catch (err) {
      console.error('Export report failed', err);
      toast.error('Failed to export report');
    }
  };
 
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 space-y-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full neon-glow">
              <Brain className="h-8 w-8 text-black" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
            Career DNA Analysis
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover your unique career strengths and find your perfect path
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            {isOnline ? (
              <span className="inline-flex items-center gap-1"><Wifi className="h-3 w-3 text-green-400" /> Online</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-300"><WifiOff className="h-3 w-3 text-red-400" /> Offline (using cached data)</span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              onClick={exportReport}
              disabled={!cachedReport}
            >
              <Download className="h-3 w-3 mr-1" /> Export Report
            </Button>
          </div>
          {history.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 flex-wrap">
              <History className="h-3 w-3" />
              {history.map((item) => (
                <span key={item.timestamp} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg">
                  {new Date(item.timestamp).toLocaleString()} • {item.summary}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {!analyzing && !analysisComplete && (
          <Card className="glass border-yellow-500/20 neon-glow mb-8">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center neon-glow">
                      <Target className="h-8 w-8 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Identify Strengths</h3>
                    <p className="text-sm text-slate-400">
                      AI analyzes your interests, goals, and learning style
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center neon-glow">
                      <TrendingUp className="h-8 w-8 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Career Mapping</h3>
                    <p className="text-sm text-slate-400">
                      Get affinity scores for 10+ career categories
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center neon-glow">
                      <Users className="h-8 w-8 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Peer Matching</h3>
                    <p className="text-sm text-slate-400">
                      Find study buddies with similar career interests
                    </p>
                  </div>
                </div>

                <div className="glass border-yellow-500/10 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">What we&apos;ll analyze:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>• Your interests and passions</div>
                    <div>• Learning style and preferences</div>
                    <div>• Career goals and aspirations</div>
                    <div>• Academic strengths and challenges</div>
                    <div>• Personality traits and motivations</div>
                    <div>• Future career readiness</div>
                  </div>
                </div>

                <Button
                  onClick={analyzeCareerDNA}
                  size="lg"
                  className="bg-gradient-cyan-blue hover:opacity-90 text-black px-8 py-3 neon-glow"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Career DNA Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {analyzing && (
          <Card className="glass border-yellow-500/20 neon-glow mb-8">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full animate-pulse neon-glow">
                    <Brain className="h-8 w-8 text-black" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Analyzing Your Career DNA
                  </h2>
                  <p className="text-gray-300">
                    Our AI is processing your profile to discover your unique career strengths...
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Analysis Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-gray-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-gray-300">Profile Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${progress > 60 ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-gray-300">Career Mapping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${progress > 90 ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span className="text-gray-300">Generating Results</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisComplete && (
          <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/20 mb-8">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Analysis Complete!
                  </h2>
                  <p className="text-gray-300">
                    Your career DNA profile has been generated. Discover your strengths and find your perfect career path.
                  </p>
                </div>

                <div className="bg-gray-900/30 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Top Career Matches</h4>
                  {cachedReport ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                      {Object.entries(cachedReport.affinity_scores)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 4)
                        .map(([name, score]) => (
                          <div
                            key={name}
                            className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 text-left"
                          >
                            <p className="font-semibold text-white">{name}</p>
                            <p className="text-xs text-green-300">Affinity {(score as number * 100).toFixed(0)}%</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Run the analysis to see detailed results.</p>
                  )}
                </div>

                {cachedReport?.analysis && (
                  <div className="bg-slate-900/40 rounded-lg p-6 text-left space-y-3">
                    <h4 className="text-lg font-semibold text-white mb-2">AI Insights</h4>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-white">Recommended Focus:</span> {cachedReport.analysis.recommended_focus}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {cachedReport.analysis.primary_strengths?.map((item: string) => (
                        <span key={item} className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                          Strength: {item}
                        </span>
                      ))}
                      {cachedReport.analysis.development_areas?.map((item: string) => (
                        <span key={item} className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                          Improve: {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={viewResults}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white px-8 py-3"
                >
                  <Target className="h-5 w-5 mr-2" />
                  View My Career DNA Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>Powered by Mentark AI • Your career journey starts here</p>
        </div>
      </div>
    </div>
  );
}
