import React from 'react';
import { View, ViewProps } from 'react-native';
import { useAppTheme } from '../../hooks/useColorScheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'card';
}

export function ThemedView({ style, variant = 'background', ...props }: ThemedViewProps) {
  const { theme } = useAppTheme();

  const bg =
    variant === 'card'
      ? theme.card
      : variant === 'surface'
      ? theme.surface
      : theme.background;

  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
