import { shop } from '../mocks/shop';

/**
 * Formatting helpers. Prototypes must never hand-roll currency or date output —
 * merchants notice when a mockup shows "1234.5 USD" instead of "$1,234.50".
 */

export function formatMoney(amount: number, currency: string = shop.currencyCode): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/** Compact admin style date, e.g. "Aug 19, 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Date with time, e.g. "Aug 19, 2026 at 1:05 PM". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = formatDate(iso);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return `${day} at ${time}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(
    value / 100,
  );
}

/** Extracts the numeric id from a Shopify GID, e.g. gid://shopify/Product/42 -> "42". */
export function idFromGid(gid: string): string {
  return gid.split('/').pop() ?? gid;
}
