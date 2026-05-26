'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Client-side dynamic loader for demo implementations.
 *
 * Lives in a `'use client'` file because Next 15 disallows
 * `dynamic({ ssr: false })` inside Server Components, and every demo
 * uses WebGL (which can't SSR).
 *
 * The Server Component route handler asks `hasDemoImpl(slug)` to
 * decide between placeholder vs implementation, then renders this
 * client wrapper to do the actual code-splitting + load.
 */

type DemoComponent = ComponentType<Record<string, never>>;

const IMPLS: Readonly<Record<string, DemoComponent>> = {
  'booking-flow': dynamic(
    () => import('@/app/lab/_demos/01-booking-flow'),
    { ssr: false }
  ),
  'cursor-aware-crm': dynamic(
    () => import('@/app/lab/_demos/02-cursor-aware-crm'),
    { ssr: false }
  ),
  'shader-dashboard-hero': dynamic(
    () => import('@/app/lab/_demos/03-shader-dashboard-hero'),
    { ssr: false }
  ),
  'portal-transitions': dynamic(
    () => import('@/app/lab/_demos/04-portal-transitions'),
    { ssr: false }
  ),
  'intake-form-warp': dynamic(
    () => import('@/app/lab/_demos/05-intake-form-warp'),
    { ssr: false }
  ),
  'client-logo-marquee': dynamic(
    () => import('@/app/lab/_demos/06-client-logo-marquee'),
    { ssr: false }
  ),
  'fluid-pricing-cursor': dynamic(
    () => import('@/app/lab/_demos/07-fluid-pricing-cursor'),
    { ssr: false }
  ),
  'automation-pipeline': dynamic(
    () => import('@/app/lab/_demos/08-automation-pipeline'),
    { ssr: false }
  ),
  'data-tunnel': dynamic(
    () => import('@/app/lab/_demos/09-data-tunnel'),
    { ssr: false }
  ),
  'inventory-physics': dynamic(
    () => import('@/app/lab/_demos/10-inventory-physics'),
    { ssr: false }
  ),
};

export function DemoImpl({ slug }: { slug: string }) {
  const Component = IMPLS[slug];
  if (!Component) return null;
  return <Component />;
}
