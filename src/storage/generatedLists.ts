import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeneratedList } from '../types';

const KEY = '@generated_lists_v1';

export async function loadGeneratedLists(): Promise<GeneratedList[]> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveGeneratedLists(lists: GeneratedList[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(lists));
  } catch (e) {
    throw new Error(`Failed to save generated lists: ${e instanceof Error ? e.message : String(e)}`);
  }
}
