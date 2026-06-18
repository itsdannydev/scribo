import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ui/ThemedText';
import { useAppTheme } from '../hooks/useColorScheme';
import { MasterItem, Unit, ALL_UNITS } from '../types';
import { formatQty } from '../utils/units';

interface MasterItemRowProps {
  item: MasterItem;
  onUpdate: (changes: Partial<Pick<MasterItem, 'name' | 'quantity' | 'unit' | 'notes'>>) => void;
  onDelete: () => void;
}

export function MasterItemRow({ item, onUpdate, onDelete }: MasterItemRowProps) {
  const { theme } = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState<Unit>(item.unit);
  const [notes, setNotes] = useState(item.notes ?? '');

  const handleSave = () => {
    const qty = parseFloat(quantity);
    onUpdate({
      name: name.trim() || item.name,
      quantity: isNaN(qty) || qty <= 0 ? item.quantity : qty,
      unit,
      notes: notes.trim() || undefined,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(item.name);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setNotes(item.notes ?? '');
    setEditing(false);
  };

  if (editing) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          backgroundColor: theme.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.accentBorder,
          padding: 14,
          gap: 10,
        }}
      >
        {/* Name */}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          placeholderTextColor={theme.textMuted}
          style={{
            color: theme.text,
            fontSize: 15,
            fontWeight: '500',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            paddingBottom: 8,
          }}
          autoFocus
        />

        {/* Quantity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ThemedText size="sm" variant="muted" style={{ width: 28 }}>Qty</ThemedText>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholder="1"
            placeholderTextColor={theme.textMuted}
            style={{ color: theme.text, fontSize: 14, flex: 1 }}
          />
        </View>

        {/* Unit chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 38 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {ALL_UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
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
        </ScrollView>

        {/* Notes */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ThemedText size="sm" variant="muted" style={{ width: 36 }}>Note</ThemedText>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional note"
            placeholderTextColor={theme.textMuted}
            style={{ color: theme.text, fontSize: 14, flex: 1 }}
          />
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity
            onPress={handleCancel}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
            }}
          >
            <ThemedText size="sm" weight="medium" variant="muted">Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: theme.accent,
              alignItems: 'center',
            }}
          >
            <ThemedText size="sm" weight="semibold" style={{ color: '#fff' }}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: theme.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 16,
        paddingVertical: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <ThemedText size="base" weight="medium">{item.name}</ThemedText>
        <ThemedText size="sm" variant="accent" style={{ marginTop: 2 }}>
          {formatQty(item.quantity, item.unit)}
        </ThemedText>
        {item.notes ? (
          <ThemedText size="xs" variant="muted" style={{ marginTop: 2, fontStyle: 'italic' }}>
            {item.notes}
          </ThemedText>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => setEditing(true)} hitSlop={8} style={{ padding: 6 }}>
        <Feather name="edit-2" size={16} color={theme.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ padding: 6 }}>
        <Feather name="trash-2" size={16} color={theme.danger} />
      </TouchableOpacity>
    </View>
  );
}
