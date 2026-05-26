'use client';

/**
 * Demo 08 — automation-pipeline
 *
 * n8n-style automation visualization: trigger → enrich → score → route.
 * GPU particles (InstancedMesh, ~360 instances) flow along CatmullRomCurve3
 * edges. At the Score node particles fork: 70 % to Slack (cyan), 30 % to
 * Drip (amber). Node halos pulse on particle arrival.
 *
 * Scroll velocity modulates particle speed via the same ref-sharing pattern
 * as demo-05, but applied inside the R3F scene instead of a shader uniform.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import Link from 'next/link';
import { DemoView } from '@/components/demo-view';
import { findDemo } from '@/lib/demo-registry';
import { NodeGraph } from './nodes';
import { Particles } from './particles';
import { WorkflowPanel } from './panel';

const demo = findDemo('automation-pipeline')!;

// ─── Root component ───────────────────────────────────────────────────────────

export default function AutomationPipeline() {
  // Scroll velocity — shared between the DOM scroll listener and the R3F scene
  const rawVelRef = useRef(0);
  const smoothVelRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  // Per-node last-hit timestamps (clock.elapsedTime) — written by particle
  // arrivals in the R3F loop, read by node halos and the panel row highlighter
  const hitTimesRef = useRef<Record<string, number>>({});

  // Velocity tracking loop (mirrors demo-05 pattern)
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

  // Called by the particle system each time a particle reaches a node.
  // Stores wall-clock seconds (performance.now()/1000) so both the node
  // halo (nodes.tsx) and the panel row highlighter (panel.tsx) can read
  // a consistent time base without needing clock.elapsedTime.
  const handleNodeHit = useCallback((nodeId: string) => {
    hitTimesRef.current[nodeId] = performance.now() / 1000;
  }, []);

  return (
    <main className="relative min-h-dvh px-6 pb-32 pt-28 md:px-12">
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

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <section className="mx-auto mt-12 max-w-6xl">
        {/* Two-column layout: canvas left, panel right (stacked on mobile) */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* ── Workflow canvas ─────────────────────────────────────────── */}
          <div className="flex-1">
            {/* Node labels overlay (HTML — rendered above the canvas) */}
            <NodeLabelsOverlay />

            {/* R3F DemoView region */}
            <div className="relative h-[50vh] min-h-[320px] overflow-hidden rounded-2xl border border-white/5">
              <DemoView className="absolute inset-0 h-full w-full">
                <WorkflowScene
                  velocityRef={smoothVelRef}
                  hitTimesRef={hitTimesRef}
                  onNodeHit={handleNodeHit}
                />
              </DemoView>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-6">
              <LegendItem color="#67e8f9" label="Hot lead → Slack #sales" />
              <LegendItem color="#fde68a" label="Warm lead → Drip sequence" />
            </div>
          </div>

          {/* ── Description panel ───────────────────────────────────────── */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
            <WorkflowPanel hitTimesRef={hitTimesRef} />
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mx-auto mt-24 max-w-6xl border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        <p>
          Demo 08 · GPU particles routing through a real workflow graph.{' '}
          <Link href="/" className="text-[var(--color-accent)] underline-offset-4 hover:underline">
            ← Back to the lab
          </Link>
        </p>
      </footer>
    </main>
  );
}

// ─── WorkflowScene ────────────────────────────────────────────────────────────

/**
 * R3F scene: camera + nodes + particles.
 *
 * Camera drifts slightly on scroll (z parallax) to add depth without
 * breaking the orthographic legibility of the node layout.
 */

interface WorkflowSceneProps {
  velocityRef: React.RefObject<number>;
  hitTimesRef: React.RefObject<Record<string, number>>;
  onNodeHit: (nodeId: string) => void;
}

function WorkflowScene({ velocityRef, hitTimesRef, onNodeHit }: WorkflowSceneProps) {
  return (
    <>
      <CameraRig velocityRef={velocityRef} />
      <NodeGraph hitTimesRef={hitTimesRef} />
      <Particles velocityRef={velocityRef} onNodeHit={onNodeHit} />
      {/* Ambient fill so dark geometry is visible */}
      <ambientLight intensity={0.15} />
    </>
  );
}

// ─── CameraRig ────────────────────────────────────────────────────────────────

function CameraRig({ velocityRef }: { velocityRef: React.RefObject<number> }) {
  const { camera } = useThree();

  useFrame(() => {
    const vel = velocityRef.current ?? 0;
    // Gentle z-drift on scroll: pulls camera slightly back when scrolling fast
    const targetZ = 5.5 + Math.abs(vel) * 0.8;
    camera.position.z += (targetZ - camera.position.z) * 0.06;
    // Slight y-tilt
    camera.position.y += (vel * -0.12 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={50} />;
}

// ─── NodeLabelsOverlay ────────────────────────────────────────────────────────

/**
 * Pure HTML label layer that sits above the canvas.
 * Positions are manually tuned to match the 3D world-space layout.
 * On desktop the canvas spans roughly 700px wide.
 */
function NodeLabelsOverlay() {
  // Labels for the first three (linear) nodes only.
  // Slack and Drip are forks — their HTML labels appear in the legend below.
  const labels = [
    { id: 'trigger', label: 'Webform', sub: 'Trigger', x: '8%', color: '#67e8f9' },
    { id: 'enrich', label: 'Clearbit', sub: 'Enrich', x: '31%', color: '#a78bfa' },
    { id: 'score', label: 'Lead Score', sub: 'Route', x: '54%', color: '#34d399' },
    { id: 'slack', label: 'Slack #sales', sub: 'Hot', x: '80%', color: '#67e8f9' },
    { id: 'drip', label: 'Drip Email', sub: 'Warm', x: '93%', color: '#fde68a' },
  ];

  return (
    <div className="relative h-8 mb-1 pointer-events-none select-none">
      {labels.map(({ id, label, sub, x, color }) => (
        <div
          key={id}
          className="absolute flex flex-col items-center"
          style={{ left: x, transform: 'translateX(-50%)' }}
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.18em]" style={{ color }}>
            {sub}
          </span>
          <span className="text-[10px] text-white/60 whitespace-nowrap">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── LegendItem ──────────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-1.5 w-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
        {label}
      </span>
    </div>
  );
}
