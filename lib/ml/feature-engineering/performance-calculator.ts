/**
 * Performance Trend Calculator
 * Calculates performance trends and metrics from student data
 */

import type { BehavioralPattern } from "@/lib/types";

export interface PerformanceTrend {
  overall_score: number; // 0-100
  progress_rate: number; // Average progress per day
  completion_rate: number; // 0-1
  trend: 'improving' | 'stable' | 'declining';
  decline_days: number;
  acceleration: number; // Rate of change in progress
}

/**
 * Calculate performance trends from behavioral patterns
 */
export function calculatePerformanceTrend(
  patterns: BehavioralPattern[],
  days: number = 30
): PerformanceTrend {
  const recentPatterns = patterns.slice(0, days);

  // Calculate progress rate
  const progressDeltas = recentPatterns.map((p) => p.ark_progress_delta || 0);
  const progressRate =
    progressDeltas.length > 0
      ? progressDeltas.reduce((a, b) => a + b, 0) / progressDeltas.length
      : 0;

  // Calculate completion rate (milestones completed)
  const totalMilestones = recentPatterns.reduce(
    (sum, p) => sum + (p.milestone_completed_count || 0),
    0
  );
  const completionRate = Math.min(totalMilestones / days, 1); // Normalize

  // Count decline days
  const declineDays = recentPatterns.filter(
    (p) => (p.declining_progress_days || 0) > 0
  ).length;

  // Calculate trend
  const firstHalf = recentPatterns.slice(0, Math.floor(days / 2));
  const secondHalf = recentPatterns.slice(Math.floor(days / 2));

  const firstHalfProgress =
    firstHalf.length > 0
      ? firstHalf
          .map((p) => p.ark_progress_delta || 0)
          .reduce((a, b) => a + b, 0) / firstHalf.length
      : 0;
  const secondHalfProgress =
    secondHalf.length > 0
      ? secondHalf
          .map((p) => p.ark_progress_delta || 0)
          .reduce((a, b) => a + b, 0) / secondHalf.length
      : 0;

  const progressDiff = secondHalfProgress - firstHalfProgress;
  let trend: 'improving' | 'stable' | 'declining';
  if (progressDiff > 0.01) {
    trend = 'improving';
  } else if (progressDiff < -0.01) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Calculate acceleration (second derivative)
  const acceleration = progressDiff / (days / 2);

  // Overall score
  const overallScore =
    Math.max(0, Math.min(100, progressRate * 100 * 0.6 + completionRate * 100 * 0.4));

  return {
    overall_score: overallScore,
    progress_rate: progressRate,
    completion_rate: completionRate,
    trend: trend,
    decline_days: declineDays,
    acceleration: acceleration,
  };
}


