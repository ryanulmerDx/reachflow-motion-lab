'use client';

/**
 * FluidTrail — GPU trail buffer ping-pong renderer.
 *
 * Architecture (two-target ping-pong):
 *   Each frame, useFrame (high priority):
 *     1. Decay+diffuse: render readFBO → decayMat → writeFBO
 *     2. Splat: render writeFBO (additive) → writeFBO (Gaussian blob at pointer)
 *     3. Swap readFBO ↔ writeFBO
 *     4. Point the screen colorize mesh at the new readFBO (= freshest trail)
 *
 *   R3F's own render then draws the colorize mesh to the DemoView canvas.
 *
 *   The DemoView is position:fixed, pointer-events:none — DOM sits above it.
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import {
  colorizeFragmentShader,
  decayFragmentShader,
  splatFragmentShader,
  vertexShader,
} from './shader';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Internal sim resolution — cheap and effective */
const SIM_W = 512;
const SIM_H = 512;

/** Tier accent colors */
const TIER_COLORS: Record<string, Color> = {
  neutral: new Color(0.18, 0.18, 0.20),
  starter: new Color(0.78, 0.78, 0.80),
  pro:     new Color(0.404, 0.910, 0.976),  // #67e8f9
  studio:  new Color(0.753, 0.518, 0.988),  // #c084fc
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FluidTrailProps {
  hoveredTierRef: React.RefObject<string>;
  pointerRef: React.RefObject<{ x: number; y: number }>;
  velocityRef: React.RefObject<number>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeFBO(): WebGLRenderTarget {
  return new WebGLRenderTarget(SIM_W, SIM_H, {
    depthBuffer: false,
    stencilBuffer: false,
  });
}

/** Orthographic camera for blit passes — covers the [-1,1] NDC quad exactly */
function makeBlitCamera(): OrthographicCamera {
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return cam;
}

function makeDecayMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader: decayFragmentShader,
    uniforms: {
      uTrail:      { value: null },
      uResolution: { value: new Vector2(SIM_W, SIM_H) },
    },
    depthWrite: false,
    depthTest: false,
  });
}

function makeSplatMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader: splatFragmentShader,
    uniforms: {
      // No uTrail — splat is purely additive, no read-back needed
      uPointer:  { value: new Vector2(0.5, 0.5) },
      uVelocity: { value: 0 },
      uColor:    { value: new Color(0.404, 0.910, 0.976) },
      uAspect:   { value: SIM_W / SIM_H },
    },
    blending:    AdditiveBlending,
    transparent: true,
    depthWrite:  false,
    depthTest:   false,
  });
}

function makeColorizeMaterial(initialTexture: WebGLRenderTarget['texture']): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader: colorizeFragmentShader,
    uniforms: {
      uTrail:   { value: initialTexture },
      uOpacity: { value: 1.0 },
    },
    transparent: true,
    depthWrite:  false,
    depthTest:   false,
    blending:    AdditiveBlending,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FluidTrail({ hoveredTierRef, pointerRef, velocityRef }: FluidTrailProps) {
  const { gl, size } = useThree();

  // ── Off-screen resources (created once) ──────────────────────────────────
  const fboA = useMemo(makeFBO, []);
  const fboB = useMemo(makeFBO, []);
  const blitScene = useMemo(() => new Scene(), []);
  const blitCamera = useMemo(makeBlitCamera, []);
  const blitQuad = useMemo(() => new Mesh(new PlaneGeometry(2, 2)), []);

  const decayMat = useMemo(makeDecayMaterial, []);
  const splatMat = useMemo(makeSplatMaterial, []);

  // The colorize material drives the visible R3F mesh.
  // Stable across the component lifetime — fboA never changes.
  const colorizeMat = useMemo(() => makeColorizeMaterial(fboA.texture), [fboA]);

  // Ping-pong state
  const pingRef = useRef({ read: fboA, write: fboB });

  // Smooth color lerp
  const currentColor = useMemo(() => new Color(TIER_COLORS.neutral), []);

  // ── useFrame: FBO blit passes (priority 2, runs before View's priority-1 render) ──
  // drei's View uses priority=1 to scissor-render its scene. We run at priority 2
  // so our off-screen FBO work finishes first, then View draws the colorize mesh
  // into its scissored region.
  //
  // Priority > 0 means R3F skips its own autoClear — View handles that itself.
  // We must NOT call gl.render(scene, camera) here; View does that for us.

  useFrame(() => {
    const { read, write } = pingRef.current;

    // — Resolve color target —
    const tierKey = hoveredTierRef.current ?? 'neutral';
    const targetColor = TIER_COLORS[tierKey] ?? TIER_COLORS.neutral!;
    currentColor.lerp(targetColor, 0.10);

    // — Pointer & velocity —
    const ptr = pointerRef.current ?? { x: 0.5, y: 0.5 };
    const vel = Math.min(velocityRef.current ?? 0, 1.0);
    const screenAspect = size.width / size.height;

    // ── Pass 1: Decay + diffuse (read → write) ─────────────────────────────
    decayMat.uniforms.uTrail!.value = read.texture;
    blitQuad.material = decayMat;
    blitScene.clear();
    blitScene.add(blitQuad);

    gl.setRenderTarget(write);
    gl.clear();
    gl.render(blitScene, blitCamera);

    // ── Pass 2: Splat (additive onto write — no texture read-back) ────────
    // Additive blending accumulates the gaussian on top of the decay result.
    // We stay on the same write render target from Pass 1 — no clear needed.
    // uAspect uses screen ratio so the blob looks circular on the display.
    // Flip Y: canvas UV 0=bottom, DOM pointer 0=top
    splatMat.uniforms.uPointer!.value.set(ptr.x, 1.0 - ptr.y);
    splatMat.uniforms.uVelocity!.value = vel;
    splatMat.uniforms.uColor!.value.copy(currentColor);
    splatMat.uniforms.uAspect!.value = screenAspect;

    blitQuad.material = splatMat;
    blitScene.clear();
    blitScene.add(blitQuad);

    gl.render(blitScene, blitCamera);

    // ── Restore default render target ─────────────────────────────────────
    // View will scissor-render the scene into its own rect after this.
    gl.setRenderTarget(null);

    // ── Swap ping-pong ─────────────────────────────────────────────────────
    pingRef.current = { read: write, write: read };

    // Point the colorize material at the freshly baked buffer (post-swap = write)
    colorizeMat.uniforms.uTrail!.value = write.texture;
  }, 2);

  // ── Visible colorize mesh ─────────────────────────────────────────────────
  // A full-screen plane. Scale is [aspect*2, 2, 1] with a unit geometry
  // so it fills the entire DemoView viewport.
  const aspect = size.width / size.height;

  return (
    <mesh scale={[aspect * 2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      {/* primitive attaches the pre-built ShaderMaterial directly */}
      <primitive object={colorizeMat} attach="material" />
    </mesh>
  );
}
