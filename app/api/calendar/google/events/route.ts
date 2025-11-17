import { NextRequest, NextResponse } from "next/server";
import { getEvents, refreshAccessToken, getGoogleCalendarConfig } from "@/lib/services/google-calendar";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

/**
 * Get Google Calendar events
 * GET /api/calendar/google/events?calendarId=primary&timeMin=...&timeMax=...
 */
export async function GET(request: NextRequest) {
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
                expires_at: newTokens.expires_in 
                  ? new Date(Date.now() + (newTokens.expires_in || 3600) * 1000).toISOString()
                  : googleCalendar.expires_at,
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const calendarId = searchParams.get("calendarId") || "primary";
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");
    const maxResults = searchParams.get("maxResults") ? parseInt(searchParams.get("maxResults")!) : 50;

    // Fetch events
    const events = await getEvents(accessToken, calendarId, {
      timeMin: timeMin || undefined,
      timeMax: timeMax || undefined,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return successResponse({
      events,
      calendar_id: calendarId,
      count: events.length,
    });
  } catch (error: any) {
    console.error("Get Google Calendar events error:", error);
    return errorResponse(error.message || "Failed to fetch calendar events", 500);
  }
}

