import React from 'react';

interface QuickPickProps {
  title: string;
  reason: string;
  url: string;
  badgeText?: string;
}

export default function QuickPick({ 
  title, 
  reason, 
  url, 
  badgeText = "🏆 Top Overall Pick - Sept 2026" 
}: QuickPickProps) {
  return (
    <div className="my-8 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-500 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden block not-prose">
      {/* Top Left Badge */}
      <div className="absolute top-0 left-0 bg-amber-500 text-gray-950 font-black text-[10px] md:text-xs uppercase tracking-widest px-4 py-1.5 rounded-br-lg shadow-sm">
        {badgeText}
      </div>
      
      <div className="mt-4 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-serif font-bold text-gray-900 m-0 mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-gray-700 text-sm md:text-base m-0 leading-relaxed font-medium">
            {reason}
          </p>
        </div>
        
        <div className="w-full md:w-auto flex-shrink-0 mt-2 md:mt-0">
          <a 
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full md:w-auto text-center bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-lg py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 border-b-4 border-gray-700 no-underline whitespace-nowrap"
          >
            Check Price ↗
          </a>
          <span className="block text-center text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
            Amazon / Direct
          </span>
        </div>
      </div>
    </div>
  );
}