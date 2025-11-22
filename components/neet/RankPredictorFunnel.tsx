'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users } from 'lucide-react';
import { RankImprovement } from '@/lib/utils/neet-scoring';

interface RankPredictorFunnelProps {
  rankImprovement: RankImprovement;
}

export function RankPredictorFunnel({ rankImprovement }: RankPredictorFunnelProps) {
  // Estimate ranks based on scores (approximate NEET ranking)
  // This is a simplified model - actual ranks vary by year
  const estimateRank = (score: number): number => {
    if (score >= 650) return Math.round(100 + (720 - score) * 50);
    if (score >= 600) return Math.round(1000 + (650 - score) * 200);
    if (score >= 550) return Math.round(5000 + (600 - score) * 500);
    if (score >= 500) return Math.round(15000 + (550 - score) * 1000);
    return Math.round(30000 + (500 - score) * 1500);
  };

  const currentRank = estimateRank(rankImprovement.currentScore);
  const accuracyRank = estimateRank(rankImprovement.potentialWithAccuracy);
  const subjectFixRank = estimateRank(rankImprovement.potentialWithSubjectFix);
  const targetRank = estimateRank(rankImprovement.targetScore);

  const funnelData = [
    {
      stage: 'Current',
      score: rankImprovement.currentScore,
      rank: currentRank,
      color: '#ef4444', // red
    },
    {
      stage: 'With Accuracy Fix',
      score: rankImprovement.potentialWithAccuracy,
      rank: accuracyRank,
      color: '#f59e0b', // amber
    },
    {
      stage: 'With Subject Fix',
      score: rankImprovement.potentialWithSubjectFix,
      rank: subjectFixRank,
      color: '#3b82f6', // blue
    },
    {
      stage: 'Target',
      score: rankImprovement.targetScore,
      rank: targetRank,
      color: '#10b981', // green
    },
  ];

  const formatRank = (rank: number): string => {
    if (rank < 1000) return rank.toString();
    if (rank < 100000) return `${(rank / 1000).toFixed(1)}K`;
    return `${(rank / 100000).toFixed(1)}L`;
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Rank Improvement Potential
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Custom Funnel Visualization */}
        <div className="space-y-4">
          {funnelData.map((item, index) => {
            const widthPercent = ((item.score / 720) * 100);
            const improvement = index > 0 ? funnelData[index - 1].rank - item.rank : 0;
            
            return (
              <div key={item.stage} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{item.stage}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">Score: <span className="font-semibold text-foreground">{item.score}</span></span>
                    <span className="text-muted-foreground">Rank: <span className="font-semibold text-foreground">~{formatRank(item.rank)}</span></span>
                    {improvement > 0 && (
                      <span className="text-green-400 font-semibold">
                        ↑ {formatRank(improvement)} better
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-16 overflow-hidden rounded-lg" style={{ backgroundColor: item.color + '20' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 1, delay: index * 0.2, ease: 'easeOut' }}
                    className="h-full rounded-lg"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {item.score}/720
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Improvement Summary */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Current Score</div>
              <div className="text-xl font-bold text-foreground">{rankImprovement.currentScore}</div>
              <div className="text-xs text-muted-foreground">Rank: ~{formatRank(currentRank)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Target Score</div>
              <div className="text-xl font-bold text-green-400">{rankImprovement.targetScore}</div>
              <div className="text-xs text-muted-foreground">Rank: ~{formatRank(targetRank)}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Potential rank improvement: <span className="font-semibold text-green-400">~{formatRank(currentRank - targetRank)} ranks</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>* Ranks are estimated based on historical NEET data and may vary by exam year.</p>
        </div>
      </CardContent>
    </Card>
  );
}

