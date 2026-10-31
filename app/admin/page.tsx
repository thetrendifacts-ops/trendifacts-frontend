'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import parse from 'html-react-parser';
import ProductCard from '@/components/ProductCard';
import AmazonProductCard from '@/components/AmazonProductCard';
import QuickPick from '@/components/QuickPick';
import RuntimeCalculator from '@/components/RuntimeCalculator';

const CustomEditor = dynamic(() => import('@/components/CustomEditor'), { ssr: false });

// Helper to clean HTML tags & entities that CKEditor injects inside shortcodes
const cleanShortcodeInner = (str: string): string => {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
};

// Pre-processes raw CKEditor HTML so shortcodes ALWAYS match regardless of wrapping tags
const preprocessShortcodes = (html: string): string => {
  if (!html) return '';

  let processed = html;

  processed = processed.replace(/\[\s*runtime-calculator\s*\]/gi, '<div data-shortcode="runtime-calculator"></div>');

  processed = processed.replace(/\[\s*AMAZON_CARD\s*\|\|([\s\S]*?)\]/gi, (_, inner) => {
    const cleaned = cleanShortcodeInner(inner);
    return `<div data-shortcode="amazon-card" data-payload="${encodeURIComponent(cleaned)}"></div>`;
  });

  processed = processed.replace(/\[\s*(?:QUICK_PICK|TOP_PICK)\s*\|\|([\s\S]*?)\]/gi, (_, inner) => {
    const cleaned = cleanShortcodeInner(inner);
    return `<div data-shortcode="quick-pick" data-payload="${encodeURIComponent(cleaned)}"></div>`;
  });

  return processed;
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [category, setCategory] = useState('runtime-sizing-guides');
  const [featuredImage, setFeaturedImage] = useState('');
  const [reviewScore, setReviewScore] = useState('');
  const [content, setContent] = useState('');
  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('draft');
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState('');

  // Shortcode Builder State
  const [activeBuilder, setActiveBuilder] = useState<'none' | 'amazon' | 'quickpick'>('none');
  const [amzTitle, setAmzTitle] = useState('');
  const [amzBadge, setAmzBadge] = useState('Best Overall');
  const [amzImage, setAmzImage] = useState('');
  const [amzUrl, setAmzUrl] = useState('');

  const [qpTitle, setQpTitle] = useState('');
  const [qpReason, setQpReason] = useState('');
  const [qpUrl, setQpUrl] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSelectPost = (post: any) => {
    setTitle(post.title || '');
    setSlug(post.slug || '');
    setSeoTitle(post.seoTitle || '');
    setMetaDescription(post.metaDescription || '');
    setCategory(post.category || 'runtime-sizing-guides');
    setFeaturedImage(post.featuredImage?.node?.sourceUrl || post.featuredImage || '');
    setReviewScore(post.reviewDetails?.reviewScore || '');
    setContent(post.content || '');
    setPostStatus(post.status || 'published');
    setIsEditingExisting(true);
    setShowPreview(false);
    setActiveBuilder('none');
    setStatus(`Loaded: /${post.slug}`);
  };

  const handleNewPost = () => {
    setTitle('');
    setSlug('');
    setSeoTitle('');
    setMetaDescription('');
    setCategory('runtime-sizing-guides');
    setFeaturedImage('');
    setReviewScore('');
    setContent('');
    setPostStatus('draft');
    setIsEditingExisting(false);
    setShowPreview(false);
    setActiveBuilder('none');
    setStatus('Drafting new article');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditingExisting) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  // Shortcode Insertion & Clipboard Helpers
  const appendShortcodeToEditor = (shortcode: string) => {
    setContent((prev) => `${prev || ''}<p>${shortcode}</p>`);
    setStatus(`✨ Inserted shortcode into editor!`);
  };

  const copyShortcodeToClipboard = async (shortcode: string) => {
    try {
      await navigator.clipboard.writeText(shortcode);
      setStatus(`📋 Copied shortcode! Click anywhere in the editor and press Ctrl+V.`);
    } catch {
      setStatus(`❌ Failed to copy to clipboard.`);
    }
  };

  const buildAmazonShortcode = () => {
    return `[AMAZON_CARD || ${amzTitle.trim() || 'Product Title'} || ${amzBadge.trim() || 'Top Pick'} || ${amzImage.trim() || 'https://'} || ${amzUrl.trim() || 'https://amazon.com'}]`;
  };

  const buildQuickPickShortcode = () => {
    return `[QUICK_PICK || ${qpTitle.trim() || 'Product Name'} || ${qpReason.trim() || 'Best for reliable backup power'} || ${qpUrl.trim() || 'https://amazon.com'}]`;
  };

  const resetAmazonBuilder = () => {
    setAmzTitle('');
    setAmzBadge('Best Overall');
    setAmzImage('');
    setAmzUrl('');
    setActiveBuilder('none');
  };

  const resetQuickPickBuilder = () => {
    setQpTitle('');
    setQpReason('');
    setQpUrl('');
    setActiveBuilder('none');
  };

  const savePostWithStatus = async (targetStatus: 'draft' | 'published') => {
    if (!title || !slug || !content) {
      setStatus('❌ Please provide a Title, Slug, and Content before saving.');
      return;
    }

    setIsSaving(true);
    setStatus(targetStatus === 'draft' ? 'Saving draft to Firebase...' : 'Publishing to Firebase...');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          seoTitle,
          metaDescription,
          category,
          featuredImage,
          reviewScore,
          content,
          status: targetStatus
        })
      });

      const data = await res.json();

      if (res.ok) {
        const savedSlug = data.slug || slug;
        setSlug(savedSlug);
        setPostStatus(targetStatus);
        setIsEditingExisting(true);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setStatus(
          targetStatus === 'draft'
            ? `📝 Draft saved at ${time}`
            : `🚀 Published live at ${time}`
        );
        fetchPosts();
      } else {
        setStatus(`❌ Error: ${data.error || 'Failed to save'}`);
      }
    } catch (err) {
      setStatus('❌ Network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (targetSlug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Permanently delete "/${targetSlug}"?`)) return;

    const res = await fetch(`/api/posts?slug=${targetSlug}`, { method: 'DELETE' });
    if (res.ok) {
      if (slug === targetSlug) handleNewPost();
      fetchPosts();
      setStatus(`🗑️ Deleted /${targetSlug}`);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const currentStatus = p.status || 'published';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const parseOptions = {
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.attribs.class === 'react-product-card') {
        return (
          <ProductCard 
            title={domNode.attribs['data-title']}
            badge={domNode.attribs['data-badge']}
            link={domNode.attribs['data-link']}
            pros={domNode.attribs['data-pros']?.split('|').filter(Boolean)}
            cons={domNode.attribs['data-cons']?.split('|').filter(Boolean)}
          />
        );
      }

      const shortcodeType = domNode.attribs?.['data-shortcode'];
      if (shortcodeType) {
        if (shortcodeType === 'runtime-calculator') {
          return (
            <div className="not-prose my-8">
              <RuntimeCalculator />
            </div>
          );
        }

        if (shortcodeType === 'amazon-card') {
          const rawPayload = decodeURIComponent(domNode.attribs['data-payload'] || '');
          const parts = rawPayload.split('||').map((s: string) => s.trim());
          return (
            <div className="not-prose my-8">
              <AmazonProductCard
                title={parts[0] || ''}
                badge={parts[1] || ''}
                image={parts[2] || ''}
                amazonUrl={parts[3] || ''}
              />
            </div>
          );
        }

        if (shortcodeType === 'quick-pick') {
          const rawPayload = decodeURIComponent(domNode.attribs['data-payload'] || '');
          const parts = rawPayload.split('||').map((s: string) => s.trim());
          return (
            <div className="not-prose my-8">
              <QuickPick
                title={parts[0] || ''}
                reason={parts[1] || ''}
                url={parts[2] || ''}
              />
            </div>
          );
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 lg:sticky lg:top-8 max-h-[88vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
              Articles ({filteredPosts.length})
            </h2>
            <button
              type="button"
              onClick={handleNewPost}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg shadow-sm transition"
            >
              + New Post
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts by title or slug..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 mb-2 focus:outline-none focus:border-emerald-500"
          />

          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg mb-3 text-[11px] font-bold">
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`py-1 rounded-md capitalize transition ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <ul className="space-y-2 overflow-y-auto pr-1 flex-1">
            {filteredPosts.map((post) => {
              const isDraft = post.status === 'draft';
              return (
                <li
                  key={post.slug}
                  onClick={() => handleSelectPost(post)}
                  className={`group cursor-pointer p-3 rounded-xl border text-sm transition-all flex items-start justify-between gap-2 ${
                    slug === post.slug
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                          isDraft
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isDraft ? 'Draft' : 'Live'}
                      </span>
                      <span className="line-clamp-1">{post.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal truncate">
                      /{post.slug}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(post.slug, e)}
                    title="Delete Post"
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 px-1.5 py-0.5 rounded transition"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* RIGHT WORKSPACE */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              savePostWithStatus('published');
            }}
            className="relative"
          >
            
            {/* Sticky Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 sticky top-0 bg-white z-20 pt-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900">
                    {showPreview ? 'Previewing Article' : (isEditingExisting ? 'Editing Article' : 'New Article')}
                  </h1>
                  <span
                    className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                      postStatus === 'draft'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {postStatus === 'draft' ? 'Draft' : 'Published'}
                  </span>
                </div>
                {status && (
                  <p className="text-xs font-bold text-emerald-600 mt-1">{status}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {slug && isEditingExisting && (
                  <Link
                    href={`/${slug}`}
                    target="_blank"
                    className="px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    View Live ↗
                  </Link>
                )}
                
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition ${
                    showPreview 
                      ? 'bg-amber-100 border-amber-200 text-amber-900 hover:bg-amber-200' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {showPreview ? '✏️ Back to Editor' : '👁️ Preview'}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => savePostWithStatus('draft')}
                  className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm"
                >
                  💾 Save Draft
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl shadow-md text-xs transition"
                >
                  {isSaving ? 'Saving...' : postStatus === 'published' && isEditingExisting ? '🚀 Update Live Post' : '🚀 Publish Post'}
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW RENDERER */}
            {showPreview ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 md:p-12 mt-6">
                <div className="max-w-[800px] mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                    {title || 'Untitled Post'}
                  </h1>
                  {featuredImage && (
                    <img 
                      src={featuredImage} 
                      alt="Featured Preview" 
                      className="w-full aspect-video object-cover rounded-xl mb-10 shadow-sm" 
                    />
                  )}
                  <div 
                    className="prose prose-lg prose-slate max-w-none font-sans
                               [&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-slate-700
                               [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-extrabold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4
                               [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-8 [&>h3]:mb-3
                               [&>img]:rounded-xl [&>img]:shadow-md [&>img]:my-8 [&>img]:w-full [&>img]:object-cover"
                  >
                    {content ? parse(preprocessShortcodes(content), parseOptions) : <p className="text-slate-400 italic">No content written yet...</p>}
                  </div>
                </div>
              </div>
            ) : (
              /* EDITOR FORM FIELDS */
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Post H1 Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. Best Portable Power Stations"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. best-portable-power-stations"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800">
                    🔍 Google SERP & SEO Metadata
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>SEO Title (Optional — Defaults to Post H1 Title)</span>
                      <span className={(seoTitle || title).length > 60 ? 'text-amber-600' : 'text-slate-400'}>
                        {(seoTitle || title).length} / 60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder={title || 'Custom SEO Title for Google search results...'}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Meta Description</span>
                      <span className={metaDescription.length > 160 ? 'text-amber-600' : 'text-slate-400'}>
                        {metaDescription.length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Write a high-CTR summary (140–160 characters) with primary keywords..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="runtime-sizing-guides">Runtime Guides</option>
                      <option value="gear-buying-guides">Balcony & Renter Solar</option>
                      <option value="outage-prep-checklists">Outage Prep</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Featured Image URL</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                        placeholder="https://..."
                      />
                      <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold px-4 py-2.5 rounded-lg text-xs transition whitespace-nowrap shadow-sm">
                        📁 Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setStatus('Uploading image to Cloudinary...');
                            const formData = new FormData();
                            formData.append('file', file);

                            try {
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              const data = await res.json();

                              if (data.url) {
                                setFeaturedImage(data.url);
                                setStatus('✅ Image uploaded successfully!');
                              } else {
                                setStatus(`❌ Upload failed: ${data.error || 'Unknown error'}`);
                              }
                            } catch (err) {
                              setStatus('❌ Network error during upload.');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Review Score (Optional)</label>
                    <input
                      type="text"
                      value={reviewScore}
                      onChange={(e) => setReviewScore(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. 9.5/10"
                    />
                  </div>
                </div>

                {/* CKEditor + Quick Shortcode Generator Toolbar */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">Article Content</label>
                    
                    {/* QUICK-INSERT TOOLBAR BUTTONS */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Insert Widget:</span>
                      <button
                        type="button"
                        onClick={() => setActiveBuilder(activeBuilder === 'amazon' ? 'none' : 'amazon')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                          activeBuilder === 'amazon'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        🛒 + Amazon Card
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveBuilder(activeBuilder === 'quickpick' ? 'none' : 'quickpick')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                          activeBuilder === 'quickpick'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        ⚡ + Quick Pick
                      </button>

                      <button
                        type="button"
                        onClick={() => appendShortcodeToEditor('[runtime-calculator]')}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 transition"
                      >
                        🧮 + Runtime Calculator
                      </button>
                    </div>
                  </div>

                  {/* AMAZON CARD MINI-BUILDER */}
                  {activeBuilder === 'amazon' && (
                    <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 mb-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                          🛒 Build Amazon Product Card
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveBuilder('none')}
                          className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Product Title</label>
                          <input
                            type="text"
                            value={amzTitle}
                            onChange={(e) => setAmzTitle(e.target.value)}
                            placeholder="e.g. EcoFlow DELTA Pro (3600Wh)"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Award Badge</label>
                          <input
                            type="text"
                            value={amzBadge}
                            onChange={(e) => setAmzBadge(e.target.value)}
                            placeholder="e.g. Best Overall / Heavy-Duty Pick"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Product Image URL (Amazon or Cloudinary)</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={amzImage}
                              onChange={(e) => setAmzImage(e.target.value)}
                              placeholder="https://m.media-amazon.com/images/..."
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                            />
                            <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold px-3 py-2 rounded-lg text-[11px] whitespace-nowrap flex items-center">
                              📁 Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setStatus('Uploading product image...');
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  try {
                                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                    const data = await res.json();
                                    if (data.url) {
                                      setAmzImage(data.url);
                                      setStatus('✅ Product image uploaded!');
                                    }
                                  } catch {
                                    setStatus('❌ Image upload failed.');
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Amazon Affiliate Link</label>
                          <input
                            type="text"
                            value={amzUrl}
                            onChange={(e) => setAmzUrl(e.target.value)}
                            placeholder="https://www.amazon.com/dp/...?tag=..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/80">
                        <code className="text-[11px] text-amber-950 bg-amber-100/80 px-2 py-1 rounded truncate max-w-md">
                          {buildAmazonShortcode()}
                        </code>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              copyShortcodeToClipboard(buildAmazonShortcode());
                              resetAmazonBuilder();
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            📋 Copy Shortcode
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              appendShortcodeToEditor(buildAmazonShortcode());
                              resetAmazonBuilder();
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-sm"
                          >
                            + Insert into Article
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QUICK PICK MINI-BUILDER */}
                  {activeBuilder === 'quickpick' && (
                    <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 mb-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                          ⚡ Build Quick Pick Callout Box
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveBuilder('none')}
                          className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Product Name</label>
                          <input
                            type="text"
                            value={qpTitle}
                            onChange={(e) => setQpTitle(e.target.value)}
                            placeholder="e.g. Jackery Explorer 1000 v2"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">1-Sentence Verdict / Reason</label>
                          <input
                            type="text"
                            value={qpReason}
                            onChange={(e) => setQpReason(e.target.value)}
                            placeholder="e.g. Runs a full-size fridge for 14+ hours with 1-hour fast charging."
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Affiliate URL</label>
                          <input
                            type="text"
                            value={qpUrl}
                            onChange={(e) => setQpUrl(e.target.value)}
                            placeholder="https://www.amazon.com/dp/..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/80">
                        <code className="text-[11px] text-emerald-950 bg-emerald-100/80 px-2 py-1 rounded truncate max-w-md">
                          {buildQuickPickShortcode()}
                        </code>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              copyShortcodeToClipboard(buildQuickPickShortcode());
                              resetQuickPickBuilder();
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                          >
                            📋 Copy Shortcode
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              appendShortcodeToEditor(buildQuickPickShortcode());
                              resetQuickPickBuilder();
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-sm"
                          >
                            + Insert into Article
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <CustomEditor value={content} onChange={setContent} />
                </div>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}