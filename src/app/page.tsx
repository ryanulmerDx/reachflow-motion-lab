import Link from 'next/link';
import { DEMOS } from '@/lib/demo-registry';
import { SITE } from '@/lib/site';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <header className="mb-20">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          {SITE.studio.name} · Open-source lab
        </p>
        <h1 className="mt-4 text-balance text-5xl font-medium leading-[1.05] md:text-7xl">
          {SITE.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--color-ink-dim)] md:text-xl">
          {SITE.tagline}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-[0.18em]">
          <Link href={SITE.studio.url} className="underline-offset-4 hover:underline">
            Hire the studio →
          </Link>
          <Link href={SITE.repo} className="underline-offset-4 hover:underline">
            View on GitHub
          </Link>
        </div>
      </header>

      <section aria-label="Demos">
        <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          The ten experiments
        </h2>
        <ol className="mt-6 grid grid-cols-1 gap-px border border-white/5 bg-white/5 md:grid-cols-2">
          {DEMOS.map((demo) => (
            <li key={demo.slug} className="bg-[var(--color-bg)]">
              <Link
                href={`/lab/${demo.slug}`}
                className="group flex h-full flex-col justify-between gap-6 p-6 transition-colors hover:bg-white/[0.02] md:p-8"
              >
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                    {demo.ordinal} · {demo.status}
                  </p>
                  <h3 className="mt-3 text-2xl font-medium md:text-3xl">{demo.title}</h3>
                  <p className="mt-3 text-[var(--color-ink-dim)]">{demo.tagline}</p>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)] transition-colors group-hover:text-[var(--color-accent)]">
                  {demo.technique}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-24 flex flex-col gap-2 border-t border-white/5 pt-8 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-ink-dim)] md:flex-row md:items-center md:justify-between">
        <p>
          Built by{' '}
          <Link href={SITE.studio.url} className="underline-offset-4 hover:underline">
            {SITE.studio.name}
          </Link>{' '}
          · MIT licensed
        </p>
        <p>{SITE.studio.contact}</p>
      </footer>
    </main>
  );
}
