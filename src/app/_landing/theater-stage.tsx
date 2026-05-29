'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, Vector2, type OrthographicCamera, type ShaderMaterial } from 'three';
import { useUniforms } from '@/lib/uniforms';
import { composeShader } from '@/lib/shader';
import { DEMOS } from '@/lib/demo-registry';

import valueRemap from '@/shaders/lib/value-remap.glsl';
import simplex from '@/shaders/lib/simplex-2d.glsl';
import theaterFrag from '@/shaders/theater.frag.glsl';
import uvPass from '@/shaders/uv-pass.vert.glsl';

const fragmentShader = composeShader(valueRemap, simplex, theaterFrag);
const vertexShader = uvPass;

const DEMO_TINTS: Readonly<Record<string, readonly [string, string]>> = {
  'booking-flow': ['#fbbf24', '#f97316'],
  'cursor-aware-crm': ['#60a5fa', '#3b82f6'],
  'shader-dashboard-hero': ['#a78bfa', '#7c3aed'],
  'portal-transitions': ['#67e8f9', '#0891b2'],
  'intake-form-warp': ['#f472b6', '#ec4899'],
  'listing-explorer': ['#67e8f9', '#34d399'],
  'fluid-pricing-cursor': ['#34d399', '#10b981'],
  'automation-pipeline': ['#fb7185', '#e11d48'],
  'voice-receptionist': ['#67e8f9', '#c084fc'],
  'field-inventory': ['#fdba74', '#ea580c'],
};

function tintFor(slug: string): readonly [string, string] {
  return DEMO_TINTS[slug] ?? ['#67e8f9', '#0891b2'];
}

interface TheaterStageProps {
  progressRef: { current: number };
}

export function TheaterStage({ progressRef }: TheaterStageProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], near: 0, far: 2, zoom: 1 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <TheaterShader progressRef={progressRef} />
    </Canvas>
  );
}

function TheaterShader({ progressRef }: TheaterStageProps) {
  const matRef = useRef<ShaderMaterial>(null);
  const { size, camera } = useThree();

  // Lock orthographic camera to NDC so a [2,2] plane fills the view exactly.
  const ortho = camera as OrthographicCamera;
  ortho.left = -1;
  ortho.right = 1;
  ortho.top = 1;
  ortho.bottom = -1;
  ortho.updateProjectionMatrix();

  const initialA = tintFor(DEMOS[0]!.slug)[0];
  const initialB = tintFor(DEMOS[1]!.slug)[0];

  const uniforms = useUniforms({
    uTime: 0,
    uResolution: new Vector2(size.width, size.height),
    uMouse: new Vector2(0.5, 0.5),
    uActiveA: 0,
    uActiveB: 1,
    uMix: 0,
    uTintA: new Color(initialA),
    uTintB: new Color(initialB),
  });

  const colorCacheRef = useRef<Map<string, Color>>(new Map());
  const getColor = (hex: string): Color => {
    let c = colorCacheRef.current.get(hex);
    if (!c) {
      c = new Color(hex);
      colorCacheRef.current.set(hex, c);
    }
    return c;
  };

  const smoothMixRef = useRef(0);
  const smoothARef = useRef(0);
  const smoothBRef = useRef(1);

  useFrame(({ clock, pointer }) => {
    if (!matRef.current) return;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uResolution.value.set(size.width, size.height);

    const targetX = pointer.x * 0.5 + 0.5;
    const targetY = pointer.y * 0.5 + 0.5;
    const m = uniforms.uMouse.value;
    m.x += (targetX - m.x) * 0.06;
    m.y += (targetY - m.y) * 0.06;

    const p = progressRef.current;
    const fIdx = p * DEMOS.length;
    const idxA = Math.min(Math.floor(fIdx), DEMOS.length - 1);
    const idxB = Math.min(idxA + 1, DEMOS.length - 1);
    const raw = Math.min(Math.max(fIdx - idxA, 0), 1);

    smoothARef.current += (idxA - smoothARef.current) * 0.12;
    smoothBRef.current += (idxB - smoothBRef.current) * 0.12;
    smoothMixRef.current += (raw - smoothMixRef.current) * 0.1;

    uniforms.uActiveA.value = smoothARef.current;
    uniforms.uActiveB.value = smoothBRef.current;
    uniforms.uMix.value = smoothMixRef.current;

    const tintA = tintFor(DEMOS[idxA]!.slug)[0];
    const tintB = tintFor(DEMOS[idxB]!.slug)[0];
    uniforms.uTintA.value.lerp(getColor(tintA), 0.08);
    uniforms.uTintB.value.lerp(getColor(tintB), 0.08);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
