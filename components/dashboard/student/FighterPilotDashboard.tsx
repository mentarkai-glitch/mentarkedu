"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TheOneThingWidget } from "./TheOneThingWidget";
import { EnergyIndicator } from "./EnergyIndicator";
import { StreakCounter } from "./StreakCounter";
import { ConceptHeatmapMini } from "./ConceptHeatmapMini";
import { DailyCheckInWidget } from "./DailyCheckInWidget";
import { DailyNudgeCard } from "./DailyNudgeCard";
import { BacklogAlert } from "./BacklogAlert";
import { QuickActions } from "./QuickActions";
import { PanicButton } from "./PanicButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  TrendingUp, 
  Target,
  AlertTriangle,
  Zap
} from "lucide-react";

interface FighterPilotDashboardProps {
  studentId?: string;
}

export function FighterPilotDashboard({ studentId }: FighterPilotDashboardProps) {
  const [examType, setExamType] = useState<string>("JEE Main");
  const [daysToExam, setDaysToExam] = useState<number>(47);
  const [rankEstimate, setRankEstimate] = useState<number>(15000);
  const [streak, setStreak] = useState<number>(7);
  const [energyLevel, setEnergyLevel] = useState<number>(75);
  const [hasBacklog, setHasBacklog] = useState<boolean>(true);
  const [backlogCount, setBacklogCount] = useState<number>(12);

  // Fetch real data from API
  useEffect(() => {
    // TODO: Fetch from API
    // const fetchDashboardData = async () => {
    //   const response = await fetch(`/api/student/dashboard/${studentId}`);
    //   const data = await response.json();
    //   // Update state
    // };
    // fetchDashboardData();
  }, [studentId]);

  return (
    <div className="space-y-6">
      {/* Top Bar - Fighter Pilot HUD */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Exam:</span>
            <Badge variant="outline" className="text-sm font-semibold">
              {examType}
            </Badge>
          </div>
          <EnergyIndicator level={energyLevel} />
          <StreakCounter days={streak} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{daysToExam} days to exam</span>
        </div>
      </div>

      {/* THE ONE THING - Most Prominent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TheOneThingWidget />
      </motion.div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Days to Exam</p>
                  <p className="text-3xl font-bold text-foreground">{daysToExam}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rank Estimate</p>
                  <p className="text-3xl font-bold text-foreground">~{rankEstimate.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-foreground">{streak} days</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-yellow-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Concept Heatmap Mini */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <ConceptHeatmapMini />
      </motion.div>

      {/* Backlog Alert (Conditional) */}
      {hasBacklog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <BacklogAlert count={backlogCount} />
        </motion.div>
      )}

      {/* Daily Nudge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <DailyNudgeCard />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <QuickActions />
      </motion.div>

      {/* Panic Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <PanicButton />
      </motion.div>
    </div>
  );
}

