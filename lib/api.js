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
    category: data.category || 'uncategorized', // Removed the hardcoded fallback
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

export async function getPostsByCategory(categorySlug) {
  try {
    if (!db) return { edges: [] };
    const snapshot = await db.collection(COLLECTION_NAME).get();

    const allPosts = snapshot.docs
      .map(doc => formatPost(doc))
      .filter(post => post.status !== 'draft')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Strict matching: Only return posts that explicitly match the requested category slug
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