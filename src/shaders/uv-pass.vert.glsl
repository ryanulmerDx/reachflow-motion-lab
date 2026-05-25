// Standard UV pass-through vertex shader.
// Use with any full-quad fragment shader that needs vUv in [0,1].

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
