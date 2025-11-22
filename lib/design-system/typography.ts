/**
 * Typography System Utilities
 * 
 * Provides typography utilities and helpers for consistent text styling
 */

import { typography } from './tokens';

/**
 * Typography presets for common use cases
 */
export const textStyles = {
  // Headings
  h1: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['5xl'][0],
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: '-0.02em',
    mobile: {
      fontSize: typography.fontSize['4xl'][0],
    },
  },
  
  h2: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['4xl'][0],
    lineHeight: typography.lineHeight.snug,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: '-0.02em',
    mobile: {
      fontSize: typography.fontSize['3xl'][0],
    },
  },
  
  h3: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['3xl'][0],
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.semibold,
    mobile: {
      fontSize: typography.fontSize['2xl'][0],
    },
  },
  
  h4: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['2xl'][0],
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.semibold,
    mobile: {
      fontSize: typography.fontSize.xl[0],
    },
  },
  
  // Body text
  body: {
    large: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.fontSize.lg[0],
      lineHeight: typography.lineHeight.relaxed,
      fontWeight: typography.fontWeight.regular,
    },
    
    base: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.lineHeight.relaxed,
      fontWeight: typography.fontWeight.regular,
    },
    
    small: {
      fontFamily: typography.fontFamily.sans,
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.regular,
    },
  },
  
  // Labels
  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm[0],
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.semibold,
  },
  
  // Captions
  caption: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.xs[0],
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.regular,
  },
} as const;

/**
 * Get Tailwind classes for text style
 */
export function getTextClasses(variant: keyof typeof textStyles): string {
  const style = textStyles[variant];
  
  if ('fontFamily' in style) {
    // Heading or specific style
    const family = style.fontFamily.includes('Poppins') ? 'font-display' : 'font-sans';
    const size = style.fontSize.replace('rem', '').replace('px', '');
    const weight = `font-${style.fontWeight === 800 ? 'extrabold' : style.fontWeight === 700 ? 'bold' : 'semibold'}`;
    
    return `${family} ${size.includes('3rem') ? 'text-5xl' : size.includes('2.25rem') ? 'text-4xl' : size.includes('1.875rem') ? 'text-3xl' : size.includes('1.5rem') ? 'text-2xl' : 'text-xl'} ${weight}`;
  }
  
  return '';
}

export default {
  styles: textStyles,
  tokens: typography,
  getTextClasses,
};





