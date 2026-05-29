/**
 * Derived status + small helpers for demo 10.
 *
 * Status is never stored — it's a pure function of (quantity, minThreshold),
 * so it always stays consistent with the live count. Mirrors the real
 * low-stock mechanic: min_threshold is the reorder trigger.
 */

import { useEffect, useRef, useState } from 'react';
import type { Item } from './data';

export type StockStatus = 'in' | 'low' | 'reorder' | 'out';

export const STATUS: Record<StockStatus, { label: string; color: string; rank: number }> = {
  out: { label: 'Out', color: '#f87171', rank: 0 },
  reorder: { label: 'Reorder', color: '#fb923c', rank: 1 },
  low: { label: 'Low', color: '#fbbf24', rank: 2 },
  in: { label: 'In stock', color: '#34d399', rank: 3 },
};

export function statusOf(item: Pick<Item, 'quantity' | 'minThreshold'>): StockStatus {
  if (item.quantity <= 0) return 'out';
  if (item.quantity < item.minThreshold) return 'reorder';
  if (item.quantity === item.minThreshold) return 'low';
  return 'in';
}

/**
 * Real part-number token pulled from an item name for the mono sub-label.
 * Requires BOTH a letter and a digit and length >= 4, so genuine part numbers
 * (RE541922, 4N-0735, AT335977) show but plain sizes/quantities ("10", "60",
 * "12ft") do not.
 */
export function extractPartNumber(name: string): string | null {
  const m = name.match(/\b(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9][A-Z0-9-]{3,}\b/);
  return m ? m[0] : null;
}

export function initials(crew: string): string {
  const base = crew.includes('@') ? crew.split('@')[0]! : crew;
  const parts = base.replace(/[^a-zA-Z ]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export function formatRelative(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/**
 * rAF count-up: animates the displayed number toward `value` so counts roll
 * rather than snap. Returns the current displayed (rounded) value.
 */
export function useCountUp(value: number, durationMs = 450): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();
    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;

    const tick = (t: number) => {
      const p = Math.min(1, (t - startRef.current) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(from + delta * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}
