# Demo Spec Template

Copy this template into `docs/demos/<NN-slug>/SPEC.md` when planning a new demo.

```
# <Demo title> — SPEC

## Goal
What the visitor experiences in one sentence.

## Interactions
- Pointer: ...
- Scroll: ...
- Touch: ...
- Keyboard: ...

## Visual reference
- Inspiration: <link or repo path>
- Mood: <one-line aesthetic>
- Color palette: <hex values or theme tokens>

## Technique
- Rendering: <R3F | OGL | DOM | CSS>
- Math: <noise, SDF, physics, etc.>
- Animation driver: <RAF | GSAP | ScrollTrigger | View Transitions>

## Performance budget
- First-load JS for this route: ≤ 200KB
- Desktop FPS target: 60
- Mobile FPS target: 30 (or static poster + "Tap for desktop")
- Lighthouse performance: ≥ 85 desktop

## Accessibility
- Respects `prefers-reduced-motion`: yes/no/strategy
- Keyboard reachable: yes/no
- Focus management on interactions: ...

## Out of scope
What this demo deliberately doesn't try to do.
```
