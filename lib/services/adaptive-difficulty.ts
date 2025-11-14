/**
 * Adaptive Difficulty Service
 * Manages difficulty adjustment based on student performance
 */

import { createClient } from '@/lib/supabase/server';
import type { DifficultyLevel, AdaptiveDifficulty } from '@/lib/types';

export interface PerformanceMetrics {
  total_attempts: number;
  correct_attempts: number;
  streak_count: number;
  recent_accuracy: number; // Last 5 attempts
}

/**
 * Calculate optimal difficulty based on performance metrics
 */
export function calculateOptimalDifficulty(metrics: PerformanceMetrics): DifficultyLevel {
  const { total_attempts, correct_attempts, streak_count, recent_accuracy } = metrics;

  // Need minimum attempts to make informed decision
  if (total_attempts < 3) {
    return 'medium'; // Default to medium for new topics
  }

  // Calculate overall accuracy
  const overallAccuracy = total_attempts > 0 
    ? (correct_attempts / total_attempts) * 100 
    : 50;

  // Use recent accuracy if available (last 5 attempts)
  const accuracy = recent_accuracy > 0 ? recent_accuracy : overallAccuracy;

  // Increase difficulty if:
  // - High accuracy (>= 80%) AND high streak (>= 3)
  if (accuracy >= 80 && streak_count >= 3) {
    return 'hard';
  }

  // Decrease difficulty if:
  // - Low accuracy (< 60%) OR no streak AND at least 3 attempts
  if (accuracy < 60 && total_attempts >= 3) {
    return 'easy';
  }

  // Maintain medium if:
  // - Medium accuracy (60-80%) OR low streak
  return 'medium';
}

/**
 * Get adaptive difficulty for a topic
 */
export async function getAdaptiveDifficulty(
  studentId: string,
  topic: string,
  subject?: string
): Promise<AdaptiveDifficulty | null> {
  try {
    const supabase = await createClient();

    const query = supabase
      .from('adaptive_difficulty')
      .select('*')
      .eq('student_id', studentId)
      .eq('topic', topic);

    if (subject) {
      query.eq('subject', subject);
    } else {
      query.is('subject', null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - return default
        return {
          student_id: studentId,
          topic,
          subject,
          current_difficulty: 'medium',
          total_attempts: 0,
          correct_attempts: 0,
          streak_count: 0,
          last_updated_at: new Date().toISOString(),
        };
      }
      throw error;
    }

    return data as AdaptiveDifficulty;
  } catch (error) {
    console.error('Error getting adaptive difficulty:', error);
    return null;
  }
}

/**
 * Update adaptive difficulty based on attempt result
 */
export async function updateAdaptiveDifficulty(
  studentId: string,
  topic: string,
  isCorrect: boolean,
  subject?: string
): Promise<AdaptiveDifficulty | null> {
  try {
    const supabase = await createClient();

    // Get current difficulty
    let current = await getAdaptiveDifficulty(studentId, topic, subject);

    if (!current) {
      // Create new entry
      current = {
        student_id: studentId,
        topic,
        subject,
        current_difficulty: 'medium',
        total_attempts: 0,
        correct_attempts: 0,
        streak_count: 0,
        last_updated_at: new Date().toISOString(),
      };
    }

    // Update metrics
    const newTotalAttempts = current.total_attempts + 1;
    const newCorrectAttempts = isCorrect 
      ? current.correct_attempts + 1 
      : current.correct_attempts;
    const newStreakCount = isCorrect 
      ? current.streak_count + 1 
      : 0;

    // Calculate performance metrics
    const performanceScore = newTotalAttempts > 0
      ? (newCorrectAttempts / newTotalAttempts) * 100
      : 0;

    // Calculate optimal difficulty
    const metrics: PerformanceMetrics = {
      total_attempts: newTotalAttempts,
      correct_attempts: newCorrectAttempts,
      streak_count: newStreakCount,
      recent_accuracy: performanceScore, // Simplified - in real implementation, track last 5
    };

    const optimalDifficulty = calculateOptimalDifficulty(metrics);

    // Update or insert
    const updateData = {
      student_id: studentId,
      topic,
      subject: subject || null,
      current_difficulty: optimalDifficulty,
      performance_score: performanceScore,
      total_attempts: newTotalAttempts,
      correct_attempts: newCorrectAttempts,
      streak_count: newStreakCount,
      last_updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('adaptive_difficulty')
      .upsert(updateData, {
        onConflict: 'student_id,topic,subject',
      })
      .select()
      .single();

    if (error) throw error;

    return data as AdaptiveDifficulty;
  } catch (error) {
    console.error('Error updating adaptive difficulty:', error);
    return null;
  }
}

/**
 * Get all adaptive difficulties for a student
 */
export async function getAllAdaptiveDifficulties(
  studentId: string
): Promise<AdaptiveDifficulty[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('adaptive_difficulty')
      .select('*')
      .eq('student_id', studentId)
      .order('last_updated_at', { ascending: false });

    if (error) throw error;

    return (data || []) as AdaptiveDifficulty[];
  } catch (error) {
    console.error('Error getting all adaptive difficulties:', error);
    return [];
  }
}

/**
 * Get difficulty recommendations for a topic based on recent performance
 */
export async function getDifficultyRecommendation(
  studentId: string,
  topic: string,
  subject?: string
): Promise<{
  recommended_difficulty: DifficultyLevel;
  reason: string;
  confidence: number;
}> {
  const current = await getAdaptiveDifficulty(studentId, topic, subject);

  if (!current || current.total_attempts < 3) {
    return {
      recommended_difficulty: 'medium',
      reason: 'Not enough data - starting with medium difficulty',
      confidence: 0.5,
    };
  }

  const metrics: PerformanceMetrics = {
    total_attempts: current.total_attempts,
    correct_attempts: current.correct_attempts,
    streak_count: current.streak_count,
    recent_accuracy: current.performance_score || 0,
  };

  const recommended = calculateOptimalDifficulty(metrics);
  
  let reason = '';
  let confidence = 0.8;

  if (recommended === 'hard') {
    reason = `High accuracy (${Math.round(metrics.recent_accuracy)}%) and strong streak (${metrics.streak_count})`;
    confidence = metrics.recent_accuracy >= 85 && metrics.streak_count >= 4 ? 0.95 : 0.75;
  } else if (recommended === 'easy') {
    reason = `Low accuracy (${Math.round(metrics.recent_accuracy)}%) - focus on fundamentals`;
    confidence = metrics.recent_accuracy < 50 ? 0.95 : 0.75;
  } else {
    reason = `Moderate performance (${Math.round(metrics.recent_accuracy)}%) - maintain medium difficulty`;
    confidence = 0.8;
  }

  return {
    recommended_difficulty: recommended,
    reason,
    confidence,
  };
}

