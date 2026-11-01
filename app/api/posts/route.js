import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const COLLECTION_NAME = 'posts';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized', posts: [] }, { status: 500 });
    }

    // Fetch all documents without .orderBy() so migrated posts missing 'createdAt' aren't filtered out
    const snapshot = await db.collection(COLLECTION_NAME).get();

    const posts = snapshot.docs
      .map(doc => {
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
          status: data.status || 'published',
          category: data.category || 'runtime-sizing-guides',
          seoTitle: data.seoTitle || data.title || '',
          metaDescription: data.metaDescription || '',
          featuredImage: imageUrl,
          date: data.date || data.createdAt || new Date().toISOString(),
          modified: data.modified || data.updatedAt || data.date || new Date().toISOString(),
        };
      })
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    // Return object with posts array so app/admin/page.tsx (data.posts) populates the sidebar
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json({ error: error.message, posts: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      content,
      excerpt,
      featuredImage,
      status = 'published',
      category = 'runtime-sizing-guides',
      seoTitle,
      metaDescription,
      date,
    } = body;

    const cleanSlug = (slug || title || 'untitled')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const now = new Date().toISOString();
    const postData = {
      slug: cleanSlug,
      title: title || 'Untitled Post',
      content: content || '',
      excerpt: excerpt || metaDescription || '',
      featuredImage: featuredImage || '',
      status,
      category,
      seoTitle: seoTitle || title || '',
      metaDescription: metaDescription || '',
      date: date || now,
      modified: now,
    };

    await db.collection(COLLECTION_NAME).doc(cleanSlug).set(postData, { merge: true });

    // Instantly refresh Next.js cache across the site
    revalidatePath('/');
    revalidatePath(`/${cleanSlug}`);
    revalidatePath(`/category/${category}`);
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true, post: postData });
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    await db.collection(COLLECTION_NAME).doc(slug).delete();

    revalidatePath('/');
    revalidatePath(`/${slug}`);
    revalidatePath('/sitemap.xml');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}