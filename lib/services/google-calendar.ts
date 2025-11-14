/**
 * Google Calendar Service
 * Handles OAuth authentication and calendar operations
 */

import axios from "axios";

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
}

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Get Google OAuth authorization URL
 */
export function getGoogleAuthUrl(config: GoogleCalendarConfig, state?: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForTokens(
  code: string,
  config: GoogleCalendarConfig
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}> {
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });

  return response.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  config: GoogleCalendarConfig
): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
}> {
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  return response.data;
}

/**
 * Get user's calendars
 */
export async function getCalendars(accessToken: string): Promise<any[]> {
  const response = await axios.get("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.items || [];
}

/**
 * Get events from a calendar
 */
export async function getEvents(
  accessToken: string,
  calendarId: string = "primary",
  options?: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: "startTime" | "updated";
  }
): Promise<any[]> {
  const params: Record<string, any> = {
    ...(options?.timeMin && { timeMin: options.timeMin }),
    ...(options?.timeMax && { timeMax: options.timeMax }),
    ...(options?.maxResults && { maxResults: options.maxResults }),
    ...(options?.singleEvents !== undefined && { singleEvents: options.singleEvents }),
    ...(options?.orderBy && { orderBy: options.orderBy }),
  };

  const response = await axios.get(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    }
  );

  return response.data.items || [];
}

/**
 * Create a calendar event
 */
export async function createEvent(
  accessToken: string,
  event: GoogleCalendarEvent,
  calendarId: string = "primary"
): Promise<any> {
  const response = await axios.post(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    event,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/**
 * Update a calendar event
 */
export async function updateEvent(
  accessToken: string,
  eventId: string,
  event: Partial<GoogleCalendarEvent>,
  calendarId: string = "primary"
): Promise<any> {
  const response = await axios.put(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    event,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(
  accessToken: string,
  eventId: string,
  calendarId: string = "primary"
): Promise<void> {
  await axios.delete(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}

/**
 * Get Google Calendar configuration from environment
 */
export function getGoogleCalendarConfig(): GoogleCalendarConfig {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET || "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3002";
  const redirectUri = `${baseUrl}/api/auth/google-calendar/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  };
}

