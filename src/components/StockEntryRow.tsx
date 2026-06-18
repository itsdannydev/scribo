import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ui/ThemedText';
import { useAppTheme } from '../hooks/useColorScheme';
import { MasterItem, Unit } from '../types';
import { getCompatibleUnits, formatQty } from '../utils/units';

interface StockEntryRowProps {
  item: MasterItem;
  quantity: string;
  unit: Unit;
  onQuantityChange: (qty: string) => void;
  onUnitChange: (unit: Unit) => void;
}

export function StockEntryRow({ item, quantity, unit, onQuantityChange, onUnitChange }: StockEntryRowProps) {
  const { theme } = useAppTheme();
  const compatibleUnits = getCompatibleUnits(item.unit);

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: theme.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
      }}
    >
      {/* Item name + master target */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <ThemedText size="base" weight="medium" style={{ flex: 1 }}>{item.name}</ThemedText>
        <ThemedText size="xs" variant="muted">need {formatQty(item.quantity, item.unit)}</ThemedText>
      </View>

      {/* I have: input + unit */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ThemedText size="sm" variant="muted">I have</ThemedText>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.background,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: quantity ? theme.accentBorder : theme.border,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <TextInput
            value={quantity}
            onChangeText={onQuantityChange}
            placeholder={String(item.quantity)}
            placeholderTextColor={theme.textMuted}
            keyboardType="decimal-pad"
            style={{ color: theme.text, fontSize: 14, padding: 0 }}
          />
        </View>

        {/* Unit chips — only compatible units */}
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {compatibleUnits.map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => onUnitChange(u)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: unit === u ? theme.accent : theme.border,
                backgroundColor: unit === u ? theme.accentDim : 'transparent',
              }}
            >
              <ThemedText
                size="xs"
                weight={unit === u ? 'semibold' : 'normal'}
                style={{ color: unit === u ? theme.accentText : theme.textMuted }}
              >
                {u}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
