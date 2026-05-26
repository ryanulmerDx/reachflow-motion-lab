// colorize.frag.glsl — Final compositing pass.
//
// Samples the baked trail buffer and maps the accumulated glow to a
// visually pleasing output with soft edge falloff.
//
// The trail buffer RGB already contains the tier-tinted color from the
// splat pass, so we just need to tonemap and fade the alpha edge.
//
// Uniforms:
//   uTrail      — the baked trail render target
//   uOpacity    — global opacity multiplier (fade in/out)

uniform sampler2D uTrail;
uniform float     uOpacity;

varying vec2 vUv;

void main() {
  vec4 trail = texture2D(uTrail, vUv);

  // Soft vignette — push edges of the full-screen quad toward transparent
  // so the trail feels like it lives IN the page rather than over it.
  float edge = 1.0 - smoothstep(0.35, 0.5, length(vUv - 0.5));

  // Boost the bright core slightly, let the dim fringe stay subtle
  vec3 boosted = trail.rgb * (1.0 + trail.a * 0.4);

  float alpha = trail.a * edge * uOpacity;

  gl_FragColor = vec4(boosted, alpha);
}
