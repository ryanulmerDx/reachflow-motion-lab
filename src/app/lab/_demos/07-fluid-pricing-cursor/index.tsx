'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { findDemo } from '@/lib/demo-registry';

const demo = findDemo('fluid-pricing-cursor')!;

// ── Types ─────────────────────────────────────────────────────────────────────

type TierId = 'starter' | 'pro' | 'studio';

interface TierFeature {
  label: string;
  starter: boolean;
  pro: boolean;
  studio: boolean;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const COMPARISON_FEATURES: TierFeature[] = [
  { label: 'Appointment booking',       starter: true,  pro: true,  studio: true  },
  { label: 'Client self-scheduling',    starter: true,  pro: true,  studio: true  },
  { label: 'Email reminders',           starter: true,  pro: true,  studio: true  },
  { label: 'SMS reminders',             starter: false, pro: true,  studio: true  },
  { label: 'Unlimited bookings',        starter: false, pro: true,  studio: true  },
  { label: 'Custom branding',           starter: false, pro: true,  studio: true  },
  { label: 'Calendar integrations',     starter: false, pro: true,  studio: true  },
  { label: 'Automations & workflows',   starter: false, pro: true,  studio: true  },
  { label: 'API access',                starter: false, pro: false, studio: true  },
  { label: 'SSO / SAML',               starter: false, pro: false, studio: true  },
  { label: 'Multi-location management', starter: false, pro: false, studio: true  },
  { label: 'Dedicated success engineer',starter: false, pro: false, studio: true  },
];

const TIER_ACCENT: Record<TierId, string> = {
  starter: 'text-zinc-400',
  pro:     'text-[var(--color-accent)]',
  studio:  'text-[#c084fc]',
};

const TIER_BORDER_HOVER: Record<TierId, string> = {
  starter: 'hover:border-zinc-400/60',
  pro:     'hover:border-[var(--color-accent)]/60',
  studio:  'hover:border-[#c084fc]/60',
};

const TIER_BORDER_ACTIVE: Record<TierId, string> = {
  starter: 'border-zinc-400/60',
  pro:     'border-[var(--color-accent)]/60',
  studio:  'border-[#c084fc]/60',
};

// ── Root component ────────────────────────────────────────────────────────────

export default function FluidPricingCursor() {
  // Track which tier card is hovered — drives the card/table highlight.
  const [hoveredTier, setHoveredTier] = useState<TierId | null>(null);

  const handleTierEnter = useCallback((tier: TierId) => setHoveredTier(tier), []);
  const handleTierLeave = useCallback(() => setHoveredTier(null), []);

  return (
    <div className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
      <div className="relative z-10">

        {/* Header */}
        <header className="mx-auto max-w-6xl">
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

        {/* ── Tier cards ───────────────────────────────────────────────────── */}
        <section className="mx-auto mt-16 max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">

            {/* Starter */}
            <TierCard
              id="starter"
              name="Starter"
              price="$49"
              period="/mo"
              description="For solo operators booking fewer than 100 appointments per month."
              features={[
                'Up to 100 bookings/mo',
                'Client self-scheduling',
                'Email reminders',
                '1 calendar integration',
                'Basic reporting',
              ]}
              cta="Get started"
              isHovered={hoveredTier === 'starter'}
              onEnter={handleTierEnter}
              onLeave={handleTierLeave}
            />

            {/* Pro — popular */}
            <TierCard
              id="pro"
              name="Pro"
              price="$149"
              period="/mo"
              description="For growing service businesses that need unlimited scale and automation."
              features={[
                'Unlimited bookings',
                'SMS + email reminders',
                'Automations & workflows',
                'Custom branding',
                'All calendar integrations',
                'Team scheduling',
                'Priority support',
                'Advanced analytics',
              ]}
              cta="Start free trial"
              popular={true}
              isHovered={hoveredTier === 'pro'}
              onEnter={handleTierEnter}
              onLeave={handleTierLeave}
            />

            {/* Studio */}
            <TierCard
              id="studio"
              name="Studio"
              price="Custom"
              period=""
              description="For multi-location agencies that need bespoke workflows and a dedicated partner."
              features={[
                'Everything in Pro',
                'Multi-location management',
                'API access',
                'SSO / SAML',
                'Custom integrations',
                'SLA uptime guarantee',
                'Dedicated success engineer',
                'Onboarding & migration',
                'Quarterly business reviews',
                'White-label option',
              ]}
              cta="Talk to sales"
              isHovered={hoveredTier === 'studio'}
              onEnter={handleTierEnter}
              onLeave={handleTierLeave}
            />
          </div>
        </section>

        {/* ── Comparison table ─────────────────────────────────────────────── */}
        <section className="mx-auto mt-24 max-w-6xl">
          <h2 className="text-xl font-medium md:text-2xl">
            Full feature comparison
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-dim)]">
            Every plan includes SSL, 99.9% uptime, GDPR-compliant data handling,
            and access to the ReachFlow mobile app.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-4 pl-6 pr-4 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                    Feature
                  </th>
                  <th
                    className={`py-4 px-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] ${TIER_ACCENT.starter}`}
                  >
                    Starter
                  </th>
                  <th
                    className={`py-4 px-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] ${TIER_ACCENT.pro}`}
                  >
                    Pro
                  </th>
                  <th
                    className={`py-4 px-4 pr-6 text-center font-mono text-[10px] uppercase tracking-[0.22em] ${TIER_ACCENT.studio}`}
                  >
                    Studio
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <ComparisonRow
                    key={row.label}
                    feature={row}
                    dim={i % 2 === 0}
                    hoveredTier={hoveredTier}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Social proof strip ───────────────────────────────────────────── */}
        <section className="mx-auto mt-24 max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="Switched from Calendly in an afternoon. Our no-show rate dropped 40% in the first month."
              name="Mara T."
              role="Owner, Cedar & Sun Studio"
            />
            <Testimonial
              quote="The automations alone saved my ops manager six hours a week. We scaled from 2 to 8 locations without adding headcount."
              name="James R."
              role="Director, Atlas Hardware Group"
            />
            <Testimonial
              quote="Studio tier was a no-brainer. The success engineer helped us migrate 3 years of data in two days."
              name="Priya N."
              role="CTO, Linden Group"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          <p>
            Demo 07 · Tier-aware hover highlighting across cards + comparison table.{' '}
            <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
              ← Back to the lab
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

// ── TierCard ──────────────────────────────────────────────────────────────────

interface TierCardProps {
  id: TierId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  isHovered: boolean;
  onEnter: (id: TierId) => void;
  onLeave: () => void;
}

function TierCard({
  id,
  name,
  price,
  period,
  description,
  features,
  cta,
  popular = false,
  isHovered,
  onEnter,
  onLeave,
}: TierCardProps) {
  const accent = TIER_ACCENT[id];
  const borderHover = TIER_BORDER_HOVER[id];
  const borderActive = TIER_BORDER_ACTIVE[id];

  return (
    <article
      onPointerEnter={() => onEnter(id)}
      onPointerLeave={onLeave}
      className={`relative flex flex-col rounded-2xl border p-6 transition-colors duration-300 md:p-8 ${
        isHovered
          ? `bg-white/[0.03] ${borderActive}`
          : `border-white/5 ${borderHover}`
      } ${popular ? 'ring-1 ring-[var(--color-accent)]/20' : ''}`}
    >
      {popular && (
        <span className="mb-4 inline-flex w-fit items-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Most popular
        </span>
      )}

      <div>
        <p className={`font-mono text-[11px] uppercase tracking-[0.22em] ${accent}`}>
          {name}
        </p>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-medium leading-none">{price}</span>
          {period && (
            <span className="text-sm text-[var(--color-ink-dim)]">{period}</span>
          )}
        </div>
        <p className="mt-3 text-sm text-[var(--color-ink-dim)]">{description}</p>
      </div>

      <ul className="mt-6 flex-1 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <svg
              className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8l3.5 3.5 6.5-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[var(--color-ink)]/90">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`mt-8 w-full rounded-full border py-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 ${
          popular
            ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent)]/90'
            : 'border-white/10 text-[var(--color-ink)] hover:border-white/30 hover:bg-white/[0.03]'
        }`}
      >
        {cta}
      </button>
    </article>
  );
}

// ── ComparisonRow ─────────────────────────────────────────────────────────────

function ComparisonRow({
  feature,
  dim,
  hoveredTier,
}: {
  feature: TierFeature;
  dim: boolean;
  hoveredTier: TierId | null;
}) {
  return (
    <tr className={`border-b border-white/5 last:border-0 ${dim ? 'bg-white/[0.01]' : ''}`}>
      <td className="py-3 pl-6 pr-4 text-[var(--color-ink)]/80">{feature.label}</td>
      <FeatureCell supported={feature.starter} tier="starter" hoveredTier={hoveredTier} />
      <FeatureCell supported={feature.pro}     tier="pro"     hoveredTier={hoveredTier} />
      <FeatureCell supported={feature.studio}  tier="studio"  hoveredTier={hoveredTier} last />
    </tr>
  );
}

function FeatureCell({
  supported,
  tier,
  hoveredTier,
  last = false,
}: {
  supported: boolean;
  tier: TierId;
  hoveredTier: TierId | null;
  last?: boolean;
}) {
  const isHighlighted = hoveredTier === tier;

  return (
    <td
      className={`py-3 px-4 text-center transition-colors duration-200 ${last ? 'pr-6' : ''} ${
        isHighlighted ? 'bg-white/[0.025]' : ''
      }`}
    >
      {supported ? (
        <svg
          className={`mx-auto h-4 w-4 transition-colors duration-200 ${
            isHighlighted ? TIER_ACCENT[tier] : 'text-white/40'
          }`}
          viewBox="0 0 16 16"
          fill="none"
          aria-label="Included"
        >
          <path
            d="M3 8l3.5 3.5 6.5-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span
          className="mx-auto block h-0.5 w-3 rounded-full bg-white/10"
          aria-label="Not included"
        />
      )}
    </td>
  );
}

// ── Testimonial ───────────────────────────────────────────────────────────────

function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <blockquote className="rounded-2xl border border-white/5 p-6">
      <p className="text-sm text-[var(--color-ink-dim)] leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-4">
        <p className="text-sm font-medium text-[var(--color-ink)]">{name}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          {role}
        </p>
      </footer>
    </blockquote>
  );
}
