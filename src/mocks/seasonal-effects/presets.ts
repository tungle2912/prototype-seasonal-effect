/**
 * Presets are a set of starting values, not a constraint (PRD 5).
 *
 * Order matters: the four best-selling occasions come first, then the rest, then
 * "Start from scratch". A merchant opening the grid in November should not have
 * to hunt for Black Friday.
 */

import type {
  CountdownStyle,
  DecorationStyle,
  ElementKey,
  FallingArtwork,
} from './effects';

export type PresetKey =
  | 'CHRISTMAS'
  | 'BLACK_FRIDAY'
  | 'CYBER_MONDAY'
  | 'HALLOWEEN'
  | 'SINGLES_DAY'
  | 'VALENTINE'
  | 'LUNAR_NEW_YEAR'
  | 'MOTHERS_DAY'
  | 'FATHERS_DAY'
  | 'SUMMER_SALE'
  | 'BACK_TO_SCHOOL'
  | 'SCRATCH';

export interface Preset {
  key: PresetKey;
  /** Tile label in the template grid. */
  label: string;
  /** Emoji stands in for artwork here — a prototype loads no image assets. */
  glyph: string;
  /** Default campaign name. Overwritten only if the merchant has not typed one. */
  campaignName: string;
  artwork: FallingArtwork;
  decoration: DecorationStyle;
  paletteId: string;
  countdownStyle: CountdownStyle;
  countdownEnabled: boolean;
  barMessage: string;
  enabled: Record<ElementKey, boolean>;
  /** [start, end] local datetime, or null for a blank campaign. */
  dates: [string, string] | null;
  /** Why this preset is set up the way it is — shown under the tile grid. */
  note?: string;
}

const all: Record<ElementKey, boolean> = {
  falling: true,
  decorations: true,
  cursor: true,
  bar: true,
  skin: true,
  moments: true,
  music: false,
};

const on = (overrides: Partial<Record<ElementKey, boolean>>): Record<ElementKey, boolean> => ({
  ...all,
  ...overrides,
});

const presetsByKey: Record<PresetKey, Preset> = {
  CHRISTMAS: {
    key: 'CHRISTMAS',
    label: 'Christmas',
    glyph: '🎄',
    campaignName: 'Christmas 2026',
    artwork: 'SNOWFALL',
    decoration: 'STRING_LIGHTS',
    paletteId: 'PINE_AND_RED',
    countdownStyle: 'PILL',
    countdownEnabled: true,
    barMessage: '🎄 Christmas sale up to 40% off — free shipping over $60',
    enabled: on({}),
    dates: ['2026-12-01T00:00', '2026-12-26T23:59'],
    note: 'Everything on except music — the long run of the year.',
  },
  BLACK_FRIDAY: {
    key: 'BLACK_FRIDAY',
    label: 'Black Friday',
    glyph: '🏷',
    campaignName: 'Black Friday 2026',
    artwork: 'CASH',
    decoration: 'STRING_LIGHTS',
    paletteId: 'MIDNIGHT',
    countdownStyle: 'LABELLED',
    countdownEnabled: true,
    barMessage: '🏷 Black Friday — up to 60% off, ends Monday',
    enabled: on({ decorations: false, cursor: false }),
    dates: ['2026-11-27T00:00', '2026-12-01T23:59'],
    note: 'Decorations and cursor off: the busiest traffic week of the year gets the lightest build.',
  },
  CYBER_MONDAY: {
    key: 'CYBER_MONDAY',
    label: 'Cyber Monday',
    glyph: '⚡',
    campaignName: 'Cyber Monday 2026',
    artwork: 'LIGHTNING',
    decoration: 'STRING_LIGHTS',
    paletteId: 'CYBER_BLUE',
    countdownStyle: 'LABELLED',
    countdownEnabled: true,
    barMessage: '⚡ Cyber Monday — the biggest discounts of the year, 24 hours only',
    enabled: on({ decorations: false, cursor: false }),
    dates: ['2026-11-30T00:00', '2026-12-01T23:59'],
    note: 'Labelled countdown, because shoppers compare prices across tabs on a 24-hour sale.',
  },
  HALLOWEEN: {
    key: 'HALLOWEEN',
    label: 'Halloween',
    glyph: '🎃',
    campaignName: 'Halloween 2026',
    artwork: 'BATS',
    decoration: 'COBWEBS',
    paletteId: 'AUTUMN_AMBER',
    countdownStyle: 'DIGIT_BOXES',
    countdownEnabled: true,
    barMessage: '🎃 Halloween — 30% off everything, tonight only',
    enabled: on({ moments: false }),
    dates: ['2026-10-25T00:00', '2026-11-01T23:59'],
  },
  SINGLES_DAY: {
    key: 'SINGLES_DAY',
    label: "Singles' Day 11.11",
    glyph: '🛍',
    campaignName: "Singles' Day 11.11",
    artwork: 'GIFT_BOXES',
    decoration: 'STRING_LIGHTS',
    paletteId: 'SINGLES_RED',
    countdownStyle: 'LABELLED',
    countdownEnabled: true,
    barMessage: '11.11 Singles’ Day — an extra 11% off everything, today only',
    enabled: on({ decorations: false, cursor: false }),
    dates: ['2026-11-11T00:00', '2026-11-11T23:59'],
    note: 'One day only, so the countdown carries the campaign.',
  },
  VALENTINE: {
    key: 'VALENTINE',
    label: 'Valentine',
    glyph: '💗',
    campaignName: "Valentine's Day 2027",
    artwork: 'HEARTS',
    decoration: 'GARLAND',
    paletteId: 'LUNAR_RED',
    countdownStyle: 'PLAIN',
    countdownEnabled: true,
    barMessage: '💗 Valentine — a free card with every gift set',
    enabled: on({ decorations: false }),
    dates: ['2027-02-07T00:00', '2027-02-15T23:59'],
  },
  LUNAR_NEW_YEAR: {
    key: 'LUNAR_NEW_YEAR',
    label: 'Lunar New Year',
    glyph: '🧧',
    campaignName: 'Lunar New Year 2027',
    artwork: 'BLOSSOM',
    decoration: 'GARLAND',
    paletteId: 'LUNAR_RED',
    countdownStyle: 'PILL',
    countdownEnabled: true,
    barMessage: '🧧 Lunar New Year — 25% off plus a lucky envelope',
    enabled: on({}),
    dates: ['2027-02-10T00:00', '2027-02-20T23:59'],
  },
  MOTHERS_DAY: {
    key: 'MOTHERS_DAY',
    label: "Mother's Day",
    glyph: '💐',
    campaignName: "Mother's Day 2027",
    artwork: 'BOUQUETS',
    decoration: 'GARLAND',
    paletteId: 'ROSE',
    countdownStyle: 'PLAIN',
    countdownEnabled: true,
    barMessage: '💐 Mother’s Day — 20% off every gift set, delivered in time',
    enabled: on({ decorations: false }),
    dates: ['2027-05-03T00:00', '2027-05-09T23:59'],
    note: 'The countdown marks the last day that still arrives in time.',
  },
  FATHERS_DAY: {
    key: 'FATHERS_DAY',
    label: "Father's Day",
    glyph: '👔',
    campaignName: "Father's Day 2027",
    artwork: 'GIFT_BOXES',
    decoration: 'STRING_LIGHTS',
    paletteId: 'NAVY',
    countdownStyle: 'PILL',
    countdownEnabled: true,
    barMessage: '👔 Father’s Day — free gift wrap and a card on every order',
    enabled: on({ decorations: false, cursor: false }),
    dates: ['2027-06-14T00:00', '2027-06-20T23:59'],
  },
  SUMMER_SALE: {
    key: 'SUMMER_SALE',
    label: 'Summer sale',
    glyph: '☀️',
    campaignName: 'Summer sale 2027',
    artwork: 'SUNSHINE',
    decoration: 'STRING_LIGHTS',
    paletteId: 'SUMMER_SUN',
    countdownStyle: 'PLAIN',
    countdownEnabled: true,
    barMessage: '☀️ Summer sale — up to 50% off while the sun lasts',
    enabled: on({ decorations: false, cursor: false, moments: false }),
    dates: ['2027-06-21T00:00', '2027-07-31T23:59'],
    note: 'The longest run of the year, so the lightest: six weeks of ambient effects is six weeks of frames.',
  },
  BACK_TO_SCHOOL: {
    key: 'BACK_TO_SCHOOL',
    label: 'Back to school',
    glyph: '🎒',
    campaignName: 'Back to school 2026',
    artwork: 'SPARKLE',
    decoration: 'STRING_LIGHTS',
    paletteId: 'COOL_BLUE',
    countdownStyle: 'PILL',
    countdownEnabled: false,
    barMessage: '🎒 Back to school — 20% off with code CLASS20',
    enabled: on({ decorations: false, cursor: false, moments: false }),
    dates: ['2026-08-10T00:00', '2026-09-05T23:59'],
  },
  SCRATCH: {
    key: 'SCRATCH',
    label: 'Start from scratch',
    glyph: '✎',
    campaignName: '',
    artwork: 'SNOWFALL',
    decoration: 'STRING_LIGHTS',
    paletteId: 'THEME',
    countdownStyle: 'PILL',
    countdownEnabled: false,
    barMessage: '',
    enabled: {
      falling: false,
      decorations: false,
      cursor: false,
      bar: false,
      skin: false,
      moments: false,
      music: false,
    },
    dates: null,
  },
};

/**
 * Grid order: the four best sellers first, then the rest, then Start from
 * scratch. A merchant opening this in November should not hunt for Black Friday.
 */
const presetOrder: PresetKey[] = [
  'CHRISTMAS',
  'BLACK_FRIDAY',
  'CYBER_MONDAY',
  'HALLOWEEN',
  'SINGLES_DAY',
  'VALENTINE',
  'LUNAR_NEW_YEAR',
  'MOTHERS_DAY',
  'FATHERS_DAY',
  'SUMMER_SALE',
  'BACK_TO_SCHOOL',
  'SCRATCH',
];

export const presets: Preset[] = presetOrder.map((key) => presetsByKey[key]);

export const presetByKey = (key: PresetKey): Preset => presetsByKey[key];

/** Every default campaign name, so a preset switch knows if the merchant renamed it. */
export const presetCampaignNames: string[] = presets
  .map((preset) => preset.campaignName)
  .filter(Boolean);

/** Every default bar message, for the same reason (PRD 5.2). */
export const presetBarMessages: string[] = presets.map((preset) => preset.barMessage).filter(Boolean);
