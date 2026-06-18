import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { ShoppingItemRow } from '../components/ShoppingItemRow';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAppTheme } from '../hooks/useColorScheme';
import { useApp } from '../context/AppContext';
import { RootStackParamList, Unit, ALL_UNITS } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingListDetail'>;

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function ShoppingListDetailScreen({ navigation, route }: Props) {
  const { theme, isDark } = useAppTheme();
  const { generatedLists, toggleShoppingItem, updateShoppingItemQty, addManualShoppingItem } = useApp();
  const { listId } = route.params;

  const list = generatedLists.find((l) => l.id === listId);

  const [addName, setAddName] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addUnit, setAddUnit] = useState<Unit>('nos');
  const [addNotes, setAddNotes] = useState('');
  const [addExpanded, setAddExpanded] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  const [activeBar, setActiveBar] = useState<'none' | 'add' | 'search'>('none');

  // 0.5 = equal halves, 0.82 = add dominant, 0.18 = search dominant
  const splitProg = useSharedValue(0.5);
  const splitEasing = Easing.inOut(Easing.ease);

  const addSectionStyle = useAnimatedStyle(() => ({ flex: splitProg.value }));
  const searchSectionStyle = useAnimatedStyle(() => ({ flex: 1 - splitProg.value }));

  const setMode = (mode: 'none' | 'add' | 'search') => {
    splitProg.value = withTiming(
      mode === 'add' ? 0.82 : mode === 'search' ? 0.18 : 0.5,
      { duration: 220, easing: splitEasing }
    );
    setActiveBar(mode);
    if (mode === 'add') {
      setAddExpanded(true);
      setSearchQuery('');
    } else {
      setAddExpanded(false);
      setAddName('');
      setAddQty('');
      setAddNotes('');
    }
    if (mode !== 'search') {
      setSearchQuery('');
    }
  };

  const handleAddManual = () => {
    const trimmed = addName.trim();
    if (!trimmed) return;
    addManualShoppingItem(list!.id, {
      name: trimmed,
      quantity: parseFloat(addQty) || 1,
      unit: addUnit,
      notes: addNotes.trim() || undefined,
    });
    setAddUnit('nos');
    setMode('none');
  };

  const { checked, total, sortedItems } = useMemo(() => {
    if (!list) return { checked: 0, total: 0, sortedItems: [] };
    const items = list.items;
    return {
      checked: items.filter((i) => i.checked).length,
      total: items.length,
      sortedItems: [...items.filter((i) => !i.checked), ...items.filter((i) => i.checked)],
    };
  }, [list]);

  const displayItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems;
    const q = searchQuery.toLowerCase();
    return sortedItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [sortedItems, searchQuery]);

  const progress = total > 0 ? checked / total : 0;
  const done = checked === total && total > 0;

  if (!list) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText variant="muted">Shopping list not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled={Platform.OS === 'ios'}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 6,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderMuted,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={8}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="arrow-left" size={18} color={theme.text} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <ThemedText size="xl" weight="bold">{list.masterListName}</ThemedText>
                <ThemedText size="xs" variant="muted">
                  {formatDate(list.generatedAt)} · {formatTime(list.generatedAt)}
                </ThemedText>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ProgressBar progress={progress} height={6} style={{ flex: 1 }} />
              <ThemedText size="xs" weight="semibold" variant={done ? 'accent' : 'muted'}>
                {done ? 'Done!' : `${checked}/${total}`}
              </ThemedText>
            </View>
          </View>

          {/* Done banner */}
          {done && (
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 12,
                backgroundColor: theme.accentDim,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.accentBorder,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Feather name="check-circle" size={20} color={theme.accentText} />
              <ThemedText size="sm" weight="semibold" variant="accent">All done — happy shopping!</ThemedText>
            </View>
          )}

          {/* Items */}
          <FlatList
            data={displayItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ShoppingItemRow
                item={item}
                onToggle={() => toggleShoppingItem(list.id, item.id)}
                onEditQty={(qty, unit) => updateShoppingItemQty(list.id, item.id, qty, unit)}
              />
            )}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              searchQuery.trim() ? (
                <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 32, gap: 8 }}>
                  <Feather name="search" size={26} color={theme.textMuted} />
                  <ThemedText variant="muted" style={{ textAlign: 'center' }}>
                    No items match "{searchQuery}"
                  </ThemedText>
                </View>
              ) : null
            }
          />

          {/* Bottom bar */}
          <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border }}>

            {/* Expanded add form — sits above the split row */}
            {addExpanded && (
              <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}>
                {/* Qty + unit chips */}
                <View
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <ThemedText size="sm" variant="muted" style={{ width: 28 }}>Qty</ThemedText>
                    <TextInput
                      ref={qtyRef}
                      value={addQty}
                      onChangeText={setAddQty}
                      placeholder="1"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="decimal-pad"
                      style={{ flex: 1, color: theme.text, fontSize: 14, paddingVertical: 4 }}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => notesRef.current?.focus()}
                    />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 38 }}>
                    <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 6 }}>
                      {ALL_UNITS.map((u) => (
                        <TouchableOpacity
                          key={u}
                          onPress={() => setAddUnit(u)}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: addUnit === u ? theme.accent : theme.border,
                            backgroundColor: addUnit === u ? theme.accentDim : 'transparent',
                          }}
                        >
                          <ThemedText
                            size="xs"
                            weight={addUnit === u ? 'semibold' : 'normal'}
                            style={{ color: addUnit === u ? theme.accentText : theme.textMuted }}
                          >
                            {u}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Notes */}
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
                  }}
                >
                  <ThemedText size="sm" variant="muted" style={{ width: 36 }}>Note</ThemedText>
                  <TextInput
                    ref={notesRef}
                    value={addNotes}
                    onChangeText={setAddNotes}
                    placeholder="Optional note"
                    placeholderTextColor={theme.textMuted}
                    style={{ flex: 1, color: theme.text, fontSize: 14, paddingVertical: 11 }}
                    returnKeyType="done"
                    onSubmitEditing={handleAddManual}
                  />
                </View>

                {/* Add Item button */}
                <TouchableOpacity
                  onPress={handleAddManual}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: addName.trim() ? theme.accent : theme.border,
                    borderRadius: 12,
                    paddingVertical: 13,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Feather name="plus-circle" size={17} color={addName.trim() ? '#fff' : theme.textMuted} />
                  <ThemedText size="base" weight="bold" style={{ color: addName.trim() ? '#fff' : theme.textMuted }}>
                    Add Item
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Split bar row */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: Platform.OS === 'ios' ? 28 : 14,
                gap: 8,
              }}
            >
              {/* ── Add section ── */}
              <Animated.View style={[{ overflow: 'hidden' }, addSectionStyle]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: activeBar === 'add' ? theme.accentBorder : theme.border,
                    borderRadius: 12,
                    paddingHorizontal: activeBar === 'search' ? 0 : 12,
                    gap: 8,
                  }}
                >
                  {activeBar === 'search' ? (
                    <TouchableOpacity
                      onPress={() => setMode('add')}
                      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Feather name="plus" size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  ) : activeBar === 'add' ? (
                    <>
                      <Feather name="plus" size={15} color={theme.textMuted} />
                      <TextInput
                        ref={nameRef}
                        value={addName}
                        onChangeText={setAddName}
                        placeholder="Item name..."
                        placeholderTextColor={theme.textMuted}
                        underlineColorAndroid="transparent"
                        style={{ flex: 1, color: theme.text, fontSize: 15, height: 44 }}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        autoFocus
                        onSubmitEditing={() => qtyRef.current?.focus()}
                      />
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setMode('add')}
                      activeOpacity={0.7}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <Feather name="plus" size={15} color={theme.textMuted} />
                      <ThemedText size="sm" variant="muted" numberOfLines={1}>Add extra item</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>

              {/* ── Search section ── */}
              <Animated.View style={[{ overflow: 'hidden' }, searchSectionStyle]}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 44,
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: activeBar === 'search' ? theme.accentBorder : theme.border,
                    borderRadius: 12,
                    paddingHorizontal: activeBar === 'add' ? 0 : 12,
                    gap: 8,
                  }}
                >
                  {activeBar === 'add' ? (
                    <TouchableOpacity
                      onPress={() => setMode('search')}
                      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Feather name="search" size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                  ) : activeBar === 'search' ? (
                    <>
                      <Feather name="search" size={15} color={theme.textMuted} />
                      <TextInput
                        ref={searchRef}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search items..."
                        placeholderTextColor={theme.textMuted}
                        underlineColorAndroid="transparent"
                        style={{ flex: 1, color: theme.text, fontSize: 15, height: 44 }}
                        autoFocus
                        returnKeyType="search"
                        onBlur={() => {
                          setTimeout(() => {
                            if (!searchQuery) setMode('none');
                          }, 150);
                        }}
                      />
                      {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                          <Feather name="x" size={16} color={theme.textMuted} />
                        </TouchableOpacity>
                      ) : null}
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setMode('search')}
                      activeOpacity={0.7}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <Feather name="search" size={15} color={theme.textMuted} />
                      <ThemedText size="sm" variant="muted" numberOfLines={1}>Search...</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
