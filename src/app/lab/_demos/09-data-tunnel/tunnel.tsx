'use client';

/**
 * TunnelShader — R3F mesh that runs the ray-marched SDF tunnel.
 *
 * Reads a shared scroll-position ref each frame; no React state is mutated
 * inside useFrame so the component never re-renders from this path.
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Color, Vector2, type ShaderMaterial } from 'three';
import { DemoView } from '@/components/demo-view';
import { useUniforms } from '@/lib/uniforms';
import { fragmentShader, vertexShader } from './shader';

interface TunnelShaderProps {
  /** Shared ref — value is the smoothed scroll progress in [0, 1]. */
  scrollRef: React.RefObject<number>;
}

export function TunnelShader({ scrollRef }: TunnelShaderProps) {
  return (
    <DemoView className="absolute inset-0 h-full w-full">
      <TunnelMesh scrollRef={scrollRef} />
    </DemoView>
  );
}

function TunnelMesh({ scrollRef }: TunnelShaderProps) {
  const matRef = useRef<ShaderMaterial>(null);
  const { size } = useThree();

  const uniforms = useUniforms({
    uTime: 0,
    uResolution: new Vector2(size.width, size.height),
    uScroll: 0,
    uTint: new Color('#67e8f9'),
  });

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uResolution.value.set(size.width, size.height);
    uniforms.uScroll.value = scrollRef.current ?? 0;
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
