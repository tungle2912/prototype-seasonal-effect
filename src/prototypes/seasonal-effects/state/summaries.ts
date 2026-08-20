/**
 * The one-line summary each collapsed effect row shows.
 *
 * A closed row still has to say what it is set to, otherwise the merchant has to
 * open all seven to find the one they meant to change (PRD 6.0).
 */

import type { Campaign, DayRule } from '../../../mocks/seasonal-effects/campaigns';
import {
  artworkLabel,
  countdownStyles,
  decorationLabel,
  decorationStyles,
  densityLabel,
  musicTracks,
  particleColourLabel,
  trailLabel,
  volumeLabel,
} from '../../../mocks/seasonal-effects/effects';
import { paletteById } from '../../../mocks/seasonal-effects/palettes';

const dot = (...parts: (string | false | undefined)[]): string =>
  parts.filter((part): part is string => Boolean(part)).join(' · ');

export function fallingSummary(campaign: Campaign): string {
  const { artwork, colour, density } = campaign.elements.falling;
  return dot(
    artworkLabel(artwork),
    densityLabel(density),
    particleColourLabel[colour].toLowerCase(),
  );
}

export function decorationsSummary(campaign: Campaign): string {
  const style = campaign.elements.decorations.style;
  const placement = decorationStyles.find((option) => option.value === style)?.placement;
  return dot(decorationLabel(style), placement?.toLowerCase());
}

export function cursorSummary(campaign: Campaign): string {
  const { particles, length } = campaign.elements.cursor;
  return dot(
    particles === 'MATCH_FALLING' ? 'same as the falling effect' : 'sparkle',
    `${trailLabel[length].toLowerCase()} trail`,
    'desktop only',
  );
}

export function barSummary(campaign: Campaign): string {
  const bar = campaign.elements.bar;
  const style = countdownStyles.find((option) => option.value === bar.style)?.label;
  const message = bar.message.trim();
  const head = message ? truncate(message, 34) : 'No message written yet';
  return dot(head, bar.countdownEnabled ? `countdown · ${style?.toLowerCase()}` : 'no countdown');
}

export function skinSummary(campaign: Campaign): string {
  const palette = paletteById(campaign.elements.skin.paletteId);
  return dot(palette.label, 'recolours 5 components');
}

export function momentsSummary(campaign: Campaign): string {
  const { addToCart, freeShipping, orderConfirmed } = campaign.elements.moments;
  const on = [
    addToCart && 'add to cart',
    freeShipping && 'free shipping',
    orderConfirmed && 'order confirmed',
  ].filter((entry): entry is string => Boolean(entry));
  return on.length === 0 ? 'No moment picked yet' : on.join(' · ');
}

export function musicSummary(campaign: Campaign): string {
  const music = campaign.elements.music;
  const track = musicTracks.find((option) => option.value === music.track)?.label;
  return dot(
    track,
    volumeLabel(music.volume).toLowerCase(),
    music.waitForClick ? 'waits for a click' : 'starts on its own',
  );
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

/** "Mon 09:00–18:00 · Sat all day", or the warning when nothing is picked. */
export function fixedRangeSummary(days: DayRule[]): string {
  const picked = days.filter((rule) => rule.enabled);
  if (picked.length === 0) {
    return 'No day picked yet — configure days and hours, or the campaign never shows';
  }
  return picked
    .map((rule) =>
      rule.allDay
        ? `${shortDay(rule.day)} all day`
        : `${shortDay(rule.day)} ${rule.from}–${rule.to}`,
    )
    .join(' · ');
}

const shortDay = (day: DayRule['day']): string =>
  day.charAt(0) + day.slice(1).toLowerCase();
