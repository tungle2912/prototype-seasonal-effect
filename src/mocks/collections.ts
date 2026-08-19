/**
 * Collection fixtures shaped like the GraphQL Admin API. Used by any prototype
 * that needs a collection picker — the real app would open App Bridge's
 * resource picker, which returns records of this shape.
 */

export interface Collection {
  id: string;
  title: string;
  handle: string;
  productsCount: number;
  updatedAt: string;
}

export const collections: Collection[] = [
  {
    id: 'gid://shopify/Collection/4410000001',
    title: 'Holiday gifts',
    handle: 'holiday-gifts',
    productsCount: 24,
    updatedAt: '2026-11-28',
  },
  {
    id: 'gid://shopify/Collection/4410000002',
    title: 'Candles and scent',
    handle: 'candles-and-scent',
    productsCount: 18,
    updatedAt: '2026-10-02',
  },
  {
    id: 'gid://shopify/Collection/4410000003',
    title: 'Outerwear',
    handle: 'outerwear',
    productsCount: 31,
    updatedAt: '2026-09-14',
  },
  {
    id: 'gid://shopify/Collection/4410000004',
    title: 'New arrivals',
    handle: 'new-arrivals',
    productsCount: 12,
    updatedAt: '2026-12-08',
  },
  {
    id: 'gid://shopify/Collection/4410000005',
    title: 'Under $50',
    handle: 'under-50',
    productsCount: 46,
    updatedAt: '2026-07-21',
  },
  {
    id: 'gid://shopify/Collection/4410000006',
    title: 'Sale',
    handle: 'sale',
    productsCount: 9,
    updatedAt: '2026-11-27',
  },
];
