/**
 * Demo implementation registry.
 *
 * Returns true for slugs that have a real implementation; the
 * `<DemoImpl />` client wrapper handles the actual dynamic import.
 *
 * Why a flag set instead of `dynamic()` calls here:
 * Next 15 forbids `next/dynamic` with `ssr: false` in any file
 * imported by a Server Component. The route handler is a Server
 * Component, so we expose a plain string set here and keep the
 * `dynamic()` calls inside `src/components/demo-impl.tsx` which
 * is `'use client'`.
 *
 * To ship a new demo:
 *   1. Build `src/app/lab/_demos/<NN-slug>/index.tsx`
 *   2. Add the slug to IMPLEMENTED_SLUGS
 *   3. Add the slug → dynamic component mapping in `demo-impl.tsx`
 *   4. Update its `status` in `demo-registry.ts` to 'wip' or 'shipped'
 */

export const IMPLEMENTED_SLUGS = new Set<string>([
  'booking-flow',
  'cursor-aware-crm',
  'shader-dashboard-hero',
  'portal-transitions',
  'intake-form-warp',
  'client-logo-marquee',
]);

export function hasDemoImpl(slug: string): boolean {
  return IMPLEMENTED_SLUGS.has(slug);
}
