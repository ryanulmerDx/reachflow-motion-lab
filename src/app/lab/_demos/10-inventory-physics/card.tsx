'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { RigidBodyType } from '@dimforge/rapier3d-compat';
import type { Vector3Tuple } from 'three';
import { getPileConfig, xToPile, type InventoryItem, type PileId } from './inventory';

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W = 2.0;
const CARD_H = 1.3;
const CARD_DEPTH = 0.05;
const SETTLE_SPEED_THRESHOLD = 0.4; // world units / s
const SETTLE_DWELL_MS = 600; // how long card must be slow before logging

// ─── Pointer velocity tracker ─────────────────────────────────────────────────

/** Rolling window of recent pointer positions for fling velocity. */
type VelSample = { x: number; y: number; t: number };

function computeFlingVelocity(samples: VelSample[]): { vx: number; vy: number } {
  if (samples.length < 2) return { vx: 0, vy: 0 };
  const now = performance.now();
  // Use samples within last 100 ms
  const recent = samples.filter((s) => now - s.t < 100);
  if (recent.length < 2) return { vx: 0, vy: 0 };
  const first = recent[0]!;
  const last = recent[recent.length - 1]!;
  const dt = Math.max(last.t - first.t, 1) / 1000;
  return {
    vx: (last.x - first.x) / dt,
    vy: (last.y - first.y) / dt,
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CardProps {
  item: InventoryItem;
  initialPosition: Vector3Tuple;
  onSettle: (itemId: string, toPile: PileId) => void;
  /** Current canonical pile — used to detect pile changes between renders */
  currentPile: PileId;
}

// ─── Card component ───────────────────────────────────────────────────────────

export function Card({ item, initialPosition, onSettle, currentPile }: CardProps) {
  const rbRef = useRef<RapierRigidBody>(null);
  const { viewport, gl, camera } = useThree();
  // Cards are DOM overlays via drei Html, which doesn't scale with camera zoom
  // by default. Mirror the orthographic zoom (set in scene.tsx ResponsiveCamera)
  // so a CARD_W=2 world card always renders as 2 * zoom pixels wide. This
  // keeps card visuals consistent with the physics collider on any viewport.
  const zoom = 'zoom' in camera ? (camera.zoom as number) : 60;

  // Drag state
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const pointerSamples = useRef<VelSample[]>([]);
  const [dragging, setDragging] = useState(false);

  // Settle detection
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPileRef = useRef<PileId>(currentPile);
  const hasSettledInCurrentPile = useRef(false);

  // Convert pointer NDC to world space (orthographic camera)
  // Use the R3F canvas DOM element for a stable bounding rect.
  const ndcToWorld = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();

      // Normalise to [-1, 1] NDC space
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);

      // Orthographic unproject: NDC maps linearly to world coords
      const halfW = viewport.width / 2;
      const halfH = viewport.height / 2;
      return { x: nx * halfW, y: ny * halfH };
    },
    [viewport, gl]
  );

  // ── Pointer down (start drag) ──────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!rbRef.current) return;

      isDragging.current = true;
      setDragging(true);
      hasSettledInCurrentPile.current = false;
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);

      const rb = rbRef.current;
      rb.setBodyType(RigidBodyType.KinematicPositionBased, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);

      const world = ndcToWorld(e.clientX, e.clientY);
      const pos = rb.translation();
      dragOffset.current = { x: pos.x - world.x, y: pos.y - world.y };

      pointerSamples.current = [{ x: world.x, y: world.y, t: performance.now() }];

      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [ndcToWorld]
  );

  // ── Pointer move (during drag) — global listener on window ────────────────
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging.current || !rbRef.current) return;

      const world = ndcToWorld(e.clientX, e.clientY);

      // Keep rolling sample window (last 150 ms)
      const now = performance.now();
      pointerSamples.current.push({ x: world.x, y: world.y, t: now });
      pointerSamples.current = pointerSamples.current.filter((s) => now - s.t < 150);

      rbRef.current.setNextKinematicTranslation({
        x: world.x + dragOffset.current.x,
        y: world.y + dragOffset.current.y,
        z: 0,
      });
    },
    [ndcToWorld]
  );

  // ── Pointer up (release + fling) ───────────────────────────────────────────
  const handlePointerUp = useCallback(() => {
    if (!isDragging.current || !rbRef.current) return;

    isDragging.current = false;
    setDragging(false);

    const rb = rbRef.current;
    rb.setBodyType(RigidBodyType.Dynamic, true);

    const { vx, vy } = computeFlingVelocity(pointerSamples.current);
    // Cap velocity so cards don't escape at crazy speed
    const FLING_SCALE = 1.6;
    const MAX_V = 18;
    const clampedVx = Math.max(-MAX_V, Math.min(MAX_V, vx * FLING_SCALE));
    const clampedVy = Math.max(-MAX_V, Math.min(MAX_V, vy * FLING_SCALE));

    rb.setLinvel({ x: clampedVx, y: clampedVy, z: 0 }, true);

    pointerSamples.current = [];
  }, []);

  // Attach global pointer events so drag works even if pointer leaves the Html element
  useEffect(() => {
    const move = (e: PointerEvent) => handlePointerMove(e);
    const up = () => handlePointerUp();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [handlePointerMove, handlePointerUp]);

  // ── Settle detection (per-frame velocity check) ────────────────────────────
  useFrame(() => {
    if (isDragging.current || !rbRef.current) return;
    const rb = rbRef.current;
    const vel = rb.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
    const pos = rb.translation();
    const pile = xToPile(pos.x);

    if (speed < SETTLE_SPEED_THRESHOLD && pile !== null) {
      if (!settleTimerRef.current && !hasSettledInCurrentPile.current) {
        settleTimerRef.current = setTimeout(() => {
          settleTimerRef.current = null;
          if (!isDragging.current && rbRef.current) {
            const finalPos = rbRef.current.translation();
            const finalPile = xToPile(finalPos.x);
            if (finalPile && finalPile !== lastPileRef.current) {
              hasSettledInCurrentPile.current = true;
              lastPileRef.current = finalPile;
              onSettle(item.id, finalPile);
            } else if (finalPile === lastPileRef.current && !hasSettledInCurrentPile.current) {
              hasSettledInCurrentPile.current = true;
            }
          }
        }, SETTLE_DWELL_MS);
      }
    } else {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    }
  });

  // ── Cleanup timers on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const pileConfig = getPileConfig(item.pile);
  const qty0 = item.qty === 0;

  return (
    <RigidBody
      ref={rbRef}
      position={initialPosition}
      colliders={false}
      linearDamping={1.5}
      angularDamping={3.0}
      restitution={0.3}
      friction={0.6}
      mass={0.2}
    >
      <CuboidCollider args={[CARD_W / 2, CARD_H / 2, CARD_DEPTH / 2]} />

      {/* DOM card rendered via drei Html */}
      <Html
        center
        style={{
          width: `${CARD_W * zoom}px`,
          pointerEvents: 'auto',
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          className="relative rounded-xl border border-white/10 bg-[var(--color-bg)] shadow-lg shadow-black/40 transition-shadow"
          style={{
            boxShadow: dragging
              ? '0 20px 60px rgba(0,0,0,0.7)'
              : '0 4px 20px rgba(0,0,0,0.45)',
            background: 'rgb(10 12 18)',
            borderColor: dragging ? pileConfig.color + '80' : undefined,
          }}
        >
          {/* Pile color strip */}
          <div
            className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
            style={{ backgroundColor: pileConfig.color + '90' }}
          />

          <div className="px-4 py-3 pl-5">
            {/* Item name */}
            <p
              className="text-[11px] font-medium leading-tight"
              style={{ color: 'var(--color-ink)' }}
            >
              {item.name}
            </p>

            {/* SKU + qty row */}
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span
                className="font-mono text-[9px] uppercase tracking-[0.18em]"
                style={{ color: 'var(--color-ink-dim)' }}
              >
                {item.sku}
              </span>
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: qty0 ? '#f8717115' : `${pileConfig.color}18`,
                  color: qty0 ? '#f87171' : pileConfig.color,
                  border: `1px solid ${qty0 ? '#f8717140' : pileConfig.color + '40'}`,
                }}
              >
                {item.qty === 0 ? 'OUT' : `qty ${item.qty}`}
              </span>
            </div>
          </div>
        </div>
      </Html>
    </RigidBody>
  );
}
