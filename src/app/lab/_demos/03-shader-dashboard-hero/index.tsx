'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { ScreenQuad } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Color, Vector2, type ShaderMaterial } from 'three';
import Link from 'next/link';
import { DemoView } from '@/components/demo-view';
import { useUniforms } from '@/lib/uniforms';
import { findDemo } from '@/lib/demo-registry';
import { fragmentShader } from './shader';
import ndcVert from '@/shaders/ndc-pass.vert.glsl';

const demo = findDemo('shader-dashboard-hero')!;

export default function ShaderDashboardHero() {
  return (
    <main className="relative min-h-dvh px-6 pb-24 pt-28 md:px-12">
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

      <section className="mx-auto mt-12 max-w-6xl">
        {/* Hero card — shader renders edge-to-edge behind the live metrics */}
        <article className="relative overflow-hidden rounded-2xl border border-white/5">
          <DemoView className="absolute inset-0 h-full w-full">
            <HeroShader />
          </DemoView>

          {/* Dark gloss so the white text stays readable over the noise */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(8,8,10,0.55),rgba(8,8,10,0.85))]"
          />

          <div className="relative z-10 grid gap-12 p-8 md:grid-cols-3 md:p-12 lg:p-16">
            <Metric label="Monthly recurring revenue" value="$48,210" delta="+12.4%" />
            <Metric label="Active customers" value="312" delta="+9 this week" />
            <Metric label="Churn (30d)" value="1.8%" delta="−0.4 pts" />
          </div>
        </article>

        <DashboardBelow />
      </section>

      <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Primitives proof — Canvas · DemoView · GLSL chunks · uniforms · Lenis.{' '}
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

function HeroShader() {
  const matRef = useRef<ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useUniforms({
    uTime: 0,
    uResolution: new Vector2(size.width, size.height),
    uMouse: new Vector2(0.5, 0.5),
    uTint: new Color('#67e8f9'),
    uIntensity: 0.85,
  });

  useFrame(({ clock, pointer }) => {
    if (!matRef.current) return;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uMouse.value.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);
  });

  // ScreenQuad always covers the View's full viewport, regardless of the
  // global Canvas camera. This is the correct primitive for a full-bleed
  // fragment shader inside a tracked <View>.
  return (
    <ScreenQuad>
      <shaderMaterial
        ref={matRef}
        vertexShader={ndcVert}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </ScreenQuad>
  );
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink)]/70">
        {label}
      </p>
      <p className="mt-3 text-4xl font-medium leading-none md:text-5xl">{value}</p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
        {delta}
      </p>
    </div>
  );
}

// ─── DashboardBelow ──────────────────────────────────────────────────────────

function DashboardBelow() {
  return (
    <div className="mt-12 grid gap-8 md:grid-cols-3">
      <ActivityFeed />
      <SystemHealth />
      <PrimitivesNote />
    </div>
  );
}

// ─── ActivityFeed — replaces the awkward "Pipeline this week" list ───────────

type Event = {
  id: number;
  ago: string;
  text: string;
  kind: 'signup' | 'payment' | 'cancel' | 'system';
};

const SEED_EVENTS: ReadonlyArray<Event> = [
  { id: 1, ago: '2s', text: 'New signup · contact@northbound.coffee', kind: 'signup' },
  { id: 2, ago: '14s', text: 'Payment received · Hammerhead Pools · $5,800', kind: 'payment' },
  { id: 3, ago: '1m', text: 'Webhook delivered · stripe.invoice.paid', kind: 'system' },
  { id: 4, ago: '3m', text: 'Plan upgraded · Esthetics by Seneca → Studio', kind: 'signup' },
  { id: 5, ago: '6m', text: 'Cancellation · Linden Architecture (3 mo)', kind: 'cancel' },
];

const EVENT_DOT: Record<Event['kind'], string> = {
  signup: 'bg-emerald-400',
  payment: 'bg-[var(--color-accent)]',
  cancel: 'bg-rose-400',
  system: 'bg-white/40',
};

function ActivityFeed() {
  const [events, setEvents] = useState<ReadonlyArray<Event>>(SEED_EVENTS);

  // Pulse a new "ping" event every ~6s so the dashboard feels alive.
  useEffect(() => {
    let nextId = SEED_EVENTS.length + 1;
    const interval = setInterval(() => {
      const samples: ReadonlyArray<Omit<Event, 'id' | 'ago'>> = [
        { text: 'Webhook delivered · stripe.payment_intent.succeeded', kind: 'system' },
        { text: 'New signup · ops@cedarsun.studio', kind: 'signup' },
        { text: 'Payment received · Sable & Thread · $7,200', kind: 'payment' },
        { text: 'API request · /v1/bookings · 204', kind: 'system' },
      ];
      const next = samples[Math.floor(Math.random() * samples.length)]!;
      setEvents((prev) => {
        const fresh: Event = { id: nextId++, ago: 'just now', text: next.text, kind: next.kind };
        return [fresh, ...prev].slice(0, 6);
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Live activity
        </p>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Streaming
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {events.map((e) => (
          <li key={e.id} className="flex items-start gap-3 text-[13px] leading-snug">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${EVENT_DOT[e.kind]}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[var(--color-ink)]">{e.text}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
                {e.ago}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── SystemHealth ────────────────────────────────────────────────────────────

const HEALTH_BARS: ReadonlyArray<{ label: string; value: string; pct: number; tone: string }> = [
  { label: 'API p95 latency', value: '124 ms', pct: 18, tone: 'bg-emerald-400' },
  { label: 'Error rate (24h)', value: '0.04 %', pct: 4, tone: 'bg-emerald-400' },
  { label: 'Queue depth', value: '12 jobs', pct: 28, tone: 'bg-[var(--color-accent)]' },
  { label: 'DB connections', value: '34 / 100', pct: 34, tone: 'bg-[var(--color-accent)]' },
];

function SystemHealth() {
  return (
    <div className="rounded-2xl border border-white/5 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        System health
      </p>
      <ul className="mt-4 flex flex-col gap-4">
        {HEALTH_BARS.map((b) => (
          <li key={b.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-[var(--color-ink)]/90">{b.label}</span>
              <span className="font-mono text-[11px] text-[var(--color-ink-dim)]">{b.value}</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${b.tone}`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PrimitivesNote ──────────────────────────────────────────────────────────

function PrimitivesNote() {
  return (
    <div className="rounded-2xl border border-white/5 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        What you&apos;re seeing
      </p>
      <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-dim)]">
        The hero card&apos;s gradient isn&apos;t a static image — it&apos;s a fragment
        shader running on the GPU, sampling pointer movement in real time. Same
        GPU context, same Canvas as every other demo in the lab.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-dim)]">
        Live activity and system health are mocked, but the wiring is the
        boring part — swap the seed loop for a websocket and the same UI runs
        against real events.
      </p>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Lenis is smoothing this scroll. Shader keeps animating throughout.
      </p>
    </div>
  );
}
