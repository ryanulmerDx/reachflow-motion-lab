'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { findDemo } from '@/lib/demo-registry';

const demo = findDemo('client-logo-marquee')!;

/**
 * Client Logo Marquee — perspective-skewed strip of past client wordmarks.
 *
 * The skew is tied to scroll velocity (px/ms), measured in a passive scroll
 * listener and smoothed with an exponential decay so the strip "lurches"
 * into rotation when you flick the page and settles back when you stop.
 *
 * No WebGL, no GSAP — pure CSS 3D transforms + a single useEffect for the
 * velocity ref. Lenis smooths the underlying scroll so the velocity signal
 * is buttery instead of stepped.
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [_velocity, setVelocity] = useState(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const rawVelRef = useRef(0);
  const smoothVelRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    lastTRef.current = performance.now();

    let raf = 0;

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastYRef.current;
      const dt = Math.max(now - lastTRef.current, 1);
      rawVelRef.current = dy / dt;
      lastYRef.current = window.scrollY;
      lastTRef.current = now;
    };

    const tick = () => {
      // Exponential smoothing — chases raw velocity, decays to 0
      smoothVelRef.current += (rawVelRef.current - smoothVelRef.current) * 0.18;
      rawVelRef.current *= 0.92;
      const v = smoothVelRef.current;

      const el = trackRef.current;
      if (el) {
        const skew = Math.max(-22, Math.min(22, v * 6));
        const dir = row === 'ltr' ? 1 : -1;
        el.style.transform = `skewY(${skew * dir * 0.4}deg) translate3d(${-Math.abs(skew) * dir * 0.6}px, 0, 0)`;
      }
      setVelocity(v);

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [row]);

  // Duplicate the list so the marquee loops seamlessly via CSS animation
  const items = [...CLIENTS, ...CLIENTS];

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto my-8 max-w-[120rem] overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      <div
        ref={trackRef}
        className="flex w-max gap-12 will-change-transform"
        style={{
          animation: `marquee-${row} ${row === 'ltr' ? 40 : 55}s linear infinite`,
        }}
      >
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

      <style>{`
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
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
        Flick the page. The marquees lean into the motion, then settle. The skew is
        a function of scroll velocity in pixels-per-millisecond, smoothed with a
        single exponential decay so the response stays buttery instead of jerky.
        Lenis is doing the underlying scroll, which is what makes the signal feel
        like silk instead of stepped wheel ticks.
      </p>
      <p className="mt-4 text-[var(--color-ink-dim)]/80">
        Zero WebGL, zero new dependencies. Same pattern would work as the
        client-strip on a real agency homepage — proof that you don&apos;t need a
        shader to make a section feel premium.
      </p>
    </section>
  );
}
