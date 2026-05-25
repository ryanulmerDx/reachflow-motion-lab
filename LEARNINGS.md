# LEARNINGS — patterns extracted from basement studio

> Recon target: six basement studio repos cloned to `~/code/inspiration/`. This file is the source of truth for which patterns we adopt, adapt, or skip in `reachflow-motion-lab`.

Last updated: 2026-05-25 · Recon run by Explore agent on Next 15 / R3F v9 stack target.

## Repos at a glance

| Repo                  | Next | React | R3F | Notes                                              |
| --------------------- | ---- | ----- | --- | -------------------------------------------------- |
| **website-2k25**      | 15c  | 19    | 9rc | Flagship, cutting-edge — top recon priority        |
| **shader-lab**        | 16.2 | 19.2  | 9.5 | Modern stable, Bun, Tailwind 4, Biome              |
| **basement-laboratory** | 13   | 18    | 8.15 | Pages router; 60+ experiments — pattern archive    |
| **scrollytelling**    | —    | —     | —   | Monorepo housing `@bsmnt/scrollytelling` library   |
| **next-typescript**   | 14.2 | 18.3  | —   | Minimal DX reference                               |
| **ogl-starter**       | 14.2 | 18    | —   | OGL alternative + GPU tier detection (gold)        |

## Adopt — directly portable to Next 15 + R3F v9

### 1. Global R3F Canvas with View routing
- **Pattern:** one `<Canvas>` mounted globally in fixed-position container, sized to viewport. DOM-overlay placement for individual demos.
- **Source:** `website-2k25/src/components/scene/index.tsx:140-206`
- **Why:** one shared GPU context, fewer mode-switches, demos compose by writing to portals instead of mounting their own canvas.
- **Wave 1 task:** port to `src/components/canvas.tsx` with `frameloop="demand"` and DPR clamp `[1, 1.5]`.

### 2. Spring-physics custom cursor with motion library
- **Pattern:** `useMotionValue` + `useSpring` (motion/react). ResizeObserver to avoid edge clipping. Zustand-backed cursor type state machine (marquee | hover-text | default).
- **Source:** `website-2k25/src/components/custom-cursor/index.tsx:61-171`
- **Why:** Demo #02 (`cursor-morph`) is exactly this. Direct port.

### 3. Zustand store for global mouse / cursor state
- **Pattern:** `useMouseStore` with cursor type, hover text, marquee flag. Separate `UpdateCanvasCursor` syncs store → canvas style.
- **Source:** `website-2k25/src/components/custom-cursor/index.tsx:16-36`
- **Wave 1:** create `src/lib/stores/cursor-store.ts`. Zustand is not in our lockfile yet — add when Wave 1 picks it up.

### 4. Spring cursor over Three.js scene via portal
- **Pattern:** Pointer events on canvas relayed via Zustand. Touch-coarse devices: disable pointer-events on canvas.
- **Source:** `website-2k25/src/components/scene/index.tsx:65-81, 162-165`
- **Pairs with #3** above.

### 5. GPU tier detection + battery + reduced-motion combo
- **Pattern:** `detect-gpu` returns tier 0–3. Combined with Battery Status API + `prefers-reduced-motion`. Zustand store `useDevice` holds result. `getCanUseWebGl()` gate function.
- **Source:** `ogl-starter/src/hooks/use-device.tsx:75-102, 144-153`
- **Why:** Per kickoff rule #4, mobile must degrade gracefully. This is the gold-standard implementation.
- **Wave 1 task:** replace our stub `useIsLowPower` in `src/hooks/use-viewport.ts` with `detect-gpu`-backed version. Add `detect-gpu` to package.json.

### 6. Tailwind 4 with CSS-variable fonts via next/font
- **Pattern:** `next/font/google` exposes `.variable` (`--font-display`), Tailwind 4 `@theme` reads the var.
- **Source:** `website-2k25/src/app/layout.tsx:43-56`, `tailwind.config.ts:155-159`
- **Status:** **already implemented** in our `src/app/layout.tsx` + `src/app/globals.css`. No further action.

### 7. Dynamic-imported heavy subsystems (physics, postprocessing)
- **Pattern:** `next/dynamic` for `@react-three/rapier` `<Physics>` and minigame components, wrapped in `Suspense`. Conditional render based on scene state.
- **Source:** `website-2k25/src/components/scene/index.tsx:29-52, 188-194`
- **Wave 3:** demo 10 (`physics-cards`) loads rapier this way.

### 8. Touch-only detection via pointer media query
- **Pattern:** `(pointer: coarse) and (not (pointer: fine))` → touch-only. Disable canvas pointer events on touch.
- **Source:** `website-2k25/src/components/scene/index.tsx:65-81`
- **Status:** partial — `useMediaQuery` already in our codebase. Wave 1 wires it into the cursor.

### 9. `instrumentation.ts` for observability hooks
- **Pattern:** `onRequestError` callback in `instrumentation.ts` — basement uses PostHog. We swap PostHog → Sentry (`@sentry/nextjs`).
- **Source:** `website-2k25/instrumentation.ts:1-33`
- **Status:** **already implemented** in our `src/instrumentation.ts`. Need to add per-demo `Sentry.setTag('demo', slug)` in `LabLayout` in Wave 1.

### 10. Per-demo metadata convention (`.getLayout`, `.Title`, `.Tags`)
- **Pattern:** basement attaches static metadata to each experiment component for auto-indexing.
- **Source:** `basement-laboratory/src/experiments/1.just-html.js:20-25`, `11.move-map-texture.js:153-165`
- **Adaptation:** Pages router idiom. **In our App Router scaffold**, the equivalent is the `DEMOS` registry in `src/lib/demo-registry.ts` (already done) — demos export from `_demos/<slug>/` and the registry holds metadata.

## Adapt — portable but needs rework

### 11. Shader injection via `onBeforeCompile` + raw GLSL imports
- **Pattern:** import `.glsl` files as strings via raw-loader. Inject into Three.js material's vertex/fragment shaders via `onBeforeCompile` and `shader.vertexShader.replace(...)`.
- **Source:**
  - `website-2k25/next.config.ts:8-10` (webpack rule)
  - `basement-laboratory/src/experiments/11.move-map-texture.js:81-129` (injection pattern)
- **Adaptation:** Our `next.config.mjs` already uses `type: 'asset/source'` instead of `raw-loader` — same end result, zero dependencies. **Already implemented.** The injection pattern is portable as-is; demo #05 (`scroll-distort-text`) and #11-equivalent will use it.

### 12. Tunnel pattern via `@bsmnt/scrollytelling`
- **Pattern:** `tunnel()` creates in/out portals — components write to `<WebGL.In>`, consumers render `<WebGL.Out />`. Decouples scroll-driven DOM from fixed Canvas.
- **Source:** `basement-laboratory/src/experiments/11.move-map-texture.js:12, 145-158`
- **Adaptation:** We have `@bsmnt/scrollytelling@0.3.3` in deps. The library is small (~7M monorepo, ~kB shipped). Wave 1 evaluates: keep `@bsmnt/scrollytelling` for tunnel + scroll provider, or build our own slim version (Lenis + GSAP ScrollTrigger directly). Default position: **use it for Wave 2 demos** (1, 4, 5), drop it if bundle audit shows it costing > 5KB.

### 13. Scroll-driven shader UV transform via `useFrame`
- **Pattern:** `useFrame` callback reads scroll position from store, updates shader uniform `uScroll`. Matrix3 UV transform passed to shader.
- **Source:** `basement-laboratory/src/experiments/11.move-map-texture.js:56-62, 81-95`
- **Adaptation:** Wave 1 wires Lenis scroll value into a shared uniform broadcaster.

### 14. Composable shader chunks (shader-lab style)
- **Pattern:** `packages/shader-lab-react/src/Shader.tsx` exposes composable GLSL chunks as React components. Higher-level than raw fragment strings.
- **Source:** `shader-lab/packages/shader-lab-react/src/`
- **Adaptation:** Worth porting a slim copy of their noise / easing / color chunks into `src/shaders/lib/` (Wave 1). Not adopting the full React-component-per-chunk abstraction — too magic for a 10-demo scope.

### 15. Per-experiment route + isolated providers (Pages router)
- **Pattern:** Each experiment file in `pages/lab/[slug].js` mounts its own Canvas, providers, debug panel.
- **Source:** `basement-laboratory/src/components/layout/smooth-scroll-layout.tsx`
- **Adaptation:** **Already adapted.** Our `src/app/lab/[slug]/page.tsx` + `_demos/<slug>/` colocation is the App Router equivalent.

## Skip — not relevant or actively avoided

### 16. PostHog instrumentation
- basement uses PostHog for product analytics. We use Sentry only for errors. PostHog adds bundle weight and we don't need product analytics on a lab site.

### 17. Leva debug panels
- basement-laboratory uses Leva on most experiments for live shader tweaking. Useful in development, but ships ~20KB and clutters demos. Skip for production builds; add as dev-only opt-in if needed.

### 18. Definitive-scroll (`@basementstudio/definitive-scroll`)
- Predates `@bsmnt/scrollytelling`; basement-laboratory still imports it. Choose one — we pick `@bsmnt/scrollytelling` for forward-compat.

### 19. `motion/react` v12 over `framer-motion` v11
- website-2k25 uses the newer `motion` package. We pin `framer-motion@^11` for stability — motion/react is functionally equivalent and we can swap later if v12 stabilizes.

### 20. Bun + Biome (shader-lab tooling)
- Out of scope; we use npm + ESLint + Prettier for consistency with the rest of the ReachFlow Studio org.

## Critical files for hands-on reference

When stuck during Wave 1+, read these first:

1. `~/code/inspiration/website-2k25/src/components/scene/index.tsx` — global canvas blueprint
2. `~/code/inspiration/website-2k25/src/components/custom-cursor/index.tsx` — spring cursor FSM
3. `~/code/inspiration/website-2k25/next.config.ts` — GLSL loader setup (we use asset/source instead)
4. `~/code/inspiration/basement-laboratory/src/experiments/11.move-map-texture.js` — scroll-driven shader UV + tunnel
5. `~/code/inspiration/ogl-starter/src/hooks/use-device.tsx` — GPU tier + battery detection
6. `~/code/inspiration/scrollytelling/scrollytelling/src/` — `@bsmnt/scrollytelling` source
7. `~/code/inspiration/shader-lab/packages/shader-lab-react/src/` — composable shader pattern

## Decisions captured

| Question | Decision | Reason |
| --- | --- | --- |
| Global canvas vs per-demo canvas? | **Global** | Single GPU context, faster route transitions, pattern-validated by website-2k25 |
| GLSL loader? | **`type: 'asset/source'`** (built-in webpack) | Zero dependencies vs raw-loader + glslify-loader |
| Scroll library? | **Lenis + `@bsmnt/scrollytelling`** (tunnel only) | Lenis for smoothness, scrollytelling for portal pattern |
| Mobile degrade detection? | **`detect-gpu` + battery + reduced-motion** | Adopt ogl-starter's combo |
| Per-demo metadata? | **`DEMOS` registry in `src/lib/demo-registry.ts`** | App Router equivalent of basement's `.getLayout` |
| Observability? | **Sentry only** (no PostHog) | We don't need product analytics on the lab |
| Cursor library? | **motion (framer-motion v11)** + Zustand store | Pattern from website-2k25, conservative version pin |
| Debug UI in production? | **No** (Leva dev-only if added) | Bundle discipline |

## Open questions for Ryan (resolve at Wave 0/1 boundary)

1. Add `detect-gpu`, `zustand`, and (optionally) `@react-three/rapier` to deps before Wave 1, or roll into Wave 1 as discovered? — proposing **roll into Wave 1 per-demo**.
2. Keep `@bsmnt/scrollytelling` if it costs > 5KB gzip per demo, or roll our own slim Lenis+ScrollTrigger wrapper? — proposing **measure during Wave 2 demo 1**.
