"use client";

import { useState, useEffect } from "react";
import { PsychologySlider } from "./PsychologySlider";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedPsychologyProfileProps {
  motivation: number;
  stress: number;
  confidence: number;
  onMotivationChange: (value: number) => void;
  onStressChange: (value: number) => void;
  onConfidenceChange: (value: number) => void;
  goal: string;
  onboardingProfile?: any;
}

export function EnhancedPsychologyProfile({
  motivation,
  stress,
  confidence,
  onMotivationChange,
  onStressChange,
  onConfidenceChange,
  goal,
  onboardingProfile,
}: EnhancedPsychologyProfileProps) {
  const [aiRecommendations, setAiRecommendations] = useState<{
    motivation?: number;
    stress?: number;
    confidence?: number;
    reason?: string;
  } | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  const fetchAIPsychologyRecommendation = async () => {
    if (!goal || goal.trim().length === 0) return;

    setLoadingRecommendation(true);
    try {
      const contextParts: string[] = [];
      contextParts.push(`Goal: "${goal}"`);

      if (onboardingProfile) {
        if (onboardingProfile.motivation_level) {
          contextParts.push(`Historical Motivation: ${onboardingProfile.motivation_level}/10`);
        }
        if (onboardingProfile.stress_level) {
          contextParts.push(`Historical Stress: ${onboardingProfile.stress_level}/10`);
        }
        if (onboardingProfile.confidence_level) {
          contextParts.push(`Historical Confidence: ${onboardingProfile.confidence_level}/10`);
        }
        if (onboardingProfile.study_hours) {
          contextParts.push(`Study Hours: ${onboardingProfile.study_hours} hours/week`);
        }
      }

      // Call API route instead of using aiOrchestrator directly
      const response = await fetch("/api/ark-suggestions/psychology", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          motivation,
          stress,
          confidence,
          onboardingProfile,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI recommendation");
      }

      const data = await response.json();
      
      if (data.success && data.data?.recommendation) {
        const recommendation = data.data.recommendation;
        setAiRecommendations({
          motivation: Math.max(1, Math.min(10, recommendation.motivation || motivation)),
          stress: Math.max(1, Math.min(10, recommendation.stress || stress)),
          confidence: Math.max(1, Math.min(10, recommendation.confidence || confidence)),
          reason: recommendation.reason || "Based on your goal and profile",
        });
      }
    } catch (error) {
      console.error("Error fetching AI psychology recommendation:", error);
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const applyARecommendations = () => {
    if (aiRecommendations) {
      if (aiRecommendations.motivation !== undefined) {
        onMotivationChange(aiRecommendations.motivation);
      }
      if (aiRecommendations.stress !== undefined) {
        onStressChange(aiRecommendations.stress);
      }
      if (aiRecommendations.confidence !== undefined) {
        onConfidenceChange(aiRecommendations.confidence);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto px-2">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
          How Are You Feeling?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300">
          This helps us adjust the roadmap intensity to match your current state.
        </p>
      </div>

      {/* AI Recommendation Button */}
      {goal && (
        <div className="flex justify-center">
          <Button
            onClick={fetchAIPsychologyRecommendation}
            disabled={loadingRecommendation}
            variant="outline"
            className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
          >
            {loadingRecommendation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting AI Recommendations...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Get AI-Powered Profile Recommendations
              </>
            )}
          </Button>
        </div>
      )}

      {/* AI Recommendations Banner */}
      {aiRecommendations && !loadingRecommendation && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI Recommendations</span>
          </div>
          <p className="text-purple-200 text-sm">{aiRecommendations.reason}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {aiRecommendations.motivation !== undefined && (
              <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
                Motivation: {aiRecommendations.motivation}/10
              </span>
            )}
            {aiRecommendations.stress !== undefined && (
              <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
                Stress: {aiRecommendations.stress}/10
              </span>
            )}
            {aiRecommendations.confidence !== undefined && (
              <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
                Confidence: {aiRecommendations.confidence}/10
              </span>
            )}
          </div>
          <Button
            onClick={applyARecommendations}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Apply AI Recommendations
          </Button>
        </div>
      )}

      <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20 rounded-lg p-4 sm:p-6">
        <div className="space-y-6 sm:space-y-8">
          <PsychologySlider
            label="Motivation Level"
            description="How motivated are you to achieve this goal right now?"
            value={motivation}
            onChange={onMotivationChange}
            lowLabel="Not motivated"
            highLabel="Super motivated"
          />

          <PsychologySlider
            label="Stress Level"
            description="How stressed or busy are you currently?"
            value={stress}
            onChange={onStressChange}
            lowLabel="Calm & relaxed"
            highLabel="Very stressed"
          />

          <PsychologySlider
            label="Confidence Level"
            description="How confident are you in your ability to achieve this?"
            value={confidence}
            onChange={onConfidenceChange}
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
}


