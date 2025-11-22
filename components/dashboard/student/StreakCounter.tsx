"use client";

import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StreakCounterProps {
  days: number;
  showLabel?: boolean;
}

export function StreakCounter({ days, showLabel = true }: StreakCounterProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 text-orange-400 cursor-help"
          >
            <Flame className="w-4 h-4 mr-1.5" />
            {days}d
            {showLabel && <span className="ml-1.5">Streak</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>You've been consistent for {days} days!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Keep it up to maintain your streak
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

