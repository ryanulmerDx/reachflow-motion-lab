'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { SITE } from '@/lib/site';

/**
 * Sticky-feel manifesto — a single statement, parallax fade-in, mono caption.
 */
export function LandingManifesto() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('[data-manifesto-word]', {
        opacity: 0.15,
        y: 12,
        duration: 0.6,
        ease: 'sine.out',
        stagger: 0.04,
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 70%',
          end: 'bottom 40%',
          scrub: true,
        },
      });
      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: rootRef }
  );

  const words = SITE.studio.pitch.split(' ');

  return (
    <section
      ref={rootRef}
      aria-label="Why this exists"
      className="relative border-t border-white/5 bg-[var(--color-bg)] px-6 py-32 md:px-12 md:py-48"
    >
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)]">
          Why this exists
        </p>
        <p className="mt-8 text-balance text-[clamp(28px,4.5vw,64px)] font-medium leading-[1.1] tracking-[-0.02em]">
          {words.map((w, i) => (
            <span
              key={`${w}-${i}`}
              data-manifesto-word
              className="inline-block will-change-transform"
            >
              {w}&nbsp;
            </span>
          ))}
        </p>
        <p className="mt-12 max-w-2xl text-[var(--color-ink-dim)] md:text-lg">
          The lab is the proof. Each system here is a working answer to a real
          client brief — sharpened, polished, and shipped publicly so prospects
          can poke at it before we ever get on a call.
        </p>
      </div>
    </section>
  );
}
