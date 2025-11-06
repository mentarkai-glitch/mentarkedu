"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SuggestionPanel } from './SuggestionPanel';
import { getAllSuggestions } from '@/lib/data/ark-suggestions';
import { getCategoryById } from '@/lib/data/student-categories';

interface GoalDiscoveryStepProps {
  categoryId: string;
  goal: string;
  onGoalChange: (goal: string) => void;
  onGoalSelect: (goal: string) => void;
}

export function GoalDiscoveryStep({
  categoryId,
  goal,
  onGoalChange,
  onGoalSelect
}: GoalDiscoveryStepProps) {
  const category = getCategoryById(categoryId);
  const suggestions = getAllSuggestions(categoryId);
  
  // Get common goals for this category
  const goalSuggestions = suggestions.commonGoals || [];

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
        {goalSuggestions.length > 0 && (
          <SuggestionPanel
            title="Popular Goals"
            suggestions={goalSuggestions}
            onSelect={onGoalSelect}
            selectedValue={goal}
            variant="popular"
          />
        )}

        {/* Or enter custom */}
        <div className="space-y-3">
          <label className="text-white text-lg font-medium">
            Or describe your own goal
          </label>
          <Textarea
            value={goal}
            onChange={(e) => onGoalChange(e.target.value)}
            placeholder="e.g., Score 95%+ in Math finals, or crack JEE Main in 2026..."
            className="w-full bg-slate-800 border-slate-600 text-white min-h-[120px] focus:border-yellow-500"
          />
        </div>
      </div>
    </div>
  );
}

