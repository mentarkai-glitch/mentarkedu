'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { MockTestTrend } from '@/lib/utils/neet-scoring';

interface MockTestTrendProps {
  mockTestTrend: MockTestTrend;
}

export function MockTestTrendComponent({ mockTestTrend }: MockTestTrendProps) {
  const getFrequencyColor = () => {
    switch (mockTestTrend.frequency) {
      case 'High':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Low':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Very Low':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTrendColor = () => {
    switch (mockTestTrend.trend) {
      case 'Improving':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Stable':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Fluctuating':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Declining':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTrendIcon = () => {
    switch (mockTestTrend.trend) {
      case 'Improving':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'Declining':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-400" />
          📊 Mock Test Performance Analysis
        </CardTitle>
        <CardDescription>
          Your mock test frequency and trend analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frequency & Trend Badges */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Badge className={`${getFrequencyColor()} text-base px-6 py-2`}>
            Frequency: {mockTestTrend.frequency}
          </Badge>
          <Badge className={`${getTrendColor()} text-base px-6 py-2 flex items-center gap-2`}>
            {getTrendIcon()}
            Trend: {mockTestTrend.trend}
          </Badge>
        </div>

        {/* Projected Score */}
        <div className="p-6 rounded-lg bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Projected Score (Based on Trend)</p>
            <p className="text-4xl font-bold text-teal-400 mb-2">{mockTestTrend.projectedScore}/720</p>
            <p className="text-xs text-muted-foreground">
              {mockTestTrend.trend === 'Improving' 
                ? 'Your improving trend suggests this projected score' 
                : mockTestTrend.trend === 'Declining'
                ? 'Address declining trend to improve this projection'
                : 'Projection based on current trend'}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {mockTestTrend.recommendations.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {mockTestTrend.recommendations.map((rec, idx) => (
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
            Regular mock tests (2-4 per month) help build exam stamina, identify weak areas, and track improvement. 
            Analyze each mock test thoroughly to maximize learning from mistakes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

