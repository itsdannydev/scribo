import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK_THEME, LIGHT_THEME, AppTheme } from '../constants/colors';
import { DEFAULT_ACCENT_HEX, deriveAccentPalette } from '../utils/accentColors';

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_KEY = '@theme_mode_v1';
const ACCENT_KEY = '@accent_color_v1';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  accentHex: string;
  setAccentHex: (hex: string) => void;
  theme: AppTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [accentHex, setAccentHexState] = useState<string>(DEFAULT_ACCENT_HEX);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_KEY),
      AsyncStorage.getItem(ACCENT_KEY),
    ]).then(([mode, accent]) => {
      if (mode === 'light' || mode === 'dark' || mode === 'auto') setThemeModeState(mode);
      if (accent) setAccentHexState(accent);
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const setAccentHex = useCallback((hex: string) => {
    setAccentHexState(hex);
    AsyncStorage.setItem(ACCENT_KEY, hex);
  }, []);

  const isDark = themeMode === 'auto' ? systemScheme === 'dark' : themeMode === 'dark';

  const theme = useMemo<AppTheme>(() => {
    const base = isDark ? DARK_THEME : LIGHT_THEME;
    const accent = deriveAccentPalette(accentHex, isDark);
    return { ...base, ...accent };
  }, [isDark, accentHex]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, accentHex, setAccentHex, theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
