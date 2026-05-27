'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, Vector2, type ShaderMaterial } from 'three';
import { DemoView } from '@/components/demo-view';
import { useUniforms } from '@/lib/uniforms';
import { findDemo } from '@/lib/demo-registry';
import { FluidProgress } from './progress';
import { fragmentShader, vertexShader } from './shader';

const demo = findDemo('intake-form-warp')!;

// ─── Form state types ──────────────────────────────────────────────────────

type ProjectType = 'new-site' | 'rebuild' | 'internal-tool' | 'automation';
type Budget = '<5k' | '5k-15k' | '15k-50k' | '50k+';
type Timeline = 'asap' | '1-3mo' | 'flexible';

interface FormState {
  projectType: ProjectType | null;
  budget: Budget | null;
  timeline: Timeline | null;
  name: string;
  email: string;
  company: string;
  context: string;
}

const STEP_LABELS = ['Type', 'Budget', 'Timeline', 'Contact', 'Done'] as const;
const TOTAL_STEPS = 5;

// ─── Root component ────────────────────────────────────────────────────────

export default function IntakeFormWarp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    projectType: null,
    budget: null,
    timeline: null,
    name: '',
    email: '',
    company: '',
    context: '',
  });

  // Scroll-velocity tracking — shared with DemoViews and FluidProgress
  const rawVelRef = useRef(0);
  const smoothVelRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  // Section refs for scroll snapping / step detection
  const sectionRefs = useRef<Array<HTMLElement | null>>(Array(TOTAL_STEPS).fill(null));

  const handleSubmit = useCallback(() => {
    // Scroll to step 5 (index 4 — thank you)
    setCurrentStep(4);
    const el = sectionRefs.current[4];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const patchForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Velocity loop — mirrors marquee pattern (passive scroll + rAF decay)
  useEffect(() => {
    lastYRef.current = window.scrollY;
    lastTRef.current = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastYRef.current;
      const dt = Math.max(now - lastTRef.current, 1);
      rawVelRef.current = Math.max(-1, Math.min(1, dy / dt / 3));
      lastYRef.current = window.scrollY;
      lastTRef.current = now;
    };

    const tick = () => {
      smoothVelRef.current += (rawVelRef.current - smoothVelRef.current) * 0.12;
      rawVelRef.current *= 0.88;
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Intersection observer — tracks which step is most visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-step'));
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.ratio) {
              best = { idx, ratio: entry.intersectionRatio };
            }
          }
        });
        if (best !== null) setCurrentStep((best as { idx: number }).idx);
      },
      { threshold: [0.3, 0.6] }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setStepRef = useCallback((idx: number) => (el: HTMLElement | null) => {
    sectionRefs.current[idx] = el;
  }, []);

  return (
    <main className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
      {/* Fluid SVG progress — pinned left */}
      <FluidProgress
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        velocityRef={smoothVelRef}
        stepLabels={STEP_LABELS}
      />

      {/* Page header */}
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

      {/* ─── Step 1 — Project type ─────────────────────────────────────────── */}
      <StepSection
        idx={0}
        title="What are you building?"
        setRef={setStepRef(0)}
      >
        <WarpedHeader
          text="Project type."
          velocityRef={smoothVelRef}
          tint="#67e8f9"
        />
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              { id: 'new-site', label: 'New website', sub: 'First presence or greenfield rebuild.' },
              { id: 'rebuild', label: 'Rebuild existing', sub: 'Refactor, redesign, or migrate.' },
              { id: 'internal-tool', label: 'Internal tool / CRM', sub: 'Custom ops software, dashboards, workflows.' },
              { id: 'automation', label: 'Automation / AI agent', sub: 'n8n, Make, custom pipeline, or LLM integration.' },
            ] as Array<{ id: ProjectType; label: string; sub: string }>
          ).map(({ id, label, sub }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => patchForm('projectType', id)}
                className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                  form.projectType === id
                    ? 'border-[var(--color-accent)] bg-white/[0.03]'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                <span className="block text-lg font-medium">{label}</span>
                <span className="mt-1 block text-sm text-[var(--color-ink-dim)]">{sub}</span>
              </button>
            </li>
          ))}
        </ul>
        <ScrollHint />
      </StepSection>

      {/* ─── Step 2 — Budget ──────────────────────────────────────────────── */}
      <StepSection
        idx={1}
        title="What's the budget?"
        setRef={setStepRef(1)}
      >
        <WarpedHeader
          text="Budget range."
          velocityRef={smoothVelRef}
          tint="#a78bfa"
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              { id: '<5k', label: '< $5k' },
              { id: '5k-15k', label: '$5k – $15k' },
              { id: '15k-50k', label: '$15k – $50k' },
              { id: '50k+', label: '$50k+' },
            ] as Array<{ id: Budget; label: string }>
          ).map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => patchForm('budget', id)}
                className={`w-full rounded-2xl border py-5 text-center font-medium transition-colors ${
                  form.budget === id
                    ? 'border-[var(--color-accent)] bg-white/[0.03] text-[var(--color-accent)]'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <ScrollHint />
      </StepSection>

      {/* ─── Step 3 — Timeline ────────────────────────────────────────────── */}
      <StepSection
        idx={2}
        title="When do you need it?"
        setRef={setStepRef(2)}
      >
        <WarpedHeader
          text="Timeline."
          velocityRef={smoothVelRef}
          tint="#34d399"
        />
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { id: 'asap', label: 'ASAP', sub: 'Yesterday, ideally.' },
              { id: '1-3mo', label: '1 – 3 months', sub: 'Planned, but not forever.' },
              { id: 'flexible', label: 'Flexible', sub: 'Quality over speed.' },
            ] as Array<{ id: Timeline; label: string; sub: string }>
          ).map(({ id, label, sub }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => patchForm('timeline', id)}
                className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                  form.timeline === id
                    ? 'border-[var(--color-accent)] bg-white/[0.03]'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                <span className="block text-lg font-medium">{label}</span>
                <span className="mt-1 block text-sm text-[var(--color-ink-dim)]">{sub}</span>
              </button>
            </li>
          ))}
        </ul>
        <ScrollHint />
      </StepSection>

      {/* ─── Step 4 — Contact ─────────────────────────────────────────────── */}
      <StepSection
        idx={3}
        title="Where should Ryan reply?"
        setRef={setStepRef(3)}
      >
        <WarpedHeader
          text="Your details."
          velocityRef={smoothVelRef}
          tint="#f59e0b"
        />
        <div className="mt-8 space-y-5 max-w-xl">
          <Field
            label="Name"
            value={form.name}
            onChange={(v) => patchForm('name', v)}
            placeholder="Jane Doe"
            autoComplete="name"
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => patchForm('email', v)}
            placeholder="jane@company.com"
            autoComplete="email"
          />
          <Field
            label="Company (optional)"
            value={form.company}
            onChange={(v) => patchForm('company', v)}
            placeholder="Acme Inc."
            autoComplete="organization"
          />
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
              Context (optional)
            </span>
            <textarea
              value={form.context}
              onChange={(e) => patchForm('context', e.target.value)}
              placeholder="Anything useful — existing stack, pain points, what's broken..."
              rows={4}
              className="mt-2 w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-base text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-accent)] resize-none"
            />
          </label>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.name.trim() || !/.+@.+\..+/.test(form.email)}
            className="mt-2 rounded-full bg-[var(--color-accent)] px-8 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            Send it
          </button>
        </div>
      </StepSection>

      {/* ─── Step 5 — Thank you ───────────────────────────────────────────── */}
      <StepSection
        idx={4}
        title="You're all set."
        setRef={setStepRef(4)}
      >
        <WarpedHeader
          text="Done."
          velocityRef={smoothVelRef}
          tint="#67e8f9"
        />
        <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-8 max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
            Got it
          </p>
          <p className="mt-3 text-2xl font-medium">
            Ryan will reply within 24h.
          </p>
          <p className="mt-3 text-[var(--color-ink-dim)]">
            In the meantime, here&apos;s what you told us:
          </p>

          <dl className="mt-6 divide-y divide-white/5">
            <SummaryRow label="Project type" value={form.projectType ?? '—'} />
            <SummaryRow label="Budget" value={form.budget ?? '—'} />
            <SummaryRow label="Timeline" value={form.timeline ?? '—'} />
            <SummaryRow label="Name" value={form.name || '—'} />
            <SummaryRow label="Email" value={form.email || '—'} />
            {form.company && <SummaryRow label="Company" value={form.company} />}
            {form.context && <SummaryRow label="Context" value={form.context} />}
          </dl>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
            This is a demo — no data was transmitted. But this is exactly the intake flow
            ReachFlow ships for its own lead generation.
          </p>
        </div>
      </StepSection>

      <footer className="mx-auto mt-32 max-w-3xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 05 · Scroll-velocity shader warp + fluid SVG progress.{' '}
          <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}

// ─── StepSection ────────────────────────────────────────────────────────────

function StepSection({
  idx,
  title,
  setRef,
  children,
}: {
  idx: number;
  title: string;
  setRef: (el: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      ref={setRef}
      data-step={idx}
      className="mx-auto mt-24 min-h-[80vh] max-w-3xl first:mt-16"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Step {idx + 1} of {TOTAL_STEPS}
      </p>
      <h2 className="mt-2 text-2xl font-medium md:text-3xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// ─── WarpedHeader ────────────────────────────────────────────────────────────

/**
 * Large display text with a fragment-shader backdrop that warps with
 * scroll velocity. The DemoView rect tracks this DOM element via a
 * ref — identical pattern to demo 03.
 */
function WarpedHeader({
  text,
  velocityRef,
  tint,
}: {
  text: string;
  velocityRef: React.RefObject<number>;
  tint: string;
}) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl">
      {/* Shader region — sits behind the text */}
      <DemoView className="absolute inset-0 h-full w-full">
        <HeaderShaderMesh velocityRef={velocityRef} tint={tint} />
      </DemoView>
      {/* Text floats above the shader */}
      <div className="relative z-10 px-6 py-8 md:px-10 md:py-10">
        <span className="font-display text-[clamp(3rem,8vw,7rem)] font-medium leading-none tracking-tight text-white/90">
          {text}
        </span>
      </div>
    </div>
  );
}

// ─── HeaderShaderMesh ────────────────────────────────────────────────────────

/**
 * R3F mesh that drives the header backdrop shader.
 * Reads smoothed velocity from the shared ref each frame — no React state,
 * no re-renders, just uniform mutation in useFrame.
 */
function HeaderShaderMesh({
  velocityRef,
  tint,
}: {
  velocityRef: React.RefObject<number>;
  tint: string;
}) {
  const matRef = useRef<ShaderMaterial>(null);
  const { size, viewport } = useThree();

  const uniforms = useUniforms({
    uTime: 0,
    uResolution: new Vector2(size.width, size.height),
    uVelocity: 0,
    uTint: new Color(tint),
  });

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uVelocity.value = velocityRef.current ?? 0;
  });

  // Scale a unit plane to the View's world-space viewport so the shader
  // fills the tracked DOM rect under the global perspective camera.
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ─── ScrollHint ─────────────────────────────────────────────────────────────

function ScrollHint() {
  return (
    <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]/50">
      Scroll to continue ↓
    </p>
  );
}

// ─── Field ──────────────────────────────────────────────────────────────────

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
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

// ─── SummaryRow ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)] shrink-0">
        {label}
      </dt>
      <dd className="text-right text-sm text-[var(--color-ink)]">{value}</dd>
    </div>
  );
}
