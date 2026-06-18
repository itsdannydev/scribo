import React from 'react';
import { Text, TextProps } from 'react-native';
import { useAppTheme } from '../../hooks/useColorScheme';

type Variant = 'default' | 'secondary' | 'muted' | 'dim' | 'accent' | 'danger';
type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
type Weight = 'normal' | 'medium' | 'semibold' | 'bold';

const FONT_SIZES: Record<Size, number> = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

const FONT_WEIGHTS: Record<Weight, string> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

interface ThemedTextProps extends TextProps {
  variant?: Variant;
  size?: Size;
  weight?: Weight;
  handwriting?: boolean;
  strikethrough?: boolean;
}

function getHandwritingFont(children: React.ReactNode): string {
  const text = String(children ?? '');
  return /[ഀ-ൿ]/.test(text) ? 'Chilanka_400Regular' : 'ComicNeue_400Regular';
}

export function ThemedText({
  style,
  variant = 'default',
  size = 'base',
  weight = 'normal',
  handwriting = false,
  strikethrough = false,
  ...props
}: ThemedTextProps) {
  const { theme } = useAppTheme();

  const color: Record<Variant, string> = {
    default: theme.text,
    secondary: theme.textSecondary,
    muted: theme.textMuted,
    dim: theme.textDim,
    accent: theme.accentText,
    danger: theme.danger,
  };

  return (
    <Text
      style={[
        {
          color: color[variant],
          fontSize: FONT_SIZES[size],
          fontWeight: FONT_WEIGHTS[weight] as any,
          fontFamily: handwriting ? getHandwritingFont(props.children) : undefined,
          textDecorationLine: strikethrough ? 'line-through' : 'none',
        },
        style,
      ]}
      {...props}
    />
  );
}
