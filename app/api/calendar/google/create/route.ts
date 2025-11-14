import { NextRequest, NextResponse } from "next/server";
import { createEvent, refreshAccessToken, getGoogleCalendarConfig } from "@/lib/services/google-calendar";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

/**
 * Create a Google Calendar event
 * POST /api/calendar/google/create
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Authentication required", 401);
    }

    // Get user's Google Calendar tokens
    const { data: userData } = await supabase
      .from("users")
      .select("profile_data")
      .eq("id", user.id)
      .single();

    const googleCalendar = userData?.profile_data?.google_calendar;
    if (!googleCalendar?.access_token) {
      return errorResponse("Google Calendar not connected. Please connect your calendar first.", 401);
    }

    let accessToken = googleCalendar.access_token;

    // Check if token is expired and refresh if needed
    if (googleCalendar.expires_at && new Date(googleCalendar.expires_at) < new Date()) {
      if (!googleCalendar.refresh_token) {
        return errorResponse("Access token expired and no refresh token available. Please reconnect.", 401);
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
                expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
              },
            },
          })
          .eq("id", user.id);

        accessToken = newTokens.access_token;
      } catch (refreshError) {
        console.error("Failed to refresh Google Calendar token:", refreshError);
        return errorResponse("Failed to refresh access token. Please reconnect your calendar.", 401);
      }
    }

    const body = await request.json();
    const { event, calendarId = "primary" } = body;

    if (!event || !event.summary || !event.start || !event.end) {
      return errorResponse("Invalid event data. Required: summary, start, end", 400);
    }

    // Create event
    const createdEvent = await createEvent(accessToken, event, calendarId);

    return successResponse({
      event: createdEvent,
      message: "Event created successfully",
    });
  } catch (error: any) {
    console.error("Create Google Calendar event error:", error);
    return errorResponse(error.message || "Failed to create calendar event", 500);
  }
}

