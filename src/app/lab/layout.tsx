import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <nav className="fixed inset-x-0 top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] backdrop-blur-md sm:grid-cols-3 sm:px-6 sm:py-4 sm:text-[11px]">
        <Link href="/" className="whitespace-nowrap justify-self-start hover:text-[var(--color-ink)]">
          ← {SITE.shortName}
        </Link>

        {/* Honesty badge — every demo in /lab is a mockup driven by seed data;
            visuals, motion, and interactions are real, the numbers/names/feeds
            are fabricated. Slim dot on mobile to keep nav single-line; full
            label re-appears at sm and above. */}
        <span
          aria-label="This demo uses mock data; the engineering is real"
          className="inline-flex items-center gap-2 justify-self-center whitespace-nowrap rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-2 py-1 text-[9px] tracking-[0.2em] text-[var(--color-accent)] sm:px-3 sm:text-[10px]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
          <span className="hidden sm:inline">Mock data · wired UI</span>
          <span className="sm:hidden">Mock data</span>
        </span>

        <Link
          href={SITE.repo}
          className="whitespace-nowrap justify-self-end hover:text-[var(--color-ink)]"
        >
          <span className="sm:hidden">Source</span>
          <span className="hidden sm:inline">View source</span>
        </Link>
      </nav>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
