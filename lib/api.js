import { db } from './firebase-admin';

// Normalizes Firestore documents so both legacy WP posts and new Admin posts match the exact structure your frontend expects
function normalizePost(doc) {
  const data = doc.data();
  const slug = doc.id;

  // Format flat Cloudinary URL strings into the { node: { sourceUrl } } shape expected by your post cards
  let featuredImage = data.featuredImage || null;
  if (typeof featuredImage === 'string' && featuredImage.trim() !== '') {
    featuredImage = {
      node: {
        sourceUrl: featuredImage
      }
    };
  }

  return {
    id: slug,
    slug,
    ...data,
    status: data.status || 'published', // Older migrated posts without a status default to 'published'
    featuredImage,
    date: data.date || data.modified || new Date().toISOString(),
  };
}

// 1. Fetch all published posts for the Homepage & Read Next sections
export async function getLatestPosts(limitCount = 50) {
  try {
    if (!db) return { edges: [] };

    const snapshot = await db.collection('posts').get();
    
    const publishedPosts = snapshot.docs
      .map(doc => normalizePost(doc))
      // Strictly filter out drafts from public feeds
      .filter(post => post.status !== 'draft')
      // Sort newest first in memory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limitCount);

    return {
      edges: publishedPosts.map(post => ({ node: post }))
    };
  } catch (error) {
    console.error('Error in getLatestPosts:', error);
    return { edges: [] };
  }
}

// 2. Fetch a single published post by slug (Blocks direct public access to drafts)
export async function getPostBySlug(slug, { includeDrafts = false } = {}) {
  try {
    if (!db || !slug) return null;

    const doc = await db.collection('posts').doc(slug).get();
    if (!doc.exists) return null;

    const post = normalizePost(doc);

    // Return null (triggers 404 page) if a visitor tries to visit a draft URL directly
    if (!includeDrafts && post.status === 'draft') {
      return null;
    }

    return post;
  } catch (error) {
    console.error(`Error in getPostBySlug (${slug}):`, error);
    return null;
  }
}

// 3. Fetch published posts by Category
export async function getPostsByCategory(categorySlug) {
  try {
    if (!db || !categorySlug) return { edges: [] };

    const snapshot = await db.collection('posts').get();

    const categoryPosts = snapshot.docs
      .map(doc => normalizePost(doc))
      .filter(post => {
        // First, exclude all drafts
        if (post.status === 'draft') return false;

        // Match either the flat category string from Admin OR legacy WordPress categories array
        const matchesFlatCategory = post.category === categorySlug;
        const matchesNestedCategory = post.categories?.edges?.some(
          edge => edge.node?.slug === categorySlug
        );

        return matchesFlatCategory || matchesNestedCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      edges: categoryPosts.map(post => ({ node: post }))
    };
  } catch (error) {
    console.error(`Error in getPostsByCategory (${categorySlug}):`, error);
    return { edges: [] };
  }
}

// 4. Helper for Sitemap / Static Params (Only indexes published posts)
export async function getAllPostsWithSlug() {
  return getLatestPosts(1000);
}