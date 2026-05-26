'use client';

/**
 * panel.tsx — Plain-English workflow description panel.
 *
 * Renders a card with:
 *   - A prose explanation of the full automation flow
 *   - Per-node detail rows that light up based on recent particle hits
 *   - A stats row at the bottom with animating counters
 *
 * Node highlight state is driven by hitTimesRef (no React re-renders) via
 * a lightweight requestAnimationFrame loop so the panel stays responsive
 * without polluting R3F's render loop.
 */

import { useRef, useEffect, useState } from 'react';
import { NODES } from './graph';

// ─── Node detail copy ─────────────────────────────────────────────────────────

const NODE_COPY: Record<string, { emoji: string; copy: string }> = {
  trigger: {
    emoji: '⬢',
    copy: 'A visitor completes your webform. The submission fires an instant webhook into the pipeline — no manual handling, no delay.',
  },
  enrich: {
    emoji: '⬢',
    copy: 'We call Clearbit in real time to append company size, industry, ARR range, and tech stack to the raw lead record.',
  },
  score: {
    emoji: '⬢',
    copy: 'A scoring model weighs firmographic fit + intent signals. Leads above threshold (≥ 70) route hot; the rest enter nurture.',
  },
  slack: {
    emoji: '⬢',
    copy: 'Hot leads post to #sales instantly with a full context card — name, company, score, and one-click CRM link.',
  },
  drip: {
    emoji: '⬢',
    copy: 'Warm leads enroll in a five-touch email sequence. Replies or clicks escalate them back to the hot path automatically.',
  },
};

// ─── Animating counter hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatBlock({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const animated = useAnimatedCounter(value, 2200);
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        {label}
      </span>
      <span className="text-3xl font-medium tabular-nums">
        {animated.toLocaleString()}
        {suffix}
      </span>
    </div>
  );
}

// ─── Node row ─────────────────────────────────────────────────────────────────

interface NodeRowProps {
  nodeId: string;
  hitTimesRef: React.RefObject<Record<string, number>>;
}

function NodeRow({ nodeId, hitTimesRef }: NodeRowProps) {
  const node = NODES.find((n) => n.id === nodeId)!;
  const copy = NODE_COPY[nodeId]!;
  const rowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastHit = 0;

    const tick = () => {
      const hitTimes = hitTimesRef.current;
      const hit = hitTimes?.[nodeId] ?? 0;
      if (hit !== lastHit) {
        lastHit = hit;
        if (rowRef.current) {
          rowRef.current.style.borderColor = node.color;
          rowRef.current.style.opacity = '1';
        }
      } else {
        // Decay opacity
        if (rowRef.current) {
          const current = parseFloat(rowRef.current.style.opacity || '0.5');
          const next = current + (0.5 - current) * 0.04;
          rowRef.current.style.opacity = String(next);
          // Decay border color back
          const age = (performance.now() / 1000) - lastHit;
          if (age > 0.6 && rowRef.current) {
            rowRef.current.style.borderColor = 'rgba(255,255,255,0.06)';
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nodeId, node.color, hitTimesRef]);

  return (
    <div
      ref={rowRef}
      className="rounded-xl border border-white/[0.06] p-4 transition-colors"
      style={{ opacity: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: node.color }}
        >
          {node.sub}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-dim)]">
          ·
        </span>
        <span className="text-sm font-medium">{node.label}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-dim)]">{copy.copy}</p>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface PanelProps {
  hitTimesRef: React.RefObject<Record<string, number>>;
}

export function WorkflowPanel({ hitTimesRef }: PanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Prose overview */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-accent)]">
          How it works
        </p>
        <p className="mt-3 text-[var(--color-ink-dim)] leading-relaxed">
          Every time someone submits a form, we enrich their record with firmographic
          data, score the lead against your ICP, and route hot leads directly to Slack
          while warm leads enter a targeted drip sequence. The whole pipeline runs in
          under two seconds — no manual triage required.
        </p>
        <p className="mt-3 text-[var(--color-ink-dim)] leading-relaxed text-sm">
          Particles represent individual lead events. Cyan tracks high-score leads
          headed to #sales. Amber tracks warm leads entering nurture. Watch the fork
          at the Score node — 70&nbsp;% go hot, 30&nbsp;% go warm.
        </p>
      </div>

      {/* Per-node detail */}
      <div className="flex flex-col gap-3">
        {NODES.map((node) => (
          <NodeRow key={node.id} nodeId={node.id} hitTimesRef={hitTimesRef} />
        ))}
      </div>

      {/* Stats */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
          This week
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <StatBlock label="Leads processed" value={1847} />
          <StatBlock label="Avg latency" value={1} suffix="s" />
          <StatBlock label="Hot → Closed" value={23} suffix="%" />
        </div>
      </div>
    </div>
  );
}
