import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const doc = await db.collection('posts').doc(slug).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ post: { slug: doc.id, ...doc.data() } });
    }

    const snapshot = await db.collection('posts').get();
    const posts = snapshot.docs.map(doc => ({ slug: doc.id, ...doc.data() }));

    posts.sort((a, b) => {
      const dateA = new Date(a.date || a.modified || 0).getTime();
      const dateB = new Date(b.date || b.modified || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ posts: [], error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, slug, seoTitle, metaDescription, content, featuredImage, category, reviewScore, status } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields (Title, Slug, or Content)' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/(^-|-$)+/g, '');
    const docRef = db.collection('posts').doc(cleanSlug);
    const existing = await docRef.get();

    await docRef.set({
      title,
      seoTitle: seoTitle || '',
      metaDescription: metaDescription || '',
      content,
      featuredImage: featuredImage || null,
      category: category || 'runtime-sizing-guides',
      reviewDetails: reviewScore ? { reviewScore } : null,
      status: status || 'published', // Saves 'draft' or 'published'
      modified: new Date().toISOString(),
      date: existing.exists && existing.data()?.date ? existing.data()?.date : new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, slug: cleanSlug, status: status || 'published' });
  } catch (error) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    await db.collection('posts').doc(slug).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}