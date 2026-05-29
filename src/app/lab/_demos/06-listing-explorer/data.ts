/**
 * Seed data for demo 06 — Listing Explorer.
 *
 * Mock data, wired UI: a stylized map + listing column that stay in sync.
 * Listings are fictional homes in the White Mountains, AZ (Heber-Overgaard,
 * Show Low, Pinetop, Forest Lakes) — the region ReachFlow's forestry client
 * works in. mapX/mapY are 0–100 percentages positioning each pin on the map.
 */

export type ListingType = 'House' | 'Condo' | 'Townhome' | 'Land';
export type ListingStatus = 'For sale' | 'Pending' | 'New';

export interface Listing {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number; // 0 for land
  baths: number; // 0 for land
  sqft: number; // 0 for land
  acres?: number; // land only
  type: ListingType;
  status: ListingStatus;
  mapX: number;
  mapY: number;
}

export const STATUS_COLOR: Record<ListingStatus, string> = {
  New: '#67e8f9',
  Pending: '#fbbf24',
  'For sale': '#34d399',
};

export const LISTINGS: ReadonlyArray<Listing> = [
  { id: 'l1', address: '412 Pine Loop', city: 'Heber', price: 389000, beds: 3, baths: 2, sqft: 1640, type: 'House', status: 'For sale', mapX: 22, mapY: 64 },
  { id: 'l2', address: '88 Mogollon Dr', city: 'Overgaard', price: 615000, beds: 4, baths: 3, sqft: 2480, type: 'House', status: 'New', mapX: 58, mapY: 30 },
  { id: 'l3', address: '1205 Rim View Rd', city: 'Show Low', price: 452000, beds: 3, baths: 2, sqft: 1920, type: 'House', status: 'For sale', mapX: 79, mapY: 52 },
  { id: 'l4', address: '27 Aspen Ct', city: 'Pinetop', price: 729000, beds: 4, baths: 3, sqft: 2950, type: 'House', status: 'For sale', mapX: 68, mapY: 74 },
  { id: 'l5', address: '9 Timber Ridge #4', city: 'Overgaard', price: 268000, beds: 2, baths: 2, sqft: 1100, type: 'Condo', status: 'Pending', mapX: 45, mapY: 45 },
  { id: 'l6', address: '540 Buckskin Trl', city: 'Heber', price: 339000, beds: 2, baths: 1, sqft: 980, type: 'Townhome', status: 'For sale', mapX: 16, mapY: 38 },
  { id: 'l7', address: '3 Elk Run', city: 'Forest Lakes', price: 845000, beds: 5, baths: 4, sqft: 3400, type: 'House', status: 'New', mapX: 34, mapY: 18 },
  { id: 'l8', address: 'Lot 14 Cedar Bench', city: 'Heber', price: 129000, beds: 0, baths: 0, sqft: 0, acres: 2.1, type: 'Land', status: 'For sale', mapX: 30, mapY: 82 },
  { id: 'l9', address: '760 Juniper Way', city: 'Show Low', price: 499000, beds: 3, baths: 2, sqft: 2100, type: 'House', status: 'For sale', mapX: 88, mapY: 28 },
  { id: 'l10', address: '15 Whitetail Way', city: 'Pinetop', price: 567000, beds: 3, baths: 3, sqft: 2240, type: 'House', status: 'Pending', mapX: 60, mapY: 60 },
];

// ── Filter option definitions ───────────────────────────────────────────────

export const TYPE_OPTIONS: ReadonlyArray<ListingType | 'All'> = [
  'All',
  'House',
  'Condo',
  'Townhome',
  'Land',
];

export const BEDS_OPTIONS = [
  { label: 'Any beds', min: 0 },
  { label: '2+', min: 2 },
  { label: '3+', min: 3 },
  { label: '4+', min: 4 },
] as const;

export const PRICE_OPTIONS = [
  { label: 'Any price', max: Infinity },
  { label: '< $400k', max: 400000 },
  { label: '< $600k', max: 600000 },
  { label: '< $900k', max: 900000 },
] as const;

export function formatPrice(n: number): string {
  return n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
}
