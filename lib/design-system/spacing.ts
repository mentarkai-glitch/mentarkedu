/**
 * Standardized Spacing Utilities
 * 
 * Provides consistent spacing classes and utilities for the Mentark platform
 */

import { spacing, spacingScale } from './tokens';

// Standard spacing values for consistent use
export const standardSpacing = {
  // Page-level padding
  page: {
    mobile: spacing.sm,    // 8px
    tablet: spacing.md,    // 16px
    desktop: spacing.lg,   // 24px
  },
  
  // Section spacing
  section: {
    mobile: spacing.lg,    // 24px
    desktop: spacing.xl,   // 32px
  },
  
  // Card padding
  card: {
    mobile: spacing.md,    // 16px
    desktop: spacing.lg,   // 24px
  },
  
  // Component spacing
  component: {
    tight: spacing.xs,     // 4px
    normal: spacing.md,    // 16px
    loose: spacing.lg,     // 24px
  },
  
  // Gap spacing (for flex/grid)
  gap: {
    xs: spacing.xs,        // 4px
    sm: spacing.sm,        // 8px
    md: spacing.md,        // 16px
    lg: spacing.lg,        // 24px
    xl: spacing.xl,        // 32px
  },
} as const;

/**
 * Generate responsive padding classes
 */
export function getPagePadding() {
  return {
    mobile: 'px-2 sm:px-4',
    tablet: 'px-4 md:px-6',
    desktop: 'px-4 sm:px-6 lg:px-8',
  };
}

/**
 * Generate responsive gap classes
 */
export function getGapClasses(gap: keyof typeof standardSpacing.gap = 'md') {
  const gapMap = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  return {
    mobile: gapMap[gap],
    responsive: `gap-4 ${gap !== 'xs' ? 'sm:gap-6' : ''} ${gap === 'lg' || gap === 'xl' ? 'lg:gap-8' : ''}`,
  };
}

export default standardSpacing;





