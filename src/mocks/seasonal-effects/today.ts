/**
 * "Now", pinned.
 *
 * Campaign status is derived, not stored (see state/campaign-status.ts), so every
 * badge, countdown and "10 days left" line depends on what today is. Pinning it
 * means a screenshot taken in March still reads the way the demo was designed.
 */

export const TODAY = new Date('2026-12-16T09:00:00');
export const TODAY_ISO = '2026-12-16';

const MS_PER_DAY = 86_400_000;

/** Accepts `2026-12-01` or `2026-12-01T09:30`, both as local time. */
export function toDate(value: string): Date {
  return new Date(value.length <= 10 ? `${value}T00:00` : value);
}

/** Whole days from today until `value`. Negative once it is in the past. */
export function daysUntil(value: string): number {
  return Math.round((toDate(value).getTime() - TODAY.getTime()) / MS_PER_DAY);
}

export function isPast(value: string): boolean {
  return toDate(value).getTime() < TODAY.getTime();
}
