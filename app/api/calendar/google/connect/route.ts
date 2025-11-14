import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, getGoogleCalendarConfig } from "@/lib/services/google-calendar";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

/**
 * Initiate Google Calendar OAuth flow
 * GET /api/calendar/google/connect
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

    const config = getGoogleCalendarConfig();
    const state = `${user.id}-${Date.now()}`; // Include user ID in state for security
    
    // Generate OAuth URL
    const authUrl = getGoogleAuthUrl(config, state);

    return successResponse({
      auth_url: authUrl,
      redirect_uri: config.redirectUri,
    });
  } catch (error: any) {
    console.error("Google Calendar connect error:", error);
    return errorResponse(error.message || "Failed to initiate OAuth flow", 500);
  }
}

