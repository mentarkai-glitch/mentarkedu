/**
 * Spaced Repetition Integration for Mistakes
 * Automatically adds mistakes to spaced repetition queue for review
 */

import { createClient } from '@/lib/supabase/server';
import { sm2Algorithm, scoreToQuality } from '@/lib/algorithms/sm2';
import type { SpacedRepetitionQueueItem, MistakePattern } from '@/lib/types';

/**
 * Add a mistake to spaced repetition queue
 */
export async function addMistakeToSpacedRepetition(
  studentId: string,
  mistakePattern: MistakePattern,
  performanceScore: number = 0 // 0-5 scale
): Promise<SpacedRepetitionQueueItem | null> {
  try {
    const supabase = await createClient();

    // Create unique card identifier
    const cardIdentifier = `mistake:${mistakePattern.topic}:${mistakePattern.mistake_type}:${mistakePattern.id}`;

    // Check if already in queue
    const { data: existing } = await supabase
      .from('spaced_repetition_queue')
      .select('*')
      .eq('student_id', studentId)
      .eq('card_identifier', cardIdentifier)
      .single();

    // Calculate next review date using SM-2
    const quality = scoreToQuality(performanceScore);
    
    const sm2Card = existing
      ? {
          easeFactor: existing.ease_factor || 2.5,
          interval: existing.interval_days || 1,
          repetitions: existing.success_streak || 0,
          lastReviewed: existing.last_reviewed_at 
            ? new Date(existing.last_reviewed_at) 
            : undefined,
        }
      : {
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
        };

    const updatedCard = sm2Algorithm(sm2Card, quality);

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + updatedCard.interval);

    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from('spaced_repetition_queue')
        .update({
          interval_days: updatedCard.interval,
          ease_factor: updatedCard.easeFactor,
          success_streak: updatedCard.repetitions,
          due_at: dueDate.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as SpacedRepetitionQueueItem;
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('spaced_repetition_queue')
        .insert({
          student_id: studentId,
          card_identifier: cardIdentifier,
          origin: 'practice_questions',
          due_at: dueDate.toISOString(),
          interval_days: updatedCard.interval,
          ease_factor: updatedCard.easeFactor,
          success_streak: updatedCard.repetitions,
          last_reviewed_at: new Date().toISOString(),
          metadata: {
            mistake_pattern_id: mistakePattern.id,
            topic: mistakePattern.topic,
            subject: mistakePattern.subject,
            mistake_type: mistakePattern.mistake_type,
            frequency: mistakePattern.frequency,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data as SpacedRepetitionQueueItem;
    }
  } catch (error) {
    console.error('Error adding mistake to spaced repetition:', error);
    return null;
  }
}

/**
 * Batch add mistakes to spaced repetition queue
 */
export async function addMistakesToSpacedRepetition(
  studentId: string,
  mistakePatterns: MistakePattern[],
  performanceScores: Record<string, number> = {}
): Promise<SpacedRepetitionQueueItem[]> {
  const results: SpacedRepetitionQueueItem[] = [];

  for (const pattern of mistakePatterns) {
    const cardIdentifier = `mistake:${pattern.topic}:${pattern.mistake_type}:${pattern.id}`;
    const performanceScore = performanceScores[cardIdentifier] || 0;
    
    const result = await addMistakeToSpacedRepetition(
      studentId,
      pattern,
      performanceScore
    );

    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Get mistakes due for review from spaced repetition queue
 */
export async function getMistakesDueForReview(
  studentId: string
): Promise<SpacedRepetitionQueueItem[]> {
  try {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('spaced_repetition_queue')
      .select('*')
      .eq('student_id', studentId)
      .eq('origin', 'practice_questions')
      .lte('due_at', now)
      .order('due_at', { ascending: true });

    if (error) throw error;

    return (data || []) as SpacedRepetitionQueueItem[];
  } catch (error) {
    console.error('Error getting mistakes due for review:', error);
    return [];
  }
}

/**
 * Update spaced repetition after reviewing a mistake
 */
export async function updateMistakeSpacedRepetition(
  studentId: string,
  cardIdentifier: string,
  performanceScore: number // 0-5 scale
): Promise<SpacedRepetitionQueueItem | null> {
  try {
    const supabase = await createClient();

    // Get existing entry
    const { data: existing } = await supabase
      .from('spaced_repetition_queue')
      .select('*')
      .eq('student_id', studentId)
      .eq('card_identifier', cardIdentifier)
      .single();

    if (!existing) {
      console.warn('Spaced repetition entry not found:', cardIdentifier);
      return null;
    }

    // Calculate next review using SM-2
    const quality = scoreToQuality(performanceScore);

    const sm2Card = {
      easeFactor: existing.ease_factor || 2.5,
      interval: existing.interval_days || 1,
      repetitions: existing.success_streak || 0,
      lastReviewed: existing.last_reviewed_at 
        ? new Date(existing.last_reviewed_at) 
        : undefined,
    };

    const updatedCard = sm2Algorithm(sm2Card, quality);

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + updatedCard.interval);

    // Update entry
    const { data, error } = await supabase
      .from('spaced_repetition_queue')
      .update({
        interval_days: updatedCard.interval,
        ease_factor: updatedCard.easeFactor,
        success_streak: updatedCard.repetitions,
        due_at: dueDate.toISOString(),
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    return data as SpacedRepetitionQueueItem;
  } catch (error) {
    console.error('Error updating mistake spaced repetition:', error);
    return null;
  }
}

