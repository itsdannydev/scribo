export interface AccentPaletteSlice {
  accent: string;
  accentBright: string;
  accentDim: string;
  accentBorder: string;
  accentText: string;
}

export const PRESET_ACCENTS = [
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'blue', label: 'Matte Blue', hex: '#5B84B1' },
] as const;

export type PresetId = (typeof PRESET_ACCENTS)[number]['id'];

export const DEFAULT_ACCENT_HEX = PRESET_ACCENTS[0].hex;

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let hue: number;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) hue = ((b - r) / d + 2) / 6;
  else hue = ((r - g) / d + 4) / 6;

  return [Math.round(hue * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hN = h / 360;
  const sN = Math.max(0, Math.min(1, s / 100));
  const lN = Math.max(0, Math.min(1, l / 100));

  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;

  if (sN === 0) {
    r = g = b = lN;
  } else {
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    r = hue2rgb(p, q, hN + 1 / 3);
    g = hue2rgb(p, q, hN);
    b = hue2rgb(p, q, hN - 1 / 3);
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function deriveAccentPalette(hex: string, isDark: boolean): AccentPaletteSlice {
  const [h, s, l] = hexToHsl(hex);

  if (isDark) {
    const accentL = Math.max(l, 35);
    const brightL = Math.min(accentL + 15, 85);
    return {
      accent: hslToHex(h, s, accentL),
      accentBright: hslToHex(h, Math.min(s + 5, 100), brightL),
      accentDim: hslToHex(h, Math.min(s, 65), 13),
      accentBorder: hslToHex(h, Math.min(s, 70), 23),
      accentText: hslToHex(h, Math.min(s + 5, 100), brightL),
    };
  } else {
    const accentL = Math.min(l, 42);
    return {
      accent: hslToHex(h, s, accentL),
      accentBright: hslToHex(h, s, Math.min(accentL + 15, 60)),
      accentDim: hslToHex(h, Math.max(s - 20, 15), 95),
      accentBorder: hslToHex(h, Math.max(s - 10, 25), 82),
      accentText: hslToHex(h, s, accentL),
    };
  }
}
