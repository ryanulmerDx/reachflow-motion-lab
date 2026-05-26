// splat.frag.glsl — Gaussian splat into the trail buffer (additive).
//
// Paints a soft radial blob at the current pointer position.
// This pass uses AdditiveBlending so it accumulates on top of whatever
// the decay pass already wrote to the render target — no texture read needed.
//
// Blob radius grows with pointer velocity (fast swipes = bigger splat).
//
// Uniforms:
//   uPointer    — pointer position in [0,1] UV space (Y flipped to match canvas)
//   uVelocity   — pointer speed in normalized units [0,1]
//   uColor      — current accent color (tier-aware, pre-lerped on JS side)
//   uAspect     — canvas width / height for isotropic blob shape

uniform vec2  uPointer;
uniform float uVelocity;
uniform vec3  uColor;
uniform float uAspect;

varying vec2 vUv;

void main() {
  // Aspect-correct UV so the blob is circular, not elliptical
  vec2 uv  = vec2(vUv.x * uAspect, vUv.y);
  vec2 ptr = vec2(uPointer.x * uAspect, uPointer.y);

  // Gaussian blob radius grows with velocity: resting ~2%, fast ~5%
  float radius = mix(0.022, 0.060, clamp(uVelocity, 0.0, 1.0));

  float dist   = length(uv - ptr);
  float gauss  = exp(-dist * dist / (2.0 * radius * radius));

  // Output is added to whatever is already in the FBO via AdditiveBlending
  gl_FragColor = vec4(uColor * gauss, gauss);
}
