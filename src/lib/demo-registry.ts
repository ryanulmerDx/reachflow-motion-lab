/**
 * Demo registry — single source of truth for the 10 lab systems.
 *
 * Each demo is a *real business system* (booking flow, CRM, intake form,
 * dashboard, automation pipeline, etc.) elevated with the WebGL, shader,
 * and motion craft most agencies never ship. The whole point: prove that
 * the stuff ReachFlow builds for clients can feel alive without sacrificing
 * the speed, accessibility, and reliability that production systems demand.
 *
 * Each demo lives at `/lab/<slug>` and is dynamically imported per route
 * to keep per-page JS under 200KB on first load.
 */

export type DemoStatus = 'placeholder' | 'wip' | 'shipped';
export type DemoTrack = 'react-pro' | 'nextjs-pro' | 'frontend-developer' | 'ui-designer';
export type DemoWave = 2 | 3;

export interface Demo {
  /** URL slug — `/lab/<slug>` */
  slug: string;
  /** Two-digit order prefix used in the `_demos/` folder names */
  ordinal: string;
  /** Display title */
  title: string;
  /** One-line description shown in the demo grid */
  tagline: string;
  /** The real business system this demo represents */
  system: string;
  /** What technique elevates the system */
  technique: string;
  /** Inspiration source/credit */
  inspiration: string;
  /** Which build track owns this demo */
  track: DemoTrack;
  /** Which wave the demo ships in (Wave 2 = demos 1-5, Wave 3 = demos 6-10) */
  wave: DemoWave;
  /** Shipping status */
  status: DemoStatus;
  /** Tags for filtering */
  tags: ReadonlyArray<string>;
}

export const DEMOS: ReadonlyArray<Demo> = [
  {
    slug: 'booking-flow',
    ordinal: '01',
    title: 'Booking Flow',
    tagline: 'A booking experience that earns the appointment instead of begging for it.',
    system: 'Multi-step appointment booking — service, staff, time, confirm',
    technique: 'Lenis smooth scroll + GSAP ScrollTrigger + SplitText staggered reveals',
    inspiration: 'Esthetics by Seneca booking, basementstudio/scrollytelling',
    track: 'react-pro',
    wave: 2,
    status: 'shipped',
    tags: ['booking', 'scroll', 'typography'],
  },
  {
    slug: 'cursor-aware-crm',
    ordinal: '02',
    title: 'Cursor-Aware CRM',
    tagline: 'A CRM that tells you what you can do, before you do it.',
    system: 'Sales pipeline CRM — contact cards, deal stages, charts, drag-drop',
    technique: 'pointer tracking + spring physics + context-aware cursor shapes per element',
    inspiration: 'basement website-2k25',
    track: 'react-pro',
    wave: 2,
    status: 'shipped',
    tags: ['crm', 'cursor', 'interaction'],
  },
  {
    slug: 'shader-dashboard-hero',
    ordinal: '03',
    title: 'Shader Dashboard Hero',
    tagline: 'A dashboard hero card that actually looks like the data is alive.',
    system: 'SaaS analytics dashboard — KPI cards, live metrics, sparklines',
    technique: 'GLSL fragment shader + simplex noise + uniforms driven by live metric values',
    inspiration: 'basementstudio/shader-lab',
    track: 'frontend-developer',
    wave: 2,
    status: 'shipped',
    tags: ['dashboard', 'shader', 'webgl'],
  },
  {
    slug: 'portal-transitions',
    ordinal: '04',
    title: 'Portal Transitions',
    tagline: 'Section-to-section transitions that feel like a product tour, not a website.',
    system: 'SaaS marketing site — landing → features → pricing → contact',
    technique: 'View Transitions API + GSAP fallback + shared element morph',
    inspiration: 'basement website-2k25',
    track: 'nextjs-pro',
    wave: 2,
    status: 'shipped',
    tags: ['transitions', 'routing', 'saas'],
  },
  {
    slug: 'intake-form-warp',
    ordinal: '05',
    title: 'Intake Form Warp',
    tagline: 'Lead intake that doesn’t feel like another Typeform clone.',
    system: 'Multi-step lead intake form with conditional logic and a real submit',
    technique: 'multi-step scrollytelling + scroll-velocity fluid SVG progress indicator',
    inspiration: 'basement-laboratory rgb-text-glitch',
    track: 'react-pro',
    wave: 2,
    status: 'shipped',
    tags: ['intake', 'forms', 'scroll'],
  },
  {
    slug: 'listing-explorer',
    ordinal: '06',
    title: 'Listing Explorer',
    tagline: 'A property search where the map and the listings move as one.',
    system: 'Real-estate listing search — map pins, filters, synced cards',
    technique: 'map ↔ list hover sync + animated filters (framer-motion layout)',
    inspiration: 'Zillow / Redfin map search',
    track: 'react-pro',
    wave: 3,
    status: 'shipped',
    tags: ['real-estate', 'map', 'interaction'],
  },
  {
    slug: 'fluid-pricing-cursor',
    ordinal: '07',
    title: 'Pricing Tiers',
    tagline: 'A pricing page that highlights what your eye is already drawn to.',
    system: 'SaaS pricing page — 3 tiers, comparison rows, primary CTA',
    technique: 'tier-aware hover highlighting synced across cards + comparison table',
    inspiration: 'Linear / Stripe pricing pages',
    track: 'react-pro',
    wave: 3,
    status: 'shipped',
    tags: ['pricing', 'conversion', 'interaction'],
  },
  {
    slug: 'automation-pipeline',
    ordinal: '08',
    title: 'Automation Pipeline',
    tagline: 'Watch your workflow run — particles travel the route your data takes.',
    system: 'n8n-style automation visualization — trigger → enrich → route → notify',
    technique: 'GPU particle field + scroll-driven node-to-node morph + InstancedMesh',
    inspiration: 'basement-laboratory particle-logo + custom',
    track: 'react-pro',
    wave: 3,
    status: 'shipped',
    tags: ['automation', 'particles', 'r3f'],
  },
  {
    slug: 'voice-receptionist',
    ordinal: '09',
    title: 'Voice Receptionist',
    tagline: 'An AI phone agent that answers, understands, and books — live.',
    system: 'AI voice receptionist — live call, transcript, intent, booking',
    technique: 'audio-reactive GLSL waveform + streaming transcript state machine',
    inspiration: 'Retell / Vapi voice agents + basementstudio shader craft',
    track: 'frontend-developer',
    wave: 3,
    status: 'shipped',
    tags: ['voice', 'ai', 'shader'],
  },
  {
    slug: 'field-inventory',
    ordinal: '10',
    title: 'Field Inventory',
    tagline: 'Trailer stock a foreman can actually run — scan, log, reorder.',
    system: 'Forestry field inventory — trailer stock, thresholds, scan-to-log',
    technique: 'reactive store + derived stock status + scan-to-log + count-up motion',
    inspiration: 'Suarez Forestry inventory (inventory_items + adjust RPC)',
    track: 'react-pro',
    wave: 3,
    status: 'shipped',
    tags: ['inventory', 'field-service', 'interaction'],
  },
] as const;

export function findDemo(slug: string): Demo | undefined {
  return DEMOS.find((demo) => demo.slug === slug);
}

export const DEMO_SLUGS: ReadonlyArray<string> = DEMOS.map((d) => d.slug);
