/**
 * Adaptive Practice System
 * Adjusts difficulty based on performance, tracks mistakes, and implements spaced repetition
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'advanced';

export interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: DifficultyLevel;
  topic: string;
  subject?: string;
  tags?: string[];
}

export interface PracticeAttempt {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  timeSpent: number; // seconds
  timestamp: Date;
  difficulty: DifficultyLevel;
  wasCorrect: boolean;
}

export interface MistakeRecord {
  questionId: string;
  topic: string;
  mistakeType: 'conceptual' | 'calculation' | 'application' | 'memory';
  attemptedAnswer: string;
  correctAnswer: string;
  firstOccurrence: Date;
  lastOccurrence: Date;
  occurrences: number;
  nextReview: Date; // For spaced repetition
  masteryLevel: number; // 0-100
}

export interface PerformanceMetrics {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // 0-1
  averageTime: number; // seconds
  difficultyDistribution: Record<DifficultyLevel, number>;
  topicPerformance: Record<string, { correct: number; total: number; accuracy: number }>;
  mistakePatterns: MistakeRecord[];
}

/**
 * Calculate adaptive difficulty based on recent performance
 */
export function calculateAdaptiveDifficulty(
  recentAttempts: PracticeAttempt[],
  currentDifficulty: DifficultyLevel
): DifficultyLevel {
  if (recentAttempts.length === 0) return currentDifficulty;
  
  // Calculate accuracy for recent attempts
  const recentCorrect = recentAttempts.filter(a => a.wasCorrect).length;
  const recentAccuracy = recentCorrect / recentAttempts.length;
  
  // Calculate average time (normalized)
  const avgTime = recentAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / recentAttempts.length;
  const normalizedTime = avgTime / 60; // Normalize to minutes
  
  // Difficulty adjustment logic
  if (recentAccuracy >= 0.8 && normalizedTime < 2) {
    // High accuracy and fast - increase difficulty
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
    if (currentDifficulty === 'hard') return 'advanced';
  } else if (recentAccuracy < 0.5 || normalizedTime > 5) {
    // Low accuracy or slow - decrease difficulty
    if (currentDifficulty === 'advanced') return 'hard';
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
  }
  
  return currentDifficulty;
}

/**
 * Track and categorize mistakes
 */
export function trackMistake(
  question: PracticeQuestion,
  attemptedAnswer: number,
  correctAnswer: number,
  existingMistakes: MistakeRecord[]
): MistakeRecord {
  const mistakeType = categorizeMistake(question, attemptedAnswer, correctAnswer);
  
  // Find existing mistake record
  const existing = existingMistakes.find(m => m.questionId === question.id);
  
  if (existing) {
    // Update existing mistake
    return {
      ...existing,
      lastOccurrence: new Date(),
      occurrences: existing.occurrences + 1,
      nextReview: calculateNextReview(existing.occurrences + 1),
      masteryLevel: Math.max(0, existing.masteryLevel - 10)
    };
  }
  
  // Create new mistake record
  return {
    questionId: question.id,
    topic: question.topic,
    mistakeType,
    attemptedAnswer: question.options[attemptedAnswer] || 'Unknown',
    correctAnswer: question.options[correctAnswer],
    firstOccurrence: new Date(),
    lastOccurrence: new Date(),
    occurrences: 1,
    nextReview: calculateNextReview(1),
    masteryLevel: 50 // Start at 50, decreases with more mistakes
  };
}

/**
 * Categorize mistake type
 */
function categorizeMistake(
  question: PracticeQuestion,
  attemptedAnswer: number,
  correctAnswer: number
): 'conceptual' | 'calculation' | 'application' | 'memory' {
  // Simple heuristic - can be enhanced with AI
  const questionLower = question.question.toLowerCase();
  const explanationLower = question.explanation.toLowerCase();
  
  if (questionLower.includes('calculate') || questionLower.includes('solve') || questionLower.includes('=')) {
    return 'calculation';
  }
  
  if (questionLower.includes('explain') || questionLower.includes('why') || questionLower.includes('how')) {
    return 'conceptual';
  }
  
  if (questionLower.includes('apply') || questionLower.includes('use') || questionLower.includes('implement')) {
    return 'application';
  }
  
  if (explanationLower.includes('remember') || explanationLower.includes('recall')) {
    return 'memory';
  }
  
  // Default to conceptual
  return 'conceptual';
}

/**
 * Calculate next review date using spaced repetition (SM-2 algorithm)
 */
function calculateNextReview(occurrences: number): Date {
  // Simplified spaced repetition
  // Day 1, Day 3, Day 7, Day 14, Day 30, etc.
  const intervals = [1, 3, 7, 14, 30, 60, 120];
  const intervalIndex = Math.min(occurrences - 1, intervals.length - 1);
  const days = intervals[intervalIndex];
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);
  return nextReview;
}

/**
 * Get mistakes due for review
 */
export function getMistakesDueForReview(mistakes: MistakeRecord[]): MistakeRecord[] {
  const now = new Date();
  return mistakes
    .filter(m => m.nextReview <= now)
    .sort((a, b) => {
      // Sort by priority: more occurrences first, then by next review date
      if (a.occurrences !== b.occurrences) {
        return b.occurrences - a.occurrences;
      }
      return a.nextReview.getTime() - b.nextReview.getTime();
    });
}

/**
 * Analyze mistake patterns
 */
export function analyzeMistakePatterns(
  mistakes: MistakeRecord[],
  attempts: PracticeAttempt[]
): {
  commonTopics: Array<{ topic: string; count: number; accuracy: number }>;
  mistakeTypes: Record<string, number>;
  weakAreas: string[];
  improvementTrend: 'improving' | 'declining' | 'stable';
} {
  // Group mistakes by topic
  const topicMap = new Map<string, { mistakes: number; total: number }>();
  
  mistakes.forEach(mistake => {
    const existing = topicMap.get(mistake.topic) || { mistakes: 0, total: 0 };
    topicMap.set(mistake.topic, {
      mistakes: existing.mistakes + mistake.occurrences,
      total: existing.total + mistake.occurrences
    });
  });
  
  // Count attempts per topic
  attempts.forEach(attempt => {
    // Would need question data to get topic - simplified for now
  });
  
  const commonTopics = Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      count: data.mistakes,
      accuracy: data.total > 0 ? 1 - (data.mistakes / data.total) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Group by mistake type
  const mistakeTypes: Record<string, number> = {};
  mistakes.forEach(m => {
    mistakeTypes[m.mistakeType] = (mistakeTypes[m.mistakeType] || 0) + m.occurrences;
  });
  
  // Identify weak areas (topics with most mistakes)
  const weakAreas = commonTopics
    .filter(t => t.accuracy < 0.7)
    .map(t => t.topic);
  
  // Calculate improvement trend (simplified)
  const recentMistakes = mistakes.filter(m => {
    const daysSince = (Date.now() - m.lastOccurrence.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });
  
  const olderMistakes = mistakes.filter(m => {
    const daysSince = (Date.now() - m.lastOccurrence.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 7 && daysSince <= 14;
  });
  
  const recentCount = recentMistakes.reduce((sum, m) => sum + m.occurrences, 0);
  const olderCount = olderMistakes.reduce((sum, m) => sum + m.occurrences, 0);
  
  let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentCount < olderCount * 0.8) {
    improvementTrend = 'improving';
  } else if (recentCount > olderCount * 1.2) {
    improvementTrend = 'declining';
  }
  
  return {
    commonTopics,
    mistakeTypes,
    weakAreas,
    improvementTrend
  };
}

/**
 * Calculate performance metrics
 */
export function calculatePerformanceMetrics(
  attempts: PracticeAttempt[],
  mistakes: MistakeRecord[]
): PerformanceMetrics {
  const totalQuestions = attempts.length;
  const correctAnswers = attempts.filter(a => a.wasCorrect).length;
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  
  const averageTime = attempts.length > 0
    ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length
    : 0;
  
  // Difficulty distribution
  const difficultyDistribution: Record<DifficultyLevel, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    advanced: 0
  };
  
  attempts.forEach(a => {
    difficultyDistribution[a.difficulty]++;
  });
  
  // Topic performance (simplified - would need question data)
  const topicPerformance: Record<string, { correct: number; total: number; accuracy: number }> = {};
  
  // Group mistakes by topic for analysis
  mistakes.forEach(m => {
    if (!topicPerformance[m.topic]) {
      topicPerformance[m.topic] = { correct: 0, total: 0, accuracy: 0 };
    }
    topicPerformance[m.topic].total += m.occurrences;
  });
  
  // Calculate accuracy per topic (simplified)
  Object.keys(topicPerformance).forEach(topic => {
    const data = topicPerformance[topic];
    // Would need to cross-reference with attempts to get accurate counts
    data.accuracy = data.total > 0 ? 0.5 : 0; // Placeholder
  });
  
  return {
    totalQuestions,
    correctAnswers,
    accuracy,
    averageTime,
    difficultyDistribution,
    topicPerformance,
    mistakePatterns: mistakes
  };
}

/**
 * Generate practice questions with adaptive difficulty
 */
export function generateAdaptiveQuestions(
  targetDifficulty: DifficultyLevel,
  topic?: string,
  count: number = 10
): PracticeQuestion[] {
  // This would typically call an AI service or question bank
  // For now, return placeholder structure
  const questions: PracticeQuestion[] = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q-${Date.now()}-${i}`,
      question: `Sample question ${i + 1} about ${topic || 'general topic'}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `Explanation for question ${i + 1}`,
      difficulty: targetDifficulty,
      topic: topic || 'General',
      tags: [topic || 'general']
    });
  }
  
  return questions;
}

