/**
 * graph.ts — node definitions, edge data, and CatmullRomCurve3 cache.
 *
 * All curves are constructed once at module scope. Per-frame code samples
 * them via curve.getPointAt(t) — no allocation on the hot path.
 */

import { CatmullRomCurve3, Vector3 } from 'three';

// ─── Layout constants ────────────────────────────────────────────────────────

// World-space X positions for each column (left-to-right)
const X = { trigger: -3.6, enrich: -1.2, score: 1.2, slack: 3.6, drip: 3.6 };
// World-space Y positions
const Y = { top: 0.9, mid: 0.0, bot: -0.9 };

// ─── Node definitions ────────────────────────────────────────────────────────

export interface WorkflowNode {
  id: string;
  label: string;
  sub: string;
  position: [number, number, number];
  color: string; // hex
}

export const NODES: WorkflowNode[] = [
  {
    id: 'trigger',
    label: 'Webform Submission',
    sub: 'Trigger',
    position: [X.trigger, Y.mid, 0],
    color: '#67e8f9',
  },
  {
    id: 'enrich',
    label: 'Clearbit Lookup',
    sub: 'Enrich',
    position: [X.enrich, Y.mid, 0],
    color: '#a78bfa',
  },
  {
    id: 'score',
    label: 'Lead Score',
    sub: 'Route',
    position: [X.score, Y.mid, 0],
    color: '#34d399',
  },
  {
    id: 'slack',
    label: 'Slack #sales',
    sub: 'Notify',
    position: [X.slack, Y.top, 0],
    color: '#67e8f9',
  },
  {
    id: 'drip',
    label: 'Drip Sequence',
    sub: 'Enroll',
    position: [X.drip, Y.bot, 0],
    color: '#fde68a',
  },
];

// ─── Edge definitions ────────────────────────────────────────────────────────

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  /** 0 = cyan path, 1 = amber path. Particles inherit this. */
  colorBand: 0 | 1;
  /** Probability weight at a fork — only meaningful on forking edges */
  weight: number;
  curve: CatmullRomCurve3;
}

function makeCurve(points: [number, number, number][]): CatmullRomCurve3 {
  return new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));
}

// Helper: node position as tuple
function pos(nodeId: string): [number, number, number] {
  const n = NODES.find((n) => n.id === nodeId)!;
  return n.position;
}

export const EDGES: WorkflowEdge[] = [
  // trigger → enrich (straight, slight bow)
  {
    id: 'e0',
    from: 'trigger',
    to: 'enrich',
    colorBand: 0,
    weight: 1,
    curve: makeCurve([
      pos('trigger'),
      [-2.4, 0.3, 0],
      pos('enrich'),
    ]),
  },
  // enrich → score
  {
    id: 'e1',
    from: 'enrich',
    to: 'score',
    colorBand: 0,
    weight: 1,
    curve: makeCurve([
      pos('enrich'),
      [0.0, 0.3, 0],
      pos('score'),
    ]),
  },
  // score → slack (70 % — high-score path, cyan)
  {
    id: 'e2',
    from: 'score',
    to: 'slack',
    colorBand: 0,
    weight: 0.7,
    curve: makeCurve([
      pos('score'),
      [2.4, 0.6, 0],
      pos('slack'),
    ]),
  },
  // score → drip (30 % — warm-lead path, amber)
  {
    id: 'e3',
    from: 'score',
    to: 'drip',
    colorBand: 1,
    weight: 0.3,
    curve: makeCurve([
      pos('score'),
      [2.4, -0.6, 0],
      pos('drip'),
    ]),
  },
];

// ─── Routing table ───────────────────────────────────────────────────────────

/** Map from nodeId → outgoing edges */
export const OUTGOING: Record<string, WorkflowEdge[]> = {};
for (const edge of EDGES) {
  if (!OUTGOING[edge.from]) OUTGOING[edge.from] = [];
  OUTGOING[edge.from]!.push(edge);
}

/** Starting edges (no incoming edges) */
export const ENTRY_EDGES: WorkflowEdge[] = EDGES.filter((e) => e.from === 'trigger');

// ─── Particle config ─────────────────────────────────────────────────────────

export const PARTICLE_COUNT = 360;
export const PARTICLE_SPEED = 0.18; // t-units per second at base rate
export const PARTICLE_SIZE = 0.045;

// Colors per band
export const BAND_COLORS = ['#67e8f9', '#fde68a'] as const;
