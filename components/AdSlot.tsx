'use client';

import { useEffect, useRef } from 'react';

// Add the interface and use '?' to make adSlot optional
interface AdSlotProps {
  adSlot?: string;
  format?: string;
  responsive?: string;
}

export default function AdSlot({ adSlot, format = 'auto', responsive = 'true' }: AdSlotProps) {
  const adInitialized = useRef(false);
// ... rest of your component remains the same

  useEffect(() => {
    // 2. Only push the ad if it hasn't been initialized yet
    if (!adInitialized.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adInitialized.current = true; // Mark as initialized
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center overflow-hidden bg-slate-100 min-h-[100px] rounded-lg relative my-6">
      <span className="absolute top-2 left-2 text-[9px] text-slate-400 uppercase font-bold tracking-widest bg-slate-100 px-1 z-0">Advertisement</span>
      
      <ins
        className="adsbygoogle relative z-10 w-full"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5152146437122143" 
        data-ad-slot={adSlot || "5433226784"}    
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}