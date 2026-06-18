import React, { useEffect, useState } from 'react';
import { View, LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useColorScheme';

interface ProgressBarProps {
  progress: number; // 0–1
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, height = 4, style }: ProgressBarProps) {
  const { theme } = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withTiming(
      Math.min(Math.max(progress, 0), 1) * containerWidth,
      { duration: 500 }
    );
  }, [progress, containerWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: animWidth.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    animWidth.value = Math.min(Math.max(progress, 0), 1) * w;
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          height,
          backgroundColor: theme.border,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: theme.accent,
            borderRadius: height / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
