"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SubjectProgress {
  subject: string;
  progress: number;
  mastery: "high" | "medium" | "low";
  weakConcepts: number;
}

export function ConceptHeatmapMini() {
  const [subjects] = useState<SubjectProgress[]>([
    { subject: "Physics", progress: 78, mastery: "medium", weakConcepts: 5 },
    { subject: "Chemistry", progress: 85, mastery: "high", weakConcepts: 2 },
    { subject: "Math", progress: 65, mastery: "low", weakConcepts: 8 },
  ]);

  const getMasteryColor = (mastery: string) => {
    switch (mastery) {
      case "high": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getMasteryBadge = (mastery: string) => {
    switch (mastery) {
      case "high": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "";
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Concept Mastery</CardTitle>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/student/concept-heatmap">
              View Detailed
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{subject.subject}</span>
                <Badge variant="outline" className={getMasteryBadge(subject.mastery)}>
                  {subject.progress}%
                </Badge>
              </div>
              {subject.weakConcepts > 0 && (
                <span className="text-xs text-muted-foreground">
                  {subject.weakConcepts} weak concepts
                </span>
              )}
            </div>
            <Progress value={subject.progress} className="h-2" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.floor(subject.progress / 20);
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${
                      filled
                        ? subject.mastery === "high"
                          ? "bg-green-500"
                          : subject.mastery === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        : "bg-muted"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <Button
          asChild
          variant="outline"
          className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Link href="/dashboard/student/concept-heatmap">
            Focus on Weak Areas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

