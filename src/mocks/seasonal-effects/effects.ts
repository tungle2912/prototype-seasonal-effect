/**
 * The effect catalogue: what a merchant can pick for each of the seven effects.
 *
 * Every option that a merchant has to *see* to understand carries a glyph, not
 * just a label — nobody knows what "Sparkle" looks like from the word "Sparkle".
 * Tile background colours live in palettes.ts, the one file allowed hex.
 */

export type FallingArtwork =
  | 'SNOWFALL'
  | 'FALLING_LEAVES'
  | 'SPARKLE'
  | 'HEARTS'
  | 'CASH'
  | 'GIFT_BOXES'
  | 'BATS'
  | 'LIGHTNING'
  | 'BLOSSOM'
  | 'DIWALI_LAMPS'
  | 'BOUQUETS'
  | 'SUNSHINE';

export interface ArtworkOption {
  value: FallingArtwork;
  label: string;
  glyph: string;
}

export const fallingArtwork: ArtworkOption[] = [
  { value: 'SNOWFALL', label: 'Snowfall', glyph: '❄' },
  { value: 'FALLING_LEAVES', label: 'Falling leaves', glyph: '🍁' },
  { value: 'SPARKLE', label: 'Sparkle', glyph: '✨' },
  { value: 'HEARTS', label: 'Hearts', glyph: '💗' },
  { value: 'CASH', label: 'Cash', glyph: '💵' },
  { value: 'GIFT_BOXES', label: 'Gift boxes', glyph: '🎁' },
  { value: 'BATS', label: 'Bats', glyph: '🦇' },
  { value: 'LIGHTNING', label: 'Lightning', glyph: '⚡' },
  { value: 'BLOSSOM', label: 'Blossom', glyph: '🌸' },
  { value: 'DIWALI_LAMPS', label: 'Diwali lamps', glyph: '🪔' },
  { value: 'BOUQUETS', label: 'Bouquets', glyph: '💐' },
  { value: 'SUNSHINE', label: 'Sunshine', glyph: '☀️' },
];

export const artworkLabel = (value: FallingArtwork): string =>
  fallingArtwork.find((option) => option.value === value)?.label ?? 'Snowfall';

export const artworkGlyph = (value: FallingArtwork): string =>
  fallingArtwork.find((option) => option.value === value)?.glyph ?? '❄';

export type DecorationStyle = 'STRING_LIGHTS' | 'GARLAND' | 'SNOW_DRIFT' | 'COBWEBS';

export interface DecorationOption {
  value: DecorationStyle;
  label: string;
  /** Where it attaches — the merchant needs this to picture the result. */
  placement: string;
}

export const decorationStyles: DecorationOption[] = [
  { value: 'STRING_LIGHTS', label: 'String lights', placement: 'Top edge' },
  { value: 'GARLAND', label: 'Garland', placement: 'Header' },
  { value: 'SNOW_DRIFT', label: 'Snow drift', placement: 'Footer' },
  { value: 'COBWEBS', label: 'Cobwebs', placement: 'Corners' },
];

export const decorationLabel = (value: DecorationStyle): string =>
  decorationStyles.find((option) => option.value === value)?.label ?? 'String lights';

export type CountdownStyle = 'PILL' | 'PLAIN' | 'DIGIT_BOXES' | 'LABELLED';

export const countdownStyles: { value: CountdownStyle; label: string }[] = [
  { value: 'PILL', label: 'Pill' },
  { value: 'PLAIN', label: 'Plain text' },
  { value: 'DIGIT_BOXES', label: 'Digit boxes' },
  { value: 'LABELLED', label: 'Labelled' },
];

/**
 * How much falling artwork is on screen, as a percentage of the most a page
 * should ever carry. A percentage rather than three named steps: the gap between
 * "light" and "medium" is a number the merchant can only judge by looking, so let
 * them land anywhere on the scale instead of guessing which word means what.
 */
export type Density = number;

export const DENSITY_MIN = 10;
export const DENSITY_MAX = 100;
export const DENSITY_STEP = 5;

/** Particle count at 100%. Speed guard scales it down from here (PRD 15.4). */
export const DENSITY_PARTICLES_MAX = 90;

export const densityParticles = (density: Density): number =>
  Math.max(1, Math.round((density / 100) * DENSITY_PARTICLES_MAX));

/** The word for a reading, so a number never has to be interpreted alone. */
export const densityBandLabel = (density: Density): string =>
  density <= 30 ? 'Light' : density <= 70 ? 'Medium' : 'Dense';

export const densityLabel = (density: Density): string =>
  `${density}% · ${densityBandLabel(density).toLowerCase()}`;

export type ParticleColour = 'STOCK' | 'BRAND';

export const particleColourLabel: Record<ParticleColour, string> = {
  STOCK: 'Stock artwork',
  BRAND: 'Brand palette',
};

export type CursorParticles = 'MATCH_FALLING' | 'SPARKLE';
export type TrailLength = 'SHORT' | 'MEDIUM' | 'LONG';

export const trailLabel: Record<TrailLength, string> = {
  SHORT: 'Short',
  MEDIUM: 'Medium',
  LONG: 'Long',
};

export type CountdownZeroBehaviour = 'HIDE_BAR' | 'KEEP_BAR_DROP_TIMER' | 'FOLLOW_UP_MESSAGE';

export const zeroBehaviourOptions: { value: CountdownZeroBehaviour; label: string }[] = [
  { value: 'HIDE_BAR', label: 'Hide the bar' },
  { value: 'KEEP_BAR_DROP_TIMER', label: 'Keep the bar, drop the timer' },
  { value: 'FOLLOW_UP_MESSAGE', label: 'Switch to a follow-up message' },
];

export type MusicTrack = 'JINGLE_SOFT' | 'WINTER_PIANO' | 'LOFI_HOLIDAY' | 'MARKET_STRINGS';

export const musicTracks: { value: MusicTrack; label: string }[] = [
  { value: 'JINGLE_SOFT', label: 'Jingle bells — soft' },
  { value: 'WINTER_PIANO', label: 'Winter piano' },
  { value: 'LOFI_HOLIDAY', label: 'Lo-fi holiday' },
  { value: 'MARKET_STRINGS', label: 'Christmas market strings' },
];

/**
 * Volume is a quantity, not three named buckets, so it is a percentage on a
 * slider. `Quiet · Medium · Loud` made the merchant guess what the gap between
 * two of them sounded like, and gave them no way to land between two guesses.
 */
export const VOLUME_MIN = 0;
export const VOLUME_MAX = 100;
export const VOLUME_STEP = 5;

/** The band a percentage falls in — still worth saying, next to the number. */
export const volumeBandLabel = (volume: number): string => {
  if (volume === 0) return 'Muted';
  if (volume <= 33) return 'Quiet';
  if (volume <= 66) return 'Medium';
  return 'Loud';
};

export const volumeLabel = (volume: number): string =>
  volume === 0 ? 'Muted' : `${volume}% · ${volumeBandLabel(volume).toLowerCase()}`;

/** The seven effects, in the order the tab lays them out (PRD 6.0). */
export type ElementKey = 'falling' | 'decorations' | 'cursor' | 'bar' | 'skin' | 'moments' | 'music';

export const elementKeys: ElementKey[] = [
  'falling',
  'decorations',
  'cursor',
  'bar',
  'skin',
  'moments',
  'music',
];

export const elementLabel: Record<ElementKey, string> = {
  falling: 'Falling effect',
  decorations: 'Decorations',
  cursor: 'Cursor effect',
  bar: 'Announcement bar',
  skin: 'Seasonal skin',
  moments: 'Cart & thank-you moments',
  music: 'Background music',
};
