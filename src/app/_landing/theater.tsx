'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { DEMOS } from '@/lib/demo-registry';

// Mount the WebGL stage client-side only — Canvas can't run during SSR.
const TheaterStage = dynamic(() => import('./theater-stage').then((m) => m.TheaterStage), {
  ssr: false,
});

/**
 * Cinematic "Systems Theater" — replaces the flat chapter list.
 *
 * One sticky 100vh stage pinned for ~1000vh of scroll. Inside:
 *  - dedicated R3F Canvas (orthographic, full-bleed) running a parametric
 *    shader that morphs per active demo (color + pattern signature)
 *  - giant ordinal + title + tagline that crossfade on chapter change
 *  - progress rail with 10 ticks (clickable to jump)
 *
 * Shader uniforms are driven via a ref written by ScrollTrigger.onUpdate,
 * so the React tree only re-renders when the active demo changes — not
 * every scroll frame.
 */
export function LandingTheater() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          progressRef.current = p;
          const fIdx = p * DEMOS.length;
          const idx = Math.min(Math.floor(fIdx), DEMOS.length - 1);
          setActiveIdx((prev) => (prev === idx ? prev : idx));
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef }
  );

  const activeDemo = DEMOS[activeIdx]!;
  const totalLabel = String(DEMOS.length).padStart(2, '0');

  const jumpTo = (idx: number) => {
    const sec = sectionRef.current;
    if (!sec) return;
    const sectionTop = sec.offsetTop;
    const sectionH = sec.offsetHeight;
    const target = sectionTop + (idx / DEMOS.length) * sectionH + window.innerHeight * 0.5;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="chapters"
      aria-label="Ten systems"
      className="relative"
      style={{ height: `${DEMOS.length * 100}vh` }}
    >
      <div className="sticky top-0 isolate flex h-[100svh] min-h-[680px] w-full flex-col overflow-hidden">
        {/* Dedicated shader canvas — full-bleed, behind everything. */}
        <div className="absolute inset-0 -z-10 h-full w-full">
          <TheaterStage progressRef={progressRef} />
        </div>

        {/* Soft left-side darkening so the giant ordinal stays readable. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(8,8,10,0.78)_0%,rgba(8,8,10,0.5)_30%,rgba(8,8,10,0.15)_55%,transparent_75%)]"
        />
        {/* Top + bottom vignettes to anchor the chrome. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-[linear-gradient(to_bottom,rgba(8,8,10,0.85),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(to_top,rgba(8,8,10,0.9),transparent)]"
        />

        {/* Top bar */}
        <header className="flex items-baseline justify-between px-6 py-8 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] md:px-12">
          <span>Index / 10 systems</span>
          <span className="hidden md:inline">All open source · MIT</span>
          <span>Wave 4 — shipped</span>
        </header>

        {/* Stage body */}
        <div className="relative flex flex-1 items-center px-6 md:px-12">
          <div className="grid w-full grid-cols-12 items-end gap-x-6 gap-y-8">
            {/* Mega ordinal */}
            <div
              key={`ord-${activeDemo.slug}`}
              className="theater-fade col-span-12 md:col-span-5"
            >
              <p className="font-display text-[clamp(140px,24vw,420px)] font-medium leading-[0.82] tracking-[-0.06em]">
                {activeDemo.ordinal}
              </p>
            </div>

            {/* Copy block */}
            <div
              key={`copy-${activeDemo.slug}`}
              className="theater-fade col-span-12 md:col-span-7"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)] md:text-[11px]">
                System — {activeDemo.system}
              </p>
              <h3 className="mt-3 text-balance font-display text-4xl font-medium leading-[1.02] md:mt-5 md:text-6xl lg:text-7xl">
                {activeDemo.title}
              </h3>
              <p className="mt-4 max-w-2xl text-balance text-base text-[var(--color-ink-dim)] md:mt-6 md:text-xl">
                {activeDemo.tagline}
              </p>
              <p className="mt-6 max-w-2xl font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] md:text-[11px]">
                Technique —{' '}
                <span className="text-[var(--color-ink)]">{activeDemo.technique}</span>
              </p>
              <Link
                href={`/lab/${activeDemo.slug}`}
                className="mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-bg)]/60 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-accent)] backdrop-blur transition-colors hover:bg-[var(--color-accent)]/15"
              >
                Open system <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress rail */}
        <div className="px-6 pb-8 md:px-12">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] md:text-[11px]">
            <span className="w-10 text-[var(--color-accent)]">{activeDemo.ordinal}</span>
            <div className="relative h-px flex-1 overflow-hidden bg-white/10">
              <div
                className="absolute inset-y-0 left-0 origin-left bg-[var(--color-accent)] transition-[width] duration-500 ease-out"
                style={{ width: `${((activeIdx + 1) / DEMOS.length) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right">{totalLabel}</span>
          </div>

          <ol
            aria-label="Demo chapter ticks"
            className="mt-4 grid grid-cols-10 gap-1"
          >
            {DEMOS.map((d, i) => (
              <li key={d.slug}>
                <button
                  type="button"
                  aria-label={`Jump to ${d.title}`}
                  aria-current={i === activeIdx ? 'true' : undefined}
                  onClick={() => jumpTo(i)}
                  className={`block h-1 w-full transition-colors ${
                    i === activeIdx
                      ? 'bg-[var(--color-accent)]'
                      : 'bg-white/15 hover:bg-white/30'
                  }`}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
