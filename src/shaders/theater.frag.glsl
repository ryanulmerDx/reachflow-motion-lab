// Cinematic theater backdrop. One shader, ten visual signatures.
//
// Expects snoise(vec2) and valueRemap() from the chunks composed above.
//
// Uniforms:
//   uTime       — seconds
//   uResolution — viewport px
//   uMouse      — pointer [0,1]
//   uActiveA    — current demo index (0..9), as float
//   uActiveB    — next demo index
//   uMix        — crossfade [0,1] between A and B
//   uTintA      — current accent color
//   uTintB      — next accent color

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uActiveA;
uniform float uActiveB;
uniform float uMix;
uniform vec3  uTintA;
uniform vec3  uTintB;

varying vec2 vUv;

mat2 rot(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

// Per-demo parametric noise field. idx selects frequency, warp, angle, motion.
float field(vec2 uv, float idx, float t) {
  float scale  = 1.3 + mod(idx, 5.0) * 0.55;
  float speed  = 0.06 + mod(idx, 4.0) * 0.03;
  float warp   = 0.35 + mod(idx, 3.0) * 0.45;
  float angle  = idx * 0.41;
  float drift  = 0.2 + mod(idx + 1.0, 3.0) * 0.22;

  vec2 p = uv - 0.5;
  p = rot(angle + t * 0.03) * p;
  p += 0.5;

  vec2 flow = vec2(t * drift * 0.12, -t * drift * 0.08);

  float n1 = snoise(p * scale + flow);
  float n2 = snoise(p * scale * 1.9 - flow * 1.4 + n1 * warp);
  float n3 = snoise(p * scale * 4.2 + n2 * warp * 0.7 + t * speed * 0.4);

  float v = 0.55 * n1 + 0.32 * n2 + 0.18 * n3;
  return valueRemap(v, -1.2, 1.2, 0.0, 1.0);
}

// Big soft caustic blob that drifts. Gives each chapter a glowing core.
float aura(vec2 uv, float idx, float t) {
  vec2 c = vec2(
    0.55 + 0.18 * sin(t * 0.08 + idx * 1.7),
    0.45 + 0.16 * cos(t * 0.07 + idx * 2.1)
  );
  float r = length((uv - c) * vec2(uResolution.x / uResolution.y, 1.0));
  return smoothstep(0.65, 0.0, r);
}

void main() {
  vec2 uv = vUv;

  // Aspect-correct mouse parallax
  vec2 m = (uMouse - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  uv += m * 0.04;

  float fA = field(uv, uActiveA, uTime);
  float fB = field(uv, uActiveB, uTime);
  float f  = mix(fA, fB, uMix);

  float gA = aura(uv, uActiveA, uTime);
  float gB = aura(uv, uActiveB, uTime);
  float g  = mix(gA, gB, uMix);

  vec3 tint = mix(uTintA, uTintB, uMix);

  // Bigger, brighter palette — readable without overpowering the type.
  vec3 deepBase = vec3(0.04, 0.045, 0.07);
  vec3 midBase  = vec3(0.09, 0.10, 0.14);
  vec3 base     = mix(deepBase, midBase, smoothstep(0.1, 0.9, f));

  // Layer the noise field — strong mid-tones, generous tint contribution.
  vec3 col = mix(base, tint * 0.85, pow(f, 1.15) * 1.05);

  // Pour in the aura as a glowing highlight.
  col = mix(col, col + tint * 0.95, g * 0.55);

  // Cool rim toward the edges to keep the stage feeling deep.
  float rim = smoothstep(0.45, 0.95, length(uv - 0.5));
  col = mix(col, col * vec3(0.6, 0.65, 0.85), rim * 0.4);

  // Subtle grain to kill banding
  float grain = fract(sin(dot(uv * uResolution, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
