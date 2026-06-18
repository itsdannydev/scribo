import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { MasterList, GeneratedList } from '../types';
import { loadMasterLists, saveMasterLists } from './masterLists';
import {
  loadGeneratedLists,
  saveGeneratedLists,
} from './generatedLists';
import { seedHistoryFromNames } from './history';

interface ExportFormat {
  version: 2;
  exportedAt: number;
  masterLists: MasterList[];
  generatedLists: GeneratedList[];
}

async function buildExportFile(targetDir: Directory): Promise<File> {
  const [masterLists, generatedLists] = await Promise.all([
    loadMasterLists(),
    loadGeneratedLists(),
  ]);
  const payload: ExportFormat = {
    version: 2,
    exportedAt: Date.now(),
    masterLists,
    generatedLists,
  };
  const date = new Date().toISOString().slice(0, 10);
  const file = new File(targetDir, `scribo-backup-${date}.json`);
  file.write(JSON.stringify(payload, null, 2));
  return file;
}

export async function exportViaShare(): Promise<void> {
  const file = await buildExportFile(Paths.cache);
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Scribo Backup',
    });
  }
}

export async function exportToDirectory(): Promise<boolean> {
  const dir = await Directory.pickDirectoryAsync();
  const cacheFile = await buildExportFile(Paths.cache);
  try {
    await cacheFile.copy(dir);
  } finally {
    cacheFile.delete();
  }
  return true;
}

// Returns number of new master lists added, or null if user cancelled.
export async function importAllData(): Promise<number | null> {
  const result = await File.pickFileAsync({ mimeTypes: ['application/json', '*/*'] });
  if (result.canceled) return null;

  const json = await result.result.text();
  const data = JSON.parse(json) as ExportFormat;

  if (data.version !== 2 || !Array.isArray(data.masterLists)) {
    throw new Error('Invalid or unrecognised backup file.');
  }

  const existingLists = await loadMasterLists();
  const existingIds = new Set(existingLists.map((l) => l.id));
  const newLists = data.masterLists.filter((l) => !existingIds.has(l.id));

  if (newLists.length > 0) {
    const merged = [...existingLists, ...newLists].map((l, i) => ({ ...l, order: i }));
    await saveMasterLists(merged);
  }

  // Merge generated lists (additive by ID)
  if (Array.isArray(data.generatedLists) && data.generatedLists.length > 0) {
    const existingGen = await loadGeneratedLists();
    const existingGenIds = new Set(existingGen.map((l) => l.id));
    const newGen = data.generatedLists.filter((l) => !existingGenIds.has(l.id));
    if (newGen.length > 0) {
      await saveGeneratedLists([...existingGen, ...newGen].sort((a, b) => b.generatedAt - a.generatedAt));
    }
  }

  // Seed autocomplete from all imported item names
  const allNames = data.masterLists.flatMap((l) => l.items.map((i) => i.name));
  await seedHistoryFromNames(allNames);

  return newLists.length;
}
