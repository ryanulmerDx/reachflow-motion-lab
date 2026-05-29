// waveform.frag.glsl — audio-reactive voice waveform for the live-call demo.
//
// Draws a horizontal waveform centered on the quad. Amplitude (uAmp) swells
// while a speaker is talking and eases to a thin baseline during silence.
// uColor switches between the agent and caller accent. Rendered additively
// so it glows over the dark page.
//
// Uniforms:
//   uTime  — seconds, advances every frame for motion
//   uAmp   — speaking amplitude [0,1]
//   uColor — active speaker color

uniform float uTime;
uniform float uAmp;
uniform vec3  uColor;

varying vec2 vUv;

// Layered sines → an organic, speech-like waveform (not a clean tone).
float waveLayers(float x, float t) {
  return sin(x * 7.0  + t * 1.8) * 0.55
       + sin(x * 16.0 - t * 2.7) * 0.30
       + sin(x * 31.0 + t * 4.3) * 0.15;
}

void main() {
  float x = vUv.x;

  // Taper amplitude toward the horizontal edges so the wave fades in/out
  float edge = smoothstep(0.0, 0.10, x) * smoothstep(1.0, 0.90, x);
  float amp  = uAmp * 0.34 * edge;

  float w  = waveLayers(x, uTime) * amp;
  float dy = vUv.y - 0.5 - w;

  // Crisp core stroke + soft bloom around it
  float core = smoothstep(0.012, 0.0, abs(dy));
  float glow = exp(-abs(dy) * 13.0) * (0.35 + uAmp * 0.65);

  // A faint baseline so silence still reads as a live (flat) line
  float base = smoothstep(0.005, 0.0, abs(vUv.y - 0.5)) * 0.22;

  float intensity = core + glow * 0.7 + base;
  gl_FragColor = vec4(uColor * intensity, intensity);
}
