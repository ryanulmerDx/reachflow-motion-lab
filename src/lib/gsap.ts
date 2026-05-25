'use client';

/**
 * GSAP singleton + plugin registration.
 *
 * Import GSAP only through this module so plugin registration happens exactly once
 * and tree-shaking can drop unused plugins. `registerPlugin` is idempotent.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
