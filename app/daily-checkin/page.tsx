'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  CheckCircle,
  Battery,
  TrendingUp,
  Heart,
  Calendar,
  Clock,
  Sparkles,
  Target,
  Zap,
  Smile,
  Frown,
  Meh,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';

interface CheckInData {
  energy: number;
  progress: number;
  emotion: number;
  notes?: string;
  date: string;
}

interface EmotionData {
  value: number;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

const emotions: EmotionData[] = [
  { value: 1, label: 'Very Low', emoji: '😢', color: 'red', description: 'Feeling really down' },
  { value: 2, label: 'Low', emoji: '😔', color: 'orange', description: 'Not great today' },
  { value: 3, label: 'Okay', emoji: '😐', color: 'yellow', description: 'Just okay' },
  { value: 4, label: 'Good', emoji: '🙂', color: 'lime', description: 'Feeling good' },
  { value: 5, label: 'Great', emoji: '😊', color: 'green', description: 'Feeling great!' },
  { value: 6, label: 'Amazing', emoji: '😄', color: 'emerald', description: 'Absolutely amazing!' },
  { value: 7, label: 'Fantastic', emoji: '🤩', color: 'cyan', description: 'On top of the world!' }
];

const energyLevels = [
  { value: 1, label: 'Exhausted', emoji: '😴', icon: Moon, color: 'slate' },
  { value: 2, label: 'Tired', emoji: '😪', icon: Coffee, color: 'gray' },
  { value: 3, label: 'Okay', emoji: '😐', icon: Meh, color: 'yellow' },
  { value: 4, label: 'Good', emoji: '🙂', icon: Sun, color: 'lime' },
  { value: 5, label: 'Energized', emoji: '⚡', icon: Zap, color: 'cyan' },
  { value: 6, label: 'Supercharged', emoji: '🚀', icon: Target, color: 'purple' },
  { value: 7, label: 'Unstoppable', emoji: '💥', icon: Sparkles, color: 'pink' }
];

const progressLevels = [
  { value: 1, label: 'No Progress', emoji: '😔', description: 'Nothing accomplished' },
  { value: 2, label: 'Little Progress', emoji: '😐', description: 'Small steps taken' },
  { value: 3, label: 'Some Progress', emoji: '🙂', description: 'Moving forward' },
  { value: 4, label: 'Good Progress', emoji: '😊', description: 'Getting things done' },
  { value: 5, label: 'Great Progress', emoji: '🎉', description: 'Crushing it today!' },
  { value: 6, label: 'Amazing Progress', emoji: '🚀', description: 'On fire today!' },
  { value: 7, label: 'Perfect Day', emoji: '👑', description: 'Absolutely perfect!' }
];

export default function DailyCheckInPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    energy: 5,
    progress: 5,
    emotion: 5,
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    { id: 'energy', title: 'Energy Level', icon: Battery },
    { id: 'progress', title: 'Progress Today', icon: TrendingUp },
    { id: 'emotion', title: 'How You Feel', icon: Heart },
    { id: 'complete', title: 'All Done!', icon: CheckCircle }
  ];

  const getProgress = () => {
    return ((currentStep + 1) / (steps.length - 1)) * 100;
  };

  const handleSliderChange = (field: keyof CheckInData, value: number) => {
    setCheckInData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 2) {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, save to database
      console.log('Check-in data:', checkInData);
      
      setIsCompleted(true);
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentEmotion = () => {
    return emotions.find(e => e.value === checkInData.emotion) || emotions[4];
  };

  const getCurrentEnergy = () => {
    return energyLevels.find(e => e.value === checkInData.energy) || energyLevels[4];
  };

  const getCurrentProgress = () => {
    return progressLevels.find(p => p.value === checkInData.progress) || progressLevels[4];
  };

  // Welcome Screen
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500"></div>
            
            <CardHeader className="text-center pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Calendar className="w-10 h-10 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl text-white mb-3">
                Daily Check-in 🌟
              </CardTitle>
              
              <CardDescription className="text-lg text-slate-300 max-w-xl mx-auto">
                Take 2 minutes to reflect on your day. This helps Mentark AI understand you better and provide more personalized guidance.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: Battery, title: 'Energy', desc: 'How energetic do you feel?' },
                  { icon: TrendingUp, title: 'Progress', desc: 'How much did you accomplish?' },
                  { icon: Heart, title: 'Emotion', desc: 'How are you feeling overall?' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex flex-col items-center text-center p-4 rounded-lg bg-slate-700/30"
                  >
                    <div className="w-12 h-12 bg-slate-600/50 rounded-full flex items-center justify-center mb-3">
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
                className="flex gap-4"
              >
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50 h-12"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Maybe Later
                  </Button>
                </Link>
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 h-12 text-lg font-semibold"
                >
                  Let&apos;s Start!
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl text-center"
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500"></div>
            
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
                Check-in Complete! 🎉
              </CardTitle>
              
              <CardDescription className="text-lg text-slate-300">
                Great job taking time to reflect! Your AI mentor now has better insights to help you.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-12">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-lg bg-slate-700/30">
                  <div className="text-2xl mb-2">{getCurrentEnergy().emoji}</div>
                  <p className="text-sm text-slate-400">Energy</p>
                  <p className="text-white font-semibold">{getCurrentEnergy().label}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-700/30">
                  <div className="text-2xl mb-2">{getCurrentProgress().emoji}</div>
                  <p className="text-sm text-slate-400">Progress</p>
                  <p className="text-white font-semibold">{getCurrentProgress().label}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-700/30">
                  <div className="text-2xl mb-2">{getCurrentEmotion().emoji}</div>
                  <p className="text-sm text-slate-400">Mood</p>
                  <p className="text-white font-semibold">{getCurrentEmotion().label}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.href = '/chat'}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 h-12 text-lg font-semibold"
                >
                  💬 Chat with AI Mentor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700/50 h-12"
                >
                  📊 View Dashboard
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

  const currentStepData = steps[currentStep];
  const CurrentIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-black via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <CurrentIcon className="w-5 h-5 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-cyan-500 text-white border-0">
                  {currentStepData.title}
                </Badge>
              </div>
              <span className="text-sm text-slate-400 font-medium">
                {currentStep} of {steps.length - 2}
              </span>
            </div>
            
            <Progress value={getProgress()} className="mb-4" />
            
            <CardTitle className="text-2xl text-white mb-2">
              {currentStep === 1 && "How energetic do you feel right now?"}
              {currentStep === 2 && "How much progress did you make today?"}
              {currentStep === 3 && "How are you feeling overall?"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-8">
              {/* Energy Step */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="rounded-xl bg-slate-700/30 p-6">
                    <Slider
                      value={[checkInData.energy]}
                      onValueChange={(value) => handleSliderChange('energy', value[0])}
                      min={1}
                      max={7}
                      step={1}
                      className="w-full"
                    />
                    <div className="mt-6 flex justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{getCurrentEnergy().emoji}</div>
                        <div className="text-xl font-bold text-white mb-1">{getCurrentEnergy().label}</div>
                        <div className="text-sm text-slate-400">{getCurrentEnergy().description || ''}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Step */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="rounded-xl bg-slate-700/30 p-6">
                    <Slider
                      value={[checkInData.progress]}
                      onValueChange={(value) => handleSliderChange('progress', value[0])}
                      min={1}
                      max={7}
                      step={1}
                      className="w-full"
                    />
                    <div className="mt-6 flex justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{getCurrentProgress().emoji}</div>
                        <div className="text-xl font-bold text-white mb-1">{getCurrentProgress().label}</div>
                        <div className="text-sm text-slate-400">{getCurrentProgress().description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Emotion Step */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="rounded-xl bg-slate-700/30 p-6">
                    <Slider
                      value={[checkInData.emotion]}
                      onValueChange={(value) => handleSliderChange('emotion', value[0])}
                      min={1}
                      max={7}
                      step={1}
                      className="w-full"
                    />
                    <div className="mt-6 flex justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{getCurrentEmotion().emoji}</div>
                        <div className="text-xl font-bold text-white mb-1">{getCurrentEmotion().label}</div>
                        <div className="text-sm text-slate-400">{getCurrentEmotion().description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="border-slate-600 text-slate-200 hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : currentStep === steps.length - 2 ? (
                  <>
                    Complete
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <TrendingUp className="w-4 h-4 ml-2" />
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
