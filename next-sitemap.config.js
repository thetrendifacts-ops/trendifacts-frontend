/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://trendifacts.com',
  generateRobotsTxt: true,
  exclude: ['/admin', '/admin/*', '/api/*'],
  additionalPaths: async (config) => {
    const result = [];
    try {
      // Fetch all dynamic slugs directly from your live API
      const res = await fetch('https://trendifacts.com/api/posts');
      if (!res.ok) return result;
      
      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];
      
      for (const post of posts) {
        result.push(await config.transform(config, `/${post.slug}`));
      }
    } catch (error) {
      console.error('Error fetching posts for sitemap:', error);
    }
    return result;
  },
}