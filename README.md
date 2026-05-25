# ReachFlow Motion Lab

> Ten WebGL, shader, and motion experiments. Built by a solo agency. Open source from day one.

`reachflow-motion-lab` is a public playground of basement.studio-tier motion and WebGL demos. Every experiment is a standalone Next.js route, screen-recordable as a 30s social clip, and ready to fork.

**Built by [ReachFlow Studio](https://reachflowstudio.com) — a solo agency that builds production websites, CRMs, AI agents, and automations for service businesses.**

## The ten experiments

| # | Slug | What it teaches |
| --- | --- | --- |
| 01 | [`lenis-text-reveal`](./src/app/lab/_demos/01-lenis-text-reveal) | Smooth scroll + GSAP staggered text reveal |
| 02 | [`cursor-morph`](./src/app/lab/_demos/02-cursor-morph) | Context-aware custom cursor with spring physics |
| 03 | [`shader-noise-hero`](./src/app/lab/_demos/03-shader-noise-hero) | Mouse-reactive GLSL noise hero |
| 04 | [`page-transitions`](./src/app/lab/_demos/04-page-transitions) | View Transitions API + GSAP fallback |
| 05 | [`scroll-distort-text`](./src/app/lab/_demos/05-scroll-distort-text) | Scroll-velocity vertex displacement |
| 06 | [`3d-marquee`](./src/app/lab/_demos/06-3d-marquee) | Perspective-skewed infinite marquee |
| 07 | [`fluid-cursor`](./src/app/lab/_demos/07-fluid-cursor) | Navier-Stokes WebGL fluid simulation |
| 08 | [`particle-logo`](./src/app/lab/_demos/08-particle-logo) | GPU particle field resolving into a wordmark |
| 09 | [`glsl-tunnel`](./src/app/lab/_demos/09-glsl-tunnel) | Pure ray-marched tunnel |
| 10 | [`physics-cards`](./src/app/lab/_demos/10-physics-cards) | Rapier rigid-body card stack |

Live at **[lab.reachflowstudio.com](https://lab.reachflowstudio.com)**.

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

This lab stands on the shoulders of [basementstudio](https://basement.studio):

- [website-2k25](https://github.com/basementstudio/website-2k25) — global canvas, view-tracker, route transitions
- [shader-lab](https://github.com/basementstudio/shader-lab) — composable GLSL chunks
- [scrollytelling](https://github.com/basementstudio/scrollytelling) — declarative scroll choreography
- [basement-laboratory](https://github.com/basementstudio/basement-laboratory) — full experiment archive

Recon notes live in [`LEARNINGS.md`](./LEARNINGS.md).

## Contributing

This is a public lab, not an accepting-PRs library — but it is fully MIT-licensed. Fork it, take it apart, ship your own version. Tag [@ryanulmerDx](https://x.com/ryanulmerDx) if you build something cool with it.

## License

[MIT](./LICENSE) © [ReachFlow Studio](https://reachflowstudio.com)
