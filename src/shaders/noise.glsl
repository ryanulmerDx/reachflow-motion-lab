// Placeholder shader. Real noise shader lands in Wave 1 via shader-lab port.
// This file exists so the GLSL webpack loader has something to validate against on first build.

precision highp float;

uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 col = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0.0, 2.0, 4.0));
  gl_FragColor = vec4(col, 1.0);
}
