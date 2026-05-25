# ReachFlow Systems Lab

> Ten business systems built the way they should feel. Open source from day one.

`reachflow-motion-lab` is a public, MIT-licensed portfolio of the kinds of systems ReachFlow Studio builds for clients — booking flows, CRMs, intake forms, dashboards, automation visualizations, inventory tools — wrapped in the WebGL, shader, and motion craft most agencies never ship. Every demo is a standalone Next.js route, screen-recordable as a 30s clip, and ready to fork.

**Built by [ReachFlow Studio](https://reachflowstudio.com) — a solo agency that ships production websites, CRMs, AI agents, and automations for service businesses that want enterprise polish without the enterprise headcount.**

## The ten systems

| # | Slug | The system | The craft |
| --- | --- | --- | --- |
| 01 | [`booking-flow`](./src/app/lab/_demos/01-booking-flow) | Multi-step appointment booking | Lenis + GSAP staggered field reveals |
| 02 | [`cursor-aware-crm`](./src/app/lab/_demos/02-cursor-aware-crm) | Sales pipeline CRM with drag-drop | Context-aware spring cursor per element |
| 03 | [`shader-dashboard-hero`](./src/app/lab/_demos/03-shader-dashboard-hero) | SaaS analytics dashboard | GLSL noise hero, uniforms tied to live metrics |
| 04 | [`portal-transitions`](./src/app/lab/_demos/04-portal-transitions) | SaaS marketing tour | View Transitions API + GSAP shared-element morph |
| 05 | [`intake-form-warp`](./src/app/lab/_demos/05-intake-form-warp) | Multi-step lead intake form | Scroll-velocity vertex warp + fluid progress |
| 06 | [`client-logo-marquee`](./src/app/lab/_demos/06-client-logo-marquee) | Agency social-proof strip | Perspective 3D marquee, scroll-velocity skew |
| 07 | [`fluid-pricing-cursor`](./src/app/lab/_demos/07-fluid-pricing-cursor) | SaaS pricing page | Navier-Stokes WebGL fluid trail |
| 08 | [`automation-pipeline`](./src/app/lab/_demos/08-automation-pipeline) | n8n-style workflow visualization | GPU particles flowing node-to-node |
| 09 | [`data-tunnel`](./src/app/lab/_demos/09-data-tunnel) | Case-study hero | Ray-marched SDF tunnel, scroll-driven uTime |
| 10 | [`inventory-physics`](./src/app/lab/_demos/10-inventory-physics) | Field-service inventory tool | Rapier rigid bodies, drag-drop with physics |

Live at **[lab.reachflowstudio.com](https://lab.reachflowstudio.com)**.

## Why this exists

Most agencies pick one side: either they build *systems* that work (and look like spreadsheets), or they build *experiences* that look gorgeous (and break when real data hits them). ReachFlow Studio refuses the trade. The lab is the proof — every system here is a working answer to a real client brief, sharpened, polished, and shipped publicly so prospects can poke at it before we ever get on a call.

If you want one of these for your business, [email Ryan](mailto:ryan@reachflowstudio.com).

## Stack

- [Next.js 15](https://nextjs.org) (App Router, RSC, client components for WebGL)
- TypeScript strict
- [React Three Fiber](https://r3f.docs.pmnd.rs/) + [drei](https://drei.docs.pmnd.rs/) + [three](https://threejs.org)
- [OGL](https://github.com/oframe/ogl) for the lighter demos
- [GSAP](https://gsap.com) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Lenis](https://lenis.darkroom.engineering) smooth scroll
- [Tailwind CSS v4](https://tailwindcss.com)
- [Sentry](https://sentry.io) wired from commit 1, tagged per demo

## Quickstart

```bash
git clone https://github.com/ryanulmerDx/reachflow-motion-lab
cd reachflow-motion-lab
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start Next dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` strict typecheck |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

## Performance budget

Every demo route ships **≤ 200KB of JS on first load** and targets **Lighthouse ≥ 85 desktop**. Demos that can't hit 30fps on a mid-tier phone render a static poster with a "Tap for desktop" label. See [`docs/PERFORMANCE.md`](./docs/PERFORMANCE.md).

## Inspiration

The systems are ours. The craft layer stands on the shoulders of [basementstudio](https://basement.studio):

- [website-2k25](https://github.com/basementstudio/website-2k25) — global canvas, view-tracker, route transitions
- [shader-lab](https://github.com/basementstudio/shader-lab) — composable GLSL chunks
- [scrollytelling](https://github.com/basementstudio/scrollytelling) — declarative scroll choreography
- [basement-laboratory](https://github.com/basementstudio/basement-laboratory) — full experiment archive

Recon notes live in [`LEARNINGS.md`](./LEARNINGS.md).

## Contributing

This is a public lab, not an accepting-PRs library — but it is fully MIT-licensed. Fork it, take it apart, ship your own version. Tag [@ryanulmerDx](https://x.com/ryanulmerDx) if you build something cool with it.

## License

[MIT](./LICENSE) © [ReachFlow Studio](https://reachflowstudio.com)
