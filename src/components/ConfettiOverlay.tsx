import React, { useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#f97316', '#34d399'];
const COUNT = 28;

interface ParticleConfig {
  x: number;
  drift: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const PARTICLES: ParticleConfig[] = Array.from({ length: COUNT }, (_, i) => ({
  x: seededRand(i * 3) * W,
  drift: (seededRand(i * 3 + 1) - 0.5) * 80,
  color: COLORS[i % COLORS.length],
  size: 7 + seededRand(i * 3 + 2) * 7,
  delay: seededRand(i * 5) * 600,
  duration: 1800 + seededRand(i * 7) * 800,
}));

function Particle({ config }: { config: ParticleConfig }) {
  const y = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(config.delay, withTiming(1, { duration: 150 }));
    y.value = withDelay(config.delay, withTiming(H + 40, { duration: config.duration }));
    rotate.value = withDelay(config.delay, withTiming(720, { duration: config.duration }));
  }, []);

  const style = useAnimatedStyle(() => {
    const progress = (y.value + 20) / (H + 60);
    return {
      position: 'absolute' as const,
      left: config.x + config.drift * progress,
      top: y.value,
      width: config.size,
      height: config.size,
      borderRadius: config.size / 4,
      backgroundColor: config.color,
      opacity: opacity.value * (progress > 0.75 ? 1 - (progress - 0.75) / 0.25 : 1),
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  return <Animated.View style={style} />;
}

interface ConfettiOverlayProps {
  onDone: () => void;
}

export function ConfettiOverlay({ onDone }: ConfettiOverlayProps) {
  useEffect(() => {
    const maxDuration = Math.max(...PARTICLES.map((p) => p.delay + p.duration));
    const timer = setTimeout(onDone, maxDuration + 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {PARTICLES.map((p, i) => (
        <Particle key={i} config={p} />
      ))}
    </View>
  );
}
