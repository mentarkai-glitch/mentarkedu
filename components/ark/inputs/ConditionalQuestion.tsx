"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ARKQuestion } from '@/lib/data/ark-questions';

interface ConditionalQuestionProps {
  question: ARKQuestion;
  children: React.ReactNode;
  show: boolean;
}

export function ConditionalQuestion({ question, children, show }: ConditionalQuestionProps) {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

