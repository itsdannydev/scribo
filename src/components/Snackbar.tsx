import React, { useEffect, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Easing as RNEasing,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { ThemedText } from './ui/ThemedText';
import { useAppTheme } from '../hooks/useColorScheme';

const RING_SIZE = 28;
const RING_STROKE = 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

function CountdownRing({ durationMs }: { durationMs: number }) {
  const { theme } = useAppTheme();
  const offset = useRef(new RNAnimated.Value(0)).current;
  const [seconds, setSeconds] = useState(Math.ceil(durationMs / 1000));

  useEffect(() => {
    // Drain the arc
    RNAnimated.timing(offset, {
      toValue: CIRCUMFERENCE,
      duration: durationMs,
      easing: RNEasing.linear,
      useNativeDriver: false,
    }).start();

    // Count down seconds
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      {/* Track ring — always full, dim */}
      <Circle
        cx={cx}
        cy={cy}
        r={RING_RADIUS}
        stroke={theme.border}
        strokeWidth={RING_STROKE}
        fill="none"
      />
      {/* Draining arc — SVG rotate so it starts from 12 o'clock */}
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={RING_RADIUS}
        stroke={theme.accent}
        strokeWidth={RING_STROKE}
        fill="none"
        strokeDasharray={`${CIRCUMFERENCE}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90, ${cx}, ${cy})`}
      />
      {/* Countdown digit — centered, not rotated */}
      <SvgText
        x={cx}
        y={cy + 3.5}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill={theme.textMuted}
      >
        {seconds > 0 ? seconds : ''}
      </SvgText>
    </Svg>
  );
}

interface SnackbarProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  bottomOffset?: number;
  durationMs?: number;
}

export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  bottomOffset = 24,
  durationMs = 4000,
}: SnackbarProps) {
  const { theme } = useAppTheme();
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 220 });
      opacity.value = withTiming(1, { duration: 220 });
      const timer = setTimeout(() => onDismiss(), durationMs);
      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(80, { duration: 180 });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        {
          position: 'absolute',
          bottom: bottomOffset,
          left: 16,
          right: 16,
          backgroundColor: theme.card,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 13,
          paddingHorizontal: 16,
          gap: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        },
        style,
      ]}
    >
      <ThemedText size="sm" style={{ flex: 1 }}>
        {message}
      </ThemedText>

      {/* Ring remounts each time visible becomes true, resetting the animation */}
      {visible && <CountdownRing key={message} durationMs={durationMs} />}

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={() => {
            onAction();
            onDismiss();
          }}
          hitSlop={8}
        >
          <ThemedText size="sm" weight="bold" variant="accent">
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
