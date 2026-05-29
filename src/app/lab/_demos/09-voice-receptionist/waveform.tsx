'use client';

/**
 * VoiceWaveform — audio-reactive waveform rendered into a DemoView region.
 *
 * Reads two refs every frame (no React re-renders on the hot path):
 *   - ampRef:   speaking amplitude [0,1], eased for smoothness
 *   - colorRef: a THREE.Color the parent mutates on speaker change
 *
 * Mirrors the DemoView + useFrame + ShaderMaterial pattern from demos 07/08.
 */

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, Color, ShaderMaterial } from 'three';
import { vertexShader, waveformFragmentShader } from './shader';

export interface VoiceWaveformProps {
  ampRef: React.RefObject<number>;
  colorRef: React.RefObject<Color>;
}

export function VoiceWaveform({ ampRef, colorRef }: VoiceWaveformProps) {
  const { size } = useThree();

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader: waveformFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0 },
          uColor: { value: new Color('#67e8f9') },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      }),
    []
  );

  useFrame((_, delta) => {
    const u = material.uniforms;
    u.uTime!.value += delta;
    // Ease the displayed amplitude toward the target for a fluid swell
    const target = ampRef.current ?? 0;
    u.uAmp!.value += (target - u.uAmp!.value) * 0.2;
    const c = colorRef.current;
    if (c) (u.uColor!.value as Color).lerp(c, 0.15);
  });

  const aspect = size.width / size.height;

  return (
    <mesh scale={[aspect * 2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
