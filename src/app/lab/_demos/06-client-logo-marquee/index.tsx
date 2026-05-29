'use client';

import Link from 'next/link';
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { findDemo } from '@/lib/demo-registry';

const demo = findDemo('client-logo-marquee')!;

/**
 * Client Logo Marquee — perspective-skewed strip of past client wordmarks.
 *
 * Each strip auto-drifts, but you can grab it and fling it: a pointer drag
 * scrubs the strip directly, and on release the throw velocity carries as
 * momentum before easing back to the gentle base drift. The skew is a function
 * of that live velocity, so the strip leans into a fast flick and settles when
 * it slows.
 *
 * No WebGL, no GSAP — a single rAF loop driving a CSS 3D transform.
 */
export default function ClientLogoMarquee() {
  return (
    <main className="relative min-h-dvh px-6 pb-24 pt-28 md:px-12">
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

      <Spacer />

      <ScrollMarquee row="ltr" />
      <ScrollMarquee row="rtl" subtle />

      <Spacer />
      <SectionCopy />
      <Spacer tall />

      <footer className="mx-auto max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 06 · Pure CSS 3D + scroll-velocity skew · No WebGL.{' '}
          <Link
            href="/"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}

const CLIENTS = [
  'Esthetics by Seneca',
  'Hammerhead Pools',
  'Beecroft Pools',
  'Roper & Co',
  'Northbound Coffee',
  'Cedar & Sun',
  'Atlas Hardware',
  'Linden Studio',
];

function ScrollMarquee({ row, subtle = false }: { row: 'ltr' | 'rtl'; subtle?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0); // px translation, unbounded; wrapped at render
  const velRef = useRef(0); // px/frame
  const halfRef = useRef(1); // half the track width (one full set of items)
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);

  // Gentle resting drift — ltr strip glides left, rtl glides right.
  const baseVel = row === 'ltr' ? -0.7 : 0.5;

  useEffect(() => {
    velRef.current = baseVel;

    const measure = () => {
      const t = trackRef.current;
      if (t) halfRef.current = Math.max(1, t.scrollWidth / 2);
    };
    measure();
    window.addEventListener('resize', measure);

    let raf = 0;
    const tick = () => {
      // When not being dragged, ease velocity back to the base drift so a
      // flick carries as momentum and then settles.
      if (!draggingRef.current) {
        velRef.current += (baseVel - velRef.current) * 0.035;
      }
      // Clamp so a violent flick can't fling it absurdly fast.
      velRef.current = Math.max(-60, Math.min(60, velRef.current));
      offsetRef.current += velRef.current;

      const half = halfRef.current;
      let x = offsetRef.current % half;
      if (x > 0) x -= half; // keep within (-half, 0] for a seamless loop

      const el = trackRef.current;
      if (el) {
        const skew = Math.max(-20, Math.min(20, velRef.current * 2.2));
        el.style.transform = `translate3d(${x}px, 0, 0) skewY(${skew * 0.25}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
    };
  }, [baseVel]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    offsetRef.current += dx;
    velRef.current = dx; // last drag delta becomes the flick momentum on release
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  // Duplicate the list so the marquee loops seamlessly
  const items = [...CLIENTS, ...CLIENTS];

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      className="relative mx-auto my-8 max-w-[120rem] cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
      style={{ perspective: '1200px' }}
    >
      <div ref={trackRef} className="flex w-max gap-12 will-change-transform">
        {items.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className={`whitespace-nowrap font-display text-[clamp(3rem,8vw,8rem)] font-medium leading-none ${
              subtle ? 'text-white/15' : 'text-white/85'
            }`}
          >
            {label}
            <span className="mx-6 text-[var(--color-accent)]/40">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Spacer({ tall = false }: { tall?: boolean }) {
  return <div className={tall ? 'h-[40vh]' : 'h-[18vh]'} />;
}

function SectionCopy() {
  return (
    <section className="mx-auto max-w-3xl px-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        How it works
      </p>
      <p className="mt-4 text-[var(--color-ink-dim)] md:text-lg">
        Grab a strip and fling it. Your drag scrubs the marquee directly, and on
        release the throw carries as momentum before easing back to a gentle
        drift — the strip leans into a fast flick and straightens as it slows.
        It&apos;s one requestAnimationFrame loop: velocity decays toward a base
        drift, and the skew is just a function of that live velocity.
      </p>
      <p className="mt-4 text-[var(--color-ink-dim)]/80">
        Zero WebGL, zero new dependencies. Same pattern would work as the
        client-strip on a real agency homepage — proof that you don&apos;t need a
        shader to make a section feel alive.
      </p>
    </section>
  );
}
