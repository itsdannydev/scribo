import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@settings_v1';
const ONBOARDING_KEY = '@onboarding_done';

export interface AppSettings {
  keepAwake: boolean;
  haptics: boolean;
}

const DEFAULTS: AppSettings = {
  keepAwake: true,
  haptics: true,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    return json ? { ...DEFAULTS, ...JSON.parse(json) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getOnboardingDone(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {}
}

export async function resetOnboardingDone(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch {}
}
