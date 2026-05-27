'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, Vector2, type ShaderMaterial } from 'three';
import Link from 'next/link';
import { DemoView } from '@/components/demo-view';
import { useUniforms } from '@/lib/uniforms';
import { findDemo } from '@/lib/demo-registry';
import { fragmentShader, vertexShader } from './shader';

const demo = findDemo('shader-dashboard-hero')!;

/**
 * Wave 1 primitives proof — and the first real Systems Lab demo.
 *
 * Proves the full stack works end-to-end:
 *   - GlobalCanvas (lab layout)
 *   - DemoView region tracking (drei View)
 *   - Composed GLSL chunks (simplex + valueRemap + noise-hero frag)
 *   - Type-safe uniforms (useUniforms)
 *   - Lenis smooth scroll (root layout)
 */
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
        {/* Hero card — shader renders behind the live metrics */}
        <article className="relative overflow-hidden rounded-2xl border border-white/5">
          <DemoView className="absolute inset-0 h-full w-full">
            <HeroShader />
          </DemoView>

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
  const { size, viewport } = useThree();

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

function DashboardBelow() {
  // Demos a long scrollable surface so Lenis smooth scroll is verifiable
  // and the hero shader keeps animating while it scrolls into view.
  return (
    <div className="mt-12 grid gap-8 md:grid-cols-2">
      <div className="rounded-2xl border border-white/5 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          Pipeline this week
        </p>
        <ul className="mt-4 divide-y divide-white/5">
          {[
            ['Esthetics by Seneca — booking site polish', '$3,200'],
            ['Hammerhead Pools — inventory module', '$5,800'],
            ['Roper & Co — internal CRM', '$12,400'],
            ['Northbound Coffee — POS integration', '$2,100'],
          ].map(([deal, amt]) => (
            <li key={deal} className="flex items-center justify-between py-3 text-sm">
              <span className="text-[var(--color-ink)]/90">{deal}</span>
              <span className="font-mono text-[var(--color-ink-dim)]">{amt}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/5 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          What you&apos;re seeing
        </p>
        <p className="mt-4 text-[var(--color-ink-dim)]">
          The hero card&apos;s gradient isn&apos;t a static image — it&apos;s a fragment shader
          running on the GPU, reacting to the pointer in real time. Same GPU
          context, same Canvas as every other demo in the lab. Build the system
          first, then add the craft. Both ship together or neither ships at all.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
          Lenis is smoothing this scroll. The shader keeps animating throughout.
        </p>
      </div>
    </div>
  );
}
