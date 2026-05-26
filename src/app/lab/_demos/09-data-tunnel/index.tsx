'use client';

/**
 * Demo 09 — Data Tunnel
 *
 * A long-form case study page for Northbound Coffee Roasters. The hero is a
 * full-bleed, full-viewport ray-marched SDF tunnel rendered in GLSL. As the
 * user scrolls, uScroll advances the ray-origin along the tunnel&apos;s Z axis,
 * creating a "flying through the system" flythrough effect. uTime keeps
 * ticking even at scroll-rest so the rings always undulate subtly.
 *
 * Scroll tracking mirrors the rAF + ref pattern from demo 06 — no React
 * state mutations in the hot path, just ref mutation and uniform mutation
 * inside useFrame.
 */

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { findDemo } from '@/lib/demo-registry';
import { TunnelShader } from './tunnel';
import {
  SectionProblem,
  SectionWhatWeBuilt,
  PullQuote,
  SectionResults,
  SectionCTA,
} from './case-study';

const demo = findDemo('data-tunnel')!;

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DataTunnel() {
  // Smoothed scroll progress [0, 1]; shared with the shader via ref so no
  // React re-renders are triggered from the scroll loop.
  const scrollRef = useRef<number>(0);
  const rawScrollRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      rawScrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const tick = () => {
      // Exponential smoothing — chases raw scroll, creates a soft easing feel
      scrollRef.current += (rawScrollRef.current - scrollRef.current) * 0.06;
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <main className="relative min-h-dvh">
      {/* ─── Hero — full-bleed tunnel ──────────────────────────────────────── */}
      <section className="relative min-h-dvh">
        {/* Tunnel shader fills the entire hero behind everything */}
        <TunnelShader scrollRef={scrollRef} />

        {/* Floating header — top-left ordinal + system label */}
        <header className="absolute left-6 right-6 top-6 z-20 mx-auto max-w-6xl md:left-12 md:right-12 md:top-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            {demo.ordinal} &middot; {demo.system}
          </p>
        </header>

        {/* Hero copy — centered vertically over the tunnel */}
        <div className="relative z-10 flex min-h-dvh flex-col justify-center px-6 md:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Case study
            </p>
            <h1 className="mt-4 text-balance text-5xl font-medium leading-[1.0] md:text-8xl">
              Northbound Coffee Roasters
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-[var(--color-ink-dim)] md:text-2xl leading-relaxed">
              How a 4-location specialty roaster cut order errors by 94% and
              reclaimed 112 hours a month.
            </p>
            <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]/50">
              Scroll to read the story &darr;
            </p>
          </div>
        </div>

        {/* Bottom gradient fade into the case study content */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 z-10"
          style={{
            background:
              'linear-gradient(to bottom, transparent, var(--color-bg))',
          }}
        />
      </section>

      {/* ─── Case study content ───────────────────────────────────────────── */}
      <div className="relative z-10 pb-4">
        <SectionProblem />
        <SectionWhatWeBuilt />
        <PullQuote />
        <SectionResults />
        <SectionCTA />
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mx-auto mt-24 max-w-3xl border-t border-white/5 px-6 pb-12 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] md:px-12">
        <p>
          Demo 09 &middot; Ray-marched SDF tunnel + scroll-driven camera flight.{' '}
          <Link
            href="/"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            &larr; Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}
