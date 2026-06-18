import { AppTheme } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export function useAppTheme(): {
  theme: AppTheme;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
} {
  const { theme, isDark } = useTheme();
  return { theme, isDark, colorScheme: isDark ? 'dark' : 'light' };
}
