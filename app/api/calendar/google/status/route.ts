import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

/**
 * Check Google Calendar connection status
 * GET /api/calendar/google/status
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
    const isConnected = !!googleCalendar?.access_token;

    // Check if token is expired
    const isExpired =
      googleCalendar?.expires_at && new Date(googleCalendar.expires_at) < new Date();

    return successResponse({
      connected: isConnected && !isExpired,
      has_refresh_token: !!googleCalendar?.refresh_token,
      connected_at: googleCalendar?.connected_at || null,
      expires_at: googleCalendar?.expires_at || null,
      needs_reconnect: isExpired && !googleCalendar?.refresh_token,
    });
  } catch (error: any) {
    console.error("Google Calendar status check error:", error);
    return errorResponse(error.message || "Failed to check calendar status", 500);
  }
}

