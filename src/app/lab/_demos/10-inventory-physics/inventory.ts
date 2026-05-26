'use client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PileId = 'in-stock' | 'low' | 'order-now';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  pile: PileId;
}

export interface ActivityEntry {
  id: string;
  itemId: string;
  itemName: string;
  fromPile: PileId;
  toPile: PileId;
  timestamp: Date;
}

// ─── Pile config ──────────────────────────────────────────────────────────────

export interface PileConfig {
  id: PileId;
  label: string;
  /** Center X in world units (orthographic, scene spans ~±8) */
  cx: number;
  /** Half-width of the bucket opening */
  halfW: number;
  /** Color for the label / tint */
  color: string;
  /** Tailwind CSS classes for the DOM badge */
  badgeClass: string;
}

export const PILES: ReadonlyArray<PileConfig> = [
  {
    id: 'in-stock',
    label: 'In Stock',
    cx: -5.2,
    halfW: 2.3,
    color: '#4ade80',
    badgeClass: 'border-green-500/40 bg-green-950/60 text-green-400',
  },
  {
    id: 'low',
    label: 'Low',
    cx: 0,
    halfW: 2.3,
    color: '#fbbf24',
    badgeClass: 'border-amber-500/40 bg-amber-950/60 text-amber-400',
  },
  {
    id: 'order-now',
    label: 'Order Now',
    cx: 5.2,
    halfW: 2.3,
    color: '#f87171',
    badgeClass: 'border-red-500/40 bg-red-950/60 text-red-400',
  },
] as const;

// ─── Pile lookup helper ───────────────────────────────────────────────────────

export function getPileConfig(id: PileId): PileConfig {
  const cfg = PILES.find((p) => p.id === id);
  if (!cfg) throw new Error(`Unknown pile: ${id}`);
  return cfg;
}

/**
 * Determine which pile a world-space X coordinate falls into.
 * Returns null if not clearly inside any pile.
 */
export function xToPile(x: number): PileId | null {
  for (const pile of PILES) {
    if (Math.abs(x - pile.cx) <= pile.halfW) return pile.id;
  }
  return null;
}

// ─── Initial item data ────────────────────────────────────────────────────────

function deriveInitialPile(qty: number): PileId {
  if (qty === 0) return 'order-now';
  if (qty <= 2) return 'low';
  return 'in-stock';
}

const RAW_ITEMS = [
  { name: 'Chlorine tabs 3in (50ct)', sku: 'CHT-3-50', qty: 3 },
  { name: 'Pump basket #PB-12', sku: 'PB-012', qty: 1 },
  { name: 'Pool brush 18in', sku: 'BR-18', qty: 6 },
  { name: 'DE filter media', sku: 'DE-MED', qty: 0 },
  { name: 'Saltwater cell', sku: 'SWC-01', qty: 1 },
  { name: 'Heater control board', sku: 'HCB-44', qty: 0 },
  { name: 'Skimmer net', sku: 'SKN-01', qty: 4 },
  { name: 'pH balancer 5L', sku: 'PHB-5L', qty: 2 },
  { name: 'Algaecide concentrate', sku: 'ALG-C', qty: 1 },
  { name: 'Strainer gaskets (10pk)', sku: 'SGK-10', qty: 7 },
] as const;

export const INITIAL_ITEMS: ReadonlyArray<InventoryItem> = RAW_ITEMS.map((r) => ({
  id: r.sku,
  name: r.name,
  sku: r.sku,
  qty: r.qty,
  pile: deriveInitialPile(r.qty),
}));

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function pileLabelOf(id: PileId): string {
  return getPileConfig(id).label;
}
