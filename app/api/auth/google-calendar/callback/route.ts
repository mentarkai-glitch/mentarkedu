import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, getGoogleCalendarConfig } from "@/lib/services/google-calendar";
import { createClient } from "@/lib/supabase/server";

/**
 * Google Calendar OAuth Callback
 * Exchanges authorization code for tokens and stores them in user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    const origin = request.nextUrl.origin;

    // Handle OAuth error
    if (error) {
      console.error("Google Calendar OAuth error:", error);
      return NextResponse.redirect(`${origin}/dashboard/student/daily-assistant?error=oauth_error`);
    }

    if (!code) {
      return NextResponse.redirect(`${origin}/dashboard/student/daily-assistant?error=no_code`);
    }

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.redirect(`${origin}/auth/login?redirect=/dashboard/student/daily-assistant`);
    }

    // Exchange code for tokens
    const config = getGoogleCalendarConfig();
    const tokens = await exchangeCodeForTokens(code, config);

    // Get existing user profile data to merge
    const { data: existingUser } = await supabase
      .from("users")
      .select("profile_data")
      .eq("id", user.id)
      .single();

    // Store tokens in user's profile (merge with existing profile_data)
    const existingProfileData = existingUser?.profile_data || {};
    const { error: updateError } = await supabase.from("users").update({
      profile_data: {
        ...existingProfileData,
        google_calendar: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_in
            ? new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString()
            : null,
          token_type: tokens.token_type,
          connected_at: new Date().toISOString(),
        },
      },
    }).eq("id", user.id);

    if (updateError) {
      console.error("Failed to store Google Calendar tokens:", updateError);
      return NextResponse.redirect(
        `${origin}/dashboard/student/daily-assistant?error=token_storage_failed`
      );
    }

    // Redirect back to Daily Assistant with success
    return NextResponse.redirect(`${origin}/dashboard/student/daily-assistant?calendar_connected=true`);
  } catch (error: any) {
    console.error("Google Calendar callback error:", error);
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(`${origin}/dashboard/student/daily-assistant?error=callback_failed`);
  }
}

