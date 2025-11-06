import {
  format,
  formatDistance,
  formatRelative,
  parseISO,
  isToday,
  isYesterday,
  isTomorrow,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  subDays,
} from "date-fns";

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, formatStr: string = "PPP"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    const hoursAgo = differenceInHours(new Date(), dateObj);
    if (hoursAgo < 1) {
      const minutesAgo = differenceInMinutes(new Date(), dateObj);
      return minutesAgo === 0 ? "Just now" : `${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    }
    return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
  }
  
  if (isYesterday(dateObj)) {
    return "Yesterday";
  }
  
  if (isTomorrow(dateObj)) {
    return "Tomorrow";
  }
  
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format date for chat messages
 */
export function formatChatTimestamp(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return format(dateObj, "h:mm a");
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday ${format(dateObj, "h:mm a")}`;
  }
  
  const daysAgo = differenceInDays(new Date(), dateObj);
  if (daysAgo < 7) {
    return format(dateObj, "EEEE h:mm a");
  }
  
  return format(dateObj, "MMM d, h:mm a");
}

/**
 * Get week range (for weekly reports)
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

/**
 * Get month range
 */
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * Check if date is within last N days
 */
export function isWithinLastNDays(date: string | Date, days: number): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const threshold = subDays(new Date(), days);
  return dateObj >= threshold;
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): Date {
  return subDays(new Date(), days);
}

/**
 * Get date N days from now
 */
export function getDaysFromNow(days: number): Date {
  return addDays(new Date(), days);
}

/**
 * Format ISO date string for database
 */
export function toISODate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Format date for display in different contexts
 */
export function formatDateByContext(
  date: string | Date,
  context: "short" | "medium" | "long" | "relative"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  switch (context) {
    case "short":
      return format(dateObj, "MMM d");
    case "medium":
      return format(dateObj, "MMM d, yyyy");
    case "long":
      return format(dateObj, "MMMM d, yyyy 'at' h:mm a");
    case "relative":
      return formatRelativeTime(dateObj);
    default:
      return format(dateObj, "PPP");
  }
}

/**
 * Get greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Check if time is in the morning (before 8 AM)
 */
export function isEarlyMorning(date: Date = new Date()): boolean {
  return date.getHours() < 8;
}

/**
 * Check if time is late at night (after 10 PM)
 */
export function isLateNight(date: Date = new Date()): boolean {
  return date.getHours() >= 22;
}

