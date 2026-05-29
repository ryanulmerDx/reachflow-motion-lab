'use client';

/**
 * Demo 10 — Field Inventory
 *
 * A forestry field-service inventory cockpit, mirroring Suarez Forestry's real
 * Supabase model: trailer-based stock at the Heber-Overgaard yard, items by
 * category with a per-item reorder threshold, and a crew activity log. Stock
 * moves through one mutation that writes a log row *before* updating the count
 * — mirroring their adjust_inventory_quantity SECURITY DEFINER RPC.
 *
 * Mock data, wired UI: every number, status, alert, and log entry reacts to
 * local state in real time. No physics toys — this reads like a tool a foreman
 * would actually use to decide what to reorder before the next job.
 */

import Link from 'next/link';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { findDemo } from '@/lib/demo-registry';
import {
  buildSeedLogs,
  CATEGORY_LABEL,
  CREW_ROSTER,
  SEED_ITEMS,
  TRAILER,
  type Category,
  type Item,
  type LogEntry,
} from './data';
import { STATUS, statusOf, extractPartNumber, formatRelative, initials, useCountUp } from './status';
import { ScanModal } from './scan-modal';

const demo = findDemo('field-inventory')!;

// ─── Store ──────────────────────────────────────────────────────────────────

interface State {
  items: Item[];
  logs: LogEntry[];
  category: Category | 'all';
}

type Action =
  | { type: 'ADJUST'; itemId: string; delta: number; crew: string }
  | { type: 'SET_CATEGORY'; category: Category | 'all' };

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CATEGORY':
      return { ...state, category: action.category };
    case 'ADJUST': {
      const delta = clamp(action.delta, -1000, 1000);
      const item = state.items.find((i) => i.id === action.itemId);
      if (!item) return state;
      const next = Math.max(0, item.quantity + delta);
      const applied = next - item.quantity; // guarded actual change
      if (applied === 0) return state;
      // Log BEFORE update — mirrors the RPC's audit-row-then-update order.
      const entry: LogEntry = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        itemName: item.name,
        crew: action.crew,
        action: delta < 0 ? 'pull' : 'add',
        qty: applied,
        at: Date.now(),
      };
      return {
        ...state,
        logs: [entry, ...state.logs],
        items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: next } : i)),
      };
    }
    default:
      return state;
  }
}

function init(): State {
  return {
    items: SEED_ITEMS.map((i) => ({ ...i })),
    logs: buildSeedLogs(Date.now()),
    category: 'all',
  };
}

// ─── Root ───────────────────────────────────────────────────────────────────

export default function FieldInventory() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const [scanning, setScanning] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Tick for relative timestamps
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const adjust = (itemId: string, delta: number, crew: string) =>
    dispatch({ type: 'ADJUST', itemId, delta, crew });

  // Derived rollups
  const totalUnits = useMemo(() => state.items.reduce((s, i) => s + i.quantity, 0), [state.items]);
  const reorderCount = useMemo(
    () => state.items.filter((i) => statusOf(i) !== 'in').length,
    [state.items]
  );
  const outCount = useMemo(() => state.items.filter((i) => statusOf(i) === 'out').length, [state.items]);

  const categories = useMemo(() => {
    const present = new Set(state.items.map((i) => i.category));
    return [...present].sort() as Category[];
  }, [state.items]);

  const visible = useMemo(() => {
    const list =
      state.category === 'all'
        ? state.items
        : state.items.filter((i) => i.category === state.category);
    return [...list].sort((a, b) => {
      const r = STATUS[statusOf(a)].rank - STATUS[statusOf(b)].rank;
      return r !== 0 ? r : a.name.localeCompare(b.name);
    });
  }, [state.items, state.category]);

  const alerts = useMemo(
    () =>
      state.items
        .filter((i) => statusOf(i) !== 'in')
        .sort((a, b) => STATUS[statusOf(a)].rank - STATUS[statusOf(b)].rank),
    [state.items]
  );

  function simulateScan() {
    const candidates = state.items.filter((i) => i.quantity > 0);
    const item = candidates[Math.floor(Math.random() * candidates.length)];
    if (!item) return;
    const crew = CREW_ROSTER[Math.floor(Math.random() * CREW_ROSTER.length)]!;
    adjust(item.id, -1, crew);
  }

  function exportCsv() {
    const rows = [
      ['Item', 'Category', 'Quantity', 'Min threshold', 'Status', 'Trailer'],
      ...state.items.map((i) => [
        i.name,
        CATEGORY_LABEL[i.category],
        String(i.quantity),
        String(i.minThreshold),
        STATUS[statusOf(i)].label,
        TRAILER.name,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field-inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <main className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
        <header className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            {demo.ordinal} · {demo.system}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-medium leading-[1.05] md:text-6xl">
            {demo.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--color-ink-dim)] md:text-lg">{demo.tagline}</p>
          <p className="mt-3 max-w-2xl font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            {TRAILER.name} · {TRAILER.location} · scan to log a pull or restock.
          </p>
        </header>

        {/* Action bar */}
        <section className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-black transition-opacity hover:opacity-90"
          >
            Scan item
          </button>
          <button
            type="button"
            onClick={simulateScan}
            className="rounded-full border border-white/10 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-ink)]"
          >
            Simulate field scan
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-full border border-white/10 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-ink)]"
          >
            Export CSV
          </button>
        </section>

        {/* KPI strip */}
        <section className="mx-auto mt-6 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 md:grid-cols-4">
          <Kpi label="Items tracked" value={state.items.length} />
          <Kpi label="Units on hand" value={totalUnits} />
          <Kpi label="Reorder needed" value={reorderCount} accent={reorderCount > 0 ? '#fb923c' : undefined} />
          <Kpi label="Out of stock" value={outCount} accent={outCount > 0 ? '#f87171' : undefined} />
        </section>

        {/* Main grid */}
        <section className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          {/* Inventory list */}
          <div>
            {/* Category pills */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Pill
                active={state.category === 'all'}
                label="All"
                count={state.items.length}
                onClick={() => dispatch({ type: 'SET_CATEGORY', category: 'all' })}
              />
              {categories.map((c) => (
                <Pill
                  key={c}
                  active={state.category === c}
                  label={CATEGORY_LABEL[c]}
                  count={state.items.filter((i) => i.category === c).length}
                  onClick={() => dispatch({ type: 'SET_CATEGORY', category: c })}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {visible.map((item) => (
                <ItemRow key={item.id} item={item} onAdjust={adjust} />
              ))}
            </div>
          </div>

          {/* Right rail */}
          <aside className="flex flex-col gap-4">
            <AlertRail alerts={alerts} onAdjust={adjust} />
            <ActivityFeed logs={state.logs} now={now} />
          </aside>
        </section>

        <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          <p>
            Demo 10 · Trailer-based field inventory + scan-to-log · mirrors Suarez Forestry&apos;s
            schema.{' '}
            <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              ← Back to the lab
            </Link>
          </p>
        </footer>
      </main>

      <AnimatePresence>
        {scanning && (
          <ScanModal items={state.items} onConfirm={adjust} onClose={() => setScanning(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── KPI ────────────────────────────────────────────────────────────────────

function Kpi({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const display = useCountUp(value);
  return (
    <div className="bg-[var(--color-bg)] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        {label}
      </p>
      <p
        className="mt-1 font-display text-3xl font-medium leading-none tabular-nums md:text-4xl"
        style={accent ? { color: accent } : undefined}
      >
        {display}
      </p>
    </div>
  );
}

// ─── Category pill ────────────────────────────────────────────────────────────

function Pill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'border-white/10 text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]'
      }`}
    >
      {label} <span className="opacity-50">{count}</span>
    </button>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onAdjust,
}: {
  item: Item;
  onAdjust: (id: string, delta: number, crew: string) => void;
}) {
  const status = STATUS[statusOf(item)];
  const part = extractPartNumber(item.name);
  const qty = useCountUp(item.quantity);
  // Meter fill: threshold sits at the midpoint, capped at full.
  const fill = clamp(item.quantity / Math.max(1, item.minThreshold * 2), 0, 1);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.015] px-4 py-3 transition-colors hover:border-white/10">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: status.color }}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-[var(--color-ink)]">{item.name}</p>
          {part && (
            <span className="shrink-0 font-mono text-[10px] text-[var(--color-ink-dim)]">{part}</span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
            {CATEGORY_LABEL[item.category]}
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${fill * 100}%`, backgroundColor: status.color }}
            />
          </div>
          <span className="font-mono text-[10px]" style={{ color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-sm tabular-nums text-[var(--color-ink)]">
          {qty}
          <span className="text-[var(--color-ink-dim)]">/{item.minThreshold}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <Step label={`pull one ${item.name}`} onClick={() => onAdjust(item.id, -1, 'Field Crew')}>
            −
          </Step>
          <Step label={`restock one ${item.name}`} onClick={() => onAdjust(item.id, 1, 'Field Crew')}>
            +
          </Step>
        </div>
      </div>
    </div>
  );
}

function Step({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 font-mono text-sm text-[var(--color-ink-dim)] transition-colors hover:border-white/30 hover:bg-white/[0.04] hover:text-[var(--color-ink)]"
    >
      {children}
    </button>
  );
}

// ─── Alert rail ────────────────────────────────────────────────────────────────

function AlertRail({
  alerts,
  onAdjust,
}: {
  alerts: ReadonlyArray<Item>;
  onAdjust: (id: string, delta: number, crew: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Reorder needed
        </p>
        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] tabular-nums text-[var(--color-ink-dim)]">
          {alerts.length}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <p className="font-mono text-[11px] text-white/25">All stock above threshold.</p>
          ) : (
            alerts.map((item) => {
              const status = STATUS[statusOf(item)];
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--color-ink)]">
                    {item.name}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums" style={{ color: status.color }}>
                    {item.quantity}/{item.minThreshold}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdjust(item.id, 1, 'Field Crew')}
                    className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    +1
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Activity feed ──────────────────────────────────────────────────────────

function ActivityFeed({ logs, now }: { logs: ReadonlyArray<LogEntry>; now: number }) {
  return (
    <div className="rounded-2xl border border-white/5 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Crew activity
      </p>
      <div className="mt-4 flex max-h-[340px] flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
        <AnimatePresence initial={false}>
          {logs.slice(0, 18).map((log) => {
            const unverified = log.crew.includes('@');
            return (
              <motion.div
                key={log.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 font-mono text-[9px] text-[var(--color-ink-dim)]">
                  {initials(log.crew)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] leading-tight text-[var(--color-ink)]">
                    <span className="text-[var(--color-ink-dim)]">
                      {log.action === 'pull' ? 'pulled' : 'restocked'}{' '}
                    </span>
                    {log.itemName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-ink-dim)]">
                    <span>{unverified ? log.crew.split('@')[0] : log.crew}</span>
                    {unverified && (
                      <span className="rounded bg-white/5 px-1 py-px text-[8px] normal-case tracking-normal text-white/40">
                        unverified
                      </span>
                    )}
                    <span>· {formatRelative(log.at, now)}</span>
                  </p>
                </div>
                <span
                  className="shrink-0 font-mono text-[12px] tabular-nums"
                  style={{ color: log.qty < 0 ? '#f87171' : '#34d399' }}
                >
                  {log.qty > 0 ? '+' : ''}
                  {log.qty}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
