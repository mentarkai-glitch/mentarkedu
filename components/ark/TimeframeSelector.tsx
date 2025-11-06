"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TimeframeOption } from "@/lib/data/student-timeframes";

interface TimeframeSelectorProps {
  timeframes: TimeframeOption[];
  selectedId: string;
  onSelect: (timeframe: TimeframeOption) => void;
}

export function TimeframeSelector({ timeframes, selectedId, onSelect }: TimeframeSelectorProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {timeframes.map((timeframe) => (
        <Card
          key={timeframe.id}
          onClick={() => onSelect(timeframe)}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            selectedId === timeframe.id
              ? `border-2 bg-gradient-to-br ${timeframe.gradient} bg-opacity-20 border-yellow-400 neon-glow`
              : 'glass border-yellow-500/20 hover:border-yellow-500/50'
          }`}
        >
          <CardContent className="p-6">
            <div className="text-center mb-3">
              {timeframe.emoji && (
                <div className="text-4xl mb-2">{timeframe.emoji}</div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">
                {timeframe.name}
              </h3>
              <Badge 
                variant="secondary" 
                className={`bg-${selectedId === timeframe.id ? 'cyan' : 'gray'}-500/20 text-${selectedId === timeframe.id ? 'cyan' : 'gray'}-300`}
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
  );
}

