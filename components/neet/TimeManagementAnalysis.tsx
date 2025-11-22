'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { TimeManagementAnalysis } from '@/lib/utils/neet-scoring';

interface TimeManagementAnalysisProps {
  timeManagement: TimeManagementAnalysis;
}

export function TimeManagementAnalysisComponent({ timeManagement }: TimeManagementAnalysisProps) {
  const getEfficiencyColor = () => {
    switch (timeManagement.efficiency) {
      case 'Optimal':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Needs Adjustment':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Poor':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const totalCurrent = timeManagement.currentAllocation.physics + 
                       timeManagement.currentAllocation.chemistry + 
                       timeManagement.currentAllocation.biology;
  
  const totalRecommended = timeManagement.recommendedAllocation.physics + 
                           timeManagement.recommendedAllocation.chemistry + 
                           timeManagement.recommendedAllocation.biology;

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return 'bg-blue-500';
      case 'Chemistry':
        return 'bg-purple-500';
      case 'Biology':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-400" />
          ⏱️ Time Management Analysis
        </CardTitle>
        <CardDescription>
          Your time allocation vs recommended allocation per subject
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Efficiency Badge */}
        <div className="flex items-center justify-center">
          <Badge className={`${getEfficiencyColor()} text-base px-6 py-2`}>
            Efficiency: {timeManagement.efficiency}
          </Badge>
        </div>

        {/* Current vs Recommended */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Physics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Physics</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Current:</span>
                <span className="text-sm font-bold text-blue-400">{timeManagement.currentAllocation.physics}min</span>
              </div>
            </div>
            <Progress 
              value={(timeManagement.currentAllocation.physics / totalCurrent) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Recommended:</span>
              <span className="text-sm font-semibold text-foreground">{timeManagement.recommendedAllocation.physics}min</span>
            </div>
            {timeManagement.currentAllocation.physics !== timeManagement.recommendedAllocation.physics && (
              <div className="text-xs text-yellow-400">
                {timeManagement.currentAllocation.physics > timeManagement.recommendedAllocation.physics 
                  ? `-${timeManagement.currentAllocation.physics - timeManagement.recommendedAllocation.physics}min needed`
                  : `+${timeManagement.recommendedAllocation.physics - timeManagement.currentAllocation.physics}min needed`}
              </div>
            )}
          </div>

          {/* Chemistry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Chemistry</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Current:</span>
                <span className="text-sm font-bold text-purple-400">{timeManagement.currentAllocation.chemistry}min</span>
              </div>
            </div>
            <Progress 
              value={(timeManagement.currentAllocation.chemistry / totalCurrent) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Recommended:</span>
              <span className="text-sm font-semibold text-foreground">{timeManagement.recommendedAllocation.chemistry}min</span>
            </div>
            {timeManagement.currentAllocation.chemistry !== timeManagement.recommendedAllocation.chemistry && (
              <div className="text-xs text-yellow-400">
                {timeManagement.currentAllocation.chemistry > timeManagement.recommendedAllocation.chemistry 
                  ? `-${timeManagement.currentAllocation.chemistry - timeManagement.recommendedAllocation.chemistry}min needed`
                  : `+${timeManagement.recommendedAllocation.chemistry - timeManagement.currentAllocation.chemistry}min needed`}
              </div>
            )}
          </div>

          {/* Biology */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Biology</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Current:</span>
                <span className="text-sm font-bold text-green-400">{timeManagement.currentAllocation.biology}min</span>
              </div>
            </div>
            <Progress 
              value={(timeManagement.currentAllocation.biology / totalCurrent) * 100} 
              className="h-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Recommended:</span>
              <span className="text-sm font-semibold text-foreground">{timeManagement.recommendedAllocation.biology}min</span>
            </div>
            {timeManagement.currentAllocation.biology !== timeManagement.recommendedAllocation.biology && (
              <div className="text-xs text-yellow-400">
                {timeManagement.currentAllocation.biology > timeManagement.recommendedAllocation.biology 
                  ? `-${timeManagement.currentAllocation.biology - timeManagement.recommendedAllocation.biology}min needed`
                  : `+${timeManagement.recommendedAllocation.biology - timeManagement.currentAllocation.biology}min needed`}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {timeManagement.recommendations.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {timeManagement.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Insight Box */}
        <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
          <p className="text-sm font-semibold text-teal-400 mb-2">💡 Pro Tip</p>
          <p className="text-xs text-muted-foreground">
            NEET has equal weightage for all three subjects. Optimal time allocation ensures you maximize your score in each section. 
            Biology has more questions (90), so slight bias toward Biology can be beneficial.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

