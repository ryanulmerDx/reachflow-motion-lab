'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useIsLowPower } from '@/hooks/use-viewport';

interface LowPowerGateProps {
  /** The demo content. Only rendered when device is capable OR user clicks through. */
  children: ReactNode;
  /** Label for the demo, shown in the fallback. */
  demoTitle: string;
  /** What the user would miss if they don't click through. One short sentence. */
  bypassPreview: string;
}

/**
 * Wraps a WebGL-heavy demo with a low-power escape hatch.
 *
 * Behavior:
 *   - Fails OPEN: capable devices render the demo immediately, no flash.
 *   - On detected low-power, renders a poster card with a "Run anyway" button.
 *   - Once the user clicks through, the gate stays open for that visit.
 *
 * Use on demos that ship custom shaders, particle fields, or physics —
 * not on lightweight DOM demos.
 */
export function LowPowerGate({ children, demoTitle, bypassPreview }: LowPowerGateProps) {
  const isLow = useIsLowPower();
  const [overridden, setOverridden] = useState(false);

  if (!isLow || overridden) return <>{children}</>;

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-dim)]">
        Low-power device detected
      </p>
      <h1 className="mt-4 text-balance text-3xl font-medium leading-[1.1] md:text-5xl">
        {demoTitle} runs on the GPU.
      </h1>
      <p className="mt-4 max-w-md text-[var(--color-ink-dim)] md:text-lg">
        Your device may struggle with the WebGL inside this one. {bypassPreview} Best
        viewed on a laptop or desktop with a dedicated GPU.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em]">
        <button
          type="button"
          onClick={() => setOverridden(true)}
          className="rounded-full border border-[var(--color-accent)] px-6 py-3 text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)] hover:text-black"
        >
          Run anyway
        </button>
        <Link href="/" className="text-[var(--color-ink-dim)] underline-offset-4 hover:underline">
          ← Back to the lab
        </Link>
      </div>
    </main>
  );
}
