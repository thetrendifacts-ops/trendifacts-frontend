const fs = require('fs');

// We use _embed to automatically pull in the featured image data alongside the posts
// per_page=100 ensures we grab all your 20+ posts in a single network request
const WP_API_URL = 'https://wp.trendifacts.com/wp-json/wp/v2/posts?_embed&per_page=100';

async function extractWordPressData() {
  console.log('Initiating WordPress data extraction...');

  try {
    const response = await fetch(WP_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: HTTP ${response.status}`);
    }

    const posts = await response.json();
    console.log(`Successfully fetched ${posts.length} posts. Flattening data for Firebase...`);

    const formattedPosts = posts.map(post => {
      // Safely extract the featured image URL if it exists
      let imageUrl = null;
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
      }

      return {
        slug: post.slug,
        title: post.title.rendered,
        // We keep the raw HTML so your CKEditor can parse it natively later
        content: post.content.rendered, 
        date: post.date,
        modified: post.modified,
        featuredImage: imageUrl
      };
    });

    // Write the formatted array to a local JSON file
    fs.writeFileSync('trendifacts-backup.json', JSON.stringify(formattedPosts, null, 2));
    
    console.log('✅ Success: Data safely extracted to trendifacts-backup.json');

  } catch (error) {
    console.error('❌ Extraction failed:', error);
  }
}

extractWordPressData();