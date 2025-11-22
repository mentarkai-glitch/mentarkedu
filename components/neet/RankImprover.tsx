'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { RankImprovement } from '@/lib/utils/neet-scoring';

interface RankImproverProps {
  rankImprovement: RankImprovement;
}

export function RankImprover({ rankImprovement }: RankImproverProps) {
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="h-5 w-5 text-teal-400" />
          Actionable Insights: Rank Improvement Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className="text-2xl font-bold text-foreground">{rankImprovement.currentScore}</div>
            <div className="text-xs text-muted-foreground mt-1">/720</div>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">With Accuracy</div>
            <div className="text-2xl font-bold text-amber-400">{rankImprovement.potentialWithAccuracy}</div>
            <div className="text-xs text-muted-foreground mt-1">+{rankImprovement.potentialWithAccuracy - rankImprovement.currentScore}</div>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">With Subject Fix</div>
            <div className="text-2xl font-bold text-blue-400">{rankImprovement.potentialWithSubjectFix}</div>
            <div className="text-xs text-muted-foreground mt-1">+{rankImprovement.potentialWithSubjectFix - rankImprovement.currentScore}</div>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
            <div className="text-xs text-muted-foreground mb-1">Target</div>
            <div className="text-2xl font-bold text-green-400">{rankImprovement.targetScore}</div>
            <div className="text-xs text-muted-foreground mt-1">+{rankImprovement.targetScore - rankImprovement.currentScore}</div>
          </div>
        </div>

        {/* Actionable Steps */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Action Plan</h3>
          {rankImprovement.actionableSteps.map((step, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                step.priority === 'High'
                  ? 'bg-red-500/5 border-red-500/30'
                  : step.priority === 'Medium'
                  ? 'bg-yellow-500/5 border-yellow-500/30'
                  : 'bg-blue-500/5 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getPriorityColor(step.priority)} flex-shrink-0`}>
                  {getPriorityIcon(step.priority)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{step.action}</span>
                    <Badge className={`text-xs ${getPriorityColor(step.priority)}`}>
                      {step.priority} Priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Timeline: {step.timeline}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/30">
          <p className="text-sm text-teal-400 font-semibold mb-2">
            🎯 Expected Improvement
          </p>
          <p className="text-xs text-muted-foreground">
            By following this action plan, you can potentially improve your score from{' '}
            <span className="font-semibold text-foreground">{rankImprovement.currentScore}</span> to{' '}
            <span className="font-semibold text-green-400">{rankImprovement.targetScore}</span> marks, which translates to a significant rank improvement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

