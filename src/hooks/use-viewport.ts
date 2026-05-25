'use client';

import { useEffect, useState } from 'react';

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

/** Detect low-power devices to gate expensive demos (per kickoff rule #4). */
export function useIsLowPower(): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const cores = navigator.hardwareConcurrency ?? 4;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    setLow(coarse && cores <= 4);
  }, []);
  return low;
}
