import { getAllPostsForSitemap } from '@/lib/api';

// Force Next.js to bypass the cache so new articles show up instantly
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Fetch ALL dynamic WordPress posts
  const latestPostsData = await getAllPostsForSitemap();
  const posts = latestPostsData?.edges || [];

  const postUrls = posts.map(({ node }) => ({
    url: `${baseUrl}/${node.slug}`,
    // Use the actual WordPress modified date if available
    lastModified: node.modified ? new Date(node.modified) : new Date(), 
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 2. Define your static routes and category hubs
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/category/runtime-sizing-guides',
    '/category/gear-buying-guides',
    '/category/outage-prep-checklists',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : 0.7,
  }));

  // 3. Combine and return them
  return [...staticRoutes, ...postUrls];
}