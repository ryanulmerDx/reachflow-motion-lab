'use client';

import Link from 'next/link';
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

function dealsByStage(stage: DealStage): ReadonlyArray<Deal> {
  return DEALS.filter((d) => d.stage === stage);
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function CursorAwareCRM() {
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
        </header>

        {/* ── KPI row ─────────────────────────────────────────────────────── */}
        <section className="mx-auto mt-12 max-w-6xl">
          <div className="grid grid-cols-1 gap-px rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-3">
            {KPI_METRICS.map((m) => (
              <div
                key={m.label}
                data-cursor="inspect"
                className="flex flex-col gap-1 bg-[var(--color-bg)] p-6 first:rounded-tl-2xl first:rounded-tr-2xl sm:first:rounded-l-2xl sm:first:rounded-tr-none sm:last:rounded-r-2xl last:rounded-bl-2xl last:rounded-br-2xl"
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
              </div>
            ))}
          </div>
        </section>

        {/* ── Kanban board ────────────────────────────────────────────────── */}
        <section className="mx-auto mt-8 max-w-6xl">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STAGES.map((stage) => (
              <KanbanColumn key={stage} stage={stage} deals={dealsByStage(stage)} />
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
                3 deals need follow-up this week.
              </p>
            </div>
            <button
              type="button"
              data-cursor="open"
              className="rounded-full bg-[var(--color-accent)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-opacity hover:opacity-80"
            >
              View priority queue
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

function KanbanColumn({
  stage,
  deals,
}: {
  stage: DealStage;
  deals: ReadonlyArray<Deal>;
}) {
  const total = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col gap-2">
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
      <div className="flex flex-col gap-2">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {/* Empty slot hint */}
      {deals.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 py-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/20">
          Empty
        </div>
      )}
    </div>
  );
}

// ─── DealCard ─────────────────────────────────────────────────────────────────

function DealCard({ deal }: { deal: Deal }) {
  return (
    <article
      data-cursor="drag"
      className="group rounded-xl border border-white/5 bg-white/[0.025] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
    >
      {/* Company + value */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-[var(--color-ink)]">
          {deal.company}
        </p>
        <span
          data-cursor="inspect"
          className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-dim)]"
        >
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

  // SVG path for the area under the sparkline
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

        {/* Grid lines */}
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

        {/* Area fill */}
        <path d={areaPath} fill="url(#sparkGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
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

        {/* X-axis labels */}
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
            {/* Mini bar */}
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
