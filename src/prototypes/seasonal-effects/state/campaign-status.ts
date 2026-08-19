/**
 * Campaign status is derived, never stored.
 *
 * Two inputs decide it: the merchant's `enabled` switch and today against the
 * schedule. Storing a status would mean a nightly job to keep it true, and a
 * campaign showing "Live" the morning after it ended.
 */

import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import { daysUntil, isPast, toDate, TODAY } from '../../../mocks/seasonal-effects/today';

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'ENDED';

export function statusOf(campaign: Campaign): CampaignStatus {
  if (!campaign.published) return 'DRAFT';

  const { visibilityEnabled, start, end } = campaign.schedule;

  // No window to compare against, so there is nothing to schedule and nothing
  // to end: the merchant switches it off themselves (PRD 4.1, 7.1).
  if (!visibilityEnabled || !start || !end) {
    return campaign.enabled ? 'LIVE' : 'PAUSED';
  }

  if (isPast(end)) return 'ENDED';
  if (!campaign.enabled) return 'PAUSED';
  if (toDate(start).getTime() > TODAY.getTime()) return 'SCHEDULED';
  return 'LIVE';
}

export const statusLabel: Record<CampaignStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  PAUSED: 'Paused',
  ENDED: 'Ended',
};

/**
 * Built for Shopify colour semantics: green for a successful outcome, yellow for
 * paused, neutral for everything that is neither. Red is reserved for errors and
 * blocked actions, so no status uses it.
 */
export const statusTone: Record<CampaignStatus, 'success' | 'info' | 'attention' | undefined> = {
  LIVE: 'success',
  SCHEDULED: 'info',
  PAUSED: 'attention',
  DRAFT: undefined,
  ENDED: undefined,
};

/** A campaign that is neither running nor waiting reads as dimmed in the table. */
export const isDimmed = (status: CampaignStatus): boolean =>
  status === 'DRAFT' || status === 'PAUSED' || status === 'ENDED';

/** The second line of the "When" column: why this campaign is in this state. */
export function whenSummary(campaign: Campaign): string {
  const status = statusOf(campaign);
  const { visibilityEnabled, start, end } = campaign.schedule;

  if (!visibilityEnabled || !start || !end) {
    return status === 'LIVE' ? 'runs until you switch it off' : 'no end date set';
  }

  switch (status) {
    case 'LIVE':
      return `${daysUntil(end)} days left`;
    case 'SCHEDULED':
      return `starts in ${daysUntil(start)} days`;
    case 'ENDED':
      return `ended ${Math.abs(daysUntil(end))} days ago`;
    case 'PAUSED':
      return 'paused by you';
    case 'DRAFT':
      return 'never published';
  }
}

export type CampaignTab = 'ALL' | 'LIVE' | 'SCHEDULED' | 'NOT_RUNNING' | 'ENDED';

export const campaignTabs: { id: CampaignTab; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'LIVE', label: 'Live' },
  { id: 'SCHEDULED', label: 'Scheduled' },
  { id: 'NOT_RUNNING', label: 'Not running' },
  { id: 'ENDED', label: 'Ended' },
];

export function inTab(status: CampaignStatus, tab: CampaignTab): boolean {
  if (tab === 'ALL') return true;
  if (tab === 'NOT_RUNNING') return status === 'DRAFT' || status === 'PAUSED';
  return status === tab;
}

/** How many effects this campaign turns on — the number the publish dialog quotes. */
export function effectCount(campaign: Campaign): number {
  const { falling, decorations, cursor, bar, skin, moments, music } = campaign.elements;
  return [falling, decorations, cursor, bar, skin, moments, music].filter(
    (element) => element.enabled,
  ).length;
}

/**
 * Two campaigns live at once over the same market (PRD 4.4). The later start date
 * wins; the other keeps its configuration but stops rendering, so nothing the
 * merchant set up is thrown away behind their back.
 */
export interface CampaignConflict {
  winner: Campaign;
  suppressed: Campaign;
  /** The days they actually collide on — `null` when one runs open-ended. */
  overlap: { start: string; end: string } | null;
}

function overlaps(a: Campaign, b: Campaign): boolean {
  const aStart = a.schedule.start;
  const aEnd = a.schedule.end;
  const bStart = b.schedule.start;
  const bEnd = b.schedule.end;
  if (!aStart || !aEnd || !bStart || !bEnd) return true; // an open-ended campaign overlaps everything
  return toDate(aStart) <= toDate(bEnd) && toDate(bStart) <= toDate(aEnd);
}

function sharesMarket(a: Campaign, b: Campaign): boolean {
  const one = a.targeting.marketIds;
  const two = b.targeting.marketIds;
  if (one.length === 0 || two.length === 0) return true; // "all markets" collides with any market
  return one.some((id) => two.includes(id));
}

/**
 * The days two campaigns actually collide on.
 *
 * Worth computing rather than glossing: two campaigns that share a single day are
 * not the same problem as two that run the same fortnight, and telling a merchant
 * their live campaign "will not render" when it only steps aside for one day would
 * send them looking for a fault that is not there.
 */
function overlapWindow(a: Campaign, b: Campaign): { start: string; end: string } | null {
  const aStart = a.schedule.start;
  const aEnd = a.schedule.end;
  const bStart = b.schedule.start;
  const bEnd = b.schedule.end;
  if (!aStart || !aEnd || !bStart || !bEnd) return null;

  const start = toDate(aStart) > toDate(bStart) ? aStart : bStart;
  const end = toDate(aEnd) < toDate(bEnd) ? aEnd : bEnd;
  return { start, end };
}

function startTime(campaign: Campaign): number {
  const start = campaign.schedule.start;
  return start ? toDate(start).getTime() : 0;
}

export function findConflicts(campaigns: Campaign[]): CampaignConflict[] {
  const running = campaigns.filter((campaign) => {
    const status = statusOf(campaign);
    return status === 'LIVE' || status === 'SCHEDULED';
  });

  const conflicts: CampaignConflict[] = [];

  for (let i = 0; i < running.length; i += 1) {
    for (let j = i + 1; j < running.length; j += 1) {
      const a = running[i];
      const b = running[j];
      if (!a || !b) continue;
      if (!overlaps(a, b) || !sharesMarket(a, b)) continue;
      const [winner, suppressed] = startTime(a) >= startTime(b) ? [a, b] : [b, a];
      conflicts.push({ winner, suppressed, overlap: overlapWindow(a, b) });
    }
  }

  return conflicts;
}
