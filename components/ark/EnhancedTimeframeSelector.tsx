"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";
import type { TimeframeOption } from "@/lib/data/student-timeframes";

interface EnhancedTimeframeSelectorProps {
  timeframes: TimeframeOption[];
  selectedId: string;
  onSelect: (timeframe: TimeframeOption) => void;
  goal: string;
  categoryId: string;
  onboardingProfile?: any;
  deepDiveAnswers?: Record<string, any>;
}

export function EnhancedTimeframeSelector({
  timeframes,
  selectedId,
  onSelect,
  goal,
  categoryId,
  onboardingProfile,
  deepDiveAnswers,
}: EnhancedTimeframeSelectorProps) {
  const [recommendedTimeframeId, setRecommendedTimeframeId] = useState<string | null>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [recommendationReason, setRecommendationReason] = useState<string | null>(null);

  useEffect(() => {
    if (!goal || goal.trim().length === 0 || timeframes.length === 0) {
      return;
    }

    const fetchAITimeframeRecommendation = async () => {
      setLoadingRecommendation(true);
      try {
        // Build context for AI
        const contextParts: string[] = [];
        contextParts.push(`Goal: "${goal}"`);
        contextParts.push(`Category: ${categoryId}`);

        if (onboardingProfile) {
          if (onboardingProfile.academic_stage) {
            contextParts.push(`Academic Stage: ${onboardingProfile.academic_stage}`);
          }
          if (onboardingProfile.study_hours) {
            contextParts.push(`Available Study Hours: ${onboardingProfile.study_hours} hours/week`);
          }
        }

        if (deepDiveAnswers && Object.keys(deepDiveAnswers).length > 0) {
          const answers = Object.entries(deepDiveAnswers)
            .slice(0, 3)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          contextParts.push(`Additional Context: ${answers}`);
        }

        const timeframesList = timeframes
          .map((t, i) => `${i + 1}. ${t.name} (${t.duration}, ~${t.durationWeeks} weeks)`)
          .join("\n");

        // Call API route instead of using aiOrchestrator directly
        const response = await fetch("/api/ark-suggestions/timeframe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goal,
            categoryId,
            timeframes,
            onboardingProfile,
            deepDiveAnswers,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI recommendation");
        }

        const data = await response.json();

        if (data.success && data.data) {
          const result = data.data;
          const recommendedId = result.recommended_timeframe_id;

          // Find matching timeframe
          const matchingTimeframe = timeframes.find(
            (t) => t.id.toLowerCase() === recommendedId?.toLowerCase()
          );

          if (matchingTimeframe) {
            setRecommendedTimeframeId(matchingTimeframe.id);
            setRecommendationReason(result.reason || "Based on your goal and availability");
          }
        }
      } catch (error) {
        console.error("Error fetching AI timeframe recommendation:", error);
        // Continue without recommendation
      } finally {
        setLoadingRecommendation(false);
      }
    };

    // Debounce the AI recommendation
    const timer = setTimeout(() => {
      fetchAITimeframeRecommendation();
    }, 800);

    return () => clearTimeout(timer);
  }, [goal, categoryId, timeframes, onboardingProfile, deepDiveAnswers]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
          When Do You Want to Achieve This?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
          Choose a timeframe that feels realistic for your goal and schedule.
        </p>
      </div>

      {/* AI Recommendation Banner */}
      {loadingRecommendation && goal && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
          <span className="text-yellow-300 text-sm">
            Analyzing your goal to recommend the best timeframe...
          </span>
        </div>
      )}

      {recommendedTimeframeId && !loadingRecommendation && goal && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>AI Recommendation</span>
          </div>
          <p className="text-cyan-200 text-sm">{recommendationReason}</p>
          {recommendedTimeframeId !== selectedId && (
            <button
              onClick={() => {
                const recommended = timeframes.find((t) => t.id === recommendedTimeframeId);
                if (recommended) {
                  onSelect(recommended);
                }
              }}
              className="text-xs px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full text-cyan-200 transition-colors"
            >
              Use Recommended: {timeframes.find((t) => t.id === recommendedTimeframeId)?.name}
            </button>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeframes.map((timeframe) => (
          <Card
            key={timeframe.id}
            onClick={() => onSelect(timeframe)}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 relative ${
              selectedId === timeframe.id
                ? `border-2 bg-gradient-to-br ${timeframe.gradient} bg-opacity-20 border-yellow-400 neon-glow`
                : 'glass border-yellow-500/20 hover:border-yellow-500/50'
            } ${
              recommendedTimeframeId === timeframe.id && selectedId !== timeframe.id
                ? 'ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-black'
                : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="text-center mb-3">
                {timeframe.emoji && (
                  <div className="text-4xl mb-2">{timeframe.emoji}</div>
                )}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">
                    {timeframe.name}
                  </h3>
                  {recommendedTimeframeId === timeframe.id && (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Recommended
                    </Badge>
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className={`${
                    selectedId === timeframe.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}
                >
                  {timeframe.duration}
                </Badge>
              </div>
              <p className="text-gray-300 text-sm text-center">
                {timeframe.description}
              </p>
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-400">
                  ~{timeframe.durationWeeks} weeks
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


