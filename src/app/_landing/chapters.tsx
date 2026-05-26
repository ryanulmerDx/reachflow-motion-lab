'use client';

import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { DEMOS } from '@/lib/demo-registry';

/**
 * Demo chapters — each demo gets a full-width row, not a card.
 *
 * Mega numeric ordinal on the left (outlined → solid accent on hover),
 * title and system on the right. Scroll-triggered reveal per row.
 */
export function LandingChapters() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>('.chapter-row');
      rows.forEach((row) => {
        gsap.from(row.querySelectorAll('[data-chapter-fade]'), {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: row,
            start: 'top 80%',
          },
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      id="chapters"
      aria-label="The ten systems"
      className="relative border-t border-white/5 bg-[var(--color-bg)]"
    >
      <header className="mx-auto flex max-w-7xl items-baseline justify-between px-6 py-12 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] md:px-12">
        <span>Index / 10 systems</span>
        <span className="hidden md:inline">All open source · MIT</span>
        <span>Wave 4 — shipped</span>
      </header>

      <ol className="border-t border-white/5">
        {DEMOS.map((demo) => (
          <li key={demo.slug} className="chapter-row group relative border-b border-white/5">
            <Link
              href={`/lab/${demo.slug}`}
              className="grid grid-cols-12 items-end gap-x-6 px-6 py-10 md:px-12 md:py-16"
            >
              <div className="col-span-12 md:col-span-3">
                <p
                  data-chapter-fade
                  className="chapter-ordinal font-display text-[clamp(80px,12vw,200px)] font-medium leading-[0.86] tracking-[-0.04em]"
                >
                  {demo.ordinal}
                </p>
              </div>

              <div className="col-span-12 md:col-span-7">
                <p
                  data-chapter-fade
                  className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)] group-hover:text-[var(--color-accent)]"
                >
                  System — {demo.system}
                </p>
                <h3
                  data-chapter-fade
                  className="mt-4 text-balance text-3xl font-medium leading-[1.05] md:text-5xl"
                >
                  {demo.title}
                </h3>
                <p
                  data-chapter-fade
                  className="mt-4 max-w-2xl text-base text-[var(--color-ink-dim)] md:text-lg"
                >
                  {demo.tagline}
                </p>
                <p
                  data-chapter-fade
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]"
                >
                  Technique — <span className="text-[var(--color-ink)]">{demo.technique}</span>
                </p>
              </div>

              <div className="col-span-12 mt-6 md:col-span-2 md:mt-0 md:text-right">
                <span
                  data-chapter-fade
                  className="inline-block font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] transition-colors group-hover:text-[var(--color-accent)]"
                >
                  Open system →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
