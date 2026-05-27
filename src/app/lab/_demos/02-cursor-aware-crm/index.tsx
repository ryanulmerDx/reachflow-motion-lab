'use client';

import Link from 'next/link';
import { useMemo, useState, type DragEvent } from 'react';
import { findDemo } from '@/lib/demo-registry';
import { CustomCursor } from './cursor';
import {
  DEALS,
  STAGES,
  KPI_METRICS,
  SPARKLINE_DATA,
  type Deal,
  type DealStage,
} from './data';

const demo = findDemo('cursor-aware-crm')!;

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatValue(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function CursorAwareCRM() {
  // Lift deal state so dragging cards between stages actually mutates the board.
  const [deals, setDeals] = useState<ReadonlyArray<Deal>>(DEALS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<DealStage | null>(null);
  const [inspectedDeal, setInspectedDeal] = useState<Deal | null>(null);
  const [showPriority, setShowPriority] = useState(false);

  const byStage = useMemo(() => {
    const map: Record<DealStage, Deal[]> = { New: [], Contacted: [], Proposal: [], Won: [] };
    for (const d of deals) map[d.stage].push(d);
    return map;
  }, [deals]);

  const priorityQueue = useMemo(
    () =>
      [...deals]
        .filter((d) => d.stage === 'Proposal' || d.stage === 'Contacted')
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [deals]
  );

  function moveDeal(id: string, toStage: DealStage) {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, stage: toStage } : d)));
  }

  return (
    <>
      {/* Custom cursor overlay — hides itself on touch devices */}
      <CustomCursor />

      <main
        className="relative min-h-dvh px-6 pb-24 pt-28 md:px-12"
        style={{ cursor: 'none' }}
      >
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
          <p className="mt-3 max-w-2xl font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Drag cards between stages · click any card to inspect · view priority opens a queue panel.
          </p>
        </header>

        {/* ── KPI row ─────────────────────────────────────────────────────── */}
        <section className="mx-auto mt-12 max-w-6xl">
          <div className="grid grid-cols-1 gap-px rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3">
            {KPI_METRICS.map((m) => (
              <button
                key={m.label}
                type="button"
                data-cursor="inspect"
                onClick={() => setShowPriority(true)}
                className="flex flex-col gap-1 bg-[var(--color-bg)] p-6 text-left transition-colors hover:bg-white/[0.04] first:rounded-tl-2xl first:rounded-tr-2xl sm:first:rounded-l-2xl sm:first:rounded-tr-none sm:last:rounded-r-2xl last:rounded-bl-2xl last:rounded-br-2xl"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                  {m.label}
                </p>
                <p className="mt-1 font-display text-4xl font-medium leading-none text-[var(--color-ink)]">
                  {m.value}
                </p>
                <p className="mt-1 font-mono text-[11px] text-[var(--color-ink-dim)]">
                  {m.sub}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Kanban board ────────────────────────────────────────────────── */}
        <section className="mx-auto mt-8 max-w-6xl">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                deals={byStage[stage]}
                isHover={hoverStage === stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (hoverStage !== stage) setHoverStage(stage);
                }}
                onDragLeave={() => setHoverStage((s) => (s === stage ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) moveDeal(id, stage);
                  setHoverStage(null);
                  setDraggingId(null);
                }}
                renderCard={(deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isDragging={draggingId === deal.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', deal.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggingId(deal.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setHoverStage(null);
                    }}
                    onClick={() => setInspectedDeal(deal)}
                  />
                )}
              />
            ))}
          </div>
        </section>

        {/* ── Chart + legend row ──────────────────────────────────────────── */}
        <section className="mx-auto mt-8 max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3">
            <div
              data-cursor="inspect"
              className="col-span-2 rounded-2xl border border-white/5 p-6"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                Weekly closed value · last 8 weeks
              </p>
              <SparklineChart />
            </div>

            <div className="rounded-2xl border border-white/5 p-6">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                Top owners
              </p>
              <OwnerList />
            </div>
          </div>
        </section>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        <section className="mx-auto mt-8 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                Ready to close
              </p>
              <p className="mt-1 text-lg font-medium">
                {priorityQueue.length} deals need follow-up this week.
              </p>
            </div>
            <button
              type="button"
              data-cursor="open"
              onClick={() => setShowPriority((v) => !v)}
              className="rounded-full bg-[var(--color-accent)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-opacity hover:opacity-80"
            >
              {showPriority ? 'Hide priority queue' : 'View priority queue'}
            </button>
          </div>
        </section>

        <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          <p>
            Demo 02 · Custom cursor + spring physics + context-aware morph.{' '}
            <Link
              href="/"
              data-cursor="open"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              ← Back to the lab
            </Link>
          </p>
        </footer>
      </main>

      {inspectedDeal ? (
        <InspectModal deal={inspectedDeal} onClose={() => setInspectedDeal(null)} />
      ) : null}

      {showPriority ? (
        <PriorityPanel deals={priorityQueue} onClose={() => setShowPriority(false)} />
      ) : null}
    </>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

const STAGE_ACCENT: Record<DealStage, string> = {
  New: 'text-white/40',
  Contacted: 'text-blue-400',
  Proposal: 'text-[var(--color-accent)]',
  Won: 'text-emerald-400',
};

interface KanbanColumnProps {
  stage: DealStage;
  deals: ReadonlyArray<Deal>;
  isHover: boolean;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  renderCard: (deal: Deal) => React.ReactNode;
}

function KanbanColumn({
  stage,
  deals,
  isHover,
  onDragOver,
  onDragLeave,
  onDrop,
  renderCard,
}: KanbanColumnProps) {
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col gap-2 rounded-xl p-1 transition-colors ${
        isHover ? 'bg-[var(--color-accent)]/10 ring-1 ring-inset ring-[var(--color-accent)]/40' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between pb-1">
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.22em] ${STAGE_ACCENT[stage]}`}
        >
          {stage}
        </span>
        <span className="font-mono text-[10px] text-[var(--color-ink-dim)]">
          {formatValue(total)}
        </span>
      </div>

      {/* Deal cards */}
      <div className="flex min-h-[60px] flex-col gap-2">
        {deals.map((deal) => renderCard(deal))}
      </div>

      {/* Empty slot hint */}
      {deals.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/20">
          Drop here
        </div>
      )}
    </div>
  );
}

// ─── DealCard ─────────────────────────────────────────────────────────────────

interface DealCardProps {
  deal: Deal;
  isDragging: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

function DealCard({ deal, isDragging, onDragStart, onDragEnd, onClick }: DealCardProps) {
  return (
    <article
      draggable
      data-cursor="drag"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${deal.company} — ${formatValue(deal.value)} · click to inspect, drag to move stage`}
      className={`group rounded-xl border border-white/5 bg-white/[0.025] p-4 transition-colors select-none cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] hover:border-white/15 hover:bg-white/[0.04] ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Company + value */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-[var(--color-ink)]">
          {deal.company}
        </p>
        <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-dim)]">
          {formatValue(deal.value)}
        </span>
      </div>

      {/* Note */}
      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--color-ink-dim)]">
        {deal.note}
      </p>

      {/* Owner avatar */}
      <div className="mt-3 flex items-center gap-2">
        <span
          data-cursor={`avatar:${deal.ownerName}`}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[9px] font-medium"
          style={{ background: `${deal.ownerColor}22`, color: deal.ownerColor, border: `1px solid ${deal.ownerColor}44` }}
        >
          {deal.ownerInitials}
        </span>
        <span className="font-mono text-[10px] text-[var(--color-ink-dim)]">
          {deal.ownerName.split(' ')[0]}
        </span>
      </div>
    </article>
  );
}

// ─── InspectModal ─────────────────────────────────────────────────────────────

function InspectModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${deal.company} deal details`}
      onClick={onClose}
      style={{ cursor: 'auto' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-bg)] p-6 shadow-2xl shadow-black/60"
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Deal · {deal.stage}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--color-ink-dim)] hover:bg-white/5 hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <h2 className="mt-3 font-display text-3xl font-medium leading-tight">{deal.company}</h2>
        <p className="mt-2 font-display text-2xl font-medium text-[var(--color-accent)]">
          {formatValue(deal.value)}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-dim)]">{deal.note}</p>
        <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full font-mono text-[10px] font-medium"
            style={{
              background: `${deal.ownerColor}22`,
              color: deal.ownerColor,
              border: `1px solid ${deal.ownerColor}44`,
            }}
          >
            {deal.ownerInitials}
          </span>
          <div>
            <p className="text-sm font-medium">{deal.ownerName}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
              Deal owner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PriorityPanel ────────────────────────────────────────────────────────────

function PriorityPanel({
  deals,
  onClose,
}: {
  deals: ReadonlyArray<Deal>;
  onClose: () => void;
}) {
  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Priority queue"
      style={{ cursor: 'auto' }}
      className="fixed right-4 top-4 bottom-4 z-40 flex w-full max-w-sm flex-col rounded-2xl border border-white/10 bg-[var(--color-bg)] p-5 shadow-2xl shadow-black/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Priority queue
          </p>
          <p className="mt-1 font-display text-xl font-medium">
            Top {deals.length} deals to follow up
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--color-ink-dim)] hover:bg-white/5 hover:text-[var(--color-ink)]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <ol className="mt-5 flex flex-col gap-3 overflow-y-auto pr-1">
        {deals.length === 0 ? (
          <li className="rounded-xl border border-dashed border-white/10 p-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
            Inbox zero. Move a deal into Contacted or Proposal to see it here.
          </li>
        ) : (
          deals.map((d, i) => (
            <li
              key={d.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium">
                  <span className="mr-2 font-mono text-[10px] text-[var(--color-ink-dim)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {d.company}
                </p>
                <span className="font-mono text-[11px] text-[var(--color-accent)]">
                  {formatValue(d.value)}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                {d.stage} · {d.ownerName.split(' ')[0]}
              </p>
            </li>
          ))
        )}
      </ol>
    </aside>
  );
}

// ─── SparklineChart ───────────────────────────────────────────────────────────

function SparklineChart() {
  const W = 600;
  const H = 120;
  const PAD = { top: 12, right: 8, bottom: 24, left: 8 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const data = SPARKLINE_DATA;
  const maxVal = Math.max(...data);
  const minVal = 0;
  const xStep = chartW / (data.length - 1);

  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (v: number) => PAD.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' L ');
  const linePath = `M ${points}`;
  const areaPath = `${linePath} L ${toX(data.length - 1)},${H - PAD.bottom} L ${PAD.left},${H - PAD.bottom} Z`;

  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 120 }}
        aria-label="Weekly closed deal value sparkline"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + chartH * (1 - t)}
            y2={PAD.top + chartH * (1 - t)}
            stroke="white"
            strokeOpacity="0.05"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#sparkGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((v, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(v)}
            r="3"
            fill="var(--color-bg)"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          />
        ))}

        {weeks.map((w, i) => (
          <text
            key={w}
            x={toX(i)}
            y={H}
            textAnchor="middle"
            fontSize="9"
            fill="#a09c93"
            fontFamily="JetBrains Mono, monospace"
          >
            {w}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── OwnerList ────────────────────────────────────────────────────────────────

const OWNERS = [
  { initials: 'RU', name: 'Ryan Ulmer', color: '#67e8f9', deals: 4, value: 42400 },
  { initials: 'KM', name: 'Kira Morel', color: '#a78bfa', deals: 3, value: 26700 },
  { initials: 'JT', name: 'Jamie Tran', color: '#fb923c', deals: 3, value: 37700 },
] as const;

function OwnerList() {
  const maxVal = Math.max(...OWNERS.map((o) => o.value));

  return (
    <ul className="flex flex-col gap-4">
      {OWNERS.map((owner) => (
        <li key={owner.initials} className="flex items-center gap-3">
          <span
            data-cursor={`avatar:${owner.name}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-medium"
            style={{
              background: `${owner.color}22`,
              color: owner.color,
              border: `1px solid ${owner.color}44`,
            }}
          >
            {owner.initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">
                {owner.name.split(' ')[0]}
              </span>
              <span className="font-mono text-[10px] text-[var(--color-ink-dim)]">
                {formatValue(owner.value)}
              </span>
            </div>
            <div className="mt-1.5 h-px w-full bg-white/10">
              <div
                className="h-px transition-[width] duration-700"
                style={{
                  width: `${(owner.value / maxVal) * 100}%`,
                  background: owner.color,
                }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
