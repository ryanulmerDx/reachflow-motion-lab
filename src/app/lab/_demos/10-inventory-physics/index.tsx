'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { findDemo } from '@/lib/demo-registry';
import { Scene } from './scene';
import { ActivityLog } from './activity';
import {
  INITIAL_ITEMS,
  PILES,
  getPileConfig,
  type ActivityEntry,
  type InventoryItem,
  type PileId,
} from './inventory';

const demo = findDemo('inventory-physics')!;

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InventoryPhysics() {
  const [items, setItems] = useState<InventoryItem[]>([...INITIAL_ITEMS]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  // ── Settle handler: a card has come to rest in a new pile ─────────────────
  const handleSettle = useCallback((itemId: string, toPile: PileId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (!item || item.pile === toPile) return prev;

      const entry: ActivityEntry = {
        id: `${itemId}-${Date.now()}`,
        itemId,
        itemName: item.name,
        fromPile: item.pile,
        toPile,
        timestamp: new Date(),
      };

      // Prepend to activity log
      setActivity((log) => [entry, ...log].slice(0, 20));

      // Update item pile in state
      return prev.map((i) => (i.id === itemId ? { ...i, pile: toPile } : i));
    });
  }, []);

  // ── Undo: teleport card back to its previous pile ─────────────────────────
  const handleUndo = useCallback((entryId: string) => {
    setActivity((log) => {
      const entry = log.find((e) => e.id === entryId);
      if (!entry) return log;

      // Restore item pile
      setItems((prev) =>
        prev.map((i) =>
          i.id === entry.itemId ? { ...i, pile: entry.fromPile } : i
        )
      );

      // Remove all log entries for this item at or after this one
      // (because they're now invalidated by the undo)
      const entryIdx = log.indexOf(entry);
      return log.filter((_, i) => i !== entryIdx);
    });
  }, []);

  // ── Pile summaries ────────────────────────────────────────────────────────
  const pileSummaries = PILES.map((pile) => ({
    ...pile,
    count: items.filter((i) => i.pile === pile.id).length,
  }));

  return (
    <main className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
      {/* ── Header ── */}
      <header className="mx-auto max-w-6xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          {demo.ordinal} · {demo.system}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-medium leading-[1.05] md:text-6xl">
          {demo.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-ink-dim)] md:text-lg">
          {demo.tagline}
        </p>
      </header>

      {/* ── Pile summary badges ── */}
      <div className="mx-auto mt-8 max-w-7xl">
        <div className="flex flex-wrap gap-3">
          {pileSummaries.map((pile) => {
            const cfg = getPileConfig(pile.id);
            return (
              <div
                key={pile.id}
                className="flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{
                  borderColor: `${cfg.color}40`,
                  backgroundColor: `${cfg.color}10`,
                  color: cfg.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: cfg.color }}
                />
                {pile.label}
                <span className="opacity-70">· {pile.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Canvas + Sidebar ── */}
      <div className="mx-auto mt-6 max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Physics canvas — must use fixed height in mobile flex-col;
              flex-1 alone collapses the main-axis size because flex-basis 0%
              outranks the inline height in this layout. */}
          <div
            className="relative w-full min-h-0 overflow-hidden rounded-2xl border border-white/5 lg:flex-1"
            style={{ height: 'clamp(380px, 55vh, 600px)' }}
          >
            {/* Pile zone tints — purely decorative background */}
            <div className="pointer-events-none absolute inset-0 flex">
              <div
                className="flex-1 rounded-l-2xl"
                style={{ background: 'linear-gradient(to bottom, transparent 60%, #4ade8008 100%)' }}
              />
              <div
                className="flex-1"
                style={{ background: 'linear-gradient(to bottom, transparent 60%, #fbbf2408 100%)' }}
              />
              <div
                className="flex-1 rounded-r-2xl"
                style={{ background: 'linear-gradient(to bottom, transparent 60%, #f8717108 100%)' }}
              />
            </div>

            {/* Pile zone header labels */}
            <div className="pointer-events-none absolute inset-x-0 top-3 flex px-2">
              {PILES.map((pile) => {
                const cfg = getPileConfig(pile.id);
                return (
                  <div key={pile.id} className="flex flex-1 justify-center">
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.22em]"
                      style={{ color: cfg.color + 'aa' }}
                    >
                      {pile.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Scene items={items} onSettle={handleSettle} />
          </div>

          {/* Activity sidebar */}
          <div className="w-full lg:w-72 xl:w-80">
            <ActivityLog entries={activity} onUndo={handleUndo} />

            {/* Usage hint */}
            <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.015] p-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-ink-dim)]">
                How it works
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--color-ink-dim)]">
                Grab any card and fling it into a pile. Cards have real mass — they bounce
                off each other and settle into stacks. Each move is logged with an undo
                button. Built for Beecroft Pools&apos; field-service workflows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mx-auto mt-12 max-w-7xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 10 · Rapier rigid bodies + drag-fling-settle + undoable activity log.{' '}
          <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}
