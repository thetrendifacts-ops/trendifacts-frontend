import Link from 'next/link';

export default function ProductCard({ 
  title, 
  badge = "Top Pick", 
  pros = [], 
  cons = [], 
  link = "#" 
}) {
  return (
    <div className="my-10 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg shadow-slate-100 font-sans not-prose">
      
      {/* Badge Header */}
      {badge && (
        <div className="bg-slate-900 px-6 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white font-bold uppercase tracking-widest text-xs">
            {badge}
          </span>
        </div>
      )}

      <div className="p-6 md:p-8">
        <h3 className="text-2xl font-black text-slate-900 mb-6 leading-tight">
          {title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pros */}
          {pros.length > 0 && (
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Pros
              </h4>
              <ul className="flex flex-col gap-2">
                {pros.map((pro, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span> {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {cons.length > 0 && (
            <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Cons
              </h4>
              <ul className="flex flex-col gap-2">
                {cons.map((con, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-red-400 font-bold mt-0.5">•</span> {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Affiliate Button */}
        <Link 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-slate-900 font-bold text-center py-4 rounded-xl transition-colors shadow-sm"
        >
          Check Price on Amazon
        </Link>
      </div>
    </div>
  );
}