'use client';

import dynamic from 'next/dynamic';

/**
 * Client wrapper that lets us pass `ssr: false` to `next/dynamic`.
 *
 * Next 15 disallows `ssr: false` inside Server Components, so the
 * Server-Component `LabLayout` imports this thin client shim instead
 * of calling `dynamic()` directly. Keeps three.js out of the server
 * bundle entirely.
 */
const GlobalCanvas = dynamic(
  () => import('@/components/canvas').then((m) => m.GlobalCanvas),
  { ssr: false }
);

export function GlobalCanvasMount() {
  return <GlobalCanvas />;
}
