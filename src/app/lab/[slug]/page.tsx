import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEMOS, findDemo } from '@/lib/demo-registry';
import { SITE } from '@/lib/site';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return DEMOS.map((demo) => ({ slug: demo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const demo = findDemo(slug);
  if (!demo) return {};
  return {
    title: demo.title,
    description: demo.tagline,
    openGraph: {
      title: `${demo.title} — ${SITE.shortName}`,
      description: demo.tagline,
      url: `${SITE.url}/lab/${demo.slug}`,
    },
  };
}

export default async function DemoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const demo = findDemo(slug);
  if (!demo) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-32">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Demo {demo.ordinal} · {demo.status}
      </p>
      <h1 className="mt-4 text-balance text-5xl font-medium leading-[1.05] md:text-7xl">
        {demo.title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-[var(--color-ink-dim)] md:text-xl">
        {demo.tagline}
      </p>
      <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-white/5 pt-10 md:grid-cols-3">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Technique
          </dt>
          <dd className="mt-2">{demo.technique}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Inspiration
          </dt>
          <dd className="mt-2">{demo.inspiration}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Track
          </dt>
          <dd className="mt-2 font-mono">{demo.track}</dd>
        </div>
      </dl>
      <p className="mt-16 font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Scaffolded. Implementation lands in Wave {demo.ordinal === '01' || demo.ordinal === '02' || demo.ordinal === '03' || demo.ordinal === '04' || demo.ordinal === '05' ? '2' : '3'}.
      </p>
    </main>
  );
}
