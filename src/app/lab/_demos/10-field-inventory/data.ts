/**
 * Seed data for demo 10 — Field Inventory.
 *
 * Mock data, wired UI: every number reacts to the live store, but the items,
 * categories, thresholds, and crew activity mirror Suarez Forestry's real
 * Supabase schema (inventory_items + inventory_logs, trailer-based stock at
 * the Heber-Overgaard yard, John Deere + CAT part numbers). Stock is adjusted
 * through one mutation that logs-before-update, mirroring their
 * adjust_inventory_quantity SECURITY DEFINER RPC.
 */

export type Category =
  | 'belts'
  | 'chains'
  | 'electrical'
  | 'fasteners'
  | 'filters'
  | 'fittings'
  | 'fuel'
  | 'hydraulic_hoses'
  | 'oil'
  | 'ppe'
  | 'rigging';

export interface Item {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  minThreshold: number;
}

export type LogAction = 'pull' | 'add';

export interface LogEntry {
  id: string;
  itemName: string;
  crew: string;
  action: LogAction;
  qty: number; // signed: negative for pull, positive for add
  at: number; // epoch ms
}

export const TRAILER = { name: 'Trailer 1 — Main', location: 'Heber-Overgaard Yard' } as const;

/** Display label per category (DB stores snake_case enums). */
export const CATEGORY_LABEL: Record<Category, string> = {
  belts: 'Belts',
  chains: 'Chains',
  electrical: 'Electrical',
  fasteners: 'Fasteners',
  filters: 'Filters',
  fittings: 'Fittings',
  fuel: 'Fuel',
  hydraulic_hoses: 'Hydraulic Hoses',
  oil: 'Oil',
  ppe: 'PPE',
  rigging: 'Rigging',
};

let n = 0;
const id = (prefix: string) => `${prefix}-${++n}`;

export const SEED_ITEMS: ReadonlyArray<Item> = [
  { id: id('i'), name: 'Fan Belt Universal 60 in', category: 'belts', quantity: 1, minThreshold: 2 },
  { id: id('i'), name: 'Alternator Belt JD RE57592', category: 'belts', quantity: 2, minThreshold: 2 },
  { id: id('i'), name: 'A/C Belt CAT 4N-0735', category: 'belts', quantity: 3, minThreshold: 2 },
  { id: id('i'), name: 'Fuel Filter RE541922', category: 'filters', quantity: 1, minThreshold: 3 },
  { id: id('i'), name: 'Air Filter Primary RE282286', category: 'filters', quantity: 2, minThreshold: 3 },
  { id: id('i'), name: 'John Deere Oil Filter RE504836', category: 'filters', quantity: 3, minThreshold: 5 },
  { id: id('i'), name: 'CAT Oil Filter 1R-0750', category: 'filters', quantity: 4, minThreshold: 4 },
  { id: id('i'), name: 'Hydraulic Filter AT335977', category: 'filters', quantity: 6, minThreshold: 4 },
  { id: id('i'), name: '3/4 in JIC Male Fittings (bag of 10)', category: 'fittings', quantity: 2, minThreshold: 3 },
  { id: id('i'), name: 'O-Ring Assortment Kit', category: 'fittings', quantity: 3, minThreshold: 2 },
  { id: id('i'), name: 'DEF Fluid 2.5gal', category: 'fuel', quantity: 0, minThreshold: 4 },
  { id: id('i'), name: 'Diesel Fuel (gal in reserve)', category: 'fuel', quantity: 150, minThreshold: 100 },
  { id: id('i'), name: '3/8 in Choker Chain 12ft', category: 'chains', quantity: 8, minThreshold: 5 },
  { id: id('i'), name: 'Chain Binders 3/8 in', category: 'chains', quantity: 2, minThreshold: 2 },
  { id: id('i'), name: '1 in Hydraulic Hose 6ft', category: 'hydraulic_hoses', quantity: 2, minThreshold: 2 },
  { id: id('i'), name: 'Fuse Assortment Kit', category: 'electrical', quantity: 4, minThreshold: 3 },
];

interface SeedLog {
  itemName: string;
  crew: string;
  action: LogAction;
  qty: number;
  minsAgo: number;
}

const SEED_LOGS: ReadonlyArray<SeedLog> = [
  { crew: 'Miguel Reyes', action: 'pull', qty: -1, itemName: 'DEF Fluid 2.5gal', minsAgo: 6 },
  { crew: 'Jake Thompson', action: 'pull', qty: -2, itemName: 'John Deere Oil Filter RE504836', minsAgo: 41 },
  { crew: 'Carlos Mendez', action: 'pull', qty: -1, itemName: '3/4 in JIC Male Fittings (bag of 10)', minsAgo: 78 },
  { crew: 'Miguel Reyes', action: 'pull', qty: -2, itemName: 'Fuel Filter RE541922', minsAgo: 114 },
  { crew: 'Field Crew', action: 'pull', qty: -1, itemName: '3/8 in Choker Chain 12ft', minsAgo: 150 },
  { crew: 'Tyler Brooks', action: 'add', qty: 3, itemName: 'Hydraulic Filter AT335977', minsAgo: 205 },
  { crew: 'Ryan Whitehorse', action: 'pull', qty: -1, itemName: 'Air Filter Primary RE282286', minsAgo: 268 },
  { crew: 'jose@gmail.com', action: 'add', qty: 2, itemName: 'A/C Belt CAT 4N-0735', minsAgo: 332 },
];

/** Crew names attributed to scan-driven adjustments in the demo. */
export const CREW_ROSTER = [
  'Miguel Reyes',
  'Jake Thompson',
  'Carlos Mendez',
  'Tyler Brooks',
  'Ryan Whitehorse',
] as const;

/** Build seed logs with concrete timestamps relative to now. */
export function buildSeedLogs(now: number): LogEntry[] {
  return SEED_LOGS.map((l, i) => ({
    id: `log-seed-${i}`,
    itemName: l.itemName,
    crew: l.crew,
    action: l.action,
    qty: l.qty,
    at: now - l.minsAgo * 60_000,
  }));
}
