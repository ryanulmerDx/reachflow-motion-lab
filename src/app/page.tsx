import { LandingHero } from './_landing/hero';
import { LandingMarquee } from './_landing/marquee';
import { LandingChapters } from './_landing/chapters';
import { LandingManifesto } from './_landing/manifesto';
import { LandingFooter } from './_landing/footer';

/**
 * Landing page — basement.studio-tier.
 *
 * Flow: full-bleed shader hero → index marquee → 10 demo chapters →
 * manifesto → footer. The shader runs in the same global R3F Canvas
 * mounted in the root layout.
 */
export default function HomePage() {
  return (
    <main className="relative">
      <LandingHero />
      <LandingMarquee />
      <LandingChapters />
      <LandingManifesto />
      <LandingFooter />
    </main>
  );
}
