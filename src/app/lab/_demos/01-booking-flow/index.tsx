'use client';

import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { findDemo } from '@/lib/demo-registry';

const demo = findDemo('booking-flow')!;

type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
  blurb: string;
};

const SERVICES: ReadonlyArray<Service> = [
  {
    id: 'signature-facial',
    name: 'Signature Facial',
    duration: '60 min',
    price: '$135',
    blurb: 'Deep cleanse, custom mask, lymphatic massage. Your skin, on a good day.',
  },
  {
    id: 'head-spa',
    name: 'Head Spa Ritual',
    duration: '75 min',
    price: '$165',
    blurb: 'Scalp detox, steam, and a slow-hands massage that quietly rewires your week.',
  },
  {
    id: 'gel-mani',
    name: 'Gel Manicure',
    duration: '45 min',
    price: '$65',
    blurb: 'Shape, cuticle care, and a gel finish that lasts the next three weeks.',
  },
];

const TIMES = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'];

type Step = 0 | 1 | 2 | 3 | 4;

export default function BookingFlow() {
  const [step, setStep] = useState<Step>(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const service = SERVICES.find((s) => s.id === serviceId);

  const canAdvance = ((): boolean => {
    if (step === 0) return Boolean(serviceId);
    if (step === 1) return Boolean(date && time);
    if (step === 2) return name.trim().length > 1 && /.+@.+\..+/.test(email);
    return true;
  })();

  return (
    <main className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
      <header className="mx-auto max-w-3xl">
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

      <ProgressBar step={step} />

      <div className="mx-auto mt-12 max-w-3xl">
        {step === 0 && (
          <StepShell title="Choose a service" subtitle="One per appointment. Pick the headline experience.">
            <ServiceStep serviceId={serviceId} onSelect={setServiceId} />
          </StepShell>
        )}
        {step === 1 && (
          <StepShell title="Pick a date and time" subtitle="Real-time availability would live here. For now: any open slot is yours.">
            <DateTimeStep
              date={date}
              time={time}
              onDate={setDate}
              onTime={setTime}
            />
          </StepShell>
        )}
        {step === 2 && (
          <StepShell title="Your details" subtitle="We use this only to confirm and remind you about your appointment.">
            <DetailsStep
              name={name}
              email={email}
              onName={setName}
              onEmail={setEmail}
            />
          </StepShell>
        )}
        {step === 3 && (
          <StepShell title="Review and confirm" subtitle="Last look. Edit any line by tapping it.">
            <ReviewStep
              service={service}
              date={date}
              time={time}
              name={name}
              email={email}
              onEdit={(s) => setStep(s)}
            />
          </StepShell>
        )}
        {step === 4 && <ConfirmedStep name={name} service={service} date={date} time={time} />}

        {step < 4 && (
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(((step - 1 + 4) % 4) as Step)}
              disabled={step === 0}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setStep(((step + 1) as Step))}
              disabled={!canAdvance}
              className="rounded-full bg-[var(--color-accent)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              {step === 2 ? 'Review' : step === 3 ? 'Confirm booking' : 'Continue'}
            </button>
          </div>
        )}
      </div>

      <footer className="mx-auto mt-32 max-w-3xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 01 · React state + GSAP staggered reveals + Lenis smooth scroll.{' '}
          <Link
            href="/"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}

function ProgressBar({ step }: { step: Step }) {
  const pct = step >= 4 ? 100 : (step / 3) * 100;
  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <span>Step {Math.min(step + 1, 4)} of 4</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="mt-3 h-px w-full bg-white/10">
        <div
          className="h-px bg-[var(--color-accent)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const targets = ref.current.querySelectorAll<HTMLElement>('[data-reveal]');
      gsap.from(targets, {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.06,
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref}>
      <h2 className="text-3xl font-medium md:text-4xl" data-reveal>
        {title}
      </h2>
      <p className="mt-2 text-[var(--color-ink-dim)]" data-reveal>
        {subtitle}
      </p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

function ServiceStep({
  serviceId,
  onSelect,
}: {
  serviceId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-3">
      {SERVICES.map((s) => {
        const active = s.id === serviceId;
        return (
          <li key={s.id} data-reveal>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className={`group w-full rounded-2xl border p-6 text-left transition-colors ${
                active
                  ? 'border-[var(--color-accent)] bg-white/[0.03]'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-medium md:text-2xl">{s.name}</h3>
                <p className="font-mono text-sm text-[var(--color-ink-dim)]">
                  {s.duration} · {s.price}
                </p>
              </div>
              <p className="mt-2 text-[var(--color-ink-dim)]">{s.blurb}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function DateTimeStep({
  date,
  time,
  onDate,
  onTime,
}: {
  date: string | null;
  time: string | null;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
}) {
  // Next 14 days starting tomorrow
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().slice(0, 10),
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  return (
    <div className="space-y-8">
      <div data-reveal>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Date
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {days.map((d) => {
            const active = d.iso === date;
            return (
              <li key={d.iso}>
                <button
                  type="button"
                  onClick={() => onDate(d.iso)}
                  className={`flex min-w-[68px] flex-col items-center rounded-xl border px-3 py-3 transition-colors ${
                    active
                      ? 'border-[var(--color-accent)] bg-white/[0.03]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
                    {d.weekday}
                  </span>
                  <span className="mt-1 text-xl font-medium leading-none">{d.day}</span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
                    {d.month}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div data-reveal>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Time
        </p>
        <ul className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-6">
          {TIMES.map((t) => {
            const active = t === time;
            return (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onTime(t)}
                  disabled={!date}
                  className={`w-full rounded-xl border px-3 py-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                    active
                      ? 'border-[var(--color-accent)] bg-white/[0.03]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {t}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function DetailsStep({
  name,
  email,
  onName,
  onEmail,
}: {
  name: string;
  email: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Field
        label="Your name"
        value={name}
        onChange={onName}
        placeholder="Jane Doe"
        autoComplete="name"
      />
      <Field
        label="Email"
        value={email}
        onChange={onEmail}
        placeholder="you@email.com"
        autoComplete="email"
        type="email"
      />
      <p className="text-sm text-[var(--color-ink-dim)]" data-reveal>
        We&apos;ll send a confirmation and one polite reminder. Nothing else.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  type?: string;
}) {
  return (
    <label className="block" data-reveal>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-lg text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)]"
      />
    </label>
  );
}

function ReviewStep({
  service,
  date,
  time,
  name,
  email,
  onEdit,
}: {
  service: Service | undefined;
  date: string | null;
  time: string | null;
  name: string;
  email: string;
  onEdit: (s: Step) => void;
}) {
  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <dl className="divide-y divide-white/5 rounded-2xl border border-white/5">
      <Row label="Service" value={service?.name ?? '—'} onEdit={() => onEdit(0)} />
      <Row label="When" value={`${dateLabel} · ${time ?? '—'}`} onEdit={() => onEdit(1)} />
      <Row label="Name" value={name || '—'} onEdit={() => onEdit(2)} />
      <Row label="Email" value={email || '—'} onEdit={() => onEdit(2)} />
      <Row
        label="Total"
        value={service?.price ?? '—'}
        accent
      />
    </dl>
  );
}

function Row({
  label,
  value,
  onEdit,
  accent,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5" data-reveal>
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        {label}
      </dt>
      <dd
        className={`flex items-center gap-4 text-right ${
          accent ? 'text-xl font-medium text-[var(--color-accent)]' : ''
        }`}
      >
        {value}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
          >
            Edit
          </button>
        )}
      </dd>
    </div>
  );
}

function ConfirmedStep({
  name,
  service,
  date,
  time,
}: {
  name: string;
  service: Service | undefined;
  date: string | null;
  time: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current.querySelectorAll<HTMLElement>('[data-reveal]'), {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
      });
    },
    { scope: ref }
  );

  const dateLabel = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <section ref={ref} className="py-12 text-center">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]"
        data-reveal
      >
        Confirmed
      </p>
      <h2 className="mt-4 text-balance text-4xl font-medium leading-[1.05] md:text-6xl" data-reveal>
        See you {dateLabel}, {name.split(' ')[0] || 'friend'}.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-[var(--color-ink-dim)] md:text-lg" data-reveal>
        Your {service?.name.toLowerCase()} is booked for {time}. A confirmation is on its way.
      </p>
      <p
        className="mx-auto mt-12 max-w-md font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]"
        data-reveal
      >
        This is a demo. No appointment was actually booked — but this is exactly the flow
        Ryan ships for Esthetics by Seneca.
      </p>
    </section>
  );
}
