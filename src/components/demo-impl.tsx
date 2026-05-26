'use client';

import dynamic from 'next/dynamic';
import { useEffect, type ComponentType } from 'react';
import * as Sentry from '@sentry/nextjs';
import { LowPowerGate } from '@/components/low-power-gate';
import { findDemo } from '@/lib/demo-registry';

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

/**
 * Demos that run custom shaders, particle fields, or physics simulations.
 * These get wrapped in a `<LowPowerGate>` so devices flagged by detect-gpu
 * see a poster + "Run anyway" escape hatch instead of choking on the GPU.
 *
 * Light demos (booking flow, CRM, portal transitions, marquee, intake)
 * render directly — they use DOM, GSAP, and occasional small WebGL views
 * that any device can handle.
 */
const GATED_SLUGS = new Set([
  'fluid-pricing-cursor',
  'automation-pipeline',
  'data-tunnel',
  'inventory-physics',
]);

const BYPASS_COPY: Record<string, string> = {
  'fluid-pricing-cursor':
    'A WebGL pheromone trail follows your cursor across the pricing tiers.',
  'automation-pipeline':
    'Hundreds of GPU-instanced particles flow through a workflow graph.',
  'data-tunnel': 'A ray-marched SDF tunnel renders behind a scrolling case study.',
  'inventory-physics':
    'Rapier rigid bodies let you drag, fling, and watch cards settle.',
};

/**
 * Tags every Sentry event captured while this demo is mounted with the
 * demo slug. So when an error fires in production we know exactly which
 * one — no log-spelunking required.
 */
function useSentryDemoTag(slug: string) {
  useEffect(() => {
    Sentry.setTag('demo', slug);
    return () => {
      Sentry.setTag('demo', undefined);
    };
  }, [slug]);
}

export function DemoImpl({ slug }: { slug: string }) {
  useSentryDemoTag(slug);

  const Component = IMPLS[slug];
  if (!Component) return null;
  if (!GATED_SLUGS.has(slug)) return <Component />;

  const demo = findDemo(slug);
  const title = demo?.title ?? 'This demo';
  const preview = BYPASS_COPY[slug] ?? '';

  return (
    <LowPowerGate demoTitle={title} bypassPreview={preview}>
      <Component />
    </LowPowerGate>
  );
}
