"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Clock, 
  TrendingUp, 
  Play,
  BookOpen,
  X,
  Lightbulb
} from "lucide-react";
import Link from "next/link";

interface TheOneThingData {
  conceptId: string;
  conceptName: string;
  subject: string;
  timeEstimate: number; // minutes
  attempts: number;
  accuracy: number; // percentage
  examWeightage: number; // percentage
  whyItMatters: string;
  actionType: "practice" | "watch" | "review";
  actionUrl?: string;
}

export function TheOneThingWidget() {
  const [theOneThing, setTheOneThing] = useState<TheOneThingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    // const fetchTheOneThing = async () => {
    //   const response = await fetch("/api/student/the-one-thing");
    //   const data = await response.json();
    //   setTheOneThing(data);
    //   setLoading(false);
    // };
    // fetchTheOneThing();

    // Mock data for now
    setTimeout(() => {
      setTheOneThing({
        conceptId: "optics-lens-maker",
        conceptName: "Lens Maker Formula",
        subject: "Physics - Optics",
        timeEstimate: 15,
        attempts: 3,
        accuracy: 0,
        examWeightage: 8,
        whyItMatters: "This concept appears in 8% of JEE Main papers. Students who master it improve their rank by ~500 positions on average.",
        actionType: "practice",
        actionUrl: "/dashboard/student/practice?concept=optics-lens-maker"
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!theOneThing) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            THE ONE THING
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Concept */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground mb-1">
                Master "{theOneThing.conceptName}"
              </h3>
              <p className="text-sm text-muted-foreground">{theOneThing.subject}</p>
            </div>
            <Badge variant="outline" className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              {theOneThing.examWeightage}% weightage
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{theOneThing.timeEstimate} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>{theOneThing.attempts} attempts, {theOneThing.accuracy}% accuracy</span>
            </div>
          </div>
        </div>

        {/* Why It Matters */}
        <div className="bg-background/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Why this matters:</p>
              <p className="text-sm text-muted-foreground">{theOneThing.whyItMatters}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {theOneThing.actionType === "practice" && (
            <Button 
              asChild
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
            >
              <Link href={theOneThing.actionUrl || "/dashboard/student/practice"}>
                <Play className="w-4 h-4 mr-2" />
                Start Practice
              </Link>
            </Button>
          )}
          
          {theOneThing.actionType === "watch" && (
            <Button 
              asChild
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Link href={theOneThing.actionUrl || "#"}>
                <Play className="w-4 h-4 mr-2" />
                Watch Video
              </Link>
            </Button>
          )}

          <Button 
            variant="outline"
            className="border-border text-muted-foreground hover:bg-muted"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Review Notes
          </Button>

          <Button 
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              // TODO: Skip this concept, show next one
              console.log("Skip for now");
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

