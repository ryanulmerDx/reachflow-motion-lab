'use client';

/**
 * particles.tsx — GPU-instanced particle field that travels the workflow graph.
 *
 * Design decisions:
 * - All per-particle state lives in plain typed arrays (no React state).
 * - Module-scope Matrix4/Vector3/Color singletons are reused every frame — zero
 *   per-frame allocation on the hot path.
 * - Fork routing uses weighted random at emission time so the 70/30 split is
 *   visible statistically across hundreds of particles.
 * - Particles flow at a constant speed — independent of scroll.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { InstancedMesh } from 'three';
import {
  Matrix4,
  Vector3,
  Color,
  SphereGeometry,
  MeshBasicMaterial,
  Quaternion,
} from 'three';
import {
  EDGES,
  ENTRY_EDGES,
  OUTGOING,
  PARTICLE_COUNT,
  PARTICLE_SPEED,
  PARTICLE_SIZE,
  BAND_COLORS,
  type WorkflowEdge,
} from './graph';

// ─── Module-scope reuse singletons ──────────────────────────────────────────

const _mat4 = new Matrix4();
const _pos = new Vector3();
const _scale = new Vector3(1, 1, 1);
const _quat = new Quaternion();

const _colorCyan = new Color(BAND_COLORS[0]);
const _colorAmber = new Color(BAND_COLORS[1]);

// ─── Particle state arrays ───────────────────────────────────────────────────

// Index of the current edge (into EDGES array)
const pEdgeIdx = new Uint8Array(PARTICLE_COUNT);
// t parameter along edge: stored as 0..65535 mapped to 0..1
const pT = new Uint16Array(PARTICLE_COUNT);
// color band: 0 = cyan, 1 = amber
const pBand = new Uint8Array(PARTICLE_COUNT);
// alive flag: 0 = needs init, 1 = active
const pAlive = new Uint8Array(PARTICLE_COUNT);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickNextEdge(nodeId: string, _band: number): WorkflowEdge | null {
  const outs = OUTGOING[nodeId];
  if (!outs || outs.length === 0) return null;
  if (outs.length === 1) return outs[0]!;
  // Weighted random for the fork at score
  const r = Math.random();
  let cumulative = 0;
  for (const e of outs) {
    cumulative += e.weight;
    if (r < cumulative) return e;
  }
  return outs[outs.length - 1]!;
}

function initParticle(i: number, stagger: number) {
  const entry = ENTRY_EDGES[0]!;
  const edgeIdx = EDGES.indexOf(entry);
  pEdgeIdx[i] = edgeIdx;
  // Spread particles along the timeline so they don't all start at t=0
  pT[i] = Math.floor(stagger * 65535);
  pBand[i] = 0; // all start cyan; amber only after fork
  pAlive[i] = 1;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ParticlesProps {
  onNodeHit: (nodeId: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Particles({ onNodeHit }: ParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null);

  // Geometry and material — stable references, never recreated.
  // vertexColors: true lets InstancedMesh use per-instance color via setColorAt.
  const geometry = useMemo(() => new SphereGeometry(PARTICLE_SIZE, 6, 6), []);
  const material = useMemo(
    () => new MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    []
  );

  // Stagger init across the first frame
  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      initParticle(i, i / PARTICLE_COUNT);
    }
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Constant flow — particles are no longer affected by scroll.
    const speed = PARTICLE_SPEED;
    const dt = Math.min(delta, 0.05); // cap delta to avoid big jumps

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (!pAlive[i]) {
        initParticle(i, Math.random());
        continue;
      }

      const edge = EDGES[pEdgeIdx[i]!];
      if (!edge) {
        initParticle(i, Math.random());
        continue;
      }

      // Advance t
      const t = pT[i]! / 65535 + speed * dt;

      if (t >= 1) {
        // Arrived at destination node
        const arrivedNode = edge.to;
        onNodeHit(arrivedNode);

        const next = pickNextEdge(arrivedNode, pBand[i]!);
        if (next) {
          pEdgeIdx[i] = EDGES.indexOf(next);
          pBand[i] = next.colorBand;
          pT[i] = 0;
        } else {
          // Terminal node — reset to entry
          initParticle(i, Math.random() * 0.3);
        }
        continue;
      }

      pT[i] = Math.floor(t * 65535);

      // Sample curve position
      edge.curve.getPointAt(t, _pos);

      // Write instance matrix (compose: pos, identity quat, uniform scale)
      _mat4.compose(_pos, _quat, _scale);
      mesh.setMatrixAt(i, _mat4);

      // Write instance color
      const c = pBand[i] === 0 ? _colorCyan : _colorAmber;
      mesh.setColorAt(i, c);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, PARTICLE_COUNT]}
    />
  );
}
