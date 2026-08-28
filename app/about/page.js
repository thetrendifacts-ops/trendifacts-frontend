import Link from 'next/link';

export const metadata = {
  title: 'Our Methodology & About Us | Trendifacts',
  description: 'How we independently test, review, and score portable power stations and tech gear.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      
      {/* 1. HERO SECTION */}
      <header className="bg-slate-900 pt-20 pb-32 px-4 border-b-4 border-emerald-500">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 block">
            About Trendifacts
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            We test the gear so you don't have to guess.
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Our mission is to cut through the marketing jargon and provide objective, math-backed runtime guides and reviews for power stations and tech essentials.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* 2. TRANSPARENCY CARD */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-4 border-b-2 border-slate-100 pb-4">
            Editorial Independence
          </h2>
          <div className="prose prose-lg prose-slate text-slate-600">
            <p>
              Trendifacts is entirely reader-supported. When you buy through links on our site, we may earn an affiliate commission from retailers like Amazon. 
            </p>
            <p>
              <strong>However, our reviews are strictly our own.</strong> Brands cannot pay for higher review scores, and we do not accept sponsored placements in our "Top Picks" categories. If a product fails our load tests or has a loud cooling fan, we will tell you.
            </p>
          </div>
        </div>

        {/* 3. THE METHODOLOGY GRID */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight text-center">
            Our Testing Methodology
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-World Load Testing</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We don't just read the spec sheets. We plug in actual refrigerators, medical devices, and space heaters to see how the inverters handle real-world startup surges and continuous draws.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Objective Runtime Math</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                A 1000Wh battery doesn't actually give you 1000Wh of usable power. We factor in the "efficiency tax" (usually 15-20% inverter loss) to give you accurate runtime expectations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Long-Term Viability</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We prioritize gear built with LiFePO4 (LFP) battery chemistry over older Lithium-ion tech, ensuring the products we recommend will last for a decade of daily use, not just a few years.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl mb-6 shadow-md">
                4
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Value-to-Cost Ratio</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The most expensive unit isn't always the best. We weigh the capacity, charge speeds, and port selection against the retail price to determine if a unit is actually worth your money.
              </p>
            </div>

          </div>
        </section>

        {/* 4. THE TEAM / CONTACT CTA */}
        <div className="bg-emerald-50 rounded-2xl p-8 md:p-12 border border-emerald-100 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Have questions about a specific setup?</h2>
          <p className="text-emerald-900 mb-8 max-w-lg mx-auto">
            Whether you are prepping for hurricane season or trying to size a system for an apartment balcony, we are happy to help you run the math.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-slate-900 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-md"
          >
            Get in Touch
          </Link>
        </div>

      </div>
    </main>
  );
}