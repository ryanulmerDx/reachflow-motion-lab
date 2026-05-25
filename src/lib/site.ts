/**
 * Site-wide constants. One source of truth for marketing copy.
 */

export const SITE = {
  name: 'ReachFlow Motion Lab',
  shortName: 'Motion Lab',
  tagline: '10 open-source WebGL, shader, and motion experiments. Built by a solo agency.',
  description:
    'A public playground of WebGL, shader, and motion experiments — every demo standalone, screen-recordable, and open source under MIT. Built by ReachFlow Studio.',
  url: 'https://lab.reachflowstudio.com',
  ogImage: '/og/default.png',
  studio: {
    name: 'ReachFlow Studio',
    url: 'https://reachflowstudio.com',
    contact: 'ryan@reachflowstudio.com',
  },
  repo: 'https://github.com/ryanulmerDx/reachflow-motion-lab',
  socials: {
    x: 'https://x.com/ryanulmerDx',
    linkedin: 'https://www.linkedin.com/in/ryan-ulmer/',
  },
} as const;
