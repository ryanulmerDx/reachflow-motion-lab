# Performance guardrails

Per kickoff rules 3, 4, and the Definition of Done.

## Per-route bundle budget

- **200KB JS** on first load for any `/lab/<slug>` route (excluding shared shell).
- Verified in CI via Lighthouse + `next build` route-level output.
- Each demo is dynamically imported — never reach into another demo's code.

## Runtime targets

| Device class                 | Target FPS | Notes                                              |
| ---------------------------- | ---------- | -------------------------------------------------- |
| M-series Mac, desktop        | 60         | Hard requirement. `performance-engineer` verifies. |
| Mid-tier Windows laptop      | 45         | Floor; toggle "low-quality mode" if below.         |
| Mid-tier phone (Pixel 7-ish) | 30         | If unreachable, render static poster.              |

## Frame budget

- 16.6ms per frame at 60fps. Stay under 8ms for app work to leave 8ms for the GPU.
- No layout thrash in scroll handlers — only `transform`, `opacity`, `filter`.
- Defer non-critical work to `requestIdleCallback` where possible.

## Shader hygiene

- Compile shaders once per program — never inline in JSX.
- Use `Float32Array` typed uniforms when passing per-frame data.
- Prefer `mediump` precision unless the artifact is visible.
- Avoid `discard` and `texture2DLod` in fragment loops.

## Memory

- Dispose Three.js geometries, materials, textures, render targets on unmount.
- Use `useDisposable` (Wave 1) to centralize cleanup.

## Mobile graceful degrade

```ts
// usage example
const lowPower = useIsLowPower();
if (lowPower) return <StaticPoster />;
return <FullFidelityDemo />;
```

Detection: `navigator.hardwareConcurrency <= 4` && `pointer: coarse`. See `src/hooks/use-viewport.ts`.

## Verification

- Lighthouse CI gates merge to main. Score must be ≥ 85 desktop on every route.
- `performance-engineer` agent profiles WebGL-heavy demos manually before merge.
