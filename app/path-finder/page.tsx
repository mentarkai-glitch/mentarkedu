'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Briefcase
} from 'lucide-react';
import { pathFinderQuestions, type Language } from '@/lib/data/path-finder-questions';
import { calculateResult, type QuizAnswer, type QuizResult } from '@/lib/utils/path-finder-scoring';
import { trackEvent, initPostHog, trackPageView } from '@/lib/services/analytics';
import { toast } from 'sonner';
import Link from 'next/link';
import { generatePDFReport } from '@/lib/utils/report-generator';

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

export default function PathFinderPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [pageState, setPageState] = useState<PageState>('welcome');
  const [studentName, setStudentName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const t = translations[language];

  useEffect(() => {
    initPostHog();
    trackPageView('path-finder');
    trackEvent('demo_page_view', {
      language,
      utm_source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') : null,
      utm_medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') : null
    });

    // Check for saved progress
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < STORAGE_EXPIRY) {
          setAnswers(data.answers);
          setCurrentQuestion(data.currentQuestion);
          setStudentName(data.studentName || '');
          if (data.result) {
            setResult(data.result);
            setPageState('results');
          } else if (data.answers.length > 0) {
            setPageState('quiz');
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
      studentName,
      result,
      timestamp: Date.now()
    }));
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
    
    if (selectedOptions.includes(option)) {
      // Remove if already selected
      const newSelection = selectedOptions.filter(o => o !== option);
      handleAnswer(questionId, newSelection.length > 0 ? newSelection : []);
    } else {
      // Add if not selected (max 3)
      if (selectedOptions.length < 3) {
        handleAnswer(questionId, [...selectedOptions, option]);
      } else {
        toast.info('You can select maximum 3 subjects');
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < pathFinderQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
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

      const response = await fetch('/api/path-finder/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream: result.stream,
          strengths: result.strengths,
          studyTolerance: result.studyTolerance,
          budgetConstraint: result.budgetConstraint,
          studentName: studentName || undefined,
          language
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

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.question_id === questionId)?.answer;
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
            className="container mx-auto px-4 pt-20 pb-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
                {t.welcome.title}
              </h1>
              <p className="text-xl sm:text-2xl text-slate-300 mb-8">
                {t.welcome.tagline}
              </p>
              <Button
                size="lg"
                onClick={handleStart}
                className="bg-gradient-cyan-blue text-black font-semibold h-[52px] px-8 text-lg"
              >
                {t.welcome.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
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

        {pageState === 'quiz' && (
          <motion.section
            key="quiz"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="container mx-auto px-4 pt-8 pb-12 max-w-2xl"
          >
            <div className="mb-6">
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
                <CardTitle className="text-xl">
                  {pathFinderQuestions[currentQuestion].question[language]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pathFinderQuestions[currentQuestion].type === 'single_choice' && (
                  <div className="space-y-3">
                    {pathFinderQuestions[currentQuestion].options?.[language].map((option, idx) => {
                      const questionId = pathFinderQuestions[currentQuestion].id;
                      const isSelected = getCurrentAnswer(questionId) === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(questionId, option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {option}
                        </button>
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
                    <p className="text-sm text-slate-400 mb-2">Select up to 3 subjects</p>
                    {pathFinderQuestions[currentQuestion].options?.[language].map((option, idx) => {
                      const questionId = pathFinderQuestions[currentQuestion].id;
                      const currentAnswer = getCurrentAnswer(questionId);
                      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
                      const isSelected = selectedOptions.includes(option);
                      const isDisabled = !isSelected && selectedOptions.length >= 3;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => handleMultiSelect(questionId, option)}
                          disabled={isDisabled}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : isDisabled
                              ? 'border-slate-800 bg-slate-800/50 opacity-50 cursor-not-allowed'
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-yellow-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {Array.isArray(getCurrentAnswer(pathFinderQuestions[currentQuestion].id)) && (
                      <p className="text-xs text-slate-500 mt-2">
                        Selected: {(getCurrentAnswer(pathFinderQuestions[currentQuestion].id) as string[]).length} / 3
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.quiz.previous}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-gradient-cyan-blue text-black"
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
            className="container mx-auto px-4 pt-8 pb-12"
          >
            <div className="text-center mb-8">
              {studentName && (
                <h2 className="text-3xl font-bold mb-2">
                  {language === 'hi' ? `नमस्ते ${studentName}!` : language === 'mr' ? `नमस्कार ${studentName}!` : `Hi ${studentName}!`} Let's find your path!
                </h2>
              )}
              <p className="text-slate-300">Your personalized results are ready</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {/* Strengths Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-slate-700/70 bg-slate-900/40 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-300" />
                      {t.results.strengths}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.strengths.map((strength, idx) => (
                        <Badge key={idx} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-slate-400 mt-4">{t.results.strengthsSubtext}</p>
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
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-teal-300" />
                      {t.results.stream}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold mb-2">{result.stream}</h3>
                    <Badge
                      className={`mb-4 ${
                        result.confidence === 'High'
                          ? 'bg-green-500/20 text-green-300 border-green-500/30'
                          : result.confidence === 'Medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      }`}
                    >
                      Confidence: {result.confidence}
                    </Badge>
                    <p className="text-sm text-slate-400">
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
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-pink-300" />
                      {t.results.paths}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.paths.map((path, idx) => (
                        <div key={idx} className="border-l-2 border-yellow-500 pl-3">
                          <h4 className="font-semibold">{path.name}</h4>
                          <p className="text-sm text-slate-400">{path.why}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
            </div>

            {/* Roadmap Teaser */}
            {showRoadmap && roadmap ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8"
              >
                <Card className="border-slate-700/70 bg-slate-900/40">
                  <CardHeader>
                    <CardTitle>{t.roadmap.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DetailedRoadmap roadmap={roadmap} language={language} />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-slate-700/70 bg-slate-900/40 mb-8">
                <CardHeader>
                  <CardTitle>{t.roadmap.title}</CardTitle>
                  <CardDescription>Click below to generate your personalized 2-year roadmap</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              {!showRoadmap ? (
                <Button
                  size="lg"
                  onClick={handleBuildRoadmap}
                  disabled={isLoadingRoadmap}
                  className="flex-1 bg-gradient-cyan-blue text-black font-semibold h-[52px]"
                >
                  {isLoadingRoadmap ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t.roadmap.loading}
                    </>
                  ) : (
                    <>
                      {t.results.buildRoadmap}
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
                        language
                      });
                      trackEvent('demo_download_report', { stream: result.stream });
                      toast.success('Report downloaded successfully!');
                    }
                  }}
                  className="flex-1 bg-gradient-cyan-blue text-black font-semibold h-[52px]"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Report (PDF)
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                className="flex-1 h-[52px]"
              >
                <Share2 className="mr-2 h-5 w-5" />
                {t.results.shareTeacher}
              </Button>
            </div>

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

function DetailedRoadmap({ roadmap, language }: { roadmap: any; language: Language }) {
  const [activeCategory, setActiveCategory] = useState<string>('overview');
  
  if (!roadmap) return null;

  // Collect all resources from milestones
  const allResources: any[] = [];
  if (roadmap.milestones) {
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

  // Parse monthly plan into Year 1 and Year 2
  const parseYearlyPlan = () => {
    if (!roadmap.monthly_plan) return { year1: [], year2: [] };
    
    if (typeof roadmap.monthly_plan === 'object' && !Array.isArray(roadmap.monthly_plan)) {
      const year1: string[] = [];
      const year2: string[] = [];
      
      Object.entries(roadmap.monthly_plan).forEach(([period, items]: [string, any]) => {
        if (Array.isArray(items)) {
          if (period.includes('year_1') || period.includes('months_0_3') || period.includes('months_4_6') || period.includes('months_7_9') || period.includes('months_10_12')) {
            year1.push(...items);
          } else if (period.includes('year_2') || period.includes('months_13_15') || period.includes('months_16_18') || period.includes('months_19_21') || period.includes('months_22_24')) {
            year2.push(...items);
          }
        }
      });
      
      return { year1, year2 };
    }
    
    // If it's an array, split in half
    if (Array.isArray(roadmap.monthly_plan)) {
      const mid = Math.ceil(roadmap.monthly_plan.length / 2);
      return {
        year1: roadmap.monthly_plan.slice(0, mid),
        year2: roadmap.monthly_plan.slice(mid)
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
    <div className="space-y-6">
      {/* Header Section */}
      {roadmap.title && (
        <div className="border-b border-slate-700 pb-4 mb-4">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            {roadmap.title}
          </h3>
          {roadmap.description && (
            <p className="text-slate-300 text-sm leading-relaxed">{roadmap.description}</p>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Content */}
      <div className="min-h-[400px]">
        {/* Overview */}
        {activeCategory === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
          {/* Monthly Study Plan - Year 1 & Year 2 */}
          <Card className="border-slate-700/70 bg-slate-900/60 h-full">
            <CardHeader className="bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-b border-teal-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-300" />
                <h4 className="text-lg font-bold">Monthly Study Plan</h4>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Year 1 */}
                <div className="space-y-2">
                  <h5 className="font-bold text-teal-300 text-sm mb-2">YEAR 1</h5>
                  {year1.length > 0 ? (
                    <ul className="space-y-1.5">
                      {year1.slice(0, 6).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3 w-3 text-teal-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Plan details coming soon...</p>
                  )}
                </div>

                {/* Year 2 */}
                <div className="space-y-2">
                  <h5 className="font-bold text-teal-300 text-sm mb-2">YEAR 2</h5>
                  {year2.length > 0 ? (
                    <ul className="space-y-1.5">
                      {year2.slice(0, 6).map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3 w-3 text-teal-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Plan details coming soon...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Paths to Explore */}
          {roadmap.career_exposure && roadmap.career_exposure.length > 0 && (
            <Card className="border-slate-700/70 bg-slate-900/60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-pink-300" />
                  <h4 className="text-lg font-bold">Career Paths to Explore</h4>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {roadmap.career_exposure.map((career: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg border border-pink-500/30 bg-pink-500/5">
                    <p className="text-sm font-medium text-pink-300">{career}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Exam Timeline */}
          {roadmap.exam_timeline && roadmap.exam_timeline.length > 0 && (
            <Card className="border-slate-700/70 bg-slate-900/60">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-300" />
                  <h4 className="text-lg font-bold">Exam Timeline & Important Dates</h4>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {roadmap.exam_timeline.map((exam: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg border border-blue-500/30 bg-blue-500/5">
                    <p className="text-xs font-medium text-blue-300">{exam}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

              {/* Right Column - Overview */}
              <div className="space-y-6">
                {/* Resources Summary */}
                {roadmap.resource_summary && (
                  <Card className="border-slate-700/70 bg-slate-900/60">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-cyan-400" />
                        <h4 className="text-lg font-bold">Resources Summary</h4>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
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
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Career Paths Preview */}
                {roadmap.career_exposure && roadmap.career_exposure.length > 0 && (
                  <Card className="border-slate-700/70 bg-slate-900/60">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-pink-300" />
                        <h4 className="text-lg font-bold">Career Paths</h4>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {roadmap.career_exposure.slice(0, 3).map((career: string, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg border border-pink-500/30 bg-pink-500/5">
                          <p className="text-sm font-medium text-pink-300">{career}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Study Plan Category */}
        {activeCategory === 'study-plan' && (
          <div className="space-y-6">
            <Card className="border-slate-700/70 bg-slate-900/60">
              <CardHeader className="bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-b border-teal-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-300" />
                  <h4 className="text-lg font-bold">Monthly Study Plan</h4>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Year 1 */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-teal-300 text-sm mb-2">YEAR 1</h5>
                    {year1.length > 0 ? (
                      <ul className="space-y-1.5">
                        {year1.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Plan details coming soon...</p>
                    )}
                  </div>

                  {/* Year 2 */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-teal-300 text-sm mb-2">YEAR 2</h5>
                    {year2.length > 0 ? (
                      <ul className="space-y-1.5">
                        {year2.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="h-3 w-3 text-teal-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Plan details coming soon...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Category */}
        {activeCategory === 'resources' && (
          <div className="space-y-6">
            <Card className="border-slate-700/70 bg-slate-900/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  <h4 className="text-lg font-bold">Recommended Resources</h4>
                </div>
                {allResources.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {allResources.length} total
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {allResources.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {Object.entries(categorizedAllResources).map(([category, resources]) => {
                    if (resources.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(category)}
                          <h6 className="font-semibold text-slate-300 text-xs">
                            {category === 'videos' ? 'Videos' : 
                             category === 'papers' ? 'Papers' :
                             category === 'projects' ? 'Projects' :
                             category === 'news' ? 'News' : 'Other'}
                          </h6>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {resources.length}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          {resources.slice(0, 3).map((resource: any, resIdx: number) => (
                            <a
                              key={resIdx}
                              href={resource.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block p-2 rounded border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {getResourceIcon(resource.type || category)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-white group-hover:text-cyan-300 line-clamp-1">
                                    {resource.title}
                                  </p>
                                  {resource.source && (
                                    <p className="text-xs text-slate-500 mt-0.5">{resource.source}</p>
                                  )}
                                </div>
                                <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0 mt-0.5" />
                              </div>
                            </a>
                          ))}
                          {resources.length > 3 && (
                            <p className="text-xs text-slate-500 text-center pt-1">
                              +{resources.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Resources will be added here</p>
                </div>
              )}
            </CardContent>
          </Card>

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

        {/* Milestones Category */}
        {activeCategory === 'milestones' && (
          <div className="space-y-6">
            {roadmap.milestones && roadmap.milestones.length > 0 ? (
              roadmap.milestones.map((milestone: any, idx: number) => (
                <Card key={idx} className="border-slate-700/70 bg-slate-900/60">
                  <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-yellow-500/20">
                    <div className="flex items-center gap-2 mb-2">
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
                    <h5 className="text-lg font-bold text-slate-200">{milestone.title}</h5>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {milestone.description && (
                      <p className="text-sm text-slate-300 leading-relaxed">{milestone.description}</p>
                    )}
                    {milestone.actions && milestone.actions.length > 0 && (
                      <div>
                        <h6 className="font-semibold text-teal-300 text-sm mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Action Items
                        </h6>
                        <ul className="space-y-2">
                          {milestone.actions.map((action: string, actionIdx: number) => (
                            <li key={actionIdx} className="flex items-start gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {milestone.skills_to_build && milestone.skills_to_build.length > 0 && (
                      <div>
                        <h6 className="font-semibold text-yellow-300 text-sm mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Skills to Build
                        </h6>
                        <div className="flex flex-wrap gap-2">
                          {milestone.skills_to_build.map((skill: string, skillIdx: number) => (
                            <Badge key={skillIdx} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-slate-700/70 bg-slate-900/60">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500">No milestones available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Careers Category */}
        {activeCategory === 'careers' && (
          <div className="space-y-6">
            {roadmap.career_exposure && roadmap.career_exposure.length > 0 ? (
              roadmap.career_exposure.map((career: string, idx: number) => (
                <Card key={idx} className="border-slate-700/70 bg-slate-900/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-pink-300" />
                      <h5 className="font-bold text-pink-300">{career}</h5>
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
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Exams Category */}
        {activeCategory === 'exams' && (
          <div className="space-y-6">
            {roadmap.exam_timeline && roadmap.exam_timeline.length > 0 ? (
              roadmap.exam_timeline.map((exam: string, idx: number) => (
                <Card key={idx} className="border-slate-700/70 bg-slate-900/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-300" />
                      <h5 className="font-bold text-blue-300">Exam Timeline</h5>
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
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

