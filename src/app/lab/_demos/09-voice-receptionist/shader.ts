/**
 * Shader composition for demo 09 — voice receptionist waveform.
 *
 * Single fragment pass over a full-quad, driven by uTime/uAmp/uColor.
 * Uses the shared UV pass-through vertex shader.
 */

import { composeShader } from '@/lib/shader';

import uvPass from '@/shaders/uv-pass.vert.glsl';
import waveformFrag from './waveform.frag.glsl';

export const vertexShader = uvPass;

export const waveformFragmentShader = composeShader(waveformFrag);
