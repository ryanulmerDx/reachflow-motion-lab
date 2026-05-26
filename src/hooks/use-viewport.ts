'use client';

import { useEffect, useState } from 'react';
import { getGPUTier } from 'detect-gpu';

/** Returns `true` when the viewport matches the given media query. SSR-safe. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export type PowerState = 'unknown' | 'capable' | 'low';

/**
 * Detect low-power devices to gate expensive WebGL demos.
 *
 * Fails OPEN: returns 'unknown' on first paint, then resolves to 'capable'
 * or 'low' after detect-gpu finishes its WebGL benchmark. Heavy demos that
 * want to show a fallback should check `state === 'low'`, not `!== 'capable'`.
 *
 * Low-power triggers:
 *   - detect-gpu tier 0 (blacklisted GPU — software rendering, etc.)
 *   - detect-gpu tier 1 on mobile (integrated mobile GPU, old phone)
 *   - prefers-reduced-motion (user explicitly opted out of motion)
 *   - hardwareConcurrency ≤ 2 (very old or constrained device)
 */
export function usePowerState(): PowerState {
  const [state, setState] = useState<PowerState>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cores = navigator.hardwareConcurrency ?? 4;

    if (reducedMotion || cores <= 2) {
      setState('low');
      return;
    }

    getGPUTier()
      .then((tier) => {
        if (cancelled) return;
        const isLow = tier.tier === 0 || (tier.isMobile && tier.tier <= 1);
        setState(isLow ? 'low' : 'capable');
      })
      .catch(() => {
        // detect-gpu failed (no WebGL? blocked context?) — treat as low
        if (!cancelled) setState('low');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * Boolean shorthand: true only after detect-gpu has resolved AND flagged low.
 * Returns false on first paint so the demo renders by default.
 */
export function useIsLowPower(): boolean {
  return usePowerState() === 'low';
}
