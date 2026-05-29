/**
 * Content Security Policy for a public, no-auth WebGL portfolio.
 *
 * Permissive script-src is necessary:
 *   - `'unsafe-eval'` — Rapier WASM bootstrap + some R3F dynamic codegen
 *   - `'unsafe-inline'` — Next.js hydration uses inline bootstrap scripts;
 *     using nonces would require a middleware and isn't worth it for a
 *     static portfolio with no user-input attack surface.
 *
 * Style-src needs `'unsafe-inline'` for drei `<Html>`, Tailwind 4 runtime
 * style insertion, GSAP transform style writes, and `viewTransitionName`
 * inline styles.
 *
 * worker-src `blob:` is required for Rapier's WebAssembly worker.
 * connect-src includes Sentry; expand if other telemetry is added later.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.sentry.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io https://unpkg.com",
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ['three', '@react-three/drei', 'gsap', 'lenis'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
  async redirects() {
    // Demos 09 and 10 were rebuilt under new slugs; keep old links alive.
    return [
      { source: '/lab/data-tunnel', destination: '/lab/voice-receptionist', permanent: true },
      { source: '/lab/inventory-physics', destination: '/lab/field-inventory', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
