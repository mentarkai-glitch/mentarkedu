"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { EnhancedTimeframeSelector } from "@/components/ark/EnhancedTimeframeSelector";
import { EnhancedPsychologyProfile } from "@/components/ark/EnhancedPsychologyProfile";

// Import data
import { studentCategories, getCategoryById } from "@/lib/data/student-categories";
import { getTimeframesForCategory, getTimeframeById } from "@/lib/data/student-timeframes";
import type { StudentARKData, StudentProfile, InstituteARKTemplate } from "@/lib/types";

const TOTAL_STEPS = 7;

export default function StudentARKCreation() {
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

  const [difficultyStatus, setDifficultyStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [difficultyRecommendation, setDifficultyRecommendation] = useState<{
    level: string;
    score: number;
    confidence: number;
    recommendations: string[];
  } | null>(null);
  const [difficultyError, setDifficultyError] = useState<string | null>(null);
  const [creationSucceeded, setCreationSucceeded] = useState(false);
  const [createdArkId, setCreatedArkId] = useState<string | null>(null);
  const [creationModel, setCreationModel] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [studentLocation, setStudentLocation] = useState<string | null>(null);

  // Fetch onboarding profile on mount
  useEffect(() => {
    fetchOnboardingProfile();
  }, []);

  useEffect(() => {
    if (currentStep === 7 && user?.id) {
      if (difficultyStatus === "idle" || difficultyStatus === "error") {
        fetchDifficultyRecommendation(user.id);
      }
    }
  }, [currentStep, user?.id]);

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
      
      if (data.success) {
        if (data.data.user_id) {
          setUser({ id: data.data.user_id, email: data.data.email });
        }

        if (data.data.onboarding_profile) {
          const profile = data.data.onboarding_profile;
          setOnboardingProfile(profile);
          const derivedLocation = [
            profile.city,
            profile.state,
            profile.board,
            profile.country || 'India'
          ]
            .filter((part) => typeof part === 'string' && part.trim().length > 0)
            .join(', ');
          setStudentLocation(derivedLocation || null);
          
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

  const fetchDifficultyRecommendation = async (studentId: string) => {
    setDifficultyStatus("loading");
    setDifficultyError(null);

    try {
      const response = await fetch("/api/ml/predict-difficulty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Unable to fetch difficulty recommendation");
      }

      const prediction = json.data?.prediction;
      if (!prediction) {
        throw new Error("No prediction returned from serving layer");
      }

      setDifficultyRecommendation({
        level: prediction.recommended_level,
        score: prediction.difficulty_score,
        confidence: prediction.confidence,
        recommendations: prediction.recommendations || [],
      });
      setDifficultyStatus("ready");
    } catch (error: any) {
      setDifficultyStatus("error");
      setDifficultyError(error?.message || "Unable to fetch difficulty recommendation");
    }
  };

  const handleRetryDifficulty = () => {
    if (user?.id) {
      fetchDifficultyRecommendation(user.id);
    }
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
          student_location: studentLocation,
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
          const arkId: string | undefined = data.data?.ark?.id;
          if (arkId) {
            setCreatedArkId(arkId);
          }
          setCreationModel(data.data?.model ?? null);
          setGenerationProgress(100);
          setGenerationMessage("ARK generated successfully!");
          setCreationSucceeded(true);
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
      <div className="min-h-screen bg-black flex items-center justify-center overflow-x-hidden w-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (creationSucceeded) {
    const categoryDetails = getCategoryById(arkData.categoryId);
    const timeframeDetails = arkData.timeframeId ? getTimeframeById(arkData.timeframeId) : undefined;

    return (
      <div className="min-h-screen bg-black overflow-x-hidden w-full">
        <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass border border-yellow-500/30 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent"
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start lg:items-center">
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/40 px-3 py-1 rounded-full text-xs sm:text-sm text-yellow-200">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  Mentark ARK ready
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Your personalised roadmap is live!
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Explore your new ARK, or train Mentark AI with your academic journey. Share your graduation path,
                  course year, and exam prep (JEE, NEET, AIIMS or any other) so every recommendation stays rooted in
                  the Indian education system and tuned to local realities.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                {createdArkId && (
                  <Button asChild className="bg-yellow-500 text-black font-semibold shadow-lg shadow-yellow-500/20 hover:bg-yellow-400">
                    <Link href={`/ark/${createdArkId}`}>Open ARK Workspace</Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="secondary"
                  className="bg-slate-900 text-yellow-100 border border-yellow-500/40 hover:bg-slate-800"
                >
                  <Link href="/dashboard/student/train-ai">Train Mentark AI</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-slate-900"
                >
                  <Link href="/dashboard/student/arks">View All ARKs</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-yellow-300 hover:bg-slate-900"
                  onClick={() => {
                    setCreationSucceeded(false);
                    setCreatedArkId(null);
                    setCreationModel(null);
                    setGenerationProgress(0);
                    setGenerationMessage("");
                  }}
                >
                  Create another ARK
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <ARKSummary
                data={arkData}
                categoryName={categoryDetails?.title || "Selected Focus Area"}
                timeframeName={timeframeDetails ? `${timeframeDetails.name}` : arkData.timeframeDuration || "Custom timeframe"}
                difficulty={{
                  status: difficultyStatus,
                  recommendation: difficultyRecommendation,
                  error: difficultyError,
                  onRetry: difficultyStatus === "error" ? handleRetryDifficulty : undefined,
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Card className="border-yellow-500/20 bg-slate-900/60">
                <CardHeader>
                  <CardTitle className="text-white text-lg">What&apos;s next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-300">
                  <div className="space-y-2">
                    <p className="font-semibold text-yellow-300">1. Explore your ARK milestones</p>
                    <p>Review tasks, deadlines, and weekly focus zones crafted for you.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-yellow-300">2. Train Mentark AI</p>
                    <p>
                      Tell us about your graduation plan, course year, and any competitive exams so the AI mentor aligns with your journey in India.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-yellow-300">3. Launch your day</p>
                    <p>Use Daily Assistant, Doubt Solver, and Smart Search to keep momentum.</p>
                  </div>
                  {creationModel && (
                    <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
                      Generated using <span className="text-slate-300 font-semibold">{creationModel}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-green-200 text-base">Need personalised help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-green-100">
                  <p className="leading-relaxed">
                    Mentark coaches can interpret your ARK, suggest resource bundles, and guide you on scholarships or college shortlists with Indian context and pricing benchmarks relevant to your region.
                  </p>
                  <Button asChild variant="secondary" className="bg-green-500 text-black hover:bg-green-400">
                    <Link href="/chat">Chat with a Mentor</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center px-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Choose Your Focus Area
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                What do you want to work on? Pick the category that matters most to you right now.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
            onboardingProfile={onboardingProfile}
            previousAnswers={deepDiveAnswers}
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
          <EnhancedTimeframeSelector
            timeframes={timeframes}
            selectedId={arkData.timeframeId}
            onSelect={(timeframe) => updateArkData({
              timeframeId: timeframe.id,
              timeframeDuration: timeframe.duration,
              timeframeDurationWeeks: timeframe.durationWeeks
            })}
            goal={arkData.goalStatement}
            categoryId={arkData.categoryId}
            onboardingProfile={onboardingProfile}
            deepDiveAnswers={deepDiveAnswers}
          />
        );

      case 5:
        return (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center px-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Want to Use a Template?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                Your teachers may have created ready-made roadmaps for you. You can customize them!
              </p>
            </div>

            {availableTemplates.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
          <EnhancedPsychologyProfile
            motivation={arkData.motivation}
            stress={arkData.stress}
            confidence={arkData.confidence}
            onMotivationChange={(value) => updateArkData({ motivation: value })}
            onStressChange={(value) => updateArkData({ stress: value })}
            onConfidenceChange={(value) => updateArkData({ confidence: value })}
            goal={arkData.goalStatement}
            onboardingProfile={onboardingProfile}
          />
        );

      case 7:
        const categoryName = getCategoryById(arkData.categoryId)?.title || "";
        const timeframeName = getTimeframeById(arkData.timeframeId)?.name || "";
        
        return (
          <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto px-2">
            <div className="text-center">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                Ready to Generate Your ARK?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-300">
                We&apos;ll create a personalized learning roadmap just for you!
              </p>
            </div>

            <ARKSummary
              data={arkData}
              categoryName={categoryName}
              timeframeName={timeframeName}
              difficulty={{
                status: difficultyStatus,
                recommendation: difficultyRecommendation,
                error: difficultyError,
                onRetry: handleRetryDifficulty,
              }}
            />

            <div className="text-center space-y-6">
              <Button
                onClick={handleGenerateARK}
                disabled={isGenerating}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg"
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
    <div className="min-h-screen bg-black overflow-x-hidden w-full">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 w-full max-w-full">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/student" className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="Mentark" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
              <span className="text-lg sm:text-xl font-bold text-white">Create ARK</span>
            </Link>
            <div className="text-sm sm:text-base text-gray-300">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12 w-full max-w-full">
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
          <div className="flex justify-between items-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 max-w-4xl mx-auto gap-3 sm:gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 sm:flex-initial text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceedToNextStep()}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black flex-1 sm:flex-initial text-sm sm:text-base"
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
        studentLocation={studentLocation}
      />
    </div>
  );
}
