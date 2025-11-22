'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, AlertCircle } from 'lucide-react';
import { NCERTPYQAnalysis } from '@/lib/utils/neet-scoring';

interface NCERTPYQAnalysisProps {
  ncertPYQ: NCERTPYQAnalysis;
}

export function NCERTPYQAnalysisComponent({ ncertPYQ }: NCERTPYQAnalysisProps) {
  const getGapColor = () => {
    switch (ncertPYQ.gap) {
      case 'NCERT Strong':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'PYQ Strong':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'Balanced':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Both Need Work':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 45) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-400" />
          📖 NCERT vs PYQ Analysis
        </CardTitle>
        <CardDescription>
          Your foundation strength vs exam readiness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gap Badge */}
        <div className="flex items-center justify-center">
          <Badge className={`${getGapColor()} text-base px-6 py-2`}>
            Status: {ncertPYQ.gap}
          </Badge>
        </div>

        {/* Score Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NCERT Confidence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-semibold text-foreground">NCERT Confidence</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(ncertPYQ.ncertConfidence)}`}>
                {ncertPYQ.ncertConfidence}%
              </span>
            </div>
            <Progress value={ncertPYQ.ncertConfidence} className="h-3" />
            <p className="text-xs text-muted-foreground">
              How well you understand NCERT concepts and fundamentals
            </p>
          </div>

          {/* PYQ Completion */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-semibold text-foreground">PYQ Completion</span>
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(ncertPYQ.pyqCompletion)}`}>
                {ncertPYQ.pyqCompletion}%
              </span>
            </div>
            <Progress value={ncertPYQ.pyqCompletion} className="h-3" />
            <p className="text-xs text-muted-foreground">
              How many previous year questions you've solved and practiced
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {ncertPYQ.recommendations.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {ncertPYQ.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strategy Box */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
          <p className="text-sm font-semibold text-blue-400 mb-2">📚 Study Strategy</p>
          <p className="text-xs text-muted-foreground mb-3">
            NEET requires a balanced approach:
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• <strong>NCERT</strong> provides the foundation - master concepts first</li>
            <li>• <strong>PYQs</strong> provide exam pattern familiarity - practice regularly</li>
            <li>• <strong>Both</strong> are essential for scoring high - don't skip either!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

