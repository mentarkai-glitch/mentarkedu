/**
 * Feature Extraction Service
 * Extracts ML features from existing student data for model training
 */

import { createClient } from "@/lib/supabase/server";
import type { BehavioralPattern } from "@/lib/types";

export interface MLFeatureVector {
  student_id: string;
  timestamp: Date;
  features: {
    // Engagement features
    engagement: {
      checkin_completion_rate_30d: number;
      checkin_completion_rate_7d: number;
      current_streak: number;
      longest_streak: number;
      streak_break_count: number;
      chat_message_count_30d: number;
      chat_session_count_30d: number;
      avg_chat_message_length: number;
    };
    // Emotional features
    emotional: {
      avg_emotion_score_30d: number;
      avg_emotion_score_7d: number;
      emotion_volatility: number;
      avg_energy_level_30d: number;
      avg_energy_level_7d: number;
      stress_days_count_30d: number;
      low_energy_days_count_30d: number;
      emotion_trend: number; // -1 to 1 (declining to improving)
    };
    // Performance features
    performance: {
      ark_progress_rate_30d: number;
      ark_progress_rate_7d: number;
      completed_arks_count: number;
      active_arks_count: number;
      milestone_completion_rate: number;
      xp_earned_30d: number;
      xp_earned_7d: number;
      xp_earning_rate: number;
      level: number;
      progress_decline_days_30d: number;
    };
    // Behavioral features
    behavioral: {
      consistency_score: number;
      activity_days_count_30d: number;
      activity_days_count_7d: number;
      avg_daily_activity_time: number;
      peak_activity_hour: number;
      weekend_activity_ratio: number;
      behavioral_change_score: number;
    };
    // Profile features
    profile: {
      grade_level: number;
      motivation_level: number;
      confidence_level: number;
      stress_level: number;
      has_onboarding: boolean;
      days_since_onboarding: number;
      interests_count: number;
      goals_count: number;
    };
    // Social features
    social: {
      intervention_count_30d: number;
      peer_match_count: number;
      social_engagement_score: number;
    };
  };
  metadata: {
    feature_version: string;
    extraction_timestamp: Date;
  };
}

/**
 * Extract features from student behavioral patterns and profile
 */
export async function extractFeatures(
  studentId: string,
  behavioralPatterns: BehavioralPattern[],
  studentProfile: any
): Promise<MLFeatureVector> {
  const supabase = await createClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter patterns by date
  const patterns30d = behavioralPatterns.filter(
    (p) => new Date(p.pattern_date) >= thirtyDaysAgo
  );
  const patterns7d = behavioralPatterns.filter(
    (p) => new Date(p.pattern_date) >= sevenDaysAgo
  );

  // Extract engagement features
  const engagementFeatures = extractEngagementFeatures(
    patterns30d,
    patterns7d,
    studentId
  );

  // Extract emotional features
  const emotionalFeatures = extractEmotionalFeatures(patterns30d, patterns7d);

  // Extract performance features
  const performanceFeatures = await extractPerformanceFeatures(
    studentId,
    patterns30d,
    patterns7d
  );

  // Extract behavioral features
  const behavioralFeatures = extractBehavioralFeatures(patterns30d, patterns7d);

  // Extract profile features
  const profileFeatures = extractProfileFeatures(studentProfile);

  // Extract social features
  const socialFeatures = await extractSocialFeatures(studentId, patterns30d);

  return {
    student_id: studentId,
    timestamp: now,
    features: {
      engagement: engagementFeatures,
      emotional: emotionalFeatures,
      performance: performanceFeatures,
      behavioral: behavioralFeatures,
      profile: profileFeatures,
      social: socialFeatures,
    },
    metadata: {
      feature_version: "1.0.0",
      extraction_timestamp: now,
    },
  };
}

/**
 * Extract engagement-related features
 */
function extractEngagementFeatures(
  patterns30d: BehavioralPattern[],
  patterns7d: BehavioralPattern[],
  studentId: string
) {
  const checkinCount30d = patterns30d.filter(
    (p) => p.daily_checkin_completed
  ).length;
  const checkinCount7d = patterns7d.filter(
    (p) => p.daily_checkin_completed
  ).length;

  // Calculate streaks (using pattern_date instead of date)
  const streaks = calculateStreaks(patterns30d);
  const streakBreaks = calculateStreakBreaks(patterns30d);

  // Chat activity
  const chatMessages30d = patterns30d.reduce(
    (sum, p) => sum + (p.chat_message_count || 0),
    0
  );
  const chatSessions30d = new Set(
    patterns30d
      .filter((p) => (p.chat_message_count || 0) > 0)
      .map((p) => p.pattern_date)
  ).size;

  // Average message length is not available in BehavioralPattern type
  // Using a placeholder calculation based on chat activity
  const avgMessageLength = chatMessages30d > 0 ? 50 : 0; // Placeholder: assume 50 chars per message

  return {
    checkin_completion_rate_30d: checkinCount30d / 30,
    checkin_completion_rate_7d: checkinCount7d / 7,
    current_streak: streaks.current,
    longest_streak: streaks.longest,
    streak_break_count: streakBreaks,
    chat_message_count_30d: chatMessages30d,
    chat_session_count_30d: chatSessions30d,
    avg_chat_message_length: avgMessageLength, // This is a calculated feature, not from BehavioralPattern
  };
}

/**
 * Extract emotional features
 */
function extractEmotionalFeatures(
  patterns30d: BehavioralPattern[],
  patterns7d: BehavioralPattern[]
) {
  const emotionScores30d = patterns30d.map((p) => p.avg_emotion_score || 0);
  const emotionScores7d = patterns7d.map((p) => p.avg_emotion_score || 0);
  const energyLevels30d = patterns30d.map((p) => p.avg_energy_level || 0);
  const energyLevels7d = patterns7d.map((p) => p.avg_energy_level || 0);

  const avgEmotion30d =
    emotionScores30d.length > 0
      ? emotionScores30d.reduce((a, b) => a + b, 0) / emotionScores30d.length
      : 0;
  const avgEmotion7d =
    emotionScores7d.length > 0
      ? emotionScores7d.reduce((a, b) => a + b, 0) / emotionScores7d.length
      : 0;

  const emotionVolatility = calculateVolatility(emotionScores30d);

  const avgEnergy30d =
    energyLevels30d.length > 0
      ? energyLevels30d.reduce((a, b) => a + b, 0) / energyLevels30d.length
      : 0;
  const avgEnergy7d =
    energyLevels7d.length > 0
      ? energyLevels7d.reduce((a, b) => a + b, 0) / energyLevels7d.length
      : 0;

  const stressDays = patterns30d.filter((p) => (p.high_stress_days || 0) > 0)
    .length;
  const lowEnergyDays = patterns30d.filter(
    (p) => (p.avg_energy_level || 0) < 2
  ).length;

  // Calculate trend (improving = positive, declining = negative)
  const emotionTrend =
    emotionScores7d.length > 0 && emotionScores30d.length > 7
      ? avgEmotion7d -
        emotionScores30d
          .slice(0, emotionScores30d.length - 7)
          .reduce((a, b) => a + b, 0) /
          (emotionScores30d.length - 7)
      : 0;

  return {
    avg_emotion_score_30d: avgEmotion30d,
    avg_emotion_score_7d: avgEmotion7d,
    emotion_volatility: emotionVolatility,
    avg_energy_level_30d: avgEnergy30d,
    avg_energy_level_7d: avgEnergy7d,
    stress_days_count_30d: stressDays,
    low_energy_days_count_30d: lowEnergyDays,
    emotion_trend: emotionTrend,
  };
}

/**
 * Extract performance features
 */
async function extractPerformanceFeatures(
  studentId: string,
  patterns30d: BehavioralPattern[],
  patterns7d: BehavioralPattern[]
) {
  const supabase = await createClient();

  // Get ARK data
  const { data: arks } = await supabase
    .from("arks")
    .select("id, progress, status, created_at")
    .eq("student_id", studentId);

  const completedArks = arks?.filter((a) => a.status === "completed") || [];
  const activeArks = arks?.filter((a) => a.status === "active") || [];

  // Calculate progress rates
  const progressDeltas30d = patterns30d.map((p) => p.ark_progress_delta || 0);
  const progressDeltas7d = patterns7d.map((p) => p.ark_progress_delta || 0);

  const progressRate30d =
    progressDeltas30d.length > 0
      ? progressDeltas30d.reduce((a, b) => a + b, 0) / progressDeltas30d.length
      : 0;
  const progressRate7d =
    progressDeltas7d.length > 0
      ? progressDeltas7d.reduce((a, b) => a + b, 0) / progressDeltas7d.length
      : 0;

  // Get milestone completion
  const { data: milestones } = await supabase
    .from("ark_milestones")
    .select("id, completed")
    .in(
      "ark_id",
      arks?.map((a) => a.id) || []
    );

  const completedMilestones =
    milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = milestones?.length || 1;
  const milestoneCompletionRate = completedMilestones / totalMilestones;

  // Get XP data
  const { data: xpTransactions } = await supabase
    .from("xp_transactions")
    .select("amount, created_at")
    .eq("student_id", studentId)
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const xp30d = xpTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const xp7d =
    xpTransactions
      ?.filter(
        (t) =>
          new Date(t.created_at) >=
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .reduce((sum, t) => sum + t.amount, 0) || 0;

  // Get level
  const { data: stats } = await supabase
    .from("student_stats")
    .select("level")
    .eq("user_id", studentId)
    .single();

  const progressDeclineDays = patterns30d.filter(
    (p) => (p.declining_progress_days || 0) > 0
  ).length;

  return {
    ark_progress_rate_30d: progressRate30d,
    ark_progress_rate_7d: progressRate7d,
    completed_arks_count: completedArks.length,
    active_arks_count: activeArks.length,
    milestone_completion_rate: milestoneCompletionRate,
    xp_earned_30d: xp30d,
    xp_earned_7d: xp7d,
    xp_earning_rate: xp30d / 30,
    level: stats?.level || 1,
    progress_decline_days_30d: progressDeclineDays,
  };
}

/**
 * Extract behavioral features
 */
function extractBehavioralFeatures(
  patterns30d: BehavioralPattern[],
  patterns7d: BehavioralPattern[]
) {
  const activityDays30d = patterns30d.filter(
    (p) =>
      p.daily_checkin_completed ||
      (p.chat_message_count || 0) > 0 ||
      (p.ark_progress_delta || 0) > 0
  ).length;
  const activityDays7d = patterns7d.filter(
    (p) =>
      p.daily_checkin_completed ||
      (p.chat_message_count || 0) > 0 ||
      (p.ark_progress_delta || 0) > 0
  ).length;

  const consistencyScore = activityDays30d / 30;

  // Calculate peak activity hour (simplified - would need timestamp data)
  const peakActivityHour = 14; // Default to 2 PM

  // Calculate weekend activity ratio
  const weekendDays = patterns30d.filter((p) => {
    const day = new Date(p.pattern_date).getDay();
    return day === 0 || day === 6;
  }).length;
  const weekendActivity = patterns30d
    .filter((p) => {
      const day = new Date(p.pattern_date).getDay();
      return (day === 0 || day === 6) && p.daily_checkin_completed;
    })
    .length;
  const weekendActivityRatio =
    weekendDays > 0 ? weekendActivity / weekendDays : 0;

  // Behavioral change score (comparing first half vs second half of 30 days)
  const firstHalf = patterns30d.slice(0, Math.floor(patterns30d.length / 2));
  const secondHalf = patterns30d.slice(Math.floor(patterns30d.length / 2));

  const firstHalfActivity = firstHalf.filter((p) => p.daily_checkin_completed)
    .length;
  const secondHalfActivity = secondHalf.filter((p) => p.daily_checkin_completed)
    .length;

  const behavioralChangeScore =
    firstHalf.length > 0
      ? (secondHalfActivity - firstHalfActivity) / firstHalf.length
      : 0;

  return {
    consistency_score: consistencyScore,
    activity_days_count_30d: activityDays30d,
    activity_days_count_7d: activityDays7d,
    avg_daily_activity_time: 2.5, // Placeholder - would need actual time data
    peak_activity_hour: peakActivityHour,
    weekend_activity_ratio: weekendActivityRatio,
    behavioral_change_score: behavioralChangeScore,
  };
}

/**
 * Extract profile features
 */
function extractProfileFeatures(studentProfile: any) {
  const onboardingProfile = studentProfile?.onboarding_profile || {};
  const grade = studentProfile?.grade || "10";
  const gradeLevel = parseInt(grade) || 10;

  const onboardingDate = studentProfile?.onboarding_completed_at
    ? new Date(studentProfile.onboarding_completed_at)
    : null;
  const daysSinceOnboarding = onboardingDate
    ? Math.floor(
        (Date.now() - onboardingDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return {
    grade_level: gradeLevel,
    motivation_level: onboardingProfile.motivation_level || 7,
    confidence_level: onboardingProfile.confidence_level || 6,
    stress_level: onboardingProfile.stress_level || 5,
    has_onboarding: !!onboardingProfile,
    days_since_onboarding: daysSinceOnboarding,
    interests_count: studentProfile?.interests?.length || 0,
    goals_count: studentProfile?.goals?.length || 0,
  };
}

/**
 * Extract social features
 */
async function extractSocialFeatures(
  studentId: string,
  patterns30d: BehavioralPattern[]
) {
  const supabase = await createClient();

  // Get intervention count
  const { count: interventionCount } = await supabase
    .from("interventions")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .gte(
      "created_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    );

  // Get peer matches
  const { count: peerMatchCount } = await supabase
    .from("peer_matches")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId);

  // Social engagement score (based on interventions and peer interactions)
  const socialEngagementScore =
    (interventionCount || 0) > 0 || (peerMatchCount || 0) > 0 ? 0.5 : 0;

  return {
    intervention_count_30d: interventionCount || 0,
    peer_match_count: peerMatchCount || 0,
    social_engagement_score: socialEngagementScore,
  };
}

/**
 * Helper functions
 */
function calculateStreaks(patterns: BehavioralPattern[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date descending (most recent first)
  const sorted = [...patterns]
    .filter((p) => p.daily_checkin_completed)
    .sort((a, b) => new Date(b.pattern_date).getTime() - new Date(a.pattern_date).getTime());

  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      currentStreak = 1;
      tempStreak = 1;
    } else {
      const prevDate = new Date(sorted[i - 1].pattern_date);
      const currDate = new Date(sorted[i].pattern_date);
      const daysDiff =
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff === 1) {
        if (i === 1) currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

function calculateStreakBreaks(patterns: BehavioralPattern[]) {
  const sorted = [...patterns].sort(
    (a, b) => new Date(a.pattern_date).getTime() - new Date(b.pattern_date).getTime()
  );
  let breaks = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].pattern_date);
    const currDate = new Date(sorted[i].pattern_date);
    const daysDiff =
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (
      daysDiff > 1 &&
      sorted[i - 1].daily_checkin_completed &&
      !sorted[i].daily_checkin_completed
    ) {
      breaks++;
    }
  }

  return breaks;
}

function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

