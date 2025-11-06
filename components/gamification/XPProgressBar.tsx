"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Star } from "lucide-react";

interface XPProgressBarProps {
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  className?: string;
}

export function XPProgressBar({ totalXp, level, xpToNextLevel, className }: XPProgressBarProps) {
  const [animatedXp, setAnimatedXp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    // Animate XP counter
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = totalXp / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedXp(Math.min(increment * currentStep, totalXp));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [totalXp]);

  // Calculate XP needed for current level
  const currentLevelXp = Math.pow(level - 1, 2) * 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const currentLevelProgress = totalXp - currentLevelXp;
  const currentLevelTotal = nextLevelXp - currentLevelXp;
  const progressPercentage = (currentLevelProgress / currentLevelTotal) * 100;

  return (
    <Card className={`bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Experience Points</h3>
              <p className="text-sm text-gray-400">Level {level} • {Math.floor(animatedXp).toLocaleString()} XP</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Trophy className="h-3 w-3 mr-1" />
              Level {level}
            </Badge>
            <p className="text-xs text-gray-400 mt-1">
              {xpToNextLevel.toLocaleString()} XP to next level
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Progress to Level {level + 1}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-gray-800"
            />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>{currentLevelXp.toLocaleString()} XP</span>
            <span>{nextLevelXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Level up celebration */}
        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center">
              <Star className="h-12 w-12 text-yellow-400 mx-auto mb-2 animate-pulse" />
              <p className="text-lg font-bold text-white">Level Up!</p>
              <p className="text-sm text-gray-300">You&apos;ve reached Level {level}!</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
