import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextLayoutEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ui/ThemedText';
import { useAppTheme } from '../hooks/useColorScheme';
import { loadHistory } from '../storage/history';
import { ItemHistoryEntry, Unit, ALL_UNITS } from '../types';

interface AddMasterItemBarProps {
  onAdd: (item: { name: string; quantity: number; unit: Unit; notes?: string }) => void;
}

const DEFAULT_UNIT: Unit = 'nos';

export function AddMasterItemBar({ onAdd }: AddMasterItemBarProps) {
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<Unit>(DEFAULT_UNIT);
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<ItemHistoryEntry[]>([]);
  const [textWidth, setTextWidth] = useState(0);

  const nameRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  const ghostSuggestion = useMemo((): ItemHistoryEntry | null => {
    const q = name.trim();
    if (!q) return null;
    const lower = q.toLowerCase();
    return (
      history
        .filter((e) => e.name.toLowerCase().startsWith(lower) && e.name.length > q.length)
        .sort((a, b) => b.useCount - a.useCount || a.name.localeCompare(b.name))[0] ?? null
    );
  }, [name, history]);

  const acceptSuggestion = () => {
    if (!ghostSuggestion) return;
    setName(ghostSuggestion.name);
    nameRef.current?.focus();
  };

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const qty = parseFloat(quantity) || 1;
    onAdd({ name: trimmedName, quantity: qty, unit, notes: notes.trim() || undefined });
    setName('');
    setQuantity('');
    setUnit(DEFAULT_UNIT);
    setNotes('');
    setExpanded(false);
    nameRef.current?.focus();
    loadHistory().then(setHistory);
  };

  const handleFocus = () => {
    setExpanded(true);
    loadHistory().then(setHistory);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!name && !quantity && !notes) setExpanded(false);
    }, 150);
  };

  const hasText = !!name.trim();

  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingBottom: Platform.OS === 'ios' ? 28 : 16,
      }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        {/* Name row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: expanded ? theme.accentBorder : theme.border,
            borderRadius: 12,
            paddingHorizontal: 14,
            gap: 10,
            marginBottom: expanded ? 8 : 0,
          }}
        >
          <Feather name="plus" size={16} color={theme.textMuted} />

          <View style={{ flex: 1, position: 'relative', height: 44 }}>
            {ghostSuggestion && (
              <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                <TextInput
                  editable={false}
                  value={ghostSuggestion.name}
                  underlineColorAndroid="transparent"
                  style={{ height: 44, fontSize: 15, color: theme.textMuted, opacity: 0.8, backgroundColor: 'transparent' }}
                />
              </View>
            )}

            <TextInput
              ref={nameRef}
              value={name}
              onChangeText={setName}
              placeholder="Item name..."
              placeholderTextColor={theme.textMuted}
              underlineColorAndroid="transparent"
              style={{ height: 44, color: theme.text, fontSize: 15, backgroundColor: 'transparent' }}
              returnKeyType="next"
              blurOnSubmit={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={() => qtyRef.current?.focus()}
            />

            {ghostSuggestion && name ? (
              <Text
                pointerEvents="none"
                onTextLayout={(e: NativeSyntheticEvent<TextLayoutEventData>) => {
                  const line = e.nativeEvent.lines[0];
                  setTextWidth(line ? line.width : 0);
                }}
                style={{ position: 'absolute', left: 0, top: 0, opacity: 0, fontSize: 15, height: 44, textAlignVertical: 'center' }}
              >
                {ghostSuggestion.name}
              </Text>
            ) : null}

            {ghostSuggestion && name.trim() && textWidth > 0 && (
              <TouchableOpacity
                onPress={acceptSuggestion}
                hitSlop={10}
                style={{ position: 'absolute', left: textWidth + 6, top: 0, bottom: 0, justifyContent: 'center' }}
              >
                <Feather name="arrow-right" size={14} color={theme.accent} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick-add circular button (only when collapsed and has text) */}
          {hasText && !expanded && (
            <TouchableOpacity
              onPress={handleAdd}
              hitSlop={8}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: theme.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="check" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quantity + unit row */}
        {expanded && (
          <View
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 6,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ThemedText size="sm" variant="muted" style={{ width: 28 }}>Qty</ThemedText>
              <TextInput
                ref={qtyRef}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
                style={{ flex: 1, color: theme.text, fontSize: 14, paddingVertical: 8 }}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => notesRef.current?.focus()}
                onBlur={handleBlur}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 38 }}>
              <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 6 }}>
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
          </View>
        )}

        {/* Notes row */}
        {expanded && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              gap: 10,
              marginBottom: 10,
            }}
          >
            <ThemedText size="sm" variant="muted" style={{ width: 36 }}>Note</ThemedText>
            <TextInput
              ref={notesRef}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional note"
              placeholderTextColor={theme.textMuted}
              style={{ flex: 1, color: theme.text, fontSize: 14, paddingVertical: 11 }}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              onBlur={handleBlur}
            />
          </View>
        )}

        {/* Full-width Add button (expanded state) */}
        {expanded && (
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.85}
            style={{
              backgroundColor: hasText ? theme.accent : theme.border,
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Feather name="plus-circle" size={17} color={hasText ? '#fff' : theme.textMuted} />
            <ThemedText
              size="base"
              weight="bold"
              style={{ color: hasText ? '#fff' : theme.textMuted }}
            >
              Add Item
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
