// Robert Penner-style easing functions.
// All eases take t in [0, 1] and return a remapped t.
// No external deps. Pure functions, safe to include everywhere.

float easeInQuad(float t) {
  return t * t;
}

float easeOutQuad(float t) {
  return 1.0 - (1.0 - t) * (1.0 - t);
}

float easeInOutQuad(float t) {
  return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;
}

float easeInCubic(float t) {
  return t * t * t;
}

float easeOutCubic(float t) {
  return 1.0 - pow(1.0 - t, 3.0);
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

float easeInExpo(float t) {
  return t == 0.0 ? 0.0 : pow(2.0, 10.0 * t - 10.0);
}

float easeOutExpo(float t) {
  return t == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);
}
