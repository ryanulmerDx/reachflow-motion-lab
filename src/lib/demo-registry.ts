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
    technique: 'scroll-velocity uniform warping header text + fluid SVG progress indicator',
    inspiration: 'basement-laboratory rgb-text-glitch',
    track: 'react-pro',
    wave: 2,
    status: 'shipped',
    tags: ['intake', 'forms', 'shader'],
  },
  {
    slug: 'client-logo-marquee',
    ordinal: '06',
    title: 'Client Logo Marquee',
    tagline: 'Social proof that pulls your eye instead of begging for it.',
    system: 'Agency social-proof strip — client logos, case-study hover affordances',
    technique: 'CSS 3D transform + GSAP scroll-linked velocity + perspective skew',
    inspiration: 'basement website-2k25 brand-marquee',
    track: 'react-pro',
    wave: 3,
    status: 'shipped',
    tags: ['marquee', 'social-proof', 'scroll'],
  },
  {
    slug: 'fluid-pricing-cursor',
    ordinal: '07',
    title: 'Fluid Pricing Cursor',
    tagline: 'A pricing page that highlights what your eye is already drawn to.',
    system: 'SaaS pricing page — 3 tiers, comparison rows, primary CTA',
    technique: 'Navier-Stokes WebGL fluid sim + ping-pong FBO chasing the pointer',
    inspiration: 'PavelDoGreat WebGL-Fluid-Simulation',
    track: 'frontend-developer',
    wave: 3,
    status: 'shipped',
    tags: ['pricing', 'shader', 'simulation'],
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
    slug: 'inventory-physics',
    ordinal: '10',
    title: 'Inventory Physics',
    tagline: 'Drag, fling, and recategorize — inventory that actually feels good to use.',
    system: 'Field-service inventory tool — drag-drop cards, status piles, undo',
    technique: 'rapier rigid bodies + drag constraints + DOM-rendered cards',
    inspiration: 'Beecroft Pools inventory + pmndrs/react-rapier examples',
    track: 'react-pro',
    wave: 3,
    status: 'shipped',
    tags: ['inventory', 'physics', 'interaction'],
  },
] as const;

export function findDemo(slug: string): Demo | undefined {
  return DEMOS.find((demo) => demo.slug === slug);
}

export const DEMO_SLUGS: ReadonlyArray<string> = DEMOS.map((d) => d.slug);
