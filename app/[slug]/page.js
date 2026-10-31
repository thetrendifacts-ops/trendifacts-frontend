import { getPostBySlug, getLatestPosts } from '@/lib/api'; 
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';
import TableOfContents from '@/components/TableOfContents';
import ProductCard from '@/components/ProductCard';
import AmazonProductCard from '@/components/AmazonProductCard';
import QuickPick from '@/components/QuickPick';
import RuntimeCalculator from '@/components/RuntimeCalculator';
import parse, { domToReact } from 'html-react-parser';

// Helper that strips CKEditor's auto-links, spans, and &nbsp; entities inside shortcodes
const getNodeText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.data || '';
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getNodeText).join('');
  }
  return '';
};

// Helper to resolve both legacy WordPress image objects and new flat Cloudinary URLs
const getFeaturedImageUrl = (featuredImage: any): string | null => {
  if (!featuredImage) return null;
  if (typeof featuredImage === 'string') return featuredImage;
  return featuredImage?.node?.sourceUrl || null;
};

// Helper to automatically extract Questions & Answers from HTML
const extractFAQs = (content: string) => {
  if (!content) return [];
  const faqs = [];
  const regex = /<h[23][^>]*>(.*?\?)<\/h[23]>\s*<p>(.*?)<\/p>/gi;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    faqs.push({
      "@type": "Question",
      "name": match[1].replace(/<[^>]+>/g, '').trim(),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": match[2].replace(/<[^>]+>/g, '').trim()
      }
    });
  }
  return faqs;
};

// Generate SEO Metadata using custom SEO fields
export async function generateMetadata({ params }: { params: any }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);
  
  if (!post) return { title: 'Post Not Found | Trendifacts' };
  
  return { 
    title: post.seoTitle ? `${post.seoTitle} | Trendifacts` : `${post.title} | Trendifacts`,
    description: post.metaDescription || 'In-depth reviews, wattage math, and blackout preparedness guides.',
    alternates: {
      canonical: `https://trendifacts.com/${resolvedParams.slug}`,
    },
  };
}

// Reusable Card for the "Read Next" section
const RelatedPostCard = ({ post }: { post: any }) => {
  const imageUrl = getFeaturedImageUrl(post.featuredImage);

  return (
    <Link href={`/${post.slug}`} className="group flex flex-col bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-slate-100 transition-all h-full">
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4 relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            alt={post.title} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">No Image</div>
        )}
        {post.reviewDetails?.reviewScore && (
          <div className="absolute top-2 left-2 bg-slate-900 text-emerald-400 font-black text-xs px-2 py-1 rounded shadow-lg z-20">
            {post.reviewDetails.reviewScore} Score
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
        {post.title}
      </h3>
    </Link>
  );
};

export default async function SinglePost({ params }: { params: any }) {
  const resolvedParams = await params;
  
  const [post, latestPostsData] = await Promise.all([
    getPostBySlug(resolvedParams.slug),
    getLatestPosts()
  ]);

  if (!post) {
    return notFound();
  }

  const relatedPosts = latestPostsData?.edges
    ?.map((edge: any) => edge.node)
    .filter((p: any) => p.slug !== resolvedParams.slug && p.status !== 'draft')
    .slice(0, 3) || [];

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const heroImageUrl = getFeaturedImageUrl(post.featuredImage);

  // Automated Article JSON-LD Schema
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription || '',
    "image": heroImageUrl ? [heroImageUrl] : [],
    "datePublished": post.date,
    "dateModified": post.modified || post.date,
    "author": [{
        "@type": "Person",
        "name": post.author?.node?.name || 'Admin',
        "url": "https://trendifacts.com/about"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Trendifacts",
      "url": "https://trendifacts.com"
    }
  };

  // Generate Dynamic FAQ Schema
  const extractedFAQs = extractFAQs(post.content);
  const faqSchemaData = extractedFAQs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": extractedFAQs
  } : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* JSON-LD Schema Injection */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} 
      />
      {faqSchemaData && (
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }} 
        />
      )}

      {/* 1. DARK HERO HEADER */}
      <header className="bg-slate-900 pt-16 pb-40 px-4 border-b-4 border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {post.title}
          </h1>
          <div className="text-slate-300 font-medium text-sm md:text-base">
            by {post.author?.node?.name || 'Admin'} • Updated {formattedDate}
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-4 order-last lg:order-first hidden lg:block">
            <div className="sticky top-32 flex flex-col gap-6">
              <TableOfContents />
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 min-h-[600px] flex items-center justify-center">
                <AdSlot format="vertical" responsive="true" />
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <article className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-10">
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-slate-600">
                <div>
                  <strong>Editorial Note:</strong> We buy and test gear independently. If you purchase through links on our site, we may earn a commission.
                </div>
                <Link href="/about" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-full text-xs transition-colors whitespace-nowrap">
                  Advertising & Marketing
                </Link>
              </div>

              {/* PARSED ARTICLE CONTENT */}
              <div 
                id="article-content"
                className="prose prose-lg prose-slate max-w-none font-sans
                           [&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-slate-700
                           [&>h2]:text-2xl [&>h2]:md:text-3xl [&>h2]:font-extrabold [&>h2]:text-slate-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:scroll-mt-32
                           [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-slate-900 [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:scroll-mt-32
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2 [&>ul]:text-slate-700
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-2 [&>ol]:text-slate-700
                           [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-500 [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-6 [&>blockquote]:italic [&>blockquote]:text-slate-800
                           [&>img]:rounded-xl [&>img]:shadow-md [&>img]:my-8 [&>img]:w-full [&>img]:object-cover"
              >
                {(() => {
                  let paragraphCount = 0;

                  const parseOptions: any = {
                    replace: (domNode: any) => {
                      
                      // 1. Inject Legacy Product Cards
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

                      // 2. Inject Custom Shortcodes ([AMAZON_CARD], [QUICK_PICK], [runtime-calculator])
                      if (domNode.name === 'p' || domNode.name === 'div') {
                        const text = getNodeText(domNode).replace(/\u00A0/g, ' ').trim();

                        if (text === '[runtime-calculator]') {
                          return <RuntimeCalculator />;
                        }

                        if (/^\[AMAZON_CARD\s*\|\|/i.test(text) && text.endsWith(']')) {
                          const parts = text.slice(1, -1).split('||').map((s: string) => s.trim());
                          return (
                            <div className="not-prose my-8">
                              <AmazonProductCard
                                title={parts[1]}
                                badge={parts[2]}
                                image={parts[3]}
                                amazonUrl={parts[4]}
                              />
                            </div>
                          );
                        }

                        if (/^\[QUICK_PICK\s*\|\|/i.test(text) && text.endsWith(']')) {
                          const parts = text.slice(1, -1).split('||').map((s: string) => s.trim());
                          return (
                            <div className="not-prose my-8">
                              <QuickPick
                                title={parts[1]}
                                reason={parts[2]}
                                url={parts[3]}
                              />
                            </div>
                          );
                        }
                      }

                      // 3. Inject In-Content AdSlots (Every 4 paragraphs)
                      if (domNode.name === 'p') {
                        const rawParagraphText = getNodeText(domNode);
                        if (rawParagraphText.includes('[')) return;
                        
                        paragraphCount++;
                        if (paragraphCount % 4 === 0) {
                          return (
                            <>
                              <p>{domToReact(domNode.children, parseOptions)}</p>
                              <div className="my-10 border-y border-slate-100 flex items-center justify-center not-prose">
                                <AdSlot format="horizontal" responsive="true" />
                              </div>
                            </>
                          );
                        }
                      }
                    }
                  };

                  return parse(post.content || '', parseOptions);
                })()}
              </div>
              
            </div>
          </article>
        </div>

        {/* 3. READ NEXT SECTION */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-10 border-t-4 border-slate-900">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                Read Next
              </h2>
              <Link href="/" className="text-emerald-600 font-bold text-sm tracking-widest hover:text-emerald-700 transition-colors">
                VIEW ALL &rarr;
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost: any) => (
                <RelatedPostCard key={relatedPost.id || relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}