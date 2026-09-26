'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'amoled' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark' | 'amoled';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vw_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'amoled'>('light');

  const applyTheme = (mode: ThemeMode) => {
    let effective: 'light' | 'dark' | 'amoled' = 'light';

    if (mode === 'system') {
      const isSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = isSystemDark ? 'dark' : 'light';
    } else {
      effective = mode;
    }

    setResolvedTheme(effective);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'amoled');

      if (effective === 'dark') {
        root.classList.add('dark');
      } else if (effective === 'amoled') {
        root.classList.add('dark', 'amoled');
      }
    }
  };

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (savedTheme && ['light', 'dark', 'amoled', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        setThemeState('light');
        applyTheme('light');
      }
    } catch (e) {
      setThemeState('light');
      applyTheme('light');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'light';
      if (current === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setThemeState(newMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {}
    applyTheme(newMode);
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setTheme('dark');
    } else if (resolvedTheme === 'dark') {
      setTheme('amoled');
    } else {
      setTheme('light');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
