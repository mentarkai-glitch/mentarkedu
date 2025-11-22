'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  ArrowLeft,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Target,
  BookOpen,
} from 'lucide-react';
import { calculateNEETResult, type NEETAnswer, type NEETResult } from '@/lib/utils/neet-scoring';
import { DualProgressBars } from '@/components/neet/DualProgressBars';
import { SubjectRadarChart } from '@/components/neet/SubjectRadarChart';
import { RankPredictorFunnel } from '@/components/neet/RankPredictorFunnel';
import { AlternativeCareerCards } from '@/components/neet/AlternativeCareerCards';
import { RankImprover } from '@/components/neet/RankImprover';
import { ChapterWiseBreakdown } from '@/components/neet/ChapterWiseBreakdown';
import { TimeManagementAnalysisComponent } from '@/components/neet/TimeManagementAnalysis';
import { NCERTPYQAnalysisComponent } from '@/components/neet/NCERTPYQAnalysis';
import { MockTestTrendComponent } from '@/components/neet/MockTestTrend';
import { MockTestUpload } from '@/components/neet/MockTestUpload';
import { toast } from 'sonner';
import { generateNEETPDFReport } from '@/lib/utils/neet-report-generator';
import { Sparkles } from 'lucide-react';

export default function NEETResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<NEETResult | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load answers and student name from sessionStorage
    const savedAnswers = sessionStorage.getItem('neet-answers');
    const savedName = sessionStorage.getItem('neet-student-name');

    if (!savedAnswers) {
      toast.error('No quiz data found. Please take the test first.');
      router.push('/path-finder/neet');
      return;
    }

    try {
      const answers: NEETAnswer[] = JSON.parse(savedAnswers);
      setStudentName(savedName || '');
      
      // Calculate results
      const calculatedResult = calculateNEETResult(answers);
      setResult(calculatedResult);
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.error('Error processing results. Please try again.');
      router.push('/path-finder/neet');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    });
  };

  const handleDownloadPDF = () => {
    if (!result) {
      toast.error('No results available to download');
      return;
    }

    try {
      generateNEETPDFReport({
        studentName: studentName || undefined,
        result: result,
        language: 'en'
      });
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleGenerateShareableCard = async () => {
    try {
      const cardElement = document.getElementById('neet-shareable-card');
      if (!cardElement) {
        toast.error('Card element not found');
        return;
      }

      // Show loading state
      toast.loading('Generating your shareable card...', { id: 'generating-card' });

      // Dynamically import html2canvas
      const html2canvasModule = await import('html2canvas');
      const canvas = await html2canvasModule.default(cardElement, {
        backgroundColor: '#0f172a', // Dark background
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Convert to image and download
      const link = document.createElement('a');
      link.download = `neet-diagnostic-${studentName || 'results'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Card downloaded! Share it on Instagram or social media.', { id: 'generating-card' });
    } catch (error) {
      console.error('Error generating shareable card:', error);
      toast.error('Failed to generate card. Please try again.', { id: 'generating-card' });
    }
  };

  const handleRetake = () => {
    sessionStorage.removeItem('neet-answers');
    sessionStorage.removeItem('neet-student-name');
    router.push('/path-finder/neet');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Unable to load results.</p>
          <Button onClick={handleRetake}>Retake Test</Button>
        </div>
      </div>
    );
  }

  const { metrics, alternativeCareers, rankImprovement, insights } = result;

  // Determine overall recommendation
  const getRecommendation = () => {
    if (metrics.neetProbability >= 70) {
      return {
        title: 'Strong NEET Potential',
        message: 'Keep pushing! You have a strong chance of securing a government medical seat.',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
      };
    } else if (metrics.neetProbability >= 50) {
      return {
        title: 'Moderate NEET Potential',
        message: 'Continue working hard, but also explore Plan B options as backup.',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
      };
    } else {
      return {
        title: 'Explore Plan B Options',
        message: 'While continuing NEET preparation, strongly consider allied health careers as backup paths.',
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/30',
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-teal-400" />
            <h1 className="text-xl font-bold">NEET Diagnostic Results</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleRetake}>
              Retake
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-4 pb-12">
        {/* SECTION 1: HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-teal-500/20"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-cyan-500/10" />
          
          <div className="relative px-6 py-12 text-center">
            {studentName && (
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-poppins font-bold mb-4 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-300 bg-clip-text text-transparent"
              >
                🎉 Hi {studentName}!
              </motion.h1>
            )}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl text-slate-200 font-medium mb-2"
            >
              Your NEET Diagnostic Results are Ready!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto"
            >
              Complete analysis of your NEET preparation, career fit, and personalized recommendations
            </motion.p>
            
            {/* Recommendation Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`inline-flex items-center gap-3 p-4 rounded-lg border ${recommendation.bgColor} ${recommendation.borderColor} mb-6`}
            >
              <div className={`p-2 rounded-lg ${recommendation.bgColor}`}>
                <Lightbulb className={`h-6 w-6 ${recommendation.color}`} />
              </div>
              <div className="text-left">
                <p className={`font-bold text-lg ${recommendation.color}`}>{recommendation.title}</p>
                <p className="text-sm text-slate-300 font-medium">{recommendation.message}</p>
              </div>
            </motion.div>
            
            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold text-lg px-8 py-6 h-auto hover:from-teal-300 hover:to-teal-400 shadow-lg shadow-teal-500/50"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Full Report (PDF)
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="border-teal-500/50 text-teal-300 hover:bg-teal-500/10 font-semibold px-6 py-6 h-auto"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share Results
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* SECTION 2: QUICK INSIGHTS DASHBOARD */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-teal-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold text-white">
                  <Stethoscope className="h-5 w-5 text-blue-300" />
                  NEET Probability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-poppins font-bold text-blue-400 mb-2">
                    {metrics.neetProbability}%
                  </div>
                  <div className="text-sm text-slate-300 font-medium">Government Seat Probability</div>
                  <p className="text-xs text-slate-400 mt-4 font-medium">
                    Based on your current preparation level and performance indicators
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold text-white">
                  <CheckCircle2 className="h-5 w-5 text-teal-300" />
                  Allied Health Fit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-poppins font-bold text-teal-400 mb-2">
                    {metrics.alliedHealthFit}%
                  </div>
                  <div className="text-sm text-slate-300 font-medium">Career Fit Score</div>
                  <p className="text-xs text-slate-400 mt-4 font-medium">
                    How well you match with allied health and alternative medical careers
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-yellow-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold text-white">
                  <Lightbulb className="h-5 w-5 text-yellow-300" />
                  Target Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-poppins font-bold text-yellow-300 mb-2">
                    {rankImprovement.targetScore}
                  </div>
                  <div className="text-sm text-slate-300 font-medium">Out of 720</div>
                  <p className="text-xs text-slate-400 mt-4 font-medium">
                    Recommended target score to achieve your desired rank
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* SECTION 3: VISUAL ANALYTICS - Enhanced with Larger Charts */}
        <div className="space-y-8 mb-12">
          {/* Dual Progress Bars - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 hover:border-teal-500/50 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-poppins font-bold text-white">
                  <TrendingUp className="h-6 w-6 text-teal-300" />
                  📊 Performance Overview
                </CardTitle>
                <CardDescription className="text-slate-300 font-medium text-base">
                  Your NEET probability vs Allied Health career fit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DualProgressBars
                  neetProbability={metrics.neetProbability}
                  alliedHealthFit={metrics.alliedHealthFit}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Radar Chart - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 hover:border-cyan-500/50 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-poppins font-bold text-white">
                  <Stethoscope className="h-6 w-6 text-cyan-300" />
                  📈 Subject Performance Analysis
                </CardTitle>
                <CardDescription className="text-slate-300 font-medium text-base">
                  Your strengths across Physics, Chemistry, and Biology
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-slate-800/30 rounded-lg p-4" style={{ minHeight: '400px' }}>
                <SubjectRadarChart subjectScores={metrics.subjectScores} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Rank Predictor Funnel - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 hover:border-yellow-500/50 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-poppins font-bold text-white">
                  <Target className="h-6 w-6 text-yellow-300" />
                  🎯 Rank Prediction & Improvement
                </CardTitle>
                <CardDescription className="text-slate-300 font-medium text-base">
                  Your predicted rank and improvement pathway
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RankPredictorFunnel rankImprovement={rankImprovement} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Rank Improver - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-slate-700/70 bg-slate-900/40 hover:border-green-500/50 transition-colors">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-poppins font-bold text-white">
                  <TrendingUp className="h-6 w-6 text-green-300" />
                  📊 Rank Improvement Strategy
                </CardTitle>
                <CardDescription className="text-slate-300 font-medium text-base">
                  Actionable steps to improve your rank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RankImprover rankImprovement={rankImprovement} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternative Careers - Enhanced */}
          {alternativeCareers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-white mb-3">
                    🌍 Alternative Career Paths
                  </h2>
                  <p className="text-lg text-slate-300 font-medium">
                    Explore allied health and alternative medical careers that match your profile
                  </p>
                </div>
                <AlternativeCareerCards alternativeCareers={alternativeCareers} />
              </div>
            </motion.div>
          )}

          {/* Extended Analytics Section - NEW */}
          {result.extendedAnalytics && (
            <>
              {/* Chapter-wise Breakdown */}
              {result.extendedAnalytics.chapterWise && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <ChapterWiseBreakdown chapterWise={result.extendedAnalytics.chapterWise} />
                </motion.div>
              )}

              {/* Time Management Analysis */}
              {result.extendedAnalytics.timeManagement && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <TimeManagementAnalysisComponent timeManagement={result.extendedAnalytics.timeManagement} />
                </motion.div>
              )}

              {/* NCERT vs PYQ Analysis */}
              {result.extendedAnalytics.ncertPYQ && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <NCERTPYQAnalysisComponent ncertPYQ={result.extendedAnalytics.ncertPYQ} />
                </motion.div>
              )}

              {/* Mock Test Trend */}
              {result.extendedAnalytics.mockTestTrend && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <MockTestTrendComponent mockTestTrend={result.extendedAnalytics.mockTestTrend} />
                </motion.div>
              )}

              {/* Revision Strategy */}
              {result.extendedAnalytics.revisionStrategy && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <Card className="border-slate-700/70 bg-slate-900/40 hover:border-teal-500/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-xl font-poppins font-bold text-white flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-teal-300" />
                        📝 Revision Strategy Analysis
                      </CardTitle>
                      <CardDescription className="text-slate-300 font-medium text-base">
                        Your current revision approach vs recommended strategy
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground mb-2">Current Strategy</p>
                          <p className="text-sm font-semibold text-foreground">{result.extendedAnalytics.revisionStrategy.current}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
                          <p className="text-xs text-teal-400 mb-2">Recommended Strategy</p>
                          <p className="text-sm font-semibold text-teal-300">{result.extendedAnalytics.revisionStrategy.recommended}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          result.extendedAnalytics.revisionStrategy.priority === 'High'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : result.extendedAnalytics.revisionStrategy.priority === 'Medium'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          Priority: {result.extendedAnalytics.revisionStrategy.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {/* Mock Test Upload & Comparison - KEY SELLING POINT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-white mb-3">
                  🎯 Validate Your Diagnosis
                </h2>
                <p className="text-lg text-slate-300 font-medium mb-2">
                  Upload your mock test scorecards to see how accurate our predictions are
                </p>
                <Badge className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/30 text-base px-4 py-1">
                  💡 Key Selling Point for Coaching Centers
                </Badge>
              </div>
              <MockTestUpload quizResult={result} />
            </div>
          </motion.div>
        </div>

        {/* SECTION 4: INSIGHTS & RECOMMENDATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Strengths */}
          <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-green-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-poppins font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                ✅ Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-slate-300 font-medium flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-yellow-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-poppins font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                ⚠️ Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-slate-300 font-medium flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-teal-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-poppins font-semibold text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-teal-400" />
                💡 Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-slate-300 font-medium flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shareable Card (Hidden, for download) */}
        <div id="neet-shareable-card" className="hidden">
          <div className="w-[800px] h-[1000px] bg-gradient-to-br from-slate-900 via-teal-900/20 to-slate-900 p-12 flex flex-col justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Stethoscope className="h-12 w-12 text-teal-400" />
                <h1 className="text-5xl font-bold text-white">NEET Diagnostic Results</h1>
              </div>
              {studentName && (
                <p className="text-2xl text-teal-300 mb-2">Hi {studentName}!</p>
              )}
            </div>

            {/* Key Metrics */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-400 mb-2">{metrics.neetProbability}%</div>
                <div className="text-lg text-slate-300">NEET Probability</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-teal-400 mb-2">{metrics.alliedHealthFit}%</div>
                <div className="text-lg text-slate-300">Allied Health Fit</div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-teal-500/10 border-2 border-teal-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="h-8 w-8 text-teal-400" />
                <h2 className="text-2xl font-bold text-teal-400">{recommendation.title}</h2>
              </div>
              <p className="text-lg text-slate-200">{recommendation.message}</p>
            </div>

            {/* Stream */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-3 rounded-full">
                <p className="text-xl font-semibold text-white">Target Score: {rankImprovement.targetScore}/720</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-slate-400">
              <p className="text-lg">Generated by Mentark Quantum</p>
              <p className="text-sm">mentark.com</p>
            </div>
          </div>
        </div>

        {/* SECTION 5: FINAL CTAs - Conversion Focused */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 mb-8"
        >
          <Card className="border-2 border-teal-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl sm:text-3xl font-poppins font-bold text-white mb-3">
                🎯 Ready to Start Your Medical Journey?
              </CardTitle>
              <CardDescription className="text-slate-300 font-medium text-base">
                Get personalized mentorship, track your NEET preparation progress, and unlock your full potential with Mentark
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Button 
                  onClick={handleDownloadPDF}
                  className="bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold h-[60px] hover:from-teal-300 hover:to-teal-400 shadow-lg shadow-teal-500/50"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Report (PDF)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="border-teal-500/50 text-teal-300 hover:bg-teal-500/10 font-semibold h-[60px]"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateShareableCard}
                  className="border-pink-500/50 text-pink-300 hover:bg-pink-500/10 font-semibold h-[60px]"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Share on Instagram
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/path-finder')}
                  className="border-slate-500/50 text-slate-300 hover:bg-slate-500/10 font-semibold h-[60px]"
                  size="lg"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Path Finder
                </Button>
                <Button 
                  onClick={handleRetake} 
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 font-semibold h-[60px]"
                  size="lg"
                >
                  Retake Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

