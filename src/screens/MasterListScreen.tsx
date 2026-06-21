import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TextLayoutEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { MasterItemRow } from '../components/MasterItemRow';
import { RenameListModal } from '../components/RenameListModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { useAppTheme } from '../hooks/useColorScheme';
import { useApp } from '../context/AppContext';
import { loadHistory } from '../storage/history';
import { RootStackParamList, MasterItem, Unit, ALL_UNITS, ItemHistoryEntry } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MasterList'>;

export function MasterListScreen({ navigation, route }: Props) {
  const { theme, isDark } = useAppTheme();
  const { masterLists, addMasterItem, updateMasterItem, deleteMasterItem, renameMasterList, deleteMasterList } = useApp();
  const { masterListId } = route.params;

  const list = masterLists.find((l) => l.id === masterListId);

  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteListVisible, setDeleteListVisible] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState<MasterItem | null>(null);

  // Add item state
  const [addName, setAddName] = useState('');
  const [addQty, setAddQty] = useState('');
  const [addUnit, setAddUnit] = useState<Unit>('nos');
  const [addNotes, setAddNotes] = useState('');
  const [addExpanded, setAddExpanded] = useState(false);
  const [history, setHistory] = useState<ItemHistoryEntry[]>([]);
  const [textWidth, setTextWidth] = useState(0);
  const nameRef = useRef<TextInput>(null);
  const qtyRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);
  const flatListRef = useRef<any>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  // Split bar state
  const [activeBar, setActiveBar] = useState<'none' | 'add' | 'search'>('none');
  const splitProg = useSharedValue(0.5);
  const splitEasing = Easing.inOut(Easing.ease);

  const addSectionStyle = useAnimatedStyle(() => ({ flex: splitProg.value }));
  const searchSectionStyle = useAnimatedStyle(() => ({ flex: 1 - splitProg.value }));

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  const ghostSuggestion = useMemo((): ItemHistoryEntry | null => {
    const q = addName.trim();
    if (!q || activeBar !== 'add') return null;
    const lower = q.toLowerCase();
    return (
      history
        .filter((e) => e.name.toLowerCase().startsWith(lower) && e.name.length > q.length)
        .sort((a, b) => b.useCount - a.useCount || a.name.localeCompare(b.name))[0] ?? null
    );
  }, [addName, history, activeBar]);

  const setMode = (mode: 'none' | 'add' | 'search') => {
    splitProg.value = withTiming(
      mode === 'add' ? 0.82 : mode === 'search' ? 0.18 : 0.5,
      { duration: 220, easing: splitEasing }
    );
    setActiveBar(mode);
    if (mode === 'add') {
      setAddExpanded(true);
      loadHistory().then(setHistory);
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

  const handleAdd = () => {
    const trimmed = addName.trim();
    if (!trimmed) return;
    addMasterItem(list!.id, {
      name: trimmed,
      quantity: parseFloat(addQty) || 1,
      unit: addUnit,
      notes: addNotes.trim() || undefined,
    });
    setAddName('');
    setAddQty('');
    setAddNotes('');
    setAddUnit('nos');
    loadHistory().then(setHistory);
    nameRef.current?.focus();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const displayItems = useMemo(() => {
    if (!list) return [];
    if (!searchQuery.trim()) return list.items;
    const q = searchQuery.toLowerCase();
    return list.items.filter((i) => i.name.toLowerCase().includes(q));
  }, [list, searchQuery]);

  const handleDeleteList = async () => {
    await deleteMasterList(list!.id);
    setDeleteListVisible(false);
    navigation.goBack();
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
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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

            <TouchableOpacity onPress={() => setRenameVisible(true)} style={{ flex: 1 }} activeOpacity={0.7}>
              <ThemedText size="xl" weight="bold">{list.name}</ThemedText>
              <ThemedText size="xs" variant="muted">tap to rename</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteListVisible(true)}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.danger + '44',
                backgroundColor: theme.dangerDim,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="trash-2" size={16} color={theme.danger} />
            </TouchableOpacity>
          </View>

          {/* Items */}
          <FlatList
            ref={flatListRef}
            data={displayItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MasterItemRow
                item={item}
                onUpdate={(changes) => updateMasterItem(list.id, item.id, changes)}
                onDelete={() => setDeleteItemTarget(item)}
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
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 12 }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 20,
                      backgroundColor: theme.accentDim,
                      borderWidth: 1,
                      borderColor: theme.accentBorder,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Feather name="package" size={28} color={theme.accentText} />
                  </View>
                  <ThemedText size="lg" weight="semibold" style={{ textAlign: 'center' }}>
                    No items yet
                  </ThemedText>
                  <ThemedText variant="muted" style={{ textAlign: 'center', lineHeight: 22 }}>
                    Add everything you regularly need — milk, rice, vegetables, whatever you always want stocked up.
                  </ThemedText>
                </View>
              )
            }
          />

          {/* Bottom bar */}
          <View style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border }}>

            {/* Expanded add form — above the split row */}
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
                    onSubmitEditing={handleAdd}
                  />
                </View>

                {/* Add Item button */}
                <TouchableOpacity
                  onPress={handleAdd}
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
              </ScrollView>
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
                    // Name input with ghost suggestion
                    <>
                      <Feather name="plus" size={15} color={theme.textMuted} />
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
                          value={addName}
                          onChangeText={setAddName}
                          placeholder="Item name..."
                          placeholderTextColor={theme.textMuted}
                          underlineColorAndroid="transparent"
                          style={{ height: 44, color: theme.text, fontSize: 15, backgroundColor: 'transparent' }}
                          returnKeyType="next"
                          blurOnSubmit={false}
                          autoFocus
                          onSubmitEditing={() => qtyRef.current?.focus()}
                        />
                        {ghostSuggestion && addName ? (
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
                        {ghostSuggestion && addName.trim() && textWidth > 0 && (
                          <TouchableOpacity
                            onPress={() => {
                              setAddName(ghostSuggestion.name);
                              nameRef.current?.focus();
                            }}
                            hitSlop={10}
                            style={{ position: 'absolute', left: textWidth + 6, top: 0, bottom: 0, justifyContent: 'center' }}
                          >
                            <Feather name="arrow-right" size={14} color={theme.accent} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => setMode('add')}
                      activeOpacity={0.7}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <Feather name="plus" size={15} color={theme.textMuted} />
                      <ThemedText size="sm" variant="muted" numberOfLines={1}>Add item</ThemedText>
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

      <RenameListModal
        visible={renameVisible}
        currentName={list.name}
        title="Rename List"
        confirmLabel="Rename"
        onConfirm={async (name) => {
          await renameMasterList(list.id, name);
          setRenameVisible(false);
        }}
        onCancel={() => setRenameVisible(false)}
      />

      <DeleteConfirmDialog
        visible={deleteListVisible}
        title="Delete Master List"
        message={`Delete "${list.name}"? All items in this list will be permanently removed.`}
        onConfirm={handleDeleteList}
        onCancel={() => setDeleteListVisible(false)}
      />

      <DeleteConfirmDialog
        visible={!!deleteItemTarget}
        title="Remove Item"
        message={`Remove "${deleteItemTarget?.name}" from this list?`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteItemTarget) deleteMasterItem(list.id, deleteItemTarget.id);
          setDeleteItemTarget(null);
        }}
        onCancel={() => setDeleteItemTarget(null)}
      />
    </ThemedView>
  );
}
