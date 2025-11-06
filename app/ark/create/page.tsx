"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

// Import ARK components
import { CategoryCard } from "@/components/ark/CategoryCard";
import { TimeframeSelector } from "@/components/ark/TimeframeSelector";
import { TemplatePreview } from "@/components/ark/TemplatePreview";
import { PsychologySlider } from "@/components/ark/PsychologySlider";
import { ARKSummary } from "@/components/ark/ARKSummary";
import { GoalDiscoveryStep } from "@/components/ark/GoalDiscoveryStep";
import { DeepDiveQuestionsStep } from "@/components/ark/DeepDiveQuestionsStep";
import { AskMentarkChat } from "@/components/ark/AskMentarkChat";

// Import data
import { studentCategories, getCategoryById } from "@/lib/data/student-categories";
import { getTimeframesForCategory, getTimeframeById, type TimeframeOption } from "@/lib/data/student-timeframes";
import type { StudentARKData, StudentProfile, InstituteARKTemplate } from "@/lib/types";

const TOTAL_STEPS = 7;

export default function StudentARKCreation() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState("");
  const [error, setError] = useState<string>("");
  
  const [onboardingProfile, setOnboardingProfile] = useState<StudentProfile | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<InstituteARKTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InstituteARKTemplate | null>(null);
  const [deepDiveAnswers, setDeepDiveAnswers] = useState<Record<string, any>>({});
  
  const [arkData, setArkData] = useState<StudentARKData>({
    categoryId: "",
    goalStatement: "",
    timeframeId: "",
    timeframeDuration: "",
    timeframeDurationWeeks: 0,
    currentLevel: "",
    weeklyHours: 10,
    learningStyle: "",
    specificFocus: "",
    useInstituteTemplate: false,
    instituteTemplateId: undefined,
    motivation: 7,
    stress: 5,
    confidence: 6,
    hoursPerWeek: 10,
    reminders: true,
    accountabilityStyle: "self",
    onboardingProfile: undefined
  });

  // Fetch onboarding profile on mount
  useEffect(() => {
    fetchOnboardingProfile();
  }, []);

  // Fetch templates when category is selected
  useEffect(() => {
    if (arkData.categoryId && currentStep === 5) {
      fetchTemplates();
    }
  }, [arkData.categoryId, currentStep]);

  const fetchOnboardingProfile = async () => {
    try {
      const response = await fetch('/api/students/profile');
      const data = await response.json();
      
      if (data.success && data.data.onboarding_profile) {
        const profile = data.data.onboarding_profile;
        setOnboardingProfile(profile);
        
        // Pre-fill arkData with profile values
        setArkData(prev => ({
          ...prev,
          currentLevel: profile.career_clarity === "Very clear" ? "advanced" :
                       profile.career_clarity === "Somewhat clear" ? "intermediate" : "beginner",
          weeklyHours: parseInt(profile.study_hours) || 10,
          learningStyle: profile.learning_style || "",
          motivation: profile.motivation_level || 7,
          stress: profile.stress_level || 5,
          confidence: profile.confidence_level || 6,
          hoursPerWeek: parseInt(profile.study_hours) || 10,
          onboardingProfile: profile
        }));
      }
    } catch (error) {
      console.error('Failed to fetch onboarding profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/ark-templates?category=${arkData.categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableTemplates(data.data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const updateArkData = (updates: Partial<StudentARKData>) => {
    setArkData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1: return arkData.categoryId !== "";
      case 2: return arkData.goalStatement.trim() !== "";
      case 3: return Object.keys(deepDiveAnswers).length > 0 || true; // Allow skipping deep dive
      case 4: return arkData.timeframeId !== "";
      case 5: return true; // Template is optional
      case 6: return true; // Psychology has defaults
      case 7: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerateARK = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setError('');
    setGenerationMessage('');
    
    // Simulate progress animation
    const progressSteps = [
      { progress: 10, message: "Analyzing your goal..." },
      { progress: 25, message: "Finding best resources..." },
      { progress: 40, message: "Creating personalized milestones..." },
      { progress: 60, message: "Optimizing for your learning style..." },
      { progress: 80, message: "Finalizing your roadmap..." },
      { progress: 95, message: "Almost ready..." }
    ];

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < progressSteps.length) {
        const step = progressSteps[stepIndex];
        setGenerationProgress(step.progress);
        setGenerationMessage(step.message);
        stepIndex++;
      }
    }, 1500);

    try {
      const response = await fetch('/api/ai/generate-ark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: arkData.categoryId,
          goal: arkData.goalStatement,
          duration: arkData.timeframeId,
          interests: onboardingProfile?.interests || [],
          student_name: "Student",
          student_id: onboardingProfile?.completed_at,
          student_profile: arkData.onboardingProfile,
          timeframe: {
            id: arkData.timeframeId,
            duration: arkData.timeframeDuration,
            durationWeeks: arkData.timeframeDurationWeeks
          },
          psychologyProfile: {
            motivation: arkData.motivation,
            stress: arkData.stress,
            confidence: arkData.confidence
          },
          specificFocus: arkData.specificFocus,
          useTemplate: arkData.useInstituteTemplate,
          templateId: arkData.instituteTemplateId,
          deepDiveAnswers: deepDiveAnswers // NEW: Include deep dive data
        })
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGenerationProgress(100);
          setGenerationMessage("ARK generated successfully!");
          setTimeout(() => {
            router.push(`/dashboard/student/arks`);
          }, 1500);
        } else {
          setGenerationProgress(0);
          setGenerationMessage(data.message || "Error generating ARK. Please try again.");
          setError(data.message || "Failed to generate ARK");
        }
      } else {
        // Handle non-OK responses
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        setGenerationProgress(0);
        setGenerationMessage(errorData.message || `Error: ${response.status} ${response.statusText}`);
        setError(errorData.message || `Failed to generate ARK: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error generating ARK:', error);
      clearInterval(progressInterval);
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationMessage(error?.message || "Error generating ARK. Please try again.");
      setError(error?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Choose Your Focus Area
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                What do you want to work on? Pick the category that matters most to you right now.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={arkData.categoryId === category.id}
                  onClick={() => updateArkData({ categoryId: category.id })}
                />
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <GoalDiscoveryStep
            categoryId={arkData.categoryId}
            goal={arkData.goalStatement}
            onGoalChange={(goal) => updateArkData({ goalStatement: goal })}
            onGoalSelect={(goal) => updateArkData({ goalStatement: goal })}
          />
        );

      case 3:
        return (
          <DeepDiveQuestionsStep
            categoryId={arkData.categoryId}
            answers={deepDiveAnswers}
            onAnswerChange={(questionId, value) => {
              setDeepDiveAnswers(prev => ({ ...prev, [questionId]: value }));
            }}
            onComplete={() => handleNext()}
          />
        );

      case 4:
        const timeframes = getTimeframesForCategory(arkData.categoryId);
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                When Do You Want to Achieve This?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Choose a timeframe that feels realistic for your goal and schedule.
              </p>
            </div>

            <TimeframeSelector
              timeframes={timeframes}
              selectedId={arkData.timeframeId}
              onSelect={(timeframe) => updateArkData({
                timeframeId: timeframe.id,
                timeframeDuration: timeframe.duration,
                timeframeDurationWeeks: timeframe.durationWeeks
              })}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Want to Use a Template?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Your teachers may have created ready-made roadmaps for you. You can customize them!
              </p>
            </div>

            {availableTemplates.length > 0 ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {availableTemplates.map((template) => (
                    <TemplatePreview
                      key={template.id}
                      template={template}
                      isSelected={arkData.instituteTemplateId === template.id}
                      onSelect={() => {
                        updateArkData({
                          useInstituteTemplate: true,
                          instituteTemplateId: template.id
                        });
                        setSelectedTemplate(template);
                      }}
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => updateArkData({
                      useInstituteTemplate: false,
                      instituteTemplateId: undefined
                    })}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Skip - I&apos;ll Create My Own
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                  <Sparkles className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-semibold mb-2">
                    No Templates Available
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Your teachers haven&apos;t created any templates for this category yet. Don&apos;t worry, we&apos;ll create a custom roadmap for you!
                  </p>
                  <Button
                    onClick={() => updateArkData({ useInstituteTemplate: false })}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                  >
                    Continue with Custom ARK
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                How Are You Feeling?
              </h2>
              <p className="text-xl text-gray-300">
                This helps us adjust the roadmap intensity to match your current state.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20 rounded-lg p-6">
              <div className="space-y-8">
                <PsychologySlider
                  label="Motivation Level"
                  description="How motivated are you to achieve this goal right now?"
                  value={arkData.motivation}
                  onChange={(value) => updateArkData({ motivation: value })}
                  lowLabel="Not motivated"
                  highLabel="Super motivated"
                />

                <PsychologySlider
                  label="Stress Level"
                  description="How stressed or busy are you currently?"
                  value={arkData.stress}
                  onChange={(value) => updateArkData({ stress: value })}
                  lowLabel="Calm & relaxed"
                  highLabel="Very stressed"
                />

                <PsychologySlider
                  label="Confidence Level"
                  description="How confident are you in your ability to achieve this?"
                  value={arkData.confidence}
                  onChange={(value) => updateArkData({ confidence: value })}
                  lowLabel="Not confident"
                  highLabel="Very confident"
                />
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-blue-200 text-sm">
                  <strong className="text-blue-300">How this helps:</strong> Higher stress means lighter workload. Higher motivation means more ambitious tasks. We&apos;ll personalize everything to your current state!
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        const categoryName = getCategoryById(arkData.categoryId)?.title || "";
        const timeframeName = getTimeframeById(arkData.timeframeId)?.name || "";
        
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Generate Your ARK?
              </h2>
              <p className="text-xl text-gray-300">
                We&apos;ll create a personalized learning roadmap just for you!
              </p>
            </div>

            <ARKSummary
              data={arkData}
              categoryName={categoryName}
              timeframeName={timeframeName}
            />

            <div className="text-center space-y-6">
              <Button
                onClick={handleGenerateARK}
                disabled={isGenerating}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-12 py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate My ARK
                  </>
                )}
              </Button>

              {(isGenerating || error) && (
                <div className={`rounded-xl border-2 p-6 ${
                  error 
                    ? 'bg-red-900/20 border-red-500/50' 
                    : 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30'
                }`}>
                  <div className="space-y-4">
                    {error ? (
                      <>
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <span className="text-red-300 font-bold text-lg">
                            Error Generating ARK
                          </span>
                        </div>
                        <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-4">
                          <p className="text-red-200 font-semibold">{error}</p>
                        </div>
                        <Button
                          onClick={() => {
                            setError('');
                            setIsGenerating(false);
                            setGenerationProgress(0);
                            setGenerationMessage('');
                          }}
                          variant="outline"
                          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          Try Again
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                          <span className="text-yellow-300 font-bold text-lg">
                            Creating Your Personalized Roadmap...
                          </span>
                        </div>
                        
                        <Progress value={generationProgress} className="h-3" />
                        
                        <div className="text-center">
                          <p className="text-yellow-200 font-semibold text-base">{generationMessage}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {generationProgress}% Complete
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/student" className="flex items-center gap-3">
              <img src="/logo.png" alt="Mentark" className="h-8 w-8 rounded-lg" />
              <span className="text-xl font-bold text-white">Create ARK</span>
            </Link>
            <div className="text-gray-300">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < TOTAL_STEPS && !isGenerating && (
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700 max-w-4xl mx-auto">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>

      {/* Ask Mentark Chat - Available on all steps */}
      <AskMentarkChat
        categoryId={arkData.categoryId}
        currentStep={currentStep}
        userAnswers={{ ...arkData, ...deepDiveAnswers }}
      />
    </div>
  );
}
