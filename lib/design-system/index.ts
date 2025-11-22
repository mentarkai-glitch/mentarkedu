/**
 * Mentark Quantum Design System
 * 
 * Central export for all design system utilities
 */

export * from './tokens';
export * from './colors';
export * from './spacing';
export * from './typography';

// Re-export commonly used items
export { designTokens } from './tokens';
export { standardSpacing, getPagePadding, getGapClasses } from './spacing';
export { colorCombinations, getStatusColor, getBrandColor } from './colors';
export { textStyles, getTextClasses } from './typography';





