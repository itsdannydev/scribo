import React, { useEffect, useState } from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import ColorPicker, {
  HueSlider,
  Panel1,
} from 'reanimated-color-picker';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ui/ThemedText';
import { useAppTheme } from '../hooks/useColorScheme';
import { PRESET_ACCENTS, PresetId } from '../utils/accentColors';

interface Props {
  visible: boolean;
  currentHex: string;
  onConfirm: (hex: string) => void;
  onClose: () => void;
}

function activePresetId(hex: string): PresetId | 'custom' {
  const match = PRESET_ACCENTS.find(
    (p) => p.hex.toLowerCase() === hex.toLowerCase()
  );
  return match ? match.id : 'custom';
}

export function AccentColorPicker({ visible, currentHex, onConfirm, onClose }: Props) {
  const { theme } = useAppTheme();
  const [pendingHex, setPendingHex] = useState(currentHex);
  // Changing this key remounts ColorPicker so it re-reads the new value
  const [pickerKey, setPickerKey] = useState(0);

  // Sync when the modal opens
  useEffect(() => {
    if (visible) {
      setPendingHex(currentHex);
      setPickerKey((k) => k + 1);
    }
  }, [visible]);

  const selectPreset = (hex: string) => {
    setPendingHex(hex);
    setPickerKey((k) => k + 1);
  };

  const selectedId = activePresetId(pendingHex);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }}
        onPress={onClose}
      />

      <View
        style={{
          backgroundColor: theme.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 20,
          paddingBottom: 36,
          paddingTop: 4,
        }}
      >
        {/* Drag handle */}
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.border,
            alignSelf: 'center',
            marginBottom: 16,
          }}
        />

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <ThemedText size="lg" weight="bold" style={{ flex: 1 }}>
            Accent Color
          </ThemedText>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Feather name="x" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Presets */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          {PRESET_ACCENTS.map((preset) => {
            const selected = selectedId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => selectPreset(preset.hex)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: selected ? preset.hex : theme.border,
                  backgroundColor: selected ? theme.card : 'transparent',
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: preset.hex,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && (
                    <Feather name="check" size={18} color="#fff" />
                  )}
                </View>
                <ThemedText size="sm" weight={selected ? 'semibold' : 'normal'}>
                  {preset.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}

          {/* Custom swatch */}
          <TouchableOpacity
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 8,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: selectedId === 'custom' ? pendingHex : theme.border,
              backgroundColor: selectedId === 'custom' ? theme.card : 'transparent',
            }}
            activeOpacity={1}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: selectedId === 'custom' ? pendingHex : theme.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedId !== 'custom' && (
                <Feather name="droplet" size={16} color={theme.textMuted} />
              )}
              {selectedId === 'custom' && (
                <Feather name="check" size={18} color="#fff" />
              )}
            </View>
            <ThemedText
              size="sm"
              weight={selectedId === 'custom' ? 'semibold' : 'normal'}
            >
              Custom
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Color wheel */}
        <ThemedText
          size="xs"
          weight="semibold"
          variant="muted"
          style={{ letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 12 }}
        >
          Custom color
        </ThemedText>

        <ColorPicker
          key={pickerKey}
          value={pendingHex}
          onCompleteJS={(colors) => setPendingHex(colors.hex)}
          style={{ gap: 12 }}
        >
          <Panel1 style={{ borderRadius: 10, height: 160 }} />
          <HueSlider style={{ borderRadius: 8, height: 28 }} />
        </ColorPicker>

        {/* Done button */}
        <TouchableOpacity
          onPress={() => { onConfirm(pendingHex); onClose(); }}
          style={{
            marginTop: 24,
            backgroundColor: pendingHex,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <ThemedText size="base" weight="bold" style={{ color: '#fff' }}>
            Apply
          </ThemedText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
