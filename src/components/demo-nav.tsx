import Link from 'next/link';
import { DEMOS } from '@/lib/demo-registry';

/**
 * Fixed prev/next pager so visitors can move between demos (1 → 2 → 3 …)
 * without bouncing back to the lab index. Wraps around at both ends.
 */
export function DemoNav({ slug }: { slug: string }) {
  const idx = DEMOS.findIndex((d) => d.slug === slug);
  if (idx === -1) return null;

  const current = DEMOS[idx]!;
  const prev = DEMOS[(idx - 1 + DEMOS.length) % DEMOS.length]!;
  const next = DEMOS[(idx + 1) % DEMOS.length]!;

  return (
    <nav
      aria-label="Demo navigation"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[var(--color-bg)]/80 p-1 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
        <Link
          href={`/lab/${prev.slug}`}
          aria-label={`Previous demo: ${prev.title}`}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-[var(--color-ink-dim)] transition-colors hover:bg-white/5 hover:text-[var(--color-ink)]"
        >
          <span aria-hidden>←</span>
          <span className="hidden max-w-[9rem] truncate sm:inline">{prev.title}</span>
        </Link>

        <span className="px-2 tabular-nums text-[var(--color-ink-dim)]/70">
          {current.ordinal}/{String(DEMOS.length).padStart(2, '0')}
        </span>

        <Link
          href={`/lab/${next.slug}`}
          aria-label={`Next demo: ${next.title}`}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-[var(--color-ink-dim)] transition-colors hover:bg-white/5 hover:text-[var(--color-ink)]"
        >
          <span className="hidden max-w-[9rem] truncate sm:inline">{next.title}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </nav>
  );
}
