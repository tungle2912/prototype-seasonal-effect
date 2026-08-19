/**
 * Every rule that can stop a merchant saving something broken.
 *
 * Gathered in one file because the same rule is checked in two places — a field
 * warns while typing and the save action blocks — and a rule written twice is a
 * rule that will disagree with itself.
 */

import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import { isPast, toDate } from '../../../mocks/seasonal-effects/today';

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const isValidHex = (value: string): boolean => HEX_PATTERN.test(value);

export interface Issue {
  /** Where to show it: a field name, or 'form' for a banner. */
  field: string;
  message: string;
  /** A warning explains a consequence; an error blocks the save. */
  severity: 'error' | 'warning';
}

/** End date already gone when saving (PRD edge case 2). */
function scheduleIssues(campaign: Campaign): Issue[] {
  const issues: Issue[] = [];
  const { visibilityEnabled, start, end, fixedRange } = campaign.schedule;

  if (visibilityEnabled) {
    if (!start || !end) {
      issues.push({
        field: 'schedule',
        message: 'Set both a start and an end time, or switch visibility time off.',
        severity: 'error',
      });
    } else {
      if (toDate(end) <= toDate(start)) {
        issues.push({
          field: 'schedule',
          message: 'The end time has to come after the start time.',
          severity: 'error',
        });
      }
      if (isPast(end)) {
        issues.push({
          field: 'schedule',
          message: 'The end time is already in the past, so this campaign could never run.',
          severity: 'error',
        });
      }
    }
  }

  // Enabled but no day ticked means the campaign never shows (PRD edge case 18).
  if (fixedRange.enabled && !fixedRange.days.some((day) => day.enabled)) {
    issues.push({
      field: 'fixedRange',
      message: 'No day picked yet — configure days and hours, or the campaign never shows.',
      severity: 'warning',
    });
  }

  // A ticked day with no hours is unsaveable (PRD edge case 12).
  const brokenDay = fixedRange.enabled
    ? fixedRange.days.find((day) => day.enabled && !day.allDay && (!day.from || !day.to))
    : undefined;
  if (brokenDay) {
    issues.push({
      field: 'fixedRange',
      message: 'Every day you tick needs a from and a to time, unless it runs all day.',
      severity: 'error',
    });
  }

  return issues;
}

/**
 * The countdown has its own window, and any part of it outside the campaign's
 * visibility window is time no shopper can see (PRD 6.4, edge case 11).
 */
function countdownIssues(campaign: Campaign): Issue[] {
  const bar = campaign.elements.bar;
  if (!bar.enabled || !bar.countdownEnabled || bar.followCampaignSchedule) return [];

  const { countdownStart, countdownEnd } = bar;
  if (!countdownStart || !countdownEnd) return [];

  const issues: Issue[] = [];
  if (toDate(countdownEnd) <= toDate(countdownStart)) {
    issues.push({
      field: 'countdown',
      message: 'The countdown has to end after it starts.',
      severity: 'error',
    });
  }

  const { visibilityEnabled, start, end } = campaign.schedule;
  if (visibilityEnabled && start && end) {
    const outside = toDate(countdownStart) < toDate(start) || toDate(countdownEnd) > toDate(end);
    if (outside) {
      issues.push({
        field: 'countdown',
        message:
          'The countdown window sits outside the campaign visibility window, so part of it will never be seen.',
        severity: 'warning',
      });
    }
  }

  return issues;
}

/** Targeting that guarantees nothing renders (PRD edge cases 14, 15). */
function targetingIssues(campaign: Campaign): Issue[] {
  const issues: Issue[] = [];
  const { targeting, elements } = campaign;

  if (targeting.productPages && targeting.productScope === 'SPECIFIC' && targeting.productIds.length === 0) {
    issues.push({
      field: 'products',
      message:
        'No product selected, so nothing shows on product pages. Pick products, or switch back to all products.',
      severity: 'warning',
    });
  }

  if (
    targeting.collectionPages &&
    targeting.collectionScope === 'SPECIFIC' &&
    targeting.collectionIds.length === 0
  ) {
    issues.push({
      field: 'collections',
      message:
        'No collection selected, so nothing shows on collection pages. Pick collections, or switch back to all collections.',
      severity: 'warning',
    });
  }

  // A cursor trail cannot run on a phone, so mobile-only plus cursor-only shows nothing.
  const onlyCursor =
    elements.cursor.enabled &&
    !elements.falling.enabled &&
    !elements.decorations.enabled &&
    !elements.bar.enabled &&
    !elements.skin.enabled &&
    !elements.moments.enabled;
  if (targeting.device === 'MOBILE' && onlyCursor) {
    issues.push({
      field: 'device',
      message:
        'Cursor effects never run on touch devices, so a mobile-only campaign with only the cursor effect on shows nothing.',
      severity: 'warning',
    });
  }

  return issues;
}

export function campaignIssues(campaign: Campaign): Issue[] {
  return [...scheduleIssues(campaign), ...countdownIssues(campaign), ...targetingIssues(campaign)];
}

export const blockingIssues = (issues: Issue[]): Issue[] =>
  issues.filter((issue) => issue.severity === 'error');

export const issueFor = (issues: Issue[], field: string): Issue | undefined =>
  issues.find((issue) => issue.field === field);
