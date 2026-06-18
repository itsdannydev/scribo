import React from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThemedText } from './ui/ThemedText';
import { Button } from './ui/Button';
import { useAppTheme } from '../hooks/useColorScheme';

interface DeleteConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
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
              <ThemedText size="xl" weight="bold" style={{ marginBottom: 10 }}>
                {title}
              </ThemedText>
              <ThemedText
                variant="secondary"
                style={{ marginBottom: 24, lineHeight: 22 }}
              >
                {message}
              </ThemedText>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button
                  variant="outline"
                  label="Cancel"
                  style={{ flex: 1 }}
                  onPress={onCancel}
                />
                <Button
                  variant="danger"
                  label={confirmLabel}
                  style={{ flex: 1 }}
                  onPress={onConfirm}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
