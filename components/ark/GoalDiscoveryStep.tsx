"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SuggestionPanel } from './SuggestionPanel';
import { getAllSuggestions } from '@/lib/data/ark-suggestions';
import { getCategoryById } from '@/lib/data/student-categories';
import { getSmartSuggestions } from '@/lib/services/ark-suggestion-service';
import { Loader2, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface GoalDiscoveryStepProps {
  categoryId: string;
  goal: string;
  onGoalChange: (goal: string) => void;
  onGoalSelect: (goal: string) => void;
  onboardingProfile?: any;
  previousAnswers?: Record<string, any>;
}

export function GoalDiscoveryStep({
  categoryId,
  goal,
  onGoalChange,
  onGoalSelect,
  onboardingProfile,
  previousAnswers,
}: GoalDiscoveryStepProps) {
  const category = getCategoryById(categoryId);
  const [loading, setLoading] = useState(false);
  const [loadingRealtime, setLoadingRealtime] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [goalSuggestions, setGoalSuggestions] = useState<string[]>([]);
  const [realtimeSuggestions, setRealtimeSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Get user ID
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    // Load smart suggestions when category or goal changes
    const loadSmartSuggestions = async () => {
      setLoading(true);
      try {
        // Use API endpoint for server-side AI suggestions
        const params = new URLSearchParams({
          category_id: categoryId,
          suggestion_type: 'commonGoals',
          limit: '12',
        });

        if (goal) {
          params.append('user_input', goal);
        }

        try {
          const response = await fetch(`/api/ark-suggestions?${params.toString()}`);
          const data = await response.json();

          if (data.success && data.data?.suggestions) {
            setGoalSuggestions(data.data.suggestions);
          } else {
            // Fallback to static suggestions
            const suggestions = getAllSuggestions(categoryId);
            setGoalSuggestions(suggestions.commonGoals || []);
          }
        } catch (apiError) {
          // Fallback: Use client-side smart suggestions
          const suggestions = getAllSuggestions(categoryId);
          const staticGoals = suggestions.commonGoals || [];
          
          if (userId && (onboardingProfile || previousAnswers || goal)) {
            try {
              const smartSuggestions = await getSmartSuggestions(
                categoryId,
                'commonGoals',
                {
                  userInput: goal || undefined,
                  previousAnswers,
                  onboardingProfile,
                  userId,
                  limit: 12,
                }
              );
              setGoalSuggestions(smartSuggestions.length > 0 ? smartSuggestions : staticGoals);
            } catch (smartError) {
              setGoalSuggestions(staticGoals);
            }
          } else {
            setGoalSuggestions(staticGoals);
          }
        }
      } catch (error) {
        console.error('Error loading smart suggestions:', error);
        // Final fallback to static suggestions
        const suggestions = getAllSuggestions(categoryId);
        setGoalSuggestions(suggestions.commonGoals || []);
      } finally {
        setLoading(false);
      }
    };

    loadSmartSuggestions();
  }, [categoryId, userId, onboardingProfile, previousAnswers]);

  // Real-time suggestions as user types (debounced)
  useEffect(() => {
    if (!goal || goal.trim().length < 3) {
      setRealtimeSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoadingRealtime(true);
      try {
        const params = new URLSearchParams({
          category_id: categoryId,
          suggestion_type: 'commonGoals',
          user_input: goal,
          limit: '5',
        });

        const response = await fetch(`/api/ark-suggestions?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data?.suggestions) {
          // Filter out exact match and show top 5
          const filtered = data.data.suggestions
            .filter((s: string) => s.toLowerCase() !== goal.toLowerCase())
            .slice(0, 5);
          setRealtimeSuggestions(filtered);
        }
      } catch (error) {
        console.error('Error loading real-time suggestions:', error);
      } finally {
        setLoadingRealtime(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [goal, categoryId]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-4">{category?.emoji}</div>
        <h2 className="text-3xl font-bold text-white mb-4">
          What&apos;s Your Goal?
        </h2>
        <p className="text-xl text-gray-300">
          Be specific! A clear goal makes for a better roadmap.
        </p>
      </div>

      <div className="space-y-6">
        {/* Suggestion panels */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-yellow-400 animate-spin mr-2" />
            <span className="text-slate-400">Finding personalized suggestions...</span>
          </div>
        ) : goalSuggestions.length > 0 && (
          <SuggestionPanel
            title={userId && (onboardingProfile || previousAnswers || goal) ? "AI-Recommended Goals" : "Popular Goals"}
            suggestions={goalSuggestions}
            onSelect={onGoalSelect}
            selectedValue={goal}
            variant={userId && (onboardingProfile || previousAnswers || goal) ? "recommended" : "popular"}
          />
        )}

        {/* Or enter custom */}
        <div className="space-y-3">
          <label className="text-white text-lg font-medium">
            Or describe your own goal
          </label>
          <div className="relative">
            <Textarea
              value={goal}
              onChange={(e) => onGoalChange(e.target.value)}
              placeholder="e.g., Score 95%+ in Math finals, or crack JEE Main in 2026..."
              className="w-full bg-slate-800 border-slate-600 text-white min-h-[120px] focus:border-yellow-500"
            />
            {loadingRealtime && goal.length >= 3 && (
              <div className="absolute top-2 right-2">
                <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Real-time AI suggestions as user types */}
          {realtimeSuggestions.length > 0 && goal.length >= 3 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-yellow-400 font-semibold">
                <Sparkles className="h-3 w-3" />
                <span>AI Suggestions based on your input:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {realtimeSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onGoalSelect(suggestion)}
                    className="text-xs px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-full text-yellow-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

