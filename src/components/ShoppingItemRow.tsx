import React, { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
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
import { ShoppingListItem, Unit, ALL_UNITS } from '../types';
import { formatQty } from '../utils/units';

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onToggle: () => void;
  onEditQty: (quantity: number, unit: Unit) => void;
}

const STRIKE_DURATION = 260;
const REORDER_DELAY = 320;

export function ShoppingItemRow({ item, onToggle, onEditQty }: ShoppingItemRowProps) {
  const { theme } = useAppTheme();
  const [editingQty, setEditingQty] = useState(false);
  const [qtyInput, setQtyInput] = useState(String(item.quantity));
  const [unitInput, setUnitInput] = useState<Unit>(item.unit);

  // Optimistic visual state — lets strikethrough animate before the real reorder
  const [pendingCheck, setPendingCheck] = useState(false);
  const isChecked = item.checked || pendingCheck;

  // Name container width measured via onLayout (percentage width unreliable in Reanimated 4)
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
      // Checking: animate strikethrough first, then let the list reorder
      setPendingCheck(true);
      setTimeout(() => {
        setPendingCheck(false);
        onToggle();
      }, REORDER_DELAY);
    } else {
      // Unchecking: reorder immediately, strikethrough reverses via useEffect
      onToggle();
    }
  };

  const handleSaveQty = () => {
    const qty = parseFloat(qtyInput);
    if (!isNaN(qty) && qty > 0) onEditQty(qty, unitInput);
    setEditingQty(false);
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
          {/* Name + animated strikethrough */}
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
            onPress={() => {
              setQtyInput(String(item.quantity));
              setUnitInput(item.unit);
              setEditingQty((v) => !v);
            }}
            style={{
              backgroundColor: editingQty ? theme.accentBorder : theme.accentDim,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: editingQty ? theme.accent : theme.accentBorder,
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

      {/* Inline qty editor */}
      {editingQty && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            borderTopWidth: 1,
            borderTopColor: theme.borderMuted,
            paddingTop: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <ThemedText size="xs" variant="muted" style={{ width: 28 }}>Qty</ThemedText>
            <TextInput
              value={qtyInput}
              onChangeText={setQtyInput}
              keyboardType="decimal-pad"
              autoFocus
              style={{
                flex: 1,
                color: theme.text,
                fontSize: 14,
                borderBottomWidth: 1,
                borderBottomColor: theme.accentBorder,
                paddingVertical: 4,
              }}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 38, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {ALL_UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnitInput(u)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: unitInput === u ? theme.accent : theme.border,
                    backgroundColor: unitInput === u ? theme.accentDim : 'transparent',
                  }}
                >
                  <ThemedText
                    size="xs"
                    weight={unitInput === u ? 'semibold' : 'normal'}
                    style={{ color: unitInput === u ? theme.accentText : theme.textMuted }}
                  >
                    {u}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 38 }}>
            <TouchableOpacity
              onPress={() => setEditingQty(false)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <ThemedText size="xs" variant="muted">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveQty}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.accent,
              }}
            >
              <ThemedText size="xs" weight="semibold" style={{ color: '#fff' }}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
