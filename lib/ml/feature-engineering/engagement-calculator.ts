/**
 * Engagement Metrics Calculator
 * Calculates various engagement metrics from student data
 */

import type { BehavioralPattern } from "@/lib/types";

export interface EngagementMetrics {
  overall_score: number; // 0-100
  checkin_rate: number; // 0-1
  chat_activity: number; // 0-1
  ark_progress: number; // 0-1
  consistency: number; // 0-1
  trend: 'improving' | 'stable' | 'declining';
}

/**
 * Calculate engagement metrics from behavioral patterns
 */
export function calculateEngagementMetrics(
  patterns: BehavioralPattern[],
  days: number = 30
): EngagementMetrics {
  const recentPatterns = patterns.slice(0, days);

  // Check-in rate
  const checkinCount = recentPatterns.filter(
    (p) => p.daily_checkin_completed
  ).length;
  const checkinRate = checkinCount / days;

  // Chat activity (normalized)
  const totalChatMessages = recentPatterns.reduce(
    (sum, p) => sum + (p.chat_message_count || 0),
    0
  );
  const chatActivity = Math.min(totalChatMessages / (days * 5), 1); // Normalize to 5 messages per day max

  // ARK progress (normalized)
  const totalProgress = recentPatterns.reduce(
    (sum, p) => sum + (p.ark_progress_delta || 0),
    0
  );
  const arkProgress = Math.min(totalProgress / days, 1); // Normalize to 1% per day max

  // Consistency (activity days / total days)
  const activityDays = recentPatterns.filter(
    (p) =>
      p.daily_checkin_completed ||
      (p.chat_message_count || 0) > 0 ||
      (p.ark_progress_delta || 0) > 0
  ).length;
  const consistency = activityDays / days;

  // Overall score (weighted average)
  const overallScore =
    checkinRate * 0.3 +
    chatActivity * 0.2 +
    arkProgress * 0.3 +
    consistency * 0.2;

  // Calculate trend
  const firstHalf = recentPatterns.slice(0, Math.floor(days / 2));
  const secondHalf = recentPatterns.slice(Math.floor(days / 2));

  const firstHalfScore = calculateEngagementScore(firstHalf);
  const secondHalfScore = calculateEngagementScore(secondHalf);

  const scoreDiff = secondHalfScore - firstHalfScore;
  let trend: 'improving' | 'stable' | 'declining';
  if (scoreDiff > 0.1) {
    trend = 'improving';
  } else if (scoreDiff < -0.1) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  return {
    overall_score: overallScore * 100,
    checkin_rate: checkinRate,
    chat_activity: chatActivity,
    ark_progress: arkProgress,
    consistency: consistency,
    trend: trend,
  };
}

/**
 * Calculate engagement score from patterns
 */
function calculateEngagementScore(patterns: BehavioralPattern[]): number {
  if (patterns.length === 0) return 0;

  const checkinRate =
    patterns.filter((p) => p.daily_checkin_completed).length /
    patterns.length;
  const chatActivity = Math.min(
    patterns.reduce((sum, p) => sum + (p.chat_message_count || 0), 0) /
      (patterns.length * 5),
    1
  );
  const arkProgress = Math.min(
    patterns.reduce((sum, p) => sum + (p.ark_progress_delta || 0), 0) /
      patterns.length,
    1
  );

  return checkinRate * 0.3 + chatActivity * 0.2 + arkProgress * 0.5;
}


