import { db } from './firebase-admin';

const COLLECTION_NAME = 'posts';

// Normalizes any category name or slug into one of the 3 canonical category slugs
export function normalizeCategorySlug(rawCategory) {
  if (!rawCategory) return 'runtime-sizing-guides';
  const str = String(rawCategory).toLowerCase().trim();

  // 1. Runtime Guides (matches Runtime Guide, Runtime & Sizing Guides, runtime-guides, etc.)
  if (str.includes('runtime') || str.includes('sizing')) {
    return 'runtime-sizing-guides';
  }

  // 2. Balcony & Renter Solar (matches Gear & Buying Guides, gear-buying-guides, balcony-and-renter-solar, etc.)
  if (
    str.includes('balcony') ||
    str.includes('renter') ||
    str.includes('solar') ||
    str.includes('gear') ||
    str.includes('buying')
  ) {
    return 'gear-buying-guides';
  }

  // 3. Outage Prep (matches Outage Prep & Checklists, outage-prep-checklists, outage-prep, etc.)
  if (str.includes('outage') || str.includes('prep') || str.includes('checklist')) {
    return 'outage-prep-checklists';
  }

  return str.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const CATEGORY_DISPLAY_NAMES = {
  'runtime-sizing-guides': 'Runtime Guides',
  'gear-buying-guides': 'Balcony & Renter Solar',
  'outage-prep-checklists': 'Outage Prep',
};

function formatPost(doc) {
  const data = doc.data() || {};
  const imageUrl =
    typeof data.featuredImage === 'string'
      ? data.featuredImage
      : data.featuredImage?.node?.sourceUrl || '';

  const rawCategory = Array.isArray(data.category) ? data.category[0] : data.category;
  const normalizedCategory = normalizeCategorySlug(rawCategory);

  return {
    id: doc.id,
    slug: data.slug || doc.id,
    title: data.title || 'Untitled Post',
    content: data.content || '',
    excerpt: data.excerpt || data.metaDescription || '',
    date: data.date || new Date().toISOString(),
    modified: data.modified || data.date || new Date().toISOString(),
    status: data.status || 'published',
    category: normalizedCategory,
    categoryName: CATEGORY_DISPLAY_NAMES[normalizedCategory] || 'Runtime Guides',
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

    const targetGroup = normalizeCategorySlug(categorySlug);

    const matchingPosts = allPosts.filter(p => {
      if (!p.category) return false;
      const categories = Array.isArray(p.category) ? p.category : [p.category];
      return categories.some(cat => normalizeCategorySlug(cat) === targetGroup);
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
  const normalized = normalizeCategorySlug(slug);
  return {
    slug,
    name:
      CATEGORY_DISPLAY_NAMES[normalized] ||
      (slug
        ? slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : ''),
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