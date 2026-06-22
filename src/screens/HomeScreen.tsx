import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { Snackbar } from '../components/Snackbar';
import { useAppTheme } from '../hooks/useColorScheme';
import { useApp } from '../context/AppContext';
import { RenameListModal } from '../components/RenameListModal';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { RootStackParamList, MasterList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { theme } = useAppTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 16, stiffness: 180 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 }, animStyle]}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: theme.accentDim,
          borderWidth: 1,
          borderColor: theme.accentBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="list" size={36} color={theme.accentText} />
      </View>
      <ThemedText size="xl" weight="bold" style={{ textAlign: 'center' }}>No master lists yet</ThemedText>
      <ThemedText variant="muted" style={{ textAlign: 'center', lineHeight: 22 }}>
        Create a master list with everything you regularly buy — then Scribo will tell you exactly what to get.
      </ThemedText>
      <TouchableOpacity
        onPress={onAdd}
        style={{
          marginTop: 8,
          backgroundColor: theme.accent,
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <ThemedText weight="semibold" style={{ color: '#fff' }}>Create my first list</ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

function MasterListCard({
  list,
  onOpen,
  onShop,
  onRename,
  onDelete,
}: {
  list: MasterList;
  onOpen: () => void;
  onShop: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const { theme } = useAppTheme();
  const count = list.items.length;

  return (
    <TouchableOpacity
      onPress={onOpen}
      activeOpacity={0.75}
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        overflow: 'hidden',
      }}
    >
      {/* Top: name + item count + menu */}
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: theme.accentDim,
            borderWidth: 1,
            borderColor: theme.accentBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="clipboard" size={20} color={theme.accentText} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText size="lg" weight="semibold">{list.name}</ThemedText>
          <ThemedText size="sm" variant="muted" style={{ marginTop: 2 }}>
            {count === 0 ? 'No items yet' : `${count} item${count === 1 ? '' : 's'}`}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={onRename} hitSlop={8} style={{ padding: 4 }}>
          <Feather name="edit-2" size={15} color={theme.textDim} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ padding: 4 }}>
          <Feather name="trash-2" size={15} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Bottom: Go Shopping button */}
      <TouchableOpacity
        onPress={onShop}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: count === 0 ? theme.border : theme.accent,
          paddingVertical: 12,
        }}
      >
        <Feather name="shopping-cart" size={16} color={count === 0 ? theme.textMuted : '#fff'} />
        <ThemedText
          size="sm"
          weight="semibold"
          style={{ color: count === 0 ? theme.textMuted : '#fff' }}
        >
          {count === 0 ? 'Add items first' : 'Start Shopping'}
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function HomeScreen({ navigation, route }: Props) {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { masterLists, isLoading, addMasterList, renameMasterList, deleteMasterList } = useApp();

  const [showCreate, setShowCreate] = useState(false);
  const [renameTarget, setRenameTarget] = useState<MasterList | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MasterList | null>(null);
  const [snack, setSnack] = useState<{ message: string; listId?: string } | null>(null);

  const lastSnackRef = useRef<string | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      const msg = route.params?.snackMessage;
      const lid = route.params?.snackListId;
      if (msg && msg !== lastSnackRef.current) {
        lastSnackRef.current = msg;
        setSnack({ message: msg, listId: lid });
      }
    }, [route.params?.snackMessage, route.params?.snackListId])
  );

  const handleCreate = async (name: string) => {
    setShowCreate(false);
    const list = await addMasterList(name);
    navigation.navigate('MasterList', { masterListId: list.id });
  };

  const handleRenameConfirm = async (name: string) => {
    if (!renameTarget) return;
    await renameMasterList(renameTarget.id, name);
    setRenameTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMasterList(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          {/* Row 1: logo + buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Image
              source={require('../../assets/logo_with_name.png')}
              style={{ height: 44, width: 130, marginLeft: -20 }}
              resizeMode="contain"
              tintColor={theme.accent}
            />

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              onPress={() => navigation.navigate('ShoppingLists')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.card,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 10,
              }}
            >
              <Feather name="shopping-bag" size={15} color={theme.text} />
              <ThemedText size="xs" weight="medium">Lists</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="settings" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Row 2: section label */}
          <ThemedText size="xs" variant="accent" weight="semibold" style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>
            My Lists
          </ThemedText>
        </View>

        {/* Content */}
        {!isLoading && masterLists.length === 0 ? (
          <EmptyState onAdd={() => setShowCreate(true)} />
        ) : (
          <FlatList
            data={masterLists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MasterListCard
                list={item}
                onOpen={() => navigation.navigate('MasterList', { masterListId: item.id })}
                onShop={() => {
                  if (item.items.length > 0) navigation.navigate('StockEntry', { masterListId: item.id });
                }}
                onRename={() => setRenameTarget(item)}
                onDelete={() => setDeleteTarget(item)}
              />
            )}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowCreate(true)}
        activeOpacity={0.85}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 24,
          left: '50%',
          marginLeft: -30,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.accent,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.accent,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <RenameListModal
        visible={showCreate}
        currentName=""
        title="New Master List"
        confirmLabel="Create"
        onConfirm={handleCreate}
        onCancel={() => setShowCreate(false)}
      />

      <RenameListModal
        visible={!!renameTarget}
        currentName={renameTarget?.name ?? ''}
        title="Rename List"
        confirmLabel="Rename"
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameTarget(null)}
      />

      <DeleteConfirmDialog
        visible={!!deleteTarget}
        title="Delete Master List"
        message={`Delete "${deleteTarget?.name}"? All items in this list will be permanently removed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <Snackbar
        visible={!!snack}
        message={snack?.message ?? ''}
        actionLabel={snack?.listId ? 'VIEW' : undefined}
        onAction={snack?.listId ? () => {
          navigation.navigate('ShoppingListDetail', { listId: snack.listId! });
          setSnack(null);
        } : undefined}
        onDismiss={() => setSnack(null)}
        bottomOffset={insets.bottom + 90}
      />
    </ThemedView>
  );
}
