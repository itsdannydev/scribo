import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/useColorScheme';

interface InputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { style, leftIcon, rightIcon, containerStyle, ...props },
  ref
) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 0,
        },
        containerStyle,
      ]}
    >
      {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
      <TextInput
        ref={ref}
        style={[
          {
            flex: 1,
            color: theme.text,
            fontSize: 15,
            paddingVertical: 12,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
        {...props}
      />
      {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
    </View>
  );
});
