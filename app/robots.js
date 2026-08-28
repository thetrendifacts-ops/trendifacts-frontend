export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow any internal API routes or private folders if needed
      disallow: ['/api/'], 
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
