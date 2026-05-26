'use client';

import { createContext, useContext, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryLighter: string;
  secondary: string;
  accent: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
}

const THEME: ThemeColors = {
  primary: '#10B981',
  primaryLight: '#6EE7B7',
  primaryLighter: '#ECFDF5',
  secondary: '#059669',
  accent: '#059669',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
};

const COLOR_THEMES: Record<string, ThemeColors> = {
  pink: THEME,
  purple: THEME,
  blue: THEME,
  green: THEME,
  peach: THEME,
  lavender: THEME,
};

interface ThemeContextType {
  colors: ThemeColors;
  colorName: string;
  setColorTheme: (color: string) => void;
  shape: string;
  setShape: (shape: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  initialColor = 'green',
  initialShape = 'circle'
}: { 
  children: ReactNode;
  initialColor?: string;
  initialShape?: string;
}) {
  return (
    <ThemeContext.Provider value={{
      colors: THEME,
      colorName: 'green',
      setColorTheme: () => {},
      shape: 'circle',
      setShape: () => {},
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      colors: THEME,
      colorName: 'green',
      setColorTheme: () => {},
      shape: 'circle',
      setShape: () => {},
    };
  }
  return context;
}

export { COLOR_THEMES };
