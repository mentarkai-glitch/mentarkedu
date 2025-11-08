/**
 * Emotional Pattern Analyzer
 * Analyzes emotional patterns from check-ins and behavioral data
 */

import type { BehavioralPattern } from "@/lib/types";

export interface EmotionalPattern {
  avg_score: number; // -1 to 1
  volatility: number; // 0 to 1
  trend: 'improving' | 'stable' | 'declining';
  stress_days: number;
  low_energy_days: number;
  emotional_stability: number; // 0-1
}

/**
 * Analyze emotional patterns from behavioral data
 */
export function analyzeEmotionalPatterns(
  patterns: BehavioralPattern[],
  days: number = 30
): EmotionalPattern {
  const recentPatterns = patterns.slice(0, days);

  // Calculate average emotion score
  const emotionScores = recentPatterns
    .map((p) => p.avg_emotion_score || 0)
    .filter((s) => s > 0);
  const avgScore =
    emotionScores.length > 0
      ? emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length
      : 0;

  // Calculate volatility (standard deviation)
  const volatility = calculateVolatility(emotionScores);

  // Calculate trend
  const firstHalf = recentPatterns.slice(0, Math.floor(days / 2));
  const secondHalf = recentPatterns.slice(Math.floor(days / 2));

  const firstHalfAvg =
    firstHalf.length > 0
      ? firstHalf
          .map((p) => p.avg_emotion_score || 0)
          .filter((s) => s > 0)
          .reduce((a, b) => a + b, 0) / firstHalf.length
      : 0;
  const secondHalfAvg =
    secondHalf.length > 0
      ? secondHalf
          .map((p) => p.avg_emotion_score || 0)
          .filter((s) => s > 0)
          .reduce((a, b) => a + b, 0) / secondHalf.length
      : 0;

  const scoreDiff = secondHalfAvg - firstHalfAvg;
  let trend: 'improving' | 'stable' | 'declining';
  if (scoreDiff > 0.1) {
    trend = 'improving';
  } else if (scoreDiff < -0.1) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Count stress and low energy days
  const stressDays = recentPatterns.filter(
    (p) => (p.high_stress_days || 0) > 0
  ).length;
  const lowEnergyDays = recentPatterns.filter(
    (p) => (p.avg_energy_level || 0) < 2
  ).length;

  // Emotional stability (inverse of volatility, normalized)
  const emotionalStability = Math.max(0, 1 - volatility * 2);

  return {
    avg_score: avgScore,
    volatility: volatility,
    trend: trend,
    stress_days: stressDays,
    low_energy_days: lowEnergyDays,
    emotional_stability: emotionalStability,
  };
}

/**
 * Calculate volatility (standard deviation) of values
 */
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}


