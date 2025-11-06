'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Achievements
          </h1>
          <p className="text-slate-400">Coming soon - Your badge collection and achievements</p>
        </motion.div>
      </div>
    </div>
  );
}

