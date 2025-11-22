"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EnergyIndicatorProps {
  level: number; // 0-100
  showLabel?: boolean;
}

export function EnergyIndicator({ level, showLabel = true }: EnergyIndicatorProps) {
  const [currentLevel, setCurrentLevel] = useState(0);

  useEffect(() => {
    // Animate to actual level
    const timer = setTimeout(() => {
      setCurrentLevel(level);
    }, 100);
    return () => clearTimeout(timer);
  }, [level]);

  const getBatteryIcon = () => {
    if (level < 25) return BatteryLow;
    if (level < 75) return BatteryMedium;
    return BatteryFull;
  };

  const getColor = () => {
    if (level < 25) return "text-red-400";
    if (level < 50) return "text-orange-400";
    if (level < 75) return "text-yellow-400";
    return "text-green-400";
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            <div className="relative">
              <BatteryIcon className={`w-5 h-5 ${getColor()}`} />
              <motion.div
                className="absolute inset-0 bg-current opacity-20 rounded"
                style={{
                  clipPath: `inset(0 ${100 - currentLevel}% 0 0)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${currentLevel}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {showLabel && (
              <span className="text-sm font-medium text-foreground">
                {level}%
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Energy Level: {level}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on your recent check-ins
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

