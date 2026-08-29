"use client";

import Link from 'next/link';

// 1. Define the exact types for the incoming props
interface AffiliateCardProps {
  productName: string;
  imageSrc: string;
  description: string;
  amazonLink: string;
  pros: string[];
}

export default function AffiliateCard({ 
  productName, 
  imageSrc, 
  description, 
  amazonLink, 
  pros 
}: AffiliateCardProps) { // 2. Apply the interface to the component
  return (
    <div className="w-full max-w-3xl mx-auto my-10 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col md:flex-row transition-shadow hover:shadow-lg">
      
      {/* Product Image Section */}
      <div className="w-full md:w-2/5 bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
        <img 
          src={imageSrc} 
          alt={productName} 
          className="max-w-full h-auto object-contain mix-blend-multiply"
          // 3. Cast e.target as HTMLImageElement so TypeScript knows it has a 'src' property
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
        />
      </div>

      {/* Product Details Section */}
      <div className="w-full md:w-3/5 p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
            {productName}
          </h3>
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {description}
          </p>

          {pros && pros.length > 0 && (
            <ul className="mb-6 space-y-2">
              {/* 4. explicitly type 'pro' and 'index' */}
              {pros.map((pro: string, index: number) => (
                <li key={index} className="flex items-start text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {pro}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Compliant CTA */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-center">
          <a 
            href={amazonLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full justify-center px-6 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            Check Price on Amazon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}