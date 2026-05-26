'use client';

import Link from 'next/link';

/**
 * CaseStudy — static content sections rendered below the hero tunnel.
 *
 * Broken out into its own file to keep index.tsx under the 400-line mark.
 * All components here are presentational; no state, no side-effects.
 */

// ─── Problem section ──────────────────────────────────────────────────────────

export function SectionProblem() {
  return (
    <section className="mx-auto mt-24 max-w-3xl px-6 md:px-12">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        The situation
      </p>
      <h2 className="mt-3 text-3xl font-medium leading-snug md:text-4xl">
        Four locations. Four systems. Zero single source of truth.
      </h2>
      <p className="mt-6 text-[var(--color-ink-dim)] md:text-lg leading-relaxed">
        Northbound Coffee Roasters had grown from a single downtown cafe into four
        locations across the metro area in under three years — a genuine success
        story. But their operations hadn&apos;t kept pace. Each location ran its own
        POS system, each manager kept inventory on their own spreadsheet, and
        wholesale orders from restaurants and offices were still flowing in by
        phone and handwritten carbon-copy forms. Stock-outs were a weekly
        occurrence at the busiest locations while adjacent stores sat on surplus.
        Wholesale customers complained that orders took two or three days to
        confirm. The founders were spending more time firefighting logistics than
        building the brand they&apos;d worked so hard to create.
      </p>
    </section>
  );
}

// ─── What we built section ────────────────────────────────────────────────────

export function SectionWhatWeBuilt() {
  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 md:px-12">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        What we built
      </p>
      <h2 className="mt-3 text-3xl font-medium leading-snug md:text-4xl">
        One schema. Every location. Real-time.
      </h2>
      <p className="mt-6 text-[var(--color-ink-dim)] md:text-lg leading-relaxed">
        ReachFlow designed a unified inventory schema that mapped cleanly to each
        location&apos;s existing POS data model, then wrote lightweight sync adapters
        that pull confirmed sales every 15 minutes and reconcile stock levels
        across all four stores into a single Postgres instance. Wholesale customers
        got a self-serve order intake form — clean, mobile-friendly, integrated
        directly with the internal dashboard — that auto-generates a pick list and
        confirmation email the moment an order is submitted. A Slack integration
        monitors per-SKU thresholds and fires a channel alert the moment any
        location dips below two days&apos; supply, so the roasting team can adjust
        production before a stock-out happens rather than after. The whole system
        took six weeks to ship: two for data modelling and POS adapters, two for
        the wholesale form and dashboard, two for alerts, hardening, and training.
      </p>
    </section>
  );
}

// ─── Pull quote ───────────────────────────────────────────────────────────────

export function PullQuote() {
  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 md:px-12">
      <blockquote className="border-l-2 border-[var(--color-accent)] pl-8">
        <p className="text-2xl font-medium italic leading-snug text-[var(--color-ink)] md:text-3xl">
          &ldquo;I used to start every Monday morning trying to figure out why
          the Riverside location was out of our house blend again. Now the
          system tells me on Friday afternoon, before it becomes a problem.
          That&apos;s the whole game.&rdquo;
        </p>
        <footer className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Marcus Okafor &mdash; Co-founder & Head Roaster, Northbound Coffee Roasters
        </footer>
      </blockquote>
    </section>
  );
}

// ─── Results grid ─────────────────────────────────────────────────────────────

interface ResultCardProps {
  metric: string;
  delta: string;
  direction: 'up' | 'down';
  description: string;
}

function ResultCard({ metric, delta, direction, description }: ResultCardProps) {
  const arrowClass =
    direction === 'up'
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-accent)]';

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
      <p className={`font-mono text-3xl font-medium md:text-4xl ${arrowClass}`}>
        {delta}
      </p>
      <p className="mt-3 text-lg font-medium leading-snug">{metric}</p>
      <p className="mt-2 text-sm text-[var(--color-ink-dim)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function SectionResults() {
  const results: ResultCardProps[] = [
    {
      metric: 'Order error rate',
      delta: '−94%',
      direction: 'down',
      description:
        'Wholesale orders are now submitted via structured form. Misreads, transposed SKUs, and wrong quantities dropped from a weekly headache to near-zero.',
    },
    {
      metric: 'Wholesale processing time',
      delta: '−78%',
      direction: 'down',
      description:
        'Average time from order receipt to pick-list-in-hand fell from 3.2 days to 16 hours, measured across the first full quarter post-launch.',
    },
    {
      metric: 'Stock-out events',
      delta: '−66%',
      direction: 'down',
      description:
        'Proactive Slack alerts gave the roasting team enough lead time to cover demand spikes. The worst offender — house blend at Riverside — hasn&apos;t been out since week two.',
    },
    {
      metric: 'Monthly hours saved',
      delta: '+112h',
      direction: 'up',
      description:
        'Across the founding team and four location managers, manual inventory reconciliation and phone-order intake had been consuming about 28 hours per week. Now it&apos;s under one.',
    },
  ];

  return (
    <section className="mx-auto mt-20 max-w-3xl px-6 md:px-12">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Results &mdash; Q1 post-launch
      </p>
      <h2 className="mt-3 text-3xl font-medium leading-snug md:text-4xl">
        Numbers that changed how they work.
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {results.map((r) => (
          <ResultCard key={r.metric} {...r} />
        ))}
      </div>
    </section>
  );
}

// ─── CTA section ─────────────────────────────────────────────────────────────

export function SectionCTA() {
  return (
    <section className="mx-auto mt-24 max-w-3xl px-6 md:px-12">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-10 md:p-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Next step
        </p>
        <h2 className="mt-4 text-balance text-3xl font-medium leading-snug md:text-4xl">
          Want this for your business?
        </h2>
        <p className="mt-4 text-[var(--color-ink-dim)] md:text-lg leading-relaxed">
          If you&apos;re running on spreadsheets, duplicate data entry, or systems
          that don&apos;t talk to each other, this is fixable. ReachFlow scopes,
          builds, and ships the integration layer — then hands you the keys.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="mailto:ryanulmer747@gmail.com?subject=Inquiry%20from%20ReachFlow%20Motion%20Lab"
            className="rounded-full bg-[var(--color-accent)] px-8 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-opacity hover:opacity-80"
          >
            Get in touch
          </a>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] underline-offset-4 transition-colors hover:text-[var(--color-ink)] hover:underline"
          >
            ← Back to the lab
          </Link>
        </div>
      </div>
    </section>
  );
}
