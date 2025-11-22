/**
 * Color System Utilities
 * 
 * Provides color utilities and helpers for the Mentark design system
 */

import { brandColors, semanticColors, neutralColors } from './tokens';

/**
 * Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

/**
 * Get semantic color for status
 */
export function getStatusColor(status: 'success' | 'warning' | 'error' | 'info') {
  return semanticColors[status];
}

/**
 * Get brand color variant
 */
export function getBrandColor(variant: 'gold' | 'blue' | 'green' | 'purple' = 'gold') {
  return brandColors[variant];
}

/**
 * Color combinations for common use cases
 */
export const colorCombinations = {
  // Primary action (CTA)
  primary: {
    bg: brandColors.gold.DEFAULT,
    text: neutralColors.black,
    hover: brandColors.gold.bright,
  },
  
  // Secondary action
  secondary: {
    bg: 'transparent',
    border: brandColors.gold.DEFAULT,
    text: brandColors.gold.DEFAULT,
    hover: {
      bg: brandColors.gold['10'],
      border: brandColors.gold.bright,
    },
  },
  
  // Success state
  success: {
    bg: semanticColors.success.DEFAULT,
    text: neutralColors.black,
    light: {
      bg: semanticColors.success['10'],
      text: semanticColors.success.DEFAULT,
    },
  },
  
  // Warning state
  warning: {
    bg: semanticColors.warning.DEFAULT,
    text: neutralColors.black,
    light: {
      bg: semanticColors.warning['10'],
      text: semanticColors.warning.DEFAULT,
    },
  },
  
  // Error state
  error: {
    bg: semanticColors.error.DEFAULT,
    text: neutralColors.black,
    light: {
      bg: semanticColors.error['10'],
      text: semanticColors.error.DEFAULT,
    },
  },
  
  // Card backgrounds
  card: {
    default: neutralColors.midnight,
    elevated: neutralColors.surface,
    hover: neutralColors.slate[800],
  },
  
  // Text colors
  text: {
    primary: neutralColors.text.primary,
    secondary: neutralColors.text.secondary,
    tertiary: neutralColors.text.tertiary,
    muted: neutralColors.text.muted,
  },
} as const;

export default {
  brand: brandColors,
  semantic: semanticColors,
  neutral: neutralColors,
  combinations: colorCombinations,
  withOpacity,
  getStatusColor,
  getBrandColor,
};





