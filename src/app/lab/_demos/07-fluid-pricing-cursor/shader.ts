/**
 * Shader composition for demo 07 — fluid pricing cursor.
 *
 * Three passes:
 *   1. decayShader  — fade + diffuse the existing trail buffer
 *   2. splatShader  — paint a gaussian blob at the pointer position
 *   3. colorizeShader — composite the trail onto the full-screen quad
 *
 * All use the standard UV pass-through vertex shader.
 */

import { composeShader } from '@/lib/shader';

import uvPass from '@/shaders/uv-pass.vert.glsl';
import decayFrag from './decay.frag.glsl';
import splatFrag from './splat.frag.glsl';
import colorizeFrag from './colorize.frag.glsl';

export const vertexShader = uvPass;

/** Pass 1 — decay + diffuse the trail */
export const decayFragmentShader = composeShader(decayFrag);

/** Pass 2 — splat a gaussian blob at the pointer */
export const splatFragmentShader = composeShader(splatFrag);

/** Pass 3 — compositing pass, renders to screen */
export const colorizeFragmentShader = composeShader(colorizeFrag);
