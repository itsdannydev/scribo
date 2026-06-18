import { randomUUID } from 'expo-crypto';
import { MasterItem, ShoppingListItem, Unit } from '../types';
import { getUnitFamily, toBaseUnit, fromBaseDisplay } from './units';

export interface StockMap {
  [masterItemId: string]: { quantity: number; unit: Unit };
}

export function generateShoppingList(
  masterItems: MasterItem[],
  stock: StockMap
): ShoppingListItem[] {
  const result: ShoppingListItem[] = [];

  for (const item of masterItems) {
    const stockEntry = stock[item.id];
    const family = getUnitFamily(item.unit);
    const masterBase = toBaseUnit(item.quantity, item.unit);

    let stockBase = 0;
    if (stockEntry && stockEntry.quantity > 0) {
      if (getUnitFamily(stockEntry.unit) === family) {
        stockBase = toBaseUnit(stockEntry.quantity, stockEntry.unit);
      }
    }

    const diffBase = masterBase - stockBase;
    if (diffBase <= 0) continue;

    const { quantity, unit } = fromBaseDisplay(diffBase, family);
    result.push({
      id: randomUUID(),
      masterItemId: item.id,
      name: item.name,
      quantity,
      unit,
      notes: item.notes,
      checked: false,
    });
  }

  return result;
}
