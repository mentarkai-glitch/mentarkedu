/**
 * Firebase Admin SDK Service
 * 
 * This module provides server-side Firebase functionality for:
 * - Server-side push notifications
 * - User token management
 * - Server-side authentication
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let messaging: Messaging | null = null;
let auth: Auth | null = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  try {
    // Check if Firebase Admin is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      return adminApp;
    }

    // Initialize Firebase Admin with service account credentials
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return adminApp;
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
}

/**
 * Get Firebase Admin Messaging instance
 */
export function getFirebaseMessaging(): Messaging {
  if (!messaging) {
    const app = initializeFirebaseAdmin();
    messaging = getMessaging(app);
  }
  return messaging;
}

/**
 * Get Firebase Admin Auth instance
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    const app = initializeFirebaseAdmin();
    auth = getAuth(app);
  }
  return auth;
}

/**
 * Send push notification to a single device
 */
export async function sendPushNotification(
  token: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging();
    
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Push notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
    return false;
  }
}

/**
 * Send push notification to multiple devices
 */
export async function sendBulkPushNotifications(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<{ success: number; failed: number; errors: any[] }> {
  try {
    const messaging = getFirebaseMessaging();
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    // Use sendEach for multiple tokens (sendMulticast may not be available in all Firebase Admin SDK versions)
    const response = await (messaging as any).sendMulticast?.({
      tokens,
      ...message,
    }) || await Promise.all(
      tokens.map(token => 
        messaging.send({
          token,
          ...message,
        }).catch((error: any) => ({ success: false, error: error.message }))
      )
    );

    console.log(`✅ Bulk push notifications sent: ${response.successCount} success, ${response.failureCount} failed`);
    
    return {
      success: response.successCount,
      failed: response.failureCount,
      errors: response.responses
        .map((resp: any, index: number) => ({ token: tokens[index], error: resp.error }))
        .filter((resp: any) => resp.error)
    };
  } catch (error) {
    console.error('❌ Failed to send bulk push notifications:', error);
    return { success: 0, failed: tokens.length, errors: [{ error }] };
  }
}

/**
 * Send push notification to a topic
 */
export async function sendTopicPushNotification(
  topic: string,
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  },
  data?: Record<string, string>
): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging();
    
    const message = {
      topic,
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    console.log('✅ Topic push notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ Failed to send topic push notification:', error);
    return false;
  }
}

/**
 * Subscribe user to a topic
 */
export async function subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging();
    const response = await messaging.subscribeToTopic(tokens, topic);
    console.log('✅ Successfully subscribed to topic:', response);
    return true;
  } catch (error) {
    console.error('❌ Failed to subscribe to topic:', error);
    return false;
  }
}

/**
 * Unsubscribe user from a topic
 */
export async function unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging();
    const response = await messaging.unsubscribeFromTopic(tokens, topic);
    console.log('✅ Successfully unsubscribed from topic:', response);
    return true;
  } catch (error) {
    console.error('❌ Failed to unsubscribe from topic:', error);
    return false;
  }
}

/**
 * Send daily check-in reminder
 */
export async function sendDailyCheckInReminder(userToken: string, userName: string): Promise<boolean> {
  return await sendPushNotification(
    userToken,
    {
      title: 'Daily Check-in Reminder',
      body: `Hi ${userName}! How are you feeling today? Take a moment to check in with Mentark.`,
      imageUrl: '/logo.png'
    },
    {
      type: 'daily_checkin',
      action: 'open_checkin'
    }
  );
}

/**
 * Send ARK milestone notification
 */
export async function sendARKMilestoneNotification(
  userToken: string,
  userName: string,
  milestoneTitle: string
): Promise<boolean> {
  return await sendPushNotification(
    userToken,
    {
      title: '🎉 Milestone Achieved!',
      body: `Congratulations ${userName}! You've completed "${milestoneTitle}". Keep up the great work!`,
      imageUrl: '/logo.png'
    },
    {
      type: 'milestone_achieved',
      action: 'view_ark'
    }
  );
}

/**
 * Send intervention alert to teachers
 */
export async function sendInterventionAlert(
  teacherToken: string,
  studentName: string,
  alertType: string
): Promise<boolean> {
  return await sendPushNotification(
    teacherToken,
    {
      title: '⚠️ Student Intervention Alert',
      body: `${studentName} may need your attention. Alert type: ${alertType}`,
      imageUrl: '/logo.png'
    },
    {
      type: 'intervention_alert',
      action: 'view_student',
      student_name: studentName
    }
  );
}

/**
 * Check if Firebase Admin is properly configured
 */
export function isFirebaseAdminConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

/**
 * Get Firebase Admin configuration status
 */
export function getFirebaseAdminStatus(): {
  configured: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
  if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
  if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
  
  return {
    configured: missing.length === 0,
    missing
  };
}


