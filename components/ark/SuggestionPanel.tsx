"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionPanelProps {
  title?: string;
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  selectedValue?: string;
  showCustomOption?: boolean;
  onCustom?: () => void;
  variant?: 'default' | 'popular' | 'recommended';
}

export function SuggestionPanel({
  title = 'Suggestions',
  suggestions,
  onSelect,
  selectedValue,
  showCustomOption = true,
  onCustom,
  variant = 'default'
}: SuggestionPanelProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {variant === 'recommended' ? (
          <Sparkles className="h-5 w-5 text-yellow-400" />
        ) : variant === 'popular' ? (
          <TrendingUp className="h-5 w-5 text-yellow-400" />
        ) : null}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Suggestions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion) => {
          const isSelected = selectedValue === suggestion;
          return (
            <Button
              key={suggestion}
              onClick={() => onSelect(suggestion)}
              variant="outline"
              className={cn(
                "w-full justify-start bg-slate-800 border-slate-600 text-left text-white hover:bg-slate-700 transition-colors",
                isSelected && "bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-yellow-500 hover:from-yellow-600 hover:to-orange-600"
              )}
            >
              {suggestion}
            </Button>
          );
        })}
      </div>

      {/* Custom option */}
      {showCustomOption && onCustom && (
        <div className="pt-2 border-t border-slate-700">
          <button
            onClick={onCustom}
            className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Or enter your own custom option →
          </button>
        </div>
      )}
    </div>
  );
}

