import { getLatestPosts, getCategoryBySlug } from '../lib/api';
import Link from 'next/link';
import AdSlot from '../components/AdSlot';

// 1. Compact Card for "Highest Rated Gear"
const CompactCard = ({ post }) => (
  <Link href={`/${post.slug}`} className="group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-slate-100 transition-all h-full">
    <div className="w-28 h-28 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
      {post.featuredImage ? (
        <img 
          src={post.featuredImage.node.sourceUrl} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt={post.title} 
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">No Image</div>
      )}
      
      {post.reviewDetails?.reviewScore && (
        <div className="absolute top-0 left-0 bg-slate-900 text-emerald-400 font-black text-xs px-2 py-1 rounded-br-xl shadow-md z-20">
          {post.reviewDetails.reviewScore}
        </div>
      )}
    </div>
    
    <div className="flex flex-col justify-center">
      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
        {post.title}
      </h3>
      {post.excerpt && (
        <div 
          dangerouslySetInnerHTML={{ __html: post.excerpt }} 
          className="text-slate-500 text-xs md:text-sm line-clamp-2" 
        />
      )}
    </div>
  </Link>
);

// 2. Standard Post Card for Categories
const PostCard = ({ post }) => (
  <Link href={`/${post.slug}`} className="group flex flex-col bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-slate-100 transition-all h-full">
    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-4 relative">
      {post.featuredImage ? (
        <img 
          src={post.featuredImage.node.sourceUrl} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          alt={post.title} 
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-300">No Image</div>
      )}
      
      {post.reviewDetails?.reviewScore && (
        <div className="absolute top-3 left-3 bg-slate-900 text-emerald-400 font-black text-sm md:text-base px-3 py-1 rounded shadow-lg z-20 flex items-center gap-1">
          {post.reviewDetails.reviewScore} <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Score</span>
        </div>
      )}
    </div>
    
    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors">
      {post.title}
    </h3>
    
    {post.excerpt && (
      <div 
        dangerouslySetInnerHTML={{ __html: post.excerpt }} 
        className="text-slate-500 text-sm line-clamp-2 mt-auto" 
      />
    )}
  </Link>
);

export default async function Home() {
  // Category fetches updated with your exact slug
  const [latestPostsData, runtimeCategory, gearCategory, outageCategory] = await Promise.all([
    getLatestPosts(),
    getCategoryBySlug('runtime-sizing-guides'),
    getCategoryBySlug('gear-buying-guides'),
    getCategoryBySlug('outage-prep-checklists') // Updated slug
  ]);

  const latestPosts = latestPostsData?.edges || [];
  
  const heroPost = latestPosts[0]?.node;
  const subPosts = [latestPosts[1]?.node, latestPosts[2]?.node].filter(Boolean);
  
  const topRatedPosts = latestPosts.slice(3, 6).map(edge => edge.node);

  const runtimePosts = runtimeCategory?.posts?.edges?.slice(0, 2) || [];
  const gearPosts = gearCategory?.posts?.edges?.slice(0, 2) || [];
  const outagePosts = outageCategory?.posts?.edges?.slice(0, 2) || [];

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-4 pt-12">
        
        {/* 1. HERO MOSAIC */}
        {heroPost && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-16">
            <Link href={`/${heroPost.slug}`} className="lg:col-span-8 group relative rounded-2xl overflow-hidden aspect-video md:aspect-[21/9] lg:aspect-auto lg:h-[500px]">
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10" />
              {heroPost.featuredImage && (
                <img src={heroPost.featuredImage.node.sourceUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={heroPost.title} />
              )}
              <div className="absolute bottom-0 left-0 p-6 md:p-10 z-20 w-full md:w-3/4">
                {heroPost.reviewDetails?.reviewScore && (
                  <span className="inline-block bg-emerald-500 text-slate-900 font-extrabold px-3 py-1 rounded text-sm mb-4">
                    {heroPost.reviewDetails.reviewScore}/10
                  </span>
                )}
                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">{heroPost.title}</h2>
              </div>
            </Link>

            <div className="lg:col-span-4 flex flex-col gap-4">
              {subPosts.map((post) => (
                <Link key={post.id} href={`/${post?.slug}`} className="group relative rounded-2xl overflow-hidden flex-1 min-h-[240px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent z-10" />
                  {post?.featuredImage && (
                    <img src={post.featuredImage.node.sourceUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title} />
                  )}
                  {post?.reviewDetails?.reviewScore && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-slate-900 font-bold px-2 py-1 rounded text-xs z-20 shadow-md">
                      {post.reviewDetails.reviewScore}/10
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-6 z-20">
                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">{post?.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 2. HIGHEST RATED GEAR ROW */}
        {topRatedPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between border-b-4 border-emerald-500 pb-2 mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                Highest Rated Gear
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topRatedPosts.map(post => (
                <CompactCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Top AdSlot */}
        <div className="mb-16 border-t border-b border-slate-200 py-6">
          <AdSlot format="horizontal" responsive="true" />
        </div>

        {/* 3. MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: CATEGORY SECTIONS */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            {/* Category Block 1: Runtime Guides */}
            {runtimePosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between border-b-4 border-slate-900 pb-2 mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Runtime Guides</h2>
                  <Link href="/category/runtime-sizing-guides" className="text-emerald-600 font-bold text-sm tracking-widest hover:text-emerald-700 transition-colors">SEE ALL &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {runtimePosts.map(({ node }) => (
                    <PostCard key={node.id} post={node} />
                  ))}
                </div>
              </section>
            )}

            {/* Category Block 2: Gear Buying Guides */}
            {gearPosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between border-b-4 border-slate-900 pb-2 mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Balcony & Renter Solar</h2>
                  <Link href="/category/gear-buying-guides" className="text-emerald-600 font-bold text-sm tracking-widest hover:text-emerald-700 transition-colors">SEE ALL &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {gearPosts.map(({ node }) => (
                    <PostCard key={node.id} post={node} />
                  ))}
                </div>
              </section>
            )}

            {/* Category Block 3: Outage Prep */}
            {outagePosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between border-b-4 border-slate-900 pb-2 mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Outage Prep</h2>
                  <Link href="/category/outage-prep-checklists" className="text-emerald-600 font-bold text-sm tracking-widest hover:text-emerald-700 transition-colors">SEE ALL &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {outagePosts.map(({ node }) => (
                    <PostCard key={node.id} post={node} />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: STICKY AFFILIATE SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 flex flex-col gap-8">
              
              <div className="bg-white border-2 border-emerald-500/20 rounded-2xl p-6 shadow-lg shadow-emerald-500/5">
                <h3 className="font-extrabold text-xl text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-emerald-500 rounded-sm inline-block"></span>
                  Top Rated Gear Picks
                </h3>
                
                {/* Product 1 */}
                <div className="group flex flex-col mb-8 border-b border-slate-100 pb-8 last:border-0 last:pb-0 last:mb-0">
                  <div className="aspect-square bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-center border border-slate-100 group-hover:border-emerald-200 transition-colors relative overflow-hidden">
                    <div className="text-slate-400 font-bold text-sm text-center">Product<br/>Image</div>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">EcoFlow DELTA 2 Max</h4>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">The best balance of capacity, fast-charging, and quiet operation for home backup.</p>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-xl text-center transition-colors shadow-sm flex justify-center items-center gap-2">
                    Check Price on Amazon
                  </a>
                </div>

                {/* Product 2 */}
                <div className="group flex flex-col mb-8 border-b border-slate-100 pb-8 last:border-0 last:pb-0 last:mb-0">
                  <div className="aspect-square bg-slate-50 rounded-xl p-4 mb-4 flex items-center justify-center border border-slate-100 group-hover:border-emerald-200 transition-colors relative overflow-hidden">
                    <div className="text-slate-400 font-bold text-sm text-center">Product<br/>Image</div>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-1">Anker SOLIX C1000</h4>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed">Incredible compact size with high output. Perfect for apartments and renters.</p>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-xl text-center transition-colors shadow-sm flex justify-center items-center gap-2">
                    Check Price on Amazon
                  </a>
                </div>

              </div>

              {/* Sidebar AdSlot */}
              <div className="hidden lg:block">
                <AdSlot format="vertical" responsive="true" />
              </div>

            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}