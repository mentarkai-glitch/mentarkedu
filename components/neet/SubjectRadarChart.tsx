'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { SubjectScores } from '@/lib/utils/neet-scoring';

// Lazy load chart components
const RadarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadarChart),
  { ssr: false }
);
const Radar = dynamic(
  () => import('recharts').then((mod) => mod.Radar),
  { ssr: false }
);
const PolarGrid = dynamic(
  () => import('recharts').then((mod) => mod.PolarGrid),
  { ssr: false }
);
const PolarAngleAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarAngleAxis),
  { ssr: false }
);
const PolarRadiusAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarRadiusAxis),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface SubjectRadarChartProps {
  subjectScores: SubjectScores;
}

export function SubjectRadarChart({ subjectScores }: SubjectRadarChartProps) {
  const data = [
    { axis: 'Physics', value: Math.round(subjectScores.physics) },
    { axis: 'Chemistry', value: Math.round(subjectScores.chemistry) },
    { axis: 'Biology', value: Math.round(subjectScores.biology) },
    { axis: 'Accuracy', value: Math.round(subjectScores.accuracy) },
    { axis: 'Stamina', value: Math.round(subjectScores.stamina) },
    { axis: 'Mindset', value: Math.round(subjectScores.mindset) },
  ];

  const chartData = data.map((item) => ({
    subject: item.axis,
    score: item.value,
    fullMark: 100,
  }));

  // Determine overall health status
  const avgScore = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  const status = avgScore >= 75 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore >= 45 ? 'Fair' : 'Needs Work';
  const statusColor = avgScore >= 75 ? 'text-green-400' : avgScore >= 60 ? 'text-blue-400' : avgScore >= 45 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="h-5 w-5 text-teal-400" />
          Subject Vital Signs
          <span className={`ml-auto text-sm font-normal ${statusColor}`}>
            {status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full bg-slate-800/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#475569" strokeWidth={1} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#14b8a6', fontSize: 16, fontWeight: 700 }}
                reversed={false}
                scale="auto"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#06b6d4', fontSize: 14, fontWeight: 600 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.9}
                strokeWidth={4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          {data.map((item, index) => {
            const color = item.value >= 75 ? 'text-green-400' : item.value >= 60 ? 'text-blue-400' : item.value >= 45 ? 'text-yellow-400' : 'text-red-400';
            return (
              <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                <div className={`text-2xl font-bold ${color}`}>{item.value}%</div>
                <div className="text-xs text-muted-foreground mt-1">{item.axis}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Average Score: <span className={`font-semibold ${statusColor}`}>{Math.round(avgScore)}%</span></p>
          <p className="text-xs mt-1">These metrics indicate your preparation level across key areas for NEET success.</p>
        </div>
      </CardContent>
    </Card>
  );
}

