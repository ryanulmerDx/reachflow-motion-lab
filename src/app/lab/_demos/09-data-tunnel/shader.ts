/**
 * Shader strings for the data-tunnel ray-march demo.
 *
 * The fragment shader is authored in tunnel.frag.glsl (no glslify pragmas).
 * It only needs the standard UV-pass vertex shader — no utility chunks.
 */

import { composeShader } from '@/lib/shader';
import uvPass from '@/shaders/uv-pass.vert.glsl';
import tunnelFrag from './tunnel.frag.glsl';

export const vertexShader: string = uvPass;

// composeShader prepends the precision header then joins all parts.
// The tunnel frag is self-contained so it's the only part after the header.
export const fragmentShader: string = composeShader(tunnelFrag);
