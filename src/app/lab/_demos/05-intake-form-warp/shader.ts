/**
 * Composed shader strings for the intake-form-warp header backdrop.
 *
 * Chunks are concatenated TS-side — `asset/source` webpack loader does NOT
 * process #pragma glslify directives.
 */

import { composeShader } from '@/lib/shader';

import simplex from '@/shaders/lib/simplex-2d.glsl';
import uvPass from '@/shaders/uv-pass.vert.glsl';
import headerFrag from './header-shader.frag.glsl';

export const vertexShader = uvPass;
export const fragmentShader = composeShader(simplex, headerFrag);
