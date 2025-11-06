import type { NotificationType } from "@/lib/types";

// Lazy load Firebase Admin to avoid build errors if not installed
// This file uses dynamic imports to prevent Turbopack from analyzing firebase-admin

let firebaseAdmin: any = null;
let messaging: any = null;
let loadAttempted = false;

async function loadFirebaseAdmin() {
  if (loadAttempted) {
    return { firebaseAdmin, messaging };
  }
  
  loadAttempted = true;
  
  // Skip in non-Node environments
  if (typeof window !== 'undefined') {
    return { firebaseAdmin: null, messaging: null };
  }
  
  try {
    // Use dynamic import with runtime string construction to prevent Turbopack analysis
    // This makes the import path opaque to static analysis
    const base = "firebase" + "-" + "admin";
    const appPath = base + "/app";
    const messagingPath = base + "/messaging";
    
    const [firebaseAdminApp, firebaseAdminMessaging] = await Promise.all([
      import(appPath).catch(() => null),
      import(messagingPath).catch(() => null),
    ]);
    
    if (!firebaseAdminApp || !firebaseAdminMessaging) {
      console.warn("Firebase Admin not available - push notifications disabled");
      return { firebaseAdmin: null, messaging: null };
    }
    
    firebaseAdmin = firebaseAdminApp;
    
    // Initialize Firebase Admin (only once)
    if (!firebaseAdmin.getApps().length) {
      try {
        firebaseAdmin.initializeApp({
          credential: firebaseAdmin.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
      } catch (error) {
        console.error("Firebase Admin initialization error:", error);
        return { firebaseAdmin: null, messaging: null };
      }
    }
    
    messaging = firebaseAdminMessaging.getMessaging();
    return { firebaseAdmin, messaging };
  } catch (error: any) {
    console.warn("Firebase Admin not available - push notifications disabled");
    return { firebaseAdmin: null, messaging: null };
  }
}

export interface PushNotificationPayload {
  user_id: string;
  fcm_token: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
  image_url?: string;
}

/**
 * Send push notification via Firebase Cloud Messaging
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    const { messaging: msg } = await loadFirebaseAdmin();
    if (!msg) {
      return {
        success: false,
        error: "Firebase Admin not configured",
      };
    }

    const message = {
      token: payload.fcm_token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.image_url && { imageUrl: payload.image_url }),
      },
      data: {
        type: payload.type,
        user_id: payload.user_id,
        ...(payload.data || {}),
      },
      webpush: {
        fcmOptions: {
          link: `https://mentark-quantum.vercel.app/dashboard`,
        },
      },
    };

    const messageId = await msg.send(message);

    console.log(`✓ Push notification sent: ${messageId}`);

    return {
      success: true,
      message_id: messageId,
    };
  } catch (error: any) {
    console.error("Push notification error:", error);
    return {
      success: false,
      error: error.message || "Failed to send push notification",
    };
  }
}

/**
 * Send bulk push notifications
 */
export async function sendBulkPushNotifications(
  payloads: PushNotificationPayload[]
): Promise<{
  success_count: number;
  failure_count: number;
  results: Array<{ user_id: string; success: boolean; error?: string }>;
}> {
  const results = await Promise.all(
    payloads.map(async (payload) => {
      const result = await sendPushNotification(payload);
      return {
        user_id: payload.user_id,
        success: result.success,
        error: result.error,
      };
    })
  );

  const success_count = results.filter((r) => r.success).length;
  const failure_count = results.length - success_count;

  return {
    success_count,
    failure_count,
    results,
  };
}

/**
 * Subscribe user to topic (for batch notifications)
 */
export async function subscribeToTopic(
  fcm_tokens: string[],
  topic: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { messaging: msg } = await loadFirebaseAdmin();
    if (!msg) {
      return {
        success: false,
        error: "Firebase Admin not configured",
      };
    }
    await msg.subscribeToTopic(fcm_tokens, topic);

    console.log(`✓ Subscribed ${fcm_tokens.length} tokens to topic: ${topic}`);

    return { success: true };
  } catch (error: any) {
    console.error("Topic subscription error:", error);
    return {
      success: false,
      error: error.message || "Failed to subscribe to topic",
    };
  }
}

/**
 * Send notification to topic (e.g., all students in a batch)
 */
export async function sendTopicNotification(
  topic: string,
  title: string,
  body: string,
  type: NotificationType,
  data?: Record<string, string>
): Promise<{ success: boolean; message_id?: string; error?: string }> {
  try {
    const { messaging: msg } = await loadFirebaseAdmin();
    if (!msg) {
      return {
        success: false,
        error: "Firebase Admin not configured",
      };
    }

    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: {
        type,
        ...(data || {}),
      },
    };

    const messageId = await msg.send(message);

    console.log(`✓ Topic notification sent to ${topic}: ${messageId}`);

    return {
      success: true,
      message_id: messageId,
    };
  } catch (error: any) {
    console.error("Topic notification error:", error);
    return {
      success: false,
      error: error.message || "Failed to send topic notification",
    };
  }
}

