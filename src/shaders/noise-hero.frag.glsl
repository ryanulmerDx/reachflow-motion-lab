// Noise-hero fragment body.
// Expects `snoise(vec2)` (simplex-2d.glsl) and `valueRemap(float, ...)`
// (value-remap.glsl) to be defined above via composeShader().
//
// Uniforms:
//   uTime        — seconds since mount
//   uResolution  — viewport in px
//   uMouse       — pointer in [0,1] viewport-relative
//   uTint        — color the noise lerps toward
//   uIntensity   — overall noise contribution [0,1]

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform vec3  uTint;
uniform float uIntensity;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Aspect-correct mouse offset
  vec2 m = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  // Two octaves of simplex, offset by time + mouse
  float n =
      0.55 * snoise(uv * 2.4 + m * 0.6 + uTime * 0.07)
    + 0.30 * snoise(uv * 5.1 - m * 0.3 - uTime * 0.13);

  // Remap to [0,1]
  float v = valueRemap(n, -0.9, 0.9, 0.0, 1.0);

  // Soft vignette to keep the card edges quiet
  float vignette = smoothstep(0.0, 0.6, 1.0 - length(uv - 0.5));

  // Base: deep navy → tint based on noise
  vec3 base = vec3(0.03, 0.04, 0.07);
  vec3 col  = mix(base, uTint, v * uIntensity);
  col *= 0.55 + 0.45 * vignette;

  gl_FragColor = vec4(col, 1.0);
}
