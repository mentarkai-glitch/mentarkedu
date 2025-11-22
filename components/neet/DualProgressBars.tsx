'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Microscope, AlertCircle } from 'lucide-react';

interface DualProgressBarsProps {
  neetProbability: number; // 0-100
  alliedHealthFit: number; // 0-100
}

export function DualProgressBars({ neetProbability, alliedHealthFit }: DualProgressBarsProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-teal-400" />
          Plan A vs Plan B Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan A: NEET Probability */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              <span className="font-semibold text-foreground">Plan A: NEET Govt Seat Probability</span>
            </div>
            <span className="text-2xl font-bold text-blue-400">{neetProbability}%</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Progress 
              value={neetProbability} 
              className="h-3 bg-slate-800"
            />
          </motion.div>
          <p className="text-sm text-muted-foreground">
            Based on your mock scores, Physics confidence, and exam preparation level.
          </p>
        </div>

        {/* Plan B: Allied Health Fit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500" />
              <span className="font-semibold text-foreground">Plan B: Allied Health Career Fit</span>
            </div>
            <span className="text-2xl font-bold text-teal-400">{alliedHealthFit}%</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          >
            <Progress 
              value={alliedHealthFit} 
              className="h-3 bg-slate-800"
            />
          </motion.div>
          <p className="text-sm text-muted-foreground">
            Based on your interests, empathy level, and career preferences.
          </p>
        </div>

        {/* Insights */}
        <div className="pt-4 border-t border-border">
          {neetProbability >= 70 ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Stethoscope className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-400">Strong NEET Potential</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep pushing! You have a strong chance of securing a government medical seat.
                </p>
              </div>
            </div>
          ) : neetProbability >= 50 ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Moderate NEET Potential</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep working hard, but also explore Plan B options as backup.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/30">
              <Microscope className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-teal-400">Explore Plan B Options</p>
                <p className="text-xs text-muted-foreground mt-1">
                  While you continue NEET preparation, strongly consider allied health careers as backup paths.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


