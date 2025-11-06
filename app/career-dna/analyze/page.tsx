"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Target, TrendingUp, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CareerDNAAnalyzePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const router = useRouter();

  const analyzeCareerDNA = async () => {
    try {
      setAnalyzing(true);
      setProgress(0);
      
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
      const profileResponse = await fetch('/api/onboarding/profile');
      const profileData = await profileResponse.json();
      
      if (!profileData.success) {
        throw new Error('Failed to get student profile');
      }

      // Perform career DNA analysis
      const analysisResponse = await fetch('/api/career-dna/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        }, 1000);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Career DNA analysis failed:', error);
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const viewResults = () => {
    router.push('/dashboard/student?tab=career-dna');
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
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
        </motion.div>

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
                  <h4 className="text-lg font-semibold text-white mb-3">What&apos;s next?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>• View your career affinity scores</div>
                    <div>• Find peer matches with similar interests</div>
                    <div>• Get personalized career recommendations</div>
                    <div>• Create ARKs tailored to your strengths</div>
                  </div>
                </div>

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
