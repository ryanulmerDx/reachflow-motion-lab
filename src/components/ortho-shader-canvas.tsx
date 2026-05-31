'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Shared full-bleed orthographic shader Canvas for the landing stages
 * (hero + theater). Both stages render a single NDC-locked [2,2] quad with
 * a fragment shader, so they share one wrapper.
 *
 * Why this exists — mobile TBT:
 *   Two always-on R3F render loops (hero + theater) running full-screen
 *   simplex-noise shaders at dpr 2 lock the main thread under Lighthouse's
 *   throttled mobile CPU (~35s Total Blocking Time). Desktop is fine.
 *
 * Strategy:
 *   - phone / prefers-reduced-motion → `static`: render ONE frame on mount
 *     (frameloop="demand", dpr 1), then never tick. Shader still shows, but
 *     there is no ongoing main-thread work, so TBT collapses.
 *   - capable desktop → `animate`: full loop, but paused via Intersection
 *     Observer whenever the stage scrolls out of view (frameloop "never").
 *
 * `static` is also the SSR / first-paint default so we never start a loop
 * before knowing the device class.
 */

type StageMode = 'static' | 'animate';

function detectMode(): StageMode {
  if (typeof window === 'undefined') return 'static';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone =
    window.matchMedia('(pointer: coarse)').matches &&
    window.matchMedia('(max-width: 1024px)').matches;
  return reduced || phone ? 'static' : 'animate';
}

export function OrthoShaderCanvas({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<StageMode>('static');
  const [inView, setInView] = useState(true);

  useEffect(() => {
    setMode(detectMode());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const frameloop = mode === 'static' ? 'demand' : inView ? 'always' : 'never';

  return (
    <div ref={wrapRef} className="h-full w-full">
      <Canvas
        orthographic
        frameloop={frameloop}
        camera={{ position: [0, 0, 1], near: 0, far: 2, zoom: 1 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        dpr={mode === 'static' ? 1 : [1, 2]}
      >
        {children}
      </Canvas>
    </div>
  );
}
