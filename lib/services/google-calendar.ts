/**
 * Google Calendar Integration Service
 * Creates calendar events for ARK tasks and milestones
 */

import { google } from 'googleapis';
import axios from 'axios';

interface CalendarTask {
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  durationHours?: number;
  location?: string;
  reminders?: {
    minutes: number[];
  };
  colorId?: string; // Google Calendar color ID (1-11)
  ark_id?: string;
  milestone_id?: string;
  task_id?: string;
}

interface CalendarCredentials {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
}

/**
 * Initialize Google Calendar API client
 */
function getCalendarClient(credentials: CalendarCredentials) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token,
    expiry_date: credentials.expiry_date
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Create calendar events for ARK tasks
 */
export async function createARKCalendarEvents(
  credentials: CalendarCredentials,
  calendarId: string,
  tasks: CalendarTask[]
): Promise<{ created: number; failed: number; eventIds: string[] }> {
  try {
    const calendar = getCalendarClient(credentials);
    const eventIds: string[] = [];
    let created = 0;
    let failed = 0;

    for (const task of tasks) {
      try {
        // Calculate end time
        const startDate = new Date(task.startDate);
        const durationMs = (task.durationHours || 1) * 60 * 60 * 1000;
        const endDate = task.endDate ? new Date(task.endDate) : new Date(startDate.getTime() + durationMs);

        // Build description
        let description = task.description || '';
        if (task.ark_id) {
          description += `\n\nARK ID: ${task.ark_id}`;
        }
        if (task.milestone_id) {
          description += `\nMilestone ID: ${task.milestone_id}`;
        }
        if (task.task_id) {
          description += `\nTask ID: ${task.task_id}`;
        }
        description += `\n\nView ARK: ${process.env.NEXT_PUBLIC_APP_URL || 'https://mentark.in'}/ark/${task.ark_id || ''}`;

        // Create event
        const event = {
          summary: task.title,
          description: description,
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'Asia/Kolkata', // Default to IST
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'Asia/Kolkata',
          },
          location: task.location,
          colorId: task.colorId || '1', // Default color
          reminders: {
            useDefault: false,
            overrides: (task.reminders?.minutes || [1440, 30]).map(minutes => ({
              method: 'email',
              minutes: minutes
            }))
          },
          extendedProperties: {
            private: {
              arkId: task.ark_id || '',
              milestoneId: task.milestone_id || '',
              taskId: task.task_id || ''
            }
          }
        };

        const response = await calendar.events.insert({
          calendarId: calendarId,
          requestBody: event
        });

        if (response.data.id) {
          eventIds.push(response.data.id);
          created++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Error creating calendar event for task "${task.title}":`, error);
        failed++;
      }
    }

    return { created, failed, eventIds };
  } catch (error) {
    console.error('Error in createARKCalendarEvents:', error);
    throw error;
  }
}

/**
 * Update calendar event (e.g., when task is completed or rescheduled)
 */
export async function updateCalendarEvent(
  credentials: CalendarCredentials,
  calendarId: string,
  eventId: string,
  updates: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    completed?: boolean;
  }
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(credentials);

    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId: calendarId,
      eventId: eventId
    });

    if (!existingEvent.data) {
      throw new Error('Event not found');
    }

    // Update event
    const updatedEvent = {
      ...existingEvent.data,
      summary: updates.title || existingEvent.data.summary,
      description: updates.description || existingEvent.data.description,
      start: updates.startDate ? {
        dateTime: new Date(updates.startDate).toISOString(),
        timeZone: existingEvent.data.start?.timeZone || 'Asia/Kolkata'
      } : existingEvent.data.start,
      end: updates.endDate ? {
        dateTime: new Date(updates.endDate).toISOString(),
        timeZone: existingEvent.data.end?.timeZone || 'Asia/Kolkata'
      } : existingEvent.data.end,
      colorId: updates.completed ? '10' : existingEvent.data.colorId // Green for completed
    };

    await calendar.events.update({
      calendarId: calendarId,
      eventId: eventId,
      requestBody: updatedEvent
    });

    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

/**
 * Delete calendar event
 */
export async function deleteCalendarEvent(
  credentials: CalendarCredentials,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = getCalendarClient(credentials);

    await calendar.events.delete({
      calendarId: calendarId,
      eventId: eventId
    });

    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

/**
 * Convert ARK timeline tasks to calendar tasks
 */
export function convertTimelineToCalendarTasks(
  timelineTasks: Array<{
    id?: string;
    ark_id: string;
    milestone_id?: string;
    task_title: string;
    task_description?: string;
    task_date: string;
    estimated_hours?: number;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    task_type?: string;
  }>
): CalendarTask[] {
  return timelineTasks.map(task => {
    // Map priority to color
    const colorMap: Record<string, string> = {
      'critical': '11', // Red
      'high': '6',      // Orange
      'medium': '5',    // Yellow
      'low': '9'        // Blue
    };

    // Set reminders based on priority
    const reminderMap: Record<string, number[]> = {
      'critical': [10080, 1440, 60, 15], // 1 week, 1 day, 1 hour, 15 min
      'high': [1440, 60, 15],            // 1 day, 1 hour, 15 min
      'medium': [1440, 30],              // 1 day, 30 min
      'low': [1440]                      // 1 day
    };

    return {
      title: task.task_title,
      description: task.task_description || '',
      startDate: task.task_date,
      durationHours: task.estimated_hours || 1,
      colorId: colorMap[task.priority || 'medium'] || '5',
      reminders: {
        minutes: reminderMap[task.priority || 'medium'] || [1440]
      },
      ark_id: task.ark_id,
      milestone_id: task.milestone_id,
      task_id: task.id
    };
  });
}

/**
 * Get Google Calendar OAuth configuration
 */
export function getGoogleCalendarConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google-calendar/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar OAuth credentials not configured');
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  };
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(config: ReturnType<typeof getGoogleCalendarConfig>, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  config: ReturnType<typeof getGoogleCalendarConfig>
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type: string;
}> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code'
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
      token_type: response.data.token_type || 'Bearer'
    };
  } catch (error: any) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    throw new Error(`Failed to exchange code for tokens: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  config: ReturnType<typeof getGoogleCalendarConfig>
): Promise<{
  access_token: string;
  expires_in?: number;
  token_type: string;
}> {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token'
    });

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      token_type: response.data.token_type || 'Bearer'
    };
  } catch (error: any) {
    console.error('Error refreshing access token:', error.response?.data || error.message);
    throw new Error(`Failed to refresh access token: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Create a single calendar event
 */
export async function createEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    location?: string;
    reminders?: { useDefault: boolean; overrides: Array<{ method: string; minutes: number }> };
  },
  calendarId: string = 'primary'
): Promise<any> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: await getOAuth2Client(accessToken) });
    
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        ...event,
        start: {
          ...event.start,
          timeZone: event.start.timeZone || 'Asia/Kolkata'
        },
        end: {
          ...event.end,
          timeZone: event.end.timeZone || 'Asia/Kolkata'
        }
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating calendar event:', error.response?.data || error.message);
    throw new Error(`Failed to create calendar event: ${error.message}`);
  }
}

/**
 * Get calendar events
 */
export async function getEvents(
  accessToken: string,
  calendarId: string = 'primary',
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: 'startTime' | 'updated';
  } = {}
): Promise<any[]> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: await getOAuth2Client(accessToken) });
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: options.timeMin || new Date().toISOString(),
      timeMax: options.timeMax,
      maxResults: options.maxResults || 100,
      singleEvents: options.singleEvents ?? true,
      orderBy: options.orderBy || 'startTime'
    });

    return response.data.items || [];
  } catch (error: any) {
    console.error('Error fetching calendar events:', error.response?.data || error.message);
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }
}

/**
 * Update calendar event
 */
export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    start?: { dateTime: string; timeZone?: string };
    end?: { dateTime: string; timeZone?: string };
    location?: string;
  }
): Promise<any> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: await getOAuth2Client(accessToken) });
    
    // Get existing event
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId
    });

    if (!existingEvent.data) {
      throw new Error('Event not found');
    }

    // Merge updates
    const updatedEvent = {
      ...existingEvent.data,
      summary: updates.summary || existingEvent.data.summary,
      description: updates.description || existingEvent.data.description,
      start: updates.start ? {
        ...updates.start,
        timeZone: updates.start.timeZone || 'Asia/Kolkata'
      } : existingEvent.data.start,
      end: updates.end ? {
        ...updates.end,
        timeZone: updates.end.timeZone || 'Asia/Kolkata'
      } : existingEvent.data.end,
      location: updates.location || existingEvent.data.location
    };

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: updatedEvent
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating calendar event:', error.response?.data || error.message);
    throw new Error(`Failed to update calendar event: ${error.message}`);
  }
}

/**
 * Delete calendar event
 */
export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: await getOAuth2Client(accessToken) });
    
    await calendar.events.delete({
      calendarId,
      eventId
    });

    return true;
  } catch (error: any) {
    console.error('Error deleting calendar event:', error.response?.data || error.message);
    throw new Error(`Failed to delete calendar event: ${error.message}`);
  }
}

/**
 * Helper: Get OAuth2 client from access token
 */
async function getOAuth2Client(accessToken: string) {
  const config = getGoogleCalendarConfig();
  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return oauth2Client;
}
