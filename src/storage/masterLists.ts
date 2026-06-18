import AsyncStorage from '@react-native-async-storage/async-storage';
import { MasterList } from '../types';

const KEY = '@master_lists_v1';

export async function loadMasterLists(): Promise<MasterList[]> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveMasterLists(lists: MasterList[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(lists));
  } catch (e) {
    throw new Error(`Failed to save master lists: ${e instanceof Error ? e.message : String(e)}`);
  }
}
