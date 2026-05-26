'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from '@/lib/gsap';
import { findDemo } from '@/lib/demo-registry';

const demo = findDemo('portal-transitions')!;

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewName = 'home' | 'features' | 'pricing' | 'contact';

interface Tab {
  id: ViewName;
  label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: ReadonlyArray<Tab> = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
];

// View-transition CSS injected once into the page
const VIEW_TRANSITION_CSS = `
  @keyframes vt-fade-in {
    from { opacity: 0; transform: scale(0.98) translateY(6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0px); }
  }
  @keyframes vt-fade-out {
    from { opacity: 1; transform: scale(1)    translateY(0px); }
    to   { opacity: 0; transform: scale(1.02) translateY(-6px); }
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 280ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  ::view-transition-old(root) {
    animation-name: vt-fade-out;
  }
  ::view-transition-new(root) {
    animation-name: vt-fade-in;
  }

  ::view-transition-old(brand-mark),
  ::view-transition-new(brand-mark) {
    animation-duration: 420ms;
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    mix-blend-mode: normal;
  }
`;

// ─── Root component ───────────────────────────────────────────────────────────

export default function PortalTransitions() {
  const [view, setView] = useState<ViewName>('home');
  const containerRef = useRef<HTMLDivElement>(null);

  function switchTo(next: ViewName) {
    if (next === view) return;
    if (typeof document === 'undefined') return;

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };

    if (doc.startViewTransition) {
      doc.startViewTransition(() => {
        flushSync(() => setView(next));
      });
    } else {
      // GSAP fallback for Safari / older Firefox
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.98,
        duration: 0.18,
        ease: 'power2.out',
        onComplete: () => {
          setView(next);
          gsap.to(containerRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.32,
            ease: 'power2.out',
          });
        },
      });
    }
  }

  return (
    <main className="relative min-h-dvh px-6 pb-24 pt-28 md:px-12">
      {/* Inline view-transition CSS — must NOT go in globals.css per constraints */}
      <style
        dangerouslySetInnerHTML={{ __html: VIEW_TRANSITION_CSS }}
      />

      {/* Page header */}
      <header className="mx-auto max-w-5xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          {demo.ordinal} · {demo.system}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-medium leading-[1.05] md:text-6xl">
          {demo.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--color-ink-dim)] md:text-lg">
          {demo.tagline}
        </p>
      </header>

      {/* Tab nav */}
      <nav className="mx-auto mt-10 max-w-5xl">
        <div className="flex gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-1.5">
          {TABS.map((tab) => {
            const active = tab.id === view;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTo(tab.id)}
                className={`flex-1 rounded-xl px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-200 ${
                  active
                    ? 'bg-white/[0.08] text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]/60">
          {typeof document !== 'undefined' &&
          (
            document as Document & { startViewTransition?: unknown }
          ).startViewTransition
            ? 'View Transitions API active — watch the brand mark morph'
            : 'GSAP fallback active (View Transitions API not supported)'}
        </p>
      </nav>

      {/* Swapping view container — tagged so VT cross-fades this layer */}
      <div
        ref={containerRef}
        className="mx-auto mt-8 max-w-5xl"
        style={{ viewTransitionName: 'view-root' } as React.CSSProperties}
      >
        {view === 'home' && <HomeView />}
        {view === 'features' && <FeaturesView />}
        {view === 'pricing' && <PricingView />}
        {view === 'contact' && <ContactView />}
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-24 max-w-5xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 04 · View Transitions API + GSAP fallback + shared brand-mark morph.{' '}
          <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}

// ─── Brand mark (the shared element that morphs between views) ────────────────

/**
 * The BrandMark carries `viewTransitionName: 'brand-mark'`.
 * The browser captures its bounding rect in both the old and new snapshots,
 * then animates position, size, and opacity automatically between them.
 * Each view places it at a different position/scale to make the morph visible.
 */
function BrandMark({
  size = 'md',
  faded = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  faded?: boolean;
}) {
  const sizeClasses = {
    sm: 'text-2xl md:text-3xl',
    md: 'text-3xl md:text-4xl',
    lg: 'text-5xl md:text-7xl',
  }[size];

  return (
    <div
      className={`inline-flex items-baseline gap-2 font-display font-medium leading-none select-none ${sizeClasses} ${
        faded ? 'opacity-10' : ''
      }`}
      style={{ viewTransitionName: 'brand-mark' } as React.CSSProperties}
    >
      <span className="text-[var(--color-ink)]">Pace</span>
      <span
        className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent)]"
        style={{ boxShadow: '0 0 12px 3px var(--color-accent)' }}
      />
    </div>
  );
}

// ─── Home view ────────────────────────────────────────────────────────────────

function HomeView() {
  return (
    <section className="min-h-[60vh] py-16">
      {/* Brand mark — large, top-left */}
      <div className="mb-12">
        <BrandMark size="lg" />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Customer revenue platform
          </p>
          <h2 className="mt-4 text-balance text-5xl font-medium leading-[1.05] md:text-6xl">
            Know which customers are worth keeping.
          </h2>
          <p className="mt-6 text-xl text-[var(--color-ink-dim)] leading-relaxed">
            Pace connects your revenue data to the humans behind it — so your team
            acts on signal, not spreadsheets.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[var(--color-accent)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:brightness-110"
            >
              Start free trial
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)] transition-colors hover:border-white/30 hover:text-[var(--color-ink)]"
            >
              See how it works
            </button>
          </div>
        </div>

        {/* Stat block — right column */}
        <div className="flex flex-col justify-center gap-8">
          {[
            { value: '4.2×', label: 'avg. retention uplift after 90 days' },
            { value: '$2.1M', label: 'rescued ARR per customer (median)' },
            { value: '18 min', label: 'time to first insight after connecting CRM' },
          ].map((stat) => (
            <div key={stat.label} className="border-l-2 border-[var(--color-accent)]/30 pl-5">
              <p className="font-display text-4xl font-medium text-[var(--color-ink)]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink-dim)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features view ────────────────────────────────────────────────────────────

function FeaturesView() {
  const features = [
    {
      icon: '↗',
      title: 'Live revenue',
      blurb:
        'Every subscription event — upgrade, downgrade, churn, expansion — arrives in under 3 seconds. No nightly sync. No stale dashboards.',
      pill: 'Real-time',
    },
    {
      icon: '⬡',
      title: 'Cohort retention',
      blurb:
        'Slice retention by plan, industry, sales rep, or acquisition channel. Spot the cohort that drops off at month 6 before it becomes a forecast problem.',
      pill: 'Cohort analysis',
    },
    {
      icon: '◎',
      title: 'Churn alerts',
      blurb:
        'Pace models usage drop-offs, support ticket spikes, and login gaps into a single risk score per account — delivered to Slack before the renewal window closes.',
      pill: 'Predictive',
    },
  ];

  return (
    <section className="py-12">
      {/* Section header with brand mark inline — medium, top-right */}
      <div className="mb-14 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            Platform capabilities
          </p>
          <h2 className="mt-3 text-4xl font-medium leading-[1.05] md:text-5xl">
            The three signals that matter.
          </h2>
        </div>
        <div className="shrink-0 md:mt-1">
          <BrandMark size="md" />
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-2xl text-[var(--color-accent)]">{f.icon}</span>
              <span className="rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {f.pill}
              </span>
            </div>
            <h3 className="mt-6 text-2xl font-medium">{f.title}</h3>
            <p className="mt-3 text-[var(--color-ink-dim)] leading-relaxed">{f.blurb}</p>
          </div>
        ))}
      </div>

      {/* Secondary feature row */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { label: 'CRM sync', desc: 'Salesforce, HubSpot, Pipedrive — two-way, live.' },
          { label: 'Slack + email alerts', desc: 'At-risk accounts reach your team before renewal.' },
          { label: 'Segment explorer', desc: 'Filter any metric by any dimension, in seconds.' },
          { label: 'API-first', desc: 'Push Pace data anywhere. REST + webhooks included.' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-xl border border-white/5 px-6 py-4"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
            <span className="font-medium">{item.label}</span>
            <span className="ml-auto text-sm text-[var(--color-ink-dim)]">{item.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing view ─────────────────────────────────────────────────────────────

type PricingTier = {
  name: string;
  price: string;
  period: string;
  blurb: string;
  cta: string;
  highlighted: boolean;
  features: ReadonlyArray<string>;
};

function PricingView() {
  const tiers: ReadonlyArray<PricingTier> = [
    {
      name: 'Starter',
      price: '$149',
      period: '/ month',
      blurb: 'For lean teams connecting their first data source.',
      cta: 'Get started',
      highlighted: false,
      features: [
        'Up to 500 tracked customers',
        '1 data source',
        'Weekly digest emails',
        '30-day data retention',
        'Slack alerts (10/month)',
      ],
    },
    {
      name: 'Pro',
      price: '$499',
      period: '/ month',
      blurb: 'For growing SaaS teams serious about retention.',
      cta: 'Start 14-day trial',
      highlighted: true,
      features: [
        'Unlimited tracked customers',
        'Up to 5 data sources',
        'Real-time revenue stream',
        'Cohort analysis',
        'Churn prediction scores',
        'Unlimited Slack + email alerts',
        '12-month data retention',
      ],
    },
    {
      name: 'Studio',
      price: 'Custom',
      period: '',
      blurb: 'Enterprise contracts, SSO, SLA, and white-glove onboarding.',
      cta: 'Talk to sales',
      highlighted: false,
      features: [
        'Everything in Pro',
        'Unlimited data sources',
        'SAML SSO + SCIM',
        'Custom data retention',
        'Dedicated CSM',
        'SLA guarantee',
        'On-prem option',
      ],
    },
  ];

  return (
    <section className="py-12">
      <div className="mb-14 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Pricing
        </p>
        <h2 className="mt-3 text-4xl font-medium leading-[1.05] md:text-5xl">
          Pay for signal, not seats.
        </h2>
        <p className="mt-4 text-[var(--color-ink-dim)]">
          All plans include a 14-day trial. No credit card required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-8 transition-colors ${
              tier.highlighted
                ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.04]'
                : 'border-white/5 bg-white/[0.02]'
            }`}
          >
            {tier.highlighted && (
              <>
                {/* Brand mark above the most-popular tier — small, centered */}
                <div className="mb-5 flex justify-center">
                  <BrandMark size="sm" />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--color-accent)] px-4 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-black">
                    Most popular
                  </span>
                </div>
              </>
            )}

            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
              {tier.name}
            </p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-medium">{tier.price}</span>
              {tier.period && (
                <span className="text-[var(--color-ink-dim)]">{tier.period}</span>
              )}
            </div>
            <p className="mt-3 text-sm text-[var(--color-ink-dim)]">{tier.blurb}</p>

            <button
              type="button"
              className={`mt-8 w-full rounded-full py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-all ${
                tier.highlighted
                  ? 'bg-[var(--color-accent)] text-black hover:brightness-110'
                  : 'border border-white/10 text-[var(--color-ink-dim)] hover:border-white/30 hover:text-[var(--color-ink)]'
              }`}
            >
              {tier.cta}
            </button>

            <ul className="mt-8 space-y-3">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-[var(--color-accent)]">✓</span>
                  <span className="text-[var(--color-ink-dim)]">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Contact view ─────────────────────────────────────────────────────────────

function ContactView() {
  return (
    <section className="relative py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] px-8 py-16 text-center md:px-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Get in touch
          </p>
          <h2 className="mt-4 text-balance text-4xl font-medium leading-[1.05] md:text-5xl">
            Talk to a real human about your retention problem.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[var(--color-ink-dim)]">
            No SDR gatekeeping. You&apos;ll speak with a Pace strategist who has seen
            your exact churn problem before — and fixed it.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3">
            <input
              type="email"
              placeholder="your@company.com"
              className="w-full max-w-sm rounded-xl border border-white/10 bg-transparent px-5 py-3.5 text-center text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-dim)]/50 focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              className="w-full max-w-sm rounded-full bg-[var(--color-accent)] py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-black transition-all hover:brightness-110"
            >
              Request a walkthrough
            </button>
          </div>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]/50">
            Typical response: same business day
          </p>
        </div>

        {/* Brand mark as watermark — large, faded, bottom-center */}
        <div className="mt-10 flex justify-center">
          <BrandMark size="lg" faded />
        </div>
      </div>
    </section>
  );
}
