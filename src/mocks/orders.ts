/** Order fixtures using the Admin API's financial/fulfillment enum values. */

export type FinancialStatus = 'PAID' | 'PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type FulfillmentStatus = 'FULFILLED' | 'UNFULFILLED' | 'PARTIALLY_FULFILLED';

export interface Order {
  id: string;
  name: string;
  customerName: string;
  totalPrice: number;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  lineItemCount: number;
  createdAt: string;
}

export const orders: Order[] = [
  {
    id: 'gid://shopify/Order/5901234001',
    name: '#1042',
    customerName: 'Mai Nguyen',
    totalPrice: 284.5,
    financialStatus: 'PAID',
    fulfillmentStatus: 'UNFULFILLED',
    lineItemCount: 3,
    createdAt: '2026-08-18T14:22:00Z',
  },
  {
    id: 'gid://shopify/Order/5901234002',
    name: '#1041',
    customerName: 'Daniel Okafor',
    totalPrice: 96,
    financialStatus: 'PENDING',
    fulfillmentStatus: 'UNFULFILLED',
    lineItemCount: 1,
    createdAt: '2026-08-18T09:07:00Z',
  },
  {
    id: 'gid://shopify/Order/5901234003',
    name: '#1040',
    customerName: 'Sofia Bergström',
    totalPrice: 512.25,
    financialStatus: 'PAID',
    fulfillmentStatus: 'FULFILLED',
    lineItemCount: 5,
    createdAt: '2026-08-17T16:48:00Z',
  },
  {
    id: 'gid://shopify/Order/5901234004',
    name: '#1039',
    customerName: 'Hannah Reyes',
    totalPrice: 148,
    financialStatus: 'PARTIALLY_REFUNDED',
    fulfillmentStatus: 'PARTIALLY_FULFILLED',
    lineItemCount: 4,
    createdAt: '2026-08-16T11:30:00Z',
  },
  {
    id: 'gid://shopify/Order/5901234005',
    name: '#1038',
    customerName: 'Liam Patel',
    totalPrice: 32,
    financialStatus: 'REFUNDED',
    fulfillmentStatus: 'UNFULFILLED',
    lineItemCount: 1,
    createdAt: '2026-08-15T08:15:00Z',
  },
];
