'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import type { Vector3Tuple } from 'three';
import { Card } from './card';
import { PileColliders, PileLabels } from './piles';
import {
  PILES,
  type InventoryItem,
  type PileId,
} from './inventory';

// World half-widths used by piles.tsx (ARENA_X = 8.5). The scene must always
// show all three piles plus a touch of breathing room, so we fit a horizontal
// span of WORLD_FIT_WIDTH world-units to whatever canvas width we get.
const WORLD_FIT_WIDTH = 18;

/**
 * Drives the orthographic camera zoom from the live canvas size so the scene
 * stays horizontally fitted on every viewport (desktop ~60, mobile ~20).
 */
function ResponsiveCamera() {
  const width = useThree((s) => s.size.width);
  const zoom = Math.max(18, width / WORLD_FIT_WIDTH);

  return (
    <OrthographicCamera
      makeDefault
      zoom={zoom}
      position={[0, 0, 20]}
      near={0.1}
      far={100}
    />
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Stagger card start positions inside the correct pile column. */
function buildInitialPositions(items: ReadonlyArray<InventoryItem>): Map<string, Vector3Tuple> {
  const pileCounters = new Map<PileId, number>();

  return new Map(
    items.map((item) => {
      const pileId = item.pile;
      const idx = pileCounters.get(pileId) ?? 0;
      pileCounters.set(pileId, idx + 1);

      const pile = PILES.find((p) => p.id === pileId)!;
      const x = pile.cx + (Math.random() - 0.5) * 0.6;
      const y = 1.5 + idx * 1.5 + Math.random() * 0.3;
      const z = 0;

      return [item.id, [x, y, z] as Vector3Tuple];
    })
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SceneProps {
  items: ReadonlyArray<InventoryItem>;
  onSettle: (itemId: string, toPile: PileId) => void;
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export function Scene({ items, onSettle }: SceneProps) {
  // Positions are computed once from the initial snapshot — cards live in physics
  // world afterward and are not reset when item.pile changes in React state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialPositions = useMemo(() => buildInitialPositions(items), []);

  const handleSettle = useCallback(
    (itemId: string, toPile: PileId) => {
      onSettle(itemId, toPile);
    },
    [onSettle]
  );

  return (
    <Canvas
      orthographic
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ResponsiveCamera />

      <ambientLight intensity={0.6} />

      <Suspense fallback={null}>
        <Physics
          gravity={[0, -2, 0]}
          colliders={false}
          timeStep="vary"
        >
          <PileColliders />
          <PileLabels />

          {items.map((item) => {
            const pos = initialPositions.get(item.id) ?? [0, 3, 0];
            return (
              <Card
                key={item.id}
                item={item}
                initialPosition={pos as Vector3Tuple}
                onSettle={handleSettle}
                currentPile={item.pile}
              />
            );
          })}
        </Physics>
      </Suspense>
    </Canvas>
  );
}

