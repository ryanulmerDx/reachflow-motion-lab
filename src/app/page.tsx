import { LandingHero } from './_landing/hero';
import { LandingMarquee } from './_landing/marquee';
import { LandingTheater } from './_landing/theater';
import { LandingManifesto } from './_landing/manifesto';
import { LandingFooter } from './_landing/footer';

/**
 * Landing page — basement.studio-tier.
 *
 * Flow: full-bleed shader hero → index marquee → pinned Systems Theater
 * (sticky stage that morphs through the 10 demos as you scroll) →
 * manifesto → footer. The shader runs in the same global R3F Canvas
 * mounted in the root layout.
 */
export default function HomePage() {
  return (
    <main className="relative">
      <LandingHero />
      <LandingMarquee />
      <LandingTheater />
      <LandingManifesto />
      <LandingFooter />
    </main>
  );
}
