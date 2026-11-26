import { getAllPostsForSitemap } from '@/lib/api';

// Cache the sitemap at Vercel's edge for 1 hour so bot crawls don't drain Firestore
export const revalidate = 3600;

function parseValidDate(dateVal) {
  if (!dateVal) return null;
  const parsed = new Date(dateVal);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default async function sitemap() {
  // Always enforce canonical https://trendifacts.com with no www and no trailing slash
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendifacts.com';
  const baseUrl = rawSiteUrl
    .trim()
    .replace(/^http:\/\//i, 'https://')
    .replace(/^https:\/\/www\./i, 'https://')
    .replace(/\/+$/, '');

  // 1. Fetch all posts and filter out drafts, empty slugs, and duplicates
  const latestPostsData = await getAllPostsForSitemap();
  const posts = latestPostsData?.edges || [];

  const seenSlugs = new Set();
  const postUrls = [];

  for (const edge of posts) {
    const node = edge?.node;
    if (!node || !node.slug || node.status === 'draft') continue;

    const cleanSlug = String(node.slug).trim().replace(/^\/+|\/+$/g, '');
    if (!cleanSlug || seenSlugs.has(cleanSlug)) continue;
    seenSlugs.add(cleanSlug);

    const lastMod =
      parseValidDate(node.modified) ||
      parseValidDate(node.date) ||
      new Date('2026-11-01');

    postUrls.push({
      url: `${baseUrl}/${cleanSlug}`,
      lastModified: lastMod,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Use the most recent article date for the homepage and category hubs
  const latestPostDate =
    postUrls.length > 0
      ? new Date(Math.max(...postUrls.map((p) => p.lastModified.getTime())))
      : new Date('2026-11-26');

  // 2. Define static routes and category hubs
  const staticRoutes = [
    { route: '', lastModified: latestPostDate, changeFrequency: 'daily', priority: 1.0 },
    { route: '/category/runtime-sizing-guides', lastModified: latestPostDate, changeFrequency: 'weekly', priority: 0.8 },
    { route: '/category/gear-buying-guides', lastModified: latestPostDate, changeFrequency: 'weekly', priority: 0.8 },
    { route: '/category/outage-prep-checklists', lastModified: latestPostDate, changeFrequency: 'weekly', priority: 0.8 },
    { route: '/about', lastModified: new Date('2026-11-01'), changeFrequency: 'monthly', priority: 0.6 },
    { route: '/contact', lastModified: new Date('2026-11-01'), changeFrequency: 'monthly', priority: 0.5 },
    { route: '/privacy-policy', lastModified: new Date('2026-11-01'), changeFrequency: 'yearly', priority: 0.3 },
    { route: '/terms', lastModified: new Date('2026-11-01'), changeFrequency: 'yearly', priority: 0.3 },
  ].map(({ route, lastModified, changeFrequency, priority }) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  // 3. Combine and return
  return [...staticRoutes, ...postUrls];
}