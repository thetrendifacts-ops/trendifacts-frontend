import { db } from './firebase-admin';
import { unstable_cache } from 'next/cache';

const COLLECTION_NAME = 'posts';

// In-memory fallback cache to protect against quota spikes within the same instance
let memoryCache = {
  posts: null,
  timestamp: 0,
};
const MEMORY_TTL_MS = 60 * 1000; // 60 seconds

export function normalizeCategorySlug(rawCategory) {
  if (!rawCategory) return 'runtime-sizing-guides';
  const firstVal = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
  const str = String(firstVal || '').toLowerCase().trim();

  if (str.includes('runtime') || str.includes('sizing')) {
    return 'runtime-sizing-guides';
  }
  if (
    str.includes('balcony') ||
    str.includes('renter') ||
    str.includes('solar') ||
    str.includes('gear') ||
    str.includes('buying')
  ) {
    return 'gear-buying-guides';
  }
  if (str.includes('outage') || str.includes('prep') || str.includes('checklist')) {
    return 'outage-prep-checklists';
  }

  return str.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'runtime-sizing-guides';
}

const CATEGORY_DISPLAY_NAMES = {
  'runtime-sizing-guides': 'Runtime Guides',
  'gear-buying-guides': 'Balcony & Renter Solar',
  'outage-prep-checklists': 'Outage Prep',
};

function safeDateString(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val._seconds) return new Date(val._seconds * 1000).toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function formatPost(doc) {
  const data = doc.data() || {};
  const imageUrl =
    typeof data.featuredImage === 'string'
      ? data.featuredImage
      : data.featuredImage?.node?.sourceUrl || '';

  const normalizedCategory = normalizeCategorySlug(data.category);
  const score = data.reviewScore || data.reviewDetails?.reviewScore || '';

  return {
    id: doc.id,
    slug: String(data.slug || doc.id).replace(/^\/|\/$/g, ''),
    title: String(data.title || 'Untitled Post'),
    content: String(data.content || ''),
    excerpt: String(data.excerpt || data.metaDescription || ''),
    date: safeDateString(data.date),
    modified: safeDateString(data.modified || data.date),
    status: data.status || 'published',
    category: normalizedCategory,
    categoryName: CATEGORY_DISPLAY_NAMES[normalizedCategory] || 'Runtime Guides',
    seoTitle: String(data.seoTitle || data.title || ''),
    metaDescription: String(data.metaDescription || ''),
    reviewScore: String(score),
    reviewDetails: {
      reviewScore: String(score),
    },
    featuredImage: imageUrl,
    featuredImageNode: {
      node: {
        sourceUrl: imageUrl,
      },
    },
  };
}

// Single shared database fetcher cached across the entire Next.js server
const fetchAllPublishedPostsCached = unstable_cache(
  async () => {
    if (!db) return [];
    const now = Date.now();
    if (memoryCache.posts && now - memoryCache.timestamp < MEMORY_TTL_MS) {
      return memoryCache.posts;
    }

    const snapshot = await db.collection(COLLECTION_NAME).get();
    const posts = snapshot.docs
      .map(doc => formatPost(doc))
      .filter(post => post.status !== 'draft')
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime() || 0;
        const timeB = new Date(b.date).getTime() || 0;
        return timeB - timeA;
      });

    memoryCache = { posts, timestamp: now };
    return posts;
  },
  ['all-published-posts'],
  { revalidate: 60, tags: ['posts'] }
);

async function getSafePublishedPosts() {
  try {
    return await fetchAllPublishedPostsCached();
  } catch (error) {
    console.error('Firestore read error (returning cached fallback if available):', error.message);
    return memoryCache.posts || [];
  }
}

export async function getLatestPosts(limitCount = 50) {
  try {
    const allPosts = (await getSafePublishedPosts()).slice(0, limitCount);

    const edges = allPosts.map(post => ({
      node: {
        ...post,
        featuredImage: post.featuredImage
          ? { node: { sourceUrl: post.featuredImage } }
          : null,
      },
    }));

    const result = [...allPosts];
    result.edges = edges;
    return result;
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    const empty = [];
    empty.edges = [];
    return empty;
  }
}

export async function getPostBySlug(slug) {
  try {
    if (!slug) return null;
    const cleanSlug = decodeURIComponent(slug).replace(/^\/|\/$/g, '');

    // Check cached list first (0 extra Firestore reads!)
    const cachedPosts = await getSafePublishedPosts();
    const foundInCache = cachedPosts.find(
      p => p.slug.toLowerCase() === cleanSlug.toLowerCase() || p.id === cleanSlug
    );
    if (foundInCache) return foundInCache;

    if (!db) return null;
    const docRef = await db.collection(COLLECTION_NAME).doc(cleanSlug).get();
    if (docRef.exists) {
      return formatPost(docRef);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching post ${slug}:`, error);
    return null;
  }
}

export async function getPostsByCategory(categorySlug) {
  try {
    const allPosts = await getSafePublishedPosts();
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