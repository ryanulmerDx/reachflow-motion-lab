import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { LenisProvider } from '@/components/lenis-provider';
import { SITE } from '@/lib/site';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#08080a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s — ${SITE.shortName}`,
  },
  description: SITE.description,
  keywords: [
    'WebGL',
    'shaders',
    'GLSL',
    'React Three Fiber',
    'motion design',
    'open source',
    'creative coding',
    'ReachFlow Studio',
  ],
  authors: [{ name: SITE.studio.name, url: SITE.studio.url }],
  creator: SITE.studio.name,
  openGraph: {
    type: 'website',
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ryanulmerDx',
    creator: '@ryanulmerDx',
    title: SITE.name,
    description: SITE.tagline,
    images: [SITE.ogImage],
  },
  alternates: { canonical: SITE.url },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
