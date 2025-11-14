/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm for optimal spaced repetition intervals
 */

export interface SM2Card {
  easeFactor: number; // Current ease factor (default: 2.5)
  interval: number; // Days until next review (default: 1)
  repetitions: number; // Number of successful repetitions (default: 0)
  lastReviewed?: Date; // Last review date
}

export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * SM-2 Algorithm
 * 
 * Quality levels:
 * 0-2: Incorrect response - reset to beginning
 * 3: Correct response with difficulty - slight increase
 * 4: Correct response - moderate increase
 * 5: Perfect response - significant increase
 * 
 * @param card Current card state
 * @param quality Response quality (0-5)
 * @returns Updated card state
 */
export function sm2Algorithm(card: SM2Card, quality: SM2Quality): SM2Card {
  const currentCard = {
    easeFactor: card.easeFactor || 2.5,
    interval: card.interval || 1,
    repetitions: card.repetitions || 0,
    lastReviewed: card.lastReviewed || new Date(),
  };

  // Calculate new ease factor
  let newEaseFactor = currentCard.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ensure ease factor stays within bounds (1.3 to 2.5+)
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Incorrect response - reset interval
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Correct response
    if (currentCard.repetitions === 0) {
      newInterval = 1;
    } else if (currentCard.repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentCard.interval * newEaseFactor);
    }
    
    newRepetitions = currentCard.repetitions + 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: Number(newEaseFactor.toFixed(2)),
    interval: newInterval,
    repetitions: newRepetitions,
    lastReviewed: new Date(),
  };
}

/**
 * Convert performance score (0-5) to SM-2 quality
 */
export function scoreToQuality(score: number): SM2Quality {
  if (score <= 0) return 0;
  if (score <= 1) return 1;
  if (score <= 2) return 2;
  if (score <= 3) return 3;
  if (score <= 4) return 4;
  return 5;
}

/**
 * Get next review date based on SM-2 algorithm
 */
export function getNextReviewDate(card: SM2Card, quality: SM2Quality): Date {
  const updatedCard = sm2Algorithm(card, quality);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + updatedCard.interval);
  return nextDate;
}

/**
 * Calculate mastery level based on repetitions and ease factor
 */
export function calculateMasteryLevel(card: SM2Card): number {
  // Mastery increases with successful repetitions and higher ease factor
  const repetitionBonus = Math.min(card.repetitions * 10, 50); // Max 50% from repetitions
  const easeBonus = ((card.easeFactor - 1.3) / (2.5 - 1.3)) * 30; // Max 30% from ease factor
  const baseLevel = 20; // Base level for having started
  
  return Math.min(100, Math.round(baseLevel + repetitionBonus + easeBonus));
}

