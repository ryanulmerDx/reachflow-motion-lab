'use client';

import { useEffect, useRef } from 'react';

type MouseRef = { x: number; y: number; nx: number; ny: number };

/**
 * Imperative-only mouse hook — returns a ref to avoid re-rendering on every
 * pointer move. Read `ref.current` inside `useFrame` or a RAF loop.
 *
 * `nx` / `ny` are normalized to [-1, 1] with origin at viewport center.
 */
export function useMouse(): React.RefObject<MouseRef> {
  const ref = useRef<MouseRef>({ x: 0, y: 0, nx: 0, ny: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: PointerEvent) => {
      ref.current.x = e.clientX;
      ref.current.y = e.clientY;
      ref.current.nx = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.ny = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return ref;
}
