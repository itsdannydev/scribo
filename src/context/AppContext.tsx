import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { MasterList, MasterItem, GeneratedList, ShoppingListItem, Unit } from '../types';
import { loadMasterLists, saveMasterLists } from '../storage/masterLists';
import { loadGeneratedLists, saveGeneratedLists } from '../storage/generatedLists';
import { seedHistoryFromNames } from '../storage/history';
import { generateShoppingList, StockMap } from '../utils/generateList';

interface AppContextType {
  masterLists: MasterList[];
  generatedLists: GeneratedList[];
  isLoading: boolean;
  addMasterList: (name: string) => Promise<MasterList>;
  renameMasterList: (id: string, name: string) => Promise<void>;
  deleteMasterList: (id: string) => Promise<void>;
  addMasterItem: (listId: string, item: Omit<MasterItem, 'id' | 'order'>) => Promise<void>;
  updateMasterItem: (
    listId: string,
    itemId: string,
    changes: Partial<Pick<MasterItem, 'name' | 'quantity' | 'unit' | 'notes'>>
  ) => Promise<void>;
  deleteMasterItem: (listId: string, itemId: string) => Promise<void>;
  generateList: (masterListId: string, stock: StockMap, extraItems?: { name: string; quantity: number; unit: Unit; notes?: string }[]) => Promise<GeneratedList>;
  toggleShoppingItem: (listId: string, itemId: string) => Promise<void>;
  updateShoppingItemQty: (listId: string, itemId: string, quantity: number, unit: Unit) => Promise<void>;
  addManualShoppingItem: (listId: string, item: { name: string; quantity: number; unit: Unit; notes?: string; checked?: boolean }) => Promise<void>;
  deleteGeneratedList: (id: string) => Promise<void>;
  reloadAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const SAVE_FAILED_MSG = 'Could not save your changes. Please try again.';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [masterLists, setMasterLists] = useState<MasterList[]>([]);
  const [generatedLists, setGeneratedLists] = useState<GeneratedList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs hold the authoritative current state for synchronous reads inside callbacks.
  // Updated immediately on every mutation so rapid successive calls see the latest data
  // without waiting for React to re-render and re-close over the new state value.
  const masterListsRef = useRef<MasterList[]>([]);
  const generatedListsRef = useRef<GeneratedList[]>([]);

  useEffect(() => {
    Promise.all([loadMasterLists(), loadGeneratedLists()]).then(([ml, gl]) => {
      const sortedMl = [...ml].sort((a, b) => a.order - b.order);
      const sortedGl = [...gl].sort((a, b) => b.generatedAt - a.generatedAt);
      masterListsRef.current = sortedMl;
      generatedListsRef.current = sortedGl;
      setMasterLists(sortedMl);
      setGeneratedLists(sortedGl);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  // ── Master list mutations ──────────────────────────────────────────────────

  const mutateMasterLists = useCallback(async (updater: (prev: MasterList[]) => MasterList[]) => {
    const prev = masterListsRef.current;
    const next = updater(prev);
    masterListsRef.current = next;
    setMasterLists(next);
    try {
      await saveMasterLists(next);
    } catch {
      // Roll back UI and inform user
      masterListsRef.current = prev;
      setMasterLists(prev);
      Alert.alert('Save failed', SAVE_FAILED_MSG);
    }
  }, []);

  const addMasterList = useCallback(async (name: string): Promise<MasterList> => {
    const list: MasterList = {
      id: randomUUID(),
      name: name.trim(),
      items: [],
      createdAt: Date.now(),
      order: 0,
    };
    await mutateMasterLists((prev) => [list, ...prev].map((l, i) => ({ ...l, order: i })));
    return list;
  }, [mutateMasterLists]);

  const renameMasterList = useCallback(async (id: string, name: string) => {
    await mutateMasterLists((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name: name.trim() } : l))
    );
  }, [mutateMasterLists]);

  const deleteMasterList = useCallback(async (id: string) => {
    await mutateMasterLists((prev) =>
      prev.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i }))
    );
  }, [mutateMasterLists]);

  const addMasterItem = useCallback(async (listId: string, item: Omit<MasterItem, 'id' | 'order'>) => {
    await mutateMasterLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        const newItem: MasterItem = { ...item, id: randomUUID(), order: l.items.length };
        return { ...l, items: [...l.items, newItem] };
      })
    );
    await seedHistoryFromNames([item.name]);
  }, [mutateMasterLists]);

  const updateMasterItem = useCallback(async (
    listId: string,
    itemId: string,
    changes: Partial<Pick<MasterItem, 'name' | 'quantity' | 'unit' | 'notes'>>
  ) => {
    await mutateMasterLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return { ...l, items: l.items.map((it) => (it.id === itemId ? { ...it, ...changes } : it)) };
      })
    );
  }, [mutateMasterLists]);

  const deleteMasterItem = useCallback(async (listId: string, itemId: string) => {
    await mutateMasterLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return {
          ...l,
          items: l.items.filter((it) => it.id !== itemId).map((it, i) => ({ ...it, order: i })),
        };
      })
    );
  }, [mutateMasterLists]);

  // ── Generated list mutations ───────────────────────────────────────────────

  const mutateGeneratedLists = useCallback(async (updater: (prev: GeneratedList[]) => GeneratedList[]) => {
    const prev = generatedListsRef.current;
    const next = updater(prev);
    generatedListsRef.current = next;
    setGeneratedLists(next);
    try {
      await saveGeneratedLists(next);
    } catch {
      generatedListsRef.current = prev;
      setGeneratedLists(prev);
      Alert.alert('Save failed', SAVE_FAILED_MSG);
    }
  }, []);

  const generateList = useCallback(async (
    masterListId: string,
    stock: StockMap,
    extraItems?: { name: string; quantity: number; unit: Unit; notes?: string }[]
  ): Promise<GeneratedList> => {
    const masterList = masterListsRef.current.find((l) => l.id === masterListId);
    if (!masterList) throw new Error('Master list not found');

    const masterItems = generateShoppingList(masterList.items, stock);
    const manualItems: ShoppingListItem[] = (extraItems ?? []).map((e) => ({
      id: randomUUID(),
      masterItemId: '',
      isManual: true,
      checked: false,
      name: e.name,
      quantity: e.quantity,
      unit: e.unit,
      notes: e.notes,
    }));
    const list: GeneratedList = {
      id: randomUUID(),
      masterListId,
      masterListName: masterList.name,
      generatedAt: Date.now(),
      items: [...masterItems, ...manualItems],
    };

    const prev = generatedListsRef.current;
    const next = [list, ...prev];
    generatedListsRef.current = next;
    setGeneratedLists(next);
    try {
      await saveGeneratedLists(next);
    } catch {
      generatedListsRef.current = prev;
      setGeneratedLists(prev);
      throw new Error('Failed to save generated list');
    }
    return list;
  }, []);

  const toggleShoppingItem = useCallback(async (listId: string, itemId: string) => {
    await mutateGeneratedLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return { ...l, items: l.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)) };
      })
    );
  }, [mutateGeneratedLists]);

  const updateShoppingItemQty = useCallback(async (listId: string, itemId: string, quantity: number, unit: Unit) => {
    await mutateGeneratedLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        return { ...l, items: l.items.map((it) => (it.id === itemId ? { ...it, quantity, unit } : it)) };
      })
    );
  }, [mutateGeneratedLists]);

  const addManualShoppingItem = useCallback(async (listId: string, item: { name: string; quantity: number; unit: Unit; notes?: string; checked?: boolean }) => {
    const newItem: ShoppingListItem = {
      id: randomUUID(),
      masterItemId: '',
      isManual: true,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes,
      checked: item.checked ?? false,
    };
    await mutateGeneratedLists((prev) =>
      prev.map((l) => (l.id !== listId ? l : { ...l, items: [...l.items, newItem] }))
    );
  }, [mutateGeneratedLists]);

  const deleteGeneratedList = useCallback(async (id: string) => {
    await mutateGeneratedLists((prev) => prev.filter((l) => l.id !== id));
  }, [mutateGeneratedLists]);

  const reloadAll = useCallback(async () => {
    const [ml, gl] = await Promise.all([loadMasterLists(), loadGeneratedLists()]);
    const sortedMl = [...ml].sort((a, b) => a.order - b.order);
    const sortedGl = [...gl].sort((a, b) => b.generatedAt - a.generatedAt);
    masterListsRef.current = sortedMl;
    generatedListsRef.current = sortedGl;
    setMasterLists(sortedMl);
    setGeneratedLists(sortedGl);
  }, []);

  return (
    <AppContext.Provider
      value={{
        masterLists,
        generatedLists,
        isLoading,
        addMasterList,
        renameMasterList,
        deleteMasterList,
        addMasterItem,
        updateMasterItem,
        deleteMasterItem,
        generateList,
        toggleShoppingItem,
        updateShoppingItemQty,
        addManualShoppingItem,
        deleteGeneratedList,
        reloadAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
