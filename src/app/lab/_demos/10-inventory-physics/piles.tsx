'use client';

import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { PILES } from './inventory';

/**
 * Static boundary geometry for the three pile buckets plus outer arena walls.
 *
 * Each bucket is made of three CuboidColliders (left wall, right wall, floor)
 * forming an open-top tray. The arena boundary (left, right, top walls and
 * a deep floor) keeps cards from escaping the scene.
 *
 * World space: X spans ±8, Y spans ±5.5 (orthographic, aspect ~3:1 panel).
 */

// ─── Dimensions ───────────────────────────────────────────────────────────────

const WALL_THICKNESS = 0.15;
const BUCKET_HEIGHT = 2.0; // height of bucket side walls
const BUCKET_FLOOR_Y = -4.6; // world Y of the inside of the pile floor
const WALL_Y = BUCKET_FLOOR_Y + BUCKET_HEIGHT / 2;

// Outer arena bounds
const ARENA_X = 8.5;
const ARENA_TOP_Y = 6.0;
const ARENA_BOTTOM_Y = -5.5;

export function PileColliders() {
  return (
    <>
      {/* ── Outer arena walls ── */}
      <RigidBody type="fixed" colliders={false}>
        {/* Left wall */}
        <CuboidCollider
          args={[WALL_THICKNESS, (ARENA_TOP_Y - ARENA_BOTTOM_Y) / 2, 1]}
          position={[-ARENA_X, (ARENA_TOP_Y + ARENA_BOTTOM_Y) / 2, 0]}
        />
        {/* Right wall */}
        <CuboidCollider
          args={[WALL_THICKNESS, (ARENA_TOP_Y - ARENA_BOTTOM_Y) / 2, 1]}
          position={[ARENA_X, (ARENA_TOP_Y + ARENA_BOTTOM_Y) / 2, 0]}
        />
        {/* Top wall (invisible ceiling keeps flung cards in) */}
        <CuboidCollider
          args={[ARENA_X, WALL_THICKNESS, 1]}
          position={[0, ARENA_TOP_Y, 0]}
        />
        {/* Deep floor (catch-all below the buckets) */}
        <CuboidCollider
          args={[ARENA_X, WALL_THICKNESS, 1]}
          position={[0, ARENA_BOTTOM_Y, 0]}
        />
      </RigidBody>

      {/* ── Pile buckets ── */}
      {PILES.map((pile) => {
        const lx = pile.cx - pile.halfW - WALL_THICKNESS / 2;
        const rx = pile.cx + pile.halfW + WALL_THICKNESS / 2;
        return (
          <RigidBody key={pile.id} type="fixed" colliders={false}>
            {/* Left bucket wall */}
            <CuboidCollider
              args={[WALL_THICKNESS, BUCKET_HEIGHT / 2, 1]}
              position={[lx, WALL_Y, 0]}
            />
            {/* Right bucket wall */}
            <CuboidCollider
              args={[WALL_THICKNESS, BUCKET_HEIGHT / 2, 1]}
              position={[rx, WALL_Y, 0]}
            />
            {/* Bucket floor */}
            <CuboidCollider
              args={[pile.halfW + WALL_THICKNESS, WALL_THICKNESS, 1]}
              position={[pile.cx, BUCKET_FLOOR_Y, 0]}
            />
          </RigidBody>
        );
      })}
    </>
  );
}

/**
 * Visual pile labels rendered in DOM via drei Html so they match
 * the design system perfectly.
 */
export function PileLabels() {
  return (
    <>
      {PILES.map((pile) => (
        <Html
          key={pile.id}
          position={[pile.cx, BUCKET_FLOOR_Y - 0.55, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="whitespace-nowrap rounded border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{
              borderColor: `${pile.color}40`,
              backgroundColor: `${pile.color}18`,
              color: pile.color,
            }}
          >
            {pile.label}
          </div>
        </Html>
      ))}
    </>
  );
}
