'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, Vector2, type OrthographicCamera, type ShaderMaterial } from 'three';
import { OrthoShaderCanvas } from '@/components/ortho-shader-canvas';
import { useUniforms } from '@/lib/uniforms';
import { fragmentShader, vertexShader } from './hero-shader';

/**
 * Dedicated orthographic Canvas for the landing hero.
 *
 * The global R3F Canvas in the root layout uses a perspective camera,
 * which scissor-clips drei <View> children at a fixed distance — that
 * causes a 2x2 full-screen quad to render as a small center patch.
 * Here we mount a self-contained ortho Canvas locked to NDC so the
 * full-bleed shader actually fills the hero rect. Frameloop/dpr gating
 * (static on mobile) lives in OrthoShaderCanvas.
 */
export function HeroStage() {
  return (
    <OrthoShaderCanvas>
      <HeroShaderMesh />
    </OrthoShaderCanvas>
  );
}

function HeroShaderMesh() {
  const matRef = useRef<ShaderMaterial>(null);
  const { size, camera } = useThree();

  const ortho = camera as OrthographicCamera;
  ortho.left = -1;
  ortho.right = 1;
  ortho.top = 1;
  ortho.bottom = -1;
  ortho.updateProjectionMatrix();

  const uniforms = useUniforms({
    uTime: 0,
    uResolution: new Vector2(size.width, size.height),
    uMouse: new Vector2(0.5, 0.5),
    uTint: new Color('#67e8f9'),
    uIntensity: 1.0,
  });

  useFrame(({ clock, pointer }) => {
    if (!matRef.current) return;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uResolution.value.set(size.width, size.height);
    const targetX = pointer.x * 0.5 + 0.5;
    const targetY = pointer.y * 0.5 + 0.5;
    const m = uniforms.uMouse.value;
    m.x += (targetX - m.x) * 0.06;
    m.y += (targetY - m.y) * 0.06;
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
