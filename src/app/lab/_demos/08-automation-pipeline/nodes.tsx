'use client';

/**
 * nodes.tsx — R3F node-graph rendering.
 *
 * Each WorkflowNode renders as:
 *   - A plane "card" (MeshBasicMaterial) with a border ring
 *   - A pulsing halo ring that decays after a particle arrives
 *   - A center accent dot
 *
 * Edges render as sampled CatmullRomCurve3 point arrays via drei <Line>.
 *
 * All node positions come from graph.ts — layout is data-driven.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { RingGeometry, PlaneGeometry } from 'three';
import type { Mesh, MeshBasicMaterial } from 'three';
import { NODES, EDGES, type WorkflowNode } from './graph';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NodeGraphProps {
  hitTimesRef: React.RefObject<Record<string, number>>;
}

// ─── Edge lines ───────────────────────────────────────────────────────────────

function EdgeLines() {
  return (
    <>
      {EDGES.map((edge) => {
        const points = edge.curve.getPoints(40);
        const color = edge.colorBand === 0 ? '#67e8f9' : '#fde68a';
        return (
          <Line
            key={edge.id}
            points={points}
            color={color}
            lineWidth={1.4}
            transparent
            opacity={0.5}
          />
        );
      })}
    </>
  );
}

// ─── Single node ─────────────────────────────────────────────────────────────

function NodeCard({
  node,
  hitTimesRef,
}: {
  node: WorkflowNode;
  hitTimesRef: React.RefObject<Record<string, number>>;
}) {
  const haloRef = useRef<Mesh>(null);
  const haloMatRef = useRef<MeshBasicMaterial>(null);
  const cardMatRef = useRef<MeshBasicMaterial>(null);

  const haloGeom = useMemo(() => new RingGeometry(0.22, 0.32, 32), []);
  const cardGeom = useMemo(() => new PlaneGeometry(0.88, 0.4), []);

  useFrame(() => {
    const hitTimes = hitTimesRef.current;
    // hitTimesRef is written by the panel in wall-clock seconds (performance.now()/1000)
    // but clock.elapsedTime starts at 0, so we compare against a shared epoch.
    // Simple approach: store last hit as performance.now()/1000, read same way here.
    const lastHitWall = hitTimes?.[node.id] ?? 0;
    const nowWall = performance.now() / 1000;
    const age = nowWall - lastHitWall;

    // Halo pulse: bright flash decaying over 0.7s
    if (haloMatRef.current) {
      haloMatRef.current.opacity = Math.max(0, 1 - age / 0.7);
    }

    // Halo scale: 1.0 → 1.8 as opacity decays
    if (haloRef.current) {
      const scale = 1 + Math.max(0, 1 - age / 0.7) * 0.8;
      haloRef.current.scale.setScalar(scale);
    }

    // Card glow
    if (cardMatRef.current) {
      const glow = Math.max(0, 1 - age / 0.4) * 0.12;
      cardMatRef.current.opacity = 0.82 + glow;
    }
  });

  const [x, y, z] = node.position;

  return (
    <group position={[x, y, z]}>
      {/* Card background */}
      <mesh geometry={cardGeom}>
        <meshBasicMaterial
          ref={cardMatRef}
          color={0x0c0c14}
          transparent
          opacity={0.82}
          toneMapped={false}
        />
      </mesh>

      {/* Static border ring */}
      <mesh>
        <ringGeometry args={[0.17, 0.195, 32]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.8} toneMapped={false} />
      </mesh>

      {/* Halo pulse ring */}
      <mesh ref={haloRef} geometry={haloGeom}>
        <meshBasicMaterial
          ref={haloMatRef}
          color={node.color}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Center accent dot */}
      <mesh>
        <circleGeometry args={[0.052, 16]} />
        <meshBasicMaterial color={node.color} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ─── Full node graph ─────────────────────────────────────────────────────────

export function NodeGraph({ hitTimesRef }: NodeGraphProps) {
  return (
    <group>
      <EdgeLines />
      {NODES.map((node) => (
        <NodeCard key={node.id} node={node} hitTimesRef={hitTimesRef} />
      ))}
    </group>
  );
}
