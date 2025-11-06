import type { AchievementType } from "@/lib/types";

/**
 * XP values for different actions
 */
export const XP_VALUES = {
  daily_checkin: 10,
  ark_milestone_completed: 50,
  ark_completed: 200,
  chat_message_sent: 5,
  resource_viewed: 3,
  profile_updated: 15,
  first_login_of_day: 10,
  week_streak_maintained: 30,
  month_streak_maintained: 100,
  peer_collaboration: 20,
  achievement_earned: 25,
} as const;

/**
 * Calculate level from total XP
 * Formula: Level = floor(sqrt(XP / 100))
 * Each level requires progressively more XP
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
}

/**
 * Calculate XP required for next level
 */
export function xpForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  return nextLevel * nextLevel * 100;
}

/**
 * Calculate XP progress to next level
 */
export function xpProgressToNextLevel(
  currentXP: number
): {
  current_level: number;
  xp_in_current_level: number;
  xp_needed_for_next_level: number;
  progress_percentage: number;
} {
  const current_level = calculateLevel(currentXP);
  const xp_at_current_level = current_level * current_level * 100;
  const xp_in_current_level = currentXP - xp_at_current_level;
  const xp_needed_for_next_level = xpForNextLevel(current_level) - xp_at_current_level;
  const progress_percentage = (xp_in_current_level / xp_needed_for_next_level) * 100;

  return {
    current_level,
    xp_in_current_level,
    xp_needed_for_next_level,
    progress_percentage: Math.min(100, Math.max(0, progress_percentage)),
  };
}

/**
 * Award XP for an action
 */
export function awardXP(
  action: keyof typeof XP_VALUES,
  multiplier: number = 1
): {
  xp_awarded: number;
  action: string;
  multiplier: number;
} {
  const base_xp = XP_VALUES[action];
  const xp_awarded = Math.floor(base_xp * multiplier);

  return {
    xp_awarded,
    action,
    multiplier,
  };
}

/**
 * Calculate bonus multiplier based on streak
 */
export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0; // 2x for 30+ day streak
  if (streakDays >= 14) return 1.5; // 1.5x for 14+ day streak
  if (streakDays >= 7) return 1.25; // 1.25x for 7+ day streak
  return 1.0;
}

/**
 * Calculate Mentark Coins earned from XP
 * Coins are earned at 1 coin per 10 XP
 */
export function calculateCoins(xp: number): number {
  return Math.floor(xp / 10);
}

/**
 * Get level-up rewards
 */
export function getLevelUpRewards(
  level: number
): {
  coins: number;
  unlocked_features?: string[];
  badge_unlocked?: string;
} {
  const rewards: any = {
    coins: level * 10,
  };

  // Special unlocks at milestone levels
  if (level === 5) {
    rewards.unlocked_features = ["Custom mentor personas"];
    rewards.badge_unlocked = "Rising Star";
  }
  
  if (level === 10) {
    rewards.unlocked_features = ["Advanced analytics", "Peer matching"];
    rewards.badge_unlocked = "Dedicated Learner";
  }
  
  if (level === 20) {
    rewards.unlocked_features = ["Priority mentor response", "Voice mode"];
    rewards.badge_unlocked = "Mentark Champion";
  }
  
  if (level === 50) {
    rewards.unlocked_features = ["Exclusive resources", "Career DNA deep dive"];
    rewards.badge_unlocked = "Legendary Mentor";
  }

  return rewards;
}

/**
 * Calculate leaderboard score
 * Combines XP, streak, and engagement metrics
 */
export function calculateLeaderboardScore(
  xp: number,
  streakDays: number,
  arksCompleted: number,
  dailyCheckinsThisMonth: number
): number {
  const xpScore = xp;
  const streakBonus = streakDays * 50;
  const arkBonus = arksCompleted * 200;
  const engagementBonus = dailyCheckinsThisMonth * 20;

  return xpScore + streakBonus + arkBonus + engagementBonus;
}

