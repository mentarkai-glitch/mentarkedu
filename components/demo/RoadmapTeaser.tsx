'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DemoResults } from '@/lib/services/demo-scoring';

interface RoadmapTeaserProps {
  roadmap: DemoResults['roadmap'];
}

export function RoadmapTeaser({ roadmap }: RoadmapTeaserProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-white border-2 border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-[#0A2850]">
            Starter Roadmap — Next 2 Years
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#0AB3A3] hover:text-[#0A2850]"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Expand
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent>
              <ul className="space-y-4">
                {roadmap.map((step, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0AB3A3]/20 flex items-center justify-center text-sm font-bold text-[#0A2850]">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0A2850] mb-1">
                        {step.period}
                      </p>
                      <p className="text-sm text-slate-600">
                        {step.focus}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      {!isExpanded && (
        <CardContent>
          <p className="text-sm text-slate-600">
            Click to see your personalized 2-year roadmap with monthly focus areas and action steps.
          </p>
        </CardContent>
      )}
    </Card>
  );
}

