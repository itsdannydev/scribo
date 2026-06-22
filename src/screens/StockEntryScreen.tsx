import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { StockEntryRow } from '../components/StockEntryRow';
import { useAppTheme } from '../hooks/useColorScheme';
import { useApp } from '../context/AppContext';
import { RootStackParamList, Unit, ALL_UNITS } from '../types';
import { StockMap } from '../utils/generateList';
import { formatQty } from '../utils/units';
import { hapticSuccess } from '../utils/haptics';
import { useSettings } from '../hooks/useSettings';

type Props = NativeStackScreenProps<RootStackParamList, 'StockEntry'>;

interface ExtraItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  notes: string;
}

function ExtraItemsList({
  items,
  onRemove,
}: {
  items: ExtraItem[];
  onRemove: (id: string) => void;
}) {
  const { theme } = useAppTheme();
  if (items.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
        <ThemedText size="xs" variant="muted" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
          Extra Items
        </ThemedText>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
      </View>
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.accentBorder,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 8,
            gap: 10,
          }}
        >
          <Feather name="plus-circle" size={15} color={theme.accentText} />
          <View style={{ flex: 1 }}>
            <ThemedText size="sm" weight="semibold">{item.name}</ThemedText>
            <ThemedText size="xs" variant="muted">
              {formatQty(item.quantity, item.unit)}{item.notes ? ` · ${item.notes}` : ''}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => onRemove(item.id)} hitSlop={8}>
            <Feather name="x" size={16} color={theme.danger} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export function StockEntryScreen({ navigation, route }: Props) {
  const { theme, isDark } = useAppTheme();
  const { settings } = useSettings();
  const { masterLists, generateList } = useApp();
  const { masterListId } = route.params;

  const list = masterLists.find((l) => l.id === masterListId);

  const [stockQtys, setStockQtys] = useState<Record<string, string>>({});
  const [stockUnits, setStockUnits] = useState<Record<string, Unit>>(() => {
    const initial: Record<string, Unit> = {};
    list?.items.forEach((item) => {
      initial[item.id] = item.unit;
    });
    return initial;
  });
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [generating, setGenerating] = useState(false);

  // Add extra item state
  const [addName, setAddName] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addUnit, setAddUnit] = useState<Unit>('nos');
  const [addNotes, setAddNotes] = useState('');
  const [addExpanded, setAddExpanded] = useState(false);
  const flatListRef = useRef<any>(null);
  const nameRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  // Split bar
  const [activeBar, setActiveBar] = useState<'none' | 'add' | 'search'>('none');
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
      setAddUnit('nos');
    }
    if (mode !== 'search') {
      setSearchQuery('');
    }
  };

  const handleAddExtra = () => {
    if (!addName.trim()) return;
    setExtraItems((prev) => [
      ...prev,
      { id: randomUUID(), name: addName.trim(), quantity: parseFloat(addQty) || 1, unit: addUnit, notes: addNotes },
    ]);
    setAddUnit('nos');
    setMode('none');
    Keyboard.dismiss();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const displayItems = useMemo(() => {
    if (!list) return [];
    if (!searchQuery.trim()) return list.items;
    const q = searchQuery.toLowerCase();
    return list.items.filter((i) => i.name.toLowerCase().includes(q));
  }, [list, searchQuery]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const stock: StockMap = {};
      list!.items.forEach((item) => {
        const raw = stockQtys[item.id] ?? '';
        if (raw.trim() === '') {
          stock[item.id] = { quantity: Infinity, unit: stockUnits[item.id] ?? item.unit };
        } else {
          const qty = parseFloat(raw);
          if (!isNaN(qty)) {
            stock[item.id] = { quantity: qty, unit: stockUnits[item.id] ?? item.unit };
          }
        }
      });

      const generated = await generateList(
        list!.id,
        stock,
        extraItems.map((e) => ({ name: e.name, quantity: e.quantity, unit: e.unit, notes: e.notes || undefined }))
      );

      if (generated.items.length === 0) {
        Alert.alert(
          'You have everything!',
          'Your stock covers everything in this master list. Nothing needs to be bought.',
          [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
        return;
      }

      hapticSuccess(settings.haptics ?? true);
      navigation.navigate('Home', { snackMessage: 'Shopping list generated', snackListId: generated.id });
    } catch {
      Alert.alert('Error', 'Could not generate list. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!list) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText variant="muted">List not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 6,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderMuted,
              gap: 12,
            }}
          >
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
              <ThemedText size="xl" weight="bold">What do you have?</ThemedText>
              <ThemedText size="sm" variant="muted">for {list.name}</ThemedText>
            </View>
          </View>

          {/* Hint */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              marginBottom: 4,
              backgroundColor: theme.accentDim,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.accentBorder,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Feather name="info" size={14} color={theme.accentText} />
            <ThemedText size="xs" variant="accent" style={{ flex: 1, lineHeight: 18 }}>
              Leave empty to skip an item. Enter 0 if you have none.
            </ThemedText>
          </View>

          {/* Stock entry list */}
          <FlatList
            ref={flatListRef}
            data={displayItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StockEntryRow
                item={item}
                quantity={stockQtys[item.id] ?? ''}
                unit={stockUnits[item.id] ?? item.unit}
                onQuantityChange={(qty) => setStockQtys((prev) => ({ ...prev, [item.id]: qty }))}
                onUnitChange={(u) => setStockUnits((prev) => ({ ...prev, [item.id]: u }))}
              />
            )}
            ListFooterComponent={
              <ExtraItemsList items={extraItems} onRemove={(id) => setExtraItems((p) => p.filter((e) => e.id !== id))} />
            }
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 16 }}
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

          {/* Bottom area */}
          <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border }}>

            {/* Expanded add form */}
            {addExpanded && (
              <ScrollView keyboardShouldPersistTaps="always" style={{ maxHeight: 260 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}>
                {/* Cancel row */}
                <TouchableOpacity
                  onPress={() => { setMode('none'); nameRef.current?.blur(); }}
                  hitSlop={8}
                  style={{ alignSelf: 'flex-end', padding: 4 }}
                >
                  <Feather name="x" size={18} color={theme.textMuted} />
                </TouchableOpacity>
                {/* Qty + unit chips */}
                <Pressable
                  onPress={() => qtyRef.current?.focus()}
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
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
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" style={{ marginLeft: 38 }}>
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
                </Pressable>

                {/* Notes */}
                <Pressable
                  onPress={() => notesRef.current?.focus()}
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
                    onSubmitEditing={handleAddExtra}
                  />
                </Pressable>

                {/* Add Extra Item button */}
                <TouchableOpacity
                  onPress={handleAddExtra}
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
                    Add Extra Item
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Split bar row */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingTop: 10,
                paddingBottom: 10,
                gap: 8,
              }}
            >
              {/* ── Add extra item section ── */}
              <Animated.View style={[{ overflow: 'hidden' }, addSectionStyle]}>
                <Pressable
                  onPress={() => nameRef.current?.focus()}
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
                </Pressable>
              </Animated.View>

              {/* ── Search section ── */}
              <Animated.View style={[{ overflow: 'hidden' }, searchSectionStyle]}>
                <Pressable
                  onPress={() => searchRef.current?.focus()}
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
                </Pressable>
              </Animated.View>
            </View>

            {/* Generate button — hidden while add bar is expanded */}
            {!addExpanded && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 12,
                }}
              >
                <TouchableOpacity
                  onPress={generating ? undefined : handleGenerate}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: generating ? theme.border : theme.accent,
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 10,
                  }}
                >
                  <Feather name="shopping-cart" size={20} color={generating ? theme.textMuted : '#fff'} />
                  <ThemedText size="base" weight="bold" style={{ color: generating ? theme.textMuted : '#fff' }}>
                    {generating ? 'Generating…' : 'Generate Shopping List'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
