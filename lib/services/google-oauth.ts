/**
 * Google OAuth Token Helper
 * Get OAuth access token for Google APIs using client credentials
 */

import axios from 'axios';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  projectId?: string;
}

/**
 * Get OAuth access token using service account or JWT with client credentials
 * For Document AI, we need cloud-platform scope
 */
export async function getOAuthAccessToken(config: GoogleOAuthConfig): Promise<string | null> {
  try {
    const { google } = await import('googleapis');
    
    // Method 1: Try service account first (best for server-side)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        return token.token || null;
      } catch (serviceAccountError) {
        console.warn('Service account auth failed:', serviceAccountError);
      }
    }
    
    // Method 2: OAuth client credentials don't work for server-to-server Document AI
    // Document AI requires service account credentials for server-side operations
    // OAuth client credentials are for user-facing OAuth flows, not server-to-server
    // We'll skip JWT with client credentials as it won't work for Document AI
    
    // Method 3: Fallback - try direct OAuth token request (may not work for Document AI)
    // Note: This typically requires service account for server-side operations
    try {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', config.clientId);
      params.append('client_secret', config.clientSecret);
      params.append('scope', 'https://www.googleapis.com/auth/cloud-platform');

      const response = await axios.post(tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.access_token || null;
    } catch (directOAuthError: any) {
      console.warn('Direct OAuth request failed:', directOAuthError.message);
      // This is expected - client credentials flow doesn't work for Document AI
      // Need service account credentials for server-side operations
    }

    return null;
  } catch (error: any) {
    console.error('Failed to get OAuth token:', error.message || error);
    return null;
  }
}

/**
 * Get OAuth token from environment or generate using client credentials
 */
export async function getGoogleOAuthToken(): Promise<string | null> {
  // Check if we have direct access token (if stored)
  const accessToken = process.env.GOOGLE_OAUTH_ACCESS_TOKEN;
  if (accessToken) {
    return accessToken;
  }

  // Try service account first (best for server-side)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const { google } = await import('googleapis');
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const token = await client.getAccessToken();
      return token.token || null;
    } catch (error) {
      console.warn('Service account auth failed:', error);
    }
  }

  // Note: OAuth client credentials don't work for server-to-server Document AI
  // Document AI requires service account credentials for server-side operations
  // The client credentials provided are for user-facing OAuth flows (like Calendar)
  // For Document AI, we need service account JSON file
  
  // Return null - will fall back to API key in document-ai.ts
  return null;
}

