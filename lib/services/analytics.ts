import posthog from "posthog-js";

let isInitialized = false;

/**
 * Initialize PostHog analytics
 */
export function initPostHog() {
  if (typeof window !== "undefined" && !isInitialized && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.opt_out_capturing();
      },
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
      person_profiles: "always", // Enable detailed user profiles
      disable_persistence: false, // Allow cross-session tracking
    });
    isInitialized = true;
  }
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && isInitialized) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName?: string) {
  if (typeof window !== "undefined" && isInitialized) {
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      page_name: pageName,
    });
  }
}

/**
 * Identify user for analytics
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && isInitialized) {
    posthog.identify(userId, properties);
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetUser() {
  if (typeof window !== "undefined" && isInitialized) {
    posthog.reset();
  }
}

// Convenience tracking functions for common events

export function trackSignUp(userId: string, role: string, instituteName: string) {
  trackEvent("sign_up", {
    user_id: userId,
    role,
    institute: instituteName,
  });
}

export function trackLogin(userId: string, role: string) {
  trackEvent("login", {
    user_id: userId,
    role,
  });
}

export function trackARKCreation(
  userId: string,
  arkId: string,
  category: string,
  duration: string
) {
  trackEvent("ark_created", {
    user_id: userId,
    ark_id: arkId,
    category,
    duration,
  });
}

export function trackARKMilestoneCompleted(userId: string, arkId: string, milestoneId: string) {
  trackEvent("ark_milestone_completed", {
    user_id: userId,
    ark_id: arkId,
    milestone_id: milestoneId,
  });
}

export function trackDailyCheckIn(
  userId: string,
  energyLevel: number,
  focusLevel: number,
  emotionScore: number
) {
  trackEvent("daily_checkin", {
    user_id: userId,
    energy_level: energyLevel,
    focus_level: focusLevel,
    emotion_score: emotionScore,
  });
}

export function trackAIChatMessage(userId: string, sessionId: string, messageLength: number) {
  trackEvent("ai_chat_message", {
    user_id: userId,
    session_id: sessionId,
    message_length: messageLength,
  });
}

export function trackAchievementEarned(userId: string, achievementId: string, achievementType: string) {
  trackEvent("achievement_earned", {
    user_id: userId,
    achievement_id: achievementId,
    type: achievementType,
  });
}

export function trackResourceViewed(userId: string, resourceType: string, resourceUrl: string) {
  trackEvent("resource_viewed", {
    user_id: userId,
    resource_type: resourceType,
    resource_url: resourceUrl,
  });
}

export function trackTeacherInsightViewed(teacherId: string, studentId: string) {
  trackEvent("teacher_insight_viewed", {
    teacher_id: teacherId,
    student_id: studentId,
  });
}

export function trackBatchAnalyticsViewed(adminId: string, batchId: string) {
  trackEvent("batch_analytics_viewed", {
    admin_id: adminId,
    batch_id: batchId,
  });
}

