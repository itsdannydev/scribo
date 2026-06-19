import React, { useState } from 'react';
import { Alert, Image, View, TouchableOpacity, ScrollView, StatusBar, Switch } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { useAppTheme } from '../hooks/useColorScheme';
import { useSettings } from '../hooks/useSettings';
import { ThemeMode, useTheme } from '../context/ThemeContext';
import { AccentColorPicker } from '../components/AccentColorPicker';
import { useApp } from '../context/AppContext';
import { exportViaShare, exportToDirectory, importAllData } from '../storage/exportImport';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  rightLabel,
  chevron = false,
  danger = false,
  toggle = false,
  toggleValue = false,
  onToggle,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightLabel?: string;
  chevron?: boolean;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: danger ? theme.dangerDim : theme.accentDim,
          borderWidth: 1,
          borderColor: danger ? theme.danger + '44' : theme.accentBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name={icon} size={16} color={danger ? theme.danger : theme.accentText} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText size="base" weight="medium" variant={danger ? 'danger' : 'default'}>
          {label}
        </ThemedText>
        {subtitle ? (
          <ThemedText size="xs" variant="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      {rightLabel ? (
        <ThemedText size="sm" variant="muted">
          {rightLabel}
        </ThemedText>
      ) : null}
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#fff"
        />
      ) : null}
      {chevron ? (
        <Feather name="chevron-right" size={16} color={theme.textDim} />
      ) : null}
    </TouchableOpacity>
  );
}

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Auto', value: 'auto' },
  { label: 'Dark', value: 'dark' },
];

function ThemePicker() {
  const { theme } = useAppTheme();
  const { themeMode, setThemeMode } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: theme.accentDim,
          borderWidth: 1,
          borderColor: theme.accentBorder,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="sun" size={16} color={theme.accentText} />
      </View>

      <ThemedText size="base" weight="medium" style={{ flex: 1 }}>
        Theme
      </ThemedText>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.background,
          borderRadius: 8,
          padding: 2,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        {THEME_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setThemeMode(opt.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: themeMode === opt.value ? theme.accent : 'transparent',
            }}
          >
            <ThemedText
              size="xs"
              weight="medium"
              style={{ color: themeMode === opt.value ? '#fff' : theme.textMuted }}
            >
              {opt.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText
      size="xs"
      weight="semibold"
      variant="muted"
      style={{
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 6,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
      }}
    >
      {title}
    </ThemedText>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { theme, isDark } = useAppTheme();
  const { settings, updateSetting } = useSettings();
  const { reloadAll } = useApp();
  const { accentHex, setAccentHex } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [accentPickerVisible, setAccentPickerVisible] = useState(false);

  const handleExport = () => {
    Alert.alert(
      'Export lists',
      'How would you like to save your backup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save to folder',
          onPress: async () => {
            setExporting(true);
            try {
              await exportToDirectory();
            } catch {
              Alert.alert('Export failed', 'Could not save to the selected folder.');
            } finally {
              setExporting(false);
            }
          },
        },
        {
          text: 'Share',
          onPress: async () => {
            setExporting(true);
            try {
              await exportViaShare();
            } catch {
              Alert.alert('Export failed', 'Something went wrong while exporting your data.');
            } finally {
              setExporting(false);
            }
          },
        },
      ]
    );
  };

  const handleImport = () => {
    Alert.alert(
      'Import lists',
      'New master lists from the backup file will be added to your existing lists.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            try {
              const count = await importAllData();
              if (count !== null) {
                await reloadAll();
                Alert.alert(
                  'Import complete',
                  count === 0
                    ? 'No new lists — all lists in this file already exist.'
                    : `${count} new list${count === 1 ? '' : 's'} added.`
                );
              }
            } catch {
              Alert.alert('Import failed', 'The file could not be read. Make sure it is a valid backup.');
            } finally {
              setImporting(false);
            }
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
          <ThemedText size="xl" weight="bold">
            Settings
          </ThemedText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Appearance */}
          <SectionHeader title="Appearance" />
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: theme.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            <ThemePicker />
            <View style={{ height: 1, backgroundColor: theme.borderMuted, marginLeft: 66 }} />
            <TouchableOpacity
              onPress={() => setAccentPickerVisible(true)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: accentHex + '22',
                  borderWidth: 1,
                  borderColor: accentHex + '66',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: accentHex,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText size="base" weight="medium">Accent Color</ThemedText>
              </View>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: accentHex,
                  marginRight: 4,
                }}
              />
              <Feather name="chevron-right" size={16} color={theme.textDim} />
            </TouchableOpacity>
          </View>

          {/* Shopping */}
          <SectionHeader title="Shopping" />
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: theme.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            <SettingsRow
              icon="sun"
              label="Keep Screen Awake"
              subtitle="Prevent screen from sleeping in Track mode"
              toggle
              toggleValue={settings.keepAwake}
              onToggle={(val) => updateSetting('keepAwake', val)}
            />
            <View style={{ height: 1, backgroundColor: theme.borderMuted, marginLeft: 66 }} />
            <SettingsRow
              icon="type"
              label="Word Suggestions"
              subtitle="Words remembered from your items"
              chevron
              onPress={() => navigation.navigate('AutocompleteHistory')}
            />
          </View>

          {/* Data */}
          <SectionHeader title="Data" />
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: theme.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            <SettingsRow
              icon="hard-drive"
              label="Storage"
              subtitle="All data stored locally on your device"
              rightLabel="Local"
            />
            <View style={{ height: 1, backgroundColor: theme.borderMuted, marginLeft: 66 }} />
            <SettingsRow
              icon="upload"
              label="Export lists"
              subtitle="Save a backup file to share or store"
              onPress={exporting ? undefined : handleExport}
              rightLabel={exporting ? 'Exporting…' : undefined}
              chevron={!exporting}
            />
            <View style={{ height: 1, backgroundColor: theme.borderMuted, marginLeft: 66 }} />
            <SettingsRow
              icon="download"
              label="Import lists"
              subtitle="Restore from a backup file"
              onPress={importing ? undefined : handleImport}
              rightLabel={importing ? 'Importing…' : undefined}
              chevron={!importing}
            />
          </View>

          {/* About */}
          <SectionHeader title="About" />
          <View
            style={{
              marginHorizontal: 16,
              backgroundColor: theme.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.border,
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: theme.accentDim,
                  borderWidth: 1,
                  borderColor: theme.accentBorder,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={require('../../assets/logo.png')}
                  style={{ width: 26, height: 26 }}
                  resizeMode="contain"
                  tintColor={theme.accent}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText size="base" weight="medium">Scribo</ThemedText>
                <ThemedText size="xs" variant="muted" style={{ marginTop: 2 }}>Version {Constants.expoConfig?.version ?? '1.0.0'}</ThemedText>
              </View>
            </View>
          </View>

          {/* Neon accent preview */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 24,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.accentBorder,
              backgroundColor: theme.accentDim,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: theme.accent,
                shadowColor: theme.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 6,
              }}
            />
            <ThemedText size="sm" variant="accent" weight="medium" style={{ flex: 1 }}>
              More features coming soon — stay tuned!
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AccentColorPicker
        visible={accentPickerVisible}
        currentHex={accentHex}
        onConfirm={setAccentHex}
        onClose={() => setAccentPickerVisible(false)}
      />
    </ThemedView>
  );
}
