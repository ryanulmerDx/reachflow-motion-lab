'use client';

import { DEMOS } from '@/lib/demo-registry';

/**
 * Endless horizontal index marquee — pure CSS animation, GPU-friendly.
 * The text repeats twice; the first half scrolls off-screen exactly as the
 * second half scrolls into the same position, looping seamlessly.
 */
export function LandingMarquee() {
  const titles = DEMOS.map((d) => `${d.ordinal} ${d.title}`);
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden border-y border-white/5 bg-[var(--color-bg)]/80 py-6 backdrop-blur-sm"
    >
      <div className="flex w-max gap-12 whitespace-nowrap font-mono text-[clamp(20px,4vw,44px)] uppercase tracking-[0.04em] text-[var(--color-ink-dim)] motion-safe:animate-[marquee_38s_linear_infinite] motion-reduce:animate-none">
        {[...titles, ...titles, ...titles].map((title, i) => (
          <span
            key={`${title}-${i}`}
            className="flex items-center gap-12"
          >
            <span>{title}</span>
            <span aria-hidden className="text-[var(--color-accent)]">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
