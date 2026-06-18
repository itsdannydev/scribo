import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useColorScheme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export function Checkbox({ checked, onToggle, size = 24 }: CheckboxProps) {
  const { theme } = useAppTheme();
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 180 });
    scale.value = withSpring(checked ? 1.2 : 1, { damping: 8, stiffness: 200 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
  }, [checked]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: progress.value > 0.5 ? theme.accent : 'transparent',
    borderColor: progress.value > 0.5 ? theme.accent : theme.border,
  }));

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7} hitSlop={8}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: 7,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
          },
          containerStyle,
        ]}
      >
        {checked && (
          <Feather name="check" size={size * 0.58} color="#fff" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
