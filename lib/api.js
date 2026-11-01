import { db } from './firebase-admin';

// Change 'posts' here if your Firestore collection has a different name (e.g., 'wp_posts' or 'articles')
const COLLECTION_NAME = 'posts';

export async function getLatestPosts(limitCount = 10) {
  try {
    if (!db) return [];
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('date', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        slug: doc.id,
        title: data.title || '',
        content: data.content || '',
        date: data.date || '',
        featuredImage: data.featuredImage || '',
        status: data.status || 'published',
        category: data.category || 'runtime-sizing-guides',
      };
    });
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    if (!db) return null;
    const docRef = await db.collection(COLLECTION_NAME).doc(slug).get();
    if (!docRef.exists) return null;

    const data = docRef.data();
    return {
      slug: docRef.id,
      title: data.title || '',
      content: data.content || '',
      date: data.date || '',
      featuredImage: data.featuredImage || '',
      status: data.status || 'published',
      category: data.category || 'runtime-sizing-guides',
      seoTitle: data.seoTitle || data.title || '',
      metaDescription: data.metaDescription || '',
    };
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(categorySlug) {
  try {
    if (!db) return { edges: [] };
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('category', '==', categorySlug)
      .get();

    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        node: {
          slug: doc.id,
          title: data.title || '',
          content: data.content || '',
          date: data.date || '',
          featuredImage: data.featuredImage || '',
          status: data.status || 'published',
        },
      };
    });

    return { edges: posts };
  } catch (error) {
    console.error(`Error fetching category ${categorySlug}:`, error);
    return { edges: [] };
  }
}

export async function getAllPostsWithSlug() {
  try {
    if (!db) return [];
    const snapshot = await db.collection(COLLECTION_NAME).select().get();
    return snapshot.docs.map(doc => ({ slug: doc.id }));
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}

// --- LEGACY ROUTING HELPERS FOR VERCEL BUILD ---

export async function getAllPostsForSitemap() {
  return getLatestPosts(1000);
}

export async function getCategoryBySlug(slug) {
  const posts = await getPostsByCategory(slug);
  return {
    slug,
    name: slug
      ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : '',
    posts,
  };
}

export async function getPageByUri(uri) {
  try {
    if (!db) {
      return { title: 'Legal Document', content: '' };
    }
    const cleanUri = uri.replace(/^\/|\/$/g, '');
    const doc = await db.collection('pages').doc(cleanUri).get();
    if (doc.exists) {
      const data = doc.data() || {};
      return {
        slug: doc.id,
        title: String(data.title || 'Legal Document'),
        content: String(data.content || ''),
      };
    }

    return { title: 'Legal Document', content: '<p>Document migrating...</p>' };
  } catch (error) {
    return { title: 'Legal Document', content: '' };
  }
}