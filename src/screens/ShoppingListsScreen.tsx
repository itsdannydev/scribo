import React, { useState } from 'react';
import { FlatList, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAppTheme } from '../hooks/useColorScheme';
import { useApp } from '../context/AppContext';
import { RootStackParamList, GeneratedList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoppingLists'>;

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function ShoppingTripCard({
  list,
  onPress,
  onDelete,
}: {
  list: GeneratedList;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { theme } = useAppTheme();
  const checked = list.items.filter((i) => i.checked).length;
  const total = list.items.length;
  const progress = total > 0 ? checked / total : 0;
  const done = checked === total && total > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: done ? theme.accentBorder : theme.border,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: done ? theme.accentDim : theme.background,
            borderWidth: 1,
            borderColor: done ? theme.accentBorder : theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name={done ? 'check-circle' : 'shopping-cart'} size={19} color={done ? theme.accentText : theme.textMuted} />
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText size="base" weight="semibold">{list.masterListName}</ThemedText>
          <ThemedText size="xs" variant="muted" style={{ marginTop: 2 }}>
            {formatDate(list.generatedAt)} · {formatTime(list.generatedAt)}
          </ThemedText>
        </View>

        <TouchableOpacity onPress={onDelete} hitSlop={8} style={{ padding: 4 }}>
          <Feather name="trash-2" size={15} color={theme.danger} />
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ProgressBar progress={progress} height={5} style={{ flex: 1 }} />
        <ThemedText size="xs" weight="semibold" variant={done ? 'accent' : 'muted'}>
          {done ? 'Done' : `${checked}/${total}`}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export function ShoppingListsScreen({ navigation }: Props) {
  const { theme, isDark } = useAppTheme();
  const { generatedLists, deleteGeneratedList } = useApp();
  const [deleteTarget, setDeleteTarget] = useState<GeneratedList | null>(null);

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
          <ThemedText size="xl" weight="bold">Shopping Lists</ThemedText>
        </View>

        <FlatList
          data={generatedLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShoppingTripCard
              list={item}
              onPress={() => navigation.navigate('ShoppingListDetail', { listId: item.id })}
              onDelete={() => setDeleteTarget(item)}
            />
          )}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
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
                <Feather name="shopping-bag" size={28} color={theme.accentText} />
              </View>
              <ThemedText size="lg" weight="semibold" style={{ textAlign: 'center' }}>No lists yet</ThemedText>
              <ThemedText variant="muted" style={{ textAlign: 'center', lineHeight: 22 }}>
                After you generate a shopping list, it will appear here.
              </ThemedText>
            </View>
          }
        />
      </SafeAreaView>

      <DeleteConfirmDialog
        visible={!!deleteTarget}
        title="Delete Shopping Trip"
        message={`Delete this trip from ${formatDate(deleteTarget?.generatedAt ?? 0)}?`}
        onConfirm={() => {
          if (deleteTarget) deleteGeneratedList(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </ThemedView>
  );
}
