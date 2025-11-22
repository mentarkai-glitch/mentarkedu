'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Share2,
  Globe,
  Loader2,
  Rocket,
  Target,
  Lightbulb,
  BookOpen,
  Calendar,
  TrendingUp,
  Users,
  Mail,
  Download,
  Video,
  FileText,
  Code,
  Newspaper,
  GraduationCap,
  Award,
  Clock,
  DollarSign,
  ExternalLink,
  PlayCircle,
  FileCode,
  Briefcase,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Building,
  Palette,
  Heart,
  Wrench,
  Zap,
  Brain,
  Calculator,
  Microscope,
  Stethoscope,
  Laptop,
  Paintbrush,
  MapPin,
  Home,
  Plane,
  Monitor,
  Gamepad2,
  TrendingDown,
  Shield,
  HelpCircle,
  Star,
  CheckCircle
} from 'lucide-react';
import { pathFinderQuestions, type Language } from '@/lib/data/path-finder-questions';
import { calculateResult, type QuizAnswer, type QuizResult } from '@/lib/utils/path-finder-scoring';
import { generateExpandedCareerOpportunities, type ExpandedCareerOpportunity } from '@/lib/utils/enhanced-results';
import { trackEvent, initPostHog, trackPageView } from '@/lib/services/analytics';
import { toast } from 'sonner';
import Link from 'next/link';
import { generatePDFReport } from '@/lib/utils/report-generator';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible } from '@/components/ui/collapsible';

type PageState = 'welcome' | 'name' | 'quiz' | 'results' | 'roadmap';

const translations = {
  en: {
    welcome: {
      title: 'Mentark – Instant Path Finder',
      tagline: 'Discover your best-fit stream in 2 minutes',
      subtitle: 'No login required — start in 30s',
      cta: 'Start Quick Test',
      badge: 'No login — start in 30s'
    },
    name: {
      title: "Hi! What's your name?",
      subtitle: 'We\'ll personalize your results (optional)',
      placeholder: 'Enter your name',
      skip: 'Skip',
      continue: 'Continue'
    },
    quiz: {
      progress: 'Question {current} of {total}',
      timeLeft: '~{minutes} minute left',
      next: 'Next',
      previous: 'Previous',
      finish: 'See Results'
    },
    results: {
      strengths: 'Your Strengths',
      strengthsSubtext: 'These are your natural tendencies — use them to choose the right stream.',
      stream: 'Best-Fit Stream',
      streamSubtext: 'Because you enjoy {reason}',
      paths: 'Paths you can try',
      buildRoadmap: 'Build Your 2-Year Roadmap',
      shareTeacher: 'Share with teacher',
      schoolsNote: 'Schools can enable bulk onboarding for students — contact partnerships@mentark.com'
    },
    roadmap: {
      title: 'Starter Roadmap — next 2 years',
      loading: 'Generating your personalized roadmap...',
      error: 'Failed to load roadmap. Please try again.',
      viewFull: 'View Full Roadmap (Login Required)'
    }
  },
  hi: {
    welcome: {
      title: 'Mentark – तत्काल पथ खोजक',
      tagline: '2 मिनट में अपना सबसे उपयुक्त स्ट्रीम खोजें',
      subtitle: 'लॉगिन की आवश्यकता नहीं — 30 सेकंड में शुरू करें',
      cta: 'त्वरित परीक्षण शुरू करें',
      badge: 'लॉगिन नहीं — 30 सेकंड में शुरू'
    },
    name: {
      title: 'नमस्ते! आपका नाम क्या है?',
      subtitle: 'हम आपके परिणामों को व्यक्तिगत बनाएंगे (वैकल्पिक)',
      placeholder: 'अपना नाम दर्ज करें',
      skip: 'छोड़ें',
      continue: 'जारी रखें'
    },
    quiz: {
      progress: 'प्रश्न {current} / {total}',
      timeLeft: '~{minutes} मिनट बचे',
      next: 'अगला',
      previous: 'पिछला',
      finish: 'परिणाम देखें'
    },
    results: {
      strengths: 'आपकी ताकत',
      strengthsSubtext: 'ये आपकी प्राकृतिक प्रवृत्तियाँ हैं — सही स्ट्रीम चुनने के लिए इनका उपयोग करें।',
      stream: 'सबसे उपयुक्त स्ट्रीम',
      streamSubtext: 'क्योंकि आप {reason} का आनंद लेते हैं',
      paths: 'आप आज़मा सकते हैं',
      buildRoadmap: 'अपना 2-वर्षीय रोडमैप बनाएं',
      shareTeacher: 'शिक्षक के साथ साझा करें',
      schoolsNote: 'स्कूल छात्रों के लिए बल्क ऑनबोर्डिंग सक्षम कर सकते हैं — partnerships@mentark.com से संपर्क करें'
    },
    roadmap: {
      title: 'स्टार्टर रोडमैप — अगले 2 वर्ष',
      loading: 'आपका व्यक्तिगत रोडमैप तैयार किया जा रहा है...',
      error: 'रोडमैप लोड करने में विफल। कृपया पुनः प्रयास करें।',
      viewFull: 'पूर्ण रोडमैप देखें (लॉगिन आवश्यक)'
    }
  },
  mr: {
    welcome: {
      title: 'Mentark – तत्काल मार्ग शोधक',
      tagline: '2 मिनिटांत तुमचा सर्वात योग्य स्ट्रीम शोधा',
      subtitle: 'लॉगिन आवश्यक नाही — 30 सेकंदात सुरू करा',
      cta: 'त्वरित चाचणी सुरू करा',
      badge: 'लॉगिन नाही — 30 सेकंदात सुरू'
    },
    name: {
      title: 'नमस्कार! तुमचे नाव काय आहे?',
      subtitle: 'आम्ही तुमचे परिणाम वैयक्तिक करू (पर्यायी)',
      placeholder: 'तुमचे नाव प्रविष्ट करा',
      skip: 'वगळा',
      continue: 'सुरू ठेवा'
    },
    quiz: {
      progress: 'प्रश्न {current} / {total}',
      timeLeft: '~{minutes} मिनिट शिल्लक',
      next: 'पुढे',
      previous: 'मागे',
      finish: 'परिणाम पहा'
    },
    results: {
      strengths: 'तुमची शक्ती',
      strengthsSubtext: 'हे तुमच्या नैसर्गिक प्रवृत्ती आहेत — योग्य स्ट्रीम निवडण्यासाठी त्यांचा वापर करा।',
      stream: 'सर्वात योग्य स्ट्रीम',
      streamSubtext: 'कारण तुम्ही {reason} चा आनंद घेता',
      paths: 'तुम्ही वापरू शकता',
      buildRoadmap: 'तुमचा 2-वर्षीय रोडमॅप तयार करा',
      shareTeacher: 'शिक्षकासह सामायिक करा',
      schoolsNote: 'शाळा विद्यार्थ्यांसाठी बल्क ऑनबोर्डिंग सक्षम करू शकतात — partnerships@mentark.com ला संपर्क करा'
    },
    roadmap: {
      title: 'स्टार्टर रोडमॅप — पुढील 2 वर्षे',
      loading: 'तुमचा वैयक्तिक रोडमॅप तयार केला जात आहे...',
      error: 'रोडमॅप लोड करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा।',
      viewFull: 'पूर्ण रोडमॅप पहा (लॉगिन आवश्यक)'
    }
  }
};

const STORAGE_KEY = 'mentark-path-finder-progress';
const STORAGE_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Lazy load chart components
const RadarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadarChart),
  { ssr: false }
);
const Radar = dynamic(
  () => import('recharts').then((mod) => mod.Radar),
  { ssr: false }
);
const PolarGrid = dynamic(
  () => import('recharts').then((mod) => mod.PolarGrid),
  { ssr: false }
);
const PolarAngleAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarAngleAxis),
  { ssr: false }
);
const PolarRadiusAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarRadiusAxis),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
// html2canvas will be imported dynamically in the function

// Calculate Aptitude DNA scores for Radar Chart
const calculateAptitudeDNA = (answers: QuizAnswer[], traitScores: any) => {
  try {
  // Logic: Q3 (Broken Phone) + Q8 (Math)
  const q3Answer = answers.find(a => a.question_id === 'q3')?.answer as string || '';
  const q8Answer = answers.find(a => a.question_id === 'q8')?.answer as string || '';
  let logicScore = traitScores.logical || 0;
  if (q3Answer.includes('Google') || q3Answer.includes('repair')) logicScore += 20;
  if (q8Answer === 'I love the challenge. I fight it until I get the answer') logicScore += 30;
  else if (q8Answer === 'I can do it if I have the formula, but I don\'t love it') logicScore += 10;

  // Creativity: Q1 (Feed) + Q2 (Fest Role)
  const q1Answer = answers.find(a => a.question_id === 'q1')?.answer as string || '';
  const q2Answer = answers.find(a => a.question_id === 'q2')?.answer as string || '';
  let creativityScore = traitScores.creative || 0;
  if (q1Answer.includes('Art') || q1Answer.includes('dance') || q1Answer.includes('music')) creativityScore += 20;
  if (q2Answer.includes('Designing') || q2Answer.includes('poster')) creativityScore += 20;

  // Social: Q15 (Interaction)
  const q15Answer = answers.find(a => a.question_id === 'q15')?.answer as string || '';
  let socialScore = traitScores.people || 0;
  if (q15Answer === 'All day. I love meeting new people') socialScore += 30;
  else if (q15Answer === 'Sometimes, but I need quiet time to focus') socialScore += 10;

  // Resilience: Q16 (Study Tolerance)
  const q16Answer = answers.find(a => a.question_id === 'q16')?.answer as string || '';
  let resilienceScore = 0;
  if (q16Answer === 'Yes, I am ready to grind for my goal') resilienceScore = 100;
  else if (q16Answer === 'Maybe, but I might burn out') resilienceScore = 60;
  else if (q16Answer === 'No, I prefer a balanced life with hobbies') resilienceScore = 30;
  else if (q16Answer === 'Absolutely not') resilienceScore = 10;

  // Financial: Q13 (₹1 Lakh) + Q18 (Budget)
  const q13Answer = answers.find(a => a.question_id === 'q13')?.answer as string || '';
  const q18Answer = answers.find(a => a.question_id === 'q18')?.answer as string || '';
  let financialScore = 0;
  if (q13Answer.includes('Buy and resell') || q13Answer.includes('profit')) financialScore += 30;
  if (q18Answer.includes('₹15 Lakhs+')) financialScore += 20;
  else if (q18Answer.includes('₹5 - ₹10')) financialScore += 15;
  else if (q18Answer.includes('₹2 - ₹5')) financialScore += 10;

  // Normalize scores to 0-100
  const maxScore = Math.max(logicScore, creativityScore, socialScore, resilienceScore, financialScore, 1);
  return [
    { axis: 'Logic', value: Math.min(100, (logicScore / maxScore) * 100) },
    { axis: 'Creativity', value: Math.min(100, (creativityScore / maxScore) * 100) },
    { axis: 'Social', value: Math.min(100, (socialScore / maxScore) * 100) },
    { axis: 'Resilience', value: resilienceScore },
    { axis: 'Financial', value: Math.min(100, financialScore) }
  ];
  } catch (error) {
    console.error('Error calculating Aptitude DNA:', error);
    // Return default scores on error
    return [
      { axis: 'Logic', value: 50 },
      { axis: 'Creativity', value: 50 },
      { axis: 'Social', value: 50 },
      { axis: 'Resilience', value: 50 },
      { axis: 'Financial', value: 50 }
    ];
  }
};

// Calculate Stream Fit scores for Bar Chart
const calculateStreamFit = (traitScores: any, answers: QuizAnswer[]) => {
  try {
    const q8Answer = answers.find(a => a.question_id === 'q8')?.answer as string || '';
    const q6Answers = answers.find(a => a.question_id === 'q6')?.answer as string[] || [];
    const q16Answer = answers.find(a => a.question_id === 'q16')?.answer as string || '';
    
    // Base scores from traits
    let pcmScore = (traitScores.logical || 0) * 2 + (traitScores.handsOn || 0);
    let pcbScore = (traitScores.logical || 0) + (traitScores.people || 0) * 2;
    let commerceScore = (traitScores.leader || 0) * 2 + (traitScores.logical || 0);
    let humanitiesScore = (traitScores.creative || 0) * 2 + (traitScores.people || 0);
    let vocationalScore = (traitScores.handsOn || 0) * 2 + (traitScores.creative || 0);

    // Boost PCM if high math
    if (q8Answer === 'I love the challenge. I fight it until I get the answer') pcmScore += 30;

    // Kill PCB if avoids medical
    if (q6Answers.includes('Dealing with blood, needles, or sick people')) pcbScore = Math.max(0, pcbScore - 40);

    // Adjust based on study tolerance
    if (q16Answer === 'Yes, I am ready to grind for my goal') {
      pcmScore += 20;
      pcbScore += 20;
    } else if (q16Answer === 'Absolutely not') {
      pcmScore = Math.max(0, pcmScore - 30);
      pcbScore = Math.max(0, pcbScore - 30);
      vocationalScore += 20;
    }

    // Normalize to 0-100
    const maxScore = Math.max(pcmScore, pcbScore, commerceScore, humanitiesScore, vocationalScore, 1);
    return [
      { stream: 'Science (PCM)', score: Math.min(100, (pcmScore / maxScore) * 100) },
      { stream: 'Science (PCB)', score: Math.min(100, (pcbScore / maxScore) * 100) },
      { stream: 'Commerce', score: Math.min(100, (commerceScore / maxScore) * 100) },
      { stream: 'Humanities', score: Math.min(100, (humanitiesScore / maxScore) * 100) },
      { stream: 'Vocational', score: Math.min(100, (vocationalScore / maxScore) * 100) }
    ];
  } catch (error) {
    console.error('Error calculating Stream Fit:', error);
    // Return default scores on error
    return [
      { stream: 'Science (PCM)', score: 50 },
      { stream: 'Science (PCB)', score: 50 },
      { stream: 'Commerce', score: 50 },
      { stream: 'Humanities', score: 50 },
      { stream: 'Vocational', score: 50 }
    ];
  }
};

export default function PathFinderPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [pageState, setPageState] = useState<PageState>('welcome');
  const [studentName, setStudentName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0); // 0: Q1-Q7, 1: Q8-Q15, 2: Q16-Q25
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [levelCompleted, setLevelCompleted] = useState<number | null>(null);
  const [expandedChart, setExpandedChart] = useState<'radar' | 'bar' | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  const t = translations[language];

  // Level calculation: 0 (Q1-Q7), 1 (Q8-Q15), 2 (Q16-Q25)
  const getCurrentLevel = (questionIndex: number): number => {
    if (questionIndex < 7) return 0; // Level 1: The Vibe Check
    if (questionIndex < 15) return 1; // Level 2: The Reality Check
    return 2; // Level 3: The Future Vision
  };

  const getLevelInfo = (level: number) => {
    const levels = [
      { name: 'The Vibe Check', start: 0, end: 6, total: 7 },
      { name: 'The Reality Check', start: 7, end: 14, total: 8 },
      { name: 'The Future Vision', start: 15, end: 24, total: 10 }
    ];
    return levels[level] || levels[0];
  };

  const getQuestionsInLevel = (level: number): number => {
    const info = getLevelInfo(level);
    return info.total;
  };

  const getProgressInLevel = (questionIndex: number): { current: number; total: number } => {
    const level = getCurrentLevel(questionIndex);
    const info = getLevelInfo(level);
    const current = questionIndex - info.start + 1;
    return { current, total: info.total };
  };

  useEffect(() => {
    // Update currentLevel when currentQuestion changes
    setCurrentLevel(getCurrentLevel(currentQuestion));
  }, [currentQuestion]);

  useEffect(() => {
    // Track chart views
    if (expandedChart) {
      trackEvent('chart_viewed', { chart_type: expandedChart, language });
    }
  }, [expandedChart, language]);

  useEffect(() => {
    initPostHog();
    trackPageView('path-finder');
    trackEvent('demo_page_view', {
      language,
      utm_source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') : null,
      utm_medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') : null
    });

    // Load animations preference
    const savedAnimations = localStorage.getItem('mentark-animations-enabled');
    if (savedAnimations !== null) {
      setAnimationsEnabled(savedAnimations === 'true');
    }

    // Check for saved progress
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < STORAGE_EXPIRY) {
          setAnswers(data.answers);
          setCurrentQuestion(data.currentQuestion || 0);
          const savedLevel = data.currentLevel !== undefined ? data.currentLevel : getCurrentLevel(data.currentQuestion || 0);
          setCurrentLevel(savedLevel);
          setStudentName(data.studentName || '');
          if (data.result) {
            setResult(data.result);
            setPageState('results');
          } else if (data.answers.length > 0) {
            setPageState('quiz');
            // Show resume message
            const levelInfo = getLevelInfo(savedLevel);
            toast.info(`Resuming Level ${savedLevel + 1}: ${levelInfo.name}`, {
              duration: 3000,
              description: `You were on question ${data.currentQuestion + 1} of ${pathFinderQuestions.length}`
            });
          }
        }
      } catch (e) {
        console.error('Failed to load saved progress', e);
      }
    }
  }, []);

  const saveProgress = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers,
      currentQuestion,
      currentLevel,
      studentName,
      result,
      timestamp: Date.now()
    }));
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    localStorage.setItem('mentark-animations-enabled', String(enabled));
  };

  const handleStart = () => {
    trackEvent('demo_quiz_started', { language });
    setPageState('name');
  };

  const handleNameSubmit = (name: string) => {
    setStudentName(name);
    setPageState('quiz');
    saveProgress();
  };

  const handleAnswer = (questionId: string, answer: string | number | string[]) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.question_id === questionId);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { question_id: questionId, answer };
    } else {
      newAnswers.push({ question_id: questionId, answer });
    }
    
    setAnswers(newAnswers);
    trackEvent('demo_question_answered', {
      question_id: questionId,
      question_number: currentQuestion + 1,
      answer: typeof answer === 'string' ? answer.substring(0, 50) : Array.isArray(answer) ? answer.join(', ') : answer
    });
    saveProgress();
  };

  const handleMultiSelect = (questionId: string, option: string) => {
    const currentAnswer = getCurrentAnswer(questionId);
    const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
    const maxSelections = questionId === 'q6' ? 3 // Q6: Ick List - max 3
      : questionId === 'q8' ? 3 // Q8: Subject Interest - max 3 (old question, but keeping for compatibility)
      : 999; // Others unlimited
    
    if (selectedOptions.includes(option)) {
      // Remove if already selected
      const newSelection = selectedOptions.filter(o => o !== option);
      handleAnswer(questionId, newSelection.length > 0 ? newSelection : []);
    } else {
      // Add if not selected
      if (selectedOptions.length < maxSelections) {
        handleAnswer(questionId, [...selectedOptions, option]);
      } else {
        toast.info(`You can select maximum ${maxSelections} options`);
      }
    }
  };

  const handleNext = () => {
    const currentLevelBefore = getCurrentLevel(currentQuestion);
    const nextQuestion = currentQuestion + 1;
    
    if (nextQuestion < pathFinderQuestions.length) {
      const nextLevel = getCurrentLevel(nextQuestion);
      
      // Check if we're completing a level
      if (nextLevel > currentLevelBefore) {
        // Level completed!
        setLevelCompleted(currentLevelBefore);
        trackEvent('level_completed', { level: currentLevelBefore, language });
        
        // Clear the completion animation after 2 seconds
        setTimeout(() => {
          setLevelCompleted(null);
          setCurrentQuestion(nextQuestion);
        }, animationsEnabled ? 2000 : 0);
      } else {
        setCurrentQuestion(nextQuestion);
      }
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = () => {
    const quizResult = calculateResult(answers, language);
    setResult(quizResult);
    setPageState('results');
    
    trackEvent('demo_quiz_completed', {
      duration_seconds: Math.floor((Date.now() - (localStorage.getItem(STORAGE_KEY) ? JSON.parse(localStorage.getItem(STORAGE_KEY)!).timestamp : Date.now())) / 1000),
      stream_result: quizResult.stream,
      confidence: quizResult.confidence
    });
    
    trackEvent('demo_result_shown', {
      strengths: quizResult.strengths,
      stream: quizResult.stream,
      confidence: quizResult.confidence
    });
    
    saveProgress();
  };

  const handleBuildRoadmap = async () => {
    if (!result) return;
    
    setIsLoadingRoadmap(true);
    trackEvent('demo_click_build_roadmap', { stream: result.stream });
    
    try {
      console.log('🚀 Starting roadmap generation...', {
        stream: result.stream,
        strengths: result.strengths,
        studyTolerance: result.studyTolerance,
        budgetConstraint: result.budgetConstraint,
        studentName: studentName || undefined,
        language
      });

      // Extract additional data from answers
      const careerVisionAnswer = answers.find(a => a.question_id === 'q17')?.answer as string | undefined;
      const lifestyleAnswer = answers.find(a => a.question_id === 'q18')?.answer as string | undefined;
      const geographicAnswer = answers.find(a => a.question_id === 'q22')?.answer as string[] | undefined;
      const entrepreneurshipAnswer = answers.find(a => a.question_id === 'q20')?.answer as number | undefined;
      const workLifeBalanceAnswer = answers.find(a => a.question_id === 'q21')?.answer as number | undefined;

      const response = await fetch('/api/path-finder/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream: result.stream,
          strengths: result.strengths,
          studyTolerance: result.studyTolerance,
          budgetConstraint: result.budgetConstraint,
          studentName: studentName || undefined,
          language,
          traitScores: result.traitScores,
          personalityInsights: result.personalityInsights,
          careerVision: careerVisionAnswer,
          lifestylePreference: lifestyleAnswer,
          geographicPreference: geographicAnswer,
          entrepreneurshipInterest: entrepreneurshipAnswer,
          workLifeBalance: workLifeBalanceAnswer
        })
      });

      console.log('📡 API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Roadmap data received:', data);
        
        if (data.success && data.data?.roadmap) {
          setRoadmap(data.data.roadmap);
          setShowRoadmap(true);
          toast.success('Roadmap generated successfully!');
        } else {
          console.error('❌ Invalid response structure:', data);
          throw new Error(data.message || 'Failed to generate roadmap');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate roadmap' }));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('❌ Roadmap generation error:', error);
      const errorMessage = error.message || t.roadmap.error;
      toast.error(errorMessage);
      
      // Show fallback roadmap if AI fails
      console.log('📋 Using fallback roadmap...');
      const fallbackRoadmap = generateFallbackRoadmap(result.stream, language);
      setRoadmap({
        title: `Your 2-Year Roadmap for ${result.stream}`,
        description: `A personalized roadmap based on your strengths: ${result.strengths.join(', ')}. This is a template roadmap. For AI-generated detailed roadmaps, configure AI API keys.`,
        milestones: [],
        monthly_plan: fallbackRoadmap
      });
      setShowRoadmap(true);
      toast.info('Showing template roadmap. Configure AI API keys for detailed AI-generated roadmaps.');
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const generateFallbackRoadmap = (stream: string, lang: Language): string[] => {
    const roadmaps: Record<string, Record<Language, string[]>> = {
      'Science (PCM)': {
        en: [
          'Month 0-3: Build solid foundations in Maths & Physics basics',
          'Month 4-12: Divide the year into weekly blocks focusing on Mechanics → EM → Magnetism → Optics',
          'Month 13-18: Practice 2 chapter-wise tests per month',
          'Month 19-24: Full syllabus test every 14 days, exam-ready routine'
        ],
        hi: [
          'महीना 0-3: गणित और भौतिकी की मूल बातें में ठोस नींव बनाएं',
          'महीना 4-12: सप्ताहिक ब्लॉक में वर्ष को विभाजित करें',
          'महीना 13-18: प्रति माह 2 अध्याय-वार परीक्षण करें',
          'महीना 19-24: हर 14 दिन में पूर्ण पाठ्यक्रम परीक्षण'
        ],
        mr: [
          'महिना 0-3: गणित आणि भौतिकशास्त्र मूलभूत गोष्टींमध्ये घन पाया तयार करा',
          'महिना 4-12: साप्ताहिक ब्लॉकमध्ये वर्ष विभाजित करा',
          'महिना 13-18: दर महिन्याला 2 अध्याय-वार चाचण्या करा',
          'महिना 19-24: दर 14 दिवसांनी पूर्ण अभ्यासक्रम चाचणी'
        ]
      },
      'Science (PCB)': {
        en: [
          'Month 0-3: Strong NCERT biology readings for Cell Biology, Plant Physiology, and Genetics',
          'Month 4-12: Focus on NCERT + PYQs for Work-Energy-Power, Kinematics, Thermodynamics',
          'Month 13-18: Build "Bio Notes Vault" with diagrams, flowcharts, and micro-notes',
          'Month 19-24: Daily 30 MCQs + weekly chapter tests, NEET prep'
        ],
        hi: [
          'महीना 0-3: सेल बायोलॉजी, प्लांट फिजियोलॉजी और जेनेटिक्स के लिए मजबूत NCERT जीव विज्ञान पढ़ना',
          'महीना 4-12: वर्क-एनर्जी-पावर, काइनेमेटिक्स, थर्मोडायनामिक्स के लिए NCERT + PYQ पर ध्यान दें',
          'महीना 13-18: आरेख, फ्लोचार्ट और माइक्रो-नोट्स के साथ "बायो नोट्स वॉल्ट" बनाएं',
          'महीना 19-24: दैनिक 30 MCQs + साप्ताहिक अध्याय परीक्षण, NEET तैयारी'
        ],
        mr: [
          'महिना 0-3: सेल बायोलॉजी, प्लांट फिजियोलॉजी आणि जेनेटिक्ससाठी मजबूत NCERT जीवशास्त्र वाचन',
          'महिना 4-12: वर्क-एनर्जी-पावर, काइनेमेटिक्स, थर्मोडायनामिक्ससाठी NCERT + PYQ वर लक्ष केंद्रित करा',
          'महिना 13-18: आकृत्या, फ्लोचार्ट आणि माइक्रो-नोट्ससह "बायो नोट्स वॉल्ट" तयार करा',
          'महिना 19-24: दैनिक 30 MCQs + साप्ताहिक अध्याय चाचण्या, NEET तयारी'
        ]
      },
      'Commerce': {
        en: [
          'Month 0-3: Accounting principles, economics basics, business studies foundations',
          'Month 4-12: Weekly practice of ledger entries, journal posting, trial balance',
          'Month 13-18: Master Ratio Analysis, Costing, GST basics',
          'Month 19-24: NPAT / IPMAT / CUET prep: English + LR + Quant weekly rotation'
        ],
        hi: [
          'महीना 0-3: लेखांकन सिद्धांत, अर्थशास्त्र मूल बातें, व्यापार अध्ययन नींव',
          'महीना 4-12: खाता प्रविष्टियों, जर्नल पोस्टिंग, परीक्षण संतुलन का साप्ताहिक अभ्यास',
          'महीना 13-18: अनुपात विश्लेषण, लागत, GST मूल बातें में महारत हासिल करें',
          'महीना 19-24: NPAT / IPMAT / CUET तैयारी: अंग्रेजी + LR + मात्रा साप्ताहिक रोटेशन'
        ],
        mr: [
          'महिना 0-3: लेखांकन तत्त्वे, अर्थशास्त्र मूलभूत, व्यवसाय अभ्यास पाया',
          'महिना 4-12: खाता नोंदी, जर्नल पोस्टिंग, परीक्षण शिल्लकचा साप्ताहिक सराव',
          'महिना 13-18: गुणोत्तर विश्लेषण, खर्च, GST मूलभूत गोष्टींमध्ये प्रभुत्व मिळवा',
          'महिना 19-24: NPAT / IPMAT / CUET तयारी: इंग्रजी + LR + मात्रा साप्ताहिक रोटेशन'
        ]
      },
      'Arts/Humanities': {
        en: [
          'Month 0-3: Daily reading (15–20 min), writing practice, communication drills',
          'Month 4-12: Critical thinking assignments weekly, learn one creative skill',
          'Month 13-18: Summaries + structured notes for each chapter',
          'Month 19-24: CUET, NIFT, NID, TISS, Law (CLAT), Liberal Arts entrances prep'
        ],
        hi: [
          'महीना 0-3: दैनिक पढ़ना (15-20 मिनट), लेखन अभ्यास, संचार अभ्यास',
          'महीना 4-12: साप्ताहिक महत्वपूर्ण सोच असाइनमेंट, एक रचनात्मक कौशल सीखें',
          'महीना 13-18: प्रत्येक अध्याय के लिए सारांश + संरचित नोट्स',
          'महीना 19-24: CUET, NIFT, NID, TISS, कानून (CLAT), लिबरल आर्ट्स प्रवेश तैयारी'
        ],
        mr: [
          'महिना 0-3: दैनिक वाचन (15-20 मिनिटे), लेखन सराव, संप्रेषण ड्रिल',
          'महिना 4-12: साप्ताहिक गंभीर विचार असाइनमेंट, एक सर्जनशील कौशल्य शिका',
          'महिना 13-18: प्रत्येक अध्यायासाठी सारांश + संरचित नोट्स',
          'महिना 19-24: CUET, NIFT, NID, TISS, कायदा (CLAT), लिबरल आर्ट्स प्रवेश तयारी'
        ]
      },
      'Vocational': {
        en: [
          'Month 0-1: Identify top 2 interests: IT, Hospitality, Retail, Automotive, Media',
          'Month 2-6: Choose 1 certificate every 3 months (Coursera/Udemy/Skill India)',
          'Month 7-12: Keep English + Maths stable (NCERT-level), weekly digital assignments',
          'Month 13-24: 2 projects every year, attend 2 events per year (job fair, seminar)'
        ],
        hi: [
          'महीना 0-1: शीर्ष 2 रुचियों की पहचान करें: IT, आतिथ्य, खुदरा, ऑटोमोटिव, मीडिया',
          'महीना 2-6: हर 3 महीने में 1 प्रमाणपत्र चुनें (Coursera/Udemy/Skill India)',
          'महीना 7-12: अंग्रेजी + गणित को स्थिर रखें (NCERT-स्तर), साप्ताहिक डिजिटल असाइनमेंट',
          'महीना 13-24: हर साल 2 परियोजनाएं, साल में 2 कार्यक्रमों में भाग लें (नौकरी मेला, सेमिनार)'
        ],
        mr: [
          'महिना 0-1: शीर्ष 2 स्वारस्य ओळखा: IT, आतिथ्य, खुदरा, ऑटोमोटिव्ह, मीडिया',
          'महिना 2-6: दर 3 महिन्यांत 1 प्रमाणपत्र निवडा (Coursera/Udemy/Skill India)',
          'महिना 7-12: इंग्रजी + गणित स्थिर ठेवा (NCERT-स्तर), साप्ताहिक डिजिटल असाइनमेंट',
          'महिना 13-24: दर वर्षी 2 प्रकल्प, वर्षात 2 कार्यक्रमांमध्ये सहभागी व्हा (नोकरी मेळा, सेमिनार)'
        ]
      }
    };

    const streamRoadmaps = roadmaps[stream] || roadmaps['Science (PCM)'];
    return streamRoadmaps[lang] || streamRoadmaps.en;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/path-finder?utm_source=demo&utm_medium=share`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied! Share it with your teacher.');
      trackEvent('demo_click_share_teacher', { stream: result?.stream });
    });
    
    // Open email client
    const subject = encodeURIComponent('Check out Mentark Path Finder');
    const body = encodeURIComponent(`Hi,\n\nI just discovered my best-fit stream using Mentark Path Finder. Check it out: ${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleGenerateShareableCard = async () => {
    try {
      setChartError(null);
      const cardElement = document.getElementById('shareable-card');
      if (!cardElement) {
        toast.error('Card element not found');
        return;
      }

      // Show loading state
      toast.loading('Generating your shareable card...', { id: 'generating-card' });

      // Dynamically import html2canvas
      const html2canvasModule = await import('html2canvas');
      const canvas = await html2canvasModule.default(cardElement, {
        backgroundColor: null,
        scale: 2,
        logging: false
      });

      // Convert to image and download
      const link = document.createElement('a');
      link.download = `mentark-path-finder-${studentName || 'results'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Card downloaded! Share it on Instagram or social media.', { id: 'generating-card' });
      trackEvent('share_card_generated', { 
        stream: result?.stream,
        hasName: !!studentName,
        language 
      });
    } catch (error) {
      console.error('Error generating shareable card:', error);
      toast.error('Failed to generate card. Please try again.', { id: 'generating-card' });
      setChartError('Failed to generate shareable card');
    }
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.question_id === questionId)?.answer;
  };

  // Icon mapping for card selectors
  const getOptionIcon = (option: string, questionId: string): React.ReactNode => {
    const lowerOption = option.toLowerCase();
    
    // Q1: Scroll Test
    if (questionId === 'q1') {
      if (lowerOption.includes('tech') || lowerOption.includes('coding') || lowerOption.includes('how things work')) return <Smartphone className="h-5 w-5" />;
      if (lowerOption.includes('finance') || lowerOption.includes('stock') || lowerOption.includes('ceo') || lowerOption.includes('business')) return <TrendingUp className="h-5 w-5" />;
      if (lowerOption.includes('art') || lowerOption.includes('dance') || lowerOption.includes('music') || lowerOption.includes('fashion') || lowerOption.includes('movie')) return <Palette className="h-5 w-5" />;
      if (lowerOption.includes('psychology') || lowerOption.includes('history') || lowerOption.includes('social')) return <BookOpen className="h-5 w-5" />;
      if (lowerOption.includes('gaming') || lowerOption.includes('memes') || lowerOption.includes('entertainment')) return <Gamepad2 className="h-5 w-5" />;
      if (lowerOption.includes("don't use social")) return <Shield className="h-5 w-5" />;
    }
    
    // Q2: School Fest
    if (questionId === 'q2') {
      if (lowerOption.includes('budget') || lowerOption.includes('ticket') || lowerOption.includes('sponsorship')) return <DollarSign className="h-5 w-5" />;
      if (lowerOption.includes('design') || lowerOption.includes('poster') || lowerOption.includes('social media')) return <Paintbrush className="h-5 w-5" />;
      if (lowerOption.includes('sound') || lowerOption.includes('lighting') || lowerOption.includes('electrical')) return <Zap className="h-5 w-5" />;
      if (lowerOption.includes('host') || lowerOption.includes('emcee') || lowerOption.includes('guest')) return <Users className="h-5 w-5" />;
    }
    
    // Q3: Broken Phone
    if (questionId === 'q3') {
      if (lowerOption.includes('google') || lowerOption.includes('repair') || lowerOption.includes('reboot')) return <Wrench className="h-5 w-5" />;
      if (lowerOption.includes('calculate') || lowerOption.includes('money') || lowerOption.includes('save')) return <Calculator className="h-5 w-5" />;
      if (lowerOption.includes('call') || lowerOption.includes('friend') || lowerOption.includes('parent') || lowerOption.includes('panic')) return <Heart className="h-5 w-5" />;
      if (lowerOption.includes('universe') || lowerOption.includes('detox')) return <Sparkles className="h-5 w-5" />;
    }
    
    // Q4: Group Project
    if (questionId === 'q4') {
      if (lowerOption.includes('research') || lowerOption.includes('write') || lowerOption.includes('factual')) return <FileText className="h-5 w-5" />;
      if (lowerOption.includes('powerpoint') || lowerOption.includes('beautiful') || lowerOption.includes('present')) return <Palette className="h-5 w-5" />;
      if (lowerOption.includes('organize') || lowerOption.includes('team') || lowerOption.includes('deadline')) return <Target className="h-5 w-5" />;
      if (lowerOption.includes('analyze') || lowerOption.includes('data') || lowerOption.includes('chart') || lowerOption.includes('graph')) return <TrendingUp className="h-5 w-5" />;
    }
    
    // Q5: Flow State
    if (questionId === 'q5') {
      if (lowerOption.includes('math') || lowerOption.includes('coding')) return <Calculator className="h-5 w-5" />;
      if (lowerOption.includes('reading') || lowerOption.includes('story') || lowerOption.includes('history') || lowerOption.includes('social')) return <BookOpen className="h-5 w-5" />;
      if (lowerOption.includes('drawing') || lowerOption.includes('editing') || lowerOption.includes('video') || lowerOption.includes('music')) return <Palette className="h-5 w-5" />;
      if (lowerOption.includes('biological') || lowerOption.includes('diagram') || lowerOption.includes('chemical')) return <Microscope className="h-5 w-5" />;
    }
    
    // Default icons based on keywords
    if (lowerOption.includes('tech') || lowerOption.includes('code') || lowerOption.includes('computer')) return <Code className="h-5 w-5" />;
    if (lowerOption.includes('business') || lowerOption.includes('money') || lowerOption.includes('profit')) return <DollarSign className="h-5 w-5" />;
    if (lowerOption.includes('creative') || lowerOption.includes('art') || lowerOption.includes('design')) return <Palette className="h-5 w-5" />;
    if (lowerOption.includes('people') || lowerOption.includes('help') || lowerOption.includes('social')) return <Users className="h-5 w-5" />;
    if (lowerOption.includes('science') || lowerOption.includes('research') || lowerOption.includes('lab')) return <Microscope className="h-5 w-5" />;
    if (lowerOption.includes('medical') || lowerOption.includes('doctor') || lowerOption.includes('health')) return <Stethoscope className="h-5 w-5" />;
    if (lowerOption.includes('lead') || lowerOption.includes('organize') || lowerOption.includes('manage')) return <Target className="h-5 w-5" />;
    if (lowerOption.includes('learn') || lowerOption.includes('study') || lowerOption.includes('education')) return <GraduationCap className="h-5 w-5" />;
    
    return <CheckCircle className="h-5 w-5" />; // Default icon
  };

  const canProceed = () => {
    const question = pathFinderQuestions[currentQuestion];
    if (!question) return true;
    const answer = getCurrentAnswer(question.id);
    
    if (question.type === 'multi_select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    
    return answer !== undefined;
  };

  const progress = ((currentQuestion + 1) / pathFinderQuestions.length) * 100;
  const timeRemaining = Math.max(1, Math.ceil((pathFinderQuestions.length - currentQuestion - 1) * 0.15));

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Mentark" className="h-9 w-9 rounded-lg" />
            <span className="font-display text-lg font-bold text-gradient-cyan">Mentark</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
              {t.welcome.badge}
            </Badge>
            <div className="flex items-center gap-1 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs rounded ${language === 'en' ? 'bg-yellow-500 text-black' : 'text-slate-300'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs rounded ${language === 'hi' ? 'bg-yellow-500 text-black' : 'text-slate-300'}`}
              >
                हिं
              </button>
              <button
                onClick={() => setLanguage('mr')}
                className={`px-2 py-1 text-xs rounded ${language === 'mr' ? 'bg-yellow-500 text-black' : 'text-slate-300'}`}
              >
                मर
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="h-16" />

      <AnimatePresence mode="wait">
        {pageState === 'welcome' && (
          <motion.section
            key="welcome"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="container mx-auto px-4 pt-20 pb-12"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
                {t.welcome.title}
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 mb-4">
                Choose your diagnostic test
              </p>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-8">
                {t.welcome.badge}
              </Badge>
            </motion.div>
            
            {/* Test Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              {/* Standard Path Finder */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-slate-700/70 bg-slate-900/40 hover:border-cyan-500/50 transition-all cursor-pointer h-full"
                  onClick={handleStart}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="h-8 w-8 text-cyan-400" />
                      <CardTitle className="text-2xl">Standard Path Finder</CardTitle>
                    </div>
                    <CardDescription>
                      For Class 10 students discovering their ideal stream
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>~25 questions • 5-8 minutes</span>
                    </div>
                    <ul className="text-sm text-slate-300 space-y-2 text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>Stream recommendation (Science/Commerce/Arts)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>Career path suggestions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span>College recommendations</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-gradient-cyan-blue text-black font-semibold mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStart();
                      }}
                    >
                      {t.welcome.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* NEET Diagnostic Test */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-slate-700/70 bg-slate-900/40 hover:border-teal-500/50 transition-all cursor-pointer h-full"
                  onClick={() => window.location.href = '/path-finder/neet'}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Stethoscope className="h-8 w-8 text-teal-400" />
                      <CardTitle className="text-2xl">NEET Diagnostic Test</CardTitle>
                    </div>
                    <CardDescription>
                      High-stakes diagnostic for NEET aspirants with Plan A & Plan B
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>~25 questions • 8-12 minutes</span>
                    </div>
                    <ul className="text-sm text-slate-300 space-y-2 text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>NEET probability (Govt seat chances)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>Allied health career fit (Plan B)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                        <span>Subject-wise analysis & rank improvement</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/path-finder/neet';
                      }}
                    >
                      Start NEET Diagnostic
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Animation Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <Label htmlFor="animations-toggle" className="text-sm text-slate-400 cursor-pointer">
                Enable animations
              </Label>
              <button
                id="animations-toggle"
                onClick={() => handleAnimationsToggle(!animationsEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  animationsEnabled ? 'bg-yellow-500' : 'bg-slate-700'
                }`}
                aria-label="Toggle animations"
              >
                <motion.div
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                  animate={animationsEnabled ? { x: 24 } : { x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </motion.section>
        )}

        {pageState === 'name' && (
          <motion.section
            key="name"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="container mx-auto px-4 pt-20 pb-12 max-w-md"
          >
            <Card className="border-slate-700/70 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-2xl">{t.name.title}</CardTitle>
                <CardDescription>{t.name.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t.name.placeholder}</Label>
                  <Input
                    id="name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={t.name.placeholder}
                    className="mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && studentName.trim()) {
                        handleNameSubmit(studentName.trim());
                      }
                    }}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleNameSubmit('')}
                    className="flex-1"
                  >
                    {t.name.skip}
                  </Button>
                  <Button
                    onClick={() => handleNameSubmit(studentName.trim())}
                    className="flex-1 bg-gradient-cyan-blue text-black"
                    disabled={!studentName.trim()}
                  >
                    {t.name.continue}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Level Completion Animation */}
        <AnimatePresence>
          {levelCompleted !== null && animationsEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                exit={{ y: 50 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-yellow-500 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Level {levelCompleted + 1} Complete! 🎉
                </h2>
                <p className="text-slate-300">
                  {getLevelInfo(levelCompleted).name}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {pageState === 'quiz' && (
          <motion.section
            key="quiz"
            initial={animationsEnabled ? { opacity: 0, x: 40 } : { opacity: 1, x: 0 }}
            animate={animationsEnabled ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
            exit={animationsEnabled ? { opacity: 0, x: -40 } : { opacity: 1, x: 0 }}
            className="container mx-auto px-4 pt-8 pb-12 max-w-2xl"
            onKeyDown={(e) => {
              // Keyboard navigation: Arrow keys to navigate, Enter to select
              if (e.key === 'ArrowRight' && currentQuestion < pathFinderQuestions.length - 1) {
                e.preventDefault();
                handleNext();
              } else if (e.key === 'ArrowLeft' && currentQuestion > 0) {
                e.preventDefault();
                handlePrevious();
              }
            }}
            tabIndex={0}
          >
            <div className="mb-6 space-y-3">
              {/* Level Progress Indicator */}
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                  Level {currentLevel + 1}: {getLevelInfo(currentLevel).name}
                </Badge>
                <span className="text-sm text-slate-400">
                  {(() => {
                    const levelProgress = getProgressInLevel(currentQuestion);
                    return `${levelProgress.current} / ${levelProgress.total} questions`;
                  })()}
                </span>
              </div>
              
              {/* Overall Progress */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">
                  {t.quiz.progress.replace('{current}', String(currentQuestion + 1)).replace('{total}', String(pathFinderQuestions.length))}
                </span>
                {currentQuestion >= 3 && (
                  <span className="text-sm text-yellow-300">
                    {t.quiz.timeLeft.replace('{minutes}', String(timeRemaining))}
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="border-slate-700/70 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="text-xl" id="question-title">
                  {pathFinderQuestions[currentQuestion].question[language]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4" role="group" aria-labelledby="question-title">
                {pathFinderQuestions[currentQuestion].type === 'single_choice' && (
                  <div className="space-y-3">
                    {pathFinderQuestions[currentQuestion].options?.[language].map((option, idx) => {
                      const questionId = pathFinderQuestions[currentQuestion].id;
                      const isSelected = getCurrentAnswer(questionId) === option;
                      const icon = getOptionIcon(option, questionId);
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleAnswer(questionId, option)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleAnswer(questionId, option);
                            }
                          }}
                          whileHover={animationsEnabled ? { scale: 1.02 } : {}}
                          whileTap={animationsEnabled ? { scale: 0.98 } : {}}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                              : 'border-slate-700 hover:border-slate-600 text-slate-200'
                          }`}
                          aria-label={`Option ${idx + 1}: ${option}${isSelected ? ', selected' : ''}`}
                          aria-pressed={isSelected}
                          role="radio"
                          tabIndex={0}
                        >
                          <div className={`flex-shrink-0 ${isSelected ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {icon}
                          </div>
                          <span className="flex-1">{option}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {pathFinderQuestions[currentQuestion].type === 'slider' && (
                  <div className="space-y-4">
                    <Slider
                      value={[getCurrentAnswer(pathFinderQuestions[currentQuestion].id) as number || 5]}
                      onValueChange={([value]) => handleAnswer(pathFinderQuestions[currentQuestion].id, value)}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>0 - Not at all</span>
                      <span>10 - Very comfortable</span>
                    </div>
                    <div className="text-center text-lg font-semibold text-yellow-300">
                      {getCurrentAnswer(pathFinderQuestions[currentQuestion].id) || 5} / 10
                    </div>
                  </div>
                )}

                {pathFinderQuestions[currentQuestion].type === 'multi_select' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-2">
                      {pathFinderQuestions[currentQuestion].id === 'q6'
                        ? 'Select up to 3 careers you want to avoid'
                        : pathFinderQuestions[currentQuestion].id === 'q21'
                        ? 'Select all subjects you enjoy'
                        : pathFinderQuestions[currentQuestion].id === 'q8' 
                        ? 'Select up to 3 subjects'
                        : 'Select all that apply'}
                    </p>
                    {pathFinderQuestions[currentQuestion].options?.[language].map((option, idx) => {
                      const questionId = pathFinderQuestions[currentQuestion].id;
                      const currentAnswer = getCurrentAnswer(questionId);
                      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
                      const isSelected = selectedOptions.includes(option);
                      const maxSelections = questionId === 'q6' ? 3 
                        : questionId === 'q8' ? 3
                        : questionId === 'q21' ? 999
                        : 999; // Most multi-select questions allow unlimited
                      const isDisabled = !isSelected && selectedOptions.length >= maxSelections;
                      
                      const icon = getOptionIcon(option, questionId);
                      return (
                        <motion.button
                          key={idx}
                          onClick={() => handleMultiSelect(questionId, option)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                              e.preventDefault();
                              handleMultiSelect(questionId, option);
                            }
                          }}
                          disabled={isDisabled}
                          whileHover={!isDisabled && animationsEnabled ? { scale: 1.02 } : {}}
                          whileTap={!isDisabled && animationsEnabled ? { scale: 0.98 } : {}}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                              : isDisabled
                              ? 'border-slate-800 bg-slate-800/50 opacity-50 cursor-not-allowed text-slate-500'
                              : 'border-slate-700 hover:border-slate-600 text-slate-200'
                          }`}
                          aria-label={`Option ${idx + 1}: ${option}${isSelected ? ', selected' : ''}${isDisabled ? ', disabled' : ''}`}
                          aria-pressed={isSelected}
                          aria-disabled={isDisabled}
                          role="checkbox"
                          tabIndex={isDisabled ? -1 : 0}
                        >
                          <div className={`flex-shrink-0 ${isSelected ? 'text-yellow-400' : 'text-slate-400'}`}>
                            {icon}
                          </div>
                          <span className="flex-1">{option}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                    {Array.isArray(getCurrentAnswer(pathFinderQuestions[currentQuestion].id)) && pathFinderQuestions[currentQuestion].id === 'q8' && (
                      <p className="text-xs text-slate-500 mt-2">
                        Selected: {(getCurrentAnswer(pathFinderQuestions[currentQuestion].id) as string[]).length} / 3
                      </p>
                    )}
                  </div>
                )}

                {pathFinderQuestions[currentQuestion].type === 'text' && (
                  <div className="space-y-3">
                    <Textarea
                      value={(getCurrentAnswer(pathFinderQuestions[currentQuestion].id) as string) || ''}
                      onChange={(e) => handleAnswer(pathFinderQuestions[currentQuestion].id, e.target.value)}
                      placeholder={pathFinderQuestions[currentQuestion].placeholder?.[language] || 'Type your answer here...'}
                      className="min-h-[120px] bg-slate-800 border-slate-700 text-slate-200"
                      rows={5}
                    />
                    <p className="text-xs text-slate-500">
                      Describe your vision in detail. This helps us create a more personalized roadmap.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex-1"
                    aria-label={`Go to previous question${currentQuestion === 0 ? ' (disabled)' : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (currentQuestion > 0) handlePrevious();
                      }
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.quiz.previous}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-gradient-cyan-blue text-black"
                    aria-label={currentQuestion === pathFinderQuestions.length - 1 
                      ? 'Finish quiz and see results' 
                      : `Go to next question${!canProceed() ? ' (please answer first)' : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (canProceed()) handleNext();
                      }
                    }}
                  >
                    {currentQuestion === pathFinderQuestions.length - 1 ? t.quiz.finish : t.quiz.next}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {pageState === 'results' && result && (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 pt-4 pb-12"
          >
            {/* SECTION 1: HERO HEADER */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-yellow-500/20"
            >
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-cyan-500/10" />
              
              <div className="relative px-6 py-12 text-center">
                {studentName && (
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl font-poppins font-bold mb-4 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 bg-clip-text text-transparent"
                  >
                    {language === 'hi' ? `🎉 नमस्ते ${studentName}!` : language === 'mr' ? `🎉 नमस्कार ${studentName}!` : `🎉 Hi ${studentName}!`}
                  </motion.h1>
                )}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl text-slate-200 font-medium mb-2"
                >
                  {language === 'hi' ? 'आपका रास्ता तैयार है!' : language === 'mr' ? 'तुमचा मार्ग तयार आहे!' : 'Your Path is Ready!'}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto"
                >
                  {language === 'hi' 
                    ? 'आपकी अनूठी शक्तियों के आधार पर, यहाँ आपकी व्यक्तिगत 2-वर्षीय सफलता की रोडमैप है' 
                    : language === 'mr' 
                    ? 'तुमच्या अनोख्या शक्तींच्या आधारावर, येथे तुमचा वैयक्तिक 2-वर्षीय यशाचा रोडमॅप आहे'
                    : 'Based on your unique strengths, here\'s your personalized 2-year roadmap to success'}
                </motion.p>
                
                {/* Hero CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  {!showRoadmap ? (
                    <Button
                      size="lg"
                      onClick={handleBuildRoadmap}
                      disabled={isLoadingRoadmap}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg px-8 py-6 h-auto hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/50"
                    >
                      {isLoadingRoadmap ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t.roadmap.loading}
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-5 w-5" />
                          {language === 'hi' ? 'अपना 2-वर्षीय रोडमैप बनाएं' : language === 'mr' ? 'तुमचा 2-वर्षीय रोडमॅप तयार करा' : 'Build Your 2-Year Roadmap'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => {
                        if (result && roadmap) {
                          generatePDFReport({
                            studentName: studentName || undefined,
                            stream: result.stream,
                            strengths: result.strengths,
                            paths: result.paths,
                            roadmap,
                            language,
                            result: result,
                            aptitudeDNA: calculateAptitudeDNA(answers, result.traitScores),
                            streamFit: calculateStreamFit(result.traitScores, answers),
                            expandedOpportunities: generateExpandedCareerOpportunities(result.stream, result.traitScores, language),
                            traitScores: result.traitScores,
                            personalityInsights: result.personalityInsights,
                            completeTraitProfile: result.completeTraitProfile,
                            learningStyle: result.learningStyle,
                            whoYouAreNow: result.whoYouAreNow,
                            subjectRecommendations: result.subjectRecommendations
                          });
                          trackEvent('demo_download_report', { stream: result.stream });
                          toast.success('Report downloaded successfully!');
                        }
                      }}
                      className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold text-lg px-8 py-6 h-auto hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/50"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      {language === 'hi' ? 'पूरी रिपोर्ट डाउनलोड करें' : language === 'mr' ? 'संपूर्ण अहवाल डाउनलोड करा' : 'Download Full Report (PDF)'}
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                    className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 font-semibold px-6 py-6 h-auto"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    {t.results.shareTeacher}
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {/* Strengths Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-slate-700/70 bg-slate-900/40 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold text-white">
                      <Sparkles className="h-5 w-5 text-yellow-300" />
                      {t.results.strengths}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.strengths.map((strength, idx) => (
                        <Badge key={idx} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-medium text-sm px-3 py-1">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-slate-300 mt-4 font-medium">{t.results.strengthsSubtext}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stream Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-slate-700/70 bg-slate-900/40 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold text-white">
                      <Target className="h-5 w-5 text-teal-300" />
                      {t.results.stream}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-poppins font-bold mb-2 text-white">{result.stream}</h3>
                    <Badge
                      className={`mb-4 font-medium ${
                        result.confidence === 'High'
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : result.confidence === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      }`}
                    >
                      Confidence: {result.confidence}
                    </Badge>
                    <p className="text-sm text-slate-300 font-medium">
                      {t.results.streamSubtext.replace('{reason}', result.strengths[0].toLowerCase())}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Paths Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-slate-700/70 bg-slate-900/40 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-poppins font-semibold text-white">
                      <Rocket className="h-5 w-5 text-pink-300" />
                      {t.results.paths}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.paths.map((path, idx) => (
                        <div key={idx} className="border-l-2 border-yellow-500 pl-3">
                          <h4 className="font-poppins font-semibold text-white">{path.name}</h4>
                          <p className="text-sm text-slate-300 font-medium">{path.why}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* SECTION 3: VISUAL ANALYTICS - Enhanced with Larger Charts */}
            <div className="space-y-8 mb-12">
              {/* Aptitude DNA Radar Chart - Full Width, Larger */}
              <Card className="border-slate-700/70 bg-slate-900/40 hover:border-yellow-500/50 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-poppins font-bold text-white">
                    <Target className="h-6 w-6 text-yellow-300" />
                    📊 Your Aptitude DNA
                  </CardTitle>
                  <CardDescription className="text-slate-300 font-medium text-base">Your core strengths across 5 dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Text Summary for Screen Readers */}
                  <div className="sr-only" aria-live="polite">
                    <p>Your Aptitude DNA scores:</p>
                    <ul>
                      {calculateAptitudeDNA(answers, result.traitScores).map((item, idx) => (
                        <li key={idx}>{item.axis}: {Math.round(item.value)}%</li>
                      ))}
                    </ul>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <div className="w-full bg-slate-800/30 rounded-lg p-4" style={{ minHeight: '400px' }}>
                      {(() => {
                        try {
                          const radarData = calculateAptitudeDNA(answers, result.traitScores);
                          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                          const chartData = isMobile 
                            ? radarData.slice(0, 4) // Simplified for mobile
                            : radarData;
                          
                          return (
                            <div className="relative">
                              <ResponsiveContainer width="100%" height={isMobile ? 350 : 450} minHeight={350}>
                                <RadarChart 
                                  data={chartData}
                                  aria-label="Aptitude DNA Radar Chart showing your strengths across Logic, Creativity, Social, Resilience, and Financial dimensions"
                                >
                                  <PolarGrid stroke="#475569" strokeWidth={1} />
                                  <PolarAngleAxis 
                                    dataKey="axis" 
                                    tick={{ fill: '#fbbf24', fontSize: isMobile ? 14 : 18, fontWeight: 700 }}
                                    reversed={false}
                                    scale="auto"
                                  />
                                  <PolarRadiusAxis 
                                    angle={90} 
                                    domain={[0, 100]}
                                    tick={{ fill: '#eab308', fontSize: isMobile ? 12 : 14, fontWeight: 600 }}
                                  />
                                  <Radar
                                    name="Aptitude"
                                    dataKey="value"
                                    stroke="#fbbf24"
                                    strokeWidth={4}
                                    fill="#fbbf24"
                                    fillOpacity={0.9}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#1e293b', 
                                      border: '1px solid #475569',
                                      borderRadius: '8px'
                                    }}
                                  />
                                </RadarChart>
                              </ResponsiveContainer>
                              <button
                                onClick={() => setExpandedChart(expandedChart === 'radar' ? null : 'radar')}
                                className="absolute top-2 right-2 p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors"
                                aria-label="Expand chart"
                              >
                                <ExternalLink className="h-4 w-4 text-slate-300" />
                              </button>
                            </div>
                          );
                        } catch (error) {
                          console.error('Radar chart error:', error);
                          setChartError('Charts unavailable, showing text results');
                          return (
                            <div className="text-center p-8 text-slate-400">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p>Chart unavailable. Your Aptitude DNA:</p>
                              <div className="mt-4 space-y-2 text-left">
                                {calculateAptitudeDNA(answers, result.traitScores).map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.axis}:</span>
                                    <span className="font-semibold">{Math.round(item.value)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </Suspense>
                </CardContent>
              </Card>

              {/* Stream Fit Comparison Bar Chart - Full Width, Larger */}
              <Card className="border-slate-700/70 bg-slate-900/40 hover:border-cyan-500/50 transition-colors">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl font-poppins font-bold text-white">
                    <TrendingUp className="h-6 w-6 text-cyan-300" />
                    📈 Stream Fit Comparison
                  </CardTitle>
                  <CardDescription className="text-slate-300 font-medium text-base">How well you fit each stream</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Text Summary for Screen Readers */}
                  <div className="sr-only" aria-live="polite">
                    <p>Stream Fit Scores:</p>
                    <ul>
                      {calculateStreamFit(result.traitScores, answers).map((item, idx) => (
                        <li key={idx}>{item.stream}: {Math.round(item.score)}% fit{item.stream === result.stream ? ' (Recommended)' : ''}</li>
                      ))}
                    </ul>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <div className="w-full bg-slate-800/30 rounded-lg p-4" style={{ minHeight: '400px' }}>
                      {(() => {
                        try {
                          const barData = calculateStreamFit(result.traitScores, answers);
                          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                          
                          return (
                            <div className="relative">
                              <ResponsiveContainer width="100%" height={isMobile ? 350 : 450} minHeight={350}>
                                <BarChart 
                                  data={barData} 
                                  layout={isMobile ? 'vertical' : 'horizontal'}
                                  margin={{ top: 20, right: 40, left: isMobile ? 80 : 20, bottom: 20 }}
                                  aria-label="Stream Fit Comparison Bar Chart showing how well you fit each stream: Science PCM, Science PCB, Commerce, Humanities, and Vocational"
                                >
                                  {isMobile ? (
                                    <>
                                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#eab308', fontSize: 14, fontWeight: 600 }} />
                                      <YAxis 
                                        type="category" 
                                        dataKey="stream" 
                                        tick={{ fill: '#fbbf24', fontSize: 14, fontWeight: 700 }}
                                        width={120}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <XAxis 
                                        type="category" 
                                        dataKey="stream" 
                                        tick={{ fill: '#fbbf24', fontSize: 16, fontWeight: 700 }}
                                      />
                                      <YAxis type="number" domain={[0, 100]} tick={{ fill: '#eab308', fontSize: 14, fontWeight: 600 }} />
                                    </>
                                  )}
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#1e293b', 
                                      border: '1px solid #475569',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Bar 
                                    dataKey="score" 
                                    radius={[6, 6, 0, 0]}
                                  >
                                    {barData.map((entry, index) => {
                                      const fillColor = entry.stream === result.stream 
                                        ? '#fbbf24' 
                                        : entry.score > 70 
                                        ? '#22d3ee' 
                                        : entry.score > 40 
                                        ? '#eab308' 
                                        : '#94a3b8';
                                      return <Cell key={`cell-${index}`} fill={fillColor} stroke={fillColor} strokeWidth={3} />;
                                    })}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                              <button
                                onClick={() => setExpandedChart(expandedChart === 'bar' ? null : 'bar')}
                                className="absolute top-2 right-2 p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700 transition-colors"
                                aria-label="Expand chart"
                              >
                                <ExternalLink className="h-4 w-4 text-slate-300" />
                              </button>
                            </div>
                          );
                        } catch (error) {
                          console.error('Bar chart error:', error);
                          setChartError('Charts unavailable, showing text results');
                          return (
                            <div className="text-center p-8 text-slate-400">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <p>Chart unavailable. Stream Fit Scores:</p>
                              <div className="mt-4 space-y-2 text-left">
                                {calculateStreamFit(result.traitScores, answers).map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.stream}:</span>
                                    <span className="font-semibold">{Math.round(item.score)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Full-screen Chart Overlay */}
            <AnimatePresence>
              {expandedChart && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setExpandedChart(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-slate-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">
                        {expandedChart === 'radar' ? 'Your Aptitude DNA' : 'Stream Fit Comparison'}
                      </h3>
                      <button
                        onClick={() => setExpandedChart(null)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        aria-label="Close chart"
                      >
                        <AlertCircle className="h-5 w-5 text-slate-400" />
                      </button>
                    </div>
                    <div className="w-full" style={{ height: '500px' }}>
                      {expandedChart === 'radar' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={calculateAptitudeDNA(answers, result.traitScores)}>
                            <PolarGrid />
                            <PolarAngleAxis 
                              dataKey="axis" 
                              tick={{ fill: '#fbbf24', fontSize: 16, fontWeight: 600 }}
                              reversed={false}
                              scale="auto"
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#eab308', fontSize: 14, fontWeight: 500 }} />
                            <Radar name="Aptitude" dataKey="value" stroke="#fbbf24" strokeWidth={3} fill="#fbbf24" fillOpacity={0.8} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={calculateStreamFit(result.traitScores, answers)}>
                            <XAxis dataKey="stream" tick={{ fill: '#fbbf24', fontSize: 15, fontWeight: 600 }} />
                            <YAxis type="number" domain={[0, 100]} tick={{ fill: '#eab308', fontSize: 13, fontWeight: 500 }} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                              {calculateStreamFit(result.traitScores, answers).map((entry, index) => {
                                const fillColor = entry.stream === result.stream 
                                  ? '#fbbf24' 
                                  : entry.score > 70 
                                  ? '#22d3ee' 
                                  : entry.score > 40 
                                  ? '#eab308' 
                                  : '#94a3b8';
                                return <Cell key={`cell-${index}`} fill={fillColor} stroke={fillColor} strokeWidth={2} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SECTION 4: 2-YEAR ROADMAP - HERO SECTION (Largest, Most Prominent) */}
            <div className="mb-16">
              {showRoadmap && roadmap ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Roadmap Hero Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-white mb-4">
                      🗺️ {language === 'hi' ? 'आपका 2-वर्षीय रोडमैप' : language === 'mr' ? 'तुमचा 2-वर्षीय रोडमॅप' : 'Your 2-Year Roadmap'}
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto">
                      {language === 'hi' 
                        ? 'कक्षा 10 से कॉलेज तक आपकी पूरी यात्रा' 
                        : language === 'mr' 
                        ? 'इयत्ता 10 पासून महाविद्यालयापर्यंत तुमची संपूर्ण यात्रा'
                        : 'Your complete journey from Class 10 to College'}
                    </p>
                  </div>

                  {/* Roadmap Content - Large, Prominent Card */}
                  <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl shadow-yellow-500/20">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl font-poppins font-bold text-white flex items-center gap-3">
                        <Calendar className="h-7 w-7 text-yellow-300" />
                        {roadmap.title || t.roadmap.title}
                      </CardTitle>
                      {roadmap.description && (
                        <CardDescription className="text-slate-300 font-medium text-base mt-2">
                          {roadmap.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <DetailedRoadmap roadmap={roadmap} language={language} />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl shadow-yellow-500/20">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl sm:text-3xl font-poppins font-bold text-white flex items-center justify-center gap-3 mb-4">
                        <Calendar className="h-8 w-8 text-yellow-300" />
                        {language === 'hi' ? '🗺️ आपका 2-वर्षीय रोडमैप' : language === 'mr' ? '🗺️ तुमचा 2-वर्षीय रोडमॅप' : '🗺️ Your 2-Year Roadmap'}
                      </CardTitle>
                      <CardDescription className="text-slate-300 font-medium text-lg">
                        {language === 'hi' 
                          ? 'अपनी व्यक्तिगत 2-वर्षीय रोडमैप बनाने के लिए नीचे क्लिक करें' 
                          : language === 'mr' 
                          ? 'तुमचा वैयक्तिक 2-वर्षीय रोडमॅप तयार करण्यासाठी खाली क्लिक करा'
                          : 'Click below to generate your personalized 2-year roadmap'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-8">
                      <Button
                        size="lg"
                        onClick={handleBuildRoadmap}
                        disabled={isLoadingRoadmap}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl px-12 py-8 h-auto hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/50"
                      >
                        {isLoadingRoadmap ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            {t.roadmap.loading}
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-3 h-6 w-6" />
                            {language === 'hi' ? 'अपना 2-वर्षीय रोडमैप बनाएं' : language === 'mr' ? 'तुमचा 2-वर्षीय रोडमॅप तयार करा' : 'Build Your 2-Year Roadmap'}
                            <ArrowRight className="ml-3 h-6 w-6" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Enhanced Results Section */}
            <div className="space-y-6 mb-8">
              {/* Complete Trait Profile */}
              {result.completeTraitProfile && result.completeTraitProfile.length > 0 && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-300" />
                      Complete Trait Profile
                    </CardTitle>
                    <CardDescription>Your full personality breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.completeTraitProfile.map((trait, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{trait.trait}</span>
                            <Badge variant="outline" className="text-xs">
                              {trait.percentage}%
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-400">{trait.score.toFixed(1)}</span>
                        </div>
                        <Progress value={trait.percentage} className="h-2" />
                        <p className="text-xs text-slate-400">{trait.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Personality Insights */}
              {result.personalityInsights && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-pink-300" />
                      Personality Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <h4 className="text-xl font-bold mb-2 text-pink-300">{result.personalityInsights.type}</h4>
                      <p className="text-slate-300 mb-4">{result.personalityInsights.description}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Strengths
                          </h5>
                          <ul className="space-y-1">
                            {result.personalityInsights.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Growth Areas
                          </h5>
                          <ul className="space-y-1">
                            {result.personalityInsights.growthAreas.map((area, idx) => (
                              <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Learning Style */}
              {result.learningStyle && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-cyan-300" />
                      Learning Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-base px-4 py-1">
                        {result.learningStyle.primary}
                      </Badge>
                      {result.learningStyle.secondary && (
                        <>
                          <span className="text-slate-400">+</span>
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                            {result.learningStyle.secondary}
                          </Badge>
                        </>
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-200 mb-2">Recommendations:</h5>
                      <ul className="space-y-2">
                        {result.learningStyle.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Recommendations */}
              {result.subjectRecommendations && result.subjectRecommendations.length > 0 && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-300" />
                      Subject Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.subjectRecommendations.map((subject, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            subject.priority === 'High'
                              ? 'border-blue-500/30 bg-blue-500/10'
                              : subject.priority === 'Medium'
                              ? 'border-yellow-500/30 bg-yellow-500/10'
                              : 'border-slate-700 bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-semibold text-slate-200">{subject.subject}</h5>
                            <Badge
                              className={
                                subject.priority === 'High'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : subject.priority === 'Medium'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-slate-700 text-slate-300'
                              }
                            >
                              {subject.priority} Priority
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">{subject.reason}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Exam Strategy */}
              {result.examStrategy && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-300" />
                      Exam Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="font-semibold text-purple-300 mb-1">Preferred Format:</p>
                      <p className="text-slate-300">{result.examStrategy.preferredFormat}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-200 mb-2">Preparation Tips:</h5>
                      <ul className="space-y-2">
                        {result.examStrategy.preparationTips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <p className="text-sm text-slate-300">
                        <Clock className="h-4 w-4 inline mr-2 text-teal-400" />
                        {result.examStrategy.timeManagement}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alternative Streams */}
              {result.alternativeStreams && result.alternativeStreams.length > 0 && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-orange-300" />
                      Alternative Streams
                    </CardTitle>
                    <CardDescription>Other streams that might also fit you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.alternativeStreams.map((alt, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-orange-300">{alt.stream}</h5>
                            <Badge className="bg-orange-500/20 text-orange-300">
                              {alt.matchScore}% Match
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">{alt.why}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Career Insights */}
              {result.careerInsights && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-green-300" />
                      Career Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-xs text-slate-400 mb-1">Growth Potential</p>
                        <p className={`text-lg font-bold ${
                          result.careerInsights.growthPotential === 'High' ? 'text-green-300' :
                          result.careerInsights.growthPotential === 'Medium' ? 'text-yellow-300' : 'text-orange-300'
                        }`}>
                          {result.careerInsights.growthPotential}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-slate-400 mb-1">Salary Range</p>
                        <p className="text-lg font-bold text-blue-300">{result.careerInsights.salaryRange}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <p className="text-xs text-slate-400 mb-1">Job Market</p>
                        <p className={`text-lg font-bold ${
                          result.careerInsights.jobMarket === 'Growing' ? 'text-green-300' :
                          result.careerInsights.jobMarket === 'Stable' ? 'text-blue-300' : 'text-yellow-300'
                        }`}>
                          {result.careerInsights.jobMarket}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-200 mb-2">Opportunities:</h5>
                      <div className="flex flex-wrap gap-2">
                        {result.careerInsights.opportunities.map((opp, idx) => (
                          <Badge key={idx} className="bg-slate-700 text-slate-300 border-slate-600">
                            {opp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Who You Are Now - Personality Profile & Passion Map */}
              {result.whoYouAreNow && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-pink-300" />
                      Who You Are Now
                    </CardTitle>
                    <CardDescription>Your current passions, strengths, and interests</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                      <p className="text-slate-300 leading-relaxed">{result.whoYouAreNow.summary}</p>
                    </div>

                    {/* Passions Map */}
                    <div>
                      <h5 className="font-semibold text-pink-300 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        What Makes You Feel Alive
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {result.whoYouAreNow.passions.map((passion, idx) => (
                          <Badge key={idx} className="bg-pink-500/20 text-pink-300 border-pink-500/30 px-3 py-1">
                            {passion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Natural Abilities */}
                    <div>
                      <h5 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Natural Abilities
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {result.whoYouAreNow.naturalAbilities.map((ability, idx) => (
                          <Badge key={idx} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-3 py-1">
                            {ability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Flow Activities */}
                    <div>
                      <h5 className="font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Activities You Lose Track of Time Doing
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {result.whoYouAreNow.flowActivities.map((activity, idx) => (
                          <Badge key={idx} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Current Strengths & Interests Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Current Strengths
                        </h5>
                        <div className="space-y-2">
                          {result.whoYouAreNow.currentStrengths.map((strength, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-slate-300">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Subject Interests
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {result.whoYouAreNow.interests.map((interest, idx) => (
                            <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Values */}
                    {result.whoYouAreNow.values.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          What Matters to You
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {result.whoYouAreNow.values.map((value, idx) => (
                            <Badge key={idx} className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Career Paths with Life Progression */}
              {result.careerPathsWithProgression && result.careerPathsWithProgression.length > 0 && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-orange-300" />
                      Your Career Path with Life Progression
                    </CardTitle>
                    <CardDescription>See how your career will evolve over the next 10 years</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {result.careerPathsWithProgression.map((careerPath, pathIdx) => (
                      <div key={pathIdx} className="space-y-4">
                        {/* Career Header */}
                        <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold text-orange-300">{careerPath.careerName}</h4>
                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                              {careerPath.fitScore}% Fit
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm">{careerPath.description}</p>
                        </div>

                        {/* Career Progression Timeline */}
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/50 via-yellow-500/50 to-teal-500/50"></div>
                          <div className="space-y-6 pl-12">
                            {careerPath.progression.map((stage, stageIdx) => (
                              <div key={stageIdx} className="relative">
                                <div className="absolute -left-9 top-1 w-4 h-4 rounded-full bg-orange-500 border-2 border-slate-900"></div>
                                <Card className="border-slate-700/70 bg-slate-800/50">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                        {stage.stage}
                                      </Badge>
                                      {stage.salary && (
                                        <Badge variant="outline" className="border-green-500/30 text-green-300">
                                          {stage.salary}
                                        </Badge>
                                      )}
                                    </div>
                                    <h5 className="text-lg font-bold text-slate-200 mt-2">{stage.role}</h5>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <h6 className="text-xs font-semibold text-slate-400 mb-1">Responsibilities:</h6>
                                      <ul className="space-y-1">
                                        {stage.responsibilities.map((resp, respIdx) => (
                                          <li key={respIdx} className="text-sm text-slate-300 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></span>
                                            <span>{resp}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <h6 className="text-xs font-semibold text-slate-400 mb-1">Skills to Build:</h6>
                                      <div className="flex flex-wrap gap-2">
                                        {stage.skills.map((skill, skillIdx) => (
                                          <Badge key={skillIdx} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded bg-slate-700/50 border border-slate-600">
                                      <p className="text-xs text-slate-400">Lifestyle: <span className="text-slate-300">{stage.lifestyle}</span></p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Key Milestones */}
                        <div>
                          <h5 className="font-semibold text-teal-300 mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Key Milestones
                          </h5>
                          <div className="grid md:grid-cols-2 gap-3">
                            {careerPath.milestones.map((milestone, mileIdx) => (
                              <div key={mileIdx} className="p-3 rounded-lg border border-teal-500/30 bg-teal-500/5">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
                                    Year {milestone.year}
                                  </Badge>
                                  <span className="font-semibold text-teal-300 text-sm">{milestone.milestone}</span>
                                </div>
                                <p className="text-xs text-slate-400">{milestone.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            {/* SECTION 7: COLLEGE RECOMMENDATIONS - Location & Culture Aware */}
            {result.collegeRecommendations && result.collegeRecommendations.length > 0 && (
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-white mb-3">
                    🎓 {language === 'hi' ? 'आपके लिए अनुशंसित कॉलेज' : language === 'mr' ? 'तुमच्यासाठी शिफारस केलेले महाविद्यालये' : 'Recommended Colleges for You'}
                  </h2>
                  <p className="text-lg text-slate-300 font-medium">
                    {language === 'hi' 
                      ? 'आपकी प्रोफ़ाइल और प्राथमिकताओं से मेल खाने वाले शीर्ष कॉलेज - स्थान और संस्कृति के साथ' 
                      : language === 'mr' 
                      ? 'तुमच्या प्रोफाइल आणि प्राधान्यांशी जुळणारे शीर्ष महाविद्यालये - स्थान आणि संस्कृतीसह'
                      : 'Top colleges matching your profile and preferences - with location and cultural awareness'}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.collegeRecommendations.map((college, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h5 className="text-lg font-poppins font-bold text-white mb-1">{college.name}</h5>
                              <p className="text-sm text-slate-300 flex items-center gap-1 font-medium">
                                <MapPin className="h-4 w-4 text-cyan-400" />
                                {college.location}
                              </p>
                            </div>
                            {college.rank && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-semibold">
                                #{college.rank}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-base ${i < Math.floor(college.rating) ? 'text-yellow-400' : 'text-slate-600'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-slate-400 font-medium">({college.rating})</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1 font-semibold">Fees:</p>
                            <p className="text-sm font-bold text-yellow-300">{college.fees}</p>
                          </div>
                          
                          {/* Cultural Context - NEW */}
                          {college.culturalContext && (
                            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                              <p className="text-xs text-purple-300 mb-2 font-semibold flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                Cultural Context
                              </p>
                              <div className="space-y-2 text-xs">
                                <div>
                                  <span className="text-slate-400">Region: </span>
                                  <span className="text-slate-200 font-medium">{college.culturalContext.region}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Language: </span>
                                  <span className="text-slate-200 font-medium">{college.culturalContext.localLanguage}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Food: </span>
                                  <span className="text-slate-200 font-medium">{college.culturalContext.foodCulture}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400">Lifestyle: </span>
                                  <span className="text-slate-200 font-medium">{college.culturalContext.lifestyle}</span>
                                </div>
                                <div className="pt-2 border-t border-purple-500/20">
                                  <span className="text-purple-300 font-medium italic">{college.culturalContext.culturalFit}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-slate-400 mb-1 font-semibold">Admission Requirements:</p>
                            <ul className="space-y-1">
                              {college.admissionRequirements.map((req, reqIdx) => (
                                <li key={reqIdx} className="text-xs text-slate-300 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {college.placementStats && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-xs text-slate-400 mb-1 font-semibold">Average Package:</p>
                              <p className="text-base font-bold text-green-300">{college.placementStats.averagePackage}</p>
                              {college.placementStats.topRecruiters.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-slate-400 mb-1 font-semibold">Top Recruiters:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {college.placementStats.topRecruiters.slice(0, 3).map((recruiter, recIdx) => (
                                      <Badge key={recIdx} variant="outline" className="border-green-500/30 text-green-300 text-xs">
                                        {recruiter}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div>
                            <p className="text-xs text-slate-400 mb-1 font-semibold">Highlights:</p>
                            <div className="flex flex-wrap gap-1">
                              {college.highlights.map((highlight, highIdx) => (
                                <Badge key={highIdx} className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-slate-400 mb-1 font-semibold">Why This Fits You:</p>
                            <p className="text-xs text-blue-300 font-medium">{college.whyFit}</p>
                          </div>
                          
                          {college.url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 font-medium"
                              onClick={() => window.open(college.url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit College Website
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

              {/* Life Visualization */}
              {result.lifeVisualization && (
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-300" />
                      Your Life in 5 & 10 Years
                    </CardTitle>
                    <CardDescription>Visualize your future based on your choices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Vision Statement */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <h5 className="font-semibold text-purple-300 mb-2">Your Vision</h5>
                      <p className="text-slate-300 leading-relaxed">{result.lifeVisualization.vision}</p>
                    </div>

                    {/* Year 5 & Year 10 Side by Side */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Year 5 */}
                      <Card className="border-purple-500/30 bg-purple-500/5">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-lg font-bold text-purple-300">In 5 Years</h5>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              Age {result.lifeVisualization.year5.age}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Role:</p>
                            <p className="text-sm font-semibold text-slate-200">{result.lifeVisualization.year5.role}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Location:</p>
                            <p className="text-sm text-slate-300 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {result.lifeVisualization.year5.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Lifestyle:</p>
                            <p className="text-sm text-slate-300">{result.lifeVisualization.year5.lifestyle}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Achievements:</p>
                            <ul className="space-y-1">
                              {result.lifeVisualization.year5.achievements.map((achievement, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Daily Routine:</p>
                            <div className="space-y-1">
                              {result.lifeVisualization.year5.dailyRoutine.map((routine, idx) => (
                                <div key={idx} className="text-xs text-slate-400 p-1.5 rounded bg-slate-800/50">
                                  {routine}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Year 10 */}
                      <Card className="border-pink-500/30 bg-pink-500/5">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-lg font-bold text-pink-300">In 10 Years</h5>
                            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                              Age {result.lifeVisualization.year10.age}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Role:</p>
                            <p className="text-sm font-semibold text-slate-200">{result.lifeVisualization.year10.role}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Location:</p>
                            <p className="text-sm text-slate-300 flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {result.lifeVisualization.year10.location}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Lifestyle:</p>
                            <p className="text-sm text-slate-300">{result.lifeVisualization.year10.lifestyle}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Achievements:</p>
                            <ul className="space-y-1">
                              {result.lifeVisualization.year10.achievements.map((achievement, idx) => (
                                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 text-pink-400 mt-0.5 flex-shrink-0" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 rounded bg-pink-500/10 border border-pink-500/20">
                            <p className="text-xs text-slate-400 mb-1">Your Impact:</p>
                            <p className="text-xs text-pink-300">{result.lifeVisualization.year10.impact}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Key Moments Timeline */}
                    <div>
                      <h5 className="font-semibold text-teal-300 mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Key Moments in Your Journey
                      </h5>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/50 via-blue-500/50 to-purple-500/50"></div>
                        <div className="space-y-4 pl-12">
                          {result.lifeVisualization.keyMoments.map((moment, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-9 top-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-slate-900"></div>
                              <div className="p-3 rounded-lg border border-teal-500/30 bg-teal-500/5">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
                                    Year {moment.year}
                                  </Badge>
                                  <span className="font-semibold text-teal-300 text-sm">{moment.moment}</span>
                                </div>
                                <p className="text-xs text-slate-400">{moment.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* SECTION 4: 2-YEAR ROADMAP - HERO SECTION (Largest, Most Prominent) */}
            <div className="mb-16">
              {showRoadmap && roadmap ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Roadmap Hero Header */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-poppins font-bold text-white mb-4">
                      🗺️ {language === 'hi' ? 'आपका 2-वर्षीय रोडमैप' : language === 'mr' ? 'तुमचा 2-वर्षीय रोडमॅप' : 'Your 2-Year Roadmap'}
                    </h2>
                    <p className="text-lg sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto">
                      {language === 'hi' 
                        ? 'कक्षा 10 से कॉलेज तक आपकी पूरी यात्रा' 
                        : language === 'mr' 
                        ? 'इयत्ता 10 पासून महाविद्यालयापर्यंत तुमची संपूर्ण यात्रा'
                        : 'Your complete journey from Class 10 to College'}
                    </p>
                  </div>

                  {/* Roadmap Content - Large, Prominent Card */}
                  <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl shadow-yellow-500/20">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl font-poppins font-bold text-white flex items-center gap-3">
                        <Calendar className="h-7 w-7 text-yellow-300" />
                        {roadmap.title || t.roadmap.title}
                      </CardTitle>
                      {roadmap.description && (
                        <CardDescription className="text-slate-300 font-medium text-base mt-2">
                          {roadmap.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <DetailedRoadmap roadmap={roadmap} language={language} />
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90 shadow-2xl shadow-yellow-500/20">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-2xl sm:text-3xl font-poppins font-bold text-white flex items-center justify-center gap-3 mb-4">
                        <Calendar className="h-8 w-8 text-yellow-300" />
                        {language === 'hi' ? '🗺️ आपका 2-वर्षीय रोडमैप' : language === 'mr' ? '🗺️ तुमचा 2-वर्षीय रोडमॅप' : '🗺️ Your 2-Year Roadmap'}
                      </CardTitle>
                      <CardDescription className="text-slate-300 font-medium text-lg">
                        {language === 'hi' 
                          ? 'अपनी व्यक्तिगत 2-वर्षीय रोडमैप बनाने के लिए नीचे क्लिक करें' 
                          : language === 'mr' 
                          ? 'तुमचा वैयक्तिक 2-वर्षीय रोडमॅप तयार करण्यासाठी खाली क्लिक करा'
                          : 'Click below to generate your personalized 2-year roadmap'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-8">
                      <Button
                        size="lg"
                        onClick={handleBuildRoadmap}
                        disabled={isLoadingRoadmap}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl px-12 py-8 h-auto hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/50"
                      >
                        {isLoadingRoadmap ? (
                          <>
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            {t.roadmap.loading}
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-3 h-6 w-6" />
                            {language === 'hi' ? 'अपना 2-वर्षीय रोडमैप बनाएं' : language === 'mr' ? 'तुमचा 2-वर्षीय रोडमॅप तयार करा' : 'Build Your 2-Year Roadmap'}
                            <ArrowRight className="ml-3 h-6 w-6" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Shareable Card (Hidden - for html2canvas) */}
            <div 
              id="shareable-card" 
              className="hidden fixed -left-[9999px] w-[600px] h-[800px] bg-gradient-to-br from-cyan-900 via-purple-900 to-pink-900 rounded-2xl p-8 text-white"
              style={{ position: 'absolute', left: '-9999px' }}
            >
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                    {studentName || 'Student'}'s Path Finder Results
                  </div>
                  {result.personalityInsights && (
                    <div className="text-2xl font-semibold text-yellow-300 mb-4">
                      {result.personalityInsights.type}
                    </div>
                  )}
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="text-sm text-slate-300 mb-1">Top 3 Strengths</div>
                      <div className="flex flex-wrap gap-2">
                        {result.strengths.slice(0, 3).map((strength, idx) => (
                          <span key={idx} className="px-3 py-1 bg-yellow-500/20 rounded-full text-yellow-300 text-sm">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-300 mb-1">Recommended Stream</div>
                      <div className="text-xl font-bold text-cyan-300">{result.stream}</div>
                    </div>
                    {result.completeTraitProfile && result.completeTraitProfile.length > 0 && (
                      <div>
                        <div className="text-sm text-slate-300 mb-2">Trait Profile</div>
                        <div className="grid grid-cols-2 gap-2">
                          {result.completeTraitProfile.map((trait, idx) => (
                            <div key={idx} className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span>{trait.trait}</span>
                                <span className="font-semibold">{trait.percentage}%</span>
                              </div>
                              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-400 to-yellow-400" 
                                  style={{ width: `${trait.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center text-xs text-slate-400">
                  Generated by Mentark Path Finder
                </div>
              </div>
            </div>

            {/* SECTION 5: EXPANDED CAREER OPPORTUNITIES */}
            {(() => {
              const opportunities = generateExpandedCareerOpportunities(result.stream, result.traitScores, language);
              const niche = opportunities.filter(o => o.category === 'niche');
              const international = opportunities.filter(o => o.category === 'international');
              const government = opportunities.filter(o => o.category === 'government');
              
              return (niche.length > 0 || international.length > 0 || government.length > 0) ? (
                <div className="space-y-8 mb-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-poppins font-bold text-white mb-3">
                      {language === 'hi' ? 'दुनिया कितनी बड़ी है - अनंत संभावनाएं' : language === 'mr' ? 'जग किती मोठे आहे - अमर्याद शक्यता' : 'The World is Bigger Than You Think'}
                    </h2>
                    <p className="text-lg text-slate-300 font-medium">
                      {language === 'hi' ? 'कम ज्ञात लेकिन उत्कृष्ट करियर विकल्पों का अन्वेषण करें' : language === 'mr' ? 'कमी ओळखले जाणारे परंतु उत्कृष्ट करिअर पर्यायांचा शोध घ्या' : 'Explore lesser-known but excellent career opportunities'}
                    </p>
                  </div>

                  {/* Niche Roles */}
                  {niche.length > 0 && (
                    <Card className="border-slate-700/70 bg-slate-900/40">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-poppins font-semibold text-white">
                          <Zap className="h-6 w-6 text-yellow-300" />
                          {language === 'hi' ? 'अनोखे करियर (Niche Roles)' : language === 'mr' ? 'अनोखे करिअर (Niche Roles)' : 'Niche & Emerging Careers'}
                        </CardTitle>
                        <CardDescription className="text-slate-300 font-medium">
                          {language === 'hi' ? 'कम ज्ञात लेकिन उच्च विकास क्षमता वाले करियर' : language === 'mr' ? 'कमी ओळखले जाणारे परंतु उच्च वाढ क्षमता असलेले करिअर' : 'Lesser-known careers with high growth potential'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {niche.map((opp, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="text-lg font-poppins font-semibold text-yellow-300">{opp.title}</h4>
                                <Badge className={`${
                                  opp.growthPotential === 'High' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                  opp.growthPotential === 'Emerging' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                }`}>
                                  {opp.growthPotential}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-300 mb-4 font-medium">{opp.description}</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">{opp.salaryRange}</span>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400 mb-1 font-semibold">Requirements:</p>
                                  <ul className="space-y-1">
                                    {opp.requirements.map((req, i) => (
                                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <p className="text-xs text-yellow-300 mt-3 font-medium italic">💡 {opp.whyConsider}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* International Opportunities */}
                  {international.length > 0 && (
                    <Card className="border-slate-700/70 bg-slate-900/40">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-poppins font-semibold text-white">
                          <Globe className="h-6 w-6 text-cyan-300" />
                          {language === 'hi' ? 'अंतर्राष्ट्रीय अवसर' : language === 'mr' ? 'आंतरराष्ट्रीय संधी' : 'International Opportunities'}
                        </CardTitle>
                        <CardDescription className="text-slate-300 font-medium">
                          {language === 'hi' ? 'दुनिया भर में करियर बनाएं - वैश्विक अनुभव प्राप्त करें' : language === 'mr' ? 'जगभरात करिअर तयार करा - जागतिक अनुभव मिळवा' : 'Build careers worldwide - gain global experience'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {international.map((opp, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="text-lg font-poppins font-semibold text-cyan-300">{opp.title}</h4>
                                {opp.countries && (
                                  <div className="flex items-center gap-1">
                                    {opp.countries.map((country, i) => (
                                      <Badge key={i} variant="outline" className="text-xs border-cyan-500/30 text-cyan-300">
                                        {country}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-300 mb-4 font-medium">{opp.description}</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">{opp.salaryRange}</span>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400 mb-1 font-semibold">Requirements:</p>
                                  <ul className="space-y-1">
                                    {opp.requirements.map((req, i) => (
                                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <p className="text-xs text-cyan-300 mt-3 font-medium italic">🌍 {opp.whyConsider}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Government Roles */}
                  {government.length > 0 && (
                    <Card className="border-slate-700/70 bg-slate-900/40">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-poppins font-semibold text-white">
                          <Shield className="h-6 w-6 text-green-300" />
                          {language === 'hi' ? 'सरकारी करियर' : language === 'mr' ? 'सरकारी करिअर' : 'Government Careers'}
                        </CardTitle>
                        <CardDescription className="text-slate-300 font-medium">
                          {language === 'hi' ? 'राष्ट्र निर्माण में योगदान दें - सुरक्षित और प्रतिष्ठित करियर' : language === 'mr' ? 'राष्ट्र निर्माणात योगदान द्या - सुरक्षित आणि प्रतिष्ठित करिअर' : 'Contribute to nation-building - secure and prestigious careers'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          {government.map((opp, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="p-5 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="text-lg font-poppins font-semibold text-green-300">{opp.title}</h4>
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                  {language === 'hi' ? 'सरकारी' : language === 'mr' ? 'सरकारी' : 'Govt'}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-300 mb-4 font-medium">{opp.description}</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">{opp.salaryRange}</span>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-400 mb-1 font-semibold">Requirements:</p>
                                  <ul className="space-y-1">
                                    {opp.requirements.map((req, i) => (
                                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <p className="text-xs text-green-300 mt-3 font-medium italic">🇮🇳 {opp.whyConsider}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null;
            })()}

            {/* SECTION 8: FINAL CTAs - Conversion Focused */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-16 mb-8"
            >
              <Card className="border-2 border-yellow-500/30 bg-gradient-to-br from-slate-900/90 to-slate-800/90">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl sm:text-3xl font-poppins font-bold text-white mb-3">
                    🎯 {language === 'hi' ? 'अपनी यात्रा शुरू करने के लिए तैयार हैं?' : language === 'mr' ? 'तुमची यात्रा सुरू करण्यासाठी तयार आहात?' : 'Ready to Start Your Journey?'}
                  </CardTitle>
                  <CardDescription className="text-slate-300 font-medium text-base">
                    {language === 'hi' 
                      ? 'व्यक्तिगत मेंटरशिप प्राप्त करें, प्रगति ट्रैक करें, और Mentark के साथ अपनी पूरी क्षमता को अनलॉक करें' 
                      : language === 'mr' 
                      ? 'वैयक्तिक मेंटरशिप मिळवा, प्रगती ट्रॅक करा, आणि Mentark सह तुमची पूर्ण क्षमता अनलॉक करा'
                      : 'Get personalized mentorship, track progress, and unlock your full potential with Mentark'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {showRoadmap ? (
                      <Button
                        size="lg"
                        onClick={() => {
                          if (result && roadmap) {
                            generatePDFReport({
                              studentName: studentName || undefined,
                              stream: result.stream,
                              strengths: result.strengths,
                              paths: result.paths,
                              roadmap,
                              language,
                              result: result,
                              aptitudeDNA: calculateAptitudeDNA(answers, result.traitScores),
                              streamFit: calculateStreamFit(result.traitScores, answers),
                              expandedOpportunities: generateExpandedCareerOpportunities(result.stream, result.traitScores, language),
                              traitScores: result.traitScores,
                              personalityInsights: result.personalityInsights,
                              completeTraitProfile: result.completeTraitProfile,
                              learningStyle: result.learningStyle,
                              whoYouAreNow: result.whoYouAreNow,
                              subjectRecommendations: result.subjectRecommendations
                            });
                            trackEvent('demo_download_report', { stream: result.stream });
                            toast.success('Report downloaded successfully!');
                          }
                        }}
                        className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold h-[60px] hover:from-cyan-300 hover:to-cyan-400 shadow-lg shadow-cyan-500/50"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        {language === 'hi' ? 'पूरी रिपोर्ट डाउनलोड करें' : language === 'mr' ? 'संपूर्ण अहवाल डाउनलोड करा' : 'Download Full Report (PDF)'}
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        onClick={handleBuildRoadmap}
                        disabled={isLoadingRoadmap}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold h-[60px] hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/50"
                      >
                        {isLoadingRoadmap ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t.roadmap.loading}
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-5 w-5" />
                            {t.results.buildRoadmap}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleShare}
                      className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 font-semibold h-[60px]"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      {t.results.shareTeacher}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleGenerateShareableCard}
                      className="border-pink-500/50 text-pink-300 hover:bg-pink-500/10 font-semibold h-[60px]"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      {language === 'hi' ? 'Instagram पर शेयर करें' : language === 'mr' ? 'Instagram वर शेअर करा' : 'Share on Instagram'}
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold h-[60px] hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/50"
                      onClick={() => {
                        trackEvent('demo_click_get_full_access', { stream: result.stream });
                        toast.info(language === 'hi' ? 'पूर्ण पहुंच के लिए जल्द ही उपलब्ध होगा!' : language === 'mr' ? 'पूर्ण प्रवेश लवकरच उपलब्ध होईल!' : 'Full access coming soon!');
                      }}
                    >
                      <Star className="mr-2 h-5 w-5" />
                      {language === 'hi' ? 'पूर्ण पहुंच प्राप्त करें' : language === 'mr' ? 'पूर्ण प्रवेश मिळवा' : 'Get Full Access'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <p className="text-center text-xs text-slate-500 mt-4">
              {t.results.schoolsNote}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black/80 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>Demo does not save personal data unless you opt-in. Mentark respects student privacy.</p>
          <p className="mt-2">
            Contact: <a href="mailto:partnerships@mentark.com" className="text-yellow-300 hover:underline">partnerships@mentark.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Skeleton loader for roadmap
function RoadmapSkeleton() {
  return (
    <Card className="border-slate-700/70 bg-slate-900/40 mb-8">
      <CardHeader>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailedRoadmap({ roadmap, language }: { roadmap: any; language: Language }) {
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set([0]));
  const [expandedYear1, setExpandedYear1] = useState<boolean>(true);
  const [expandedYear2, setExpandedYear2] = useState<boolean>(false);
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});
  
  // Validate roadmap structure
  if (!roadmap || typeof roadmap !== 'object') {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-300 mb-2">Invalid Roadmap Data</h3>
          <p className="text-sm text-slate-400">
            The roadmap data could not be loaded. Please try generating it again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Debug: Log roadmap structure
  React.useEffect(() => {
    console.log('Roadmap data structure:', {
      hasMilestones: !!roadmap.milestones,
      milestonesLength: roadmap.milestones?.length || 0,
      hasCareerExposure: !!roadmap.career_exposure,
      careerExposureLength: roadmap.career_exposure?.length || 0,
      hasExamTimeline: !!roadmap.exam_timeline,
      examTimelineLength: roadmap.exam_timeline?.length || 0,
      hasResources: !!roadmap.resources,
      resourcesLength: roadmap.resources?.length || 0,
      roadmapKeys: Object.keys(roadmap)
    });
  }, [roadmap]);

  // Collect all resources from milestones
  const allResources: any[] = [];
  if (roadmap.milestones && Array.isArray(roadmap.milestones)) {
    roadmap.milestones.forEach((milestone: any) => {
      if (milestone.resources && Array.isArray(milestone.resources)) {
        allResources.push(...milestone.resources);
      }
    });
  }
  // Add standalone resources if they exist
  if (roadmap.resources && Array.isArray(roadmap.resources)) {
    allResources.push(...roadmap.resources);
  }

  // Categorize resources by type
  const categorizeResources = (resources: any[]) => {
    const categorized: Record<string, any[]> = {
      videos: [],
      papers: [],
      projects: [],
      news: [],
      other: []
    };

    resources.forEach((resource) => {
      const type = resource.type || 'other';
      if (categorized[type]) {
        categorized[type].push(resource);
      } else {
        categorized.other.push(resource);
      }
    });

    return categorized;
  };

  const categorizedAllResources = categorizeResources(allResources);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4 text-red-400" />;
      case 'paper':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'project':
        return <Code className="h-4 w-4 text-green-400" />;
      case 'news':
        return <Newspaper className="h-4 w-4 text-purple-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-slate-400" />;
    }
  };

  // Parse monthly plan into Year 1 and Year 2 - NO JSON.stringify
  const parseYearlyPlan = () => {
    if (!roadmap.monthly_plan) {
      // Generate fallback plan from milestones if available
      if (roadmap.milestones && Array.isArray(roadmap.milestones) && roadmap.milestones.length > 0) {
        const mid = Math.ceil(roadmap.milestones.length / 2);
        const year1 = roadmap.milestones.slice(0, mid).map((m: any) => {
          if (typeof m === 'string') return m;
          if (typeof m === 'object' && m !== null) {
            return m.title || m.description || m.name || 'Milestone';
          }
          return 'Milestone';
        });
        const year2 = roadmap.milestones.slice(mid).map((m: any) => {
          if (typeof m === 'string') return m;
          if (typeof m === 'object' && m !== null) {
            return m.title || m.description || m.name || 'Milestone';
          }
          return 'Milestone';
        });
        return { year1, year2 };
      }
      return { year1: [], year2: [] };
    }
    
    if (typeof roadmap.monthly_plan === 'object' && !Array.isArray(roadmap.monthly_plan)) {
      const year1: string[] = [];
      const year2: string[] = [];
      
      Object.entries(roadmap.monthly_plan).forEach(([period, items]: [string, any]) => {
        if (Array.isArray(items)) {
          if (period.includes('year_1') || period.includes('months_0_3') || period.includes('months_4_6') || period.includes('months_7_9') || period.includes('months_10_12')) {
            year1.push(...items.filter((item: any) => typeof item === 'string'));
          } else if (period.includes('year_2') || period.includes('months_13_15') || period.includes('months_16_18') || period.includes('months_19_21') || period.includes('months_22_24')) {
            year2.push(...items.filter((item: any) => typeof item === 'string'));
          }
        }
      });
      
      // If still empty, try to generate from milestones
      if (year1.length === 0 && year2.length === 0 && roadmap.milestones && Array.isArray(roadmap.milestones)) {
        const mid = Math.ceil(roadmap.milestones.length / 2);
        year1.push(...roadmap.milestones.slice(0, mid).map((m: any) => {
          if (typeof m === 'string') return m;
          if (typeof m === 'object' && m !== null) {
            return m.title || m.description || m.name || 'Milestone';
          }
          return 'Milestone';
        }));
        year2.push(...roadmap.milestones.slice(mid).map((m: any) => {
          if (typeof m === 'string') return m;
          if (typeof m === 'object' && m !== null) {
            return m.title || m.description || m.name || 'Milestone';
          }
          return 'Milestone';
        }));
      }
      
      return { year1, year2 };
    }
    
    // If it's an array, split in half
    if (Array.isArray(roadmap.monthly_plan)) {
      const mid = Math.ceil(roadmap.monthly_plan.length / 2);
      return {
        year1: roadmap.monthly_plan.filter((item: any) => typeof item === 'string').slice(0, mid),
        year2: roadmap.monthly_plan.filter((item: any) => typeof item === 'string').slice(mid)
      };
    }
    
    return { year1: [], year2: [] };
  };

  const { year1, year2 } = parseYearlyPlan();

  // Define categories
  const categories = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'study-plan', label: 'Study Plan', icon: Clock },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'milestones', label: 'Milestones', icon: Calendar },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'exams', label: 'Exams', icon: GraduationCap }
  ];

  return (
    <Card className="border-slate-700/70 bg-slate-900/40">
      <CardHeader className="pb-4">
        {/* Header Section - Mobile Optimized */}
        {roadmap.title && (
          <div className="mb-4">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              {roadmap.title}
            </h3>
            {roadmap.description && (
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                {roadmap.description}
              </p>
            )}
          </div>
        )}

        {/* Category Tabs - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        {/* Category Content - Mobile First */}
        <div className="min-h-[300px] space-y-4">
          {/* Overview */}
          {activeCategory === 'overview' && (
            <div className="space-y-4">
            {/* Monthly Study Plan - Collapsible Year 1 & Year 2 */}
            <Card className="border-slate-700/70 bg-slate-900/60">
              <CardHeader className="bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-b border-teal-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-300" />
                  <h4 className="text-base sm:text-lg font-bold">Monthly Study Plan</h4>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-4">
                  {/* Year 1 - Collapsible */}
                  <Collapsible
                    title="Year 1"
                    defaultOpen={expandedYear1}
                    icon={<span className="text-teal-300 font-bold text-sm">Y1</span>}
                    headerClassName="bg-teal-500/10"
                  >
                    {year1.length > 0 ? (
                      <ul className="space-y-2">
                        {year1.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-400 italic py-2">
                        <p>Generating personalized study plan...</p>
                        {roadmap.milestones && roadmap.milestones.length > 0 && (
                          <p className="text-slate-500 mt-1">
                            Check the Milestones tab for detailed roadmap
                          </p>
                        )}
                      </div>
                    )}
                  </Collapsible>

                  {/* Year 2 - Collapsible */}
                  <Collapsible
                    title="Year 2"
                    defaultOpen={expandedYear2}
                    icon={<span className="text-teal-300 font-bold text-sm">Y2</span>}
                    headerClassName="bg-teal-500/10"
                  >
                    {year2.length > 0 ? (
                      <ul className="space-y-2">
                        {year2.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-400 italic py-2">
                        <p>Generating personalized study plan...</p>
                        {roadmap.milestones && roadmap.milestones.length > 0 && (
                          <p className="text-slate-500 mt-1">
                            Check the Milestones tab for detailed roadmap
                          </p>
                        )}
                      </div>
                    )}
                  </Collapsible>
                </div>
              </CardContent>
            </Card>

            {/* Career Paths to Explore - Collapsible */}
            {roadmap.career_exposure && roadmap.career_exposure.length > 0 && (
              <Collapsible
                title={`Career Paths to Explore (${roadmap.career_exposure.length})`}
                defaultOpen={false}
                icon={<Users className="h-4 w-4 text-pink-300" />}
              >
                <div className="space-y-2">
                  {roadmap.career_exposure.map((career: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-pink-500/30 bg-pink-500/5">
                      <p className="text-sm font-medium text-pink-300">{career}</p>
                    </div>
                  ))}
                </div>
              </Collapsible>
            )}

            {/* Exam Timeline - Collapsible */}
            {roadmap.exam_timeline && roadmap.exam_timeline.length > 0 && (
              <Collapsible
                title={`Exam Timeline & Important Dates (${roadmap.exam_timeline.length})`}
                defaultOpen={false}
                icon={<Calendar className="h-4 w-4 text-blue-300" />}
              >
                <div className="space-y-2">
                  {roadmap.exam_timeline.map((exam: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                      <p className="text-sm font-medium text-blue-300">{exam}</p>
                    </div>
                  ))}
                </div>
              </Collapsible>
            )}

            {/* Resources Summary - Collapsible */}
            {roadmap.resource_summary && (
              <Collapsible
                title="Resources Summary"
                defaultOpen={false}
                icon={<BookOpen className="h-4 w-4 text-cyan-400" />}
              >
                <div className="flex flex-wrap gap-2">
                  {roadmap.resource_summary.total_videos > 0 && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      {roadmap.resource_summary.total_videos} Videos
                    </Badge>
                  )}
                  {roadmap.resource_summary.total_papers > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {roadmap.resource_summary.total_papers} Papers
                    </Badge>
                  )}
                  {roadmap.resource_summary.total_projects > 0 && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {roadmap.resource_summary.total_projects} Projects
                    </Badge>
                  )}
                  {roadmap.resource_summary.total_news > 0 && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {roadmap.resource_summary.total_news} News
                    </Badge>
                  )}
                  {roadmap.resource_summary.total_colleges > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {roadmap.resource_summary.total_colleges} Colleges
                    </Badge>
                  )}
                  {roadmap.resource_summary.total_scholarships > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      {roadmap.resource_summary.total_scholarships} Scholarships
                    </Badge>
                  )}
                </div>
              </Collapsible>
            )}
            </div>
          )}

          {/* Study Plan Category - Mobile Optimized */}
          {activeCategory === 'study-plan' && (
            <div className="space-y-4">
            <Card className="border-slate-700/70 bg-slate-900/60">
              <CardHeader className="bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-b border-teal-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-300" />
                  <h4 className="text-base sm:text-lg font-bold">Monthly Study Plan</h4>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-4">
                  {/* Year 1 - Collapsible */}
                  <Collapsible
                    title="Year 1 Study Plan"
                    defaultOpen={expandedYear1}
                    icon={<span className="text-teal-300 font-bold">Y1</span>}
                    headerClassName="bg-teal-500/10"
                  >
                    {year1.length > 0 ? (
                      <ul className="space-y-2">
                        {year1.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-400 italic py-2">
                        <p>Generating personalized study plan...</p>
                        {roadmap.milestones && roadmap.milestones.length > 0 && (
                          <p className="text-slate-500 mt-1">
                            Check the Milestones tab for detailed roadmap
                          </p>
                        )}
                      </div>
                    )}
                  </Collapsible>

                  {/* Year 2 - Collapsible */}
                  <Collapsible
                    title="Year 2 Study Plan"
                    defaultOpen={expandedYear2}
                    icon={<span className="text-teal-300 font-bold">Y2</span>}
                    headerClassName="bg-teal-500/10"
                  >
                    {year2.length > 0 ? (
                      <ul className="space-y-2">
                        {year2.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-400 italic py-2">
                        <p>Generating personalized study plan...</p>
                        {roadmap.milestones && roadmap.milestones.length > 0 && (
                          <p className="text-slate-500 mt-1">
                            Check the Milestones tab for detailed roadmap
                          </p>
                        )}
                      </div>
                    )}
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Resources Category - Mobile Optimized with Collapsible Sections */}
          {activeCategory === 'resources' && (
            <div className="space-y-4">
            {allResources.length > 0 ? (
              <div className="space-y-3">
                {Object.entries(categorizedAllResources).map(([category, resources]) => {
                  if (resources.length === 0) return null;
                  const isExpanded = expandedResources[category] || false;
                  
                  return (
                    <Collapsible
                      key={category}
                      title={`${category === 'videos' ? 'Videos' : 
                             category === 'papers' ? 'Academic Papers' :
                             category === 'projects' ? 'Projects' :
                             category === 'news' ? 'News' : 'Other'} (${resources.length})`}
                      defaultOpen={isExpanded}
                      icon={getResourceIcon(category)}
                    >
                      <div className="space-y-2">
                        {resources.map((resource: any, resIdx: number) => (
                          <a
                            key={resIdx}
                            href={resource.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-3 rounded-lg border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getResourceIcon(resource.type || category)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white group-hover:text-cyan-300 line-clamp-2">
                                  {resource.title}
                                </p>
                                {resource.description && (
                                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                    {resource.description}
                                  </p>
                                )}
                                {resource.source && (
                                  <p className="text-xs text-slate-500 mt-1">{resource.source}</p>
                                )}
                              </div>
                              <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            ) : (
              <Card className="border-slate-700/70 bg-slate-900/60">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 mb-2">Resources will be added here</p>
                  <p className="text-xs text-slate-600">Resources are being fetched from external APIs...</p>
                </CardContent>
              </Card>
            )}

            {/* Career News */}
            {roadmap.career_news && roadmap.career_news.length > 0 && (
              <Card className="border-slate-700/70 bg-slate-900/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-300" />
                      <h4 className="text-lg font-bold">Latest Career News</h4>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      {roadmap.career_news.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                  {roadmap.career_news.map((news: any, idx: number) => (
                    <a
                      key={idx}
                      href={news.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-lg border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                    >
                      <p className="text-xs font-medium text-white group-hover:text-purple-300 line-clamp-2">
                        {news.title}
                      </p>
                      {news.source && (
                        <p className="text-xs text-slate-500 mt-1">{news.source}</p>
                      )}
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          )}

          {/* Milestones Category - Mobile Optimized with Collapsible */}
          {activeCategory === 'milestones' && (
            <div className="space-y-4">
            {roadmap.milestones && roadmap.milestones.length > 0 ? (
              roadmap.milestones.map((milestone: any, idx: number) => {
                const isExpanded = expandedMilestones.has(idx);
                const toggleMilestone = () => {
                  const newSet = new Set(expandedMilestones);
                  if (isExpanded) {
                    newSet.delete(idx);
                  } else {
                    newSet.add(idx);
                  }
                  setExpandedMilestones(newSet);
                };

                return (
                  <Card key={idx} className="border-slate-700/70 bg-slate-900/60">
                    <CardHeader 
                      className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-yellow-500/20 cursor-pointer"
                      onClick={toggleMilestone}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs px-2 py-0.5">
                              {milestone.month_range || `Milestone ${idx + 1}`}
                            </Badge>
                            {milestone.exam_prep && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Exam Prep
                              </Badge>
                            )}
                          </div>
                          <h5 className="text-base sm:text-lg font-bold text-slate-200 pr-8">
                            {milestone.title || `Milestone ${idx + 1}`}
                          </h5>
                        </div>
                        <button className="ml-2">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="p-4 space-y-4">
                        {milestone.description && (
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.actions && Array.isArray(milestone.actions) && milestone.actions.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-teal-300 text-sm mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Action Items
                            </h6>
                            <ul className="space-y-2">
                              {milestone.actions.map((action: string, actionIdx: number) => (
                                <li key={actionIdx} className="flex items-start gap-2 text-sm text-slate-300">
                                  <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                                  <span className="flex-1">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {milestone.skills_to_build && Array.isArray(milestone.skills_to_build) && milestone.skills_to_build.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-yellow-300 text-sm mb-2 flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Skills to Build
                            </h6>
                            <div className="flex flex-wrap gap-2">
                              {milestone.skills_to_build.map((skill: string, skillIdx: number) => (
                                <Badge key={skillIdx} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {milestone.resources && Array.isArray(milestone.resources) && milestone.resources.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-cyan-300 text-sm mb-2 flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Resources ({milestone.resources.length})
                            </h6>
                            <div className="space-y-2">
                              {milestone.resources.slice(0, 3).map((resource: any, resIdx: number) => (
                                <a
                                  key={resIdx}
                                  href={resource.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-2 rounded border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group"
                                >
                                  <div className="flex items-start gap-2">
                                    {getResourceIcon(resource.type || 'other')}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white group-hover:text-cyan-300 line-clamp-1">
                                        {resource.title || resource.name || 'Resource'}
                                      </p>
                                      {resource.source && (
                                        <p className="text-xs text-slate-500 mt-0.5">{resource.source}</p>
                                      )}
                                    </div>
                                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                                  </div>
                                </a>
                              ))}
                              {milestone.resources.length > 3 && (
                                <p className="text-xs text-slate-500 text-center pt-1">
                                  +{milestone.resources.length - 3} more resources
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {milestone.career_connection && (
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <h6 className="font-semibold text-purple-300 text-sm mb-1">Career Connection</h6>
                            <p className="text-xs text-slate-300">{milestone.career_connection}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })
            ) : (
              <Card className="border-slate-700/70 bg-slate-900/60">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No milestones available</p>
                  <p className="text-xs text-slate-600 mt-2">Milestones will appear here once generated</p>
                </CardContent>
              </Card>
            )}
          </div>
          )}

          {/* Careers Category - Mobile Optimized */}
          {activeCategory === 'careers' && (
            <div className="space-y-4">
            {roadmap.career_exposure && roadmap.career_exposure.length > 0 ? (
              roadmap.career_exposure.map((career: string, idx: number) => (
                <Card key={idx} className="border-slate-700/70 bg-slate-900/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-pink-300" />
                      <h5 className="font-bold text-pink-300 text-base sm:text-lg">{career}</h5>
                    </div>
                    <p className="text-sm text-slate-400">Explore this career path and its requirements</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-slate-700/70 bg-slate-900/60">
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No career paths available</p>
                  <p className="text-xs text-slate-600 mt-2">Career paths will appear here once generated</p>
                </CardContent>
              </Card>
            )}
          </div>
          )}

          {/* Exams Category - Mobile Optimized */}
          {activeCategory === 'exams' && (
            <div className="space-y-4">
            {roadmap.exam_timeline && roadmap.exam_timeline.length > 0 ? (
              roadmap.exam_timeline.map((exam: string, idx: number) => (
                <Card key={idx} className="border-slate-700/70 bg-slate-900/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-300" />
                      <h5 className="font-bold text-blue-300 text-base sm:text-lg">Exam Timeline</h5>
                    </div>
                    <p className="text-sm text-slate-300">{exam}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-slate-700/70 bg-slate-900/60">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No exam timeline available</p>
                  <p className="text-xs text-slate-600 mt-2">Exam schedules will appear here once generated</p>
                </CardContent>
              </Card>
            )}
          </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

