'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only access browser APIs after mount
    if (typeof window === 'undefined') return;
    
    try {
      // Check localStorage for saved theme preference
      const savedTheme = localStorage.getItem('mentark-theme') as Theme | null;
      // Default to dark theme - only use saved preference if it's 'dark'
      // This ensures dark is always the default, even if 'light' was previously saved
      if (savedTheme === 'dark') {
        setThemeState('dark');
      } else {
        // Default to dark and clear any 'light' preference
        setThemeState('dark');
        if (savedTheme === 'light') {
          localStorage.removeItem('mentark-theme');
        }
      }
    } catch (error) {
      console.error('Error reading theme from localStorage:', error);
      // Default to dark theme if there's an error
      setThemeState('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      // Apply theme to document via data-theme attribute
      // This is the only thing we need - CSS variables handle the rest
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('mentark-theme', theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // During SSR or before mount, render children without theme initialization
  // The theme will be applied after mount
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

