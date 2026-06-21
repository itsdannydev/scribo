import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  LinearTransition,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from './ui/ThemedText';
import { Checkbox } from './ui/Checkbox';
import { useAppTheme } from '../hooks/useColorScheme';
import { ShoppingListItem } from '../types';
import { formatQty } from '../utils/units';

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onToggle: () => void;
  onPartialBuy: () => void;
}

const STRIKE_DURATION = 260;
const REORDER_DELAY = 320;

export function ShoppingItemRow({ item, onToggle, onPartialBuy }: ShoppingItemRowProps) {
  const { theme } = useAppTheme();

  const [pendingCheck, setPendingCheck] = useState(false);
  const isChecked = item.checked || pendingCheck;

  const [nameWidth, setNameWidth] = useState(0);

  const strikeProgress = useSharedValue(isChecked ? 1 : 0);
  const opacity = useSharedValue(isChecked ? 0.55 : 1);

  useEffect(() => {
    const easing = Easing.inOut(Easing.ease);
    strikeProgress.value = withTiming(isChecked ? 1 : 0, { duration: STRIKE_DURATION, easing });
    opacity.value = withTiming(isChecked ? 0.55 : 1, { duration: STRIKE_DURATION, easing });
  }, [isChecked]);

  const strikeStyle = useAnimatedStyle(() => ({
    width: strikeProgress.value * nameWidth,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleToggle = () => {
    if (!item.checked) {
      setPendingCheck(true);
      setTimeout(() => {
        setPendingCheck(false);
        onToggle();
      }, REORDER_DELAY);
    } else {
      onToggle();
    }
  };

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(35).stiffness(180)}
      style={[
        {
          marginHorizontal: 16,
          marginBottom: 8,
          backgroundColor: theme.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: isChecked ? theme.borderMuted : theme.border,
        },
        containerStyle,
      ]}
    >
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={1}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <Checkbox checked={isChecked} onToggle={handleToggle} size={24} />

        <View
          style={{ flex: 1 }}
          onLayout={(e) => setNameWidth(e.nativeEvent.layout.width)}
        >
          <View>
            <ThemedText
              size="base"
              weight="medium"
              style={{ color: isChecked ? theme.textMuted : theme.text }}
            >
              {item.name}
            </ThemedText>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  height: 1.5,
                  top: 11,
                  left: 0,
                  borderRadius: 1,
                  backgroundColor: theme.textMuted,
                },
                strikeStyle,
              ]}
            />
          </View>

          {item.notes ? (
            <ThemedText size="xs" variant="muted" style={{ marginTop: 2, fontStyle: 'italic' }}>
              {item.notes}
            </ThemedText>
          ) : null}
        </View>

        {/* Quantity badge */}
        {!isChecked ? (
          <TouchableOpacity
            onPress={onPartialBuy}
            style={{
              backgroundColor: theme.accentDim,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: theme.accentBorder,
            }}
          >
            <ThemedText size="sm" weight="semibold" style={{ color: theme.accentText }}>
              {formatQty(item.quantity, item.unit)}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <ThemedText size="sm" weight="semibold" style={{ color: theme.textMuted }}>
              {formatQty(item.quantity, item.unit)}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}
