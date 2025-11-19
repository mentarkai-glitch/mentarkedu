'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ProgressIndicator } from './ProgressIndicator';
import { trackEvent } from '@/lib/services/analytics';
import { DEMO_QUESTIONS, TOTAL_QUESTIONS, type DemoQuestion } from '@/lib/data/demo-questions';
import type { QuizAnswer } from '@/lib/services/demo-scoring';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: QuizAnswer[]) => void;
}

const STORAGE_KEY = 'mentark-demo-quiz-progress';
const STORAGE_TTL = 30 * 60 * 1000; // 30 minutes

export function QuizModal({ isOpen, onClose, onComplete }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [sliderValue, setSliderValue] = useState([5]);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { answers: storedAnswers, timestamp, currentIndex } = JSON.parse(stored);
        const age = Date.now() - timestamp;
        
        if (age < STORAGE_TTL && storedAnswers.length > 0) {
          setAnswers(storedAnswers);
          setCurrentQuestionIndex(currentIndex || 0);
          setStartTime(timestamp);
        }
      }
    } catch (error) {
      console.warn('Failed to load quiz progress', error);
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || answers.length === 0) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers,
        currentIndex: currentQuestionIndex,
        timestamp: startTime || Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save quiz progress', error);
    }
  }, [answers, currentQuestionIndex, startTime]);

  // Initialize start time
  useEffect(() => {
    if (isOpen && !startTime) {
      setStartTime(Date.now());
    }
  }, [isOpen, startTime]);

  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;
  const canProceed = answers.some(a => a.questionId === currentQuestion.id) || 
                     (currentQuestion.type === 'slider' && sliderValue[0] !== undefined);

  const handleAnswer = (answer: string | number) => {
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer
    };
    
    const updatedAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id), newAnswer];
    setAnswers(updatedAnswers);
    
    // Track question answered
    trackEvent('demo_question_answered', {
      question_id: currentQuestion.id,
      question_text: currentQuestion.text,
      answer: typeof answer === 'string' ? answer : `slider_${answer}`
    });
    
    if (isLastQuestion) {
      // Complete quiz
      setTimeout(() => {
        onComplete(updatedAnswers);
        localStorage.removeItem(STORAGE_KEY);
      }, 300);
    } else {
      // Move to next question
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        if (currentQuestion.type === 'slider') {
          setSliderValue([5]); // Reset slider
        }
      }, 300);
    }
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    handleAnswer(value[0]);
  };

  const calculateEstimatedTime = () => {
    if (!startTime) return undefined;
    const elapsed = Date.now() - startTime;
    const avgTimePerQuestion = elapsed / (currentQuestionIndex + 1);
    const remainingQuestions = TOTAL_QUESTIONS - currentQuestionIndex - 1;
    const estimatedSeconds = Math.ceil((avgTimePerQuestion * remainingQuestions) / 1000);
    
    if (estimatedSeconds < 60) {
      return `~${estimatedSeconds}s left`;
    }
    return `~${Math.ceil(estimatedSeconds / 60)} minute${Math.ceil(estimatedSeconds / 60) > 1 ? 's' : ''} left`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="relative pb-4">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close quiz"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
            <CardTitle className="text-2xl font-bold text-[#0A2850] pr-12">
              Quick Assessment
            </CardTitle>
            <ProgressIndicator
              current={currentQuestionIndex + 1}
              total={TOTAL_QUESTIONS}
              estimatedTimeLeft={calculateEstimatedTime()}
            />
          </CardHeader>
          
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-[#333333] mb-6">
                  {currentQuestion.text}
                </h3>

                {currentQuestion.type === 'single-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = answers.find(a => 
                        a.questionId === currentQuestion.id && a.answer === option
                      );
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-[#0AB3A3] bg-[#0AB3A3]/10 text-[#0A2850] font-medium'
                              : 'border-slate-200 hover:border-[#0AB3A3]/50 text-[#333333]'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'slider' && (
                  <div className="space-y-4">
                    <div className="px-2">
                      <Slider
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 px-2">
                      <span>Not at all</span>
                      <span className="font-medium text-[#0A2850]">
                        {sliderValue[0]} / 10
                      </span>
                      <span>Very comfortable</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
