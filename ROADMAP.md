# Roadmap — reachflow-motion-lab

> 21-day plan, five waves, ten demos. Source: `REACHFLOW_MOTION_LAB_KICKOFF.md`.

Last updated: 2026-05-25.

## Milestones

| Wave | Days | Deliverable |
| --- | --- | --- |
| 0 — Recon + Foundation | 1 | Repo live, scaffold deployed, basement patterns documented |
| 1 — Foundation Primitives | 2–3 | `LenisProvider`, GLSL toolchain, global R3F canvas, `/lab/hello` demo zero |
| 2 — Demos 1–5 | 4–8 | First five demos shipping in parallel tracks |
| 3 — Demos 6–10 | 9–14 | Final five — fluid sim, ray march, particles, physics |
| 4 — Landing + Launch Prep | 15–17 | Landing-page-as-its-own-demo, OG images, Lighthouse pass, SEO |
| 5 — Content + Distribution | 18–21 | 10 social posts, long-form blog, newsletter, soft → hard launch |

## Wave 0 — current

| # | Task | Owner | Status |
| --- | --- | --- | --- |
| 0.1 | Clone 6 basement repos to `~/code/inspiration/` | claude | in progress |
| 0.2 | Write `LEARNINGS.md` (≥10 patterns) | claude (architect-reviewer agent on validation) | blocked by 0.1 |
| 0.3 | Write `ARCHITECTURE.md` (Lenis/Canvas/shaders/codesplit/Sentry) | claude | blocked by 0.2 |
| 0.4 | Scaffold Next 15 + TS strict + Tailwind 4 + `/lab` structure | claude | in progress |
| 0.5 | DX: ESLint + Prettier + Husky + commitlint + GLSL loader | claude | in progress |
| 0.6 | `README.md` marketing-grade + `LICENSE` MIT | claude | in progress |
| 0.7 | GitHub Actions CI: typecheck, lint, build, Lighthouse | claude | pending |
| 0.8 | Sentry wiring (`src/instrumentation.ts`) + demo tag scheme | claude | in progress |
| 0.9 | Create `github.com/ryanulmerDx/reachflow-motion-lab`, push main | claude | pending (needs Ryan confirm) |
| 0.10 | Vercel deploy, `*.vercel.app` URL serves landing (custom domain deferred per Ryan) | claude | pending |
| 0.11 | `code-reviewer` + `security-reviewer` pass on scaffold | code-reviewer, security-reviewer agents | pending |

**Acceptance:** vercel.app URL returns landing page, CI green, `LEARNINGS.md` has ≥10 patterns, `ARCHITECTURE.md` exists. Custom domain `lab.reachflowstudio.com` deferred to post-Wave-0 once Ryan adds the Cloudflare CNAME.

## Wave 1 — Foundation Primitives

Build the shared primitives every demo needs.

- `LenisProvider` wired into global `<Canvas>` view tracker — `react-pro`
- Typography system + color tokens + grid — `ui-designer`
- GLSL toolchain (hot reload, base noise/easing chunks ported from `shader-lab`) — `frontend-developer`
- Strict TS config, path aliases, type-safe shader uniform helper — `typescript-pro`
- `_demos/` colocation, dynamic imports, MDX per-demo readme rendering — `nextjs-pro`
- Code review + performance baseline (`< 200KB JS`)
- "Demo zero" at `/lab/hello` — gradient shader, smooth scroll, all primitives wired

**Acceptance:** `/lab/hello` ships under 200KB, all 10 demo folders have placeholder `page.tsx` + `README.md` + `SPEC.md`.

## Wave 2 — Demos 1–5 (parallel tracks)

| Track | Demo | Owner |
| --- | --- | --- |
| A | `lenis-text-reveal` | react-pro |
| B | `cursor-morph` | ui-designer + react-pro |
| C | `shader-noise-hero` | frontend-developer + ui-designer |
| D | `page-transitions` | nextjs-pro |
| E | `scroll-distort-text` | react-pro |

Each track passes through: `planner` → `ui-designer` (DESIGN.md) → build → `code-reviewer` → `performance-engineer` → `qa-expert` (Playwright smoke) → `security-reviewer` → `refactor-cleaner` → merge.

## Wave 3 — Demos 6–10 (parallel tracks, hardest)

| Track | Demo | Owner |
| --- | --- | --- |
| A | `3d-marquee` | react-pro |
| B | `fluid-cursor` | frontend-developer |
| C | `particle-logo` | ui-designer + react-pro |
| D | `glsl-tunnel` | frontend-developer |
| E | `physics-cards` | react-pro |

`performance-engineer` has veto power on demos 7 (fluid) and 9 (ray march). If either drops below 45fps on a mid-tier laptop, it ships with a "low-quality mode" toggle or it does not ship in Wave 3.

## Wave 4 — Landing + Launch Prep

- Landing page is its own demo: grid of all 10 with live WebGL thumbnails or short looping videos
- Per-route OG images via `@vercel/og`
- `homepage-audit` + `page-cro` + `seo-audit` final passes
- Lighthouse CI ≥ 85 desktop on every route — merge blocker
- `llms.txt` so future LLM crawlers can index

## Wave 5 — Content + Distribution

Single source asset per demo: a 30s screen recording. Repurposed into:

- 10 X posts (1 hook + thread per demo)
- 10 LinkedIn posts (less technical framing — "what this means for businesses")
- 10 social cards (1200x630) per demo
- 1 long-form "How we built this" blog post on `reachflowstudio.com/blog`
- 1 newsletter announcement
- Cross-posts to dev.to + Hashnode for the long-form

**Launch day sequence:**

| Day | Action |
| --- | --- |
| 18 | Soft-launch: X with demo 1 video + thread |
| 19 | LinkedIn post + add lab link to reachflowstudio.com homepage |
| 20 | Drop full lab URL with "10 experiments, all open source" thread |
| 21 | Long-form blog post live; cross-post to dev.to + Hashnode |

`brand-monitor` runs daily and surfaces X/Reddit mentions via `send-telegram` Hermes channel.

## Risk register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Sentry instrumentation gotcha (must live in `src/` for App Router) | Med | Already placed at `src/instrumentation.ts`; documented in `ARCHITECTURE.md` |
| Per-demo bundle > 200KB | Med | Per-demo dynamic imports + `optimizePackageImports` for three/drei/gsap; Lighthouse CI gate |
| Fluid sim / ray march mobile perf | High | Veto from `performance-engineer`; static-poster fallback via `useIsLowPower()` |
| Lighthouse pass on shader-heavy routes | Med | Lazy-load WebGL after `loadComplete`; defer Sentry replay; trim font subsets |
| Domain CNAME timing on Cloudflare | Low | Custom domain deferred from Wave 0 per Ryan — runs after a stable preview URL exists |
| Scope creep on landing redesign (Wave 4) | Med | Landing is its own demo; design lands as DESIGN.md before build |

## How to read this file

- Each Wave has an acceptance gate. Stop and review with Ryan at every boundary.
- Sub-tasks live in TaskList during execution — this file is the durable plan.
- Update the status column inline as work moves; check `LEARNINGS.md` for source patterns and `ARCHITECTURE.md` for system-level decisions.
