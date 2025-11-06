/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format currency (Indian Rupees)
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with suffixes (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format duration in seconds to readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format phone number (Indian format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's an Indian number (10 digits)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, "$1 $2");
  }

  // Check if it includes country code
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{5})/, "+$1 $2 $3");
  }

  return phone;
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Format sentiment score to color and label
 */
export function formatSentimentScore(score: number): {
  color: string;
  label: string;
  emoji: string;
} {
  if (score >= 0.6) {
    return { color: "#10B981", label: "Very Positive", emoji: "😊" };
  }
  if (score >= 0.2) {
    return { color: "#3B82F6", label: "Positive", emoji: "🙂" };
  }
  if (score >= -0.2) {
    return { color: "#6B7280", label: "Neutral", emoji: "😐" };
  }
  if (score >= -0.6) {
    return { color: "#F59E0B", label: "Stressed", emoji: "😟" };
  }
  return { color: "#EF4444", label: "Struggling", emoji: "😢" };
}

/**
 * Format risk score to severity level
 */
export function formatRiskScore(score: number): {
  level: "low" | "medium" | "high" | "critical";
  color: string;
  label: string;
} {
  if (score < 30) {
    return { level: "low", color: "#10B981", label: "Low Risk" };
  }
  if (score < 50) {
    return { level: "medium", color: "#3B82F6", label: "Medium Risk" };
  }
  if (score < 70) {
    return { level: "high", color: "#F59E0B", label: "High Risk" };
  }
  return { level: "critical", color: "#EF4444", label: "Critical Risk" };
}

/**
 * Format XP with proper suffixes
 */
export function formatXP(xp: number): string {
  return `${formatCompactNumber(xp)} XP`;
}

/**
 * Format level display
 */
export function formatLevel(level: number): string {
  return `Level ${level}`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format ARK progress percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

