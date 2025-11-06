"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { StudentARKData } from "@/lib/types";

interface ARKSummaryProps {
  data: StudentARKData;
  categoryName: string;
  timeframeName: string;
}

export function ARKSummary({ data, categoryName, timeframeName }: ARKSummaryProps) {
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
            <div className="pt-3 border-t border-gray-700">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Using Institute Template
              </Badge>
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

