/**
 * The two always-on modules and the store-wide settings.
 *
 * What has a season lives in a campaign; what is always there is a module of its
 * own (PRD 9). Tab animation and Scroll to top must not disappear when Christmas
 * ends, which is exactly why they are not campaign fields.
 */

import { brandColoursFromTheme, scrollButtonDefaults } from './palettes';

/* ---------- Tab animation (PRD 9.1) -------------------------------------- */

export type FaviconMode = 'EMOJI' | 'SITE_FAVICON';
export type TabAnimationStyle = 'BLINKING' | 'SCROLLING' | 'TYPING';

export interface TabAnimationSettings {
  enabled: boolean;
  faviconMode: FaviconMode;
  emoji: string;
  style: TabAnimationStyle;
  /** 1–5 on the speed slider. 3 is the animation running at its designed pace. */
  speed: number;
  /** 1 to 5 messages, 30 characters each. Never zero — a module needs something to run. */
  messages: string[];
}

export const TAB_MESSAGE_LIMIT = 5;
export const TAB_MESSAGE_LENGTH = 30;

/**
 * Speed is one continuous thing — how long the animation waits between beats —
 * so it is a slider with five stops rather than three buttons. Level 3 is the
 * pace the animation was designed at; each step either side scales every delay.
 */
export const SPEED_MIN = 1;
export const SPEED_MAX = 5;

const SPEED_FACTORS = [1.9, 1.4, 1, 0.72, 0.5];

/** Multiplies every delay in the animation. */
export const speedFactor = (level: number): number =>
  SPEED_FACTORS[Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(level))) - 1] ?? 1;

const SPEED_LABELS = ['Slowest', 'Slow', 'Normal', 'Fast', 'Fastest'];

export const speedLabel = (level: number): string =>
  SPEED_LABELS[Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(level))) - 1] ?? 'Normal';

export const tabAnimationHint: Record<TabAnimationStyle, string> = {
  BLINKING:
    'The message flashes in and out, swapping with your real page title. Hardest to miss in a row of tabs.',
  SCROLLING:
    'The message slides across the tab like a ticker, so a long line still reads end to end.',
  TYPING:
    'The message types itself out one character at a time, then clears and starts the next one.',
};

export const tabAnimationLabel: Record<TabAnimationStyle, string> = {
  BLINKING: 'Blinking',
  SCROLLING: 'Scrolling',
  TYPING: 'Typing',
};

/** The storefront's real title, restored the moment the shopper comes back. */
export const STOREFRONT_TAB_TITLE = 'Northwind Supply — Home';

export const tabAnimationDefaults: TabAnimationSettings = {
  enabled: true,
  faviconMode: 'EMOJI',
  emoji: '😎',
  style: 'BLINKING',
  speed: 3,
  messages: ['COME BACK !!! 😎', 'PLS don’t go 😎'],
};

/* ---------- Scroll to top (PRD 9.2) -------------------------------------- */

export type ScrollEasing = 'LINEAR' | 'EASE_OUT' | 'EASE_IN_OUT' | 'INSTANT';
export type ButtonEntrance = 'NONE' | 'FADE_IN' | 'SLIDE_UP' | 'BOUNCE' | 'PULSE';
export type ButtonContent = 'ICON' | 'TEXT' | 'ICON_AND_TEXT';
export type BorderStyle = 'SOLID' | 'DASHED' | 'DOTTED' | 'NONE';
export type ButtonShape = 'ROUND' | 'ROUNDED' | 'SQUARE';
export type ButtonSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type ButtonPosition = 'BOTTOM_RIGHT' | 'BOTTOM_LEFT';
export type ShowAfter = 'HALF_SCREEN' | 'ONE_SCREEN' | 'TWO_SCREENS';

export interface ScrollToTopSettings {
  enabled: boolean;
  easing: ScrollEasing;
  entrance: ButtonEntrance;
  content: ButtonContent;
  iconId: string;
  /** Up to 10 characters — a wide button covers the storefront. */
  text: string;
  iconColour: string;
  iconHoverColour: string;
  transparentBackground: boolean;
  backgroundColour: string;
  backgroundHoverColour: string;
  borderWidth: number;
  borderStyle: BorderStyle;
  borderColour: string;
  borderHoverColour: string;
  shape: ButtonShape;
  size: ButtonSize;
  /** On by default: the button should not fight the campaign that is running. */
  matchSeasonalSkin: boolean;
  position: ButtonPosition;
  offsetX: number;
  offsetY: number;
  showAfter: ShowAfter;
  device: 'ALL' | 'DESKTOP' | 'MOBILE';
}

export const SCROLL_TEXT_LENGTH = 10;

export const easingLabel: Record<ScrollEasing, string> = {
  LINEAR: 'Linear',
  EASE_OUT: 'Ease out',
  EASE_IN_OUT: 'Ease in-out',
  INSTANT: 'Instant',
};

export const entranceLabel: Record<ButtonEntrance, string> = {
  NONE: 'None',
  FADE_IN: 'Fade in',
  SLIDE_UP: 'Slide up',
  BOUNCE: 'Bounce',
  PULSE: 'Pulse',
};

export const contentLabel: Record<ButtonContent, string> = {
  ICON: 'Icon',
  TEXT: 'Text',
  ICON_AND_TEXT: 'Icon + text',
};

export const shapeLabel: Record<ButtonShape, string> = {
  ROUND: 'Round',
  ROUNDED: 'Rounded',
  SQUARE: 'Square',
};

export const shapeRadius: Record<ButtonShape, string> = {
  ROUND: '50%',
  ROUNDED: '10px',
  SQUARE: '0',
};

export const sizeLabel: Record<ButtonSize, string> = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  LARGE: 'Large',
};

export const sizePx: Record<ButtonSize, number> = {
  SMALL: 34,
  MEDIUM: 44,
  LARGE: 54,
};

export const positionLabel: Record<ButtonPosition, string> = {
  BOTTOM_RIGHT: 'Bottom right',
  BOTTOM_LEFT: 'Bottom left',
};

export const showAfterLabel: Record<ShowAfter, string> = {
  HALF_SCREEN: 'Half a screen',
  ONE_SCREEN: 'One screen',
  TWO_SCREENS: 'Two screens',
};

/** Multiples of the viewport height the shopper has to scroll first. */
export const showAfterFactor: Record<ShowAfter, number> = {
  HALF_SCREEN: 0.5,
  ONE_SCREEN: 1,
  TWO_SCREENS: 2,
};

export const scrollToTopDefaults: ScrollToTopSettings = {
  enabled: true,
  easing: 'LINEAR',
  entrance: 'NONE',
  content: 'ICON',
  iconId: 'icon-1',
  text: 'TOP',
  iconColour: scrollButtonDefaults.icon,
  iconHoverColour: scrollButtonDefaults.iconHover,
  transparentBackground: false,
  backgroundColour: scrollButtonDefaults.background,
  backgroundHoverColour: scrollButtonDefaults.backgroundHover,
  borderWidth: 1,
  borderStyle: 'SOLID',
  borderColour: scrollButtonDefaults.border,
  borderHoverColour: scrollButtonDefaults.borderHover,
  shape: 'ROUND',
  size: 'MEDIUM',
  matchSeasonalSkin: true,
  position: 'BOTTOM_RIGHT',
  offsetX: 20,
  offsetY: 20,
  showAfter: 'ONE_SCREEN',
  device: 'ALL',
};

/* ---------- Store-wide settings (PRD 9.3, 10, 11, 12) -------------------- */

export type TimezoneMode = 'LOCAL' | 'STORE_ADMIN';
export type SpeedGuardMode = 'BALANCED' | 'FULL_QUALITY' | 'DESKTOP_ONLY';

export interface StoreSettings {
  timezoneMode: TimezoneMode;
  speedGuard: SpeedGuardMode;
  brandColours: { primary: string; sale: string; surface: string };
  /** Read from Shopify admin, never edited here. */
  storeTimezone: string;
  timezoneSyncedAt: string;
}

export const timezoneModeLabel: Record<TimezoneMode, string> = {
  LOCAL: 'Local time zone',
  STORE_ADMIN: 'Store admin timezone',
};

export const speedGuardLabel: Record<SpeedGuardMode, string> = {
  BALANCED: 'Balanced',
  FULL_QUALITY: 'Full quality',
  DESKTOP_ONLY: 'Desktop only',
};

export const speedGuardHint: Record<SpeedGuardMode, string> = {
  BALANCED:
    'Desktop runs at full density, a mid-range phone at about 45%, and a slow connection at about 13% with ambient effects off.',
  FULL_QUALITY: 'No reduction anywhere. Not recommended during the Black Friday week.',
  DESKTOP_ONLY: 'Nothing renders on a phone at all.',
};

export const storeSettingsDefaults: StoreSettings = {
  timezoneMode: 'LOCAL',
  speedGuard: 'BALANCED',
  brandColours: { ...brandColoursFromTheme },
  storeTimezone: '(GMT+07:00) Asia/Ho_Chi_Minh',
  timezoneSyncedAt: '2026-12-16T07:12:00',
};

/* ---------- App embed (PRD 4.2.2) ---------------------------------------- */

export const appEmbedDefaults = {
  enabled: true,
  themeName: 'Dawn 15.2',
  /** The whole storefront runtime, gzipped. The number is the selling point. */
  bundleSizeKb: 14,
};
