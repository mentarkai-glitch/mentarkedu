/**
 * Behavioral Pattern Aggregator
 * Aggregates events and data into behavioral patterns for ML training
 */

import { createClient } from "@/lib/supabase/server";
import type { BehavioralPattern } from "@/lib/types";
import { getStudentEvents, type EventType } from "./event-tracker";

/**
 * Aggregate behavioral patterns from events and database data
 */
export async function aggregateBehavioralPatterns(
  studentId: string,
  startDate: Date,
  endDate: Date
): Promise<BehavioralPattern[]> {
  const supabase = await createClient();
  const patterns: BehavioralPattern[] = [];

  // Get daily check-ins
  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("student_id", studentId)
    .gte("date", startDate.toISOString().split("T")[0])
    .lte("date", endDate.toISOString().split("T")[0])
    .order("date", { ascending: false });

  // Get events
  const events = await getStudentEvents(studentId, startDate, endDate);

  // Get ARK progress data
  const { data: arks } = await supabase
    .from("arks")
    .select("id, progress, updated_at")
    .eq("student_id", studentId);

  // Get chat data
  const { data: messages } = await supabase
    .from("messages")
    .select("content, timestamp, session_id")
    .in(
      "session_id",
      (
        await supabase
          .from("chat_sessions")
          .select("id")
          .eq("user_id", studentId)
      ).data?.map((s) => s.id) || []
    )
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString());

  // Group by date
  const dateMap = new Map<string, Partial<BehavioralPattern>>();

  // Process check-ins
  checkins?.forEach((checkin) => {
    const date = checkin.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        pattern_date: date,
        engagement_score: 0,
        avg_emotion_score: 0,
        avg_energy_level: checkin.energy,
        daily_checkin_completed: true,
        chat_message_count: 0,
        ark_progress_delta: 0,
        milestone_completed_count: 0,
        xp_earned: 0,
        high_stress_days: 0,
        declining_progress_days: 0,
        intervention_count: 0,
        avg_progress_rating: 0,
      });
    }

    const pattern = dateMap.get(date)!;
    pattern.avg_emotion_score = mapEmotionToScore(checkin.emotion);
    pattern.avg_energy_level = checkin.energy;
    pattern.daily_checkin_completed = true;
  });

  // Process events
  events.forEach((event) => {
    const date = event.timestamp.toISOString().split("T")[0];
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        pattern_date: date,
        engagement_score: 0,
        avg_emotion_score: 0,
        avg_energy_level: 0,
        daily_checkin_completed: false,
        chat_message_count: 0,
        ark_progress_delta: 0,
        milestone_completed_count: 0,
        xp_earned: 0,
        high_stress_days: 0,
        declining_progress_days: 0,
        intervention_count: 0,
        avg_progress_rating: 0,
      });
    }

    const pattern = dateMap.get(date)!;

    switch (event.event_type) {
      case "chat_message_sent":
        pattern.chat_message_count = (pattern.chat_message_count || 0) + 1;
        break;
      case "milestone_completed":
        pattern.milestone_completed_count =
          (pattern.milestone_completed_count || 0) + 1;
        break;
      case "xp_earned":
        pattern.xp_earned =
          (pattern.xp_earned || 0) + (event.metadata.amount || 0);
        break;
      case "intervention_created":
        pattern.intervention_count = (pattern.intervention_count || 0) + 1;
        break;
    }
  });

  // Process messages for chat activity
  messages?.forEach((message) => {
    const date = message.timestamp.split("T")[0];
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        pattern_date: date,
        engagement_score: 0,
        avg_emotion_score: 0,
        avg_energy_level: 0,
        daily_checkin_completed: false,
        chat_message_count: 0,
        ark_progress_delta: 0,
        milestone_completed_count: 0,
        xp_earned: 0,
        high_stress_days: 0,
        declining_progress_days: 0,
        intervention_count: 0,
        avg_progress_rating: 0,
      });
    }

    const pattern = dateMap.get(date)!;
    pattern.chat_message_count = (pattern.chat_message_count || 0) + 1;
    // This would need to be calculated separately if needed
  });

  // Calculate engagement scores and other derived metrics
  for (const [date, pattern] of dateMap.entries()) {
    // Ensure all required fields are present
    const fullPattern: BehavioralPattern = {
      id: '', // Will be set by database
      student_id: studentId,
      pattern_date: pattern.pattern_date || date,
      daily_checkin_completed: pattern.daily_checkin_completed || false,
      chat_message_count: pattern.chat_message_count || 0,
      ark_progress_delta: pattern.ark_progress_delta || 0,
      avg_energy_level: pattern.avg_energy_level || 0,
      avg_emotion_score: pattern.avg_emotion_score || 0,
      avg_progress_rating: pattern.avg_progress_rating || 0,
      engagement_score: calculateEngagementScore(pattern),
      wellbeing_score: 0, // Calculate if needed
      performance_score: 0, // Calculate if needed
      missed_checkin_streak: 0, // Calculate if needed
      declining_progress_days: pattern.declining_progress_days || 0,
      high_stress_days: pattern.high_stress_days || 0,
      xp_earned: pattern.xp_earned,
      milestone_completed_count: pattern.milestone_completed_count,
      intervention_count: pattern.intervention_count,
    };
    patterns.push(fullPattern);
  }

  // Sort by date descending
  patterns.sort(
    (a, b) => new Date(b.pattern_date).getTime() - new Date(a.pattern_date).getTime()
  );

  return patterns;
}

/**
 * Calculate engagement score from pattern data
 */
function calculateEngagementScore(
  pattern: Partial<BehavioralPattern>
): number {
  let score = 0;

  // Check-in completion: 30 points
  if (pattern.daily_checkin_completed) {
    score += 30;
  }

  // Chat activity: up to 20 points
  const chatScore = Math.min((pattern.chat_message_count || 0) * 2, 20);
  score += chatScore;

  // ARK progress: up to 30 points
  const progressScore = Math.min((pattern.ark_progress_delta || 0) * 10, 30);
  score += progressScore;

  // Milestone completion: up to 20 points
  const milestoneScore = Math.min(
    (pattern.milestone_completed_count || 0) * 10,
    20
  );
  score += milestoneScore;

  return Math.min(score, 100);
}

/**
 * Map emotion text to numeric score
 */
function mapEmotionToScore(emotion: string): number {
  const emotionMap: Record<string, number> = {
    happy: 0.8,
    excited: 0.9,
    calm: 0.6,
    neutral: 0.5,
    sad: 0.2,
    anxious: 0.3,
    stressed: 0.2,
    angry: 0.1,
    frustrated: 0.2,
  };

  return emotionMap[emotion.toLowerCase()] || 0.5;
}

