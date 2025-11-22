/**
 * Mentark Quantum Design System Tokens
 * 
 * This file contains all design tokens for the Mentark platform:
 * - Colors (Brand, Semantic, Neutral)
 * - Spacing Scale
 * - Typography Scale
 * - Border Radius
 * - Shadows
 * - Transitions
 * 
 * Usage: Import tokens directly or use via Tailwind config
 */

// ============================================================================
// BRAND COLORS
// ============================================================================

export const brandColors = {
  // Mentorship Gold (Primary)
  gold: {
    DEFAULT: '#FFD700',
    bright: '#FFED4E',
    soft: '#FED766',
    dark: '#FFA500',
    // Opacity variants
    '10': 'rgba(255, 215, 0, 0.1)',
    '20': 'rgba(255, 215, 0, 0.2)',
    '30': 'rgba(255, 215, 0, 0.3)',
    '40': 'rgba(255, 215, 0, 0.4)',
    '50': 'rgba(255, 215, 0, 0.5)',
  },
  
  // Calm Blue (Secondary)
  blue: {
    DEFAULT: '#4A90E2',
    light: '#7BB3F0',
    dark: '#2E5C8A',
    '10': 'rgba(74, 144, 226, 0.1)',
    '20': 'rgba(74, 144, 226, 0.2)',
    '30': 'rgba(74, 144, 226, 0.3)',
  },
  
  // Growth Green (Success)
  green: {
    DEFAULT: '#00C896',
    light: '#4FD9B7',
    dark: '#008B6D',
    '10': 'rgba(0, 200, 150, 0.1)',
    '20': 'rgba(0, 200, 150, 0.2)',
    '30': 'rgba(0, 200, 150, 0.3)',
  },
  
  // Wisdom Purple (Premium/AI)
  purple: {
    DEFAULT: '#7B68EE',
    light: '#9B8AFF',
    dark: '#5A4FCF',
    '10': 'rgba(123, 104, 238, 0.1)',
    '20': 'rgba(123, 104, 238, 0.2)',
    '30': 'rgba(123, 104, 238, 0.3)',
  },
} as const;

// ============================================================================
// SEMANTIC COLORS
// ============================================================================

export const semanticColors = {
  success: {
    DEFAULT: '#00C896',
    light: '#4FD9B7',
    dark: '#008B6D',
    '10': 'rgba(0, 200, 150, 0.1)',
    '20': 'rgba(0, 200, 150, 0.2)',
  },
  
  warning: {
    DEFAULT: '#FF8C42',
    light: '#FFB080',
    dark: '#E66F2A',
    '10': 'rgba(255, 140, 66, 0.1)',
    '20': 'rgba(255, 140, 66, 0.2)',
  },
  
  error: {
    DEFAULT: '#FF6B6B',
    light: '#FF9999',
    dark: '#E63946',
    '10': 'rgba(255, 107, 107, 0.1)',
    '20': 'rgba(255, 107, 107, 0.2)',
  },
  
  info: {
    DEFAULT: '#4A90E2',
    light: '#7BB3F0',
    dark: '#2E5C8A',
    '10': 'rgba(74, 144, 226, 0.1)',
    '20': 'rgba(74, 144, 226, 0.2)',
  },
} as const;

// ============================================================================
// NEUTRAL COLORS (Slate Scale)
// ============================================================================

export const neutralColors = {
  // Backgrounds
  black: '#000000',
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  
  // Specific usage
  midnight: '#0F172A', // Midnight Slate - Card backgrounds
  surface: '#1E293B', // Slate 800 - Elevated surfaces
  border: '#334155', // Slate 700 - Borders
  text: {
    primary: '#FFFFFF',
    secondary: '#CBD5E1', // Slate 300
    tertiary: '#94A3B8', // Slate 400
    muted: '#64748B', // Slate 500
  },
} as const;

// ============================================================================
// SPACING SCALE (4px base unit)
// ============================================================================

export const spacing = {
  xs: '4px',    // 0.25rem
  sm: '8px',    // 0.5rem
  md: '16px',   // 1rem
  lg: '24px',   // 1.5rem
  xl: '32px',   // 2rem
  '2xl': '48px', // 3rem
  '3xl': '64px', // 4rem
  '4xl': '96px', // 6rem
} as const;

// Tailwind spacing scale
export const spacingScale = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Poppins', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],     // 14px
    base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],     // 18px
    xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],      // 20px
    '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 36px
    '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],    // 48px
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.2)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
  
  // Brand-specific shadows
  gold: {
    sm: '0 0 10px rgba(255, 215, 0, 0.2)',
    md: '0 0 20px rgba(255, 215, 0, 0.3)',
    lg: '0 0 30px rgba(255, 215, 0, 0.4)',
  },
  
  purple: {
    sm: '0 0 10px rgba(123, 104, 238, 0.2)',
    md: '0 0 20px rgba(123, 104, 238, 0.3)',
    lg: '0 0 30px rgba(123, 104, 238, 0.4)',
  },
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Common transition strings
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export const designTokens = {
  colors: {
    brand: brandColors,
    semantic: semanticColors,
    neutral: neutralColors,
  },
  spacing,
  spacingScale,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
} as const;

export default designTokens;





