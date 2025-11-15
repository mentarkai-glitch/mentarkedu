# ✅ Google Calendar Integration Setup

## Overview
Google Calendar integration allows students to:
- Connect their Google Calendar to Daily Assistant
- View calendar events alongside their tasks
- Sync agenda items with calendar (future enhancement)

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Google Calendar OAuth (Required for Calendar Integration)
GOOGLE_CALENDAR_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Google API Key (Optional - for other Google services)
GOOGLE_API_KEY=AIzaSyAZUlMTcAF1vBnZtK2Yip8sms7L-n6Hkxg

# App URL (Required for OAuth redirect)
NEXT_PUBLIC_APP_URL=http://localhost:3002
# Or for production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## OAuth Redirect URI Setup

### Important: Configure in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add these authorized redirect URIs:

**Development:**
```
http://localhost:3002/api/auth/google-calendar/callback
```

**Production:**
```
https://yourdomain.com/api/auth/google-calendar/callback
```

## API Endpoints

### 1. Connect Calendar
```
GET /api/calendar/google/connect
```
Initiates OAuth flow. Returns `auth_url` to redirect user to Google.

### 2. OAuth Callback
```
GET /api/auth/google-calendar/callback?code=...&state=...
```
Handles OAuth callback, exchanges code for tokens, stores in user profile.

### 3. Get Calendar Status
```
GET /api/calendar/google/status
```
Returns connection status and token info.

### 4. Get Calendar Events
```
GET /api/calendar/google/events?calendarId=primary&timeMin=...&timeMax=...
```
Fetches events from user's calendar.

### 5. Create Calendar Event
```
POST /api/calendar/google/create
Body: { event: {...}, calendarId: "primary" }
```
Creates a new event in user's calendar.

## How It Works

1. **User clicks "Connect Calendar"** in Daily Assistant
2. **Redirects to Google OAuth** for authorization
3. **User approves** access to their calendar
4. **Callback receives code** and exchanges for access/refresh tokens
5. **Tokens stored** in user's `profile_data.google_calendar` in Supabase
6. **Events fetched** automatically and displayed in Daily Assistant

## Token Storage

Tokens are stored in the `users` table under `profile_data.google_calendar`:
```json
{
  "google_calendar": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": "2024-01-01T12:00:00Z",
    "token_type": "Bearer",
    "connected_at": "2024-01-01T10:00:00Z"
  }
}
```

## Automatic Token Refresh

- Access tokens expire after 1 hour
- System automatically refreshes using refresh token
- If refresh fails, user needs to reconnect

## Security Notes

- ⚠️ **Never commit `.env.local`** to version control
- ✅ Tokens are stored server-side only
- ✅ OAuth flow uses secure HTTPS in production
- ✅ State parameter prevents CSRF attacks

## Testing

1. Start dev server: `npm run dev`
2. Navigate to Daily Assistant: `/dashboard/student/daily-assistant`
3. Click "Connect Calendar"
4. Authorize with Google account
5. Verify events appear in the calendar section

## Troubleshooting

### "Google Calendar not connected"
- Check `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` are set
- Verify redirect URI matches in Google Cloud Console

### "OAuth error" / "Failed to refresh token"
- Reconnect calendar (token may be expired/invalid)
- Check OAuth credentials are correct
- Verify redirect URI is authorized

### Events not showing
- Check token hasn't expired
- Verify calendar has events for today
- Check network tab for API errors

## Next Steps

Future enhancements:
- ✅ Auto-sync Daily Assistant tasks to calendar
- ✅ Two-way sync (calendar ↔ Daily Assistant)
- ✅ Multiple calendar support
- ✅ Event reminders and notifications
- ✅ Outlook Calendar integration (similar flow)

