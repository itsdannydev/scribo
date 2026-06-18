export type UnitFamily = 'count' | 'weight' | 'volume';
export type Unit = 'nos' | 'kg' | 'g' | 'L' | 'mL';

export const UNIT_FAMILY: Record<Unit, UnitFamily> = {
  nos: 'count',
  kg: 'weight',
  g: 'weight',
  L: 'volume',
  mL: 'volume',
};

export const FAMILY_UNITS: Record<UnitFamily, Unit[]> = {
  count: ['nos'],
  weight: ['kg', 'g'],
  volume: ['L', 'mL'],
};

export const ALL_UNITS: Unit[] = ['nos', 'kg', 'g', 'L', 'mL'];

export interface MasterItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  notes?: string;
  order: number;
}

export interface MasterList {
  id: string;
  name: string;
  items: MasterItem[];
  createdAt: number;
  order: number;
}

export interface ShoppingListItem {
  id: string;
  masterItemId: string;
  name: string;
  quantity: number;
  unit: Unit;
  notes?: string;
  checked: boolean;
  isManual?: boolean;
}

export interface GeneratedList {
  id: string;
  masterListId: string;
  masterListName: string;
  generatedAt: number;
  items: ShoppingListItem[];
}

export interface ItemHistoryEntry {
  name: string;
  useCount: number;
  lastUsed: number;
}

export interface AppSettings {
  keepAwake: boolean;
}

export type RootStackParamList = {
  Home: { snackMessage?: string; snackListId?: string } | undefined;
  MasterList: { masterListId: string };
  StockEntry: { masterListId: string };
  ShoppingLists: undefined;
  ShoppingListDetail: { listId: string };
  Settings: undefined;
  AutocompleteHistory: undefined;
};
