/**
 * Streak Tracker - Manages daily check-in streaks
 */

import { format, differenceInDays, isToday, isYesterday, parseISO } from "date-fns";

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string;
  total_checkins: number;
  is_active_today: boolean;
}

/**
 * Calculate current streak from check-in dates
 */
export function calculateStreak(checkinDates: string[]): StreakData {
  if (checkinDates.length === 0) {
    return {
      current_streak: 0,
      longest_streak: 0,
      last_checkin_date: "",
      total_checkins: 0,
      is_active_today: false,
    };
  }

  // Sort dates in descending order (most recent first)
  const sortedDates = checkinDates
    .map((date) => parseISO(date))
    .sort((a, b) => b.getTime() - a.getTime());

  const lastCheckin = sortedDates[0];
  const is_active_today = isToday(lastCheckin);

  // Calculate current streak
  let current_streak = 0;
  let expected_date = new Date();

  for (const date of sortedDates) {
    if (isToday(date) || isYesterday(date) || differenceInDays(expected_date, date) <= 1) {
      current_streak++;
      expected_date = date;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longest_streak = 0;
  let temp_streak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = differenceInDays(sortedDates[i], sortedDates[i + 1]);

    if (diff === 1) {
      temp_streak++;
      longest_streak = Math.max(longest_streak, temp_streak);
    } else {
      longest_streak = Math.max(longest_streak, temp_streak);
      temp_streak = 1;
    }
  }

  longest_streak = Math.max(longest_streak, temp_streak, current_streak);

  return {
    current_streak,
    longest_streak,
    last_checkin_date: format(lastCheckin, "yyyy-MM-dd"),
    total_checkins: checkinDates.length,
    is_active_today,
  };
}

/**
 * Check if streak is at risk (no check-in today)
 */
export function isStreakAtRisk(lastCheckinDate: string): boolean {
  if (!lastCheckinDate) return false;

  const lastCheckin = parseISO(lastCheckinDate);
  return !isToday(lastCheckin) && differenceInDays(new Date(), lastCheckin) === 1;
}

/**
 * Check if streak is broken
 */
export function isStreakBroken(lastCheckinDate: string): boolean {
  if (!lastCheckinDate) return false;

  const lastCheckin = parseISO(lastCheckinDate);
  return differenceInDays(new Date(), lastCheckin) > 1;
}

/**
 * Get streak status message
 */
export function getStreakStatus(streakData: StreakData): {
  message: string;
  emoji: string;
  color: "success" | "warning" | "error" | "neutral";
} {
  if (streakData.is_active_today) {
    return {
      message: `Great! You're on a ${streakData.current_streak}-day streak! 🔥`,
      emoji: "🔥",
      color: "success",
    };
  }

  if (isStreakAtRisk(streakData.last_checkin_date)) {
    return {
      message: "Don't break your streak! Check in today.",
      emoji: "⚠️",
      color: "warning",
    };
  }

  if (isStreakBroken(streakData.last_checkin_date)) {
    return {
      message: "Streak lost. Start a new one today!",
      emoji: "💔",
      color: "error",
    };
  }

  return {
    message: "Start your streak today!",
    emoji: "✨",
    color: "neutral",
  };
}

/**
 * Get streak milestone message
 */
export function getStreakMilestone(streakDays: number): string | null {
  const milestones: Record<number, string> = {
    3: "🎉 3-day streak! You're building a habit!",
    7: "🌟 Week streak! Consistency is key!",
    14: "💪 Two-week streak! You're on fire!",
    30: "🏆 30-day streak! Incredible dedication!",
    50: "🚀 50-day streak! You're unstoppable!",
    100: "👑 100-day streak! Legendary status!",
    365: "🌈 One year streak! You're a Mentark champion!",
  };

  return milestones[streakDays] || null;
}

/**
 * Calculate streak freeze cost (in coins)
 * Allows student to skip one day without breaking streak
 */
export function streakFreezeCost(currentStreak: number): number {
  if (currentStreak < 7) return 50; // Low streak = cheaper
  if (currentStreak < 30) return 100;
  return 200; // High streak = more expensive
}

/**
 * Get streak calendar data for visualization
 */
export function getStreakCalendar(
  checkinDates: string[],
  year: number,
  month: number
): Array<{ date: string; has_checkin: boolean }> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendar: Array<{ date: string; has_checkin: boolean }> = [];

  const checkinSet = new Set(checkinDates.map((d) => d.split("T")[0]));

  for (let day = 1; day <= daysInMonth; day++) {
    const date = format(new Date(year, month, day), "yyyy-MM-dd");
    calendar.push({
      date,
      has_checkin: checkinSet.has(date),
    });
  }

  return calendar;
}

