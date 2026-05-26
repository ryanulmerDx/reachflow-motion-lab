'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { formatTime, pileLabelOf, getPileConfig, type ActivityEntry } from './inventory';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ActivityLogProps {
  entries: ActivityEntry[];
  onUndo: (entryId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivityLog({ entries, onUndo }: ActivityLogProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const prevCountRef = useRef(entries.length);

  // GSAP slide-in when a new entry is prepended
  useEffect(() => {
    if (entries.length > prevCountRef.current && listRef.current) {
      const firstItem = listRef.current.firstElementChild as HTMLElement | null;
      if (firstItem) {
        gsap.fromTo(
          firstItem,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
      }
    }
    prevCountRef.current = entries.length;
  }, [entries.length]);

  return (
    <aside className="flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Recent activity
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-dim)]/50">
          Drag a card into a pile to log a move.
        </p>
      ) : (
        <ul ref={listRef} className="flex flex-col gap-2">
          {entries.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} onUndo={onUndo} />
          ))}
        </ul>
      )}
    </aside>
  );
}

// ─── Single row ───────────────────────────────────────────────────────────────

function ActivityRow({
  entry,
  onUndo,
}: {
  entry: ActivityEntry;
  onUndo: (entryId: string) => void;
}) {
  const toConfig = getPileConfig(entry.toPile);

  return (
    <li className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      {/* Item name + time */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium leading-tight text-[var(--color-ink)]">
          {entry.itemName}
        </p>
        <span className="shrink-0 font-mono text-[9px] text-[var(--color-ink-dim)]">
          {formatTime(entry.timestamp)}
        </span>
      </div>

      {/* Transition arrow + undo */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--color-ink-dim)]">
          {pileLabelOf(entry.fromPile)}
          <span className="mx-1.5" style={{ color: toConfig.color }}>
            →
          </span>
          <span style={{ color: toConfig.color }}>{pileLabelOf(entry.toPile)}</span>
        </p>
        <button
          type="button"
          onClick={() => onUndo(entry.id)}
          className="rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--color-ink-dim)] transition-colors hover:bg-white/5 hover:text-[var(--color-accent)]"
        >
          Undo
        </button>
      </div>
    </li>
  );
}
