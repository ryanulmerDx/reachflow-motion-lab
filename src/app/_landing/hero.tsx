'use client';

import { useGSAP } from '@gsap/react';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { SITE } from '@/lib/site';
import { HeroStage } from './hero-stage';

/**
 * Full-bleed shader hero.
 *
 *   - Sticky-feel viewport hero (h-screen)
 *   - Self-contained orthographic R3F Canvas behind the wordmark
 *   - GSAP letter stagger on mount
 *   - Mono ticker top, scroll cue bottom
 *
 * The Canvas is mounted via a `mounted` flag (set in useEffect) so the
 * server tree and the first client tree match exactly — no hydration
 * mismatch from `next/dynamic({ ssr: false })` bailouts.
 */
export function LandingHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('[data-hero-tick]', { y: -20, opacity: 0, duration: 0.6 })
        .from(
          '[data-hero-letter]',
          {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            stagger: 0.04,
          },
          '-=0.3'
        )
        .from(
          '[data-hero-sub]',
          { y: 24, opacity: 0, duration: 0.8 },
          '-=0.5'
        )
        .from(
          '[data-hero-cta] > *',
          { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 },
          '-=0.4'
        )
        .from(
          '[data-hero-cue]',
          { y: 16, opacity: 0, duration: 0.6 },
          '-=0.3'
        );
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative isolate flex h-[100svh] min-h-[680px] w-full flex-col overflow-hidden"
    >
      {/* Shader stage — full-bleed, behind everything. */}
      <div className="absolute inset-0 -z-10 h-full w-full">
        {mounted ? <HeroStage /> : null}
      </div>

      {/* Soft dark gradient so the wordmark stays readable over the shader. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_50%,rgba(8,8,10,0.35),rgba(8,8,10,0.85))]"
      />

      {/* Top ticker */}
      <div
        data-hero-tick
        className="flex items-center justify-between px-6 py-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)] md:px-12"
      >
        <span>{SITE.studio.name}</span>
        <span className="hidden md:inline">
          Lat 38.42° / Lon −82.96°  ·  Stack: R3F · GLSL · GSAP
        </span>
        <span>{SITE.studio.contact}</span>
      </div>

      {/* Wordmark */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 md:px-12">
        <h1 className="font-display text-balance text-[clamp(64px,18vw,260px)] font-medium leading-[0.86] tracking-[-0.04em]">
          <span className="block overflow-hidden">
            <Letters text="SYSTEMS" />
          </span>
          <span className="block overflow-hidden text-[var(--color-accent)]">
            <Letters text="LAB" />
          </span>
        </h1>

        <p
          data-hero-sub
          className="mt-6 max-w-2xl text-balance text-base text-[var(--color-ink-dim)] md:mt-10 md:text-xl"
        >
          {SITE.tagline}
        </p>

        <div
          data-hero-cta
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em] md:mt-12"
        >
          <a
            href="#chapters"
            className="rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 px-5 py-3 text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/20"
          >
            See the ten systems ↓
          </a>
          <a
            href={SITE.studio.url}
            className="text-[var(--color-ink)] underline-offset-4 hover:underline"
          >
            Hire ReachFlow →
          </a>
          <a
            href={SITE.repo}
            className="text-[var(--color-ink-dim)] underline-offset-4 hover:underline hover:text-[var(--color-ink)]"
          >
            Source on GitHub
          </a>
        </div>
      </div>

      {/* Bottom cue */}
      <div
        data-hero-cue
        className="flex items-center justify-between px-6 py-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)] md:px-12"
      >
        <span>(Scroll)</span>
        <span className="hidden md:inline">
          MIT licensed · {SITE.year}
        </span>
        <span>v0.4 — Wave 4 shipped</span>
      </div>
    </section>
  );
}

function Letters({ text }: { text: string }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          data-hero-letter
          className="inline-block will-change-transform"
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  );
}
