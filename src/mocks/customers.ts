export interface Customer {
  id: string;
  displayName: string;
  email: string;
  ordersCount: number;
  amountSpent: number;
  location: string;
  createdAt: string;
}

export const customers: Customer[] = [
  {
    id: 'gid://shopify/Customer/6501234001',
    displayName: 'Mai Nguyen',
    email: 'mai.nguyen@example.com',
    ordersCount: 7,
    amountSpent: 1284.5,
    location: 'Portland, OR',
    createdAt: '2025-06-18T10:00:00Z',
  },
  {
    id: 'gid://shopify/Customer/6501234002',
    displayName: 'Daniel Okafor',
    email: 'd.okafor@example.com',
    ordersCount: 2,
    amountSpent: 317,
    location: 'Austin, TX',
    createdAt: '2026-01-09T15:24:00Z',
  },
  {
    id: 'gid://shopify/Customer/6501234003',
    displayName: 'Sofia Bergström',
    email: 'sofia.b@example.com',
    ordersCount: 14,
    amountSpent: 3921.75,
    location: 'Stockholm, SE',
    createdAt: '2024-11-30T09:12:00Z',
  },
  {
    id: 'gid://shopify/Customer/6501234004',
    displayName: 'Liam Patel',
    email: 'liam.patel@example.com',
    ordersCount: 1,
    amountSpent: 96,
    location: 'Toronto, ON',
    createdAt: '2026-07-02T18:41:00Z',
  },
  {
    id: 'gid://shopify/Customer/6501234005',
    displayName: 'Hannah Reyes',
    email: 'hannah.reyes@example.com',
    ordersCount: 5,
    amountSpent: 742.2,
    location: 'Manila, PH',
    createdAt: '2025-09-14T12:03:00Z',
  },
];
