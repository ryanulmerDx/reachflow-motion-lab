import type { MetadataRoute } from 'next';
import { DEMOS } from '@/lib/demo-registry';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url },
    ...DEMOS.map((demo) => ({ url: `${SITE.url}/lab/${demo.slug}` })),
  ];
}
