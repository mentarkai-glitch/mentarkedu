'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Brain, 
  Target, 
  Heart,
  BookOpen,
  Zap,
  CheckCircle,
  School,
  Home,
  MapPin,
  Clock,
  Lightbulb,
  TrendingUp,
  Award,
  Users,
  Smile,
  Frown,
  Meh,
  Battery,
  Coffee
} from 'lucide-react';
import { 
  OnboardingQuestion, 
  OnboardingAnswer, 
  StudentProfile, 
  StudentLevel
} from '@/lib/types';
import { getQuestionsByLevel, getStudentLevel } from '@/lib/data/onboarding-questions';
import { studentCategories, type StudentCategory } from '@/lib/data/student-categories';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'category' | 'grade' | 'questions' | 'complete'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState<StudentCategory | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [grade, setGrade] = useState<string>('');
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('junior');
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const gradeOptions = [
    { value: 'Class 6', level: 'junior' as StudentLevel, emoji: '📘' },
    { value: 'Class 7', level: 'junior' as StudentLevel, emoji: '📗' },
    { value: 'Class 8', level: 'junior' as StudentLevel, emoji: '📙' },
    { value: 'Class 9', level: 'middle' as StudentLevel, emoji: '📕' },
    { value: 'Class 10', level: 'middle' as StudentLevel, emoji: '📔' },
    { value: 'Class 11', level: 'senior' as StudentLevel, emoji: '📓' },
    { value: 'Class 12', level: 'senior' as StudentLevel, emoji: '📚' },
  ];

  const handleCategorySelect = (category: StudentCategory) => {
    setSelectedCategory(category);
    setCurrentPhase('grade');
  };

  const handleGradeSelect = (selectedGrade: string) => {
    setGrade(selectedGrade);
    const level = getStudentLevel(selectedGrade);
    setStudentLevel(level);
    setQuestions(getQuestionsByLevel(level));
    setCurrentPhase('questions');
  };

  const handleAnswer = (questionId: string, answer: string | number | string[]) => {
    const existingAnswerIndex = answers.findIndex(a => a.question_id === questionId);
    const newAnswer: OnboardingAnswer = { question_id: questionId, answer };

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = newAnswer;
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, newAnswer]);
    }
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.question_id === questionId)?.answer;
  };

  const getProgress = () => {
    if (currentPhase !== 'questions') return 0;
    return ((currentStep + 1) / questions.length) * 100;
  };

  const canProceed = () => {
    if (currentPhase !== 'questions') return true;
    
    const currentQuestion = questions[currentStep];
    if (!currentQuestion) return true;
    
    const answer = getCurrentAnswer(currentQuestion.id);
    return currentQuestion.required ? answer !== undefined : true;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const profile = createStudentProfile(grade, studentLevel, answers, selectedCategory);
      
      const response = await fetch('/api/onboarding/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      if (response.ok) {
        setCurrentPhase('complete');
      } else {
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = (question: OnboardingQuestion) => {
    const currentAnswer = getCurrentAnswer(question.id);

    switch (question.type) {
      case 'single_choice':
        return (
          <RadioGroup
            value={currentAnswer as string || ''}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-3 rounded-xl border-2 border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-cyan-500 hover:bg-slate-800 has-[:checked]:border-cyan-500 has-[:checked]:bg-slate-800"
              >
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label 
                  htmlFor={`${question.id}-${index}`}
                  className="flex-1 cursor-pointer text-base text-slate-200"
                >
                  {option}
                </Label>
              </motion.div>
            ))}
          </RadioGroup>
        );

      case 'multiple_choice':
        const selectedAnswers = (currentAnswer as string[]) || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-3 rounded-xl border-2 border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-cyan-500 hover:bg-slate-800 has-[:checked]:border-cyan-500 has-[:checked]:bg-slate-800"
              >
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={selectedAnswers.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswer(question.id, [...selectedAnswers, option]);
                    } else {
                      handleAnswer(question.id, selectedAnswers.filter(a => a !== option));
                    }
                  }}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`}
                  className="flex-1 cursor-pointer text-base text-slate-200"
                >
                  {option}
                </Label>
              </motion.div>
            ))}
          </div>
        );

      case 'slider':
        const sliderValue = (currentAnswer as number) || question.min || 1;
        return (
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-800/50 p-6">
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => handleAnswer(question.id, value[0])}
                min={question.min || 1}
                max={question.max || 10}
                step={1}
                className="w-full"
              />
              <div className="mt-4 flex justify-between text-sm text-slate-400">
                <span>{question.min || 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-cyan-400">{sliderValue}</span>
                  <span className="text-slate-400">/ {question.max || 10}</span>
                </div>
                <span>{question.max || 10}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // PHASE 1: Welcome Screen
  if (currentPhase === 'welcome') {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
            
            <CardHeader className="text-center pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              
              <CardTitle className="text-4xl font-bold text-white mb-4">
                Welcome to Mentark! 👋
              </CardTitle>
              
              <CardDescription className="text-lg text-slate-300 max-w-2xl mx-auto">
                We&apos;re excited to get to know you! This quick profile will help us create the perfect learning journey tailored just for you.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: Target, title: 'Personalized', desc: 'Get AI mentoring designed for you' },
                  { icon: Zap, title: 'Quick Setup', desc: 'Just 5-10 minutes to complete' },
                  { icon: Award, title: 'Better Results', desc: 'Achieve your goals faster' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex flex-col items-center text-center p-4"
                  >
                    <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                      <item.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={() => setCurrentPhase('category')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 h-14 text-lg font-semibold"
                  size="lg"
                >
                  Let&apos;s Get Started! 🚀
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // PHASE 2: Category Selection
  if (currentPhase === 'category') {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-6xl"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white mb-2">
                What brings you here today?
              </CardTitle>
              <CardDescription className="text-lg text-slate-300">
                Choose the area you want to focus on most. You can explore others later!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => handleCategorySelect(category)}
                    className="cursor-pointer"
                  >
                    <Card className={`h-full border-2 transition-all hover:shadow-xl hover:shadow-${category.color}-500/20 ${
                      selectedCategory?.id === category.id
                        ? `border-${category.color}-500 bg-${category.color}-500/10`
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}>
                      <CardContent className="p-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                          {category.emoji}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">
                          {category.title}
                        </h3>
                        
                        <p className="text-slate-400 text-sm mb-4">
                          {category.description}
                        </p>
                        
                        <div className="space-y-2">
                          {category.examples.map((example, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                              <CheckCircle className="w-3 h-3" />
                              <span>{example}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // PHASE 3: Grade Selection
  if (currentPhase === 'grade') {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {selectedCategory && (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCategory.gradient} flex items-center justify-center text-2xl`}>
                    {selectedCategory.emoji}
                  </div>
                )}
                <Badge className={selectedCategory ? `bg-gradient-to-r ${selectedCategory.gradient} text-white border-0` : ''}>
                  {selectedCategory?.title}
                </Badge>
              </div>
              
              <CardTitle className="text-3xl text-white mb-2">
                Which class are you in?
              </CardTitle>
              <CardDescription className="text-lg text-slate-300">
                This helps us ask age-appropriate questions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {gradeOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={grade === option.value ? "default" : "outline"}
                      className={`w-full h-24 flex flex-col gap-2 ${
                        grade === option.value
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
                          : "bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50"
                      }`}
                      onClick={() => handleGradeSelect(option.value)}
                    >
                      <span className="text-3xl">{option.emoji}</span>
                      <span className="font-semibold">{option.value}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPhase('category')}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // PHASE 4: Questions
  if (currentPhase === 'questions') {
    const currentQuestion = questions[currentStep];
    
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                    {grade}
                  </Badge>
                  {selectedCategory && (
                    <Badge className={`bg-gradient-to-r ${selectedCategory.gradient} text-white border-0`}>
                      {selectedCategory.emoji} {selectedCategory.title}
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  Question {currentStep + 1} of {questions.length}
                </span>
              </div>
              
              <Progress value={getProgress()} className="mb-6" />
              
              <CardTitle className="text-2xl text-white mb-3">
                {currentQuestion?.question}
              </CardTitle>
              
              {currentQuestion?.required && (
                <Badge variant="outline" className="border-red-500/50 text-red-400 w-fit">
                  Required
                </Badge>
              )}
            </CardHeader>
            
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="min-h-[300px]"
                >
                  {currentQuestion && renderQuestion(currentQuestion)}
                </motion.div>
              </AnimatePresence>
              
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700/50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : currentStep === questions.length - 1 ? (
                    <>
                      Complete
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // PHASE 5: Completion
  if (currentPhase === 'complete') {
    return (
      <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl text-center"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
            
            <CardHeader className="pt-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl text-white mb-3">
                You&apos;re All Set! 🎉
              </CardTitle>
              
              <CardDescription className="text-lg text-slate-300 max-w-lg mx-auto">
                Your profile is complete! Now Mentark AI knows you better and can provide truly personalized guidance.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-12">
              <div className="space-y-3 mb-8">
                <Button
                  onClick={() => window.location.href = '/ark/create'}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 h-14 text-lg font-semibold"
                  size="lg"
                >
                  🚀 Create Your First ARK
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/chat'}
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50 h-12"
                >
                  💬 Chat with AI Mentor
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="w-full text-slate-400 hover:text-slate-200"
                >
                  ← Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}

// Helper function to create student profile from answers
function createStudentProfile(
  grade: string, 
  level: StudentLevel, 
  answers: OnboardingAnswer[],
  category: StudentCategory | null
): StudentProfile {
  const answerMap = new Map(answers.map(a => [a.question_id, a.answer]));
  
  return {
    level,
    grade,
    school_type: answerMap.get('junior_school_type') as string || answerMap.get('middle_school_type') as string || 'Unknown',
    location: answerMap.get('junior_location') as string || 'Unknown',
    board: answerMap.get('middle_board') as string,
    stream: answerMap.get('senior_stream') as string,
    coaching: answerMap.get('middle_coaching') === 'Yes, regularly' || answerMap.get('middle_coaching') === 'Yes, sometimes',
    career_clarity: answerMap.get('junior_career_dream') as string || answerMap.get('middle_career_clarity') as string || answerMap.get('senior_career_clarity') as string || 'Unknown',
    motivation_level: answerMap.get('middle_motivation') as number || answerMap.get('senior_motivation') as number || 5,
    stress_level: answerMap.get('middle_stress') as number || answerMap.get('senior_stress') as number || 5,
    confidence_level: answerMap.get('middle_confidence') as number || answerMap.get('senior_confidence') as number || 5,
    study_hours: answerMap.get('middle_study_hours') as string || answerMap.get('senior_study_hours') as string || 'Unknown',
    learning_style: answerMap.get('junior_learning_style') as string || answerMap.get('senior_learning_style') as string || 'Unknown',
    support_system: answerMap.get('junior_support_person') as string || answerMap.get('middle_support_person') as string || answerMap.get('senior_support_system') as string || 'Unknown',
    financial_comfort: answerMap.get('senior_financial_comfort') as string || 'Unknown',
    digital_access: answerMap.get('middle_internet_access') as string || answerMap.get('senior_digital_access') as string || 'Unknown',
    exam_prep: answerMap.get('senior_exam_type') as string,
    biggest_challenges: [
      ...(answerMap.get('middle_stress_sources') as string[] || []),
      ...(answerMap.get('senior_stress_sources') as string[] || []),
      ...(answerMap.get('senior_biggest_challenge') ? [answerMap.get('senior_biggest_challenge') as string] : [])
    ],
    interests: [
      category?.title || '',
      answerMap.get('junior_favorite_subject') as string || '',
      answerMap.get('junior_free_time') as string || '',
      answerMap.get('junior_exciting_activities') as string || '',
      ...(answerMap.get('middle_favorite_subjects') as string[] || []),
      answerMap.get('senior_field_interest') as string || ''
    ].filter(Boolean),
    goals: [
      answerMap.get('junior_improvement_goal') as string || '',
      answerMap.get('middle_stream_preference') as string || '',
      answerMap.get('senior_career_priority') as string || ''
    ].filter(Boolean),
    answers,
    completed_at: new Date().toISOString()
  };
}