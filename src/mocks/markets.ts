/**
 * Shopify Markets fixtures. Markets are read-only inside an app: a merchant adds
 * or removes them in Shopify admin, and the app syncs the list. Keeping that
 * asymmetry in the fixture stops a prototype from implying it can edit them.
 */

export interface Market {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 codes the market covers. */
  regions: string[];
  primary: boolean;
  enabled: boolean;
}

/** The store's primary market, and the fallback whenever a lookup misses. */
export const PRIMARY_MARKET_ID = 'gid://shopify/Market/1';

export const markets: Market[] = [
  { id: PRIMARY_MARKET_ID, name: 'Vietnam', regions: ['VN'], primary: true, enabled: true },
  {
    id: 'gid://shopify/Market/2',
    name: 'Europe',
    regions: ['DE', 'FR', 'NL', 'SE'],
    primary: false,
    enabled: true,
  },
  {
    id: 'gid://shopify/Market/3',
    name: 'North America',
    regions: ['US', 'CA'],
    primary: false,
    enabled: true,
  },
  { id: 'gid://shopify/Market/4', name: 'India', regions: ['IN'], primary: false, enabled: true },
  {
    id: 'gid://shopify/Market/5',
    name: 'United Kingdom',
    regions: ['GB'],
    primary: false,
    enabled: true,
  },
  {
    id: 'gid://shopify/Market/6',
    name: 'Australia',
    regions: ['AU', 'NZ'],
    primary: false,
    enabled: false,
  },
];

/** The label an audience column shows for a set of market ids. */
export function marketLabel(ids: string[]): string {
  if (ids.length === 0 || ids.length === markets.length) return 'All markets';
  const names = markets.filter((market) => ids.includes(market.id)).map((market) => market.name);
  return names.length > 0 ? names.join(', ') : 'No market';
}

export const marketIdByName = (name: string): string =>
  markets.find((market) => market.name === name)?.id ?? PRIMARY_MARKET_ID;

/** Last successful sync, shown next to the Re-sync button. */
export const marketsSyncedAt = '2026-12-16T07:12:00';
