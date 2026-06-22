import * as Haptics from 'expo-haptics';

export function hapticLight(enabled: boolean) {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function hapticMedium(enabled: boolean) {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function hapticSuccess(enabled: boolean) {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
