// decay.frag.glsl — Trail buffer decay + fake-diffuse pass.
//
// Each frame:
//   1. Sample the previous trail texture.
//   2. Multiply alpha by decay factor (~0.96) to fade the trail.
//   3. Average 5 neighbors (center + NESW) for a soft diffusion blur.
//      This is a cheap approximation that produces a convincing fluid spread.
//
// Uniforms:
//   uTrail     — the previous frame's trail render target
//   uResolution — trail buffer size in px (for texel offset)

uniform sampler2D uTrail;
uniform vec2      uResolution;

varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / uResolution;

  // 5-tap box sample — center + 4 axis neighbors
  vec4 center = texture2D(uTrail, vUv);
  vec4 north  = texture2D(uTrail, vUv + vec2(0.0,  texel.y));
  vec4 south  = texture2D(uTrail, vUv + vec2(0.0, -texel.y));
  vec4 east   = texture2D(uTrail, vUv + vec2( texel.x, 0.0));
  vec4 west   = texture2D(uTrail, vUv + vec2(-texel.x, 0.0));

  // Weighted average: center gets more weight than neighbors
  vec4 diffused = (center * 4.0 + north + south + east + west) / 8.0;

  // Decay — multiplied each frame so trail fades in ~30 frames
  float decay = 0.955;
  gl_FragColor = diffused * decay;
}
