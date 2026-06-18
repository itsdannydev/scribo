import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useAppTheme } from '../../hooks/useColorScheme';

type Variant = 'primary' | 'ghost' | 'danger' | 'outline' | 'accent-outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  label?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading,
  style,
  disabled,
  leftIcon,
  children,
  ...props
}: ButtonProps) {
  const { theme } = useAppTheme();

  const configs: Record<Variant, { bg: string; border: string; textColor: string }> = {
    primary: { bg: theme.accent, border: 'transparent', textColor: '#ffffff' },
    ghost: { bg: 'transparent', border: 'transparent', textColor: theme.text },
    danger: { bg: theme.danger, border: 'transparent', textColor: '#ffffff' },
    outline: { bg: 'transparent', border: theme.border, textColor: theme.text },
    'accent-outline': {
      bg: 'transparent',
      border: theme.accentBorder,
      textColor: theme.accentText,
    },
  };

  const padding = { sm: { h: 12, v: 7 }, md: { h: 16, v: 10 }, lg: { h: 20, v: 14 } };
  const fontSize = { sm: 'sm', md: 'base', lg: 'lg' } as const;

  const cfg = configs[variant];
  const pad = padding[size];

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          borderWidth: variant === 'outline' || variant === 'accent-outline' ? 1 : 0,
          borderRadius: 10,
          paddingHorizontal: pad.h,
          paddingVertical: pad.v,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: leftIcon ? 6 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={cfg.textColor} />
      ) : (
        <>
          {leftIcon}
          {children ?? (
            <ThemedText
              style={{ color: cfg.textColor }}
              size={fontSize[size]}
              weight="semibold"
            >
              {label}
            </ThemedText>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
