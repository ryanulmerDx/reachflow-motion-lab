// Data Tunnel — ray-marched SDF cylinder with concentric ring modulation.
//
// Uniforms:
//   uTime       — seconds since mount (ticks even when scroll is idle)
//   uResolution — viewport dimensions in px
//   uScroll     — scroll progress [0, 1] (normalized window.scrollY)
//   uTint       — accent colour (#67e8f9 cyan)
//
// vUv comes from uv-pass.vert.glsl

uniform float uTime;
uniform vec2  uResolution;
uniform float uScroll;
uniform vec3  uTint;

varying vec2  vUv;

// ─── SDF helpers ─────────────────────────────────────────────────────────────

// Infinite cylinder, radius r, axis along Z
float sdCylinder(vec3 p, float r) {
  return sqrt(p.x * p.x + p.y * p.y) - r;
}

// Scene SDF: tunnel interior — we're inside the cylinder so negate.
// Rings are added as a low-frequency sin ripple on p.z.
float sceneDist(vec3 p) {
  float r        = sqrt(p.x * p.x + p.y * p.y);
  float ring     = sin(p.z * 3.2 + uTime * 0.4) * 0.12
                 + sin(p.z * 7.1 - uTime * 0.7) * 0.05;
  // Tunnel radius ~2.0, modulated by rings
  float tunnel   = (2.0 - r) + ring;
  return tunnel;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

void main() {
  vec2 uv = vUv * 2.0 - 1.0;

  // Correct for aspect ratio so the tunnel stays circular
  float aspect = uResolution.x / uResolution.y;
  uv.x *= aspect;

  // Ray origin advances along Z: uTime keeps it drifting, uScroll jumps it
  vec3 ro = vec3(0.0, 0.0, uTime * 1.2 + uScroll * 20.0);

  // Slight barrel-lens feel — z stays at 1.4
  vec3 rd = normalize(vec3(uv, 1.4));

  // ─── Ray march ───────────────────────────────────────────────────────────
  float t    = 0.0;
  float tMax = 60.0;
  int   hit  = 0;

  for (int i = 0; i < 64; i++) {
    vec3  p = ro + rd * t;
    float d = sceneDist(p);

    if (d < 0.001) {
      hit = 1;
      break;
    }
    if (t > tMax) break;

    // Step conservatively because we're inside the SDF (d can be negative near wall)
    t += max(d, 0.02) * 0.55;
  }

  // ─── Shading ─────────────────────────────────────────────────────────────

  // Radial vignette — darkens the outer rim each frame
  float vig = 1.0 - dot(uv / vec2(aspect, 1.0), uv / vec2(aspect, 1.0)) * 0.55;

  // Depth fog: objects close to the camera are more lit
  float fog = exp(-t * 0.045);

  // Fresnel-ish rim: things tangent to the ray get the accent colour
  float rim = 1.0 - clamp(fog, 0.0, 1.0);

  // Tunnel wall colour — dark near-black base, cyan tint at the lit surface
  vec3 baseCol = vec3(0.02, 0.03, 0.06);

  // Ring pulse: re-evaluate scene at hit point for colour modulation
  vec3  hitP   = ro + rd * t;
  float rings  = 0.5 + 0.5 * sin(hitP.z * 3.2 + uTime * 0.4);
  float rings2 = 0.5 + 0.5 * sin(hitP.z * 7.1 - uTime * 0.7);
  float rPulse = rings * 0.6 + rings2 * 0.25;

  vec3 wallCol = mix(baseCol, uTint * 0.55, fog * rPulse * 0.8 + rim * 0.25);

  // Central glow tube — a bloom along the ray axis
  float axisDist = length(uv / vec2(aspect, 1.0));
  float glow     = exp(-axisDist * axisDist * 14.0) * 0.35;
  vec3  glowCol  = uTint * glow;

  vec3 col = wallCol + glowCol;

  // Vignette + subtle global brightness
  col *= vig;
  col  = clamp(col, 0.0, 1.0);

  // Gamma
  col = pow(col, vec3(0.4545));

  gl_FragColor = vec4(col, 1.0);
}
