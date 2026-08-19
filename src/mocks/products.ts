/**
 * Product fixtures shaped like the GraphQL Admin API: GID ids, handles, and
 * the real `ProductStatus` enum values. Keeping the shape honest means a
 * prototype can be wired to the real API later without reshaping the UI.
 */

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Product {
  id: string;
  title: string;
  handle: string;
  status: ProductStatus;
  vendor: string;
  productType: string;
  price: number;
  compareAtPrice: number | null;
  inventoryQuantity: number;
  totalVariants: number;
  createdAt: string;
}

export const products: Product[] = [
  {
    id: 'gid://shopify/Product/7801234567001',
    title: 'Cascade Rain Shell',
    handle: 'cascade-rain-shell',
    status: 'ACTIVE',
    vendor: 'Northwind',
    productType: 'Outerwear',
    price: 189,
    compareAtPrice: 229,
    inventoryQuantity: 42,
    totalVariants: 9,
    createdAt: '2026-02-11T09:14:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567002',
    title: 'Trailhead Merino Crew',
    handle: 'trailhead-merino-crew',
    status: 'ACTIVE',
    vendor: 'Northwind',
    productType: 'Tops',
    price: 96,
    compareAtPrice: null,
    inventoryQuantity: 118,
    totalVariants: 12,
    createdAt: '2026-01-28T14:02:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567003',
    title: 'Fjord Insulated Bottle 750ml',
    handle: 'fjord-insulated-bottle-750ml',
    status: 'ACTIVE',
    vendor: 'Fjordware',
    productType: 'Drinkware',
    price: 38,
    compareAtPrice: 45,
    inventoryQuantity: 0,
    totalVariants: 4,
    createdAt: '2025-11-05T08:30:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567004',
    title: 'Basecamp Duffel 45L',
    handle: 'basecamp-duffel-45l',
    status: 'ACTIVE',
    vendor: 'Northwind',
    productType: 'Bags',
    price: 145,
    compareAtPrice: null,
    inventoryQuantity: 27,
    totalVariants: 3,
    createdAt: '2026-03-19T11:45:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567005',
    title: 'Summit Wool Beanie',
    handle: 'summit-wool-beanie',
    status: 'ACTIVE',
    vendor: 'Northwind',
    productType: 'Accessories',
    price: 32,
    compareAtPrice: 40,
    inventoryQuantity: 203,
    totalVariants: 6,
    createdAt: '2025-09-22T16:20:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567006',
    title: 'Granite Trail Runner',
    handle: 'granite-trail-runner',
    status: 'DRAFT',
    vendor: 'Stoneline',
    productType: 'Footwear',
    price: 168,
    compareAtPrice: null,
    inventoryQuantity: 64,
    totalVariants: 18,
    createdAt: '2026-07-30T10:05:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567007',
    title: 'Harbour Canvas Tote',
    handle: 'harbour-canvas-tote',
    status: 'ACTIVE',
    vendor: 'Fjordware',
    productType: 'Bags',
    price: 74,
    compareAtPrice: 89,
    inventoryQuantity: 51,
    totalVariants: 2,
    createdAt: '2026-05-14T13:11:00Z',
  },
  {
    id: 'gid://shopify/Product/7801234567008',
    title: 'Alpine Down Vest',
    handle: 'alpine-down-vest',
    status: 'ARCHIVED',
    vendor: 'Northwind',
    productType: 'Outerwear',
    price: 210,
    compareAtPrice: null,
    inventoryQuantity: 3,
    totalVariants: 8,
    createdAt: '2025-08-02T07:55:00Z',
  },
];
