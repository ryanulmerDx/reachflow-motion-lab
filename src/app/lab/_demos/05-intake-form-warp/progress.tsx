'use client';

import { useEffect, useRef } from 'react';

interface FluidProgressProps {
  /** 0-based step index */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Smoothed scroll velocity ref — mutated externally each rAF */
  velocityRef: React.RefObject<number>;
  stepLabels: ReadonlyArray<string>;
}

/**
 * Fluid SVG progress indicator — a vertical Bezier path whose control points
 * wobble with scroll velocity. A dot travels along the path proportional to
 * the user's scroll position. Labels at each milestone.
 */
export function FluidProgress({
  currentStep,
  totalSteps,
  velocityRef,
  stepLabels,
}: FluidProgressProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number>(0);

  // Progress fraction from the current step (0 → 1)
  const progressRef = useRef(currentStep / (totalSteps - 1));

  useEffect(() => {
    progressRef.current = currentStep / (totalSteps - 1);
  }, [currentStep, totalSteps]);

  useEffect(() => {
    const SVG_H = 400;
    const SVG_W = 28;
    const PADDING = 20;

    const tick = () => {
      const vel = velocityRef.current ?? 0;
      const path = pathRef.current;
      const dot = dotRef.current;
      const glow = glowRef.current;

      if (path) {
        // Control-point wobble — velocity skews the midpoint laterally
        const wobble = vel * 18;
        const x0 = SVG_W / 2;
        const y0 = PADDING;
        const y1 = SVG_H - PADDING;
        const cx = SVG_W / 2 + wobble;
        const cy = SVG_H / 2;

        path.setAttribute('d', `M ${x0} ${y0} Q ${cx} ${cy} ${x0} ${y1}`);
      }

      if (dot && glow && path) {
        const totalLen = path.getTotalLength();
        const t = Math.max(0, Math.min(1, progressRef.current));
        const pt = path.getPointAtLength(t * totalLen);

        dot.setAttribute('cx', String(pt.x));
        dot.setAttribute('cy', String(pt.y));
        glow.setAttribute('cx', String(pt.x));
        glow.setAttribute('cy', String(pt.y));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [velocityRef]);

  const SVG_H = 400;
  const SVG_W = 28;
  const PADDING = 20;
  const usable = SVG_H - PADDING * 2;

  return (
    <div
      className="fixed left-4 top-1/2 z-30 -translate-y-1/2 hidden md:flex md:flex-col md:items-center"
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        fill="none"
        overflow="visible"
      >
        {/* Glow filter */}
        <defs>
          <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.4  0 0 0 0 0.9  0 0 0 0 0.97  0 0 0 1 0"
            />
          </filter>
        </defs>

        {/* Track line — dim */}
        <path
          ref={pathRef}
          d={`M ${SVG_W / 2} ${PADDING} Q ${SVG_W / 2} ${SVG_H / 2} ${SVG_W / 2} ${SVG_H - PADDING}`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Milestone dots */}
        {Array.from({ length: totalSteps }, (_, i) => {
          const y = PADDING + (i / (totalSteps - 1)) * usable;
          const active = i <= currentStep;
          return (
            <circle
              key={i}
              cx={SVG_W / 2}
              cy={y}
              r={active ? 3.5 : 2.5}
              fill={active ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)'}
            />
          );
        })}

        {/* Glow halo behind dot */}
        <circle
          ref={glowRef}
          cx={SVG_W / 2}
          cy={PADDING}
          r="8"
          fill="var(--color-accent)"
          opacity="0.25"
          filter="url(#dot-glow)"
        />

        {/* Traveling dot */}
        <circle
          ref={dotRef}
          cx={SVG_W / 2}
          cy={PADDING}
          r="5"
          fill="var(--color-accent)"
        />
      </svg>

      {/* Step labels stacked next to milestones */}
      <div
        className="absolute left-8 top-0 flex flex-col justify-between"
        style={{ height: SVG_H, paddingTop: PADDING, paddingBottom: PADDING }}
      >
        {stepLabels.map((label, i) => (
          <span
            key={label}
            className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
              i === currentStep
                ? 'text-[var(--color-accent)]'
                : i < currentStep
                  ? 'text-[var(--color-ink-dim)]/60'
                  : 'text-[var(--color-ink-dim)]/30'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
