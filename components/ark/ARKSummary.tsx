"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle, Target, RefreshCw } from "lucide-react";
import type { StudentARKData } from "@/lib/types";

interface DifficultySummaryProps {
  status: "idle" | "loading" | "ready" | "error";
  recommendation?: {
    level: string;
    score: number;
    confidence: number;
    recommendations: string[];
  } | null;
  error?: string | null;
  onRetry?: () => void;
}

interface ARKSummaryProps {
  data: StudentARKData;
  categoryName: string;
  timeframeName: string;
  difficulty?: DifficultySummaryProps;
}

export function ARKSummary({ data, categoryName, timeframeName, difficulty }: ARKSummaryProps) {
  return (
    <Card className="glass border-yellow-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-yellow-400" />
          Your ARK Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <SummaryRow label="Category" value={categoryName} />
          <SummaryRow label="Goal" value={data.goalStatement} />
          <SummaryRow label="Timeframe" value={`${timeframeName} (${data.timeframeDuration})`} />
          <SummaryRow label="Weekly Commitment" value={`${data.hoursPerWeek} hours`} />
          <SummaryRow label="Learning Style" value={data.learningStyle} />
          <SummaryRow label="Current Level" value={data.currentLevel} />
          
          {data.specificFocus && (
            <SummaryRow label="Focus Area" value={data.specificFocus} />
          )}
          
          {data.useInstituteTemplate && (
            <div className="pt-3 border-top border-gray-700">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Using Institute Template
              </Badge>
            </div>
          )}

          {difficulty && (
            <div className="pt-3 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-yellow-400" />
                AI Difficulty Recommendation
              </h4>
              {difficulty.status === "loading" || difficulty.status === "idle" ? (
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                  Calculating personalized difficulty...
                </div>
              ) : null}

              {difficulty.status === "error" ? (
                <div className="flex items-start gap-3 bg-red-900/10 border border-red-500/30 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                  <div className="flex-1 text-sm text-red-200">
                    <p className="font-semibold">Unable to fetch recommendation</p>
                    <p className="text-red-300 text-xs mb-2">{difficulty.error || "Try again in a moment."}</p>
                    {difficulty.onRetry && (
                      <Button size="sm" variant="outline" className="border-red-400/40 text-red-200 hover:bg-red-500/10" onClick={difficulty.onRetry}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Retry
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}

              {difficulty.status === "ready" && difficulty.recommendation ? (
                <div className="bg-slate-900/40 border border-yellow-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 uppercase tracking-wide text-xs">
                      {difficulty.recommendation.level}
                    </Badge>
                    <div className="text-xs text-gray-400">
                      Confidence: {Math.round(difficulty.recommendation.confidence * 100)}%
                    </div>
                  </div>
                  <div className="text-sm text-gray-200">
                    Recommended difficulty score: <span className="font-semibold text-white">{difficulty.recommendation.score.toFixed(2)}</span> / 5
                  </div>
                  {difficulty.recommendation.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-gray-400">Suggested next steps</p>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        {difficulty.recommendation.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Psychology Profile</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {data.motivation >= 7 ? "🔥" : data.motivation >= 4 ? "🙂" : "😐"}
                </div>
                <div className="text-xs text-gray-400">Motivation</div>
                <div className="text-sm font-semibold text-white">{data.motivation}/10</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {data.stress <= 3 ? "😌" : data.stress <= 6 ? "😐" : "😰"}
                </div>
                <div className="text-xs text-gray-400">Stress</div>
                <div className="text-sm font-semibold text-white">{data.stress}/10</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">
                  {data.confidence >= 7 ? "💪" : data.confidence >= 4 ? "😊" : "😟"}
                </div>
                <div className="text-xs text-gray-400">Confidence</div>
                <div className="text-sm font-semibold text-white">{data.confidence}/10</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className="text-white text-sm font-medium text-right max-w-xs">
        {value}
      </span>
    </div>
  );
}

