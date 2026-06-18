import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from './ui/ThemedText';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppTheme } from '../hooks/useColorScheme';

interface RenameListModalProps {
  visible: boolean;
  currentName: string;
  title?: string;
  confirmLabel?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function RenameListModal({
  visible,
  currentName,
  title = 'Rename List',
  confirmLabel = 'Rename',
  onConfirm,
  onCancel,
}: RenameListModalProps) {
  const { theme } = useAppTheme();
  const [name, setName] = useState(currentName);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible, currentName]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.overlay,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 18,
                  padding: 24,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: theme.border,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                <ThemedText size="xl" weight="bold" style={{ marginBottom: 16 }}>
                  {title}
                </ThemedText>

                <Input
                  ref={inputRef}
                  value={name}
                  onChangeText={setName}
                  placeholder="List name"
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                  maxLength={60}
                  containerStyle={{ marginBottom: 20 }}
                />

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button
                    variant="outline"
                    label="Cancel"
                    style={{ flex: 1 }}
                    onPress={onCancel}
                  />
                  <Button
                    variant="primary"
                    label={confirmLabel}
                    style={{ flex: 1 }}
                    onPress={handleConfirm}
                    disabled={!name.trim()}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
