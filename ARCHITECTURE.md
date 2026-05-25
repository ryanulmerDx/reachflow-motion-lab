# ARCHITECTURE — reachflow-motion-lab

> System-level decisions for the lab. Read alongside `LEARNINGS.md` (recon source) and `ROADMAP.md` (sequenced work).

Last updated: 2026-05-25.

## Goals

1. **Standalone demos.** Each `/lab/<slug>` is independently buildable, runnable, and shippable. No demo can break another.
2. **Per-route ≤ 200KB JS** on first load. Hard budget. Enforced by Lighthouse CI.
3. **Single GPU context.** One global `<Canvas>` shared across demos that need WebGL — eliminates compositor thrash on route transitions.
4. **Mobile graceful degrade.** Low-power devices receive a static poster + "Tap for desktop" affordance.
5. **MIT open source.** Code is the marketing. Every file readable by anyone.

## High-level layout

```
src/
├─ app/                            # Next 15 App Router
│  ├─ layout.tsx                   # Root — fonts, metadata, viewport
│  ├─ page.tsx                     # Landing — reads DEMOS registry
│  ├─ globals.css                  # Tailwind 4 + @theme tokens
│  ├─ api/health/route.ts          # Edge health probe
│  └─ lab/
│     ├─ layout.tsx                # Per-demo chrome (nav + view source link)
│     ├─ [slug]/page.tsx           # Dynamic loader; reads registry; SSG'd
│     └─ _demos/<NN-slug>/         # Per-demo implementation (not routable)
├─ components/                     # Shared building blocks
│  ├─ lenis-provider.tsx           # Lenis singleton + RAF
│  ├─ canvas.tsx                   # Global R3F Canvas (Wave 1)
│  ├─ cursor.tsx                   # Spring cursor (Wave 1 / Wave 2 demo #02)
│  └─ ui/                          # Buttons, link primitives
├─ hooks/
│  ├─ use-mouse.ts                 # ref-based pointer (no rerenders)
│  └─ use-viewport.ts              # media-query + low-power detection
├─ lib/
│  ├─ demo-registry.ts             # Source of truth for the 10 demos
│  ├─ site.ts                      # Marketing copy constants
│  ├─ utils.ts                     # cn, clamp, lerp, map
│  └─ gsap.ts                      # GSAP singleton + plugin registration
├─ shaders/
│  ├─ noise.glsl                   # Placeholder; Wave 1 ports shader-lab chunks
│  └─ lib/                         # Reusable GLSL chunks
└─ types/
   └─ glsl.d.ts                    # `*.glsl` → string typing
```

## Rendering strategy

- **All public routes are statically generated (SSG)** via `generateStaticParams`. No need for SSR — every demo is fully client-side once mounted.
- **Demo implementations are client components** (`'use client'`). The route page is a server component that imports + renders the client demo.
- **`/api/health`** runs on the Edge runtime (fast probe for uptime monitors).
- **No streaming or Suspense boundaries in Wave 0.** Wave 1 introduces `<Suspense>` around dynamically imported demo bodies so the route shell loads instantly while WebGL spins up.

## Code splitting

- Each demo's implementation lives in `src/app/lab/_demos/<NN-slug>/index.tsx` and is **dynamically imported** by `[slug]/page.tsx` via `next/dynamic` (Wave 1).
- Per-demo dependencies (e.g. `@react-three/rapier` for `physics-cards`) are tree-shaken into the demo's chunk only.
- `optimizePackageImports: ['three', '@react-three/drei', 'gsap', 'lenis']` is set in `next.config.mjs` so barrel imports don't pull the whole library.

**Bundle gates:**

| Surface | Budget | Source of truth |
| --- | --- | --- |
| Shared root chunks | 102 KB (today) | `next build` route table |
| Any `/lab/<slug>` first load | ≤ 200 KB | Lighthouse CI assertion |
| Any single shader file | ≤ 8 KB | linter (Wave 1) |

## Lenis + R3F integration

The brief mandates "Lenis everywhere." Wave 1 wires it like this:

```
LenisProvider (mounts <html>-scoped Lenis, RAF loop)
   ↓ sets a global scroll value
GlobalCanvas (R3F)
   ↓ useFrame reads scroll, updates per-demo uniforms
Demo components
   ↓ subscribe to scroll via context if needed
GSAP ScrollTrigger
   ↓ updated via Lenis raf in same tick (avoid double-RAF)
```

Key decisions:

- **One Lenis instance**, created in `LenisProvider`, destroyed on unmount. Respects `prefers-reduced-motion`.
- **GSAP ScrollTrigger is driven by Lenis** (`lenis.on('scroll', ScrollTrigger.update)`) so both stay in sync. No double-RAF.
- **R3F `useFrame` reads from a Zustand store, not from Lenis directly** — keeps R3F decoupled from scroll lib.
- **`@bsmnt/scrollytelling`** is used for the *tunnel* pattern only (render-to-portal) — its scroll provider sits alongside Lenis, not on top of it.

## Global Canvas pattern

Borrowed from `website-2k25`. Single fixed-position Canvas covers the viewport. Demos either:

1. **Render into the global canvas** via `<View>` from `@react-three/drei` — best for demos that need to coexist with DOM (3, 5, 8).
2. **Mount their own scene root inside the global canvas** — best for full-viewport demos (7, 9).
3. **Skip the canvas entirely** for pure CSS/DOM demos (1, 2, 4, 6, 10 except physics raycast).

Canvas defaults:

```ts
<Canvas
  frameloop="demand"      // pause when nothing is moving
  dpr={[1, 1.5]}          // cap retina to avoid GPU melt
  gl={{ antialias: false, powerPreference: 'high-performance' }}
  shadows={false}         // demos opt in if needed
/>
```

`<Canvas>` is rendered conditionally (`useIsLowPower() ? null : <Canvas/>`) so we never ship WebGL to coarse-pointer / low-core devices.

## Shader pipeline

- `.glsl|.vs|.fs|.vert|.frag` files are imported as **plain strings** via webpack's built-in `type: 'asset/source'` rule (see `next.config.mjs`). No `raw-loader` dependency.
- Types declared in `src/types/glsl.d.ts`.
- **GLSL files live in `src/shaders/`** — never inlined in JSX (kickoff rule #5).
- Wave 1 ports a `noise` + `easing` chunk library from `shader-lab` into `src/shaders/lib/`.
- Shaders compose by string interpolation (no fancy includes). If we hit a complexity wall, evaluate `glslify-loader` then.
- Per-shader uniform typing helper lives in `src/lib/uniforms.ts` (Wave 1) — produces a typed accessor over a Three.js `RawShaderMaterial`.

## State management

- **Zustand for cross-demo global state** (cursor, scroll snapshot, device profile). Added in Wave 1.
- **React state + URL params for per-demo state.** No `localStorage` / `sessionStorage` (kickoff rule #6).
- **Context only for theme + Lenis instance.** No big context trees.

## Mobile / low-power degrade

```ts
// pseudo
function DemoWrapper({ Demo, Poster }) {
  const lowPower = useIsLowPower();
  if (lowPower) return <Poster />;
  return <Demo />;
}
```

Detection (Wave 1 upgrade): `detect-gpu` tier ≤ 1 OR `(pointer: coarse)` with `navigator.hardwareConcurrency ≤ 4` OR battery API `level < 0.2 && !charging` OR `prefers-reduced-motion: reduce`.

Each demo ships a static poster (`public/posters/<slug>.png` — generated Wave 4 by Playwright recording the demo and grabbing a frame).

## Observability

- **`src/instrumentation.ts`** registers Sentry per runtime (`nodejs` and `edge`).
- **Client-side Sentry** is in `sentry.client.config.ts`, gated on `NEXT_PUBLIC_SENTRY_DSN`.
- **Per-demo tagging:** `LabLayout` calls `Sentry.setTag('demo', <slug>)` so errors carry the demo identifier (Wave 1).
- **No replays in Wave 0.** Wave 4 enables `replaysOnErrorSampleRate: 1.0` and dials sample rate to `0.1` once we have a stable error baseline.

## CI / verification

- **GitHub Actions** runs typecheck + lint + build on every push.
- **Lighthouse CI** runs on every PR; asserts performance ≥ 0.85 (error), accessibility/best-practices/seo ≥ 0.90 (warn) on the home, three sample demos, and `404`.
- **Husky pre-commit** runs `lint-staged` → Prettier + ESLint fix.
- **Commitlint** enforces conventional commits (`feat:`, `fix:`, `demo:`, etc.).
- Wave 4 adds **Playwright smoke tests** verifying every `/lab/<slug>` route mounts a canvas and emits no console errors.

## Deployment

- **Vercel** project linked to GitHub `main`. Auto-deploy preview per PR, production on push to `main`.
- **Custom domain** `lab.reachflowstudio.com` — **deferred from Wave 0**. Cloudflare CNAME (`lab` → `cname.vercel-dns.com`, DNS-only / grey-cloud per existing reachflow-studio convention) added by Ryan once the preview URL is healthy.
- **Cache headers:** `_next/static/*` `max-age=31536000, immutable`. Aggressive per kickoff Definition of Done.

## What's *not* in Wave 0

- Live demo content (placeholder pages only)
- Zustand stores
- `detect-gpu` integration
- View Transitions
- Sentry tag-per-demo
- MDX per-demo readmes
- Per-demo OG images
- Playwright smoke tests

All of the above land in Waves 1–4.

## Decisions log

| Decision | Date | Why |
| --- | --- | --- |
| Single global `<Canvas>` | 2026-05-25 | Pattern-validated by website-2k25; lower compositor cost |
| `asset/source` over raw-loader | 2026-05-25 | Built into webpack; no extra dep |
| Sentry only (no PostHog) | 2026-05-25 | Lab needs error monitoring, not product analytics |
| Custom domain deferred | 2026-05-25 | Per Ryan — Wave 0 stops at vercel.app |
| `@bsmnt/scrollytelling` for tunnel only | 2026-05-25 | Tiny surface, big pattern win |
| Pin GSAP `^3.12.5` + ScrollTrigger | 2026-05-25 | Stable, well-tested, basement-validated |
| No `localStorage` / `sessionStorage` | 2026-05-25 | Kickoff rule #6; demos must be URL-shareable |
