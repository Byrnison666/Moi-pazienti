import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../theme';
import { AppSettings, ThemeMode } from '../types';
import { loadSettings, saveSettings } from '../storage';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadSettings().then((s: AppSettings) => setModeState(s.themeMode));
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    saveSettings({ themeMode: m });
  };

  const theme = useMemo(() => {
    const effective = mode === 'system' ? (system ?? 'light') : mode;
    return effective === 'dark' ? darkTheme : lightTheme;
  }, [mode, system]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be inside ThemeProvider');
  return ctx;
}
