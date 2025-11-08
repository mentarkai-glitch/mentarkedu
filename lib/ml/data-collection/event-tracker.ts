/**
 * Event Tracking Service
 * Tracks student actions and events for ML feature collection
 */

import { createClient } from "@/lib/supabase/server";

export type EventType =
  | "checkin_completed"
  | "checkin_skipped"
  | "ark_created"
  | "ark_completed"
  | "ark_paused"
  | "milestone_completed"
  | "milestone_started"
  | "chat_message_sent"
  | "chat_session_started"
  | "resource_viewed"
  | "resource_completed"
  | "intervention_created"
  | "intervention_acknowledged"
  | "xp_earned"
  | "badge_earned"
  | "streak_broken"
  | "streak_continued"
  | "goal_set"
  | "goal_achieved"
  | "peer_match_viewed"
  | "study_session_started"
  | "study_session_ended"
  | "doubt_asked"
  | "doubt_resolved";

export interface EventData {
  student_id: string;
  event_type: EventType;
  metadata: Record<string, any>;
  timestamp: Date;
}

/**
 * Track an event for ML data collection
 */
export async function trackEvent(
  studentId: string,
  eventType: EventType,
  metadata: Record<string, any> = {}
): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase.from("data_collection_events").insert({
      student_id: studentId,
      event_type: eventType,
      metadata: metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    // Don't throw - event tracking should not break the main flow
  }
}

/**
 * Track multiple events in batch
 */
export async function trackEvents(events: EventData[]): Promise<void> {
  const supabase = await createClient();

  try {
    const eventsToInsert = events.map((e) => ({
      student_id: e.student_id,
      event_type: e.event_type,
      metadata: e.metadata,
      timestamp: e.timestamp.toISOString(),
    }));

    await supabase.from("data_collection_events").insert(eventsToInsert);
  } catch (error) {
    console.error("Error tracking events:", error);
  }
}

/**
 * Get events for a student within a time range
 */
export async function getStudentEvents(
  studentId: string,
  startDate: Date,
  endDate: Date
): Promise<EventData[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("data_collection_events")
    .select("*")
    .eq("student_id", studentId)
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString())
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return (
    data?.map((e) => ({
      student_id: e.student_id,
      event_type: e.event_type as EventType,
      metadata: e.metadata || {},
      timestamp: new Date(e.timestamp),
    })) || []
  );
}

