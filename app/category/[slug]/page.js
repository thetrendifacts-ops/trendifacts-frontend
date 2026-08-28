import { getCategoryBySlug } from '../../../lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Dynamically generate the SEO title based on the category name
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = await getCategoryBySlug(resolvedParams.slug);
  
  if (!category) return { title: 'Category Not Found | Trendifacts' };
  return { title: `${category.name} Gear Guides | Trendifacts` };
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  const currentCursor = resolvedSearch?.after || "";
  const category = await getCategoryBySlug(resolvedParams.slug, currentCursor);

  // Trigger 404 if the category doesn't exist in WordPress
  if (!category) {
    return notFound();
  }

  const posts = category.posts?.edges || [];
  const { hasNextPage, endCursor } = category.posts?.pageInfo || {};

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      
      {/* Category Header */}
      <div className="bg-slate-900 py-16 px-4 mb-12 border-t-4 border-emerald-500">
        <div className="max-w-[1400px] mx-auto text-center md:text-left">
          <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-2 block">
            Category Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-slate-400 text-lg max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* Post Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(({ node }) => (
              <Link key={node.id} href={`/${node.slug}`} className="group flex flex-col bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-slate-100 transition-all">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-4 relative">
                  {node.featuredImage ? (
                    <img 
                      src={node.featuredImage.node.sourceUrl} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={node.title}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">No Image</div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
                  {node.title}
                </h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: node.excerpt }} 
                  className="text-slate-600 text-sm line-clamp-2 mt-auto" 
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No articles found.</h3>
            <p className="text-slate-500">Check back soon for new guides in this category.</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {hasNextPage && (
          <div className="mt-16 text-center">
            <Link 
              href={`/category/${resolvedParams.slug}?after=${endCursor}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              Load More {category.name} Guides
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}