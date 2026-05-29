'use client';

/**
 * Demo 06 — Listing Explorer
 *
 * A real-estate search: a stylized map of price pins kept in sync with a column
 * of listing cards. Hover a card and its pin lifts + pulses; hover a pin and the
 * card highlights and scrolls into view. Filter chips (type / beds / price)
 * animate the map and list together. Mock data (White Mountains, AZ), wired UI.
 */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { findDemo } from '@/lib/demo-registry';
import {
  BEDS_OPTIONS,
  LISTINGS,
  PRICE_OPTIONS,
  STATUS_COLOR,
  TYPE_OPTIONS,
  formatPrice,
  type Listing,
  type ListingType,
} from './data';

const demo = findDemo('listing-explorer')!;

// ── count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(value: number, durationMs = 500): number {
  const [display, setDisplay] = useState(value);
  const raf = useRef(0);
  useEffect(() => {
    const from = display;
    const delta = value - from;
    if (delta === 0) return;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      setDisplay(Math.round(from + delta * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);
  return display;
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function ListingExplorer() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [type, setType] = useState<ListingType | 'All'>('All');
  const [bedsMin, setBedsMin] = useState(0);
  const [priceMax, setPriceMax] = useState(Infinity);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const visible = useMemo(
    () =>
      LISTINGS.filter(
        (l) =>
          (type === 'All' || l.type === type) &&
          l.beds >= bedsMin &&
          l.price <= priceMax
      ),
    [type, bedsMin, priceMax]
  );

  const avgPrice = useMemo(
    () => (visible.length ? Math.round(visible.reduce((s, l) => s + l.price, 0) / visible.length) : 0),
    [visible]
  );
  const avgDisplay = useCountUp(avgPrice);
  const countDisplay = useCountUp(visible.length);

  // When the active listing changes (e.g. from hovering a pin), bring its card
  // into view.
  useEffect(() => {
    if (!activeId) return;
    cardRefs.current[activeId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  // If a filter hides the active listing, clear it.
  useEffect(() => {
    if (activeId && !visible.some((l) => l.id === activeId)) setActiveId(null);
  }, [visible, activeId]);

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
        </header>

        {/* Filter bar */}
        <section className="mx-auto mt-8 max-w-6xl">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <ChipGroup label="Type">
              {TYPE_OPTIONS.map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>
                  {t}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup label="Beds">
              {BEDS_OPTIONS.map((b) => (
                <Chip key={b.label} active={bedsMin === b.min} onClick={() => setBedsMin(b.min)}>
                  {b.label}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup label="Price">
              {PRICE_OPTIONS.map((p) => (
                <Chip key={p.label} active={priceMax === p.max} onClick={() => setPriceMax(p.max)}>
                  {p.label}
                </Chip>
              ))}
            </ChipGroup>
          </div>

          <div className="mt-4 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            <span>
              <span className="text-[var(--color-ink)] tabular-nums">{countDisplay}</span> listings
            </span>
            <span>
              avg <span className="text-[var(--color-ink)] tabular-nums">{formatPrice(avgDisplay)}</span>
            </span>
          </div>
        </section>

        {/* Map + listings */}
        <section className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <MapPanel
            listings={visible}
            activeId={activeId}
            onHover={setActiveId}
          />

          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {visible.map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  ref={(el) => {
                    cardRefs.current[l.id] = el;
                  }}
                >
                  <ListingCard
                    listing={l}
                    active={activeId === l.id}
                    onHover={() => setActiveId(l.id)}
                    onLeave={() => setActiveId((cur) => (cur === l.id ? null : cur))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {visible.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                No listings match these filters.
              </p>
            )}
          </div>
        </section>

        <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          <p>
            Demo 06 · Map ↔ listing sync + animated filters · White Mountains, AZ.{' '}
            <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              ← Back to the lab
            </Link>
          </p>
        </footer>
      </main>
    </>
  );
}

// ── Map ───────────────────────────────────────────────────────────────────────

function MapPanel({
  listings,
  activeId,
  onHover,
}: {
  listings: ReadonlyArray<Listing>;
  activeId: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <div className="relative h-[44vh] min-h-[300px] overflow-hidden rounded-2xl border border-white/5 bg-[#0b0f12] lg:sticky lg:top-24 lg:h-[64vh]">
      {/* Stylized abstract map — grid + a few "roads" + a region wash */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="mapWash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0e1518" />
            <stop offset="100%" stopColor="#0a0d10" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapWash)" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#ffffff" strokeOpacity="0.035" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 12.5}%`} x2="100%" y2={`${i * 12.5}%`} stroke="#ffffff" strokeOpacity="0.035" />
        ))}
        {/* a couple of accent "highways" */}
        <path d="M -5 70 Q 40 55 110 40" fill="none" stroke="#67e8f9" strokeOpacity="0.12" strokeWidth="2" />
        <path d="M 15 -5 Q 35 50 25 110" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="6" />
      </svg>

      <span className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        White Mountains · AZ
      </span>

      {/* Pins */}
      {listings.map((l) => {
        const active = activeId === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onMouseEnter={() => onHover(l.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(l.id)}
            onBlur={() => onHover(null)}
            aria-label={`${l.address}, ${formatPrice(l.price)}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
            style={{ left: `${l.mapX}%`, top: `${l.mapY}%`, zIndex: active ? 30 : 10 }}
          >
            {active && (
              <span
                className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full"
                style={{ backgroundColor: `${STATUS_COLOR[l.status]}40` }}
              />
            )}
            <span
              className={`relative block whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] tabular-nums transition-all duration-200 ${
                active
                  ? 'scale-110 border-transparent bg-[var(--color-accent)] text-black'
                  : 'border-white/15 bg-[var(--color-bg)]/85 text-[var(--color-ink)] backdrop-blur-sm'
              }`}
            >
              {formatPrice(l.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Listing card ────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  active,
  onHover,
  onLeave,
}: {
  listing: Listing;
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const isLand = listing.type === 'Land';
  const statusColor = STATUS_COLOR[listing.status];

  return (
    <article
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group flex gap-4 rounded-2xl border p-3 transition-colors ${
        active ? 'border-[var(--color-accent)]/50 bg-white/[0.03]' : 'border-white/5 hover:border-white/15'
      }`}
    >
      {/* Image placeholder — a soft gradient tile */}
      <div
        className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${statusColor}33, transparent 70%), #11171e`,
        }}
      >
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">
          {listing.type}
        </span>
        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em]"
          style={{ color: statusColor, background: `${statusColor}1f`, border: `1px solid ${statusColor}44` }}
        >
          {listing.status}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-medium leading-none">{formatPrice(listing.price)}</p>
        <p className="mt-1 truncate text-sm text-[var(--color-ink)]">{listing.address}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
          {listing.city}, AZ
        </p>
        <p className="mt-2 font-mono text-[11px] text-[var(--color-ink-dim)]">
          {isLand
            ? `${listing.acres} acres · land`
            : `${listing.beds} bd · ${listing.baths} ba · ${listing.sqft.toLocaleString()} sqft`}
        </p>
      </div>
    </article>
  );
}

// ── Filter chips ──────────────────────────────────────────────────────────────

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]/70">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
        active
          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
          : 'border-white/10 text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]'
      }`}
    >
      {children}
    </button>
  );
}
