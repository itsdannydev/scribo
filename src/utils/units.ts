import { Unit, UnitFamily, UNIT_FAMILY, FAMILY_UNITS } from '../types';

export function getUnitFamily(unit: Unit): UnitFamily {
  return UNIT_FAMILY[unit] ?? 'count';
}

export function toBaseUnit(qty: number, unit: Unit): number {
  if (unit === 'kg') return qty * 1000; // → g
  if (unit === 'L') return qty * 1000;  // → mL
  return qty;
}

export function fromBaseDisplay(baseQty: number, family: UnitFamily): { quantity: number; unit: Unit } {
  if (family === 'weight') {
    if (baseQty >= 1000) return { quantity: +(baseQty / 1000).toFixed(3), unit: 'kg' };
    return { quantity: baseQty, unit: 'g' };
  }
  if (family === 'volume') {
    if (baseQty >= 1000) return { quantity: +(baseQty / 1000).toFixed(3), unit: 'L' };
    return { quantity: baseQty, unit: 'mL' };
  }
  return { quantity: baseQty, unit: 'nos' };
}

export function getCompatibleUnits(unit: Unit): Unit[] {
  return FAMILY_UNITS[getUnitFamily(unit)] ?? ['nos'];
}

export function formatQty(qty: number, unit: Unit): string {
  const trimmed = qty % 1 === 0 ? String(qty) : String(+qty.toFixed(2));
  return `${trimmed} ${unit}`;
}
