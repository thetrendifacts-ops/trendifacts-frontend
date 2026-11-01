import { db } from './firebase-admin';

const COLLECTION_NAME = 'posts';

function formatPost(doc) {
  const data = doc.data() || {};
  const imageUrl =
    typeof data.featuredImage === 'string'
      ? data.featuredImage
      : data.featuredImage?.node?.sourceUrl || '';

  return {
    id: doc.id,
    slug: data.slug || doc.id,
    title: data.title || 'Untitled Post',
    content: data.content || '',
    excerpt: data.excerpt || data.metaDescription || '',
    date: data.date || new Date().toISOString(),
    modified: data.modified || data.date || new Date().toISOString(),
    status: data.status || 'published',
    category: data.category || 'uncategorized',
    seoTitle: data.seoTitle || data.title || '',
    metaDescription: data.metaDescription || '',
    featuredImage: imageUrl,
    featuredImageNode: {
      node: {
        sourceUrl: imageUrl,
      },
    },
  };
}

export async function getLatestPosts(limitCount = 50) {
  try {
    if (!db) return [];
    const snapshot = await db.collection(COLLECTION_NAME).get();

    const allPosts = snapshot.docs
      .map(doc => formatPost(doc))
      .filter(post => post.status !== 'draft')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limitCount);

    const edges = allPosts.map(post => ({
      node: {
        ...post,
        featuredImage: post.featuredImage
          ? { node: { sourceUrl: post.featuredImage } }
          : null,
      },
    }));

    Object.defineProperty(allPosts, 'edges', {
      value: edges,
      enumerable: false,
    });

    return allPosts;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    if (!db || !slug) return null;
    const cleanSlug = decodeURIComponent(slug).replace(/^\/|\/$/g, '');

    const docRef = await db.collection(COLLECTION_NAME).doc(cleanSlug).get();
    if (docRef.exists) {
      return formatPost(docRef);
    }

    const querySnap = await db
      .collection(COLLECTION_NAME)
      .where('slug', '==', cleanSlug)
      .limit(1)
      .get();

    if (!querySnap.empty) {
      return formatPost(querySnap.docs[0]);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(categorySlug) {
  try {
    if (!db) return { edges: [] };
    const snapshot = await db.collection(COLLECTION_NAME).get();

    const allPosts = snapshot.docs
      .map(doc => formatPost(doc))
      .filter(post => post.status !== 'draft')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const matchingPosts = allPosts.filter(p => {
      if (!p.category) return false;
      if (Array.isArray(p.category)) return p.category.includes(categorySlug);
      return p.category.toLowerCase() === categorySlug.toLowerCase();
    });

    const edges = matchingPosts.map(post => ({
      node: {
        ...post,
        featuredImage: post.featuredImage
          ? { node: { sourceUrl: post.featuredImage } }
          : null,
      },
    }));

    return { edges };
  } catch (error) {
    console.error(`Error fetching category ${categorySlug}:`, error);
    return { edges: [] };
  }
}

export async function getAllPostsWithSlug() {
  return getLatestPosts(1000);
}

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