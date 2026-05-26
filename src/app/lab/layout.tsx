import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] backdrop-blur-md">
        <Link href="/" className="hover:text-[var(--color-ink)]">
          ← {SITE.shortName}
        </Link>
        <Link href={SITE.repo} className="hover:text-[var(--color-ink)]">
          View source
        </Link>
      </nav>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
