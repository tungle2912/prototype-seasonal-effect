/**
 * Campaign records.
 *
 * A campaign is app-owned data, not a Shopify resource, so it uses a plain id
 * rather than a GID — but everything it *points at* (products, collections,
 * markets) keeps its real GID, and every enum is spelled the way an API would
 * spell it. Status is deliberately absent: it is derived from `enabled`,
 * `published` and today (PRD 4.1, see state/campaign-status.ts).
 */

import { collections } from '../collections';
import { marketIdByName } from '../markets';
import { products } from '../products';
import type {
  CountdownStyle,
  CountdownZeroBehaviour,
  CursorParticles,
  DecorationStyle,
  Density,
  FallingArtwork,
  MusicTrack,
  ParticleColour,
  TrailLength,
} from './effects';
import { presetByKey, type PresetKey } from './presets';
import { TODAY_ISO } from './today';

export interface DayRule {
  /** Monday first, as the merchant's week reads (PRD 7.2). */
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  enabled: boolean;
  allDay: boolean;
  from: string;
  to: string;
}

export interface CampaignSchedule {
  /** Off means "runs until the merchant switches it off" — no start, no end. */
  visibilityEnabled: boolean;
  start: string | null;
  end: string | null;
  fixedRange: {
    enabled: boolean;
    days: DayRule[];
  };
}

export type TriggerType = 'PAGE_LOAD' | 'DELAY' | 'ADD_TO_CART' | 'ELEMENT_CLICK';

export interface CampaignTrigger {
  type: TriggerType;
  delay: number;
  delayUnit: 'SECONDS' | 'MINUTES';
  /** Class names only, comma separated, no leading dot (PRD 7.3). */
  elementClass: string;
}

export type ResourceScope = 'ALL' | 'SPECIFIC';
export type ShopperType = 'EVERYONE' | 'FIRST_TIME' | 'RETURNING';
export type Frequency = 'ONCE_PER_DAY' | 'EVERY_PAGE_LOAD' | 'FIRST_VISIT_ONLY';
export type DeviceTarget = 'ALL' | 'DESKTOP' | 'MOBILE';

export interface CampaignTargeting {
  allPages: boolean;
  homePage: boolean;
  productPages: boolean;
  collectionPages: boolean;
  productScope: ResourceScope;
  /** GIDs — gid://shopify/Product/… */
  productIds: string[];
  collectionScope: ResourceScope;
  collectionIds: string[];
  excludeUrls: string[];
  /** Empty means every market. */
  marketIds: string[];
  shopperType: ShopperType;
  frequency: Frequency;
  device: DeviceTarget;
}

export interface CampaignElements {
  falling: {
    enabled: boolean;
    artwork: FallingArtwork;
    colour: ParticleColour;
    density: Density;
  };
  decorations: {
    enabled: boolean;
    style: DecorationStyle;
  };
  cursor: {
    enabled: boolean;
    particles: CursorParticles;
    length: TrailLength;
  };
  bar: {
    enabled: boolean;
    message: string;
    countdownEnabled: boolean;
    /** The countdown has its own window: a month-long campaign can flash-sale for 3 days. */
    countdownStart: string | null;
    countdownEnd: string | null;
    followCampaignSchedule: boolean;
    style: CountdownStyle;
    zeroBehaviour: CountdownZeroBehaviour;
    followUpMessage: string;
  };
  skin: {
    enabled: boolean;
    paletteId: string;
  };
  moments: {
    enabled: boolean;
    addToCart: boolean;
    freeShipping: boolean;
    orderConfirmed: boolean;
  };
  music: {
    enabled: boolean;
    track: MusicTrack;
    /** 0–100 percent (PRD 6.7). */
    volume: number;
    waitForClick: boolean;
  };
}

export interface Campaign {
  id: string;
  name: string;
  preset: PresetKey;
  /** The merchant's switch. Combined with the dates it produces the status. */
  enabled: boolean;
  /** Has it ever gone live? Separates Draft from Paused, and gates the first-publish dialog. */
  published: boolean;
  createdAt: string;
  updatedAt: string;
  schedule: CampaignSchedule;
  trigger: CampaignTrigger;
  targeting: CampaignTargeting;
  elements: CampaignElements;
}

const WEEK: DayRule['day'][] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const blankWeek = (): DayRule[] =>
  WEEK.map((day) => ({ day, enabled: false, allDay: false, from: '', to: '' }));

export const dayLabel: Record<DayRule['day'], string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

export const dayShortLabel: Record<DayRule['day'], string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

export function defaultTargeting(): CampaignTargeting {
  return {
    allPages: true,
    homePage: false,
    productPages: false,
    collectionPages: false,
    productScope: 'ALL',
    productIds: [],
    collectionScope: 'ALL',
    collectionIds: [],
    excludeUrls: [],
    marketIds: [],
    shopperType: 'EVERYONE',
    frequency: 'ONCE_PER_DAY',
    device: 'ALL',
  };
}

export function defaultTrigger(): CampaignTrigger {
  return { type: 'PAGE_LOAD', delay: 5, delayUnit: 'SECONDS', elementClass: '' };
}

/** Builds the element config a preset implies (PRD 5). */
export function elementsFromPreset(key: PresetKey): CampaignElements {
  const preset = presetByKey(key);
  return {
    falling: {
      enabled: preset.enabled.falling,
      artwork: preset.artwork,
      colour: 'STOCK',
      density: 'MEDIUM',
    },
    decorations: { enabled: preset.enabled.decorations, style: preset.decoration },
    cursor: { enabled: preset.enabled.cursor, particles: 'MATCH_FALLING', length: 'MEDIUM' },
    bar: {
      enabled: preset.enabled.bar,
      message: preset.barMessage,
      countdownEnabled: preset.countdownEnabled,
      countdownStart: preset.dates?.[0] ?? null,
      countdownEnd: preset.dates?.[1] ?? null,
      followCampaignSchedule: false,
      style: preset.countdownStyle,
      zeroBehaviour: 'HIDE_BAR',
      followUpMessage: 'The sale has ended — thanks for shopping with us',
    },
    skin: { enabled: preset.enabled.skin, paletteId: preset.paletteId },
    moments: {
      enabled: preset.enabled.moments,
      addToCart: preset.enabled.moments,
      freeShipping: preset.enabled.moments,
      orderConfirmed: preset.enabled.moments,
    },
    music: {
      enabled: preset.enabled.music,
      track: 'JINGLE_SOFT',
      volume: 25,
      waitForClick: true,
    },
  };
}

interface CampaignSeed {
  id: string;
  preset: PresetKey;
  name?: string;
  enabled: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  start?: string;
  end?: string;
  marketIds?: string[];
}

function seed(input: CampaignSeed): Campaign {
  const preset = presetByKey(input.preset);
  return {
    id: input.id,
    name: input.name ?? preset.campaignName,
    preset: input.preset,
    enabled: input.enabled,
    published: input.published,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    schedule: {
      visibilityEnabled: true,
      start: input.start ?? preset.dates?.[0] ?? null,
      end: input.end ?? preset.dates?.[1] ?? null,
      fixedRange: { enabled: false, days: blankWeek() },
    },
    trigger: defaultTrigger(),
    targeting: { ...defaultTargeting(), marketIds: input.marketIds ?? [] },
    elements: elementsFromPreset(input.preset),
  };
}

/**
 * Five campaigns, one per status, so the list demonstrates all of them at once
 * with TODAY pinned to 2026-12-16.
 */
export const campaigns: Campaign[] = [
  // Live: started two weeks ago, ten days left.
  seed({
    id: 'campaign-1',
    preset: 'CHRISTMAS',
    enabled: true,
    published: true,
    createdAt: '2026-08-02',
    updatedAt: '2026-12-14',
  }),
  // Scheduled: starts the day after Christmas ends.
  seed({
    id: 'campaign-2',
    preset: 'CHRISTMAS',
    name: 'Boxing Day',
    enabled: true,
    published: true,
    createdAt: '2026-09-11',
    updatedAt: '2026-12-10',
    start: '2026-12-26T00:00',
    end: '2026-12-31T23:59',
    marketIds: [marketIdByName('United Kingdom')],
  }),
  // Paused: published once, switched off by the merchant.
  seed({
    id: 'campaign-3',
    preset: 'CHRISTMAS',
    name: 'New Year',
    enabled: false,
    published: true,
    createdAt: '2026-09-11',
    updatedAt: '2026-12-02',
    start: '2026-12-31T00:00',
    end: '2027-01-02T23:59',
  }),
  // Draft: never published.
  seed({
    id: 'campaign-4',
    preset: 'LUNAR_NEW_YEAR',
    enabled: false,
    published: false,
    createdAt: '2026-11-20',
    updatedAt: '2026-11-28',
    marketIds: [marketIdByName('Vietnam')],
  }),
  // Ended: end date is in the past, so Activate has to be refused.
  seed({
    id: 'campaign-5',
    preset: 'BLACK_FRIDAY',
    enabled: true,
    published: true,
    createdAt: '2026-07-04',
    updatedAt: '2026-11-25',
  }),
];

/** A brand-new campaign, as `Create campaign` produces it. */
export function newCampaign(id: string): Campaign {
  return {
    id,
    name: '',
    preset: 'SCRATCH',
    enabled: false,
    published: false,
    createdAt: TODAY_ISO,
    updatedAt: TODAY_ISO,
    schedule: {
      visibilityEnabled: true,
      start: null,
      end: null,
      fixedRange: { enabled: false, days: blankWeek() },
    },
    trigger: defaultTrigger(),
    targeting: defaultTargeting(),
    elements: elementsFromPreset('SCRATCH'),
  };
}

/** Titles for the resource pickers, so the modals do not re-derive them. */
export const productOptions = products.map((product) => ({
  id: product.id,
  title: product.title,
  detail: product.productType,
}));

export const collectionOptions = collections.map((collection) => ({
  id: collection.id,
  title: collection.title,
  detail: `${collection.productsCount} products`,
}));
