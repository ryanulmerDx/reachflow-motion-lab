'use client';

/**
 * LenisProvider — single Lenis instance for the whole app.
 *
 * Wave 1 will:
 *  - sync Lenis raf with the global R3F `<Canvas>` via `useFrame`
 *  - expose scroll progress via React context for demo pages
 *  - respect `prefers-reduced-motion`
 */

import { useEffect } from 'react';
import Lenis from 'lenis';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
