/**
 * Colour as content.
 *
 * Every hex in this file is a value the merchant picks and the app stores — a
 * seasonal palette, a brand colour, the tint behind an artwork tile. A Polaris
 * token cannot express "the merchant chose #C0392B", so this file carries a
 * narrow lint exception declared in eslint.config.js. Admin chrome colours are
 * still tokens everywhere else.
 */

import type { FallingArtwork } from './effects';

export interface SeasonalPalette {
  id: string;
  label: string;
  /** null means "leave the theme's own colours alone". */
  hex: string | null;
}

/** 12 tiles, 4 columns, 2 pages (PRD 6.0.1). */
export const seasonalPalettes: SeasonalPalette[] = [
  { id: 'PINE_AND_RED', label: 'Pine & red', hex: '#1f6f4a' },
  { id: 'LUNAR_RED', label: 'Lunar red', hex: '#c0392b' },
  { id: 'AUTUMN_AMBER', label: 'Autumn amber', hex: '#8b4513' },
  { id: 'DIWALI_GOLD', label: 'Diwali gold', hex: '#b8860b' },
  { id: 'COOL_BLUE', label: 'Cool blue', hex: '#2c6ecb' },
  { id: 'ROSE', label: 'Rose', hex: '#d6336c' },
  { id: 'NAVY', label: 'Navy', hex: '#1f4e79' },
  { id: 'SUMMER_SUN', label: 'Summer sun', hex: '#e8890c' },
  { id: 'SINGLES_RED', label: "Singles' red", hex: '#e8384f' },
  { id: 'CYBER_BLUE', label: 'Cyber blue', hex: '#2b3a8c' },
  { id: 'MIDNIGHT', label: 'Midnight', hex: '#1f1f1f' },
  { id: 'THEME', label: 'Theme colours', hex: null },
];

/** Falling back to "leave the theme alone" is the safe default for an unknown id. */
const THEME_PALETTE: SeasonalPalette = { id: 'THEME', label: 'Theme colours', hex: null };

export const paletteById = (id: string): SeasonalPalette =>
  seasonalPalettes.find((palette) => palette.id === id) ?? THEME_PALETTE;

/** Read from the merchant's theme on install, overridable in Settings (PRD 11). */
export const brandColoursFromTheme = {
  primary: '#1f6f4a',
  sale: '#c0392b',
  surface: '#f4f1ec',
} as const;

export type BrandColourKey = keyof typeof brandColoursFromTheme;

export const brandColourLabel: Record<BrandColourKey, string> = {
  primary: 'Primary',
  sale: 'Sale',
  surface: 'Surface',
};

/**
 * Seasonal tint behind each artwork tile, so the gallery reads as "snow on a cold
 * background" rather than twelve identical grey squares.
 */
export const artworkTileTint: Record<FallingArtwork, string> = {
  SNOWFALL: '#eef4fa',
  FALLING_LEAVES: '#fbf1e7',
  SPARKLE: '#fbf8ea',
  HEARTS: '#fbeef3',
  CASH: '#edf6f1',
  GIFT_BOXES: '#f4f0fa',
  BATS: '#f2eff7',
  LIGHTNING: '#eceffb',
  BLOSSOM: '#fbf0f5',
  DIWALI_LAMPS: '#fbf5e8',
  BOUQUETS: '#f6f1f8',
  SUNSHINE: '#fdf6e4',
};

/** Default colours of the scroll-to-top button (PRD 9.2). */
export const scrollButtonDefaults = {
  icon: '#ffffff',
  iconHover: '#000000',
  background: '#000000',
  backgroundHover: '#ffffff',
  border: '#000000',
  borderHover: '#000000',
} as const;

/** Relative luminance, for the 4.5:1 contrast check in PRD 6.5 and 11. */
export function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const channel = (offset: number): number => {
    const value = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/** Contrast ratio between two colours, 1:1 to 21:1. */
export function contrastRatio(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  const light = Math.max(first, second);
  const dark = Math.min(first, second);
  return (light + 0.05) / (dark + 0.05);
}

/** Whether white text is readable on this colour. */
export const contrastOnWhite = (hex: string): number => contrastRatio('#ffffff', hex);
