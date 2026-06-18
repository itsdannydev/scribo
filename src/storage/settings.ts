import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@settings_v1';

export interface AppSettings {
  keepAwake: boolean;
}

const DEFAULTS: AppSettings = {
  keepAwake: true,
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
