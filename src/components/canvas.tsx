'use client';

import { Canvas } from '@react-three/fiber';
import { Preload, View } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Global R3F Canvas — single GPU context for the entire `/lab` subtree.
 *
 * Pattern adapted from basementstudio/website-2k25:
 *   - one Canvas pinned to the viewport (pointer-events: none)
 *   - demos declare 3D regions with `<DemoView />` (drei `<View>` track wrapper)
 *   - `frameloop="demand"` so idle demos don't burn GPU
 *   - `eventSource` = document.body so pointer events route correctly
 *     across the DOM/WebGL boundary
 *
 * Mounts in `src/app/lab/layout.tsx`. Landing page (`/`) stays pure HTML.
 */
export function GlobalCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setEventSource(document.body);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    >
      {eventSource ? (
        <Canvas
          frameloop="demand"
          eventSource={eventSource}
          eventPrefix="client"
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.NoToneMapping,
          }}
          dpr={[1, 2]}
          camera={{ fov: 50, position: [0, 0, 5] }}
        >
          <View.Port />
          <Preload all />
        </Canvas>
      ) : null}
    </div>
  );
}
