// Intake-form-warp — scroll-velocity header backdrop shader.
// Expects snoise(vec2) (simplex-2d.glsl) to be composed above via composeShader().
//
// Uniforms:
//   uTime       — seconds since mount
//   uResolution — viewport in px
//   uVelocity   — smoothed scroll velocity in [-1, 1]
//   uTint       — accent colour to blend toward at peak velocity

uniform float uTime;
uniform vec2  uResolution;
uniform float uVelocity;
uniform vec3  uTint;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  float aspect = uResolution.x / uResolution.y;
  vec2 st = vec2(uv.x * aspect, uv.y);

  // Velocity abs for intensity, sign for skew direction
  float vel     = uVelocity;            // [-1, 1]
  float speed   = abs(vel);             // [0, 1]
  float skewDir = sign(vel);            // -1 or 1

  // UV distortion grows with scroll velocity — skews horizontally
  float distort = vel * 0.18 * (uv.y - 0.5);
  vec2 distUv   = vec2(uv.x + distort, uv.y);
  vec2 distSt   = vec2(distUv.x * aspect, distUv.y);

  // Base noise — two octaves, slow drift
  float n =
      0.55 * snoise(distSt * 1.8 + uTime * 0.055)
    + 0.30 * snoise(distSt * 3.6 - uTime * 0.09 + skewDir * 0.4);

  // Velocity-driven ripple — extra octave that kicks in while scrolling
  float ripple = snoise(distSt * 5.5 + vec2(uTime * 0.22, vel * 1.5));
  n += ripple * speed * 0.35;

  // Remap to [0, 1]
  float v = clamp((n + 1.0) * 0.5, 0.0, 1.0);

  // Vertical edge fade — quieter at top and bottom of the shard
  float fade = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.75, uv.y);

  // Horizontal center glow brightens with velocity
  float cx   = 1.0 - abs(uv.x - 0.5) * 2.0;
  float glow = cx * cx * speed * 0.6;

  // Base: near-black background colour of the lab
  vec3 base = vec3(0.031, 0.031, 0.039); // #080809

  // Calm: faint blue-green bloom. Energetic: full accent colour surge
  vec3 calm  = mix(base, vec3(0.05, 0.12, 0.16), v * 0.35);
  vec3 hot   = mix(calm, uTint, speed * v * 0.65 + glow);

  vec3 col   = hot * (0.5 + 0.5 * fade);

  gl_FragColor = vec4(col, 1.0);
}
