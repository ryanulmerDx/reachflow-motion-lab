import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <nav className="fixed inset-x-0 top-0 z-50 grid grid-cols-3 items-center px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] backdrop-blur-md">
        <Link href="/" className="justify-self-start hover:text-[var(--color-ink)]">
          ← {SITE.shortName}
        </Link>

        {/* Honesty badge — every demo in /lab is a mockup driven by seed data;
            visuals, motion, and interactions are real, the numbers/names/feeds
            are fabricated. Hidden on mobile to keep the nav from wrapping. */}
        <span
          aria-label="This demo uses mock data; the engineering is real"
          className="hidden sm:inline-flex items-center gap-2 justify-self-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-3 py-1 text-[10px] tracking-[0.2em] text-[var(--color-accent)]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
          Mock data · wired UI
        </span>

        <Link
          href={SITE.repo}
          className="justify-self-end hover:text-[var(--color-ink)]"
        >
          View source
        </Link>
      </nav>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
