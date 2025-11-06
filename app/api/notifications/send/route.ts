import { NextRequest, NextResponse } from 'next/server';
import { 
  sendPushNotification, 
  sendBulkPushNotifications, 
  sendTopicPushNotification,
  isFirebaseAdminConfigured,
  getFirebaseAdminStatus
} from '@/lib/services/firebase-admin';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    // Check if Firebase Admin is configured
    if (!isFirebaseAdminConfigured()) {
      const status = getFirebaseAdminStatus();
      return errorResponse(
        `Firebase Admin SDK not configured. Missing: ${status.missing.join(', ')}`,
        500
      );
    }

    const body = await request.json();
    const { type, tokens, topic, notification, data } = body;

    // Validate required fields
    if (!notification?.title || !notification?.body) {
      return errorResponse('Notification title and body are required', 400);
    }

    let result;
    
    switch (type) {
      case 'single':
        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
          return errorResponse('Tokens array is required for single notification', 400);
        }
        
        if (tokens.length === 1) {
          result = await sendPushNotification(tokens[0], notification, data);
        } else {
          result = await sendBulkPushNotifications(tokens, notification, data);
        }
        break;
        
      case 'topic':
        if (!topic) {
          return errorResponse('Topic is required for topic notification', 400);
        }
        result = await sendTopicPushNotification(topic, notification, data);
        break;
        
      default:
        return errorResponse('Invalid notification type. Use "single" or "topic"', 400);
    }

    return successResponse({
      success: true,
      result,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = getFirebaseAdminStatus();
    
    return successResponse({
      firebase_admin_configured: status.configured,
      missing_config: status.missing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error);
  }
}


