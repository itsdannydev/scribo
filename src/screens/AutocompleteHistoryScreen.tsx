import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { useAppTheme } from '../hooks/useColorScheme';
import { clearHistory, loadHistory } from '../storage/history';
import { ItemHistoryEntry, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AutocompleteHistory'>;

export function AutocompleteHistoryScreen({ navigation }: Props) {
  const { theme, isDark } = useAppTheme();
  const [entries, setEntries] = useState<ItemHistoryEntry[]>([]);

  const reload = useCallback(() => {
    loadHistory().then((h) =>
      setEntries([...h].sort((a, b) => b.useCount - a.useCount || a.name.localeCompare(b.name)))
    );
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleReset = () => {
    Alert.alert(
      'Reset word suggestions?',
      'This will permanently delete all saved words and their usage counts. Your shopping lists will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setEntries([]);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
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
          <ThemedText size="xl" weight="bold" style={{ flex: 1 }}>
            Word Suggestions
          </ThemedText>
          {entries.length > 0 && (
            <TouchableOpacity onPress={handleReset} hitSlop={8}>
              <ThemedText size="sm" weight="medium" variant="danger">
                Reset
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={entries}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <View>
              {/* Explanation card */}
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 20,
                  marginBottom: 20,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: theme.accentBorder,
                  backgroundColor: theme.accentDim,
                  padding: 16,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather name="zap" size={15} color={theme.accentText} />
                  <ThemedText size="sm" weight="semibold" variant="accent">
                    How suggestions work
                  </ThemedText>
                </View>
                <ThemedText size="sm" variant="muted" style={{ lineHeight: 20 }}>
                  When you add an item to any list, its name is saved here. Next time you start typing, the most-used matching word appears greyed-out — tap the arrow to accept it instantly.
                </ThemedText>
                <ThemedText size="sm" variant="muted" style={{ lineHeight: 20 }}>
                  Deleting a list does not remove its words from here. Use Reset to clear everything manually.
                </ThemedText>
              </View>

              {entries.length > 0 && (
                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                  <ThemedText size="xs" weight="semibold" variant="muted" style={{ letterSpacing: 1.2, textTransform: 'uppercase' }}>
                    {entries.length} word{entries.length === 1 ? '' : 's'}
                  </ThemedText>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 24, paddingHorizontal: 32 }}>
              <Feather name="inbox" size={32} color={theme.textMuted} style={{ marginBottom: 12 }} />
              <ThemedText size="sm" variant="muted" style={{ textAlign: 'center', lineHeight: 20 }}>
                No words yet. Start adding items to your lists and they will appear here.
              </ThemedText>
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 16,
                paddingHorizontal: 16,
                paddingVertical: 13,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: index === 0 ? 0 : 0,
                borderTopLeftRadius: index === 0 ? 14 : 0,
                borderTopRightRadius: index === 0 ? 14 : 0,
                borderBottomLeftRadius: index === entries.length - 1 ? 14 : 0,
                borderBottomRightRadius: index === entries.length - 1 ? 14 : 0,
                borderTopWidth: index === 0 ? 1 : 0,
                gap: 12,
              }}
            >
              <ThemedText size="base" weight="medium" style={{ flex: 1 }}>
                {item.name}
              </ThemedText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: theme.accentDim,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Feather name="repeat" size={11} color={theme.accentText} />
                <ThemedText size="xs" weight="semibold" variant="accent">
                  {item.useCount}×
                </ThemedText>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
