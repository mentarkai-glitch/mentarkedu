/**
 * Behavioral Sequence Encoder
 * Encodes behavioral patterns into sequences for time-series ML models
 */

import type { BehavioralPattern } from "@/lib/types";

export interface BehavioralSequence {
  sequence: number[][];
  labels: string[];
  metadata: {
    student_id: string;
    start_date: string;
    end_date: string;
    sequence_length: number;
  };
}

/**
 * Encode behavioral patterns into a sequence for ML models
 */
export function encodeBehavioralSequence(
  patterns: BehavioralPattern[],
  studentId: string,
  sequenceLength: number = 30
): BehavioralSequence {
  const recentPatterns = patterns.slice(0, sequenceLength).reverse(); // Reverse to get chronological order

  // Feature vector for each day
  const sequence: number[][] = [];
  const labels: string[] = [];

  recentPatterns.forEach((pattern) => {
    const features = [
      pattern.engagement_score || 0,
      pattern.avg_emotion_score || 0,
      pattern.avg_energy_level || 0,
      pattern.daily_checkin_completed ? 1 : 0,
      pattern.chat_message_count || 0,
      pattern.ark_progress_delta || 0,
      pattern.milestone_completed_count || 0,
      pattern.xp_earned || 0,
      pattern.high_stress_days || 0,
      pattern.declining_progress_days || 0,
      pattern.intervention_count || 0,
    ];

    sequence.push(features);
    labels.push(pattern.pattern_date);
  });

  // Pad sequence if needed
  while (sequence.length < sequenceLength) {
    sequence.unshift(new Array(11).fill(0));
    labels.unshift('');
  }

  return {
    sequence: sequence,
    labels: labels,
    metadata: {
      student_id: studentId,
      start_date: labels[0] || '',
      end_date: labels[labels.length - 1] || '',
      sequence_length: sequence.length,
    },
  };
}

/**
 * Extract features for sequence models
 */
export function extractSequenceFeatures(patterns: BehavioralPattern[]): {
  engagement_sequence: number[];
  emotion_sequence: number[];
  performance_sequence: number[];
  activity_sequence: number[];
} {
  const engagementSequence = patterns.map((p) => p.engagement_score || 0);
  const emotionSequence = patterns.map((p) => p.avg_emotion_score || 0);
  const performanceSequence = patterns.map((p) => p.ark_progress_delta || 0);
  const activitySequence = patterns.map((p) =>
    p.daily_checkin_completed || (p.chat_message_count || 0) > 0 ? 1 : 0
  );

  return {
    engagement_sequence: engagementSequence,
    emotion_sequence: emotionSequence,
    performance_sequence: performanceSequence,
    activity_sequence: activitySequence,
  };
}

