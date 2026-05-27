// NDC pass-through vertex shader.
// Pairs with drei <ScreenQuad/>: emits gl_Position in clip space directly,
// skipping the model/view/projection matrices so the geometry always
// covers the full viewport regardless of camera.

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
