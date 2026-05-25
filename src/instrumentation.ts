/**
 * Sentry instrumentation — must live in `src/` for the App Router.
 *
 * `register()` runs once on server startup. The conditional imports below
 * are required so the Edge SDK loads on Edge runtimes and the Node SDK on Node.
 *
 * Per-demo tagging: every demo route should call `Sentry.setTag('demo', <slug>)`
 * on mount via the LabLayout / demo wrapper so errors carry the demo identifier.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
