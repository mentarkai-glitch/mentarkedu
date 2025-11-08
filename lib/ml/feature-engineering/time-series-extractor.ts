/**
 * Time-Series Feature Extractor
 * Extracts time-series features for temporal ML models
 */

import type { BehavioralPattern } from "@/lib/types";

export interface TimeSeriesFeatures {
  trends: {
    engagement_trend: number; // -1 to 1
    emotion_trend: number; // -1 to 1
    performance_trend: number; // -1 to 1
  };
  seasonality: {
    weekly_pattern: number[]; // 7 values for each day of week
    activity_by_day: Record<string, number>;
  };
  volatility: {
    engagement_volatility: number;
    emotion_volatility: number;
    performance_volatility: number;
  };
  changes: {
    recent_change_7d: number;
    recent_change_14d: number;
    recent_change_30d: number;
  };
}

/**
 * Extract time-series features from behavioral patterns
 */
export function extractTimeSeriesFeatures(
  patterns: BehavioralPattern[]
): TimeSeriesFeatures {
  // Calculate trends using linear regression
  const engagementTrend = calculateTrend(
    patterns.map((p) => p.engagement_score || 0)
  );
  const emotionTrend = calculateTrend(
    patterns.map((p) => p.avg_emotion_score || 0)
  );
  const performanceTrend = calculateTrend(
    patterns.map((p) => p.ark_progress_delta || 0)
  );

  // Calculate volatility
  const engagementVolatility = calculateVolatility(
    patterns.map((p) => p.engagement_score || 0)
  );
  const emotionVolatility = calculateVolatility(
    patterns.map((p) => p.avg_emotion_score || 0)
  );
  const performanceVolatility = calculateVolatility(
    patterns.map((p) => p.ark_progress_delta || 0)
  );

  // Calculate weekly pattern
  const weeklyPattern = calculateWeeklyPattern(patterns);

  // Calculate activity by day
  const activityByDay = calculateActivityByDay(patterns);

  // Calculate recent changes
  const recentChange7d = calculateRecentChange(patterns, 7);
  const recentChange14d = calculateRecentChange(patterns, 14);
  const recentChange30d = calculateRecentChange(patterns, 30);

  return {
    trends: {
      engagement_trend: engagementTrend,
      emotion_trend: emotionTrend,
      performance_trend: performanceTrend,
    },
    seasonality: {
      weekly_pattern: weeklyPattern,
      activity_by_day: activityByDay,
    },
    volatility: {
      engagement_volatility: engagementVolatility,
      emotion_volatility: emotionVolatility,
      performance_volatility: performanceVolatility,
    },
    changes: {
      recent_change_7d: recentChange7d,
      recent_change_14d: recentChange14d,
      recent_change_30d: recentChange30d,
    },
  };
}

/**
 * Calculate trend using linear regression slope
 */
function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;

  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, slope / 10));
}

/**
 * Calculate volatility (standard deviation)
 */
function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate weekly pattern (activity by day of week)
 */
function calculateWeeklyPattern(patterns: BehavioralPattern[]): number[] {
  const weekly = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
  const counts = [0, 0, 0, 0, 0, 0, 0];

  patterns.forEach((pattern) => {
    const date = new Date(pattern.pattern_date);
    const dayOfWeek = date.getDay();
    const activity =
      pattern.daily_checkin_completed || (pattern.chat_message_count || 0) > 0
        ? 1
        : 0;

    weekly[dayOfWeek] += activity;
    counts[dayOfWeek]++;
  });

  // Normalize
  return weekly.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : 0));
}

/**
 * Calculate activity by day name
 */
function calculateActivityByDay(
  patterns: BehavioralPattern[]
): Record<string, number> {
  const activityByDay: Record<string, number> = {};
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  dayNames.forEach((day) => {
    activityByDay[day] = 0;
  });

  patterns.forEach((pattern) => {
    const date = new Date(pattern.pattern_date);
    const dayName = dayNames[date.getDay()];
    const activity =
      pattern.daily_checkin_completed || (pattern.chat_message_count || 0) > 0
        ? 1
        : 0;

    activityByDay[dayName] = (activityByDay[dayName] || 0) + activity;
  });

  return activityByDay;
}

/**
 * Calculate recent change (comparing last N days to previous N days)
 */
function calculateRecentChange(
  patterns: BehavioralPattern[],
  days: number
): number {
  if (patterns.length < days * 2) return 0;

  const recent = patterns.slice(0, days);
  const previous = patterns.slice(days, days * 2);

  const recentAvg =
    recent.reduce((sum, p) => sum + (p.engagement_score || 0), 0) / recent.length;
  const previousAvg =
    previous.reduce((sum, p) => sum + (p.engagement_score || 0), 0) /
    previous.length;

  return recentAvg - previousAvg;
}

