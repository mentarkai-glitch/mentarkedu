'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import type { DemoResults } from '@/lib/services/demo-scoring';

interface ResultsCardsProps {
  results: DemoResults;
}

export function ResultsCards({ results }: ResultsCardsProps) {
  const { strengths, stream, paths } = results;
  
  const confidenceColors = {
    High: 'bg-green-500/20 text-green-700 border-green-500/50',
    Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50',
    Low: 'bg-blue-500/20 text-blue-700 border-blue-500/50'
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {/* Strengths Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white border-2 border-slate-200 h-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#0AB3A3]" />
              <CardTitle className="text-xl font-bold text-[#0A2850]">
                Your Strengths
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-[#333333] mb-2">
              {strengths.join(' • ')}
            </p>
            <p className="text-sm text-slate-600">
              These are your natural tendencies — use them to choose the right stream.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stream Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-2 border-slate-200 h-full">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0AB3A3]" />
                <CardTitle className="text-xl font-bold text-[#0A2850]">
                  Best-Fit Stream
                </CardTitle>
              </div>
              <Badge className={confidenceColors[stream.confidence]}>
                {stream.confidence}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#0A2850] mb-3">
              {stream.stream}
            </p>
            <p className="text-sm text-slate-600">
              {stream.reasoning}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Future Paths Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white border-2 border-slate-200 h-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#0AB3A3]" />
              <CardTitle className="text-xl font-bold text-[#0A2850]">
                Paths You Can Try
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paths.map((path, idx) => (
                <div key={idx} className="pb-3 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-[#0A2850]">{path.name}</h4>
                    <Badge className={`text-xs ${confidenceColors[path.confidence]}`}>
                      {path.confidence}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{path.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
