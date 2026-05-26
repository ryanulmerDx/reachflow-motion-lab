import Link from 'next/link';
import { SITE } from '@/lib/site';

/**
 * Landing footer — mono grid, contact, repo, signature.
 * Server component, no JS shipped.
 */
export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-[var(--color-bg)] px-6 py-16 md:px-12 md:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-y-12">
        <div className="col-span-12 md:col-span-6">
          <p className="font-display text-[clamp(48px,9vw,140px)] font-medium leading-[0.88] tracking-[-0.04em]">
            Build the<br />
            <span className="text-[var(--color-accent)]">next one</span>
            <br />with us.
          </p>
        </div>

        <div className="col-span-6 md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)]">
            Studio
          </p>
          <ul className="mt-4 space-y-2 text-base">
            <li>
              <Link
                href={SITE.studio.url}
                className="underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
              >
                {SITE.studio.name}
              </Link>
            </li>
            <li>
              <Link
                href={`mailto:${SITE.studio.contact}`}
                className="underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
              >
                {SITE.studio.contact}
              </Link>
            </li>
            <li>
              <Link
                href={SITE.repo}
                className="underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
              >
                Source on GitHub
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-6 md:col-span-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)]">
            Elsewhere
          </p>
          <ul className="mt-4 space-y-2 text-base">
            <li>
              <Link
                href={SITE.socials.x}
                className="underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
              >
                X — @ryanulmerDx
              </Link>
            </li>
            <li>
              <Link
                href={SITE.socials.linkedin}
                className="underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
              >
                LinkedIn
              </Link>
            </li>
            <li className="text-[var(--color-ink-dim)]">MIT licensed</li>
          </ul>
        </div>

        <div className="col-span-12 mt-8 flex flex-col gap-2 border-t border-white/5 pt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-dim)] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.studio.name}. Built in the open.
          </p>
          <p>Stack — Next.js 15 · R3F · GLSL · GSAP · Lenis · Rapier</p>
        </div>
      </div>
    </footer>
  );
}
