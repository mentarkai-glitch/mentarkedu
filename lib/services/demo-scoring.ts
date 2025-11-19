/**
 * Demo Path Finder - Scoring Engine
 * Calculates results from quiz answers
 */

import { DEMO_QUESTIONS } from '@/lib/data/demo-questions';
import { determineStream, getDominantStrengths, formatTraitName, type TraitScores, type StreamResult } from '@/lib/data/stream-rules';
import { getCareerPathsForStream } from '@/lib/data/career-paths';
import { getRoadmapForStream } from '@/lib/data/roadmap-templates';

export interface QuizAnswer {
  questionId: number;
  answer: string | number; // string for single-choice, number (0-10) for slider
}

export interface DemoResults {
  strengths: string[]; // formatted trait names
  stream: StreamResult;
  paths: Array<{
    name: string;
    description: string;
    confidence: 'High' | 'Medium' | 'Low';
  }>;
  roadmap: Array<{
    period: string;
    focus: string;
  }>;
}

/**
 * Calculate results from quiz answers
 */
export function calculateResults(answers: QuizAnswer[]): DemoResults {
  // Initialize trait scores
  const traitScores: TraitScores = {
    logical: 0,
    creative: 0,
    people: 0,
    'hands-on': 0,
    leader: 0,
    disciplined: 0
  };
  
  let studyTolerance = 5; // default middle value
  let financialConstraint = false;
  
  // Process each answer
  answers.forEach(({ questionId, answer }) => {
    const question = DEMO_QUESTIONS.find(q => q.id === questionId);
    if (!question) return;
    
    // Handle slider question (Q4)
    if (question.studyToleranceMapping && typeof answer === 'number') {
      studyTolerance = answer;
      return;
    }
    
    // Handle financial constraint question (Q7)
    if (questionId === 7 && typeof answer === 'string') {
      financialConstraint = answer === "Need affordable options / scholarship";
      return;
    }
    
    // Process trait mapping for single-choice questions
    if (typeof answer === 'string' && question.traitMapping[answer]) {
      const traits = question.traitMapping[answer];
      traits.forEach(trait => {
        if (trait in traitScores) {
          traitScores[trait as keyof TraitScores]++;
        }
      });
    }
  });
  
  // Determine stream
  const streamResult = determineStream(traitScores, studyTolerance, financialConstraint);
  
  // Get dominant strengths
  const dominantTraits = getDominantStrengths(traitScores);
  const strengths = dominantTraits.map(formatTraitName);
  
  // Get career paths
  const paths = getCareerPathsForStream(streamResult.stream);
  
  // Get roadmap
  const roadmap = getRoadmapForStream(streamResult.stream);
  
  return {
    strengths,
    stream: streamResult,
    paths,
    roadmap
  };
}

/**
 * Validate quiz completion
 */
export function isQuizComplete(answers: QuizAnswer[]): boolean {
  return answers.length === DEMO_QUESTIONS.length;
}
