'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizModal } from '@/components/demo/QuizModal';
import { ResultsCards } from '@/components/demo/ResultsCards';
import { RoadmapTeaser } from '@/components/demo/RoadmapTeaser';
import { ShareButton } from '@/components/demo/ShareButton';
import { calculateResults, type QuizAnswer } from '@/lib/services/demo-scoring';
import { trackEvent, trackPageView, initPostHog } from '@/lib/services/analytics';
import { Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';

export default function DemoPathFinderPage() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof calculateResults> | null>(null);

  useEffect(() => {
    // Initialize analytics
    initPostHog();
    
    // Track page view
    trackPageView('demo_path_finder');
    trackEvent('demo_page_view', {
      url: typeof window !== 'undefined' ? window.location.href : '',
      utm_source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') : null
    });

    // Check for resume quiz
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mentark-demo-quiz-progress');
      if (stored) {
        try {
          const { answers } = JSON.parse(stored);
          if (answers && answers.length > 0 && answers.length < 7) {
            // Show resume option (could add a banner)
          }
        } catch (error) {
          // Ignore
        }
      }
    }
  }, []);

  const handleQuizComplete = (answers: QuizAnswer[]) => {
    trackEvent('demo_quiz_completed', {
      total_questions: answers.length,
      completion_time: Date.now() - (typeof window !== 'undefined' ? parseInt(localStorage.getItem('mentark-demo-quiz-start-time') || '0') : 0)
    });

    const calculatedResults = calculateResults(answers);
    setResults(calculatedResults);
    setShowQuiz(false);
    
    trackEvent('demo_results_shown', {
      stream: calculatedResults.stream.stream,
      confidence: calculatedResults.stream.confidence,
      strengths: calculatedResults.strengths.join(',')
    });
  };

  const handleStartQuiz = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mentark-demo-quiz-start-time', Date.now().toString());
    }
    trackEvent('demo_quiz_started');
    setShowQuiz(true);
  };

  const handleBuildRoadmap = () => {
    trackEvent('demo_build_roadmap_clicked', {
      stream: results?.stream.stream,
      has_results: !!results
    });
    // Redirect to login/register with return URL
    window.location.href = '/auth/login?redirect=/dashboard/student&source=demo_path_finder';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#0AB3A3]" />
              <span className="text-xl font-bold text-[#0A2850]">Mentark</span>
            </div>
            <Badge className="bg-[#0AB3A3]/10 text-[#0AB3A3] border-[#0AB3A3]/30">
              No login — start in 30s
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A2850] mb-4">
            Discover Your Perfect Stream
          </h1>
          <p className="text-lg sm:text-xl text-[#333333] mb-8 max-w-2xl mx-auto">
            Take our quick 7-question assessment and get instant insights into your strengths, best-fit stream, and future career paths.
          </p>
          {!results ? (
            <Button
              onClick={handleStartQuiz}
              size="lg"
              className="h-[52px] px-8 bg-[#0AB3A3] hover:bg-[#0AB3A3]/90 text-white font-bold text-lg rounded-lg"
            >
              Start Quick Test
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                setResults(null);
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('mentark-demo-quiz-progress');
                  localStorage.removeItem('mentark-demo-quiz-start-time');
                }
                handleStartQuiz();
              }}
              variant="outline"
              size="lg"
              className="h-[52px] px-8 border-[#0AB3A3] text-[#0AB3A3] hover:bg-[#0AB3A3]/10 font-bold text-lg rounded-lg"
            >
              Retake Quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </motion.div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsCards results={results} />
            
            <div className="mb-8">
              <RoadmapTeaser roadmap={results.roadmap} />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                onClick={handleBuildRoadmap}
                size="lg"
                className="h-[52px] px-8 bg-[#0A2850] hover:bg-[#0A2850]/90 text-white font-bold text-lg rounded-lg"
              >
                <Lock className="w-5 h-5 mr-2" />
                Build Your 2-Year Roadmap → (Login Required)
              </Button>
              <ShareButton results={{
                stream: results.stream.stream,
                strengths: results.strengths
              }} />
            </div>

            <p className="text-center text-sm text-slate-600 mb-8">
              Schools can enable bulk onboarding for students — contact{' '}
              <a href="mailto:partnerships@mentark.com" className="text-[#0AB3A3] hover:underline">
                partnerships@mentark.com
              </a>
            </p>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-600">
              Demo does not save personal data unless you opt-in. Mentark respects student privacy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-600">
              <a href="/privacy" className="hover:text-[#0AB3A3] transition-colors">
                Privacy Policy
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="mailto:partnerships@mentark.com" className="hover:text-[#0AB3A3] transition-colors flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Contact Us
              </a>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Mentark. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}

