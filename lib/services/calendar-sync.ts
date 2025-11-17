/**
 * Calendar Sync Service
 * Syncs Daily Assistant tasks with Google Calendar
 */

import { createClient } from "@/lib/supabase/server";
import { createEvent, updateEvent, deleteEvent, refreshAccessToken, getGoogleCalendarConfig } from "@/lib/services/google-calendar";
import type { DailyAgendaItem } from "@/lib/types";

/**
 * Get Google Calendar access token for user
 */
export async function getGoogleCalendarToken(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase
    .from("users")
    .select("profile_data")
    .eq("id", userId)
    .single();

  const googleCalendar = userData?.profile_data?.google_calendar;
  if (!googleCalendar?.access_token) {
    return null;
  }

  let accessToken = googleCalendar.access_token;

  // Check if token is expired and refresh if needed
  if (googleCalendar.expires_at && new Date(googleCalendar.expires_at) < new Date()) {
    if (!googleCalendar.refresh_token) {
      return null;
    }

    try {
      const config = getGoogleCalendarConfig();
      const newTokens = await refreshAccessToken(googleCalendar.refresh_token, config);

      // Update stored tokens
      await supabase
        .from("users")
        .update({
          profile_data: {
            ...userData?.profile_data,
            google_calendar: {
              ...googleCalendar,
              access_token: newTokens.access_token,
              expires_at: newTokens.expires_in 
                ? new Date(Date.now() + (newTokens.expires_in || 3600) * 1000).toISOString()
                : googleCalendar.expires_at,
            },
          },
        })
        .eq("id", userId);

      accessToken = newTokens.access_token;
    } catch (error) {
      console.error("Failed to refresh Google Calendar token:", error);
      return null;
    }
  }

  return accessToken;
}

/**
 * Create calendar event from agenda item
 */
export async function createCalendarEventFromTask(
  agendaItem: DailyAgendaItem,
  accessToken: string,
  calendarId: string = "primary"
): Promise<string | null> {
  try {
    if (!agendaItem.start_at || !agendaItem.end_at) {
      return null; // Skip tasks without start/end times
    }

    const event = {
      summary: agendaItem.title,
      description: agendaItem.description || `Task from Mentark Daily Assistant\nCategory: ${agendaItem.category || "General"}\nPriority: ${agendaItem.priority || 0}`,
      start: {
        dateTime: agendaItem.start_at,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: agendaItem.end_at,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 15 },
          { method: "email", minutes: 30 },
        ],
      },
    };

    const createdEvent = await createEvent(accessToken, event, calendarId);
    return createdEvent.id || null;
  } catch (error) {
    console.error("Failed to create calendar event:", error);
    return null;
  }
}

/**
 * Update calendar event from agenda item
 */
export async function updateCalendarEventFromTask(
  agendaItem: DailyAgendaItem,
  calendarEventId: string,
  accessToken: string,
  calendarId: string = "primary"
): Promise<boolean> {
  try {
    const eventUpdate: any = {
      summary: agendaItem.title,
      description: agendaItem.description || `Task from Mentark Daily Assistant\nCategory: ${agendaItem.category || "General"}\nPriority: ${agendaItem.priority || 0}`,
    };

    if (agendaItem.start_at && agendaItem.end_at) {
      eventUpdate.start = {
        dateTime: agendaItem.start_at,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      eventUpdate.end = {
        dateTime: agendaItem.end_at,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    // Update status in description if completed
    if (agendaItem.status === "completed") {
      eventUpdate.description = `${eventUpdate.description}\n\n✅ Status: Completed`;
    }

    await updateEvent(accessToken, calendarId || 'primary', calendarEventId, eventUpdate);
    return true;
  } catch (error) {
    console.error("Failed to update calendar event:", error);
    return false;
  }
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEventFromTask(
  calendarEventId: string,
  accessToken: string,
  calendarId: string = "primary"
): Promise<boolean> {
  try {
    await deleteEvent(accessToken, calendarEventId, calendarId);
    return true;
  } catch (error) {
    console.error("Failed to delete calendar event:", error);
    return false;
  }
}

/**
 * Store calendar event ID in agenda item metadata
 */
export async function linkAgendaItemToCalendar(
  agendaItemId: string,
  calendarEventId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: existingItem } = await supabase
      .from("daily_agenda_items")
      .select("metadata")
      .eq("id", agendaItemId)
      .single();

    const metadata = existingItem?.metadata || {};
    
    const { error } = await supabase
      .from("daily_agenda_items")
      .update({
        metadata: {
          ...metadata,
          google_calendar_event_id: calendarEventId,
        },
      })
      .eq("id", agendaItemId);

    return !error;
  } catch (error) {
    console.error("Failed to link agenda item to calendar:", error);
    return false;
  }
}

