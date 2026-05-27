/**
 * Site-wide constants. One source of truth for marketing copy.
 */

export const SITE = {
  name: 'ReachFlow Systems Lab',
  shortName: 'Systems Lab',
  tagline:
    'Ten business systems built the way they should feel — fast, sharp, and visually alive.',
  description:
    'A working portfolio of business systems — booking, CRM, intake, dashboards, automation — wrapped in the WebGL, shader, and motion craft most agencies never ship. Open source under MIT. Built by ReachFlow Studio.',
  url: 'https://lab.reachflowstudio.com',
  ogImage: '/og/default.png',
  studio: {
    name: 'ReachFlow Studio',
    url: 'https://reachflowstudio.com',
    contact: 'ryan@reachflowstudio.com',
    pitch:
      'ReachFlow Studio builds production systems — booking flows, CRMs, automated pipelines, custom dashboards — for solo operators and small teams who want enterprise polish without the enterprise headcount.',
  },
  repo: 'https://github.com/ryanulmerDx/reachflow-motion-lab',
  year: 2026,
  socials: {
    x: 'https://x.com/ryanulmerDx',
    linkedin: 'https://www.linkedin.com/in/ryan-ulmer/',
  },
} as const;
