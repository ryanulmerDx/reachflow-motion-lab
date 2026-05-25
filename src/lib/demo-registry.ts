/**
 * Demo registry — single source of truth for the 10 lab demos.
 *
 * Each demo lives at `/lab/<slug>` and is dynamically imported per route
 * to keep the per-page JS budget under 200KB on first load.
 *
 * The landing page reads from this registry to build the demo grid.
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
  /** What technique this demo teaches */
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
    slug: 'lenis-text-reveal',
    ordinal: '01',
    title: 'Lenis Text Reveal',
    tagline: 'Smooth scroll meets staggered text reveal.',
    technique: 'Lenis + GSAP ScrollTrigger + SplitText stagger',
    inspiration: 'basementstudio/scrollytelling',
    track: 'react-pro',
    wave: 2,
    status: 'placeholder',
    tags: ['scroll', 'typography', 'gsap'],
  },
  {
    slug: 'cursor-morph',
    ordinal: '02',
    title: 'Cursor Morph',
    tagline: 'A custom cursor that morphs on hoverable elements.',
    technique: 'pointer tracking + spring physics + context-aware shape',
    inspiration: 'basement website-2k25',
    track: 'react-pro',
    wave: 2,
    status: 'placeholder',
    tags: ['cursor', 'interaction', 'spring'],
  },
  {
    slug: 'shader-noise-hero',
    ordinal: '03',
    title: 'Shader Noise Hero',
    tagline: 'Fragment-shader gradient hero, mouse-reactive noise.',
    technique: 'GLSL fragment shader + simplex noise + uMouse uniform',
    inspiration: 'basementstudio/shader-lab',
    track: 'frontend-developer',
    wave: 2,
    status: 'placeholder',
    tags: ['shader', 'webgl', 'hero'],
  },
  {
    slug: 'page-transitions',
    ordinal: '04',
    title: 'Page Transitions',
    tagline: 'Cinematic route transitions, View Transitions API first.',
    technique: 'View Transitions API + GSAP fallback + shared element morph',
    inspiration: 'basement website-2k25',
    track: 'nextjs-pro',
    wave: 2,
    status: 'placeholder',
    tags: ['transitions', 'routing', 'view-transitions'],
  },
  {
    slug: 'scroll-distort-text',
    ordinal: '05',
    title: 'Scroll Distort Text',
    tagline: 'Display text warps under scroll velocity.',
    technique: 'scroll velocity uniform → vertex shader warp on text mesh',
    inspiration: 'basement-laboratory rgb-text-glitch',
    track: 'react-pro',
    wave: 2,
    status: 'placeholder',
    tags: ['scroll', 'shader', 'typography'],
  },
  {
    slug: '3d-marquee',
    ordinal: '06',
    title: '3D Marquee',
    tagline: 'Infinite logo strip, perspective-skewed, scroll-tied.',
    technique: 'CSS 3D transform + GSAP scroll-linked velocity',
    inspiration: 'basement website-2k25 brand-marquee',
    track: 'react-pro',
    wave: 3,
    status: 'placeholder',
    tags: ['marquee', '3d', 'scroll'],
  },
  {
    slug: 'fluid-cursor',
    ordinal: '07',
    title: 'Fluid Cursor',
    tagline: 'WebGL fluid sim chasing the pointer.',
    technique: 'Navier-Stokes fragment shader + ping-pong FBO',
    inspiration: 'PavelDoGreat WebGL-Fluid-Simulation',
    track: 'frontend-developer',
    wave: 3,
    status: 'placeholder',
    tags: ['shader', 'simulation', 'cursor'],
  },
  {
    slug: 'particle-logo',
    ordinal: '08',
    title: 'Particle Logo',
    tagline: 'Particles resolve into the ReachFlow wordmark on scroll.',
    technique: 'GPU particle field + scroll-driven target morph + InstancedMesh',
    inspiration: 'basement-laboratory particle-logo + custom',
    track: 'react-pro',
    wave: 3,
    status: 'placeholder',
    tags: ['particles', 'r3f', 'scroll'],
  },
  {
    slug: 'glsl-tunnel',
    ordinal: '09',
    title: 'GLSL Tunnel',
    tagline: 'Pure ray-marched tunnel, scroll controls the camera.',
    technique: 'full-screen quad + ray-marched SDF tunnel + scroll uTime',
    inspiration: 'Shadertoy / kishimisu Pi-tunnel',
    track: 'frontend-developer',
    wave: 3,
    status: 'placeholder',
    tags: ['shader', 'raymarch', 'glsl'],
  },
  {
    slug: 'physics-cards',
    ordinal: '10',
    title: 'Physics Cards',
    tagline: 'Project cards you can drag, fling, and watch settle.',
    technique: 'rapier rigid bodies + drag constraints + DOM-rendered cards',
    inspiration: 'pmndrs/react-rapier examples',
    track: 'react-pro',
    wave: 3,
    status: 'placeholder',
    tags: ['physics', 'interaction', 'rapier'],
  },
] as const;

export function findDemo(slug: string): Demo | undefined {
  return DEMOS.find((demo) => demo.slug === slug);
}

export const DEMO_SLUGS: ReadonlyArray<string> = DEMOS.map((d) => d.slug);
