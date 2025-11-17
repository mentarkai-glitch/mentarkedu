/**
 * Spaced Repetition System - SM-2 Algorithm Implementation
 * Based on SuperMemo 2 algorithm for optimal review scheduling
 */

export interface Card {
  id: string;
  front: string;
  back: string;
  easeFactor: number; // Starting at 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  lastReview?: Date;
  nextReview: Date;
  quality: number; // 0-5, user's response quality
}

export interface ReviewResult {
  card: Card;
  newInterval: number;
  newEaseFactor: number;
  newRepetitions: number;
  nextReview: Date;
  mastered: boolean; // Card is mastered if interval > 365 days
}

/**
 * SM-2 Algorithm: Calculate next review interval based on quality
 * Quality: 0-5 (0=blackout, 1=incorrect, 2=incorrect but remembered, 3=correct with difficulty, 4=correct, 5=perfect)
 */
export function calculateNextReview(
  card: Card,
  quality: number
): ReviewResult {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  let newEaseFactor = card.easeFactor;
  let newInterval = card.interval;
  let newRepetitions = card.repetitions;
  let mastered = false;

  // Update ease factor based on quality
  newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ensure ease factor doesn't go below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Calculate new interval based on quality
  if (quality < 3) {
    // Failed - reset
    newInterval = 1;
    newRepetitions = 0;
  } else {
    // Passed
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEaseFactor);
    }
    newRepetitions += 1;
  }

  // Card is considered mastered if interval > 365 days
  if (newInterval > 365) {
    mastered = true;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    card: {
      ...card,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      quality,
      lastReview: new Date(),
      nextReview
    },
    newInterval,
    newEaseFactor,
    newRepetitions,
    nextReview,
    mastered
  };
}

/**
 * Create a new flashcard
 */
export function createCard(
  id: string,
  front: string,
  back: string
): Card {
  return {
    id,
    front,
    back,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: new Date(),
    quality: 0 // Initial quality, will be set on first review
  };
}

/**
 * Get cards due for review
 */
export function getDueCards(cards: Card[]): Card[] {
  const now = new Date();
  return cards.filter(card => {
    return card.nextReview <= now;
  }).sort((a, b) => {
    // Sort by priority: overdue first, then by next review date
    const aOverdue = a.nextReview < now ? 1 : 0;
    const bOverdue = b.nextReview < now ? 1 : 0;
    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue;
    }
    return a.nextReview.getTime() - b.nextReview.getTime();
  });
}

/**
 * Get cards by mastery level
 */
export function getCardsByMastery(cards: Card[]): {
  new: Card[];
  learning: Card[];
  reviewing: Card[];
  mastered: Card[];
} {
  const now = new Date();
  
  return {
    new: cards.filter(c => c.repetitions === 0),
    learning: cards.filter(c => c.repetitions > 0 && c.repetitions < 5 && c.interval < 30),
    reviewing: cards.filter(c => c.repetitions >= 5 && c.interval >= 30 && c.interval <= 365),
    mastered: cards.filter(c => c.interval > 365)
  };
}

/**
 * Calculate retention rate
 */
export function calculateRetentionRate(cards: Card[]): number {
  if (cards.length === 0) return 0;
  
  const reviewedCards = cards.filter(c => c.repetitions > 0);
  if (reviewedCards.length === 0) return 0;
  
  // Cards with high ease factor and many repetitions are well-retained
  const wellRetained = reviewedCards.filter(c => 
    c.easeFactor >= 2.0 && c.repetitions >= 3
  ).length;
  
  return wellRetained / reviewedCards.length;
}

/**
 * Generate AI-powered flashcards from content
 */
export async function generateFlashcards(
  content: string,
  topic: string,
  count: number = 10
): Promise<Card[]> {
  // This would use AI to generate flashcards
  // For now, return placeholder
  const cards: Card[] = [];
  
  // Split content into chunks and create cards
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const sentence = sentences[i].trim();
    cards.push(createCard(
      `card-${topic}-${i}`,
      `Question about: ${topic}`,
      sentence
    ));
  }
  
  return cards;
}


