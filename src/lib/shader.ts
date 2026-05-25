/**
 * Shader composition helpers.
 *
 * Our webpack `asset/source` loader treats `*.glsl` files as raw strings
 * and does NOT process `#pragma glslify:` directives. So we compose
 * shaders on the TS side: import chunks as strings, join with `composeShader`.
 *
 * Each composed shader gets a single GLSL precision directive prepended,
 * then chunks (utility functions) in order, then the main fragment/vertex
 * body. Chunks should be order-independent (define before use).
 */

const PRECISION_HEADER = 'precision highp float;\n';

/**
 * Concatenate a list of GLSL strings, ensuring the precision header is
 * present exactly once at the top.
 */
export function composeShader(...parts: ReadonlyArray<string>): string {
  return [PRECISION_HEADER, ...parts].join('\n\n');
}
