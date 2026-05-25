/**
 * Composed shader strings for the dashboard hero demo.
 *
 * Chunks are concatenated TS-side because our webpack `asset/source`
 * loader doesn't process `#pragma glslify:` directives.
 */

import { composeShader } from '@/lib/shader';

import valueRemap from '@/shaders/lib/value-remap.glsl';
import simplex from '@/shaders/lib/simplex-2d.glsl';
import noiseHero from '@/shaders/noise-hero.frag.glsl';
import uvPass from '@/shaders/uv-pass.vert.glsl';

export const vertexShader = uvPass;

export const fragmentShader = composeShader(valueRemap, simplex, noiseHero);
