import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  // NOTE: Replay integration intentionally NOT registered in Wave 0.
  // If you add `replayIntegration()` later, also set
  // `replaysSessionSampleRate` and `replaysOnErrorSampleRate` — and
  // audit what's on screen first (replays can capture PII).
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === 'production',
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  });
}
