/**
 * Type-safe uniform helpers for R3F + three.js ShaderMaterial.
 *
 * `useUniforms` returns a stable, memoized uniforms object whose `.value`
 * fields are safe to mutate inside `useFrame` (the standard R3F idiom).
 * Mutation is intentional here — three's renderer reads `.value` by reference
 * once per frame, so allocating new objects per tick would create GC churn.
 *
 * Usage:
 *   const uniforms = useUniforms({
 *     uTime: 0,
 *     uMouse: new Vector2(0.5, 0.5),
 *     uTint: new Color('#67e8f9'),
 *   });
 *
 *   useFrame(({ clock, pointer }) => {
 *     uniforms.uTime.value = clock.elapsedTime;
 *     uniforms.uMouse.value.set(pointer.x * 0.5 + 0.5, pointer.y * 0.5 + 0.5);
 *   });
 *
 *   <shaderMaterial uniforms={uniforms} ... />
 */

import { useMemo } from 'react';

export type UniformValue =
  | number
  | boolean
  | { readonly isVector2: true }
  | { readonly isVector3: true }
  | { readonly isVector4: true }
  | { readonly isColor: true }
  | { readonly isMatrix3: true }
  | { readonly isMatrix4: true }
  | { readonly isTexture: true };

export type UniformsRecord = Readonly<Record<string, UniformValue>>;

export type Uniforms<T extends UniformsRecord> = {
  [K in keyof T]: { value: T[K] };
};

/**
 * Build a stable uniforms object for `<shaderMaterial uniforms={...} />`.
 * Initial values are read ONCE on mount — change them later by mutating
 * `.value` inside `useFrame`, not by re-calling this hook.
 */
export function useUniforms<T extends UniformsRecord>(initial: T): Uniforms<T> {
  return useMemo(() => {
    const out = {} as Uniforms<T>;
    for (const key in initial) {
      out[key] = { value: initial[key] } as Uniforms<T>[typeof key];
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
