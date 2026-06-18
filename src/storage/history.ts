import AsyncStorage from '@react-native-async-storage/async-storage';
import { ItemHistoryEntry } from '../types';

const HISTORY_KEY = '@item_history_v1';

export async function loadHistory(): Promise<ItemHistoryEntry[]> {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveHistory(entries: ItemHistoryEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch (e) {
    throw new Error(`Failed to save history: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function recordNameUsed(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const history = await loadHistory();
  const existing = history.find((e) => e.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    existing.useCount += 1;
    existing.lastUsed = Date.now();
  } else {
    history.push({ name: trimmed, useCount: 1, lastUsed: Date.now() });
  }
  if (history.length > 200) {
    history.sort((a, b) => a.lastUsed - b.lastUsed);
    history.splice(0, history.length - 200);
  }
  await saveHistory(history);
}

export async function seedHistoryFromNames(names: string[]): Promise<void> {
  if (!names.length) return;
  const history = await loadHistory();
  const existingNames = new Set(history.map((e) => e.name.toLowerCase()));
  const toAdd = names.filter((n) => n.trim() && !existingNames.has(n.trim().toLowerCase()));
  if (!toAdd.length) return;
  const now = Date.now();
  await saveHistory([
    ...history,
    ...toAdd.map((n) => ({ name: n.trim(), useCount: 1, lastUsed: now })),
  ]);
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
