import React from 'react';
import Image from 'next/image';

interface AmazonProductCardProps {
  title: string;
  badge?: string;
  image?: string; // <-- FIXED: TypeScript now knows to expect this
  amazonUrl: string;
}

export default function AmazonProductCard({ 
  title, 
  badge, 
  image, 
  amazonUrl 
}: AmazonProductCardProps) {
  return (
    <div className="my-8 flex flex-col md:flex-row items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow not-prose">
      {/* 1. New Image Block */}
      {image && (
        <div className="w-full md:w-48 h-48 relative flex-shrink-0 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4">
          <Image 
            src={image} 
            alt={title}
            fill
            className="object-contain mix-blend-multiply"
            sizes="(max-width: 768px) 100vw, 200px"
          />
        </div>
      )}
      
      {/* 2. Text and Button Block */}
      <div className="p-6 flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left w-full">
        {badge && (
          <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            {badge}
          </span>
        )}
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        
        <a 
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm shadow-sm"
        >
          Check Price on Amazon ↗
        </a>
      </div>
    </div>
  );
}