import type { Achievement, AchievementType, StudentStats } from "@/lib/types";

/**
 * Define all available achievements/badges
 */
export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: "streak_3",
    type: "streak",
    title: "Getting Started",
    description: "Complete 3 days of check-ins in a row",
    criteria: { streak_days: 3 },
    icon_url: "/badges/streak-3.svg",
  },
  {
    id: "streak_7",
    type: "streak",
    title: "Week Warrior",
    description: "Maintain a 7-day check-in streak",
    criteria: { streak_days: 7 },
    icon_url: "/badges/streak-7.svg",
  },
  {
    id: "streak_30",
    type: "streak",
    title: "Monthly Master",
    description: "Incredible! 30 days of consistent check-ins",
    criteria: { streak_days: 30 },
    icon_url: "/badges/streak-30.svg",
  },
  {
    id: "streak_100",
    type: "streak",
    title: "Centurion",
    description: "Legendary 100-day streak",
    criteria: { streak_days: 100 },
    icon_url: "/badges/streak-100.svg",
  },

  // ARK Completion Achievements
  {
    id: "ark_first",
    type: "ark_completion",
    title: "Roadmap Pioneer",
    description: "Complete your first ARK",
    criteria: { arks_completed: 1 },
    icon_url: "/badges/ark-first.svg",
  },
  {
    id: "ark_5",
    type: "ark_completion",
    title: "Journey Master",
    description: "Complete 5 ARKs",
    criteria: { arks_completed: 5 },
    icon_url: "/badges/ark-5.svg",
  },
  {
    id: "ark_10",
    type: "ark_completion",
    title: "Pathfinder Legend",
    description: "Complete 10 ARKs - truly dedicated!",
    criteria: { arks_completed: 10 },
    icon_url: "/badges/ark-10.svg",
  },

  // Daily Check-in Achievements
  {
    id: "checkin_first",
    type: "daily_checkin",
    title: "First Step",
    description: "Complete your first daily check-in",
    criteria: { daily_checkins: 1 },
    icon_url: "/badges/checkin-first.svg",
  },
  {
    id: "checkin_50",
    type: "daily_checkin",
    title: "Self-Aware Learner",
    description: "Complete 50 daily check-ins",
    criteria: { daily_checkins: 50 },
    icon_url: "/badges/checkin-50.svg",
  },
  {
    id: "checkin_100",
    type: "daily_checkin",
    title: "Reflection Master",
    description: "Complete 100 daily check-ins",
    criteria: { daily_checkins: 100 },
    icon_url: "/badges/checkin-100.svg",
  },

  // Chat Engagement Achievements
  {
    id: "chat_10",
    type: "chat_engagement",
    title: "Conversation Starter",
    description: "Send 10 messages to your AI mentor",
    criteria: { chat_messages: 10 },
    icon_url: "/badges/chat-10.svg",
  },
  {
    id: "chat_100",
    type: "chat_engagement",
    title: "Dialogue Expert",
    description: "Send 100 messages - you love talking to Mentark!",
    criteria: { chat_messages: 100 },
    icon_url: "/badges/chat-100.svg",
  },

  // Milestone Achievements
  {
    id: "milestone_10",
    type: "milestone",
    title: "Goal Achiever",
    description: "Complete 10 ARK milestones",
    criteria: { milestones_completed: 10 },
    icon_url: "/badges/milestone-10.svg",
  },
  {
    id: "milestone_50",
    type: "milestone",
    title: "Unstoppable Force",
    description: "Complete 50 ARK milestones",
    criteria: { milestones_completed: 50 },
    icon_url: "/badges/milestone-50.svg",
  },

  // Special Achievements
  {
    id: "early_bird",
    type: "daily_checkin",
    title: "Early Bird",
    description: "Complete 10 check-ins before 8 AM",
    criteria: { early_checkins: 10 },
    icon_url: "/badges/early-bird.svg",
  },
  {
    id: "night_owl",
    type: "daily_checkin",
    title: "Night Owl",
    description: "Complete 10 check-ins after 10 PM",
    criteria: { late_checkins: 10 },
    icon_url: "/badges/night-owl.svg",
  },
  {
    id: "emotion_aware",
    type: "daily_checkin",
    title: "Emotionally Intelligent",
    description: "Maintain positive emotion scores for 30 days",
    criteria: { positive_emotion_streak: 30 },
    icon_url: "/badges/emotion-aware.svg",
  },
];

/**
 * Check if user has earned a specific achievement
 */
export function checkAchievement(
  achievement: Achievement,
  stats: StudentStats,
  metadata?: Record<string, any>
): boolean {
  const { criteria } = achievement;

  switch (achievement.type) {
    case "streak":
      return stats.streak_days >= (criteria.streak_days || 0);

    case "ark_completion":
      return (metadata?.arks_completed || 0) >= (criteria.arks_completed || 0);

    case "daily_checkin":
      if (criteria.daily_checkins) {
        return (metadata?.daily_checkins_count || 0) >= criteria.daily_checkins;
      }
      if (criteria.early_checkins) {
        return (metadata?.early_checkins || 0) >= criteria.early_checkins;
      }
      if (criteria.late_checkins) {
        return (metadata?.late_checkins || 0) >= criteria.late_checkins;
      }
      if (criteria.positive_emotion_streak) {
        return (metadata?.positive_emotion_streak || 0) >= criteria.positive_emotion_streak;
      }
      return false;

    case "chat_engagement":
      return (metadata?.chat_messages || 0) >= (criteria.chat_messages || 0);

    case "milestone":
      return (metadata?.milestones_completed || 0) >= (criteria.milestones_completed || 0);

    default:
      return false;
  }
}

/**
 * Check all achievements and return newly earned ones
 */
export function checkNewAchievements(
  currentBadges: string[],
  stats: StudentStats,
  metadata?: Record<string, any>
): Achievement[] {
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already earned
    if (currentBadges.includes(achievement.id)) {
      continue;
    }

    // Check if criteria met
    if (checkAchievement(achievement, stats, metadata)) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

/**
 * Get all achievements of a specific type
 */
export function getAchievementsByType(type: AchievementType): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.type === type);
}

/**
 * Get achievement progress percentage
 */
export function getAchievementProgress(
  achievement: Achievement,
  stats: StudentStats,
  metadata?: Record<string, any>
): number {
  const { criteria } = achievement;

  switch (achievement.type) {
    case "streak":
      return Math.min(100, (stats.streak_days / (criteria.streak_days || 1)) * 100);

    case "ark_completion":
      return Math.min(
        100,
        ((metadata?.arks_completed || 0) / (criteria.arks_completed || 1)) * 100
      );

    case "daily_checkin":
      if (criteria.daily_checkins) {
        return Math.min(
          100,
          ((metadata?.daily_checkins_count || 0) / criteria.daily_checkins) * 100
        );
      }
      return 0;

    case "chat_engagement":
      return Math.min(
        100,
        ((metadata?.chat_messages || 0) / (criteria.chat_messages || 1)) * 100
      );

    case "milestone":
      return Math.min(
        100,
        ((metadata?.milestones_completed || 0) / (criteria.milestones_completed || 1)) * 100
      );

    default:
      return 0;
  }
}

